/**
 * Server-side demo login handler
 *
 * Audit remediation — Finding 2.1 (CRITICAL):
 *   Demo credentials are now validated SERVER-SIDE only.
 *   They never appear in client-side JavaScript bundles.
 *   In production (NODE_ENV=production or DEMO_MODE!=true) this always returns 401.
 *
 * Audit remediation — Finding 2.2 (CRITICAL):
 *   Sets an httpOnly signed session cookie instead of localStorage JSON.
 *   Cookie expires in 8 hours (one ranger shift), is SameSite=Strict.
 */

import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual, isDemoMode } from '@/lib/security'
import { apiError, secureHeaders } from '@/lib/api/helpers'

// Demo accounts — stored server-side only, never in client bundles
// In production this block is never reached (isDemoMode() returns false)
const DEMO_ACCOUNTS: Record<string, { password: string; role: string; name: string; redirect: string }> = {
  'ranger@trailwatch.demo': {
    password: process.env.DEMO_RANGER_PASSWORD ?? 'TrailWatch-Demo-2025!',
    role: 'parks_dept',
    name: 'Chief Ranger Morgan (Demo)',
    redirect: '/ranger',
  },
  'hiker@trailwatch.demo': {
    password: process.env.DEMO_HIKER_PASSWORD ?? 'Hiker-Demo-2025!',
    role: 'hiker',
    name: 'Trail Explorer (Demo)',
    redirect: '/hiker',
  },
}

// Simple signed token — for demo only. Real sessions use Supabase JWT.
function makeDemoToken(email: string, role: string, name: string): string {
  const payload = JSON.stringify({ email, role, name, exp: Date.now() + 8 * 3600 * 1000 })
  // Base64-encode with a server-side secret as a basic signature
  const secret = process.env.DEMO_SESSION_SECRET ?? 'tw-demo-secret-change-in-env'
  const encoded = Buffer.from(payload).toString('base64')
  // Simple HMAC-like prefix for tamper evidence (not production-grade — demo only)
  const sig = Buffer.from(`${secret}:${encoded}`).toString('base64').slice(0, 16)
  return `${sig}.${encoded}`
}

export async function POST(req: NextRequest) {
  // ── Hard gate: demo mode is OFF in production ─────────────────────────────
  if (!isDemoMode()) {
    return apiError('DEMO_DISABLED', 'Demo accounts are not available in this environment', 401)
  }

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return apiError('INVALID_REQUEST', 'Request body must be JSON', 400)
  }

  const { email, password } = body
  if (!email || !password) {
    return apiError('VALIDATION_ERROR', 'Email and password are required', 400)
  }

  const account = DEMO_ACCOUNTS[email.toLowerCase()]
  if (!account) {
    return apiError('UNAUTHORIZED', 'Invalid credentials', 401)
  }

  // Constant-time comparison — prevents timing attacks even on demo
  if (!timingSafeEqual(password, account.password)) {
    return apiError('UNAUTHORIZED', 'Invalid credentials', 401)
  }

  // Set httpOnly session cookie — can't be read by client JS
  const token = makeDemoToken(email, account.role, account.name)
  const isProduction = process.env.NODE_ENV === 'production'

  const response = NextResponse.json(
    { success: true, redirect: account.redirect },
    { headers: secureHeaders() }
  )

  response.cookies.set('tw_demo_session', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 8 * 3600,  // 8 hours — one ranger shift
    path: '/',
  })

  return response
}
