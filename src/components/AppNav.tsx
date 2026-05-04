'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mountain, LogOut, Bell, User, AlertTriangle, Shield, Activity, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

interface NavProps {
  userName: string
  role: 'parks_dept' | 'hiker'
  onSignOut: () => void
  alertCount?: number
}

const RANGER_NAV = [
  { href: '/ranger',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/ranger/incidents', label: 'Incidents',  icon: AlertTriangle },
  { href: '/ranger/audit',     label: 'Audit Log',  icon: Shield },
  { href: '/ranger/system',    label: 'System',     icon: Activity },
]

export default function AppNav({ userName, role, onSignOut, alertCount = 0 }: NavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hunter-900 border-b border-hunter-700">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-hunter-500 rounded-lg flex items-center justify-center">
              <Mountain className="w-4 h-4 text-creme-50" />
            </div>
            <span className="font-serif text-lg text-creme-100">TrailWatch</span>
            <span className={clsx('ml-1 text-xs px-2 py-0.5 rounded-full font-medium',
              role === 'parks_dept' ? 'bg-hunter-600 text-creme-100' : 'bg-creme-200 text-hunter-800')}>
              {role === 'parks_dept' ? 'Ranger' : 'Hiker'}
            </span>
          </Link>

          {/* Ranger sub-nav — desktop */}
          {role === 'parks_dept' && (
            <div className="hidden md:flex items-center gap-1">
              {RANGER_NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link key={href} href={href}
                    className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      active ? 'bg-hunter-600 text-creme-100' : 'text-hunter-400 hover:text-hunter-100 hover:bg-hunter-800')}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {label === 'Incidents' && alertCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {alertCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-hunter-400">
            <User className="w-3.5 h-3.5" />
            <span className="text-xs text-hunter-300">{userName}</span>
          </div>
          <button onClick={onSignOut}
            className="flex items-center gap-1.5 text-hunter-400 hover:text-creme-100 transition-colors text-xs px-3 py-1.5 rounded-lg hover:bg-hunter-800">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Sign Out</span>
          </button>
          {/* Mobile menu toggle for ranger */}
          {role === 'parks_dept' && (
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 text-hunter-400 hover:text-creme-100 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile ranger nav */}
      {role === 'parks_dept' && mobileOpen && (
        <div className="md:hidden border-t border-hunter-800 bg-hunter-900 px-4 py-3 flex flex-col gap-1">
          {RANGER_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={clsx('flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-hunter-600 text-creme-100' : 'text-hunter-300 hover:bg-hunter-800')}>
                <Icon className="w-4 h-4" />
                {label}
                {label === 'Incidents' && alertCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{alertCount}</span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
