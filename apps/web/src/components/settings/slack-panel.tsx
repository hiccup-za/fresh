'use client'

import { useState, useRef, useEffect } from 'react'
import type { AppSettings, SlackBugRowFields, SlackMessageFormat, SlackSettings } from '@/lib/types'
import { DEFAULT_FORMAT } from '@/lib/slack'

interface Props {
  value: SlackSettings
  settings: AppSettings
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

// ─── Block Kit renderer ────────────────────────────────────────────────────────

type SlackBlock = Record<string, unknown>

function renderMrkdwn(text: string): string {
  const links: { placeholder: string; url: string; label: string }[] = []
  const withPlaceholders = text.replace(/<([^|>\s]+)\|([^>]+)>/g, (_, url, label) => {
    const placeholder = `\x00${links.length}\x00`
    links.push({ placeholder, url, label })
    return placeholder
  })

  let html = withPlaceholders
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html
    .replace(/:large_green_circle:/g, '🟢')
    .replace(/:large_yellow_circle:/g, '🟡')
    .replace(/:red_circle:/g, '🔴')

  html = html
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')

  for (const { placeholder, url, label } of links) {
    const safeUrl = url.replace(/"/g, '%22')
    const safeLabel = label
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    html = html.replace(
      placeholder,
      `<a href="${safeUrl}" target="_blank" rel="noreferrer" class="text-[#1d9bd1] hover:underline">${safeLabel}</a>`,
    )
  }

  return html
}

function Mrkdwn({ text }: { text: string }) {
  return <span dangerouslySetInnerHTML={{ __html: renderMrkdwn(text) }} />
}

function BlockKitPreview({ blocks }: { blocks: SlackBlock[] }) {
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div data-testid="slack-preview-container" className="rounded-lg overflow-hidden bg-[#1a1d21] text-sm">
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded bg-[#4A154B] flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
            F
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-white font-bold text-sm">Fresh</span>
            <span className="text-[10px] font-semibold px-1 py-px rounded bg-[#2d2d2d] text-[#777] tracking-wide">APP</span>
            <span className="text-[#555] text-xs">{time}</span>
          </div>
        </div>

        <div className="ml-11 space-y-2.5">
          {blocks.map((block, i) => {
            const type = block.type as string

            if (type === 'header') {
              const t = (block.text as { text: string }).text
              return <p key={i} className="text-white font-bold text-[15px] leading-snug">{t}</p>
            }

            if (type === 'divider') {
              return <hr key={i} className="border-[#2d2d2d]" />
            }

            if (type === 'context') {
              const elements = block.elements as { type: string; text: string }[]
              return (
                <div key={i} className="flex flex-wrap gap-2">
                  {elements.map((el, j) => (
                    <span key={j} className="text-[#777] text-xs">
                      {el.type === 'mrkdwn' ? <Mrkdwn text={el.text} /> : el.text}
                    </span>
                  ))}
                </div>
              )
            }

            if (type === 'section') {
              const fields = block.fields as { type: string; text: string }[] | undefined
              const text = block.text as { type: string; text: string } | undefined

              if (fields) {
                return (
                  <div key={i} className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                    {fields.map((f, j) => (
                      <div key={j} className="text-[#ccc] text-xs leading-relaxed">
                        {f.type === 'mrkdwn' ? <Mrkdwn text={f.text} /> : f.text}
                      </div>
                    ))}
                  </div>
                )
              }

              if (text) {
                return (
                  <div key={i} className="text-[#ccc] text-xs leading-relaxed">
                    {text.type === 'mrkdwn' ? <Mrkdwn text={text.text} /> : text.text}
                  </div>
                )
              }
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function Toggle({ enabled, onToggle, testId }: { enabled: boolean; onToggle: () => void; testId?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      data-testid={testId}
      className={[
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0',
        enabled ? 'bg-[#22c55e]' : 'bg-[#333]',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
          enabled ? 'translate-x-[18px]' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  )
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs text-[#ccc]">{label}</p>
        {sub && <p className="text-[11px] text-[#555]">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-[#444] uppercase tracking-widest pt-1">{children}</p>
  )
}

function Divider() {
  return <div className="border-t border-[#1a1a1a]" />
}

function NumInput({
  value,
  onChange,
  testId,
}: {
  value: number
  onChange: (n: number) => void
  testId?: string
}) {
  return (
    <input
      data-testid={testId}
      type="number"
      min={1}
      max={20}
      value={value}
      onChange={(e) => onChange(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
      className="w-14 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-[#333] transition-colors"
    />
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SlackPanel({ value, settings, onChange }: Props) {
  const [showWebhook, setShowWebhook] = useState(false)
  const [sendState, setSendState] = useState<SendState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const scheduleRef = useRef<HTMLDivElement>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewBlocks, setPreviewBlocks] = useState<SlackBlock[] | null>(null)
  const [previewError, setPreviewError] = useState('')

  useEffect(() => {
    if (!scheduleOpen) return
    function handler(e: MouseEvent) {
      if (scheduleRef.current && !scheduleRef.current.contains(e.target as Node)) {
        setScheduleOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [scheduleOpen])

  const selectedLabel = SCHEDULE_OPTIONS.find((o) => o.value === value.schedule)?.label ?? 'Disabled'

  // Resolved format with defaults filled in
  const fmt: SlackMessageFormat = {
    ...DEFAULT_FORMAT,
    ...value.messageFormat,
    bugRowFields: { ...DEFAULT_FORMAT.bugRowFields, ...value.messageFormat?.bugRowFields },
  }

  function updateFormat(patch: Partial<SlackMessageFormat>) {
    onChange({ ...value, messageFormat: { ...fmt, ...patch } })
  }

  function updateBugRowField(field: keyof SlackBugRowFields, val: boolean) {
    onChange({
      ...value,
      messageFormat: { ...fmt, bugRowFields: { ...fmt.bugRowFields, [field]: val } },
    })
  }

  async function loadPreview() {
    if (previewOpen) { setPreviewOpen(false); return }
    setPreviewLoading(true)
    setPreviewError('')
    try {
      const res = await fetch('/api/slack/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPreviewError(data.error ?? 'Failed to load preview')
      } else {
        setPreviewBlocks(data.blocks)
        setPreviewOpen(true)
      }
    } catch {
      setPreviewError('Network error')
    } finally {
      setPreviewLoading(false)
    }
  }

  async function sendNow() {
    if (!value.webhookUrl) return
    setSendState('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/slack/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: value.webhookUrl, settings }),
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

  const inputCls = 'w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors'

  return (
    <div className="flex flex-col gap-4">
    <div data-testid="settings-slack-connection-container" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-5">
      {/* Webhook URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#888] font-medium">Webhook URL</label>
        <div className="relative">
          <input
            data-testid="slack-webhook-url"
            type={showWebhook ? 'text' : 'password'}
            value={value.webhookUrl}
            onChange={(e) => onChange({ ...value, webhookUrl: e.target.value })}
            placeholder="https://hooks.slack.com/services/…"
            className={`${inputCls} pr-10 font-mono`}
          />
          <button
            data-testid="slack-webhook-reveal"
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
        <p className="text-[11px] text-[#555]">Create an Incoming Webhook in your Slack app settings</p>
      </div>

      {/* Schedule */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#888] font-medium">Schedule</label>
        <div ref={scheduleRef} className="relative">
          <button
            data-testid="slack-schedule"
            type="button"
            onClick={() => setScheduleOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white hover:border-[#333] focus:outline-none transition-colors"
          >
            <span>{selectedLabel}</span>
            <svg
              width="12" height="12" viewBox="0 0 10 10" fill="none"
              className={`shrink-0 transition-transform text-[#555] ${scheduleOpen ? 'rotate-180' : ''}`}
            >
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {scheduleOpen && (
            <div
              data-testid="slack-schedule-menu"
              className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg shadow-xl overflow-hidden"
            >
              {SCHEDULE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange({ ...value, schedule: opt.value }); setScheduleOpen(false) }}
                  className={[
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    opt.value === value.schedule
                      ? 'text-white bg-[#1a1a1a]'
                      : 'text-[#888] hover:text-white hover:bg-[#111]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[11px] text-[#555]">Automated delivery coming soon — use Send now to test</p>
      </div>

      {/* Send now */}
      <div className="flex items-center gap-3">
        <button
          data-testid="slack-send-now-btn"
          type="button"
          onClick={sendNow}
          disabled={!value.webhookUrl || sendState === 'sending'}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white text-sm font-medium rounded-md hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

    <div data-testid="settings-slack-message-container" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 flex flex-col gap-5">
      {/* Message format */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-[#888] font-medium">Message format</label>
        <div className="flex flex-col gap-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md p-4">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#555]">Report title</label>
            <input
              data-testid="slack-format-title"
              type="text"
              value={fmt.title}
              onChange={(e) => updateFormat({ title: e.target.value })}
              placeholder={DEFAULT_FORMAT.title}
              className={inputCls}
            />
          </div>

          {/* Intro text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#555]">
              Intro text <span className="text-[#333]">· mrkdwn</span>
            </label>
            <textarea
              data-testid="slack-format-intro"
              rows={2}
              value={fmt.introText}
              onChange={(e) => updateFormat({ introText: e.target.value })}
              placeholder="e.g. @here please review these bugs"
              className={`${inputCls} resize-none font-mono text-xs`}
            />
          </div>

          <Divider />
          <SectionLabel>Content</SectionLabel>

          <Row label="Show date">
            <Toggle
              testId="slack-format-show-date"
              enabled={fmt.showDate}
              onToggle={() => updateFormat({ showDate: !fmt.showDate })}
            />
          </Row>

          <Row label="Show stats summary" sub="Total bugs · fresh · decaying · stale counts">
            <Toggle
              testId="slack-format-show-stats"
              enabled={fmt.showStatsSummary}
              onToggle={() => updateFormat({ showStatsSummary: !fmt.showStatsSummary })}
            />
          </Row>

          {fmt.showStatsSummary && (
            <div className="pl-4 border-l border-[#1a1a1a]">
              <Row label="Show emoji indicators">
                <Toggle
                  testId="slack-format-show-emoji"
                  enabled={fmt.showEmoji}
                  onToggle={() => updateFormat({ showEmoji: !fmt.showEmoji })}
                />
              </Row>
            </div>
          )}

          <Divider />
          <SectionLabel>Bug lists</SectionLabel>

          <Row label="Include stale bugs list" sub="Bugs older than 60 days">
            <Toggle
              testId="slack-format-stale-list"
              enabled={fmt.showStaleList}
              onToggle={() => updateFormat({ showStaleList: !fmt.showStaleList })}
            />
          </Row>

          {fmt.showStaleList && (
            <div className="pl-4 border-l border-[#1a1a1a]">
              <Row label="Max stale bugs shown">
                <NumInput
                  testId="slack-format-max-stale"
                  value={fmt.maxStaleBugs}
                  onChange={(n) => updateFormat({ maxStaleBugs: n })}
                />
              </Row>
            </div>
          )}

          <Row label="Include decaying bugs list" sub="Bugs between 30 and 60 days old">
            <Toggle
              testId="slack-format-decaying-list"
              enabled={fmt.showDecayingList}
              onToggle={() => updateFormat({ showDecayingList: !fmt.showDecayingList })}
            />
          </Row>

          {fmt.showDecayingList && (
            <div className="pl-4 border-l border-[#1a1a1a]">
              <Row label="Max decaying bugs shown">
                <NumInput
                  testId="slack-format-max-decaying"
                  value={fmt.maxDecayingBugs}
                  onChange={(n) => updateFormat({ maxDecayingBugs: n })}
                />
              </Row>
            </div>
          )}

          {(fmt.showStaleList || fmt.showDecayingList) && (
            <>
              <Divider />
              <SectionLabel>Bug row fields</SectionLabel>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {(
                  [
                    { field: 'priority', label: 'Priority', testId: 'slack-format-field-priority' },
                    { field: 'status',   label: 'Status',   testId: 'slack-format-field-status' },
                    { field: 'age',      label: 'Age',      testId: 'slack-format-field-age' },
                    { field: 'platform', label: 'Platform', testId: 'slack-format-field-platform' },
                  ] as { field: keyof SlackBugRowFields; label: string; testId: string }[]
                ).map(({ field, label, testId }) => (
                  <div key={field} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[#ccc]">{label}</span>
                    <Toggle
                      testId={testId}
                      enabled={fmt.bugRowFields[field]}
                      onToggle={() => updateBugRowField(field, !fmt.bugRowFields[field])}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <Divider />

          {/* Footer text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#555]">
              Footer text <span className="text-[#333]">· mrkdwn</span>
            </label>
            <textarea
              data-testid="slack-format-footer"
              rows={2}
              value={fmt.footerText}
              onChange={(e) => updateFormat({ footerText: e.target.value })}
              placeholder="e.g. _View full report → https://…_"
              className={`${inputCls} resize-none font-mono text-xs`}
            />
          </div>

        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col gap-3">
        <button
          data-testid="slack-preview-btn"
          type="button"
          onClick={loadPreview}
          disabled={previewLoading}
          className="self-start flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            width="12" height="12" viewBox="0 0 10 10" fill="none"
            className={`shrink-0 transition-transform ${previewOpen ? 'rotate-180' : ''}`}
          >
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {previewLoading ? 'Loading preview…' : previewOpen ? 'Hide preview' : 'Preview message'}
        </button>

        {previewError && <p className="text-xs text-[#ef4444]">{previewError}</p>}

        {previewOpen && previewBlocks && (
          <BlockKitPreview blocks={previewBlocks} />
        )}
      </div>

    </div>
    </div>
  )
}
