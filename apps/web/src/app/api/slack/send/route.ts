import { jiraBugs } from '@/lib/mock/jira'
import { linearBugs } from '@/lib/mock/linear'
import { buildSlackReport } from '@/lib/slack'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const webhookUrl: string | undefined = body?.webhookUrl

  if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
    return Response.json({ error: 'Invalid or missing webhook URL' }, { status: 400 })
  }

  const payload = buildSlackReport([...jiraBugs, ...linearBugs])

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    return Response.json({ error: `Slack returned ${res.status}: ${text}` }, { status: 502 })
  }

  return Response.json({ ok: true })
}
