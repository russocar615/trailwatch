// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'park_admin' | 'ranger' | 'public'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  park_id: string | null      // null = access to all parks (super_admin)
  badge_number: string | null // rangers/admins only
  agency: string | null       // e.g. "NSW NPWS", "NPS Olympic"
  created_at: string
  last_active: string | null
}

// ─── Parks ────────────────────────────────────────────────────────────────────
export interface Park {
  id: string
  name: string
  agency: string              // "NSW National Parks" | "US National Park Service"
  country: 'AU' | 'US'
  state_region: string
  description: string
  image_url: string | null
  timezone: string            // "Australia/Sydney" | "America/Los_Angeles"
  coordinates: { lat: number; lng: number } | null
  total_area_ha: number | null
  established_year: number | null
  emergency_contact: string | null
  is_active: boolean
  created_at: string
}

// ─── Parking ──────────────────────────────────────────────────────────────────
export type ParkingStatus = 'open' | 'busy' | 'full' | 'closed' | 'unknown'

export interface ParkingLot {
  id: string
  park_id: string
  name: string
  total_spaces: number
  occupied_spaces: number
  status: ParkingStatus
  sensor_id: string | null    // link to physical sensor
  last_sensor_ping: string | null
  coordinates: { lat: number; lng: number } | null
  notes: string | null
  is_active: boolean
  updated_at: string
}

// ─── Trails ───────────────────────────────────────────────────────────────────
export type TrailStatus = 'open' | 'closed' | 'hazard' | 'maintenance'
export type CrowdLevel = 'quiet' | 'moderate' | 'busy' | 'very_busy'
export type Difficulty = 'Easy' | 'Moderate' | 'Hard' | 'Expert'

export interface Trail {
  id: string
  park_id: string
  name: string
  difficulty: Difficulty
  length_km: number
  elevation_gain_m: number
  estimated_hours: number
  status: TrailStatus
  current_hikers: number
  max_capacity: number
  crowd_level: CrowdLevel
  description: string
  features: string[]
  surface_type: string | null
  is_accessible: boolean      // ADA/DDA accessible
  coordinates_start: { lat: number; lng: number } | null
  gpx_url: string | null
  updated_at: string
  updated_by: string | null   // user id
}

// ─── Incidents ────────────────────────────────────────────────────────────────
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type IncidentCategory =
  | 'medical'
  | 'search_rescue'
  | 'trail_hazard'
  | 'wildlife'
  | 'fire'
  | 'flooding'
  | 'infrastructure'
  | 'visitor_behaviour'
  | 'other'

export interface Incident {
  id: string
  park_id: string
  trail_id: string | null
  reported_by: string         // user id
  reporter_name: string
  category: IncidentCategory
  severity: IncidentSeverity
  status: IncidentStatus
  title: string
  description: string
  location_description: string | null
  coordinates: { lat: number; lng: number } | null
  assigned_to: string | null  // user id
  resolved_at: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export type AuditAction =
  | 'trail.status_changed'
  | 'trail.capacity_updated'
  | 'parking.status_changed'
  | 'incident.created'
  | 'incident.updated'
  | 'incident.resolved'
  | 'user.login'
  | 'user.logout'
  | 'user.role_changed'
  | 'park.settings_updated'
  | 'sensor.data_received'
  | 'system.health_check'

export interface AuditLog {
  id: string
  timestamp: string
  user_id: string | null
  user_email: string | null
  user_role: UserRole | null
  action: AuditAction
  entity_type: string         // 'trail' | 'parking_lot' | 'incident' | 'user'
  entity_id: string | null
  park_id: string | null
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
}

// ─── Sensors ──────────────────────────────────────────────────────────────────
export type SensorType = 'parking_magnetic' | 'trail_ir_counter' | 'trail_thermal' | 'weather'
export type SensorHealth = 'online' | 'degraded' | 'offline' | 'unknown'

export interface Sensor {
  id: string
  park_id: string
  entity_id: string           // parking_lot.id or trail.id it monitors
  entity_type: 'parking_lot' | 'trail'
  type: SensorType
  hardware_id: string         // physical device identifier
  firmware_version: string | null
  health: SensorHealth
  battery_pct: number | null
  last_ping: string | null
  last_reading: Record<string, unknown> | null
  installed_at: string | null
  coordinates: { lat: number; lng: number } | null
}

// ─── System Health ────────────────────────────────────────────────────────────
export interface SystemHealth {
  timestamp: string
  database: 'healthy' | 'degraded' | 'down'
  api: 'healthy' | 'degraded' | 'down'
  sensors_online: number
  sensors_total: number
  last_audit_flush: string | null
  active_incidents: number
  parks_monitored: number
}

// ─── API Response wrappers ────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: {
    total?: number
    page?: number
    per_page?: number
    request_id?: string
    timestamp?: string
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    request_id?: string
    timestamp?: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
