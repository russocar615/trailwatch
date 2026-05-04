import { NextRequest } from 'next/server'
import { apiSuccess, apiError, requireAuth } from '@/lib/api/helpers'
import { createClient } from '@/lib/supabase/server'
import type { AuditLog } from '@/types'

// Demo audit log data
const DEMO_AUDIT: AuditLog[] = [
  { id: '1', timestamp: new Date(Date.now() - 300000).toISOString(),   user_id: 'u1', user_email: 'ranger@trailwatch.demo', user_role: 'ranger',      action: 'trail.status_changed',   entity_type: 'trail',   entity_id: 't5', park_id: 'p1', previous_value: { status: 'open' }, new_value: { status: 'closed' }, ip_address: '203.0.113.5',  user_agent: null, metadata: null },
  { id: '2', timestamp: new Date(Date.now() - 900000).toISOString(),   user_id: 'u1', user_email: 'ranger@trailwatch.demo', user_role: 'ranger',      action: 'incident.created',       entity_type: 'incident',entity_id: 'inc-001', park_id: 'p1', previous_value: null, new_value: { severity: 'medium', category: 'trail_hazard' }, ip_address: '203.0.113.5', user_agent: null, metadata: null },
  { id: '3', timestamp: new Date(Date.now() - 1800000).toISOString(),  user_id: 'u1', user_email: 'ranger@trailwatch.demo', user_role: 'ranger',      action: 'user.login',             entity_type: 'user',    entity_id: 'u1', park_id: 'p1', previous_value: null, new_value: null, ip_address: '203.0.113.5', user_agent: 'Mozilla/5.0', metadata: null },
  { id: '4', timestamp: new Date(Date.now() - 3600000).toISOString(),  user_id: 'u2', user_email: 'admin@royalnational.gov.au', user_role: 'park_admin', action: 'park.settings_updated', entity_type: 'park', entity_id: 'p1', park_id: 'p1', previous_value: { emergency_contact: '000' }, new_value: { emergency_contact: '1300 361 967' }, ip_address: '203.0.113.10', user_agent: null, metadata: null },
  { id: '5', timestamp: new Date(Date.now() - 7200000).toISOString(),  user_id: 'sys', user_email: null, user_role: null,              action: 'sensor.data_received',   entity_type: 'sensor',  entity_id: 'sensor-lot-a', park_id: 'p1', previous_value: null, new_value: { occupied: 87, total: 120 }, ip_address: '10.0.0.5', user_agent: null, metadata: { sensor_type: 'parking_magnetic' } },
  { id: '6', timestamp: new Date(Date.now() - 10800000).toISOString(), user_id: 'u2', user_email: 'admin@royalnational.gov.au', user_role: 'park_admin', action: 'incident.resolved',   entity_type: 'incident',entity_id: 'inc-002', park_id: 'p1', previous_value: { status: 'in_progress' }, new_value: { status: 'resolved', resolution_notes: 'Patient transported.' }, ip_address: '203.0.113.10', user_agent: null, metadata: null },
  { id: '7', timestamp: new Date(Date.now() - 86400000).toISOString(), user_id: 'u3', user_email: 'hiker@trailwatch.demo',  user_role: 'public',      action: 'user.login',             entity_type: 'user',    entity_id: 'u3', park_id: null, previous_value: null, new_value: null, ip_address: '192.0.2.1',   user_agent: 'Mozilla/5.0 (iPhone)', metadata: null },
]

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, 'audit:read')
  if ('status' in authResult) return authResult
  const { user } = authResult

  try {
    const { searchParams } = new URL(req.url)
    const parkId = searchParams.get('park_id')
    const action = searchParams.get('action')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

    const supabase = createClient()
    const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

    if (isRealSupabase) {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (user.role !== 'super_admin' && user.park_id)
        query = query.eq('park_id', user.park_id)
      else if (parkId) query = query.eq('park_id', parkId)

      if (action) query = query.eq('action', action)

      const { data, error } = await query
      if (error) throw error
      return apiSuccess(data, { total: data.length })
    }

    // Demo fallback
    let logs = [...DEMO_AUDIT]
    if (user.park_id) logs = logs.filter(l => l.park_id === user.park_id || l.park_id === null)
    if (action) logs = logs.filter(l => l.action === action)
    return apiSuccess(logs.slice(0, limit), { total: logs.length })
  } catch (err) {
    console.error('[API] /audit GET error:', err)
    return apiError('INTERNAL_ERROR', 'Failed to fetch audit logs', 500)
  }
}
