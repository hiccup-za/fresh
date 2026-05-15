import { BugTable } from '@/components/dashboard/bug-table'
import { jiraBugs } from '@/lib/mock/jira'
import { linearBugs } from '@/lib/mock/linear'

export const metadata = {
  title: 'Dashboard — Fresh',
}

export default function DashboardPage() {
  const allBugs = [...jiraBugs, ...linearBugs]

  return (
    <div className="px-8 pt-6 pb-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-[#555]">Bug freshness across all connected platforms</p>
      </div>

      <BugTable bugs={allBugs} />
    </div>
  )
}
