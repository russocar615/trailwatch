import type { AuditAction, AuditLog, UserRole } from '@/types'

export interface AuditContext {
  userId: string | null
  userEmail: string | null
  userRole: UserRole | null
  parkId: string | null
  ipAddress?: string | null
  userAgent?: string | null
}

export interface AuditEntry {
  action: AuditAction
  entityType: string
  entityId?: string | null
  previousValue?: Record<string, unknown> | null
  newValue?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
}

// In-memory buffer for offline tolerance — flushes to DB when connected
let auditBuffer: Array<Omit<AuditLog, 'id'>> = []

export async function writeAuditLog(
  entry: AuditEntry,
  context: AuditContext,
  supabase?: ReturnType<typeof import('@/lib/supabase/client').createClient>
): Promise<void> {
  const log: Omit<AuditLog, 'id'> = {
    timestamp: new Date().toISOString(),
    user_id: context.userId,
    user_email: context.userEmail,
    user_role: context.userRole,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    park_id: context.parkId,
    previous_value: entry.previousValue ?? null,
    new_value: entry.newValue ?? null,
    ip_address: context.ipAddress ?? null,
    user_agent: context.userAgent ?? null,
    metadata: entry.metadata ?? null,
  }

  // Always buffer first (offline tolerance)
  auditBuffer.push(log)

  if (!supabase) return

  // Attempt to flush buffer
  try {
    const toFlush = [...auditBuffer]
    auditBuffer = []
    const { error } = await supabase.from('audit_logs').insert(toFlush)
    if (error) {
      // Put them back if flush failed
      auditBuffer = [...toFlush, ...auditBuffer]
      console.error('[Audit] Flush failed, buffered:', error.message)
    }
  } catch (err) {
    console.error('[Audit] Network error, entries buffered')
  }
}

// Server-side audit writer (used in API routes)
export async function serverAudit(
  entry: AuditEntry,
  context: AuditContext
): Promise<void> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()

  const log = {
    timestamp: new Date().toISOString(),
    user_id: context.userId,
    user_email: context.userEmail,
    user_role: context.userRole,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    park_id: context.parkId,
    previous_value: entry.previousValue ?? null,
    new_value: entry.newValue ?? null,
    ip_address: context.ipAddress ?? null,
    user_agent: context.userAgent ?? null,
    metadata: entry.metadata ?? null,
  }

  // Fire and forget on server — don't block response
  supabase.from('audit_logs').insert(log).then(({ error }) => {
    if (error) console.error('[Audit] Server write failed:', error.message)
  })
}

// Helper for formatting audit logs for display
export function formatAuditAction(action: AuditAction): string {
  const map: Record<AuditAction, string> = {
    'trail.status_changed':   'Trail status changed',
    'trail.capacity_updated': 'Trail capacity updated',
    'parking.status_changed': 'Parking status changed',
    'incident.created':       'Incident reported',
    'incident.updated':       'Incident updated',
    'incident.resolved':      'Incident resolved',
    'user.login':             'User signed in',
    'user.logout':            'User signed out',
    'user.role_changed':      'User role changed',
    'park.settings_updated':  'Park settings updated',
    'sensor.data_received':   'Sensor data received',
    'system.health_check':    'System health check',
  }
  return map[action] ?? action
}
