'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { Leaf, SignOut, Gear, User } from '@phosphor-icons/react'

const nav = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.8" />
      </svg>
    ),
  },
]

const MOCK_USER = {
  name: 'Chris',
  email: 'chriszeuch.cz@gmail.com',
  plan: 'Free' as 'Free' | 'Pro',
  initials: 'CZ',
}

const APP_VERSION = 'v0.7.0'

interface SidebarProps {
  collapsed: boolean
}

function readPlan(): 'Free' | 'Pro' {
  try {
    const raw = localStorage.getItem('fresh-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.developer?.userPlan === 'Pro' ? 'Pro' : 'Free'
    }
  } catch {}
  return 'Free'
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUserPlan(readPlan())
    function onSettingsChange() { setUserPlan(readPlan()) }
    window.addEventListener('fresh-settings-changed', onSettingsChange)
    window.addEventListener('storage', onSettingsChange)
    return () => {
      window.removeEventListener('fresh-settings-changed', onSettingsChange)
      window.removeEventListener('storage', onSettingsChange)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  return (
    <aside
      className={[
        'fixed left-0 top-0 h-full border-r border-[#1a1a1a] bg-[#000] flex flex-col transition-[width] duration-200 overflow-visible z-40',
        collapsed ? 'w-14' : 'w-56',
      ].join(' ')}
    >
      {/* Header */}
      <div className={[
        'flex items-center h-14 border-b border-[#1a1a1a] shrink-0',
        collapsed ? 'justify-center px-0' : 'gap-2 px-5',
      ].join(' ')}>
        <Leaf size={18} weight="fill" color="#22c55e" />
        {!collapsed && (
          <span className="text-sm font-semibold text-white tracking-tight">Fresh</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              title={collapsed ? label : undefined}
              className={[
                'flex items-center gap-2.5 rounded-md text-sm transition-colors',
                collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2',
                active
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#888] hover:text-white hover:bg-[#111]',
              ].join(' ')}
            >
              <span className={active ? 'text-white' : 'text-[#555]'}>{icon}</span>
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — user profile button + dropdown */}
      <div className="border-t border-[#1a1a1a] p-2 shrink-0 relative" ref={dropdownRef}>
        {/* Dropdown — renders above the button */}
        {dropdownOpen && (
          <div data-testid="user-dropdown-menu" className={[
            'absolute bottom-full mb-1 bg-[#111] border border-[#1a1a1a] rounded-lg shadow-xl overflow-hidden',
            collapsed ? 'left-14 w-56' : 'left-2 right-2',
          ].join(' ')}>
            {/* User info */}
            <div className="px-3 py-3 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-white">{MOCK_USER.initials}</span>
                </div>
                <div className="min-w-0">
                  <p data-testid="user-dropdown-name" className="text-sm font-medium text-white truncate">{MOCK_USER.name}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                {userPlan === 'Pro' ? (
                  <span data-testid="user-dropdown-plan" className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[#1a1a1a] text-amber-400 border border-amber-400/30">
                    Pro
                  </span>
                ) : (
                  <span data-testid="user-dropdown-plan" className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[#1a1a1a] text-[#888] border border-[#333]">
                    Free
                  </span>
                )}
                <span data-testid="user-dropdown-version" className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[#1a1a1a] text-[#888] border border-[#333]">
                  {APP_VERSION}
                </span>
              </div>
            </div>

            {/* Settings */}
            <div className="p-1">
              <Link
                href="/settings"
                data-testid="user-dropdown-settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors w-full"
              >
                <Gear size={15} />
                Settings
              </Link>
            </div>

            {/* Logout */}
            <div className="p-1 border-t border-[#1a1a1a]">
              <button
                data-testid="user-dropdown-signout"
                onClick={() => { setDropdownOpen(false); router.push('/login') }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-[#888] hover:text-red-400 hover:bg-[#1a1a1a] transition-colors w-full"
              >
                <SignOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Profile button */}
        <button
          data-testid="user-dropdown-button"
          onClick={() => setDropdownOpen(o => !o)}
          title={collapsed ? MOCK_USER.name : undefined}
          className={[
            'flex items-center rounded-md w-full transition-colors',
            collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-2',
            dropdownOpen ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white hover:bg-[#111]',
          ].join(' ')}
        >
          <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-semibold text-white">{MOCK_USER.initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate leading-tight">{MOCK_USER.name}</p>
              <p className="text-xs text-[#666] leading-tight">{userPlan}</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
