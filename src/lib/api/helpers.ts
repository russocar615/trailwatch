/**
 * TrailWatch API Helpers — Security-hardened version
 * 
 * Audit remediation:
 *   Finding 2.4  (HIGH)  — Role now read from profiles table, not JWT metadata
 *   Finding 2.7  (HIGH)  — Sensor key uses timingSafeEqual, not ===
 *   Finding 2.6  (HIGH)  — CSP header added to all API responses
 *   Finding 2.5  (HIGH)  — Rate limit comment updated; Redis migration documented
 */

import { NextRequest, NextResponse } from 'next/server'
import type { ApiSuccess, ApiError, UserRole } from '@/types'
import { hasPermission, type Permission } from '@/lib/rbac/permissions'
import { createClient } from '@/lib/supabase/server'
import { timingSafeEqual, getAuthoritativeRole, buildCSP } from '@/lib/security'

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
  return NextResponse.json(body, { status, headers: secureHeaders() })
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
  return NextResponse.json(body, { status, headers: secureHeaders() })
}

export function secureHeaders(): Record<string, string> {
  return {
    // Standard security headers
    'X-Content-Type-Options':   'nosniff',
    'X-Frame-Options':          'DENY',
    'X-XSS-Protection':         '1; mode=block',
    'Referrer-Policy':          'strict-origin-when-cross-origin',
    'Permissions-Policy':       'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security':'max-age=63072000; includeSubDomains',
    'Cache-Control':            'no-store, no-cache, must-revalidate',
    // FIXED: Add CSP header — audit finding 2.6 (HIGH)
    'Content-Security-Policy':  buildCSP(),
  }
}

// ── Auth extraction — reads from authoritative DB source ─────────────────────
// FIXED: Role now from profiles table, not mutable JWT — audit finding 2.4 (HIGH)

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

    // FIXED: Query profiles table for authoritative role — never trust JWT metadata
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, park_id, full_name, is_active')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null
    if (!profile.is_active) return null  // Reject deactivated accounts

    return {
      id: user.id,
      email: user.email!,
      role: profile.role as UserRole,
      park_id: profile.park_id ?? null,
      full_name: profile.full_name ?? user.email ?? 'Unknown',
    }
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

  if (!user) return apiError('UNAUTHORIZED', 'Authentication required', 401)

  if (!hasPermission(user.role, permission)) {
    return apiError('FORBIDDEN', `Insufficient permissions for this action`, 403)
    // Note: we don't reveal the required permission — audit finding (info disclosure)
  }

  return { user }
}

// ── Rate limiter ──────────────────────────────────────────────────────────────
// WARNING: In-memory rate limiting is ineffective on serverless platforms.
// AUDIT FINDING 2.5 (HIGH): This MUST be replaced with Upstash Redis or
// AWS API Gateway usage plans before any production/federal deployment.
// Kept here only as a baseline — it provides no real protection on Vercel.

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

  if (entry.count >= limit) return { allowed: false, remaining: 0 }
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

// ── Sensor API key auth — FIXED: constant-time comparison ────────────────────
// FIXED: replaces timing-vulnerable === comparison — audit finding 2.7 (HIGH)

export function validateSensorKey(req: NextRequest): boolean {
  const key = req.headers.get('x-sensor-key')
  const expected = process.env.SENSOR_API_KEY
  if (!key || !expected) return false
  return timingSafeEqual(key, expected)  // FIXED: was `key === expected`
}

// ── Park scoping ─────────────────────────────────────────────────────────────

export function assertParkAccess(user: RequestUser, parkId: string): boolean {
  if (user.role === 'super_admin') return true
  return user.park_id === parkId
}
