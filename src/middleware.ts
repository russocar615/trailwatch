import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication (with minimum role)
const PROTECTED_ROUTES: Array<{ path: string; roles: string[] }> = [
  { path: '/ranger', roles: ['super_admin', 'park_admin', 'ranger'] },
  { path: '/hiker',  roles: ['super_admin', 'park_admin', 'ranger', 'public'] },
]

// API routes that are rate-limited (requests per minute)
const API_RATE_LIMITS: Record<string, number> = {
  '/api/v1/sensors/ingest': 300,
  '/api/v1/incidents':       30,
  '/api/v1/trails':          60,
  '/api/v1/parks':           60,
  '/api/v1/audit':           20,
  '/api/v1/health':          10,
}

// In-memory rate limit store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, limit: number, windowMs = 60000): boolean {
  const now   = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options',  'nosniff')
  response.headers.set('X-Frame-Options',          'DENY')
  response.headers.set('X-XSS-Protection',         '1; mode=block')
  response.headers.set('Referrer-Policy',          'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy',       'camera=(), microphone=(), geolocation=(self)')
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // ── Rate limiting for API routes ───────────────────────────────────────────
  for (const [route, limit] of Object.entries(API_RATE_LIMITS)) {
    if (pathname.startsWith(route)) {
      const key = `${ip}:${route}`
      if (!checkRateLimit(key, limit)) {
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

  // Not a protected route — pass through with security headers
  if (!protectedRoute) {
    return addSecurityHeaders(NextResponse.next())
  }

  // ── Check if real Supabase is configured ───────────────────────────────────
  // When running in demo mode (placeholder Supabase URL), skip server-side
  // auth entirely — the client-side useDemoAuth() hook handles redirects.
  // This prevents middleware from crashing on placeholder credentials and
  // causing Vercel to return a 404/500 for /hiker and /ranger.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const isRealSupabase = supabaseUrl.length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')

  if (!isRealSupabase) {
    // Demo mode — let the page render; client handles auth redirect
    return addSecurityHeaders(NextResponse.next())
  }

  // ── Real Supabase auth check ───────────────────────────────────────────────
  // Import dynamically so a missing/invalid Supabase config never crashes
  // the middleware module itself during cold start on Vercel.
  try {
    const { createServerClient } = await import('@supabase/ssr')

    let response = NextResponse.next()

    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      {
        cookies: {
          getAll:  () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = (user.user_metadata?.role ?? 'public') as string
    if (!protectedRoute.roles.includes(role)) {
      // Wrong role — redirect to correct dashboard
      const dest = ['super_admin', 'park_admin', 'ranger'].includes(role)
        ? '/ranger'
        : '/hiker'
      return NextResponse.redirect(new URL(dest, request.url))
    }

    return addSecurityHeaders(response)
  } catch (err) {
    // If auth check throws for any reason (network, bad config, etc.)
    // pass through rather than showing a 404/500. The page itself will
    // handle the auth state via useDemoAuth().
    console.error('[Middleware] Auth check failed, passing through:', err)
    return addSecurityHeaders(NextResponse.next())
  }
}

export const config = {
  matcher: [
    '/ranger/:path*',
    '/hiker/:path*',
    '/api/v1/:path*',
  ],
}
