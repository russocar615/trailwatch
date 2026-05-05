'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDemoAuth } from '@/lib/demo-auth'
import AppNav from '@/components/AppNav'
import {
  WORLD_PARKS, WORLD_TRAILS, COUNTRY_NAMES, COUNTRY_FLAGS,
  CONTINENTS, getPlanItLinks,
  type WorldPark, type WorldTrail, type Continent, type Country,
} from '@/lib/world-parks'
import { HOURLY_DATA } from '@/lib/data'
import {
  Mountain, Car, Clock, Search, TrendingUp, MapPin, Zap, AlertTriangle,
  ChevronRight, X, Info, CheckCircle, Heart, Bookmark, Compass, Hotel,
  ShoppingBag, BookOpen, Sparkles, ArrowLeft, Globe, Filter,
  ExternalLink, Trash2, Check, Star
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import clsx from 'clsx'

type AppView  = 'explore' | 'favourites' | 'want-to-do' | 'plan-it'
type PlanType = 'tours' | 'stay' | 'gear'

// ── Persistence ───────────────────────────────────────────────────────────────
function loadSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(key) ?? '[]')) } catch { return new Set() }
}
function saveSet(key: string, s: Set<string>) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify([...s]))
}

// ── Style maps ────────────────────────────────────────────────────────────────
const DIFF: Record<string, string> = {
  Easy:     'bg-emerald-100 text-emerald-800',
  Moderate: 'bg-amber-100   text-amber-800',
  Hard:     'bg-red-100     text-red-800',
  Expert:   'bg-purple-100  text-purple-800',
}
const CROWD: Record<string, { label: string; color: string; ring: string; bar: string }> = {
  quiet:    { label: 'Quiet',     color: 'text-emerald-700', ring: 'bg-emerald-50 border-emerald-200', bar: '#2d6a4f' },
  moderate: { label: 'Moderate',  color: 'text-amber-700',   ring: 'bg-amber-50   border-amber-200',   bar: '#f59e0b' },
  busy:     { label: 'Busy',      color: 'text-orange-700',  ring: 'bg-orange-50  border-orange-200',  bar: '#f97316' },
  very_busy:{ label: 'Very Busy', color: 'text-red-700',     ring: 'bg-red-50     border-red-200',     bar: '#ef4444' },
}

// ── Plan It Link Card ─────────────────────────────────────────────────────────
function LinkCard({ href, label, sub, icon: Icon, color }: {
  href: string; label: string; sub: string; icon: React.ElementType; color: string
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={clsx('flex items-center gap-3 p-3.5 rounded-xl border-2 hover:shadow-md transition-all group', color)}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{label}</p>
        <p className="text-xs opacity-70 truncate">{sub}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 flex-shrink-0" />
    </a>
  )
}

// ── Plan It Panel ─────────────────────────────────────────────────────────────
function PlanItPanel({ trail, park, onClose }: { trail: WorldTrail; park: WorldPark; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<PlanType>('tours')
  const links = getPlanItLinks(park, trail)

  const TABS: { type: PlanType; icon: React.ElementType; label: string; emoji: string }[] = [
    { type: 'tours', icon: Compass,     label: 'Tours & Experiences', emoji: '🧭' },
    { type: 'stay',  icon: Hotel,       label: 'Places to Stay',      emoji: '🏕️' },
    { type: 'gear',  icon: ShoppingBag, label: 'Gear & Trail Info',   emoji: '🎒' },
  ]

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-hunter-900 px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold text-hunter-300 uppercase tracking-widest">Plan It</span>
            </div>
            <button onClick={onClose} className="w-7 h-7 bg-hunter-700 rounded-full flex items-center justify-center hover:bg-hunter-600 transition-colors">
              <X className="w-3.5 h-3.5 text-creme-200" />
            </button>
          </div>
          <h2 className="font-serif text-xl text-creme-100 leading-tight">{trail.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-hunter-300">{COUNTRY_FLAGS[park.country]} {park.name}</span>
            <span className="text-hunter-600 text-xs">·</span>
            <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', DIFF[trail.difficulty])}>{trail.difficulty}</span>
            <span className="text-hunter-600 text-xs">·</span>
            <span className="text-xs text-hunter-400">{trail.length_km} km · {trail.estimated_hours}h</span>
            {trail.permit_required && (
              <span className="text-xs bg-amber-900/40 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full font-semibold">Permit Required</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-creme-200 bg-creme-50 flex-shrink-0">
          {TABS.map(({ type, label, emoji }) => (
            <button key={type} onClick={() => setActiveTab(type)}
              className={clsx('flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-bold transition-colors',
                activeTab === type ? 'bg-white text-hunter-900 border-b-2 border-hunter-700' : 'text-hunter-500 hover:text-hunter-700')}>
              <span className="text-base">{emoji}</span>
              <span className="hidden sm:block">{label}</span>
              <span className="sm:hidden">{type === 'tours' ? 'Tours' : type === 'stay' ? 'Stay' : 'Gear'}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {activeTab === 'tours' && (
            <>
              <p className="text-xs text-hunter-500 mb-4">Find guided tours, walking experiences, and activities near <strong>{park.name}</strong>. These links open the booking platform in a new tab.</p>
              <LinkCard href={links.tours.viator} label="Search on Viator" sub="Tours, day trips & experiences" icon={Compass} color="border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400" />
              <LinkCard href={links.tours.getyourguide} label="GetYourGuide" sub="Activities & guided tours nearby" icon={Star} color="border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400" />
              <LinkCard href={links.tours.tripadvisor} label="TripAdvisor Experiences" sub="Traveller-reviewed activities" icon={Globe} color="border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-400" />
              <LinkCard href={links.tours.airbnbExp} label="Airbnb Experiences" sub="Local-led unique experiences" icon={Heart} color="border-red-200 bg-red-50 text-red-900 hover:border-red-400" />
              <div className="pt-2 border-t border-creme-200">
                <LinkCard href={links.officialSite} label="Official Park Website" sub={`Find ranger-led walks & park events at ${park.name}`} icon={Mountain} color="border-hunter-200 bg-hunter-50 text-hunter-900 hover:border-hunter-400" />
              </div>
            </>
          )}

          {activeTab === 'stay' && (
            <>
              <p className="text-xs text-hunter-500 mb-4">Find accommodation near <strong>{park.name}</strong> — from campsites to hotels. Links open the booking platform.</p>
              <LinkCard href={links.stay.bookingCom} label="Booking.com" sub="Hotels, cabins & guesthouses nearby" icon={Hotel} color="border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-400" />
              <LinkCard href={links.stay.airbnb} label="Airbnb" sub="Unique stays near the park" icon={Heart} color="border-red-200 bg-red-50 text-red-900 hover:border-red-400" />
              <LinkCard href={links.stay.hipcamp} label="Hipcamp" sub="Camping, glamping & farm stays" icon={Mountain} color="border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400" />
              <LinkCard href={links.stay.wildernessAccom} label="Search Camping & Huts" sub={`Huts, campgrounds & shelters near ${park.name}`} icon={MapPin} color="border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400" />
              {park.entry_fee_usd !== null && (
                <div className="bg-creme-50 border border-creme-200 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-hunter-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-hunter-600">
                    <strong>{park.name}</strong> charges a ~${park.entry_fee_usd} USD park entry fee.
                    Factor this into your trip budget. Some accommodation packages include entry.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'gear' && (
            <>
              <p className="text-xs text-hunter-500 mb-4">
                What to pack for a <strong>{trail.difficulty}</strong> trail ({trail.length_km} km, {trail.estimated_hours}h) in {park.name}.
              </p>

              {/* Quick kit summary by difficulty */}
              <div className="bg-creme-50 border border-creme-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-hunter-800 uppercase tracking-widest mb-3">Essential Kit — {trail.difficulty}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {(
                    trail.difficulty === 'Easy' ? [
                      '💧 1–2L water', '🥪 Snacks & lunch', '☀️ Sunscreen & hat',
                      '👟 Trail shoes', '📱 Offline map', '🩹 Small first aid kit',
                    ] : trail.difficulty === 'Moderate' ? [
                      '💧 2–3L water', '🥪 High-energy food', '🧥 Packable rain layer',
                      '🥾 Hiking boots', '🗺️ Navigation app', '🩹 First aid kit',
                      '☀️ Sunscreen & hat', '🔦 Headlamp', '🧦 Merino wool socks',
                    ] : trail.difficulty === 'Hard' ? [
                      '💧 3–4L water capacity', '🍫 High-calorie snacks', '🧥 Insulation layer',
                      '🥾 Supportive boots', '📡 Personal locator beacon', '🩹 Extended first aid',
                      '⛺ Emergency bivvy', '🔦 Headlamp + spare', '🧣 Hat & gloves',
                      '🗺️ Topo map + compass', '📋 Permit (if required)', '🌡️ Weather forecast',
                    ] : [
                      '💧 4L+ water or filter', '🍫 3000+ cal food supply', '⛺ Tent & sleeping bag',
                      '🥾 Technical mountaineering boots', '📡 Sat phone / PLB', '🧗 Harness & rope',
                      '🩹 Wilderness first aid kit', '⛏️ Ice axe / crampons', '🗺️ GPS device',
                      '🌡️ Multi-day weather window', '📋 All permits secured', '🏔️ Acclimatisation plan',
                    ]
                  ).map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-hunter-700">
                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {trail.permit_required && (
                  <div className="mt-3 pt-3 border-t border-creme-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-800 font-semibold">Permit required — book well in advance. Check the official park website.</p>
                  </div>
                )}
              </div>

              <p className="text-xs font-bold text-hunter-700 uppercase tracking-widest mt-2 mb-2">Buy or Hire Gear Online</p>
              <LinkCard href={links.gear.alltrails} label="AllTrails — Trail Reviews & Conditions" sub={`Real hiker reviews for ${trail.name}`} icon={Mountain} color="border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400" />
              <LinkCard href={links.gear.rei} label="REI — Outdoor Gear" sub="Hiking boots, packs, layers & more" icon={ShoppingBag} color="border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-400" />
              <LinkCard href={links.gear.anaconda} label="Anaconda — Outdoor Gear (AU/NZ)" sub="Australia's largest outdoor retailer" icon={ShoppingBag} color="border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400" />
              <LinkCard href={links.gear.trailInfo} label="Google — What to Bring" sub={`Search: ${trail.name} gear list`} icon={Search} color="border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-400" />
            </>
          )}

          <div className="pt-3 border-t border-creme-200 grid grid-cols-2 gap-2">
            <LinkCard href={links.directions} label="Directions" sub="Open in Google Maps" icon={MapPin} color="border-creme-200 bg-white text-hunter-700 hover:border-hunter-300" />
            <LinkCard href={links.alltrails} label="AllTrails" sub="Trail map & reviews" icon={TrendingUp} color="border-creme-200 bg-white text-hunter-700 hover:border-hunter-300" />
          </div>

          <p className="text-[11px] text-hunter-400 text-center pt-1">Links open external booking platforms. TrailWatch is not affiliated with these services.</p>
        </div>
      </div>
    </div>
  )
}

// ── Trail Detail Modal ────────────────────────────────────────────────────────
function TrailModal({ trail, park, isFav, isWantTo, onToggleFav, onToggleWantTo, onPlanIt, onClose }: {
  trail: WorldTrail; park: WorldPark; isFav: boolean; isWantTo: boolean
  onToggleFav: () => void; onToggleWantTo: () => void; onPlanIt: () => void; onClose: () => void
}) {
  const crowd = CROWD[trail.crowd_level] || CROWD.moderate
  const p     = Math.round((trail.current_hikers / trail.max_capacity) * 100)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const links = getPlanItLinks(park, trail)

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>

        <div className="bg-hunter-800 px-6 py-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex gap-2 flex-wrap">
              {trail.status !== 'closed'
                ? <span className={clsx('text-xs px-2.5 py-1 rounded-full border font-semibold', crowd.ring, crowd.color)}>{crowd.label}</span>
                : <span className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 font-medium">CLOSED</span>}
              {trail.is_accessible && <span className="text-xs px-2 py-1 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700">♿</span>}
              {trail.permit_required && <span className="text-xs px-2 py-1 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700">Permit</span>}
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-hunter-700 rounded-full flex items-center justify-center hover:bg-hunter-600 transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-creme-200" />
            </button>
          </div>
          <h2 className="font-serif text-2xl text-creme-100 mb-0.5">{trail.name}</h2>
          <p className="text-xs text-hunter-300">{COUNTRY_FLAGS[park.country]} {park.name} · {park.state_region}</p>
        </div>

        <div className="grid grid-cols-4 border-b border-creme-200 bg-white">
          {[
            { label: 'Distance',  value: `${trail.length_km} km` },
            { label: '+Elev',     value: `${trail.elevation_gain_m}m` },
            { label: 'Time',      value: trail.estimated_hours >= 24 ? `${Math.round(trail.estimated_hours/24)}d` : `${trail.estimated_hours}h` },
            { label: 'Grade',     value: trail.difficulty },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 text-center border-r border-creme-200 last:border-r-0">
              <p className="text-[10px] text-hunter-400 mb-1">{label}</p>
              <p className={clsx('font-bold text-xs', label === 'Grade' ? DIFF[trail.difficulty] + ' px-1.5 py-0.5 rounded text-[11px]' : 'text-hunter-900')}>{value}</p>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-hunter-600 leading-relaxed">{trail.description}</p>

          {trail.status !== 'closed' && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-hunter-600 font-medium">Current Crowd</span>
                <span className={clsx('font-bold', crowd.color)}>{trail.current_hikers}/{trail.max_capacity}</span>
              </div>
              <div className="h-2.5 bg-creme-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${p}%`, background: p > 80 ? '#ef4444' : p > 50 ? '#f59e0b' : '#2d6a4f' }} />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {trail.features.map(f => (
              <span key={f} className="text-xs bg-creme-50 border border-creme-200 text-hunter-700 px-3 py-1.5 rounded-xl font-medium">{f}</span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button onClick={onToggleFav}
              className={clsx('flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all',
                isFav ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-creme-300 text-hunter-700 hover:border-hunter-400')}>
              <Heart className={clsx('w-4 h-4', isFav && 'fill-red-500 text-red-500')} />
              {isFav ? 'Saved!' : 'Favourite'}
            </button>
            <button onClick={onToggleWantTo}
              className={clsx('flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all',
                isWantTo ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-white border-creme-300 text-hunter-700 hover:border-hunter-400')}>
              <Bookmark className={clsx('w-4 h-4', isWantTo && 'fill-amber-500 text-amber-500')} />
              {isWantTo ? 'On List!' : 'Want to Do'}
            </button>
          </div>
          <button onClick={onPlanIt}
            className="w-full flex items-center justify-center gap-2.5 bg-hunter-800 hover:bg-hunter-700 text-creme-50 py-4 rounded-2xl text-sm font-bold transition-colors">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Plan It — Tours, Accommodation &amp; Gear
          </button>
          <div className="grid grid-cols-2 gap-2">
            <a href={links.alltrails} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 border border-creme-300 rounded-xl text-xs font-semibold text-hunter-600 hover:border-hunter-400 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> AllTrails
            </a>
            <a href={links.directions} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 border border-creme-300 rounded-xl text-xs font-semibold text-hunter-600 hover:border-hunter-400 transition-colors">
              <MapPin className="w-3.5 h-3.5" /> Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Trail Card ────────────────────────────────────────────────────────────────
function TrailCard({ trail, park, isFav, isWantTo, onClick }: {
  trail: WorldTrail; park: WorldPark; isFav: boolean; isWantTo: boolean; onClick: () => void
}) {
  const crowd = CROWD[trail.crowd_level] || CROWD.moderate
  const p     = Math.round((trail.current_hikers / trail.max_capacity) * 100)
  return (
    <button onClick={onClick}
      className={clsx('w-full text-left rounded-2xl border-2 p-4 transition-all hover:shadow-md relative group',
        trail.status === 'closed' ? 'bg-gray-50 border-gray-200 opacity-80' : 'bg-white border-creme-200 hover:border-hunter-400')}>
      <div className="absolute top-3 right-3 flex gap-1.5 z-10">
        {isFav    && <Heart    className="w-3.5 h-3.5 fill-red-400   text-red-400"   />}
        {isWantTo && <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
      </div>
      <div className="pr-10 mb-2">
        <p className="font-bold text-hunter-900 text-sm mb-1">{trail.name}</p>
        <p className="text-[10px] text-hunter-400 mb-1.5">{COUNTRY_FLAGS[park.country]} {park.name}</p>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {trail.status === 'closed'
            ? <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold">CLOSED</span>
            : <span className={clsx('px-2 py-0.5 rounded-full border font-semibold', crowd.ring, crowd.color)}>{crowd.label}</span>}
          <span className={clsx('px-1.5 py-0.5 rounded font-bold text-[11px]', DIFF[trail.difficulty])}>{trail.difficulty}</span>
          <span className="text-hunter-400">{trail.length_km} km</span>
          <span className="text-hunter-400 flex items-center gap-0.5"><Clock className="w-3 h-3" />{trail.estimated_hours >= 24 ? `${Math.round(trail.estimated_hours/24)}d` : `${trail.estimated_hours}h`}</span>
        </div>
      </div>
      {trail.status !== 'closed' && (
        <div>
          <div className="flex justify-between text-xs text-hunter-400 mb-1">
            <span>{trail.current_hikers} hikers</span>
            <span>{p}%</span>
          </div>
          <div className="h-1.5 bg-creme-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${p}%`, background: p > 80 ? '#ef4444' : p > 50 ? '#f59e0b' : '#2d6a4f' }} />
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1 mt-2">
        {trail.features.slice(0, 3).map(f => (
          <span key={f} className="text-[10px] bg-creme-100 text-hunter-500 px-1.5 py-0.5 rounded">{f}</span>
        ))}
        {trail.permit_required && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">Permit</span>}
      </div>
      <ChevronRight className="absolute bottom-3 right-3 w-4 h-4 text-hunter-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

// ── Global Search Panel ───────────────────────────────────────────────────────
function GlobalSearchPanel({ onSelectPark, onSelectTrail, onClose }: {
  onSelectPark: (p: WorldPark) => void
  onSelectTrail: (t: WorldTrail, p: WorldPark) => void
  onClose: () => void
}) {
  const [q,          setQ]          = useState('')
  const [continent,  setContinent]  = useState<Continent | 'all'>('all')
  const [country,    setCountry]    = useState<Country | 'all'>('all')
  // Type narrowing helpers
  const isContinentAll = continent === 'all'
  const isCountryAll   = country   === 'all'
  const [mode,       setMode]       = useState<'parks' | 'trails'>('parks')

  const allCountries = useMemo(() =>
    Array.from(new Set(WORLD_PARKS.map(p => p.country))).sort() as Country[],
    []
  )

  const filteredParks = useMemo(() => {
    const lq = q.toLowerCase()
    return WORLD_PARKS.filter(p =>
      (continent === 'all' || p.continent === continent) &&
      (country   === 'all' || p.country   === country)   &&
      (q === '' || p.name.toLowerCase().includes(lq) ||
        p.state_region.toLowerCase().includes(lq) ||
        p.description.toLowerCase().includes(lq) ||
        p.tags.some(t => t.toLowerCase().includes(lq)))
    )
  }, [q, continent, country])

  const filteredTrails = useMemo(() => {
    const lq = q.toLowerCase()
    return WORLD_TRAILS.filter(t => {
      const park = WORLD_PARKS.find(p => p.id === t.parkId)!
      return (continent === 'all' || park.continent === continent) &&
             (country   === 'all' || park.country   === country)   &&
             (q === '' || t.name.toLowerCase().includes(lq) ||
               t.features.some(f => f.toLowerCase().includes(lq)) ||
               t.description.toLowerCase().includes(lq) ||
               park.name.toLowerCase().includes(lq))
    })
  }, [q, continent, country])

  const continentCounts = useMemo(() =>
    Object.fromEntries(CONTINENTS.map(c => [c, WORLD_PARKS.filter(p => p.continent === c).length])),
    []
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-16" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Search header */}
        <div className="bg-hunter-900 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-hunter-400 flex-shrink-0" />
            <h2 className="font-serif text-xl text-creme-100">Search World Parks</h2>
            <button onClick={onClose} className="ml-auto w-7 h-7 bg-hunter-700 rounded-full flex items-center justify-center hover:bg-hunter-600 transition-colors">
              <X className="w-3.5 h-3.5 text-creme-200" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hunter-400" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search parks, trails, features, regions…"
              className="w-full pl-9 pr-4 py-2.5 bg-hunter-800 border border-hunter-600 text-creme-100 placeholder-hunter-500 rounded-xl text-sm focus:outline-none focus:border-hunter-400 transition-colors" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-creme-50 border-b border-creme-200 px-5 py-3 flex-shrink-0 space-y-2">
          {/* Parks / Trails toggle */}
          <div className="flex gap-2">
            <button onClick={() => setMode('parks')}
              className={clsx('px-4 py-1.5 rounded-xl text-xs font-bold transition-colors',
                mode === 'parks' ? 'bg-hunter-700 text-creme-50' : 'bg-white border border-creme-300 text-hunter-600 hover:border-hunter-400')}>
              🏔️ Parks ({filteredParks.length})
            </button>
            <button onClick={() => setMode('trails')}
              className={clsx('px-4 py-1.5 rounded-xl text-xs font-bold transition-colors',
                mode === 'trails' ? 'bg-hunter-700 text-creme-50' : 'bg-white border border-creme-300 text-hunter-600 hover:border-hunter-400')}>
              🥾 Trails ({filteredTrails.length})
            </button>
          </div>

          {/* Continent chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            <button onClick={() => { setContinent('all'); setCountry('all') }}
              className={clsx('px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0',
                continent === 'all' ? 'bg-hunter-700 text-creme-50' : 'bg-white border border-creme-300 text-hunter-600 hover:border-hunter-400')}>
              🌍 All ({WORLD_PARKS.length})
            </button>
            {CONTINENTS.map(c => continentCounts[c] > 0 && (
              <button key={c} onClick={() => { setContinent(c); setCountry('all') }}
                className={clsx('px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0',
                  continent === c ? 'bg-hunter-700 text-creme-50' : 'bg-white border border-creme-300 text-hunter-600 hover:border-hunter-400')}>
                {c} ({continentCounts[c]})
              </button>
            ))}
          </div>

          {/* Country filter */}
          {continent !== 'all' && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <button onClick={() => setCountry('all')}
                className={clsx('px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0',
                  country === 'all' ? 'bg-hunter-600 text-creme-50' : 'bg-white border border-creme-200 text-hunter-500 hover:border-hunter-300')}>
                All Countries
              </button>
              {allCountries
                .filter(c => WORLD_PARKS.some(p => p.country === c && (continent === 'all' || p.continent === continent)))
                .map(c => (
                  <button key={c} onClick={() => setCountry(c)}
                    className={clsx('px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0',
                      country === c ? 'bg-hunter-600 text-creme-50' : 'bg-white border border-creme-200 text-hunter-500 hover:border-hunter-300')}>
                    {COUNTRY_FLAGS[c]} {COUNTRY_NAMES[c]}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'parks' && (
            filteredParks.length === 0 ? (
              <p className="text-center text-hunter-400 text-sm py-12">No parks match your search.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredParks.map(park => (
                  <button key={park.id} onClick={() => { onSelectPark(park); onClose() }}
                    className="flex items-start gap-3 bg-white border-2 border-creme-200 hover:border-hunter-400 rounded-2xl p-3.5 text-left transition-all hover:shadow-sm group">
                    <img src={park.image} alt={park.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm">{COUNTRY_FLAGS[park.country]}</span>
                        <p className="font-bold text-hunter-900 text-sm truncate">{park.name}</p>
                      </div>
                      <p className="text-xs text-hunter-500 mb-1">{park.state_region} · Est. {park.established_year}</p>
                      <div className="flex flex-wrap gap-1">
                        {park.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] bg-creme-100 text-hunter-500 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-hunter-300 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            )
          )}

          {mode === 'trails' && (
            filteredTrails.length === 0 ? (
              <p className="text-center text-hunter-400 text-sm py-12">No trails match your search.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredTrails.map(trail => {
                  const park = WORLD_PARKS.find(p => p.id === trail.parkId)!
                  return (
                    <button key={trail.id} onClick={() => { onSelectTrail(trail, park); onClose() }}
                      className="flex items-start gap-3 bg-white border-2 border-creme-200 hover:border-hunter-400 rounded-2xl p-3.5 text-left transition-all hover:shadow-sm group">
                      <div className="w-9 h-9 bg-creme-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mountain className="w-4 h-4 text-hunter-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-hunter-900 text-sm truncate mb-0.5">{trail.name}</p>
                        <p className="text-[10px] text-hunter-400 mb-1">{COUNTRY_FLAGS[park.country]} {park.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={clsx('text-[11px] px-1.5 py-0.5 rounded font-bold', DIFF[trail.difficulty])}>{trail.difficulty}</span>
                          <span className="text-[10px] text-hunter-400">{trail.length_km} km</span>
                          {trail.permit_required && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">Permit</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-hunter-300 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1" />
                    </button>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, body, cta, onCta }: {
  icon: React.ElementType; title: string; body: string; cta?: string; onCta?: () => void
}) {
  return (
    <div className="text-center py-14 px-4">
      <div className="w-16 h-16 bg-creme-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-hunter-400" />
      </div>
      <h3 className="font-serif text-xl text-hunter-800 mb-2">{title}</h3>
      <p className="text-sm text-hunter-500 max-w-xs mx-auto leading-relaxed">{body}</p>
      {cta && onCta && (
        <button onClick={onCta}
          className="mt-5 inline-flex items-center gap-2 bg-hunter-700 text-creme-50 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-hunter-600 transition-colors">
          {cta}
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HikerDashboard() {
  const { user, loading, signOut } = useDemoAuth('hiker')

  const [selectedPark, setSelectedPark] = useState<WorldPark>(WORLD_PARKS[0])
  const [search,       setSearch]       = useState('')
  const [diffFilter,   setDiffFilter]   = useState('All')
  const [parkTab,      setParkTab]      = useState<'trails' | 'forecast'>('trails')
  const [view,         setView]         = useState<AppView>('explore')
  const [modalTrail,   setModalTrail]   = useState<WorldTrail | null>(null)
  const [planTrail,    setPlanTrail]    = useState<WorldTrail | null>(null)
  const [showSearch,   setShowSearch]   = useState(false)

  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const [wantToDo,   setWantToDo]   = useState<Set<string>>(new Set())

  useEffect(() => {
    setFavourites(loadSet('tw_favourites'))
    setWantToDo(loadSet('tw_wanttodo'))
  }, [])

  const toggleFav = useCallback((id: string) => {
    setFavourites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); saveSet('tw_favourites', n); return n })
  }, [])
  const toggleWantTo = useCallback((id: string) => {
    setWantToDo(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); saveSet('tw_wanttodo', n); return n })
  }, [])
  const openPlanIt = useCallback((trail: WorldTrail) => {
    setModalTrail(null); setPlanTrail(trail)
  }, [])

  const parkTrails = useMemo(() => WORLD_TRAILS.filter(t => t.parkId === selectedPark.id), [selectedPark])
  const filtered   = useMemo(() => parkTrails.filter(t =>
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.features.some(f => f.toLowerCase().includes(search.toLowerCase()))) &&
    (diffFilter === 'All' || t.difficulty === diffFilter)
  ), [parkTrails, search, diffFilter])

  const favTrails  = useMemo(() => WORLD_TRAILS.filter(t => favourites.has(t.id)), [favourites])
  const wantTrails = useMemo(() => WORLD_TRAILS.filter(t => wantToDo.has(t.id)),   [wantToDo])

  const hour     = new Date().getHours()
  const bestTime = hour < 10 ? 'Now is great — low crowds!' : hour < 14 ? 'Peak time — consider going after 4pm.' : 'Crowds thinning — good timing.'

  if (loading) return (
    <div className="min-h-screen bg-creme-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-hunter-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-creme-50">
      <AppNav userName={user?.name || 'Explorer'} role="hiker" onSignOut={signOut} />

      {/* Modals */}
      {showSearch && (
        <GlobalSearchPanel
          onSelectPark={p => { setSelectedPark(p); setView('explore') }}
          onSelectTrail={(t, p) => { setSelectedPark(p); setModalTrail(t); setView('explore') }}
          onClose={() => setShowSearch(false)}
        />
      )}
      {modalTrail && !planTrail && (
        <TrailModal
          trail={modalTrail}
          park={WORLD_PARKS.find(p => p.id === modalTrail.parkId) || WORLD_PARKS[0]}
          isFav={favourites.has(modalTrail.id)}
          isWantTo={wantToDo.has(modalTrail.id)}
          onToggleFav={() => toggleFav(modalTrail.id)}
          onToggleWantTo={() => toggleWantTo(modalTrail.id)}
          onPlanIt={() => openPlanIt(modalTrail)}
          onClose={() => setModalTrail(null)}
        />
      )}
      {planTrail && (
        <PlanItPanel
          trail={planTrail}
          park={WORLD_PARKS.find(p => p.id === planTrail.parkId) || WORLD_PARKS[0]}
          onClose={() => setPlanTrail(null)}
        />
      )}

      <div className="pt-14">
        {/* Welcome strip */}
        <div className="bg-hunter-700 px-4 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-hunter-300 text-xs mb-0.5">Welcome back,</p>
              <h1 className="font-serif text-xl text-creme-100">{user?.name || 'Explorer'} 🥾</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-hunter-600/50 border border-hunter-500 rounded-xl px-3 py-2">
                <Zap className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <p className="text-creme-100 text-xs font-medium">{bestTime}</p>
              </div>
              <button onClick={() => setShowSearch(true)}
                className="flex items-center gap-1.5 bg-creme-50 text-hunter-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white transition-colors shadow-sm">
                <Globe className="w-3.5 h-3.5" />
                World Parks
              </button>
            </div>
          </div>
        </div>

        {/* View nav */}
        <div className="bg-white border-b border-creme-200 sticky top-14 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 py-2 overflow-x-auto">
            {([
              { key: 'explore',    emoji: '🗺️', label: 'Explore'   },
              { key: 'favourites', emoji: '❤️', label: `Favourites${favTrails.length  > 0 ? ` (${favTrails.length})`  : ''}` },
              { key: 'want-to-do', emoji: '🔖', label: `Want to Do${wantTrails.length > 0 ? ` (${wantTrails.length})` : ''}` },
              { key: 'plan-it',    emoji: '✨', label: 'Plan It'   },
            ] as const).map(({ key, emoji, label }) => (
              <button key={key} onClick={() => setView(key)}
                className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
                  view === key ? 'bg-hunter-700 text-creme-50' : 'text-hunter-600 hover:bg-creme-100')}>
                <span>{emoji}</span>{label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* ══ EXPLORE ══════════════════════════════════════════════════════ */}
          {view === 'explore' && (
            <>
              {/* Park selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl text-hunter-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-hunter-600" /> Current Park
                  </h2>
                  <button onClick={() => setShowSearch(true)}
                    className="flex items-center gap-2 text-xs font-bold text-hunter-600 border border-creme-300 px-3 py-2 rounded-xl hover:border-hunter-400 hover:bg-creme-50 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Change Park ({WORLD_PARKS.length} worldwide)
                  </button>
                </div>

                {/* Selected park card */}
                <div className="bg-white border border-creme-200 rounded-2xl overflow-hidden">
                  <div className="relative h-36 overflow-hidden">
                    <img src={selectedPark.image} alt={selectedPark.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="font-serif text-lg text-white leading-tight">{selectedPark.name}</h3>
                        <p className="text-xs text-white/80">{COUNTRY_FLAGS[selectedPark.country]} {selectedPark.state_region} · {selectedPark.agency}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {selectedPark.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] bg-black/40 backdrop-blur text-white px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 divide-x divide-creme-200 border-t border-creme-200">
                    {[
                      { label: 'Trails',   value: WORLD_TRAILS.filter(t => t.parkId === selectedPark.id).length },
                      { label: 'Est.',     value: selectedPark.established_year },
                      { label: 'Area',     value: `${(selectedPark.total_area_ha/1000).toFixed(0)}k ha` },
                      { label: 'Entry',    value: selectedPark.entry_fee_usd !== null ? `$${selectedPark.entry_fee_usd}` : 'Free' },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-2.5 text-center">
                        <p className="text-[10px] text-hunter-400">{label}</p>
                        <p className="text-xs font-bold text-hunter-900 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Park detail tabs */}
              <div className="bg-white rounded-3xl border border-creme-200 overflow-hidden shadow-sm">
                <div className="border-b border-creme-200 px-5 flex gap-1 pt-3">
                  {(['trails', 'forecast'] as const).map(t => (
                    <button key={t} onClick={() => setParkTab(t)}
                      className={clsx('px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors',
                        parkTab === t ? 'bg-hunter-700 text-creme-50' : 'text-hunter-500 hover:text-hunter-800')}>
                      {t === 'trails' ? '🥾 Trails' : '📈 Forecast'}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {parkTab === 'trails' && (
                    <>
                      <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hunter-400" />
                          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trails or features…"
                            className="w-full pl-9 pr-4 py-2.5 bg-creme-50 border border-creme-200 rounded-xl text-sm text-hunter-800 placeholder-hunter-400 focus:outline-none focus:border-hunter-500 transition-colors" />
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {['All', 'Easy', 'Moderate', 'Hard', 'Expert'].map(d => (
                            <button key={d} onClick={() => setDiffFilter(d)}
                              className={clsx('px-2.5 py-2 rounded-xl text-xs font-bold transition-colors',
                                diffFilter === d ? 'bg-hunter-700 text-creme-50' : 'bg-creme-100 text-hunter-600 hover:bg-creme-200')}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                          { label: 'Open Trails',  value: parkTrails.filter(t => t.status === 'open').length },
                          { label: 'On Trail Now',  value: parkTrails.reduce((s, t) => s + t.current_hikers, 0) },
                          { label: 'Quiet Now',     value: parkTrails.filter(t => t.crowd_level === 'quiet' && t.status === 'open').length },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-creme-50 border border-creme-200 rounded-xl p-3 text-center">
                            <p className="font-serif text-2xl text-hunter-900">{value}</p>
                            <p className="text-xs text-hunter-500 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {filtered.length > 0
                          ? filtered.map(t => (
                              <TrailCard key={t.id} trail={t}
                                park={WORLD_PARKS.find(p => p.id === t.parkId) || WORLD_PARKS[0]}
                                isFav={favourites.has(t.id)} isWantTo={wantToDo.has(t.id)}
                                onClick={() => setModalTrail(t)} />
                            ))
                          : <p className="col-span-2 text-center text-hunter-400 text-sm py-10">No trails match.</p>}
                      </div>
                    </>
                  )}

                  {parkTab === 'forecast' && (
                    <div>
                      <h3 className="font-bold text-hunter-900 mb-1 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-hunter-600" /> Crowd Forecast — Today
                      </h3>
                      <p className="text-xs text-hunter-500 mb-5">Typical visitor pattern for {selectedPark.name}</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={HOURLY_DATA} barSize={22} margin={{ left: -10 }}>
                          <XAxis dataKey="hour" tick={{ fill: '#5a7a65', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#5a7a65', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: '#faf7ed', border: '1px solid #bcd5c0', borderRadius: 8, color: '#1a3a2a', fontSize: 12 }} />
                          <Bar dataKey="hikers" radius={[4, 4, 0, 0]}>
                            {HOURLY_DATA.map((e, i) => (
                              <Cell key={i} fill={e.hikers > 200 ? '#ef4444' : e.hikers > 150 ? '#f59e0b' : '#2d6a4f'} fillOpacity={0.9} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-5 p-3 bg-creme-50 border border-creme-200 rounded-xl">
                        <p className="text-xs text-hunter-600"><strong>Best time to visit {selectedPark.name}:</strong> {selectedPark.best_months}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ FAVOURITES ════════════════════════════════════════════════════ */}
          {view === 'favourites' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-hunter-900">My Favourites</h2>
                  <p className="text-xs text-hunter-500 mt-0.5">{favTrails.length} trail{favTrails.length !== 1 ? 's' : ''} saved</p>
                </div>
              </div>
              {favTrails.length === 0
                ? <EmptyState icon={Heart} title="No favourites yet" body="Open any trail and tap Favourite to save it here." cta="Browse Parks" onCta={() => setView('explore')} />
                : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favTrails.map(t => (
                      <TrailCard key={t.id} trail={t}
                        park={WORLD_PARKS.find(p => p.id === t.parkId) || WORLD_PARKS[0]}
                        isFav={favourites.has(t.id)} isWantTo={wantToDo.has(t.id)}
                        onClick={() => setModalTrail(t)} />
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* ══ WANT TO DO ════════════════════════════════════════════════════ */}
          {view === 'want-to-do' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-hunter-900">Want to Do</h2>
                  <p className="text-xs text-hunter-500 mt-0.5">{wantTrails.length} hike{wantTrails.length !== 1 ? 's' : ''} on your list</p>
                </div>
              </div>
              {wantTrails.length === 0
                ? <EmptyState icon={Bookmark} title="Your list is empty" body="Add hikes you want to do, then use Plan It to research tours, places to stay, and what gear you'll need." cta="Browse Parks" onCta={() => setView('explore')} />
                : (
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {wantTrails.map(t => (
                        <div key={t.id} className="flex flex-col gap-1.5">
                          <TrailCard trail={t}
                            park={WORLD_PARKS.find(p => p.id === t.parkId) || WORLD_PARKS[0]}
                            isFav={favourites.has(t.id)} isWantTo={wantToDo.has(t.id)}
                            onClick={() => setModalTrail(t)} />
                          <button onClick={() => openPlanIt(t)}
                            className="flex items-center justify-center gap-2 bg-hunter-800 hover:bg-hunter-700 text-creme-50 py-2.5 rounded-xl text-xs font-bold transition-colors">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Plan It
                          </button>
                          <button onClick={() => toggleWantTo(t.id)}
                            className="flex items-center justify-center gap-1.5 text-hunter-400 hover:text-red-500 text-xs py-1 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-hunter-800 to-hunter-700 rounded-2xl p-5 flex items-start gap-4">
                      <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-creme-100 mb-1">Ready to plan?</p>
                        <p className="text-xs text-hunter-300 leading-relaxed">Tap <strong className="text-creme-200">Plan It</strong> on any hike to search for guided tours, nearby accommodation, and a gear checklist for that specific trail — all linked to real booking sites.</p>
                      </div>
                    </div>
                  </>
                )}
            </div>
          )}

          {/* ══ PLAN IT HUB ══════════════════════════════════════════════════ */}
          {view === 'plan-it' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-hunter-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-hunter-700" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-hunter-900">Plan It</h2>
                  <p className="text-xs text-hunter-500 mt-0.5">Find tours, accommodation & gear for any trail in the world</p>
                </div>
              </div>

              <div className="bg-white border border-creme-200 rounded-2xl p-5 mb-6">
                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { icon: Compass,     label: '🧭 Find Tours',        sub: 'Viator, GetYourGuide, Airbnb Experiences' },
                    { icon: Hotel,       label: '🏕️ Places to Stay',    sub: 'Booking.com, Airbnb, Hipcamp' },
                    { icon: ShoppingBag, label: '🎒 Gear & Trail Info',  sub: 'Kit list + REI, AllTrails, Anaconda' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-start gap-3 p-3 bg-creme-50 border border-creme-100 rounded-xl">
                      <Icon className="w-4 h-4 text-hunter-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-hunter-900">{label}</p>
                        <p className="text-[11px] text-hunter-500 mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowSearch(true)}
                  className="w-full flex items-center justify-center gap-2 bg-hunter-700 hover:bg-hunter-600 text-creme-50 py-3 rounded-xl text-sm font-bold transition-colors">
                  <Globe className="w-4 h-4" /> Search All {WORLD_PARKS.length} Parks &amp; {WORLD_TRAILS.length} Trails
                </button>
              </div>

              {/* Trails by park - grouped */}
              {WORLD_PARKS.map(park => {
                const pts = WORLD_TRAILS.filter(t => t.parkId === park.id)
                if (pts.length === 0) return null
                return (
                  <div key={park.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span>{COUNTRY_FLAGS[park.country]}</span>
                      <h3 className="font-bold text-hunter-800 text-sm">{park.name}</h3>
                      <span className="text-xs text-hunter-400">{park.state_region}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {pts.map(t => (
                        <button key={t.id} onClick={() => openPlanIt(t)}
                          className="flex items-center justify-between gap-3 bg-white border-2 border-creme-200 hover:border-hunter-400 rounded-xl p-3 text-left transition-all hover:shadow-sm group">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-hunter-900 text-sm truncate">{t.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-hunter-400 flex-wrap">
                              <span className={clsx('px-1.5 py-0.5 rounded font-bold text-[11px]', DIFF[t.difficulty])}>{t.difficulty}</span>
                              <span>{t.length_km} km</span>
                              <span>{t.estimated_hours >= 24 ? `${Math.round(t.estimated_hours/24)}d` : `${t.estimated_hours}h`}</span>
                              {t.permit_required && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Permit</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 bg-hunter-100 group-hover:bg-hunter-200 text-hunter-700 px-3 py-1.5 rounded-xl transition-colors">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">Plan</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
