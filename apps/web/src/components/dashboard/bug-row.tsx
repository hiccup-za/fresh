'use client'

import type { Bug, Freshness, Priority, AnalysisOutcome, AnalysisRun } from '@/lib/types'
import { getFreshness, getRelativeTime, getShortRelativeTime } from '@/lib/classify'
import { getAnalysisHistory } from '@/lib/mock/analysis-history'
import { COL } from './bug-table'

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

const statusConfig: Record<string, string> = {
  'Open':        'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20',
  'Todo':        'text-[#888] bg-[#888]/10 border-[#888]/20',
  'In Progress': 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20',
  'In Review':   'text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/20',
  'Backlog':     'text-[#555] bg-[#555]/10 border-[#555]/20',
}

const outcomeConfig: Record<AnalysisOutcome, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20' },
  stopped:   { label: 'Stopped',   className: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20' },
  failed:    { label: 'Failed',    className: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' },
}

function HistoryPanel({ history }: { history: AnalysisRun[] }) {
  return (
    <div className="px-5 py-4 bg-[#050505] border-t border-[#0d0d0d]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-[#555] uppercase tracking-widest">Analysis History</span>
        {history.length > 0 && (
          <span className="text-[10px] text-[#555]">
            {history.length} {history.length === 1 ? 'run' : 'runs'}
          </span>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-[11px] text-[#555] italic">No analysis runs yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((run) => {
            const oc = outcomeConfig[run.outcome]
            return (
              <div key={run.id} className="flex items-center gap-3">
                <span className={`shrink-0 inline-block text-[10px] font-medium w-20 text-center py-0.5 rounded border ${oc.className}`}>
                  {oc.label}
                </span>
                {run.note && (
                  <span className="text-[11px] text-[#666] flex-1 min-w-0 truncate">{run.note}</span>
                )}
                <span className="text-[11px] text-[#555] shrink-0 ml-auto tabular-nums">
                  {getShortRelativeTime(run.ranAt)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface Props {
  bug: Bug
  onAnalyze: (bug: Bug) => void
  isSelected: boolean
  isExpanded: boolean
  onToggleExpand: (bugId: string) => void
  showSource: boolean
  enableAnalyze: boolean
}

export function BugRow({ bug, onAnalyze, isSelected, isExpanded, onToggleExpand, showSource, enableAnalyze }: Props) {
  const freshness = getFreshness(bug.createdAt)
  const fConfig   = freshnessConfig[freshness]
  const pConfig   = priorityConfig[bug.priority]
  const plConfig  = platformConfig[bug.platform]
  const history   = getAnalysisHistory(bug.id)

  return (
    <div className={['relative border-b border-[#111]', isSelected ? 'bg-[#0d0d0d]' : ''].join(' ')}>
      {isSelected && (
        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#22c55e] z-10" />
      )}

      {/* Clickable row */}
      <div
        className={[
          'flex items-center gap-4 px-5 py-3.5 transition-colors group',
          enableAnalyze ? 'cursor-pointer' : 'cursor-default',
          !isSelected && 'hover:bg-[#0a0a0a]',
        ].filter(Boolean).join(' ')}
        onClick={() => enableAnalyze && onToggleExpand(bug.id)}
      >
        {/* Chevron */}
        <div className={COL.chevron}>
          {enableAnalyze && (
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              className={`transition-transform text-[#444] group-hover:text-[#666] ${isExpanded ? 'rotate-90' : ''}`}
            >
              <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Source */}
        {showSource && (
          <div className={COL.platform}>
            <span className={`inline-block text-[10px] font-medium font-mono px-1.5 py-0.5 rounded border ${plConfig.className}`}>
              {plConfig.label}
            </span>
          </div>
        )}

        {/* ID */}
        <span className={`text-[11px] text-[#888] font-mono truncate ${COL.id}`}>
          {bug.id}
        </span>

        {/* Title */}
        <span className={`text-sm text-white truncate ${COL.title}`}>
          {bug.title}
        </span>

        {/* Priority */}
        <div className={`flex items-center gap-1.5 ${COL.priority}`}>
          <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${pConfig.dot}`} />
          <span className="text-[11px] text-[#aaa] truncate">{pConfig.label}</span>
        </div>

        {/* Status */}
        <div className={COL.status}>
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConfig[bug.status] ?? 'text-[#888] bg-[#888]/10 border-[#888]/20'}`}>
            {bug.status}
          </span>
        </div>

        {/* Freshness */}
        <div className={COL.freshness}>
          <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border ${fConfig.className}`}>
            {fConfig.label}
          </span>
        </div>

        {/* Created */}
        <span className={`text-[11px] text-[#888] text-right ${COL.created}`}>
          {getRelativeTime(bug.createdAt)}
        </span>

        {/* Analyze button — visible on hover or when selected */}
        {enableAnalyze ? (
          <button
            onClick={(e) => { e.stopPropagation(); onAnalyze(bug) }}
            className={[
              'w-20 shrink-0 text-[11px] py-1 rounded border transition-all text-center',
              isSelected
                ? 'opacity-100 border-[#22c55e]/40 text-[#22c55e] bg-[#22c55e]/10'
                : 'opacity-0 group-hover:opacity-100 border-[#262626] text-[#555] hover:text-white hover:border-[#444]',
            ].join(' ')}
          >
            {isSelected ? 'Analyzing' : 'Analyze'}
          </button>
        ) : (
          <span className="w-20 shrink-0" />
        )}
      </div>

      {isExpanded && enableAnalyze && <HistoryPanel history={history} />}
    </div>
  )
}
