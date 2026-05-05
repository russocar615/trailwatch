import { NextRequest, NextResponse } from 'next/server'
import { secureHeaders } from '@/lib/api/helpers'

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true }, { headers: secureHeaders() })
  // Clear the httpOnly session cookie
  response.cookies.set('tw_demo_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return response
}
