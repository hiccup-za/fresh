import type { BugGroup } from '@/lib/group'
import type { Bug } from '@/lib/types'
import { BugRow } from './bug-row'

interface Props {
  group: BugGroup
  onAnalyze: (bug: Bug) => void
  selectedBugId: string | null
  expandedBugId: string | null
  onToggleExpand: (bugId: string) => void
  showSource: boolean
}

export function BugGroupSection({ group, onAnalyze, selectedBugId, expandedBugId, onToggleExpand, showSource }: Props) {
  return (
    <div>
      <div className="sticky top-0 z-10 px-5 py-2 bg-[#000] border-b border-[#1a1a1a] flex items-center justify-between">
        <span className="text-xs font-medium text-[#666] uppercase tracking-widest">
          {group.label}
        </span>
        <span className="text-xs text-[#555]">{group.bugs.length} bugs</span>
      </div>
      <div>
        {group.bugs.map((bug) => (
          <BugRow
            key={bug.id}
            bug={bug}
            onAnalyze={onAnalyze}
            isSelected={bug.id === selectedBugId}
            isExpanded={bug.id === expandedBugId}
            onToggleExpand={onToggleExpand}
            showSource={showSource}
          />
        ))}
      </div>
    </div>
  )
}
