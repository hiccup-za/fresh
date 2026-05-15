import type { Freshness } from './types'

const DAY_MS = 1000 * 60 * 60 * 24

export function getFreshness(createdAt: Date): Freshness {
  const ageInDays = (Date.now() - createdAt.getTime()) / DAY_MS
  if (ageInDays < 30) return 'fresh'
  if (ageInDays < 60) return 'decaying'
  return 'stale'
}

export function getShortRelativeTime(date: Date): string {
  const ms = Date.now() - date.getTime()
  const minutes = Math.floor(ms / (1000 * 60))
  if (minutes < 2) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(ms / DAY_MS)
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export function getRelativeTime(date: Date): string {
  const ageInDays = Math.floor((Date.now() - date.getTime()) / DAY_MS)
  if (ageInDays === 0) return 'today'
  if (ageInDays === 1) return '1 day ago'
  if (ageInDays < 30) return `${ageInDays} days ago`
  const months = Math.floor(ageInDays / 30)
  if (months === 1) return '1 month ago'
  return `${months} months ago`
}
