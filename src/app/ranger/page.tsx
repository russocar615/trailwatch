'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import AppNav from '@/components/AppNav'
import { PARKS, PARKING_LOTS, TRAILS, HOURLY_DATA, WEEKLY_DATA } from '@/lib/data'
import {
  AlertTriangle, Car, Users, Activity, MapPin, ChevronDown,
  CheckCircle, X, Shield, FileText, Cpu
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import clsx from 'clsx'

type Tab = 'overview' | 'parking' | 'trails' | 'analytics'

function pct(occ: number, tot: number) { return tot === 0 ? 0 : Math.round((occ / tot) * 100) }

const CROWD_MAP: Record<string, { bg: string; text: string; label: string }> = {
  quiet:      { bg: 'bg-emerald-900/30', text: 'text-emerald-300', label: 'Quiet'    },
  moderate:   { bg: 'bg-amber-900/20',   text: 'text-amber-300',   label: 'Moderate' },
  busy:       { bg: 'bg-orange-900/20',  text: 'text-orange-300',  label: 'Busy'     },
  very_busy:  { bg: 'bg-red-900/30',     text: 'text-red-300',     label: 'Very Busy'},
}

function StatCard({ label, value, sub, icon: Icon, accent = false }: { label: string; value: string | number; sub: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <div className={clsx('rounded-2xl p-5 border', accent ? 'bg-red-900/20 border-red-800' : 'bg-hunter-800 border-hunter-700')}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold text-hunter-300 uppercase tracking-widest">{label}</span>
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', accent ? 'bg-red-900/40' : 'bg-hunter-700')}>
          <Icon className={clsx('w-4 h-4', accent ? 'text-red-400' : 'text-hunter-300')} />
        </div>
      </div>
      <div className={clsx('font-serif text-4xl mb-1', accent ? 'text-red-300' : 'text-creme-100')}>{value}</div>
      <div className="text-xs text-hunter-400">{sub}</div>
    </div>
  )
}

function LotBar({ lot }: { lot: typeof PARKING_LOTS[0] }) {
  const p = pct(lot.occupied, lot.total)
  const barColor = lot.status === 'full' ? 'bg-red-500' : lot.status === 'busy' ? 'bg-amber-500' : 'bg-hunter-500'
  const dot = lot.status === 'full' ? 'bg-red-500' : lot.status === 'busy' ? 'bg-amber-400' : 'bg-emerald-400'
  const pctColor = lot.status === 'full' ? 'text-red-400' : lot.status === 'busy' ? 'text-amber-400' : 'text-hunter-300'
  return (
    <div className="flex items-center gap-4 py-3 border-b border-hunter-700/40 last:border-0">
      <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', dot)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-creme-100 font-medium truncate mb-1.5">{lot.name}</p>
        <div className="h-1.5 bg-hunter-700 rounded-full overflow-hidden">
          <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${p}%` }} />
        </div>
      </div>
      <div className="text-right flex-shrink-0 w-16">
        <div className={clsx('text-sm font-bold', pctColor)}>{p}%</div>
        <div className="text-[10px] text-hunter-500">{lot.total - lot.occupied} free</div>
      </div>
      {lot.sensor_id && <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="IoT sensor active" />}
    </div>
  )
}

function TrailRow({ trail, onToggle }: { trail: typeof TRAILS[0]; onToggle: () => void }) {
  const p = pct(trail.currentHikers, trail.maxCapacity)
  const crowd = CROWD_MAP[trail.crowdLevel] || CROWD_MAP.moderate
  return (
    <div className="py-4 border-b border-hunter-700/40 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-creme-100">{trail.name}</span>
            {trail.status !== 'closed' && (
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', crowd.bg, crowd.text)}>{crowd.label}</span>
            )}
            {trail.status === 'closed' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-medium">CLOSED</span>
            )}
            {trail.is_accessible && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800">♿ Accessible</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-hunter-400 mb-2">
            <span>{trail.length} {trail.length_unit}</span>
            <span>{trail.difficulty}</span>
            {trail.status !== 'closed' && <span>{trail.currentHikers}/{trail.maxCapacity} hikers · {p}%</span>}
          </div>
          {trail.status !== 'closed' && (
            <div className="h-1 bg-hunter-700 rounded-full overflow-hidden w-44">
              <div className={clsx('h-full rounded-full', p > 80 ? 'bg-red-500' : p > 50 ? 'bg-amber-500' : 'bg-hunter-400')}
                style={{ width: `${Math.min(p, 100)}%` }} />
            </div>
          )}
        </div>
        <button onClick={onToggle}
          className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 mt-0.5',
            trail.status === 'open' ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-hunter-600 text-creme-100 hover:bg-hunter-500')}>
          {trail.status === 'open' ? 'Close Trail' : 'Open Trail'}
        </button>
      </div>
    </div>
  )
}

export default function RangerDashboard() {
  const { user, loading, signOut } = useDemoAuth('parks_dept')
  const [selectedParkId, setSelectedParkId] = useState('royal-np')
  const [tab, setTab] = useState<Tab>('overview')
  const [trailStates, setTrailStates] = useState(TRAILS)
  const [dismissed, setDismissed] = useState<string[]>([])
  const [parkPickerOpen, setParkPickerOpen] = useState(false)

  const park = PARKS.find(p => p.id === selectedParkId) || PARKS[0]
  const lots = PARKING_LOTS.filter(l => l.parkId === selectedParkId)
  const trails = trailStates.filter(t => t.parkId === selectedParkId)

  const totalHikers = trails.reduce((s, t) => s + t.currentHikers, 0)
  const totalOcc = lots.reduce((s, l) => s + l.occupied, 0)
  const totalSpaces = lots.reduce((s, l) => s + l.total, 0)
  const fullLots = lots.filter(l => l.status === 'full').length
  const openTrails = trails.filter(t => t.status === 'open').length

  // Demo alerts derived from data
  const alerts = [
    ...lots.filter(l => l.status === 'full').map(l => ({ id: l.id, msg: `${l.name} is at 100% capacity`, sev: 'high' as const })),
    ...trails.filter(t => t.crowdLevel === 'very_busy' && t.status === 'open').map(t => ({ id: t.id, msg: `${t.name} is very busy — ${t.currentHikers}/${t.maxCapacity} hikers`, sev: 'medium' as const })),
  ].filter(a => !dismissed.includes(a.id))

  const toggleTrail = (id: string) =>
    setTrailStates(prev => prev.map(t => t.id === id
      ? { ...t, status: t.status === 'open' ? 'closed' : 'open', currentHikers: t.status === 'open' ? 0 : t.currentHikers }
      : t))

  if (loading) return (
    <div className="min-h-screen bg-hunter-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-hunter-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-hunter-950 text-creme-100">
      <AppNav userName={user?.name || 'Ranger'} role="parks_dept" onSignOut={signOut} alertCount={alerts.length} />

      <div className="pt-14">
        {/* Park selector header */}
        <div className="bg-hunter-900 border-b border-hunter-800 px-4 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setParkPickerOpen(!parkPickerOpen)}
                  className="flex items-center gap-2 bg-hunter-800 border border-hunter-600 px-4 py-2 rounded-xl hover:bg-hunter-700 transition-colors">
                  <MapPin className="w-4 h-4 text-hunter-400" />
                  <div className="text-left">
                    <p className="text-[10px] text-hunter-400">{park.agency}</p>
                    <p className="text-sm font-semibold text-creme-100 leading-tight max-w-[200px] truncate">{park.name}</p>
                  </div>
                  <ChevronDown className={clsx('w-4 h-4 text-hunter-400 transition-transform', parkPickerOpen && 'rotate-180')} />
                </button>
                {parkPickerOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-hunter-800 border border-hunter-600 rounded-2xl shadow-2xl z-20 overflow-hidden">
                    {PARKS.map(p => (
                      <button key={p.id} onClick={() => { setSelectedParkId(p.id); setParkPickerOpen(false) }}
                        className={clsx('w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-hunter-700 transition-colors border-b border-hunter-700 last:border-0',
                          p.id === selectedParkId && 'bg-hunter-700')}>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-creme-100">{p.name}</p>
                          <p className="text-xs text-hunter-400">{p.agency} · {p.state_region}</p>
                        </div>
                        {p.id === selectedParkId && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Live</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-hunter-800 rounded-xl p-1">
              {(['overview', 'parking', 'trails', 'analytics'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
                    tab === t ? 'bg-hunter-600 text-creme-100' : 'text-hunter-400 hover:text-hunter-200')}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

          {/* Live alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map(a => (
                <div key={a.id} className={clsx('flex items-start gap-3 px-4 py-3 rounded-xl border',
                  a.sev === 'high' ? 'bg-red-900/30 border-red-700' : 'bg-amber-900/20 border-amber-700')}>
                  <AlertTriangle className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', a.sev === 'high' ? 'text-red-400' : 'text-amber-400')} />
                  <p className="flex-1 text-sm text-creme-100">{a.msg}</p>
                  <button onClick={() => setDismissed(d => [...d, a.id])} className="opacity-50 hover:opacity-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick-link cards to sub-pages */}
          {tab === 'overview' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { href: '/ranger/incidents', icon: FileText,  label: 'Incidents',  sub: 'Report & track', color: 'border-amber-800 hover:border-amber-600' },
                { href: '/ranger/audit',     icon: Shield,    label: 'Audit Log',  sub: 'Who did what',   color: 'border-blue-800 hover:border-blue-600'   },
                { href: '/ranger/system',    icon: Cpu,       label: 'System',     sub: 'Sensors & health',color: 'border-hunter-600 hover:border-hunter-400'},
              ].map(({ href, icon: Icon, label, sub, color }) => (
                <Link key={href} href={href}
                  className={clsx('bg-hunter-900 border rounded-2xl p-4 flex items-center gap-3 transition-colors group', color)}>
                  <div className="w-9 h-9 bg-hunter-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-hunter-600 transition-colors">
                    <Icon className="w-4 h-4 text-hunter-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-creme-100">{label}</p>
                    <p className="text-xs text-hunter-400">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active Hikers" value={totalHikers} sub="currently on trails" icon={Users} />
            <StatCard label="Parking Used" value={`${pct(totalOcc, totalSpaces)}%`} sub={`${totalSpaces - totalOcc} spaces free`} icon={Car} accent={pct(totalOcc, totalSpaces) > 85} />
            <StatCard label="Full Lots" value={fullLots} sub={`of ${lots.length} lots`} icon={AlertTriangle} accent={fullLots > 0} />
            <StatCard label="Open Trails" value={openTrails} sub={`of ${trails.length} trails`} icon={Activity} />
          </div>

          {/* Parking */}
          {(tab === 'overview' || tab === 'parking') && (
            <div className="bg-hunter-900 rounded-2xl border border-hunter-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl text-creme-100">Parking — Live Status</h2>
                <div className="flex items-center gap-1.5 text-xs text-hunter-500">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  IoT sensors active
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-x-10">
                {lots.map(lot => <LotBar key={lot.id} lot={lot} />)}
              </div>
              {lots.length === 0 && <p className="text-hunter-500 text-sm py-6 text-center">No parking data for this park.</p>}
            </div>
          )}

          {/* Trails */}
          {(tab === 'overview' || tab === 'trails') && (
            <div className="bg-hunter-900 rounded-2xl border border-hunter-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl text-creme-100">Trail Monitor</h2>
                <span className="text-xs text-hunter-500">Click to open/close trails</span>
              </div>
              <div className="grid md:grid-cols-2 gap-x-10">
                {trails.map(trail => <TrailRow key={trail.id} trail={trail} onToggle={() => toggleTrail(trail.id)} />)}
              </div>
            </div>
          )}

          {/* Analytics */}
          {(tab === 'overview' || tab === 'analytics') && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-hunter-900 rounded-2xl border border-hunter-700 p-6">
                <h2 className="font-serif text-xl text-creme-100 mb-1">Today's Traffic</h2>
                <p className="text-xs text-hunter-400 mb-5">Hiker count by hour</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={HOURLY_DATA} margin={{ left: -10 }}>
                    <defs>
                      <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f3a2a" />
                    <XAxis dataKey="hour" tick={{ fill: '#5a7a65', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5a7a65', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1a3a2a', border: '1px solid #2d6a4f', borderRadius: 8, color: '#faf7ed', fontSize: 12 }} />
                    <Area type="monotone" dataKey="hikers" stroke="#40916c" fill="url(#hGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-hunter-900 rounded-2xl border border-hunter-700 p-6">
                <h2 className="font-serif text-xl text-creme-100 mb-1">Weekly Visitors</h2>
                <p className="text-xs text-hunter-400 mb-5">Daily totals this week</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={WEEKLY_DATA} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f3a2a" />
                    <XAxis dataKey="day" tick={{ fill: '#5a7a65', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5a7a65', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1a3a2a', border: '1px solid #2d6a4f', borderRadius: 8, color: '#faf7ed', fontSize: 12 }} />
                    <Bar dataKey="hikers" fill="#2d6a4f" radius={[4, 4, 0, 0]}>
                      {WEEKLY_DATA.map((_, i) => <Cell key={i} fill={i >= 4 ? '#40916c' : '#2d6a4f'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                {[
                  { label: 'Avg Daily Visitors', value: Math.round(WEEKLY_DATA.reduce((s,d)=>s+d.hikers,0)/7).toString(), delta: '+9% vs prev week', up: true },
                  { label: 'Peak Hour Today',    value: '12pm', delta: '258 hikers at peak', up: null },
                  { label: 'Sensor Coverage',    value: '91%',  delta: '2 sensors offline',  up: false },
                ].map(({ label, value, delta, up }) => (
                  <div key={label} className="bg-hunter-900 border border-hunter-700 rounded-2xl p-5">
                    <p className="text-[11px] font-semibold text-hunter-400 uppercase tracking-widest mb-2">{label}</p>
                    <p className="font-serif text-2xl text-creme-100 mb-1">{value}</p>
                    <p className={clsx('text-xs', up === true ? 'text-emerald-400' : up === false ? 'text-red-400' : 'text-hunter-400')}>{delta}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
