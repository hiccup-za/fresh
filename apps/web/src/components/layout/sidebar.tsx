'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Leaf, SignOut } from '@phosphor-icons/react'

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
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M13.5 8c0-.34-.03-.67-.08-1l1.37-1.07a.5.5 0 0 0 .11-.64l-1.3-2.25a.5.5 0 0 0-.61-.22l-1.61.65a5.5 5.5 0 0 0-.87-.5L10.2 1.5a.5.5 0 0 0-.5-.5H7.3a.5.5 0 0 0-.5.43L6.6 3.07a5.5 5.5 0 0 0-.87.5L4.12 2.92a.5.5 0 0 0-.61.22L2.2 5.38a.5.5 0 0 0 .11.64L3.68 7.08a5.5 5.5 0 0 0 0 1.84L2.3 9.93a.5.5 0 0 0-.11.64l1.3 2.25c.12.21.38.3.61.22l1.61-.65c.28.18.57.35.87.5l.22 1.68c.05.25.27.43.5.43h2.6a.5.5 0 0 0 .5-.43l.21-1.68c.3-.15.6-.32.87-.5l1.61.65c.24.09.5 0 .61-.22l1.3-2.25a.5.5 0 0 0-.11-.64L13.42 9c.05-.32.08-.65.08-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
]

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside
      className={[
        'fixed left-0 top-0 h-full border-r border-[#1a1a1a] bg-[#000] flex flex-col transition-[width] duration-200 overflow-hidden',
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

      {/* Footer */}
      <div className={[
        'border-t border-[#1a1a1a] shrink-0',
        collapsed ? 'p-2' : 'p-2',
      ].join(' ')}>
        <button
          onClick={() => router.push('/login')}
          title={collapsed ? 'Sign out' : undefined}
          className={[
            'flex items-center gap-2.5 rounded-md text-sm w-full transition-colors text-[#888] hover:text-white hover:bg-[#111]',
            collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2',
          ].join(' ')}
        >
          <span className="text-[#555]">
            <SignOut size={16} />
          </span>
          {!collapsed && 'Sign out'}
        </button>
        {!collapsed && (
          <p className="text-[11px] text-[#555] font-mono px-3 pt-1">v0.4.0</p>
        )}
      </div>
    </aside>
  )
}
