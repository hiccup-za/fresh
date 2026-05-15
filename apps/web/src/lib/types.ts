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

export interface SlackSettings {
  webhookUrl: string
  schedule: string
}

export interface AppSettings {
  jira: JiraSettings
  linear: LinearSettings
  slack: SlackSettings
}
