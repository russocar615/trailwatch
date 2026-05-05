import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    const role = data.user?.user_metadata?.role
    return NextResponse.redirect(`${origin}${role === 'parks_dept' ? '/ranger' : '/hiker'}`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback`)
}
