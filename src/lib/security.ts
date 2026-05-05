/**
 * TrailWatch Security Utilities
 * NIST SP 800-53 compliance implementations
 *
 * Addresses audit findings:
 *   IA-3  — Constant-time sensor key comparison (finding 2.7, HIGH)
 *   SC-28 — Content Security Policy generation (finding 2.6, HIGH)
 *   IA-5  — Password strength validation (finding 2.9, MEDIUM)
 *   AU-9  — Audit log write with failure alerting (finding 2.8, MEDIUM)
 *   CM-6  — Demo mode gate — server-side only (finding 2.1, CRITICAL)
 *
 * IMPORTANT: This file is safe to import from both client and server components.
 * Functions that need server-only modules (supabase/server) use dynamic imports
 * inside async functions so they are never bundled into the client JS.
 */

import type { UserRole } from '@/types'

// ── IA-3: Constant-time secret comparison ─────────────────────────────────────
// Replaces timing-vulnerable === comparison.
// Works on both client and server — no Node.js crypto needed.
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const maxLen = Math.max(a.length, b.length)
  let mismatch = a.length !== b.length ? 1 : 0
  for (let i = 0; i < maxLen; i++) {
    const ca = a.charCodeAt(i % a.length)
    const cb = b.charCodeAt(i % b.length)
    mismatch |= ca ^ cb
  }
  return mismatch === 0
}

// ── AC-2/AC-6: Authoritative role resolution from DB ─────────────────────────
// Reads role from profiles table — NOT from mutable JWT user_metadata.
// Dynamic import keeps @supabase/ssr out of the client bundle.
export async function getAuthoritativeRole(userId: string): Promise<UserRole | null> {
  try {
    // Dynamic import — server-only, never bundled to client
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    if (!data.is_active) return null
    return data.role as UserRole
  } catch {
    return null
  }
}

// ── IA-5: Password strength validation ───────────────────────────────────────
// NIST SP 800-63B: length-focused, no arbitrary composition rules.
// Client-safe — pure computation, no imports needed.
export interface PasswordValidation {
  valid:    boolean
  errors:   string[]
  strength: 'weak' | 'fair' | 'strong' | 'very_strong'
}

export function validatePassword(password: string, isStaff = false): PasswordValidation {
  const errors: string[] = []
  const minLen = isStaff ? 15 : 8

  if (password.length < minLen)
    errors.push(`Password must be at least ${minLen} characters${isStaff ? ' (required for staff accounts — NIST SP 800-63B)' : ''}`)

  if (password.length > 256)
    errors.push('Password must be 256 characters or fewer')

  const commonPatterns = [
    'password', '123456', 'qwerty', 'abc123', 'letmein',
    'trailwatch', 'national', 'ranger', 'password1', 'welcome',
  ]
  const lower = password.toLowerCase()
  if (commonPatterns.some(p => lower.includes(p)))
    errors.push('Password contains a commonly used phrase — please choose something more unique')

  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const strength: PasswordValidation['strength'] =
    score <= 1 ? 'weak' :
    score <= 2 ? 'fair' :
    score <= 3 ? 'strong' : 'very_strong'

  return { valid: errors.length === 0, errors, strength }
}

// ── SC-28: Content Security Policy ───────────────────────────────────────────
// Used in middleware and next.config.js headers.
// Client-safe — returns a plain string.
export function buildCSP(): string {
  return [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://images.unsplash.com",
    // unsafe-inline required for Next.js inline hydration scripts
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join('; ')
}

// ── AU-9: Audit log write with structured failure logging ─────────────────────
// Caller receives success/failure — no silent drops.
// Dynamic import keeps supabase/server out of the client bundle.
export async function writeAuditWithAlert(
  log: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { error } = await supabase.from('audit_logs').insert(log)
    if (error) {
      console.error(JSON.stringify({
        level: 'ERROR', service: 'trailwatch-audit',
        message: 'Audit log write FAILED', error: error.message,
        timestamp: new Date().toISOString(),
        log_summary: { action: log['action'], park_id: log['park_id'] },
      }))
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({
      level: 'CRITICAL', service: 'trailwatch-audit',
      message: 'Audit log write EXCEPTION', error: msg,
      timestamp: new Date().toISOString(),
    }))
    return { success: false, error: msg }
  }
}

// ── CM-6 / DEMO_MODE gate ─────────────────────────────────────────────────────
// Server-side only — process.env is not available on the client.
// isDemoMode() returns false in production regardless of env var values.
export function isDemoMode(): boolean {
  if (typeof process === 'undefined') return false
  if (process.env['NODE_ENV'] === 'production') return false
  if (process.env['DEMO_MODE'] !== 'true') return false
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? ''
  return url.includes('placeholder') || url === ''
}
