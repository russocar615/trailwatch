'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface DemoUser {
  email: string
  name: string
  role: 'parks_dept' | 'hiker'
}

export function useDemoAuth(requiredRole?: 'parks_dept' | 'hiker') {
  const [user, setUser] = useState<DemoUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('tw_demo_user')
    if (stored) {
      const u = JSON.parse(stored) as DemoUser
      if (requiredRole && u.role !== requiredRole) {
        router.push(u.role === 'parks_dept' ? '/ranger' : '/hiker')
        return
      }
      setUser(u)
    } else {
      router.push('/auth/login')
    }
    setLoading(false)
  }, [])

  const signOut = () => {
    localStorage.removeItem('tw_demo_user')
    localStorage.removeItem('tw_demo_role')
    router.push('/')
  }

  return { user, loading, signOut }
}
