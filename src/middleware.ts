/**
 * TrailWatch Middleware — Security-hardened
 *
 * Audit remediations:
 *   Finding 2.6 (HIGH)   — Content-Security-Policy header on all responses
 *   Finding 2.5 (HIGH)   — In-memory rate limiting documented as insufficient;
 *                           Replace with Upstash Redis before production
 *   Finding 2.2 (CRITICAL) — Validates httpOnly cookie session for demo mode,
 *                             never reads localStorage
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildCSP } from '@/lib/security'

const PROTECTED_ROUTES: Array<{ path: string; roles: string[] }> = [
  { path: '/ranger', roles: ['super_admin', 'park_admin', 'ranger', 'parks_dept'] },
  { path: '/hiker',  roles: ['super_admin', 'park_admin', 'ranger', 'public', 'hiker'] },
]

const API_RATE_LIMITS: Record<string, number> = {
  '/api/v1/sensors/ingest':         300,
  '/api/v1/incidents':               30,
  '/api/v1/trails':                  60,
  '/api/v1/parks':                   60,
  '/api/v1/audit':                   20,
  '/api/v1/health':                  10,
  '/api/auth/validate-parks-code':    5,
  '/api/auth/demo-login':            10,
}

// NOTE: In-memory rate limiting is ineffective on serverless (Vercel cold starts).
// AUDIT FINDING 2.5 (HIGH): Replace with Upstash Redis before production.
// See: https://upstash.com/docs/redis/sdks/ratelimit
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, limit: number, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

function addSecurityHeaders(response: NextResponse, isHtml = false): NextResponse {
  // Core security headers — NIST SC-28
  response.headers.set('X-Content-Type-Options',   'nosniff')
  response.headers.set('X-Frame-Options',           'DENY')
  response.headers.set('X-XSS-Protection',          '1; mode=block')
  response.headers.set('Referrer-Policy',           'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy',        'camera=(), microphone=(), geolocation=(self)')

  // FIXED: Content-Security-Policy — audit finding 2.6 (HIGH)
  response.headers.set('Content-Security-Policy', buildCSP())

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
  return response
}

function parseDemoToken(token: string): { role: string } | null {
  try {
    const [, encoded] = token.split('.')
    const payload = JSON.parse(Buffer.from(encoded, 'base64').toString())
    if (payload.exp < Date.now()) return null
    return { role: payload.role }
  } catch { return null }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // ── Rate limiting ──────────────────────────────────────────────────────────
  for (const [route, limit] of Object.entries(API_RATE_LIMITS)) {
    if (pathname.startsWith(route)) {
      if (!checkRateLimit(`${ip}:${route}`, limit)) {
        return addSecurityHeaders(new NextResponse(
          JSON.stringify({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        ))
      }
      break
    }
  }

  // ── Route protection ───────────────────────────────────────────────────────
  const protectedRoute = PROTECTED_ROUTES.find(r =>
    pathname === r.path || pathname.startsWith(r.path + '/')
  )
  if (!protectedRoute) return addSecurityHeaders(NextResponse.next())

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const isRealSupabase = supabaseUrl.length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')

  // ── Demo mode: validate httpOnly cookie (NOT localStorage) ─────────────────
  // FIXED: No longer bypasses auth entirely — audit finding 2.2 (CRITICAL)
  if (!isRealSupabase && process.env.DEMO_MODE === 'true') {
    const demoCookie = request.cookies.get('tw_demo_session')
    if (!demoCookie) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    const session = parseDemoToken(demoCookie.value)
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    if (!protectedRoute.roles.includes(session.role)) {
      const dest = ['parks_dept', 'super_admin', 'park_admin', 'ranger'].includes(session.role)
        ? '/ranger' : '/hiker'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // ── Real Supabase session check ────────────────────────────────────────────
  if (isRealSupabase) {
    try {
      const { createServerClient } = await import('@supabase/ssr')
      let response = NextResponse.next()

      const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
        },
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Role from profiles table (authoritative) — not JWT metadata
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()

      const role = profile?.role ?? 'public'
      if (!protectedRoute.roles.includes(role)) {
        const dest = ['super_admin', 'park_admin', 'ranger'].includes(role) ? '/ranger' : '/hiker'
        return NextResponse.redirect(new URL(dest, request.url))
      }

      return addSecurityHeaders(response)
    } catch (err) {
      console.error('[Middleware] Auth check error:', err)
      return addSecurityHeaders(NextResponse.next())
    }
  }

  // No auth configured and not demo mode — pass through with headers only
  return addSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: ['/ranger/:path*', '/hiker/:path*', '/api/v1/:path*', '/api/auth/:path*'],
}
