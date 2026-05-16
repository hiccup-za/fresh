'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Bug, Platform, Priority, Freshness } from '@/lib/types'
import { getFreshness } from '@/lib/classify'
import { groupBugsByYearMonth } from '@/lib/group'
import { StatsRow } from './stats-row'
import { BugGroupSection } from './bug-group'
import { AnalysisPanel } from './analysis-panel'

// ─── Column widths — shared with bug-row.tsx ────────────────────────────────
export const COL = {
  chevron:  'w-4 shrink-0',
  platform: 'w-14 shrink-0',
  id:       'w-20 shrink-0',
  title:    'flex-1 min-w-0',
  priority: 'w-28 shrink-0',
  status:   'w-24 shrink-0',
  freshness:'w-20 shrink-0',
  created:  'w-20 shrink-0',
}

// ─── Filter types ────────────────────────────────────────────────────────────
type PlatformFilter  = 'all' | Platform
type PriorityFilter  = 'all' | Priority
type StatusFilter    = 'all' | string
type FreshnessFilter = 'all' | Freshness

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all',      label: 'All priorities' },
  { value: 'critical', label: 'Critical'       },
  { value: 'high',     label: 'High'           },
  { value: 'medium',   label: 'Medium'         },
  { value: 'low',      label: 'Low'            },
  { value: 'none',     label: 'No priority'    },
]

const FRESHNESS_OPTIONS: { value: FreshnessFilter; label: string }[] = [
  { value: 'all',      label: 'All'      },
  { value: 'fresh',    label: 'Fresh'    },
  { value: 'decaying', label: 'Decaying' },
  { value: 'stale',    label: 'Stale'    },
]

const STATUS_ORDER = ['Open', 'Todo', 'In Progress', 'In Review', 'Backlog']

// ─── Dropdown ────────────────────────────────────────────────────────────────
function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  active,
  testId,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  active: boolean
  testId?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentLabel = options.find((o) => o.value === value)?.label ?? label

  return (
    <div ref={ref} className="relative">
      <button
        data-testid={testId}
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors',
          active
            ? 'border-[#333] text-white bg-[#111]'
            : 'border-[#1a1a1a] text-white bg-[#050505] hover:border-[#262626]',
        ].join(' ')}
      >
        {active ? currentLabel : label}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div data-testid={testId ? `${testId}-menu` : undefined} className="absolute top-full left-0 mt-1 z-20 min-w-36 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg shadow-xl overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={[
                'w-full text-left px-3 py-2 text-xs transition-colors',
                opt.value === value
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-white hover:bg-[#111]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Platform segmented control ──────────────────────────────────────────────
const PLATFORM_FILTERS: { value: PlatformFilter; label: string }[] = [
  { value: 'all',    label: 'All'    },
  { value: 'jira',   label: 'Jira'   },
  { value: 'linear', label: 'Linear' },
]

// ─── Main component ──────────────────────────────────────────────────────────
export function BugTable({ bugs }: { bugs: Bug[] }) {
  const [platform,     setPlatform]     = useState<PlatformFilter>('all')
  const [priority,     setPriority]     = useState<PriorityFilter>('all')
  const [status,       setStatus]       = useState<StatusFilter>('all')
  const [freshness,    setFreshness]    = useState<FreshnessFilter>('all')
  const [selectedBug,  setSelectedBug]  = useState<Bug | null>(null)
  const [expandedBugId, setExpandedBugId] = useState<string | null>(null)
  const [enabledPlatforms, setEnabledPlatforms] = useState({ jira: false, linear: false })
  const [enableMockData, setEnableMockData] = useState(true)
  const [enableAnalyze,  setEnableAnalyze]  = useState(true)

  // Jira live-fetch state
  const [jiraEnabled,     setJiraEnabled]     = useState(false)
  const [jiraBaseUrl,     setJiraBaseUrl]     = useState('')
  const [jiraEmail,       setJiraEmail]       = useState('')
  const [jiraApiToken,    setJiraApiToken]    = useState('')
  const [jiraProjectKeys, setJiraProjectKeys] = useState<string[]>([])
  const [liveJiraBugs,    setLiveJiraBugs]    = useState<Bug[]>([])
  const [jiraLoading,     setJiraLoading]     = useState(false)
  const [jiraError,       setJiraError]       = useState<string | null>(null)

  // Linear live-fetch state
  const [linearEnabled,     setLinearEnabled]     = useState(false)
  const [linearApiKey,      setLinearApiKey]      = useState('')
  const [linearTeamIds,     setLinearTeamIds]     = useState('')
  const [linearFilterLabel, setLinearFilterLabel] = useState('')
  const [liveLinearBugs,    setLiveLinearBugs]    = useState<Bug[]>([])
  const [linearLoading,     setLinearLoading]     = useState(false)
  const [linearError,       setLinearError]       = useState<string | null>(null)

  const [refreshTick, setRefreshTick] = useState(0)

  const panelWrapperRef = useRef<HTMLDivElement>(null)
  const [panelHeight,  setPanelHeight]  = useState<number>(0)

  useEffect(() => {
    function readSettings() {
      try {
        const raw = localStorage.getItem('fresh-settings')
        if (raw) {
          const s = JSON.parse(raw)
          setEnabledPlatforms({
            jira:   s.jira?.enabled   ?? false,
            linear: s.linear?.enabled ?? false,
          })
          setEnableMockData(s.developer?.enableMockData ?? true)
          setEnableAnalyze(s.developer?.enableAnalyze ?? true)
          setJiraEnabled(s.jira?.enabled ?? false)
          setJiraBaseUrl(s.jira?.baseUrl ?? '')
          setJiraEmail(s.jira?.email ?? '')
          setJiraApiToken(s.jira?.apiToken ?? '')
          setJiraProjectKeys(
            (s.jira?.projects ?? []).map((p: { projectKey: string }) => p.projectKey).filter(Boolean)
          )
          setLinearEnabled(s.linear?.enabled ?? false)
          setLinearApiKey(s.linear?.apiKey ?? '')
          setLinearTeamIds(s.linear?.teamIds ?? '')
          setLinearFilterLabel(s.linear?.filterLabel ?? '')
        } else {
          setEnabledPlatforms({ jira: false, linear: false })
          setEnableMockData(true)
          setEnableAnalyze(true)
          setJiraEnabled(false)
          setJiraBaseUrl('')
          setJiraEmail('')
          setJiraApiToken('')
          setJiraProjectKeys([])
          setLinearEnabled(false)
          setLinearApiKey('')
          setLinearTeamIds('')
          setLinearFilterLabel('')
        }
      } catch {}
    }
    readSettings()
    window.addEventListener('fresh-settings-changed', readSettings)
    window.addEventListener('storage', readSettings)
    return () => {
      window.removeEventListener('fresh-settings-changed', readSettings)
      window.removeEventListener('storage', readSettings)
    }
  }, [])

  // Fetch live Jira bugs whenever relevant settings change
  useEffect(() => {
    if (enableMockData || !jiraEnabled || !jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      setLiveJiraBugs([])
      setJiraLoading(false)
      setJiraError(null)
      return
    }

    let cancelled = false
    setJiraLoading(true)
    setJiraError(null)

    fetch('/api/jira/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl: jiraBaseUrl, email: jiraEmail, apiToken: jiraApiToken, projectKeys: jiraProjectKeys }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.error) {
          setJiraError(data.error)
          setLiveJiraBugs([])
        } else {
          setLiveJiraBugs(
            (data.bugs ?? []).map((b: Bug & { createdAt: string }) => ({ ...b, createdAt: new Date(b.createdAt) }))
          )
          setJiraError(null)
        }
      })
      .catch((err: Error) => {
        if (cancelled) return
        setJiraError(err.message ?? 'Failed to fetch Jira issues')
        setLiveJiraBugs([])
      })
      .finally(() => {
        if (!cancelled) setJiraLoading(false)
      })

    return () => { cancelled = true }
  // jiraProjectKeys is an array — join to a string so the effect only re-runs when keys actually change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableMockData, jiraEnabled, jiraBaseUrl, jiraEmail, jiraApiToken, jiraProjectKeys.join(','), refreshTick])

  // Fetch live Linear bugs whenever relevant settings change
  useEffect(() => {
    if (enableMockData || !linearEnabled || !linearApiKey) {
      setLiveLinearBugs([])
      setLinearLoading(false)
      setLinearError(null)
      return
    }

    let cancelled = false
    setLinearLoading(true)
    setLinearError(null)

    fetch('/api/linear/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: linearApiKey, teamIds: linearTeamIds, filterLabel: linearFilterLabel }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.error) {
          setLinearError(data.error)
          setLiveLinearBugs([])
        } else {
          setLiveLinearBugs(
            (data.bugs ?? []).map((b: Bug & { createdAt: string }) => ({ ...b, createdAt: new Date(b.createdAt) }))
          )
          setLinearError(null)
        }
      })
      .catch((err: Error) => {
        if (cancelled) return
        setLinearError(err.message ?? 'Failed to fetch Linear issues')
        setLiveLinearBugs([])
      })
      .finally(() => {
        if (!cancelled) setLinearLoading(false)
      })

    return () => { cancelled = true }
  }, [enableMockData, linearEnabled, linearApiKey, linearTeamIds, linearFilterLabel, refreshTick])

  useEffect(() => {
    if (!selectedBug) return
    function recalc() {
      if (!panelWrapperRef.current) return
      const top = panelWrapperRef.current.getBoundingClientRect().top
      setPanelHeight(window.innerHeight - top)
    }
    recalc()
    window.addEventListener('resize', recalc)
    window.addEventListener('scroll', recalc, { passive: true })
    return () => {
      window.removeEventListener('resize', recalc)
      window.removeEventListener('scroll', recalc)
    }
  }, [selectedBug])

  const anyEnabled = enabledPlatforms.jira || enabledPlatforms.linear
  const showPlatformFilter = enabledPlatforms.jira && enabledPlatforms.linear
  const showSource = !anyEnabled || showPlatformFilter

  useEffect(() => {
    if (!enableAnalyze) {
      setSelectedBug(null)
      setExpandedBugId(null)
    }
  }, [enableAnalyze])

  useEffect(() => {
    if (!showPlatformFilter) setPlatform('all')
  }, [showPlatformFilter])

  const activeBugs = enableMockData ? bugs : [...liveJiraBugs, ...liveLinearBugs]
  const sourceBugs = anyEnabled ? activeBugs.filter((b) => enabledPlatforms[b.platform]) : activeBugs

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All statuses' },
    ...[...new Set(sourceBugs.map((b) => b.status))]
      .sort((a, b) => {
        const ai = STATUS_ORDER.indexOf(a)
        const bi = STATUS_ORDER.indexOf(b)
        if (ai === -1 && bi === -1) return a.localeCompare(b)
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      })
      .map((s) => ({ value: s, label: s })),
  ]

  const filtered = sourceBugs.filter((b) => {
    if (platform  !== 'all' && b.platform  !== platform)               return false
    if (priority  !== 'all' && b.priority  !== priority)               return false
    if (status    !== 'all' && b.status    !== status)                  return false
    if (freshness !== 'all' && getFreshness(b.createdAt) !== freshness) return false
    return true
  })

  const groups = groupBugsByYearMonth(filtered)
  const hasActiveFilter = platform !== 'all' || priority !== 'all' || status !== 'all' || freshness !== 'all'

  const clearAll = useCallback(() => {
    setPlatform('all')
    setPriority('all')
    setStatus('all')
    setFreshness('all')
  }, [])

  const handleAnalyze = useCallback((bug: Bug) => {
    setSelectedBug((prev) => prev?.id === bug.id ? null : bug)
  }, [])

  const handleToggleExpand = useCallback((bugId: string) => {
    setExpandedBugId((prev) => prev === bugId ? null : bugId)
  }, [])

  const anyLoading = jiraLoading || linearLoading
  const anyLiveEnabled = jiraEnabled || linearEnabled

  if (!enableMockData && !anyLoading && activeBugs.length === 0 && !jiraError && !linearError && !anyLiveEnabled) {
    return (
      <>
        <div className="mb-8">
          <StatsRow bugs={[]} />
        </div>
        <div data-testid="no-data-sources" className="border border-[#1a1a1a] rounded-lg bg-[#0a0a0a] flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-white mb-2">No data sources connected</p>
          <p className="text-sm text-[#555] mb-6">Enable a platform integration in Settings to start seeing bugs here.</p>
          <Link
            href="/settings"
            data-testid="no-data-sources-settings-btn"
            className="inline-flex items-center px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors"
          >
            Settings
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <StatsRow bugs={filtered} />
      </div>

      <div className="flex gap-5 items-start">
        {/* ── Bug list ── */}
        <div data-testid="issues-table" className="flex-1 min-w-0 border border-[#1a1a1a] rounded-lg overflow-hidden">

          {/* Loading / error banners */}
          {(jiraLoading || linearLoading) && (
            <div className="px-5 py-2.5 border-b border-[#1a1a1a] flex items-center gap-2 text-xs text-[#888]">
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
              </svg>
              Fetching {[jiraLoading && 'Jira', linearLoading && 'Linear'].filter(Boolean).join(' & ')} issues…
            </div>
          )}
          {jiraError && (
            <div className="px-5 py-2.5 border-b border-[#1a1a1a] flex items-center gap-2 text-xs text-[#ef4444]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Jira: {jiraError}
            </div>
          )}
          {linearError && (
            <div className="px-5 py-2.5 border-b border-[#1a1a1a] flex items-center gap-2 text-xs text-[#ef4444]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Linear: {linearError}
            </div>
          )}

          {/* Toolbar */}
          <div className="px-5 py-3 border-b border-[#1a1a1a] flex items-center gap-3 flex-wrap">
            {showPlatformFilter && (
              <>
                <div data-testid="platform-filter" className="flex gap-1 p-1 bg-[#050505] border border-[#1a1a1a] rounded-md">
                  {PLATFORM_FILTERS.map(({ value, label }) => (
                    <button
                      key={value}
                      data-testid={`platform-filter-${value}`}
                      onClick={() => setPlatform(value)}
                      className={[
                        'px-3 py-1 rounded text-xs transition-colors',
                        platform === value ? 'bg-[#1a1a1a] text-white' : 'text-white',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-4 bg-[#1a1a1a]" />
              </>
            )}

            <FilterDropdown label="Priority"  value={priority}  options={PRIORITY_OPTIONS}  onChange={setPriority}  active={priority  !== 'all'} testId="filter-priority" />
            <FilterDropdown label="Status"    value={status}    options={statusOptions}      onChange={setStatus}    active={status    !== 'all'} testId="filter-status" />
            <FilterDropdown label="Freshness" value={freshness} options={FRESHNESS_OPTIONS}  onChange={setFreshness} active={freshness !== 'all'} testId="filter-freshness" />

            {hasActiveFilter && (
              <button data-testid="filters-clear" onClick={clearAll} className="text-xs text-[#555] hover:text-[#888] transition-colors ml-1">
                Clear
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              {!enableMockData && anyLiveEnabled && (
                <button
                  data-testid="refresh-btn"
                  onClick={() => setRefreshTick((t) => t + 1)}
                  disabled={anyLoading}
                  className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#888] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    width="11" height="11" viewBox="0 0 16 16" fill="none"
                    className={anyLoading ? 'animate-spin' : ''}
                  >
                    <path d="M13.5 8A5.5 5.5 0 1 1 10 3.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10 1v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Refresh
                </button>
              )}
              <span className="text-xs text-[#555]">{filtered.length} bugs</span>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-4 px-5 py-2 border-b border-[#111] bg-[#050505]">
            <span className={COL.chevron} />
            {showSource && <span className={`text-[10px] text-[#555] uppercase tracking-widest ${COL.platform}`}>Source</span>}
            <span className={`text-[10px] text-[#555] uppercase tracking-widest ${COL.id}`}>ID</span>
            <span className={`text-[10px] text-[#555] uppercase tracking-widest ${COL.title}`}>Title</span>
            <span className={`text-[10px] text-[#555] uppercase tracking-widest ${COL.priority}`}>Priority</span>
            <span className={`text-[10px] text-[#555] uppercase tracking-widest ${COL.status}`}>Status</span>
            <span className={`text-[10px] text-[#555] uppercase tracking-widest ${COL.freshness}`}>Freshness</span>
            <span className={`text-[10px] text-[#555] uppercase tracking-widest ${COL.created} text-right`}>Created</span>
            {/* Spacer matching the Analyze button width */}
            <span className="w-20 shrink-0" />
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-[#555]">No bugs match the current filters.</p>
            </div>
          ) : (
            groups.map((group) => (
              <BugGroupSection
                key={`${group.year}-${group.month}`}
                group={group}
                onAnalyze={handleAnalyze}
                selectedBugId={selectedBug?.id ?? null}
                expandedBugId={expandedBugId}
                onToggleExpand={handleToggleExpand}
                showSource={showSource}
                enableAnalyze={enableAnalyze}
              />
            ))
          )}
        </div>

        {/* ── Analysis panel ── */}
        {selectedBug && enableAnalyze && (
          <div
            ref={panelWrapperRef}
            className="w-[360px] shrink-0 sticky top-8 self-start"
            style={panelHeight ? { height: panelHeight } : undefined}
          >
            <AnalysisPanel
              bug={selectedBug}
              onClose={() => setSelectedBug(null)}
            />
          </div>
        )}
      </div>
    </>
  )
}
