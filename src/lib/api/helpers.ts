import { NextRequest, NextResponse } from 'next/server'
import type { ApiSuccess, ApiError, UserRole } from '@/types'
import { hasPermission, type Permission } from '@/lib/rbac/permissions'
import { createClient } from '@/lib/supabase/server'

// ── Response helpers ──────────────────────────────────────────────────────────

export function apiSuccess<T>(data: T, meta?: ApiSuccess<T>['meta'], status = 200): NextResponse {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      ...meta,
    },
  }
  return NextResponse.json(body, {
    status,
    headers: secureHeaders(),
  })
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse {
  const body: ApiError = {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
    meta: {
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
    },
  }
  return NextResponse.json(body, {
    status,
    headers: secureHeaders(),
  })
}

export function secureHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options':            'nosniff',
    'X-Frame-Options':                   'DENY',
    'X-XSS-Protection':                  '1; mode=block',
    'Referrer-Policy':                   'strict-origin-when-cross-origin',
    'Permissions-Policy':                'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security':         'max-age=63072000; includeSubDomains',
    'Cache-Control':                     'no-store, no-cache, must-revalidate',
  }
}

// ── Auth extraction ───────────────────────────────────────────────────────────

export interface RequestUser {
  id: string
  email: string
  role: UserRole
  park_id: string | null
  full_name: string
}

export async function getRequestUser(req: NextRequest): Promise<RequestUser | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const role = (user.user_metadata?.role ?? 'public') as UserRole
    const park_id = user.user_metadata?.park_id ?? null
    const full_name = user.user_metadata?.full_name ?? user.email ?? 'Unknown'

    return { id: user.id, email: user.email!, role, park_id, full_name }
  } catch {
    return null
  }
}

// ── Permission guard for API routes ──────────────────────────────────────────

export async function requireAuth(
  req: NextRequest,
  permission: Permission
): Promise<{ user: RequestUser } | NextResponse> {
  const user = await getRequestUser(req)

  if (!user) {
    return apiError('UNAUTHORIZED', 'Authentication required', 401)
  }

  if (!hasPermission(user.role, permission)) {
    return apiError('FORBIDDEN', `Role '${user.role}' cannot perform this action`, 403)
  }

  return { user }
}

// ── Simple in-memory rate limiter (suitable for pilot) ───────────────────────
// For production, replace with Upstash Redis

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count }
}

// ── IP extraction ─────────────────────────────────────────────────────────────

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── Sensor API key auth (for IoT ingestion endpoint) ─────────────────────────

export function validateSensorKey(req: NextRequest): boolean {
  const key = req.headers.get('x-sensor-key')
  const expected = process.env.SENSOR_API_KEY
  if (!expected) return false
  return key === expected
}

// ── Park scoping — rangers can only see their own park ────────────────────────

export function assertParkAccess(user: RequestUser, parkId: string): boolean {
  if (user.role === 'super_admin') return true
  return user.park_id === parkId
}
