/**
 * GET /api/auth/session
 * Returns current session info from the httpOnly cookie.
 * This is what the client calls to discover who is logged in.
 * The cookie itself is never readable by client JS.
 */

import { NextRequest, NextResponse } from 'next/server'
import { secureHeaders } from '@/lib/api/helpers'
import { isDemoMode } from '@/lib/security'

function parseDemoToken(token: string): { email: string; role: string; name: string; exp: number } | null {
  try {
    const [, encoded] = token.split('.')
    const payload = JSON.parse(Buffer.from(encoded, 'base64').toString())
    if (payload.exp < Date.now()) return null  // Expired
    return payload
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const headers = secureHeaders()

  // ── Check demo session cookie ─────────────────────────────────────────────
  if (isDemoMode()) {
    const demoCookie = req.cookies.get('tw_demo_session')
    if (demoCookie) {
      const session = parseDemoToken(demoCookie.value)
      if (session) {
        return NextResponse.json({
          authenticated: true,
          user: { email: session.email, name: session.name, role: session.role },
          mode: 'demo',
        }, { headers })
      }
    }
  }

  // ── Check real Supabase session ───────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const isRealSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes('placeholder')

  if (isRealSupabase) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, is_active')
          .eq('id', user.id)
          .single()

        if (profile?.is_active) {
          return NextResponse.json({
            authenticated: true,
            user: { email: user.email, name: profile.full_name, role: profile.role },
            mode: 'supabase',
          }, { headers })
        }
      }
    } catch {
      // Fall through to unauthenticated response
    }
  }

  return NextResponse.json({ authenticated: false }, { headers })
}
