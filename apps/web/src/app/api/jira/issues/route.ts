import type { Bug, Priority } from '@/lib/types'

function mapPriority(name: string | undefined): Priority {
  switch (name?.toLowerCase()) {
    case 'highest':
    case 'critical': return 'critical'
    case 'high':     return 'high'
    case 'medium':   return 'medium'
    case 'low':      return 'low'
    default:         return 'none'
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { baseUrl, email, apiToken, projectKeys } = body ?? {}

  if (!baseUrl || !email || !apiToken) {
    return Response.json({ error: 'Missing required credentials' }, { status: 400 })
  }

  if (!baseUrl.startsWith('https://')) {
    return Response.json({ error: 'Base URL must start with https://' }, { status: 400 })
  }

  const base = baseUrl.replace(/\/$/, '')

  const projectClause =
    Array.isArray(projectKeys) && projectKeys.length > 0
      ? `project in (${projectKeys.map((k: string) => `"${k}"`).join(',')}) AND `
      : ''

  const jql = `${projectClause}issuetype = Bug ORDER BY created DESC`

  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')

  let res: Response
  try {
    res = await fetch(`${base}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ jql, fields: ['summary', 'status', 'priority', 'created'], maxResults: 100 }),
    })
  } catch (err) {
    return Response.json({ error: 'Could not reach Jira — check the base URL' }, { status: 502 })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const status = res.status >= 500 ? 502 : res.status
    return Response.json({ error: `Jira returned ${res.status}: ${text}` }, { status })
  }

  const data = await res.json()

  const bugs: Bug[] = (data.issues ?? []).map((issue: Record<string, unknown>) => {
    const fields = issue.fields as Record<string, unknown>
    const status = fields.status as Record<string, unknown> | undefined
    const priority = fields.priority as Record<string, unknown> | undefined
    return {
      id: issue.key as string,
      title: fields.summary as string,
      status: (status?.name as string | undefined) ?? 'Unknown',
      priority: mapPriority(priority?.name as string | undefined),
      platform: 'jira' as const,
      createdAt: new Date(fields.created as string),
      url: `${base}/browse/${issue.key}`,
    }
  })

  return Response.json({ bugs })
}
