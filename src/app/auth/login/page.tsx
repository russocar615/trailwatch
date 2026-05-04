'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mountain, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Demo credentials shortcut
  const fillDemo = (type: 'parks' | 'hiker') => {
    if (type === 'parks') {
      setEmail('ranger@trailwatch.demo')
      setPassword('TrailWatch2025!')
    } else {
      setEmail('hiker@trailwatch.demo')
      setPassword('Hiker2025!')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Demo mode - bypass Supabase for demo accounts
    if (email === 'ranger@trailwatch.demo' && password === 'TrailWatch2025!') {
      // Store demo session in localStorage
      localStorage.setItem('tw_demo_role', 'parks_dept')
      localStorage.setItem('tw_demo_user', JSON.stringify({ email, name: 'Chief Ranger Morgan', role: 'parks_dept' }))
      router.push('/ranger')
      return
    }
    if (email === 'hiker@trailwatch.demo' && password === 'Hiker2025!') {
      localStorage.setItem('tw_demo_role', 'hiker')
      localStorage.setItem('tw_demo_user', JSON.stringify({ email, name: 'Trail Explorer', role: 'hiker' }))
      router.push('/hiker')
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    const role = data.user?.user_metadata?.role
    router.push(role === 'parks_dept' ? '/ranger' : '/hiker')
  }

  return (
    <div className="min-h-screen bg-hunter-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-hunter-700 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-hunter-600 rounded-full blur-3xl opacity-15" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-hunter-600 rounded-2xl flex items-center justify-center">
              <Mountain className="w-7 h-7 text-creme-50" />
            </div>
            <span className="font-serif text-3xl text-creme-100">TrailWatch</span>
          </Link>
          <p className="text-hunter-300 mt-2 text-sm">Sign in to your account</p>
        </div>

        {/* Demo buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => fillDemo('parks')}
            className="bg-hunter-700 border border-hunter-600 text-creme-100 py-2.5 rounded-xl text-xs font-semibold hover:bg-hunter-600 transition-colors">
            🏕️ Demo: Ranger Login
          </button>
          <button onClick={() => fillDemo('hiker')}
            className="bg-hunter-700 border border-hunter-600 text-creme-100 py-2.5 rounded-xl text-xs font-semibold hover:bg-hunter-600 transition-colors">
            🥾 Demo: Hiker Login
          </button>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-hunter-700" />
          <span className="text-hunter-400 text-xs">or sign in with email</span>
          <div className="flex-1 h-px bg-hunter-700" />
        </div>

        {/* Form */}
        <div className="bg-hunter-800 rounded-2xl p-8 border border-hunter-700">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-hunter-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-hunter-400 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hunter-500 hover:text-hunter-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-hunter-500 hover:bg-hunter-400 text-creme-50 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-hunter-400 text-sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-creme-200 hover:text-creme-50 font-medium transition-colors">
                Create a hiker account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-hunter-500 text-xs mt-6">
          Parks Department accounts require authorization from your park administrator.
        </p>
      </div>
    </div>
  )
}
