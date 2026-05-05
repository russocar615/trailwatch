// Lightweight validation without zod — keeps bundle small for gov deployment
// Returns { valid: boolean, errors: string[] }

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validate(value: unknown, schema: Schema): ValidationResult {
  const errors: string[] = []
  validateNode(value, schema, '', errors)
  return { valid: errors.length === 0, errors }
}

type Schema =
  | { type: 'string'; required?: boolean; minLength?: number; maxLength?: number; enum?: string[]; pattern?: RegExp }
  | { type: 'number'; required?: boolean; min?: number; max?: number; integer?: boolean }
  | { type: 'boolean'; required?: boolean }
  | { type: 'object'; required?: boolean; properties: Record<string, Schema>; requiredKeys?: string[] }
  | { type: 'array'; required?: boolean; items?: Schema; minItems?: number; maxItems?: number }

function validateNode(value: unknown, schema: Schema, path: string, errors: string[]): void {
  const label = path || 'value'

  if (value === undefined || value === null) {
    if (schema.required) errors.push(`${label} is required`)
    return
  }

  switch (schema.type) {
    case 'string': {
      if (typeof value !== 'string') { errors.push(`${label} must be a string`); return }
      if (schema.minLength !== undefined && value.length < schema.minLength)
        errors.push(`${label} must be at least ${schema.minLength} characters`)
      if (schema.maxLength !== undefined && value.length > schema.maxLength)
        errors.push(`${label} must be at most ${schema.maxLength} characters`)
      if (schema.enum && !schema.enum.includes(value))
        errors.push(`${label} must be one of: ${schema.enum.join(', ')}`)
      if (schema.pattern && !schema.pattern.test(value))
        errors.push(`${label} has invalid format`)
      break
    }
    case 'number': {
      if (typeof value !== 'number' || isNaN(value)) { errors.push(`${label} must be a number`); return }
      if (schema.integer && !Number.isInteger(value)) errors.push(`${label} must be an integer`)
      if (schema.min !== undefined && value < schema.min) errors.push(`${label} must be ≥ ${schema.min}`)
      if (schema.max !== undefined && value > schema.max) errors.push(`${label} must be ≤ ${schema.max}`)
      break
    }
    case 'boolean': {
      if (typeof value !== 'boolean') errors.push(`${label} must be a boolean`)
      break
    }
    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value)) { errors.push(`${label} must be an object`); return }
      const obj = value as Record<string, unknown>
      if (schema.requiredKeys) {
        for (const key of schema.requiredKeys) {
          if (!(key in obj)) errors.push(`${label}.${key} is required`)
        }
      }
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        validateNode(obj[key], propSchema, `${label}.${key}`, errors)
      }
      break
    }
    case 'array': {
      if (!Array.isArray(value)) { errors.push(`${label} must be an array`); return }
      if (schema.minItems !== undefined && value.length < schema.minItems)
        errors.push(`${label} must have at least ${schema.minItems} items`)
      if (schema.maxItems !== undefined && value.length > schema.maxItems)
        errors.push(`${label} must have at most ${schema.maxItems} items`)
      if (schema.items) {
        value.forEach((item, i) => validateNode(item, schema.items!, `${label}[${i}]`, errors))
      }
      break
    }
  }
}

// ── Reusable schemas ──────────────────────────────────────────────────────────

export const INCIDENT_SCHEMA = {
  type: 'object' as const,
  requiredKeys: ['park_id', 'category', 'severity', 'title', 'description'],
  properties: {
    park_id:              { type: 'string' as const, required: true, minLength: 1, maxLength: 50 },
    trail_id:             { type: 'string' as const, maxLength: 50 },
    category:             { type: 'string' as const, required: true, enum: ['medical','search_rescue','trail_hazard','wildlife','fire','flooding','infrastructure','visitor_behaviour','other'] },
    severity:             { type: 'string' as const, required: true, enum: ['low','medium','high','critical'] },
    title:                { type: 'string' as const, required: true, minLength: 5, maxLength: 120 },
    description:          { type: 'string' as const, required: true, minLength: 10, maxLength: 2000 },
    location_description: { type: 'string' as const, maxLength: 300 },
  },
}

export const TRAIL_STATUS_SCHEMA = {
  type: 'object' as const,
  requiredKeys: ['status'],
  properties: {
    status:          { type: 'string' as const, required: true, enum: ['open','closed','hazard','maintenance'] },
    current_hikers:  { type: 'number' as const, min: 0, max: 9999, integer: true },
    max_capacity:    { type: 'number' as const, min: 1, max: 9999, integer: true },
    crowd_level:     { type: 'string' as const, enum: ['quiet','moderate','busy','very_busy'] },
  },
}

export const PARKING_STATUS_SCHEMA = {
  type: 'object' as const,
  requiredKeys: ['occupied_spaces'],
  properties: {
    occupied_spaces: { type: 'number' as const, required: true, min: 0, max: 9999, integer: true },
    status:          { type: 'string' as const, enum: ['open','busy','full','closed','unknown'] },
  },
}

export const SENSOR_READING_SCHEMA = {
  type: 'object' as const,
  requiredKeys: ['sensor_id', 'reading_type', 'value', 'timestamp'],
  properties: {
    sensor_id:    { type: 'string' as const, required: true, minLength: 1, maxLength: 100 },
    reading_type: { type: 'string' as const, required: true, enum: ['occupancy','count','weather','heartbeat'] },
    value:        { type: 'number' as const, required: true },
    timestamp:    { type: 'string' as const, required: true },
    metadata:     { type: 'object' as const, properties: {} },
  },
}

// Sanitise string to prevent XSS stored in DB
export function sanitiseString(s: string): string {
  return s
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim()
}
