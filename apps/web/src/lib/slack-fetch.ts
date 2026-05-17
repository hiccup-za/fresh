import type { Bug, JiraSettings, LinearSettings, Priority } from './types'

function mapJiraPriority(name: string | undefined): Priority {
  switch (name?.toLowerCase()) {
    case 'highest':
    case 'critical': return 'critical'
    case 'high':     return 'high'
    case 'medium':   return 'medium'
    case 'low':      return 'low'
    default:         return 'none'
  }
}

function mapLinearPriority(p: number): Priority {
  switch (p) {
    case 1: return 'critical'
    case 2: return 'high'
    case 3: return 'medium'
    case 4: return 'low'
    default: return 'none'
  }
}

const LINEAR_QUERY = `
  query BugIssues($filter: IssueFilter) {
    issues(filter: $filter, first: 100) {
      nodes {
        identifier
        title
        state { name }
        priority
        createdAt
        url
      }
    }
  }
`

export async function fetchJiraBugs(jira: JiraSettings): Promise<Bug[]> {
  const base = jira.baseUrl.replace(/\/$/, '')
  const projectKeys = jira.projects.map((p) => p.projectKey).filter(Boolean)
  const projectClause = projectKeys.length > 0
    ? `project in (${projectKeys.map((k) => `"${k}"`).join(',')}) AND `
    : ''
  const jql = `${projectClause}issuetype = Bug ORDER BY created DESC`
  const auth = Buffer.from(`${jira.email}:${jira.apiToken}`).toString('base64')

  const res = await fetch(`${base}/rest/api/3/search/jql`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ jql, fields: ['summary', 'status', 'priority', 'created'], maxResults: 100 }),
  })

  if (!res.ok) throw new Error(`Jira returned ${res.status}`)

  const data = await res.json()
  return (data.issues ?? []).map((issue: Record<string, unknown>) => {
    const fields = issue.fields as Record<string, unknown>
    const status = fields.status as Record<string, unknown> | undefined
    const priority = fields.priority as Record<string, unknown> | undefined
    return {
      id: issue.key as string,
      title: fields.summary as string,
      status: (status?.name as string | undefined) ?? 'Unknown',
      priority: mapJiraPriority(priority?.name as string | undefined),
      platform: 'jira' as const,
      createdAt: new Date(fields.created as string),
      url: `${base}/browse/${issue.key}`,
    }
  })
}

export async function fetchLinearBugs(linear: LinearSettings): Promise<Bug[]> {
  const parsedTeamIds = typeof linear.teamIds === 'string'
    ? linear.teamIds.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const filter: Record<string, unknown> = {}
  if (parsedTeamIds.length > 0) filter.team = { key: { in: parsedTeamIds } }
  if (linear.filterLabel) filter.labels = { some: { name: { eq: linear.filterLabel } } }

  const variables = Object.keys(filter).length > 0 ? { filter } : {}

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: linear.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: LINEAR_QUERY, variables }),
  })

  if (!res.ok) throw new Error(`Linear returned ${res.status}`)

  const data = await res.json()
  if (data.errors?.length) throw new Error(data.errors[0].message)

  return (data.data?.issues?.nodes ?? []).map((node: Record<string, unknown>) => {
    const state = node.state as Record<string, unknown> | undefined
    return {
      id: node.identifier as string,
      title: node.title as string,
      status: (state?.name as string | undefined) ?? 'Unknown',
      priority: mapLinearPriority(node.priority as number),
      platform: 'linear' as const,
      createdAt: new Date(node.createdAt as string),
      url: node.url as string | undefined,
    }
  })
}
