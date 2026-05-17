export type Platform = 'jira' | 'linear'
export type Freshness = 'fresh' | 'decaying' | 'stale'
export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none'
export type AnalysisOutcome = 'completed' | 'stopped' | 'failed'

export interface AnalysisRun {
  id: string
  bugId: string
  outcome: AnalysisOutcome
  ranAt: Date
  note?: string
}

export interface Bug {
  id: string
  title: string
  status: string
  priority: Priority
  platform: Platform
  createdAt: Date
  url?: string
}

export interface JiraProject {
  projectKey: string
  boardId: string
}

export interface JiraSettings {
  enabled: boolean
  baseUrl: string
  email: string
  apiToken: string
  projects: JiraProject[]
}

export interface LinearSettings {
  enabled: boolean
  apiKey: string
  teamIds: string
  filterLabel: string
}

export interface SlackBugRowFields {
  priority: boolean
  status: boolean
  age: boolean
  platform: boolean
}

export interface SlackMessageFormat {
  title: string
  introText: string
  showDate: boolean
  showStatsSummary: boolean
  showEmoji: boolean
  showStaleList: boolean
  maxStaleBugs: number
  showDecayingList: boolean
  maxDecayingBugs: number
  bugRowFields: SlackBugRowFields
  footerText: string
}

export interface SlackSettings {
  webhookUrl: string
  schedule: string
  messageFormat: SlackMessageFormat
}

export interface DeveloperSettings {
  enableMockData: boolean
  enableAnalyze: boolean
  showTestIds: boolean
  userPlan: 'Free' | 'Pro'
}

export interface AppSettings {
  jira: JiraSettings
  linear: LinearSettings
  slack: SlackSettings
  developer: DeveloperSettings
}
