import type { Bug } from '../types'

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

export const linearBugs: Bug[] = [
  // Fresh (0–25 days)
  {
    id: 'LIN-204',
    title: 'Onboarding checklist skips step 3 when referral code is present',
    status: 'In Progress',
    priority: 'high',
    platform: 'linear',
    createdAt: daysAgo(1),
  },
  {
    id: 'LIN-201',
    title: 'Dark mode toggle persists incorrectly after session restore',
    status: 'Todo',
    priority: 'medium',
    platform: 'linear',
    createdAt: daysAgo(5),
  },
  {
    id: 'LIN-198',
    title: 'Keyboard shortcut Cmd+K opens wrong dialog on Settings page',
    status: 'Todo',
    priority: 'low',
    platform: 'linear',
    createdAt: daysAgo(11),
  },
  {
    id: 'LIN-194',
    title: 'Graph tooltip flickers when hovering near edge data points',
    status: 'In Progress',
    priority: 'none',
    platform: 'linear',
    createdAt: daysAgo(18),
  },
  {
    id: 'LIN-190',
    title: 'Invite email link expires after 24h instead of the configured 72h',
    status: 'Todo',
    priority: 'critical',
    platform: 'linear',
    createdAt: daysAgo(23),
  },
  // Decaying (31–55 days)
  {
    id: 'LIN-181',
    title: 'Filter panel does not close when clicking outside on mobile',
    status: 'Todo',
    priority: 'medium',
    platform: 'linear',
    createdAt: daysAgo(33),
  },
  {
    id: 'LIN-176',
    title: 'Markdown renderer strips code blocks inside blockquotes',
    status: 'In Progress',
    priority: 'high',
    platform: 'linear',
    createdAt: daysAgo(40),
  },
  {
    id: 'LIN-172',
    title: 'Table row selection deselects on sort column click',
    status: 'Todo',
    priority: 'medium',
    platform: 'linear',
    createdAt: daysAgo(47),
  },
  {
    id: 'LIN-168',
    title: 'OAuth callback URL mismatch in staging environment',
    status: 'In Progress',
    priority: 'critical',
    platform: 'linear',
    createdAt: daysAgo(52),
  },
  {
    id: 'LIN-163',
    title: 'Autocomplete suggestion list overflows fixed header on scroll',
    status: 'Todo',
    priority: 'none',
    platform: 'linear',
    createdAt: daysAgo(55),
  },
  // Stale (62–90 days)
  {
    id: 'LIN-151',
    title: 'PDF generation fails silently for reports with 1000+ rows',
    status: 'Todo',
    priority: 'high',
    platform: 'linear',
    createdAt: daysAgo(65),
  },
  {
    id: 'LIN-144',
    title: 'Time zone dropdown missing UTC+5:30 (IST) entry',
    status: 'Backlog',
    priority: 'low',
    platform: 'linear',
    createdAt: daysAgo(71),
  },
  {
    id: 'LIN-138',
    title: 'Drag-and-drop card reorder breaks with more than 50 items',
    status: 'Todo',
    priority: 'medium',
    platform: 'linear',
    createdAt: daysAgo(79),
  },
  {
    id: 'LIN-129',
    title: 'Session cookie not cleared on explicit logout in Firefox',
    status: 'Backlog',
    priority: 'critical',
    platform: 'linear',
    createdAt: daysAgo(86),
  },
  {
    id: 'LIN-121',
    title: 'Activity feed duplicates entries when polling interval < 5s',
    status: 'Todo',
    priority: 'none',
    platform: 'linear',
    createdAt: daysAgo(90),
  },
]
