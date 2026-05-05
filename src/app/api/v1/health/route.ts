import { NextRequest } from 'next/server'
import { apiSuccess, requireAuth } from '@/lib/api/helpers'
import { createClient } from '@/lib/supabase/server'
import type { SystemHealth } from '@/types'

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, 'system:health')
  if ('status' in authResult) return authResult

  const start = Date.now()

  let dbStatus: SystemHealth['database'] = 'down'
  let sensorsOnline = 0
  let sensorsTotal = 0
  let activeIncidents = 0

  const supabase = createClient()
  const isRealSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

  if (isRealSupabase) {
    try {
      // Lightweight ping — select 1 row from a small table
      const { error } = await supabase.from('parks').select('id').limit(1)
      dbStatus = error ? 'degraded' : 'healthy'

      const { count: incidentCount } = await supabase
        .from('incidents')
        .select('id', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress'])
      activeIncidents = incidentCount ?? 0

      const { data: sensors } = await supabase.from('sensors').select('health')
      sensorsTotal = sensors?.length ?? 0
      sensorsOnline = sensors?.filter(s => s.health === 'online').length ?? 0
    } catch {
      dbStatus = 'down'
    }
  } else {
    // Demo mode health
    dbStatus = 'healthy'
    sensorsOnline = 18
    sensorsTotal = 22
    activeIncidents = 2
  }

  const latencyMs = Date.now() - start

  const health: SystemHealth = {
    timestamp: new Date().toISOString(),
    database: dbStatus,
    api: latencyMs < 2000 ? 'healthy' : 'degraded',
    sensors_online: sensorsOnline,
    sensors_total: sensorsTotal,
    last_audit_flush: new Date().toISOString(),
    active_incidents: activeIncidents,
    parks_monitored: 3,
  }

  return apiSuccess({
    ...health,
    latency_ms: latencyMs,
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.2.0-pilot',
    uptime_note: 'TrailWatch Pilot System',
  })
}
