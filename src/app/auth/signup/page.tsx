'use client'

/**
 * TrailWatch Signup Page — Security-hardened
 *
 * Audit remediations:
 *   Finding 2.1 (CRITICAL) — Parks signup code moved to server-only env var.
 *     Validated via POST /api/auth/validate-parks-code, never exposed in JS bundle.
 *   Finding 2.9 (MEDIUM)  — Minimum password 15 chars for staff, 8 for public.
 *     Uses validatePassword() from security.ts (NIST SP 800-63B compliant).
 *   Finding 2.10 (MEDIUM) — MFA notice added for staff accounts.
 */

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { validatePassword } from '@/lib/security'
import { Mountain, Eye, EyeOff, AlertCircle, CheckCircle, ChevronDown, ShieldCheck } from 'lucide-react'

export default function SignupPage() {
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPw,   setConfirmPw]   = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [isParksDept, setIsParksDept] = useState(false)
  const [parksCode,   setParksCode]   = useState('')
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [pwStrength,  setPwStrength]  = useState<string>('')

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    if (val.length > 0) {
      const result = validatePassword(val, isParksDept)
      setPwStrength(result.strength)
    } else {
      setPwStrength('')
    }
  }

  const strengthColor: Record<string, string> = {
    weak:       'bg-red-500',
    fair:       'bg-amber-500',
    strong:     'bg-hunter-500',
    very_strong:'bg-emerald-500',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side pre-validation
    if (password !== confirmPw) { setError('Passwords do not match'); return }

    const pwCheck = validatePassword(password, isParksDept)
    if (!pwCheck.valid) { setError(pwCheck.errors[0]); return }

    // FIXED: Parks code validated server-side — never compared in browser
    if (isParksDept) {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/validate-parks-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: parksCode }),
        })
        const data = await res.json()
        if (!data.success) {
          setError('Invalid Parks Department authorization code. Contact your park administrator.')
          setLoading(false)
          return
        }
      } catch {
        setError('Could not validate authorization code. Please try again.')
        setLoading(false)
        return
      }
    } else {
      setLoading(true)
    }

    const role = isParksDept ? 'parks_dept' : 'hiker'
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) { setError(authError.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-hunter-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-hunter-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-creme-50" />
          </div>
          <h2 className="font-serif text-3xl text-creme-100 mb-3">Check your email</h2>
          <p className="text-hunter-300 mb-6">
            We sent a confirmation link to <strong className="text-creme-200">{email}</strong>. Click it to activate your account, then sign in.
          </p>
          {isParksDept && (
            <div className="mb-6 p-3 bg-blue-900/30 border border-blue-700 rounded-xl text-xs text-blue-200">
              <strong>Staff account note:</strong> You will be prompted to set up multi-factor authentication on first sign-in.
            </div>
          )}
          <Link href="/auth/login"
            className="inline-block bg-hunter-500 text-creme-50 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-hunter-400 transition-colors">
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hunter-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-hunter-700 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-hunter-600 rounded-2xl flex items-center justify-center">
              <Mountain className="w-7 h-7 text-creme-50" />
            </div>
            <span className="font-serif text-3xl text-creme-100">TrailWatch</span>
          </Link>
          <p className="text-hunter-300 mt-2 text-sm">Create your free account</p>
        </div>

        <div className="bg-hunter-800 rounded-2xl p-8 border border-hunter-700">
          {error && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Full Name</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required
                autoComplete="name" placeholder="Alex Rivera"
                className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Email</label>
              <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="email" placeholder="you@example.com"
                className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">
                Password {isParksDept ? '(minimum 15 characters)' : '(minimum 8 characters)'}
              </label>
              <div className="relative">
                <input id="signup-password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => handlePasswordChange(e.target.value)} required
                  autoComplete="new-password"
                  placeholder={isParksDept ? 'Min 15 characters for staff accounts' : 'Min 8 characters'}
                  className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hunter-500 hover:text-hunter-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {pwStrength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {['weak', 'fair', 'strong', 'very_strong'].map((level, i) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                        ['weak','fair','strong','very_strong'].indexOf(pwStrength) >= i
                          ? strengthColor[pwStrength]
                          : 'bg-hunter-700'
                      }`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-hunter-400 capitalize">{pwStrength.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Confirm Password</label>
              <input id="confirm-password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required
                autoComplete="new-password" placeholder="••••••••"
                className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
            </div>

            {/* Parks dept toggle */}
            <div className="pt-1">
              <button type="button" onClick={() => setIsParksDept(!isParksDept)}
                className="flex items-center justify-between w-full text-sm text-hunter-300 hover:text-hunter-100 transition-colors">
                <span>Parks Department or Ranger staff?</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isParksDept ? 'rotate-180' : ''}`} />
              </button>
              {isParksDept && (
                <div className="mt-3 p-4 bg-hunter-900 rounded-xl border border-hunter-600">
                  <p className="text-xs text-hunter-400 mb-3">
                    Staff accounts require an authorization code from your park administrator. You will also be required to set up multi-factor authentication after sign-in.
                  </p>
                  <label htmlFor="parks-code" className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">
                    Authorization Code
                  </label>
                  <input id="parks-code" type="text" value={parksCode} onChange={e => setParksCode(e.target.value)}
                    placeholder="Enter your parks authorization code"
                    autoComplete="off"
                    className="w-full bg-hunter-800 border border-hunter-600 text-creme-100 placeholder-hunter-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-hunter-500 hover:bg-hunter-400 text-creme-50 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 mt-2">
              {loading
                ? 'Creating account…'
                : isParksDept ? 'Create Staff Account' : 'Create Hiker Account'}
            </button>
          </form>

          <p className="text-center text-hunter-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-creme-200 hover:text-creme-50 font-medium transition-colors">Sign in</Link>
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-hunter-500 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Your password is encrypted and never stored in plain text.</span>
        </div>
      </div>
    </div>
  )
}
