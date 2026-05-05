'use client'

/**
 * Demo auth hook — Security-hardened
 *
 * Audit remediation — Finding 2.2 (CRITICAL):
 *   Sessions are now read from httpOnly cookies set by /api/auth/demo-login.
 *   The client never stores role/identity in localStorage or any client-writable store.
 *   Server verifies the cookie on every protected page request via middleware.
 *
 * This hook only reads the publicly visible display name from a non-sensitive
 * cookie. The authoritative session is the httpOnly tw_demo_session cookie.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface DemoUser {
  email: string
  name: string
  role: 'parks_dept' | 'hiker'
}

export function useDemoAuth(requiredRole?: 'parks_dept' | 'hiker') {
  const [user,    setUser]    = useState<DemoUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verify session server-side — don't trust any client-readable store
    fetch('/api/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/auth/login')
          return
        }
        const u = data.user as DemoUser
        // Role mismatch — redirect to correct dashboard
        if (requiredRole && u.role !== requiredRole) {
          router.push(u.role === 'parks_dept' ? '/ranger' : '/hiker')
          return
        }
        setUser(u)
      })
      .catch(() => {
        // Network error — redirect to login rather than exposing protected content
        router.push('/auth/login')
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    await fetch('/api/auth/demo-logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    router.push('/')
  }

  return { user, loading, signOut }
}
