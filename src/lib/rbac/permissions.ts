import type { UserRole } from '@/types'

// ─── Permission definitions ───────────────────────────────────────────────────
export const PERMISSIONS = {
  // Trails
  'trail:read':             ['super_admin', 'park_admin', 'ranger', 'public'],
  'trail:update_status':    ['super_admin', 'park_admin', 'ranger'],
  'trail:update_capacity':  ['super_admin', 'park_admin', 'ranger'],
  'trail:create':           ['super_admin', 'park_admin'],
  'trail:delete':           ['super_admin'],

  // Parking
  'parking:read':           ['super_admin', 'park_admin', 'ranger', 'public'],
  'parking:update_status':  ['super_admin', 'park_admin', 'ranger'],
  'parking:create':         ['super_admin', 'park_admin'],

  // Incidents
  'incident:read':          ['super_admin', 'park_admin', 'ranger'],
  'incident:create':        ['super_admin', 'park_admin', 'ranger'],
  'incident:update':        ['super_admin', 'park_admin', 'ranger'],
  'incident:resolve':       ['super_admin', 'park_admin', 'ranger'],
  'incident:delete':        ['super_admin'],

  // Audit
  'audit:read':             ['super_admin', 'park_admin'],
  'audit:export':           ['super_admin'],

  // Users
  'user:read':              ['super_admin', 'park_admin'],
  'user:create':            ['super_admin'],
  'user:update_role':       ['super_admin'],
  'user:deactivate':        ['super_admin'],

  // Parks
  'park:read':              ['super_admin', 'park_admin', 'ranger', 'public'],
  'park:update':            ['super_admin', 'park_admin'],
  'park:create':            ['super_admin'],

  // Sensors
  'sensor:read':            ['super_admin', 'park_admin', 'ranger'],
  'sensor:write':           ['super_admin'],

  // System
  'system:health':          ['super_admin', 'park_admin'],
  'system:admin':           ['super_admin'],
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission] as readonly string[]
  return allowed.includes(role)
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Role '${role}' does not have permission '${permission}'`)
  }
}

// Role hierarchy for display
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'System Administrator',
  park_admin:  'Park Administrator',
  ranger:      'Park Ranger',
  public:      'Public Visitor',
}

export const ROLE_BADGE: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
  park_admin:  'bg-blue-100 text-blue-800 border-blue-200',
  ranger:      'bg-hunter-100 text-hunter-800 border-hunter-200',
  public:      'bg-creme-200 text-hunter-700 border-creme-300',
}

// Which roles get the ranger/operations dashboard
export const STAFF_ROLES: UserRole[] = ['super_admin', 'park_admin', 'ranger']
export function isStaff(role: UserRole): boolean {
  return STAFF_ROLES.includes(role)
}
