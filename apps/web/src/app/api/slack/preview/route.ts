import type { Bug } from '@/lib/types'
import { jiraBugs } from '@/lib/mock/jira'
import { linearBugs } from '@/lib/mock/linear'
import { buildSlackReport } from '@/lib/slack'
import { fetchJiraBugs, fetchLinearBugs } from '@/lib/slack-fetch'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const settings = body?.settings

  const enableMockData = settings?.developer?.enableMockData ?? true

  let bugs: Bug[]

  if (enableMockData) {
    bugs = [...jiraBugs, ...linearBugs]
  } else {
    const fetches: Promise<Bug[]>[] = []

    if (settings?.jira?.enabled && settings.jira.baseUrl && settings.jira.email && settings.jira.apiToken) {
      fetches.push(fetchJiraBugs(settings.jira).catch(() => []))
    }

    if (settings?.linear?.enabled && settings.linear.apiKey) {
      fetches.push(fetchLinearBugs(settings.linear).catch(() => []))
    }

    bugs = (await Promise.all(fetches)).flat()
  }

  return Response.json(buildSlackReport(bugs, settings?.slack?.messageFormat))
}
