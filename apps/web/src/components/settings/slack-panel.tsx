'use client'

import { useState } from 'react'
import type { SlackSettings } from '@/lib/types'

interface Props {
  value: SlackSettings
  onChange: (v: SlackSettings) => void
}

const SCHEDULE_OPTIONS = [
  { value: '', label: 'Disabled' },
  { value: 'daily-9am', label: 'Daily at 9am' },
  { value: 'daily-5pm', label: 'Daily at 5pm' },
  { value: 'weekly-mon', label: 'Weekly on Monday' },
  { value: 'weekly-fri', label: 'Weekly on Friday' },
]

type SendState = 'idle' | 'sending' | 'success' | 'error'

export function SlackPanel({ value, onChange }: Props) {
  const [showWebhook, setShowWebhook] = useState(false)
  const [sendState, setSendState] = useState<SendState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function sendNow() {
    if (!value.webhookUrl) return
    setSendState('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/slack/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: value.webhookUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Unknown error')
        setSendState('error')
      } else {
        setSendState('success')
        setTimeout(() => setSendState('idle'), 3000)
      }
    } catch {
      setErrorMsg('Network error')
      setSendState('error')
    }
  }

  return (
    <div className="space-y-5">
      {/* Webhook URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#888] font-medium">Webhook URL</label>
        <div className="relative">
          <input
            type={showWebhook ? 'text' : 'password'}
            value={value.webhookUrl}
            onChange={(e) => onChange({ ...value, webhookUrl: e.target.value })}
            placeholder="https://hooks.slack.com/services/…"
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 pr-10 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => setShowWebhook(!showWebhook)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
          >
            {showWebhook ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M6.5 6.6A3 3 0 0 0 8 11a3 3 0 0 0 2.4-4.9M4.2 4.3C2.6 5.3 1 8 1 8s2.5 5 7 5a8 8 0 0 0 3.8-1M9.7 3.3A5 5 0 0 0 8 3C3.5 3 1 8 1 8s.5 1 1.5 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[11px] text-[#444]">
          Create an Incoming Webhook in your Slack app settings
        </p>
      </div>

      {/* Schedule */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#888] font-medium">Schedule</label>
        <select
          value={value.schedule}
          onChange={(e) => onChange({ ...value, schedule: e.target.value })}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#333] transition-colors appearance-none"
        >
          {SCHEDULE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-[#444]">Automated delivery coming soon — use Send now to test</p>
      </div>

      {/* Send now */}
      <div className="pt-1 flex items-center gap-3">
        <button
          type="button"
          onClick={sendNow}
          disabled={!value.webhookUrl || sendState === 'sending'}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm font-medium rounded-md hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sendState === 'sending' ? 'Sending…' : 'Send now'}
        </button>

        {sendState === 'success' && (
          <span className="text-xs text-[#22c55e] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sent
          </span>
        )}

        {sendState === 'error' && (
          <span className="text-xs text-[#ef4444]">{errorMsg || 'Failed to send'}</span>
        )}
      </div>
    </div>
  )
}
