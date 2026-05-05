import { NextRequest } from 'next/server'
import { apiSuccess, apiError, requireAuth, assertParkAccess, getClientIp } from '@/lib/api/helpers'
import { createClient } from '@/lib/supabase/server'
import { validate, INCIDENT_SCHEMA, sanitiseString } from '@/lib/validation/schemas'
import { serverAudit } from '@/lib/audit/logger'
import type { Incident, IncidentCategory, IncidentSeverity } from '@/types'

// Demo data for fallback
const DEMO_INCIDENTS: Incident[] = [
  {
    id: 'inc-001', park_id: 'p1', trail_id: 't1',
    reported_by: 'ranger-demo', reporter_name: 'Chief Ranger Morgan',
    category: 'trail_hazard', severity: 'medium', status: 'in_progress',
    title: 'Large fallen tree blocking Ancient Giants Loop at km 2.4',
    description: 'Storm damage has resulted in a 20m eucalyptus across the main track. Hikers are detouring off-trail which creates erosion risk.',
    location_description: 'Ancient Giants Loop, approximately 2.4km from trailhead',
    coordinates: null, assigned_to: null, resolved_at: null, resolution_notes: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'inc-002', park_id: 'p1', trail_id: null,
    reported_by: 'ranger-demo', reporter_name: 'Ranger Davies',
    category: 'medical', severity: 'high', status: 'resolved',
    title: 'Visitor ankle injury at Main Entrance Lot A',
    description: 'Female visitor (est. 60s) reported ankle injury after trip on uneven surface at lot entrance. First aid administered. Ambulance called and attended.',
    location_description: 'Main Entrance Lot A, near payment kiosk',
    coordinates: null, assigned_to: null,
    resolved_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    resolution_notes: 'Patient transported by ambulance. Surface hazard flagged for maintenance team.',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'inc-003', park_id: 'p1', trail_id: 't3',
    reported_by: 'ranger-demo', reporter_name: 'Ranger Chen',
    category: 'wildlife', severity: 'low', status: 'open',
    title: 'Lyrebird nesting observed near Ridge Summit trail junction',
    description: 'Active lyrebird nest observed 4m from trail edge at the summit junction. Recommend temporary trail signage to discourage disturbance during breeding season.',
    location_description: 'Ridge Summit Challenge, summit junction marker',
    coordinates: null, assigned_to: null, resolved_at: null, resolution_notes: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
]

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, 'incident:read')
  if ('status' in authResult) return authResult
  const { user } = authResult

  try {
    const { searchParams } = new URL(req.url)
    const parkId = searchParams.get('park_id')
    const status = searchParams.get('status')

    const supabase = createClient()
    const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

    if (isRealSupabase) {
      let query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (user.role !== 'super_admin' && user.park_id)
        query = query.eq('park_id', user.park_id)
      else if (parkId) query = query.eq('park_id', parkId)
      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) throw error
      return apiSuccess(data, { total: data.length })
    }

    // Demo fallback with filtering
    let incidents = [...DEMO_INCIDENTS]
    if (user.park_id) incidents = incidents.filter(i => i.park_id === user.park_id)
    else if (parkId) incidents = incidents.filter(i => i.park_id === parkId)
    if (status) incidents = incidents.filter(i => i.status === status)
    return apiSuccess(incidents, { total: incidents.length })
  } catch (err) {
    console.error('[API] /incidents GET error:', err)
    return apiError('INTERNAL_ERROR', 'Failed to fetch incidents', 500)
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, 'incident:create')
  if ('status' in authResult) return authResult
  const { user } = authResult

  try {
    const body = await req.json()

    const { valid, errors } = validate(body, INCIDENT_SCHEMA)
    if (!valid) return apiError('VALIDATION_ERROR', 'Invalid incident data', 400, errors)

    // Park access check
    if (!assertParkAccess(user, body.park_id))
      return apiError('FORBIDDEN', 'Access denied to this park', 403)

    const incident: Omit<Incident, 'id'> = {
      park_id: body.park_id,
      trail_id: body.trail_id ?? null,
      reported_by: user.id,
      reporter_name: user.full_name,
      category: body.category as IncidentCategory,
      severity: body.severity as IncidentSeverity,
      status: 'open',
      title: sanitiseString(body.title),
      description: sanitiseString(body.description),
      location_description: body.location_description ? sanitiseString(body.location_description) : null,
      coordinates: body.coordinates ?? null,
      assigned_to: null,
      resolved_at: null,
      resolution_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const supabase = createClient()
    const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

    if (isRealSupabase) {
      const { data, error } = await supabase.from('incidents').insert(incident).select().single()
      if (error) throw error

      await serverAudit(
        { action: 'incident.created', entityType: 'incident', entityId: data.id, newValue: incident },
        { userId: user.id, userEmail: user.email, userRole: user.role, parkId: body.park_id, ipAddress: getClientIp(req) }
      )

      return apiSuccess(data, undefined, 201)
    }

    // Demo mode — return with fake ID
    const demo = { id: `inc-${Date.now()}`, ...incident }
    return apiSuccess(demo, undefined, 201)
  } catch (err) {
    console.error('[API] /incidents POST error:', err)
    return apiError('INTERNAL_ERROR', 'Failed to create incident', 500)
  }
}
