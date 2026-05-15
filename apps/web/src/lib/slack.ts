import type { Bug } from './types'
import { getFreshness } from './classify'

const FRESHNESS_EMOJI: Record<string, string> = {
  fresh: ':large_green_circle:',
  decaying: ':large_yellow_circle:',
  stale: ':red_circle:',
}

const PRIORITY_LABEL: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: '—',
}

export function buildSlackReport(bugs: Bug[]) {
  const classified = bugs.map((b) => ({ ...b, freshness: getFreshness(b.createdAt) }))
  const fresh = classified.filter((b) => b.freshness === 'fresh').length
  const decaying = classified.filter((b) => b.freshness === 'decaying').length
  const stale = classified.filter((b) => b.freshness === 'stale')
  const total = bugs.length

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const blocks: object[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: 'Fresh — Bug Freshness Report', emoji: true },
    },
    {
      type: 'context',
      elements: [{ type: 'plain_text', text: date }],
    },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Total bugs*\n${total}` },
        { type: 'mrkdwn', text: `${FRESHNESS_EMOJI.fresh} *Fresh* (<30d)\n${fresh}` },
        { type: 'mrkdwn', text: `${FRESHNESS_EMOJI.decaying} *Decaying* (30–60d)\n${decaying}` },
        { type: 'mrkdwn', text: `${FRESHNESS_EMOJI.stale} *Stale* (>60d)\n${stale.length}` },
      ],
    },
  ]

  if (stale.length > 0) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*:red_circle: Stale bugs requiring attention (${stale.length})*`,
      },
    })

    for (const bug of stale.slice(0, 10)) {
      const ageInDays = Math.floor((Date.now() - bug.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const titleText = bug.url ? `<${bug.url}|${bug.id}>` : bug.id
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${titleText}* · ${bug.title}\n${PRIORITY_LABEL[bug.priority]} · ${bug.status} · ${ageInDays}d old · ${bug.platform}`,
        },
      })
    }

    if (stale.length > 10) {
      blocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `_…and ${stale.length - 10} more stale bugs_` }],
      })
    }
  }

  return { blocks }
}
