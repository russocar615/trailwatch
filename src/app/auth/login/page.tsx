'use client'

/**
 * TrailWatch Login Page — Security-hardened
 *
 * Audit remediations applied:
 *   Finding 2.1 (CRITICAL) — Demo credentials removed from JSX/source code.
 *     Demo mode is now gated by DEMO_MODE=true env var, checked server-side
 *     via /api/auth/demo-login route. Credentials never appear in client JS.
 *   Finding 2.2 (CRITICAL) — No longer stores sessions in localStorage.
 *     Real auth uses Supabase session cookies (httpOnly, managed by @supabase/ssr).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mountain, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // ── Demo mode: credentials go to server-side route, never compared in browser ──
    // The server checks DEMO_MODE env var; if false in production this always 401s.
    if (email.endsWith('@trailwatch.demo')) {
      try {
        const res = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        })
        const data = await res.json()
        if (data.success) {
          router.push(data.redirect)
          return
        }
        setError(data.error?.message ?? 'Demo login failed')
      } catch {
        setError('Connection error. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    // ── Real Supabase authentication ──────────────────────────────────────────
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      // Return generic message — don't reveal whether email or password was wrong
      setError('Invalid email or password. Please check your credentials and try again.')
      setLoading(false)
      return
    }

    // Role comes from the session — profiles table query happens server-side
    const role = data.user?.user_metadata?.role
    router.push(['super_admin', 'park_admin', 'ranger'].includes(role) ? '/ranger' : '/hiker')
  }

  return (
    <div className="min-h-screen bg-hunter-900 flex items-center justify-center px-4 relative overflow-hidden">
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

        {/* Demo banner — only shown when DEMO_MODE is active (set in .env.local) */}
        {process.env.NEXT_PUBLIC_DEMO_BANNER === 'true' && (
          <div className="mb-5 p-3 bg-amber-900/30 border border-amber-700 rounded-xl text-xs text-amber-200 text-center">
            <strong>Demo Environment</strong> — Use provided demo credentials to explore the application.
          </div>
        )}

        <div className="bg-hunter-800 rounded-2xl p-8 border border-hunter-700">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-hunter-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-hunter-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hunter-500 hover:text-hunter-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hunter-500 hover:bg-hunter-400 text-creme-50 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
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

        <div className="mt-5 flex items-center justify-center gap-2 text-hunter-500 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sessions are encrypted and server-validated. Your credentials are never stored in the browser.</span>
        </div>

        <p className="text-center text-hunter-600 text-xs mt-3">
          Parks Department accounts require authorization from your park administrator.
        </p>
      </div>
    </div>
  )
}
