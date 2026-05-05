import { NextRequest } from 'next/server'
import { apiSuccess, apiError, validateSensorKey, getClientIp } from '@/lib/api/helpers'
import { validate, SENSOR_READING_SCHEMA } from '@/lib/validation/schemas'
import { serverAudit } from '@/lib/audit/logger'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/v1/sensors/ingest
 *
 * Accepts IoT sensor readings from field hardware.
 * Authenticated via x-sensor-key header (SENSOR_API_KEY env var).
 *
 * Body:
 *   { sensor_id, reading_type, value, timestamp, metadata? }
 *
 * GIS-compatible: coordinates are stored in metadata for downstream
 * integration with ArcGIS / QGIS systems used by NSW NPWS and NPS.
 */
export async function POST(req: NextRequest) {
  // IoT devices use a shared API key, not user auth
  if (!validateSensorKey(req)) {
    return apiError('UNAUTHORIZED', 'Invalid sensor key', 401)
  }

  try {
    const body = await req.json()
    const { valid, errors } = validate(body, SENSOR_READING_SCHEMA)
    if (!valid) return apiError('VALIDATION_ERROR', 'Invalid sensor reading', 400, errors)

    const { sensor_id, reading_type, value, timestamp, metadata } = body

    const supabase = createClient()
    const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

    if (isRealSupabase) {
      // Look up what entity this sensor monitors
      const { data: sensor, error: sensorErr } = await supabase
        .from('sensors')
        .select('*, park_id, entity_id, entity_type')
        .eq('hardware_id', sensor_id)
        .single()

      if (sensorErr || !sensor) {
        return apiError('NOT_FOUND', `Sensor '${sensor_id}' not registered`, 404)
      }

      // Update sensor health + last reading
      await supabase.from('sensors').update({
        health: 'online',
        last_ping: timestamp,
        last_reading: { value, reading_type, ...metadata },
      }).eq('hardware_id', sensor_id)

      // Apply reading to the entity it monitors
      if (reading_type === 'occupancy' && sensor.entity_type === 'parking_lot') {
        const occupied = Math.round(value)
        const { data: lot } = await supabase
          .from('parking_lots').select('total_spaces').eq('id', sensor.entity_id).single()

        if (lot) {
          const pct = occupied / lot.total_spaces
          const status = occupied >= lot.total_spaces ? 'full' : pct > 0.8 ? 'busy' : 'open'
          await supabase.from('parking_lots').update({
            occupied_spaces: occupied,
            status,
            last_sensor_ping: timestamp,
            updated_at: new Date().toISOString(),
          }).eq('id', sensor.entity_id)
        }
      }

      if (reading_type === 'count' && sensor.entity_type === 'trail') {
        const hikers = Math.round(value)
        const { data: trail } = await supabase
          .from('trails').select('max_capacity').eq('id', sensor.entity_id).single()

        if (trail) {
          const pct = hikers / trail.max_capacity
          const crowd_level = hikers === 0 ? 'quiet' : pct > 0.8 ? 'very_busy' : pct > 0.5 ? 'busy' : 'moderate'
          await supabase.from('trails').update({
            current_hikers: hikers,
            crowd_level,
            updated_at: new Date().toISOString(),
          }).eq('id', sensor.entity_id)
        }
      }

      await serverAudit(
        {
          action: 'sensor.data_received',
          entityType: 'sensor',
          entityId: sensor.id,
          newValue: { sensor_id, reading_type, value },
          metadata,
        },
        { userId: null, userEmail: null, userRole: null, parkId: sensor.park_id, ipAddress: getClientIp(req) }
      )
    }

    return apiSuccess({ received: true, sensor_id, reading_type, processed_at: new Date().toISOString() })
  } catch (err) {
    console.error('[Sensor Ingest] Error:', err)
    return apiError('INTERNAL_ERROR', 'Failed to process sensor reading', 500)
  }
}
