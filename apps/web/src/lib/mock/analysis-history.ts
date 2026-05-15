import type { AnalysisRun } from '../types'

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000)
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

const history: AnalysisRun[] = [
  // JRA-1042 — 3 runs
  { id: 'run-001', bugId: 'JRA-1042', outcome: 'completed', ranAt: hoursAgo(2),  note: 'Root cause identified in Safari autofill handler' },
  { id: 'run-002', bugId: 'JRA-1042', outcome: 'stopped',   ranAt: hoursAgo(14), note: 'Manually stopped after context timeout' },
  { id: 'run-003', bugId: 'JRA-1042', outcome: 'failed',    ranAt: daysAgo(2),   note: 'Safari WebDriver unavailable in test environment' },

  // LIN-190 — 3 runs
  { id: 'run-004', bugId: 'LIN-190',  outcome: 'completed', ranAt: hoursAgo(6),  note: 'Misconfigured TTL constant found in token service' },
  { id: 'run-005', bugId: 'LIN-190',  outcome: 'failed',    ranAt: hoursAgo(28), note: 'Network timeout reaching staging environment' },
  { id: 'run-006', bugId: 'LIN-190',  outcome: 'stopped',   ranAt: daysAgo(3),   note: 'Stopped for scheduled maintenance window' },

  // JRA-982 — 2 runs
  { id: 'run-007', bugId: 'JRA-982',  outcome: 'failed',    ranAt: daysAgo(1),   note: 'WebSocket mock failed to initialize' },
  { id: 'run-008', bugId: 'JRA-982',  outcome: 'failed',    ranAt: daysAgo(4),   note: 'Agent timed out after 30 minutes' },

  // LIN-204 — 1 run
  { id: 'run-009', bugId: 'LIN-204',  outcome: 'completed', ranAt: hoursAgo(4),  note: 'Referral code handler identified as root cause' },

  // LIN-168 — 2 runs
  { id: 'run-010', bugId: 'LIN-168',  outcome: 'completed', ranAt: daysAgo(1),   note: 'Callback URL mismatch confirmed in staging config' },
  { id: 'run-011', bugId: 'LIN-168',  outcome: 'stopped',   ranAt: daysAgo(5),   note: 'Stopped mid-analysis, incomplete results' },

  // JRA-971 — 1 run
  { id: 'run-012', bugId: 'JRA-971',  outcome: 'failed',    ranAt: daysAgo(3),   note: 'Android emulator crashed during test run' },

  // LIN-129 — 2 runs
  { id: 'run-013', bugId: 'LIN-129',  outcome: 'completed', ranAt: daysAgo(2),   note: 'Session cookie lifecycle verified in Firefox' },
  { id: 'run-014', bugId: 'LIN-129',  outcome: 'stopped',   ranAt: daysAgo(7),   note: 'Insufficient Firefox version in test environment' },

  // JRA-1039 — 1 run
  { id: 'run-015', bugId: 'JRA-1039', outcome: 'completed', ranAt: hoursAgo(8),  note: 'Memory threshold exceeded at the 500-row boundary' },
]

export function getAnalysisHistory(bugId: string): AnalysisRun[] {
  return history.filter((r) => r.bugId === bugId)
}
