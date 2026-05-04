'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, TrendingUp, Bell, Shield, ChevronRight, Mountain, Car, Users, Activity } from 'lucide-react'

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('tw_demo_user')
    if (stored) setRole(JSON.parse(stored).role)
  }, [])

  const dashboardHref = role === 'parks_dept' ? '/ranger' : '/hiker'
  const isLoggedIn = !!role && mounted

  return (
    <div className="min-h-screen bg-creme-50 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-creme-50/90 backdrop-blur-md border-b border-creme-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-hunter-600 rounded-lg flex items-center justify-center">
              <Mountain className="w-4 h-4 text-creme-50" />
            </div>
            <span className="font-serif text-xl text-hunter-800">TrailWatch</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href={dashboardHref}
                className="bg-hunter-600 text-creme-50 px-5 py-2 rounded-lg text-sm font-medium hover:bg-hunter-700 transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-hunter-700 text-sm font-medium hover:text-hunter-900 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup"
                  className="bg-hunter-600 text-creme-50 px-5 py-2 rounded-lg text-sm font-medium hover:bg-hunter-700 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-hunter-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-creme-300 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-hunter-100 text-hunter-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Activity className="w-4 h-4" />
              Live park monitoring — real time
            </div>
            <h1 className="font-serif text-6xl md:text-7xl text-hunter-900 leading-tight mb-6">
              Know your park,<br />
              <span className="text-hunter-600 italic">before you go.</span>
            </h1>
            <p className="text-xl text-hunter-700 leading-relaxed mb-10 max-w-2xl">
              TrailWatch delivers real-time trail occupancy, parking availability, and crowd forecasts to hikers — while giving rangers a powerful operations dashboard.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={isLoggedIn ? dashboardHref : '/auth/signup'}
                className="inline-flex items-center gap-2 bg-hunter-600 text-creme-50 px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-hunter-700 transition-all hover:shadow-lg hover:shadow-hunter-200">
                {isLoggedIn ? 'Open Dashboard' : 'Start Hiking Smarter'}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center gap-2 bg-creme-100 text-hunter-800 border border-creme-300 px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-creme-200 transition-colors">
                Ranger Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-hunter-800 text-creme-100 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Mountain, value: '63+',    label: 'Parks Monitored' },
            { icon: Users,    value: '2.4M',   label: 'Hiker Alerts Sent' },
            { icon: Car,      value: '12,000+',label: 'Parking Spaces Tracked' },
            { icon: Activity, value: '99.5%',  label: 'Sensor Uptime' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="w-6 h-6 text-hunter-300 mx-auto mb-2" />
              <div className="font-serif text-4xl text-creme-50 mb-1">{value}</div>
              <div className="text-sm text-hunter-300">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl text-hunter-900 mb-4">Two apps, one platform</h2>
            <p className="text-hunter-600 text-lg max-w-xl mx-auto">Built for the rangers who protect the parks and the hikers who love them.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ranger card */}
            <div className="bg-hunter-800 rounded-3xl p-8 noise-overlay">
              <div className="w-12 h-12 bg-hunter-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-creme-50" />
              </div>
              <h3 className="font-serif text-3xl text-creme-50 mb-3">Ranger Dashboard</h3>
              <p className="text-hunter-200 mb-8 leading-relaxed">
                A live operational hub for park staff. See every trail, every lot, every alert — the moment it happens.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Live map with real-time occupancy overlays',
                  'Per-trail hiker counts and capacity alerts',
                  'Parking lot status across all lots',
                  'Trail open/close controls with instant public update',
                  'Historical analytics and weekly reports',
                  'Emergency check-in/out logging',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-hunter-100">
                    <div className="w-5 h-5 bg-hunter-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-creme-50 rounded-full" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/login"
                className="inline-flex items-center gap-2 bg-creme-50 text-hunter-800 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-creme-100 transition-colors">
                Ranger Sign In <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Hiker card */}
            <div className="bg-creme-100 border border-creme-200 rounded-3xl p-8 noise-overlay">
              <div className="w-12 h-12 bg-hunter-100 rounded-2xl flex items-center justify-center mb-6">
                <Mountain className="w-6 h-6 text-hunter-700" />
              </div>
              <h3 className="font-serif text-3xl text-hunter-900 mb-3">Hiker App</h3>
              <p className="text-hunter-600 mb-8 leading-relaxed">
                Check trail crowds and parking before you leave the house. Never arrive to a full lot again.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Live parking availability by lot',
                  'Trail busyness: real-time hiker counts',
                  'Crowd forecasts by time of day',
                  'Trail details: length, difficulty, elevation',
                  'Ranger alerts and trail closures',
                  'Offline trail maps for cell-free zones',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-hunter-800">
                    <div className="w-5 h-5 bg-hunter-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-hunter-600 rounded-full" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup"
                className="inline-flex items-center gap-2 bg-hunter-600 text-creme-50 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-hunter-700 transition-colors">
                Create Free Account <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature row */}
      <section className="bg-creme-100 border-y border-creme-200 py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            { icon: MapPin,    title: 'Live Park Map',       desc: 'Interactive maps show real-time sensor data across every trailhead and parking lot in the park system.' },
            { icon: TrendingUp,title: 'Crowd Forecasting',   desc: 'AI-powered predictions show when trails will be busiest based on historical patterns, weather, and day of week.' },
            { icon: Bell,      title: 'Instant Alerts',      desc: 'Rangers get automatic capacity alerts. Hikers get push notifications when their favorite trail or lot opens up.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-5">
              <div className="w-11 h-11 bg-hunter-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-hunter-700" />
              </div>
              <div>
                <h4 className="font-semibold text-hunter-900 mb-2">{title}</h4>
                <p className="text-hunter-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-5xl text-hunter-900 mb-5">Ready to explore smarter?</h2>
          <p className="text-hunter-600 text-lg mb-10">Join thousands of hikers and rangers already using TrailWatch.</p>
          <Link href={isLoggedIn ? dashboardHref : '/auth/signup'}
            className="inline-flex items-center gap-2 bg-hunter-600 text-creme-50 px-8 py-4 rounded-xl text-base font-semibold hover:bg-hunter-700 transition-all hover:shadow-xl hover:shadow-hunter-200">
            {isLoggedIn ? 'Open My Dashboard' : "Get Started — It's Free"}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hunter-900 text-hunter-300 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-hunter-400" />
            <span className="font-serif text-hunter-100">TrailWatch</span>
          </div>
          <p className="text-sm">© 2025 TrailWatch. Built for the parks. Designed for the people who protect them.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/auth/login"  className="hover:text-creme-100 transition-colors">Ranger Login</Link>
            <Link href="/auth/signup" className="hover:text-creme-100 transition-colors">Hiker Signup</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
