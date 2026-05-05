/**
 * POST /api/auth/validate-parks-code
 *
 * Audit remediation — Finding 2.1 (CRITICAL):
 *   The parks signup code is now a SERVER-ONLY env var (no NEXT_PUBLIC_ prefix).
 *   It is validated here and never included in the client JS bundle.
 *   Uses constant-time comparison to prevent timing attacks.
 */

import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from '@/lib/security'
import { apiError, apiSuccess, getClientIp } from '@/lib/api/helpers'

// Rate limit: max 5 attempts per IP per 15 minutes (brute-force protection)
const attempts = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const now = Date.now()

  // Brute-force protection
  const entry = attempts.get(ip)
  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) {
      return apiError('RATE_LIMITED', 'Too many attempts. Please wait 15 minutes.', 429)
    }
    entry.count++
  } else {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
  }

  let body: { code?: string }
  try { body = await req.json() } catch {
    return apiError('INVALID_REQUEST', 'Request body must be JSON', 400)
  }

  const expected = process.env.PARKS_SIGNUP_CODE  // SERVER-ONLY — no NEXT_PUBLIC_ prefix
  if (!expected) {
    console.error('[Auth] PARKS_SIGNUP_CODE env var not configured')
    return apiError('SERVER_ERROR', 'Parks signup is not configured on this server', 500)
  }

  const provided = body.code ?? ''
  if (!timingSafeEqual(provided, expected)) {
    return apiError('INVALID_CODE', 'Invalid authorization code', 401)
  }

  // Clear attempt counter on success
  attempts.delete(ip)
  return apiSuccess({ valid: true })
}
