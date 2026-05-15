import type { Bug } from '@/lib/types'
import { getFreshness } from '@/lib/classify'

interface StatCardProps {
  label: string
  value: number
  accent?: string
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-5 flex flex-col gap-2">
      <span className="text-xs text-[#666] uppercase tracking-widest font-medium">{label}</span>
      <span className={`text-3xl font-semibold tabular-nums ${accent ?? 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}

export function StatsRow({ bugs }: { bugs: Bug[] }) {
  const total = bugs.length
  const fresh = bugs.filter((b) => getFreshness(b.createdAt) === 'fresh').length
  const decaying = bugs.filter((b) => getFreshness(b.createdAt) === 'decaying').length
  const stale = bugs.filter((b) => getFreshness(b.createdAt) === 'stale').length

  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard label="Total" value={total} />
      <StatCard label="Fresh" value={fresh} accent="text-[#22c55e]" />
      <StatCard label="Decaying" value={decaying} accent="text-[#f59e0b]" />
      <StatCard label="Stale" value={stale} accent="text-[#ef4444]" />
    </div>
  )
}
