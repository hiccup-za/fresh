import type { Bug } from '../types'

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

export const jiraBugs: Bug[] = [
  // Fresh (0–25 days)
  {
    id: 'JRA-1042',
    title: 'Login page freezes on Safari 17 when autofill triggers',
    status: 'In Progress',
    priority: 'critical',
    platform: 'jira',
    createdAt: daysAgo(2),
  },
  {
    id: 'JRA-1039',
    title: 'Dashboard widget fails to render when dataset exceeds 500 rows',
    status: 'Open',
    priority: 'high',
    platform: 'jira',
    createdAt: daysAgo(7),
  },
  {
    id: 'JRA-1035',
    title: 'CSV export truncates fields containing commas',
    status: 'Open',
    priority: 'medium',
    platform: 'jira',
    createdAt: daysAgo(14),
  },
  {
    id: 'JRA-1031',
    title: 'Notification badge count does not reset after reading',
    status: 'In Review',
    priority: 'low',
    platform: 'jira',
    createdAt: daysAgo(19),
  },
  {
    id: 'JRA-1028',
    title: 'Search results pagination resets to page 1 on browser back',
    status: 'Open',
    priority: 'none',
    platform: 'jira',
    createdAt: daysAgo(24),
  },
  // Decaying (31–55 days)
  {
    id: 'JRA-1017',
    title: 'User avatar upload silently fails for PNG files over 2MB',
    status: 'Open',
    priority: 'high',
    platform: 'jira',
    createdAt: daysAgo(32),
  },
  {
    id: 'JRA-1012',
    title: 'Dropdown menu z-index conflict with modal overlay',
    status: 'In Progress',
    priority: 'medium',
    platform: 'jira',
    createdAt: daysAgo(38),
  },
  {
    id: 'JRA-1008',
    title: 'Date picker displays wrong month when locale is ja-JP',
    status: 'Open',
    priority: 'medium',
    platform: 'jira',
    createdAt: daysAgo(45),
  },
  {
    id: 'JRA-1003',
    title: 'API rate limit errors not surfaced to end users',
    status: 'Backlog',
    priority: 'low',
    platform: 'jira',
    createdAt: daysAgo(51),
  },
  {
    id: 'JRA-998',
    title: 'Font rendering artifacts on Windows with ClearType disabled',
    status: 'Open',
    priority: 'none',
    platform: 'jira',
    createdAt: daysAgo(54),
  },
  // Stale (62–90 days)
  {
    id: 'JRA-982',
    title: 'WebSocket connection drops after 30 minutes of inactivity',
    status: 'Open',
    priority: 'critical',
    platform: 'jira',
    createdAt: daysAgo(63),
  },
  {
    id: 'JRA-971',
    title: 'Multi-factor auth flow broken on Android Chrome 112',
    status: 'Backlog',
    priority: 'high',
    platform: 'jira',
    createdAt: daysAgo(70),
  },
  {
    id: 'JRA-960',
    title: 'Bulk delete operation does not update UI until page refresh',
    status: 'Open',
    priority: 'medium',
    platform: 'jira',
    createdAt: daysAgo(78),
  },
  {
    id: 'JRA-948',
    title: 'Tooltip overflows viewport on small screen widths',
    status: 'Backlog',
    priority: 'low',
    platform: 'jira',
    createdAt: daysAgo(85),
  },
  {
    id: 'JRA-937',
    title: 'Report scheduler fires at wrong time after DST change',
    status: 'Open',
    priority: 'none',
    platform: 'jira',
    createdAt: daysAgo(90),
  },
]
