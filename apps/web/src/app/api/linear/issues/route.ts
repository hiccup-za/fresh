import type { Bug, Priority } from '@/lib/types'

// Linear priority: 0=None 1=Urgent 2=High 3=Medium 4=Low
function mapPriority(p: number): Priority {
  switch (p) {
    case 1: return 'critical'
    case 2: return 'high'
    case 3: return 'medium'
    case 4: return 'low'
    default: return 'none'
  }
}

const QUERY = `
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { apiKey, teamIds, filterLabel } = body ?? {}

  if (!apiKey) {
    return Response.json({ error: 'Missing API key' }, { status: 400 })
  }

  const parsedTeamIds: string[] = Array.isArray(teamIds)
    ? teamIds
    : typeof teamIds === 'string'
      ? teamIds.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

  const filter: Record<string, unknown> = {}
  if (parsedTeamIds.length > 0) {
    filter.team = { key: { in: parsedTeamIds } }
  }
  if (filterLabel) {
    filter.labels = { some: { name: { eq: filterLabel } } }
  }

  // Omit filter variable when empty — Linear rejects {}
  const variables = Object.keys(filter).length > 0 ? { filter } : {}

  let res: Response
  try {
    res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY, variables }),
    })
  } catch {
    return Response.json({ error: 'Could not reach Linear — check your API key' }, { status: 502 })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const status = res.status >= 500 ? 502 : res.status
    return Response.json({ error: `Linear returned ${res.status}: ${text}` }, { status })
  }

  const data = await res.json()

  if (data.errors?.length) {
    const detail = data.errors.map((e: { message: string; extensions?: unknown }) =>
      JSON.stringify({ message: e.message, extensions: e.extensions })
    ).join('; ')
    return Response.json({ error: detail }, { status: 400 })
  }

  const bugs: Bug[] = (data.data?.issues?.nodes ?? []).map((node: Record<string, unknown>) => {
    const state = node.state as Record<string, unknown> | undefined
    return {
      id: node.identifier as string,
      title: node.title as string,
      status: (state?.name as string | undefined) ?? 'Unknown',
      priority: mapPriority(node.priority as number),
      platform: 'linear' as const,
      createdAt: new Date(node.createdAt as string),
      url: node.url as string | undefined,
    }
  })

  return Response.json({ bugs })
}
