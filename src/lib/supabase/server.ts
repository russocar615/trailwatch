import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  // In Next.js 14 App Router, cookies() returns ReadonlyRequestCookies synchronously.
  // Do NOT await it — it is synchronous in server components and route handlers.
  const cookieStore = cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll called from a Server Component — cookies cannot be set.
          // This is safe to ignore; middleware handles cookie refreshes.
        }
      },
    },
  })
}
