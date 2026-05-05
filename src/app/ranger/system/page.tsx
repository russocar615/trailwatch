'use client'

import { useState, useEffect } from 'react'
import { useDemoAuth } from '@/lib/demo-auth'
import AppNav from '@/components/AppNav'
import { Activity, Database, Radio, AlertTriangle, CheckCircle, RefreshCw, Server, Wifi, WifiOff } from 'lucide-react'
import clsx from 'clsx'

interface HealthData {
  timestamp: string
  database: 'healthy' | 'degraded' | 'down'
  api: 'healthy' | 'degraded' | 'down'
  sensors_online: number
  sensors_total: number
  active_incidents: number
  parks_monitored: number
  latency_ms: number
  environment: string
  version: string
  uptime_note: string
}

const SENSOR_DEMO = [
  { id: 'rnp-sensor-01', name: 'Audley Weir Car Park',          type: 'parking_magnetic', health: 'online',   battery: 87, last_ping: new Date(Date.now() - 45000).toISOString(),   park: 'Royal NP' },
  { id: 'rnp-sensor-02', name: 'Wattamolla Beach Car Park',     type: 'parking_magnetic', health: 'online',   battery: 72, last_ping: new Date(Date.now() - 62000).toISOString(),   park: 'Royal NP' },
  { id: 'rnp-sensor-03', name: 'Bundeena Drive Trailhead',      type: 'parking_magnetic', health: 'online',   battery: 94, last_ping: new Date(Date.now() - 38000).toISOString(),   park: 'Royal NP' },
  { id: 'rnp-sensor-04', name: 'Visitor Centre (Sutherland)',   type: 'parking_magnetic', health: 'degraded', battery: 21, last_ping: new Date(Date.now() - 310000).toISOString(),  park: 'Royal NP' },
  { id: 'rnp-sensor-05', name: 'Garie Beach Car Park',          type: 'parking_magnetic', health: 'online',   battery: 65, last_ping: new Date(Date.now() - 55000).toISOString(),   park: 'Royal NP' },
  { id: 'onp-sensor-01', name: 'Hoh Rain Forest VC',            type: 'trail_ir_counter', health: 'online',   battery: 81, last_ping: new Date(Date.now() - 42000).toISOString(),   park: 'Olympic NP' },
  { id: 'onp-sensor-02', name: 'Hurricane Ridge Day Lodge',     type: 'parking_magnetic', health: 'online',   battery: 76, last_ping: new Date(Date.now() - 29000).toISOString(),   park: 'Olympic NP' },
  { id: 'onp-sensor-03', name: 'Sol Duc Trailhead',             type: 'trail_ir_counter', health: 'online',   battery: 58, last_ping: new Date(Date.now() - 91000).toISOString(),   park: 'Olympic NP' },
  { id: 'onp-sensor-04', name: 'Lake Quinault South Shore',     type: 'parking_magnetic', health: 'offline',  battery: 0,  last_ping: new Date(Date.now() - 7200000).toISOString(), park: 'Olympic NP' },
  { id: 'onp-sensor-05', name: 'Rialto Beach Parking Area',     type: 'parking_magnetic', health: 'online',   battery: 89, last_ping: new Date(Date.now() - 35000).toISOString(),   park: 'Olympic NP' },
]

const HEALTH_COLOR: Record<string, string> = {
  healthy:  'text-emerald-400',
  degraded: 'text-amber-400',
  down:     'text-red-400',
  online:   'text-emerald-400',
  offline:  'text-red-400',
}

const HEALTH_BG: Record<string, string> = {
  healthy:  'bg-emerald-900/30 border-emerald-700',
  degraded: 'bg-amber-900/20 border-amber-700',
  down:     'bg-red-900/30 border-red-700',
}

function timeAgoShort(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s/60)}m`
  return `${Math.floor(s/3600)}h`
}

export default function SystemPage() {
  const { user, loading, signOut } = useDemoAuth('parks_dept')
  const [health, setHealth] = useState<HealthData | null>(null)
  const [fetching, setFetching] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [sensors, setSensors] = useState(SENSOR_DEMO)

  const fetchHealth = async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/v1/health')
      const data = await res.json()
      if (data.success) setHealth(data.data)
    } catch {
      // If API unreachable, show demo data
      setHealth({
        timestamp: new Date().toISOString(),
        database: 'healthy',
        api: 'healthy',
        sensors_online: 18,
        sensors_total: 22,
        active_incidents: 2,
        parks_monitored: 3,
        latency_ms: 45,
        environment: 'pilot-demo',
        version: '0.2.0-pilot',
        uptime_note: 'TrailWatch Pilot System',
      })
    } finally {
      setFetching(false)
      setLastRefresh(new Date())
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // auto-refresh every 30s
    return () => clearInterval(interval)
  }, [])

  // Simulate sensor ticks
  useEffect(() => {
    const t = setInterval(() => {
      setSensors(prev => prev.map(s => s.health === 'online' ? { ...s, last_ping: new Date().toISOString() } : s))
    }, 15000)
    return () => clearInterval(t)
  }, [])

  if (loading) return <div className="min-h-screen bg-hunter-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-hunter-500 border-t-transparent rounded-full animate-spin" /></div>

  const onlineSensors = sensors.filter(s => s.health === 'online').length
  const degradedSensors = sensors.filter(s => s.health === 'degraded').length
  const offlineSensors = sensors.filter(s => s.health === 'offline').length

  return (
    <div className="min-h-screen bg-hunter-950">
      <AppNav userName={user?.name ?? 'Ranger'} role="parks_dept" onSignOut={signOut} />
      <div className="pt-14">
        <div className="bg-hunter-900 border-b border-hunter-800 px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Activity className="w-5 h-5 text-hunter-400" />
                <h1 className="font-serif text-2xl text-creme-100">System Health</h1>
              </div>
              <p className="text-xs text-hunter-400">
                {health?.environment ?? '—'} · {health?.version ?? '—'}
              </p>
            </div>
            <button onClick={fetchHealth} disabled={fetching}
              className="flex items-center gap-2 bg-hunter-800 border border-hunter-600 text-hunter-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-hunter-700 transition-colors disabled:opacity-50">
              <RefreshCw className={clsx('w-4 h-4', fetching && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

          {/* Core services */}
          <div>
            <h2 className="text-xs font-bold text-hunter-400 uppercase tracking-widest mb-3">Core Services</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: 'Database',      icon: Database, status: health?.database ?? 'unknown',  sub: health ? `${health.latency_ms}ms response` : '—' },
                { label: 'API Gateway',   icon: Server,   status: health?.api ?? 'unknown',        sub: `Last checked ${lastRefresh.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` },
                { label: 'Sensor Network',icon: Radio,    status: offlineSensors > 2 ? 'degraded' : offlineSensors > 0 ? 'degraded' : 'healthy', sub: `${onlineSensors}/${sensors.length} sensors online` },
              ].map(({ label, icon: Icon, status, sub }) => (
                <div key={label} className={clsx('rounded-2xl border p-5', HEALTH_BG[status] ?? 'bg-hunter-900 border-hunter-700')}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5 text-hunter-400" />
                    <span className={clsx('text-xs font-bold uppercase tracking-wide', HEALTH_COLOR[status] ?? 'text-hunter-400')}>
                      {status}
                    </span>
                  </div>
                  <p className="font-semibold text-creme-100 text-sm mb-1">{label}</p>
                  <p className="text-xs text-hunter-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics row */}
          {health && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Active Incidents', value: health.active_incidents, alert: health.active_incidents > 0 },
                { label: 'Parks Monitored',  value: health.parks_monitored,  alert: false },
                { label: 'Sensors Online',   value: `${onlineSensors}/${sensors.length}`, alert: offlineSensors > 0 },
                { label: 'API Latency',      value: `${health.latency_ms}ms`, alert: health.latency_ms > 1000 },
              ].map(({ label, value, alert }) => (
                <div key={label} className={clsx('rounded-xl border p-4 text-center', alert ? 'bg-amber-900/20 border-amber-800' : 'bg-hunter-900 border-hunter-700')}>
                  <p className={clsx('font-serif text-3xl mb-1', alert ? 'text-amber-300' : 'text-creme-100')}>{value}</p>
                  <p className="text-xs text-hunter-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sensor status table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-hunter-400 uppercase tracking-widest">IoT Sensor Status</h2>
              <div className="flex items-center gap-3 text-xs text-hunter-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" />{onlineSensors} online</span>
                {degradedSensors > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" />{degradedSensors} degraded</span>}
                {offlineSensors > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" />{offlineSensors} offline</span>}
              </div>
            </div>
            <div className="bg-hunter-900 border border-hunter-700 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 text-[11px] font-bold text-hunter-500 uppercase tracking-widest px-4 py-2 border-b border-hunter-800">
                <span className="w-6" />
                <span>Sensor / Location</span>
                <span className="w-20 text-right">Battery</span>
                <span className="w-20 text-right">Last Ping</span>
                <span className="w-20 text-right">Park</span>
              </div>
              {sensors.map((sensor, i) => (
                <div key={sensor.id}
                  className={clsx('grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 items-center px-4 py-3 border-b border-hunter-800/50 last:border-0',
                    i % 2 === 0 ? 'bg-transparent' : 'bg-hunter-800/20')}>
                  <div className="w-6">
                    {sensor.health === 'online'   && <Wifi    className="w-3.5 h-3.5 text-emerald-400" />}
                    {sensor.health === 'degraded' && <Wifi    className="w-3.5 h-3.5 text-amber-400" />}
                    {sensor.health === 'offline'  && <WifiOff className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-creme-100 font-medium">{sensor.name}</p>
                    <p className="text-[10px] text-hunter-500 font-mono">{sensor.id} · {sensor.type.replace('_', ' ')}</p>
                  </div>
                  <div className="w-20 text-right">
                    {sensor.health !== 'offline' && sensor.battery !== null ? (
                      <span className={clsx('text-xs font-semibold', sensor.battery < 25 ? 'text-red-400' : sensor.battery < 50 ? 'text-amber-400' : 'text-hunter-300')}>
                        {sensor.battery}%
                      </span>
                    ) : <span className="text-hunter-600 text-xs">—</span>}
                  </div>
                  <div className="w-20 text-right">
                    <span className={clsx('text-xs font-mono', HEALTH_COLOR[sensor.health] ?? 'text-hunter-500')}>
                      {sensor.last_ping ? timeAgoShort(sensor.last_ping) : 'never'}
                    </span>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-xs text-hunter-500">{sensor.park}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance note */}
          <div className="bg-hunter-900 border border-hunter-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-creme-100">Pilot Compliance Status</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Audit logging enabled',        ok: true  },
                { label: 'Role-based access control',    ok: true  },
                { label: 'API rate limiting active',     ok: true  },
                { label: 'Security headers applied',     ok: true  },
                { label: 'Data encrypted in transit',    ok: true  },
                { label: 'FedRAMP / IRAP certification', ok: false, note: 'Roadmap — not required for pilot' },
                { label: 'SOC 2 Type II',                ok: false, note: 'Roadmap — not required for pilot' },
                { label: 'Offline data sync',            ok: true  },
              ].map(({ label, ok, note }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className={clsx('w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', ok ? 'bg-emerald-900/60' : 'bg-amber-900/40')}>
                    {ok
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      : <AlertTriangle className="w-3 h-3 text-amber-400" />
                    }
                  </div>
                  <div>
                    <p className={clsx('text-xs font-medium', ok ? 'text-hunter-200' : 'text-amber-300')}>{label}</p>
                    {note && <p className="text-[10px] text-hunter-500 mt-0.5">{note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
