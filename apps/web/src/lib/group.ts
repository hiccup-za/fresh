import type { Bug } from './types'

export interface BugGroup {
  label: string
  year: number
  month: number
  bugs: Bug[]
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function groupBugsByYearMonth(bugs: Bug[]): BugGroup[] {
  const sorted = [...bugs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const map = new Map<string, BugGroup>()

  for (const bug of sorted) {
    const year = bug.createdAt.getFullYear()
    const month = bug.createdAt.getMonth()
    const key = `${year}-${month}`

    if (!map.has(key)) {
      map.set(key, { label: `${MONTHS[month]} ${year}`, year, month, bugs: [] })
    }
    map.get(key)!.bugs.push(bug)
  }

  return Array.from(map.values())
}
