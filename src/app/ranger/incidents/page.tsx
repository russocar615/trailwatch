'use client'

import { useState, useEffect } from 'react'
import { useDemoAuth } from '@/lib/demo-auth'
import AppNav from '@/components/AppNav'
import { AlertTriangle, Plus, X, CheckCircle, Clock, ChevronDown, MapPin, User, Calendar } from 'lucide-react'
import clsx from 'clsx'
import type { Incident, IncidentCategory, IncidentSeverity, IncidentStatus } from '@/types'

const SEV_CONFIG: Record<IncidentSeverity, { label: string; bg: string; text: string; dot: string }> = {
  low:      { label: 'Low',      bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-400'  },
  medium:   { label: 'Medium',   bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-500' },
  high:     { label: 'High',     bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500'},
  critical: { label: 'Critical', bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-600'   },
}

const STATUS_CONFIG: Record<IncidentStatus, { label: string; icon: typeof Clock; color: string }> = {
  open:        { label: 'Open',        icon: AlertTriangle, color: 'text-amber-600' },
  in_progress: { label: 'In Progress', icon: Clock,         color: 'text-blue-600'  },
  resolved:    { label: 'Resolved',    icon: CheckCircle,   color: 'text-emerald-600' },
  closed:      { label: 'Closed',      icon: CheckCircle,   color: 'text-gray-500'  },
}

const CATEGORIES: { value: IncidentCategory; label: string; emoji: string }[] = [
  { value: 'medical',           label: 'Medical Emergency',    emoji: '🏥' },
  { value: 'search_rescue',     label: 'Search & Rescue',      emoji: '🔦' },
  { value: 'trail_hazard',      label: 'Trail Hazard',         emoji: '⚠️' },
  { value: 'wildlife',          label: 'Wildlife Incident',    emoji: '🦘' },
  { value: 'fire',              label: 'Fire / Smoke',         emoji: '🔥' },
  { value: 'flooding',          label: 'Flooding / Water',     emoji: '🌊' },
  { value: 'infrastructure',    label: 'Infrastructure',       emoji: '🔧' },
  { value: 'visitor_behaviour', label: 'Visitor Behaviour',    emoji: '👥' },
  { value: 'other',             label: 'Other',                emoji: '📋' },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const DEMO_INCIDENTS: Incident[] = [
  { id: 'inc-001', park_id: 'royal-np', trail_id: 'rnp-coastal', reported_by: 'ranger-demo', reporter_name: 'Chief Ranger Morgan', category: 'trail_hazard', severity: 'medium', status: 'in_progress', title: 'Large fallen tree blocking Coast Track at km 2.4', description: 'Storm damage. 20m eucalyptus across main track. Hikers detouring off-trail causing erosion.', location_description: 'Coast Track, 2.4km from Bundeena trailhead', coordinates: null, assigned_to: null, resolved_at: null, resolution_notes: null, created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'inc-002', park_id: 'royal-np', trail_id: null, reported_by: 'ranger-demo', reporter_name: 'Ranger Davies', category: 'medical', severity: 'high', status: 'resolved', title: 'Visitor ankle injury at Audley Weir Car Park', description: 'Female visitor (est. 60s) ankle injury from trip on uneven surface. First aid given, ambulance attended.', location_description: 'Audley Weir Car Park, near kiosk entry', coordinates: null, assigned_to: null, resolved_at: new Date(Date.now() - 18000000).toISOString(), resolution_notes: 'Patient transported by ambulance. Surface hazard reported to maintenance.', created_at: new Date(Date.now() - 21600000).toISOString(), updated_at: new Date(Date.now() - 18000000).toISOString() },
  { id: 'inc-003', park_id: 'royal-np', trail_id: 'rnp-forest', reported_by: 'ranger-demo', reporter_name: 'Ranger Chen', category: 'wildlife', severity: 'low', status: 'open', title: 'Eastern brown snake observed on Karloo Track near creek crossing', description: 'Large eastern brown crossing path at the creek section. Signage recommended during summer months.', location_description: 'Karloo Walking Track, creek crossing at 4.2km', coordinates: null, assigned_to: null, resolved_at: null, resolution_notes: null, created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'inc-004', park_id: 'olympic-np', trail_id: 'onp-hurricane', reported_by: 'ranger-demo', reporter_name: 'Ranger Williams', category: 'trail_hazard', severity: 'medium', status: 'open', title: 'Ice on Hurricane Hill Trail above 1400m', description: 'Overnight temperatures created black ice on exposed sections. Several slips reported. Crampons recommended.', location_description: 'Hurricane Hill Trail, above 1400m elevation', coordinates: null, assigned_to: null, resolved_at: null, resolution_notes: null, created_at: new Date(Date.now() - 10800000).toISOString(), updated_at: new Date(Date.now() - 10800000).toISOString() },
]

export default function IncidentsPage() {
  const { user, loading, signOut } = useDemoAuth('parks_dept')
  const [incidents, setIncidents] = useState<Incident[]>(DEMO_INCIDENTS)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    park_id: 'royal-np',
    category: '' as IncidentCategory | '',
    severity: 'medium' as IncidentSeverity,
    title: '',
    description: '',
    location_description: '',
  })
  const [formError, setFormError] = useState('')

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter)
  const openCount = incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.category) { setFormError('Please select an incident category'); return }
    if (form.title.length < 5) { setFormError('Title must be at least 5 characters'); return }
    if (form.description.length < 10) { setFormError('Please provide more detail in the description'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, trail_id: null }),
      })
      const data = await res.json()
      if (data.success) {
        setIncidents(prev => [data.data, ...prev])
        setShowForm(false)
        setForm({ park_id: 'royal-np', category: '', severity: 'medium', title: '', description: '', location_description: '' })
      } else {
        // Demo fallback — create locally
        const local: Incident = {
          id: `inc-${Date.now()}`,
          park_id: form.park_id,
          trail_id: null,
          reported_by: 'demo-user',
          reporter_name: user?.name ?? 'Ranger',
          category: form.category as IncidentCategory,
          severity: form.severity,
          status: 'open',
          title: form.title,
          description: form.description,
          location_description: form.location_description || null,
          coordinates: null,
          assigned_to: null,
          resolved_at: null,
          resolution_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setIncidents(prev => [local, ...prev])
        setShowForm(false)
        setForm({ park_id: 'royal-np', category: '', severity: 'medium', title: '', description: '', location_description: '' })
      }
    } catch {
      // Network error — add locally for offline tolerance
      const local: Incident = {
        id: `inc-${Date.now()}`,
        park_id: form.park_id,
        trail_id: null,
        reported_by: 'demo-user',
        reporter_name: user?.name ?? 'Ranger',
        category: form.category as IncidentCategory,
        severity: form.severity,
        status: 'open',
        title: form.title,
        description: form.description,
        location_description: form.location_description || null,
        coordinates: null,
        assigned_to: null,
        resolved_at: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setIncidents(prev => [local, ...prev])
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = (id: string, status: IncidentStatus, notes?: string) => {
    setIncidents(prev => prev.map(i => i.id === id
      ? { ...i, status, resolved_at: status === 'resolved' ? new Date().toISOString() : null, resolution_notes: notes ?? i.resolution_notes, updated_at: new Date().toISOString() }
      : i
    ))
  }

  if (loading) return <div className="min-h-screen bg-hunter-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-hunter-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-hunter-950">
      <AppNav userName={user?.name ?? 'Ranger'} role="parks_dept" onSignOut={signOut} alertCount={openCount} />

      <div className="pt-14">
        <div className="bg-hunter-900 border-b border-hunter-800 px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl text-creme-100">Incident Reports</h1>
              <p className="text-xs text-hunter-400 mt-0.5">{openCount} active · {incidents.length} total</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-hunter-600 hover:bg-hunter-500 text-creme-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              Report Incident
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Status filter */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
                  filter === s ? 'bg-hunter-600 text-creme-100' : 'bg-hunter-800 text-hunter-400 hover:text-hunter-200')}>
                {s === 'all' ? 'All' : s.replace('_', ' ')}
                {s !== 'all' && <span className="ml-1.5 opacity-60">{incidents.filter(i => i.status === s).length}</span>}
              </button>
            ))}
          </div>

          {/* Incident cards */}
          <div className="space-y-3">
            {filtered.map(incident => {
              const sev = SEV_CONFIG[incident.severity]
              const stat = STATUS_CONFIG[incident.status]
              const StatIcon = stat.icon
              const cat = CATEGORIES.find(c => c.value === incident.category)
              return (
                <div key={incident.id} className="bg-hunter-900 border border-hunter-700 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-lg">{cat?.emoji}</span>
                        <span className="font-semibold text-creme-100 text-sm">{incident.title}</span>
                        <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full', sev.bg, sev.text)}>
                          {sev.label}
                        </span>
                      </div>
                      <p className="text-xs text-hunter-300 leading-relaxed mb-3">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-hunter-500 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{incident.reporter_name}</span>
                        {incident.location_description && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{incident.location_description}</span>}
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{timeAgo(incident.created_at)}</span>
                        <span className={clsx('flex items-center gap-1', stat.color)}>
                          <StatIcon className="w-3 h-3" />{stat.label}
                        </span>
                      </div>
                      {incident.resolution_notes && (
                        <div className="mt-3 p-2.5 bg-emerald-900/20 border border-emerald-800 rounded-lg">
                          <p className="text-xs text-emerald-300"><span className="font-semibold">Resolution: </span>{incident.resolution_notes}</p>
                        </div>
                      )}
                    </div>
                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {incident.status === 'open' && (
                        <button onClick={() => updateStatus(incident.id, 'in_progress')}
                          className="text-xs bg-blue-900/30 border border-blue-700 text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-900/50 transition-colors">
                          Assign to Me
                        </button>
                      )}
                      {(incident.status === 'open' || incident.status === 'in_progress') && (
                        <button onClick={() => updateStatus(incident.id, 'resolved', 'Issue addressed by ranger on duty.')}
                          className="text-xs bg-emerald-900/30 border border-emerald-700 text-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-900/50 transition-colors">
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-hunter-500">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No incidents with this status</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-hunter-900 border border-hunter-700 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-creme-100">Report New Incident</h2>
              <button onClick={() => setShowForm(false)} className="text-hunter-400 hover:text-hunter-200"><X className="w-5 h-5" /></button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />{formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Park</label>
                <select value={form.park_id} onChange={e => setForm(f => ({ ...f, park_id: e.target.value }))}
                  className="w-full bg-hunter-800 border border-hunter-600 text-creme-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-hunter-400">
                  <option value="royal-np">Royal National Park, NSW</option>
                  <option value="olympic-np">Olympic National Park, WA</option>
                  <option value="demo-park">Blue Ridge State Reserve, VIC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, category: c.value }))}
                      className={clsx('flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-colors',
                        form.category === c.value ? 'bg-hunter-600 border-hunter-500 text-creme-100' : 'bg-hunter-800 border-hunter-700 text-hunter-300 hover:border-hunter-500')}>
                      <span className="text-lg">{c.emoji}</span>
                      <span className="text-center leading-tight">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Severity</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low','medium','high','critical'] as IncidentSeverity[]).map(s => {
                    const cfg = SEV_CONFIG[s]
                    return (
                      <button key={s} type="button" onClick={() => setForm(f => ({ ...f, severity: s }))}
                        className={clsx('py-2 rounded-xl border text-xs font-semibold capitalize transition-colors',
                          form.severity === s ? 'bg-hunter-600 border-hunter-500 text-creme-100' : 'bg-hunter-800 border-hunter-700 text-hunter-300 hover:border-hunter-500')}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Brief summary of the incident"
                  className="w-full bg-hunter-800 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-hunter-400" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                  placeholder="Describe what happened, who is affected, and any immediate actions taken"
                  className="w-full bg-hunter-800 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-hunter-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-hunter-300 uppercase tracking-widest mb-2">Location</label>
                <input type="text" value={form.location_description} onChange={e => setForm(f => ({ ...f, location_description: e.target.value }))}
                  placeholder="e.g. Coast Track at km 2.4, near Wattamolla junction"
                  className="w-full bg-hunter-800 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-hunter-400" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-hunter-600 hover:bg-hunter-500 text-creme-50 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit Incident Report'}
              </button>
              <p className="text-xs text-hunter-500 text-center">This report will be logged in the audit trail with your name and timestamp.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
