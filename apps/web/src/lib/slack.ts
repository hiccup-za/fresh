import type { Bug, SlackMessageFormat } from './types'
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

export const DEFAULT_FORMAT: SlackMessageFormat = {
  title: 'Fresh — Bug Freshness Report',
  introText: '',
  showDate: true,
  showStatsSummary: true,
  showEmoji: true,
  showStaleList: true,
  maxStaleBugs: 10,
  showDecayingList: false,
  maxDecayingBugs: 10,
  bugRowFields: {
    priority: true,
    status: true,
    age: true,
    platform: true,
  },
  footerText: '',
}

export function buildSlackReport(bugs: Bug[], format?: Partial<SlackMessageFormat>) {
  const fmt: SlackMessageFormat = {
    ...DEFAULT_FORMAT,
    ...format,
    bugRowFields: { ...DEFAULT_FORMAT.bugRowFields, ...format?.bugRowFields },
  }

  const classified = bugs.map((b) => ({ ...b, freshness: getFreshness(b.createdAt) }))
  const fresh = classified.filter((b) => b.freshness === 'fresh')
  const decaying = classified.filter((b) => b.freshness === 'decaying')
  const stale = classified.filter((b) => b.freshness === 'stale')
  const total = bugs.length

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  function bugRowText(bug: Bug) {
    const ageInDays = Math.floor((Date.now() - bug.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const titleText = bug.url ? `<${bug.url}|${bug.id}>` : bug.id
    const parts: string[] = []
    if (fmt.bugRowFields.priority) parts.push(PRIORITY_LABEL[bug.priority])
    if (fmt.bugRowFields.status) parts.push(bug.status)
    if (fmt.bugRowFields.age) parts.push(`${ageInDays}d old`)
    if (fmt.bugRowFields.platform) parts.push(bug.platform)
    const detail = parts.join(' · ')
    return `*${titleText}* · ${bug.title}${detail ? '\n' + detail : ''}`
  }

  const blocks: object[] = []

  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: fmt.title || DEFAULT_FORMAT.title, emoji: true },
  })

  if (fmt.introText.trim()) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: fmt.introText } })
  }

  if (fmt.showDate) {
    blocks.push({ type: 'context', elements: [{ type: 'plain_text', text: date }] })
  }

  if (fmt.showStatsSummary) {
    const e = (key: string) => fmt.showEmoji ? `${FRESHNESS_EMOJI[key]} ` : ''
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Total bugs*\n${total}` },
        { type: 'mrkdwn', text: `${e('fresh')}*Fresh* (<30d)\n${fresh.length}` },
        { type: 'mrkdwn', text: `${e('decaying')}*Decaying* (30–60d)\n${decaying.length}` },
        { type: 'mrkdwn', text: `${e('stale')}*Stale* (>60d)\n${stale.length}` },
      ],
    })
  }

  if (fmt.showDecayingList && decaying.length > 0) {
    const limit = Math.max(1, Math.min(20, fmt.maxDecayingBugs))
    const icon = fmt.showEmoji ? ':large_yellow_circle: ' : ''
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*${icon}Decaying bugs (${decaying.length})*` },
    })
    for (const bug of decaying.slice(0, limit)) {
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: bugRowText(bug) } })
    }
    if (decaying.length > limit) {
      blocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `_…and ${decaying.length - limit} more decaying bugs_` }],
      })
    }
  }

  if (fmt.showStaleList && stale.length > 0) {
    const limit = Math.max(1, Math.min(20, fmt.maxStaleBugs))
    const icon = fmt.showEmoji ? ':red_circle: ' : ''
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*${icon}Stale bugs requiring attention (${stale.length})*` },
    })
    for (const bug of stale.slice(0, limit)) {
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: bugRowText(bug) } })
    }
    if (stale.length > limit) {
      blocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `_…and ${stale.length - limit} more stale bugs_` }],
      })
    }
  }

  if (fmt.footerText.trim()) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: fmt.footerText }],
    })
  }

  return { blocks }
}
