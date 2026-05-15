'use client'

import { useState } from 'react'
import { SidebarSimple } from '@phosphor-icons/react'
import { Sidebar } from './sidebar'

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#000]">
      <Sidebar collapsed={collapsed} />

      <div
        className={[
          'flex flex-col min-h-screen transition-[margin] duration-200',
          collapsed ? 'ml-14' : 'ml-56',
        ].join(' ')}
      >
        {/* Top bar — mirrors sidebar header height, holds the toggle */}
        <div className="h-14 border-b border-[#1a1a1a] flex items-center px-4 shrink-0">
          <button
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex items-center justify-center w-8 h-8 rounded-md text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <SidebarSimple size={20} />
          </button>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
