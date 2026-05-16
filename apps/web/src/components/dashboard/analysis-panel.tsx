'use client'

import type { Bug, Freshness, Priority } from '@/lib/types'
import { getFreshness, getRelativeTime } from '@/lib/classify'

const freshnessConfig: Record<Freshness, { label: string; className: string }> = {
  fresh:    { label: 'Fresh',    className: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20' },
  decaying: { label: 'Decaying', className: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20' },
  stale:    { label: 'Stale',    className: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' },
}

const priorityConfig: Record<Priority, { label: string; dot: string }> = {
  critical: { label: 'Critical',    dot: 'bg-[#ef4444]' },
  high:     { label: 'High',        dot: 'bg-[#f59e0b]' },
  medium:   { label: 'Medium',      dot: 'bg-[#3b82f6]' },
  low:      { label: 'Low',         dot: 'bg-[#555]'    },
  none:     { label: 'No Priority', dot: 'bg-[#333]'    },
}

const platformConfig = {
  jira:   { label: 'Jira',   className: 'text-[#0052cc] bg-[#0052cc]/10 border-[#0052cc]/20' },
  linear: { label: 'Linear', className: 'text-[#5e6ad2] bg-[#5e6ad2]/10 border-[#5e6ad2]/20' },
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-[#555] uppercase tracking-widest">{label}</span>
      <div className="text-xs text-[#888]">{children}</div>
    </div>
  )
}

export function AnalysisPanel({ bug, onClose }: { bug: Bug; onClose: () => void }) {
  const freshness = getFreshness(bug.createdAt)
  const fConfig   = freshnessConfig[freshness]
  const pConfig   = priorityConfig[bug.priority]
  const plConfig  = platformConfig[bug.platform]

  return (
    <div className="h-full border border-[#1a1a1a] rounded-lg bg-[#0a0a0a] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#666]">{bug.id}</span>
          <span className={`text-[10px] font-medium font-mono px-1.5 py-0.5 rounded border ${plConfig.className}`}>
            {plConfig.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#555] hover:text-white transition-colors p-1 -mr-1 rounded"
          aria-label="Close panel"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="px-4 py-4 border-b border-[#1a1a1a] shrink-0">
        <p className="text-sm text-white leading-snug">{bug.title}</p>
      </div>

      {/* Metadata */}
      <div className="px-4 py-4 border-b border-[#1a1a1a] grid grid-cols-2 gap-4 shrink-0">
        <MetaItem label="Priority">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pConfig.dot}`} />
            {pConfig.label}
          </div>
        </MetaItem>
        <MetaItem label="Status">{bug.status}</MetaItem>
        <MetaItem label="Freshness">
          <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border ${fConfig.className}`}>
            {fConfig.label}
          </span>
        </MetaItem>
        <MetaItem label="Created">{getRelativeTime(bug.createdAt)}</MetaItem>
      </div>

      {/* Output — fills all remaining height inside the capped card */}
      <div className="flex flex-col flex-1 min-h-0 px-4 py-4">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <span className="text-[10px] text-[#555] uppercase tracking-widest">Analysis</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#444]" />
            <span className="text-[10px] text-[#555]">Idle</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-[#050505] border border-[#111] rounded-md p-4 overflow-y-auto font-mono text-xs leading-relaxed">
          <span className="text-[#444] select-none">{'// Agent output will stream here...\n\n'}</span>
          <span className="text-[#444] select-none">{'> Waiting for analysis to run'}</span>
          <span className="inline-block w-[7px] h-[13px] bg-[#444] ml-0.5 align-text-bottom animate-pulse select-none" />
        </div>
      </div>

    </div>
  )
}
