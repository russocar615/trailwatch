'use client'

import { useState, useEffect } from 'react'
import { useDemoAuth } from '@/lib/demo-auth'
import AppNav from '@/components/AppNav'
import { Shield, Download, Filter, Clock, User, Tag, ChevronRight } from 'lucide-react'
import { formatAuditAction } from '@/lib/audit/logger'
import clsx from 'clsx'
import type { AuditLog, AuditAction } from '@/types'

const ACTION_ICON: Partial<Record<AuditAction, string>> = {
  'trail.status_changed':   '🏔️',
  'trail.capacity_updated': '👥',
  'parking.status_changed': '🅿️',
  'incident.created':       '⚠️',
  'incident.updated':       '📝',
  'incident.resolved':      '✅',
  'user.login':             '🔐',
  'user.logout':            '🚪',
  'user.role_changed':      '🛡️',
  'park.settings_updated':  '⚙️',
  'sensor.data_received':   '📡',
  'system.health_check':    '💚',
}

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'bg-purple-900/40 text-purple-300 border-purple-700',
  park_admin:  'bg-blue-900/40 text-blue-300 border-blue-700',
  ranger:      'bg-hunter-700 text-hunter-200 border-hunter-600',
  public:      'bg-gray-800 text-gray-400 border-gray-600',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-AU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function AuditPage() {
  const { user, loading, signOut } = useDemoAuth('parks_dept')
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [fetching, setFetching] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/audit?limit=50')
      .then(r => r.json())
      .then(d => { if (d.success) setLogs(d.data) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const uniqueActions = ['all', ...Array.from(new Set(logs.map(l => l.action)))]
  const filtered = actionFilter === 'all' ? logs : logs.filter(l => l.action === actionFilter)

  const exportCSV = () => {
    const rows = [
      ['Timestamp', 'Action', 'User', 'Role', 'Entity', 'Park', 'IP'].join(','),
      ...filtered.map(l => [
        l.timestamp, l.action, l.user_email ?? 'system', l.user_role ?? '', `${l.entity_type}:${l.entity_id ?? ''}`, l.park_id ?? '', l.ip_address ?? ''
      ].map(v => `"${v}"`).join(','))
    ].join('\n')
    const blob = new Blob([rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trailwatch-audit-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="min-h-screen bg-hunter-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-hunter-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-hunter-950">
      <AppNav userName={user?.name ?? 'Ranger'} role="parks_dept" onSignOut={signOut} />
      <div className="pt-14">
        <div className="bg-hunter-900 border-b border-hunter-800 px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Shield className="w-5 h-5 text-hunter-400" />
                <h1 className="font-serif text-2xl text-creme-100">Audit Trail</h1>
              </div>
              <p className="text-xs text-hunter-400">Immutable record of all system actions — who, what, when</p>
            </div>
            <button onClick={exportCSV}
              className="flex items-center gap-2 bg-hunter-800 border border-hunter-600 text-hunter-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-hunter-700 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Events',  value: logs.length },
              { label: 'Unique Users',  value: new Set(logs.map(l => l.user_email).filter(Boolean)).size },
              { label: 'Incidents',     value: logs.filter(l => l.action.startsWith('incident')).length },
              { label: 'Auth Events',   value: logs.filter(l => l.action.startsWith('user')).length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-hunter-900 border border-hunter-700 rounded-xl p-4 text-center">
                <div className="font-serif text-3xl text-creme-100 mb-1">{value}</div>
                <div className="text-xs text-hunter-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Action filter */}
          <div className="flex gap-2 flex-wrap mb-5">
            {uniqueActions.map(a => (
              <button key={a} onClick={() => setActionFilter(a)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  actionFilter === a ? 'bg-hunter-600 text-creme-100' : 'bg-hunter-800 text-hunter-400 hover:text-hunter-200')}>
                {a === 'all' ? 'All Events' : formatAuditAction(a as AuditAction)}
              </button>
            ))}
          </div>

          {/* Log entries */}
          {fetching ? (
            <div className="flex items-center justify-center py-16 text-hunter-500">
              <div className="w-6 h-6 border-2 border-hunter-500 border-t-transparent rounded-full animate-spin mr-3" />
              Loading audit log…
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(log => (
                <div key={log.id} className="bg-hunter-900 border border-hunter-700 rounded-xl overflow-hidden">
                  <button className="w-full text-left p-4 flex items-start gap-3 hover:bg-hunter-800/50 transition-colors"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <span className="text-xl flex-shrink-0 mt-0.5">{ACTION_ICON[log.action] ?? '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-creme-100">{formatAuditAction(log.action)}</span>
                        {log.user_role && (
                          <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide', ROLE_BADGE[log.user_role] ?? ROLE_BADGE.ranger)}>
                            {log.user_role.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-hunter-400 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.user_email ?? 'system'}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{log.entity_type}{log.entity_id ? ` · ${log.entity_id}` : ''}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(log.timestamp)}</span>
                        {log.ip_address && <span className="font-mono text-[10px] text-hunter-600">{log.ip_address}</span>}
                      </div>
                    </div>
                    <ChevronRight className={clsx('w-4 h-4 text-hunter-500 flex-shrink-0 mt-1 transition-transform', expanded === log.id && 'rotate-90')} />
                  </button>

                  {expanded === log.id && (log.previous_value || log.new_value || log.metadata) && (
                    <div className="border-t border-hunter-800 px-4 py-3 bg-hunter-950">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {log.previous_value && (
                          <div>
                            <p className="text-[10px] font-bold text-hunter-400 uppercase tracking-widest mb-2">Before</p>
                            <pre className="text-xs text-hunter-300 bg-hunter-900 p-3 rounded-lg overflow-auto font-mono">
                              {JSON.stringify(log.previous_value, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_value && (
                          <div>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">After</p>
                            <pre className="text-xs text-emerald-300 bg-hunter-900 p-3 rounded-lg overflow-auto font-mono">
                              {JSON.stringify(log.new_value, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.metadata && !log.previous_value && !log.new_value && (
                          <div className="sm:col-span-2">
                            <p className="text-[10px] font-bold text-hunter-400 uppercase tracking-widest mb-2">Metadata</p>
                            <pre className="text-xs text-hunter-300 bg-hunter-900 p-3 rounded-lg overflow-auto font-mono">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16 text-hunter-500 text-sm">No audit events found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
