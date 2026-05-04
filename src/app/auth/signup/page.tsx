'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mountain, Eye, EyeOff, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'

const PARKS_CODE = process.env.NEXT_PUBLIC_PARKS_SIGNUP_CODE || 'TRAILWATCH_PARKS_2025'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [isParksDept, setIsParksDept] = useState(false)
  const [parksCode, setParksCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPw) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (isParksDept && parksCode !== PARKS_CODE) {
      setError('Invalid Parks Department authorization code. Contact your park administrator.')
      return
    }

    setLoading(true)
    const role = isParksDept ? 'parks_dept' : 'hiker'
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
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
          <p className="text-hunter-300 mt-2 text-sm">Create your free hiker account</p>
        </div>

        <div className="bg-hunter-800 rounded-2xl p-8 border border-hunter-700">
          {error && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Alex Rivera"
                className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 8 characters"
                  className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hunter-500 hover:text-hunter-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Confirm Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required placeholder="••••••••"
                className="w-full bg-hunter-900 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
            </div>

            {/* Account type toggle */}
            <div className="pt-2">
              <button type="button" onClick={() => setIsParksDept(!isParksDept)}
                className="flex items-center justify-between w-full text-sm text-hunter-300 hover:text-hunter-100 transition-colors">
                <span>Parks Department staff?</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isParksDept ? 'rotate-180' : ''}`} />
              </button>
              {isParksDept && (
                <div className="mt-3 p-4 bg-hunter-900 rounded-xl border border-hunter-600">
                  <p className="text-xs text-hunter-400 mb-3">
                    Parks Department accounts require an authorization code from your park administrator.
                  </p>
                  <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">
                    Authorization Code
                  </label>
                  <input type="text" value={parksCode} onChange={e => setParksCode(e.target.value)}
                    placeholder="Enter your parks code"
                    className="w-full bg-hunter-800 border border-hunter-600 text-creme-100 placeholder-hunter-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-hunter-500 hover:bg-hunter-400 text-creme-50 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Creating account…' : isParksDept ? 'Create Parks Department Account' : 'Create Hiker Account'}
            </button>
          </form>

          <p className="text-center text-hunter-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-creme-200 hover:text-creme-50 font-medium transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-hunter-500 text-xs mt-4">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
