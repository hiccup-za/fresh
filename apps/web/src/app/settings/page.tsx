'use client'

import { useState, useEffect } from 'react'
import { JiraPanel } from '@/components/settings/jira-panel'
import { LinearPanel } from '@/components/settings/linear-panel'
import { SlackPanel } from '@/components/settings/slack-panel'
import type { AppSettings } from '@/lib/types'

const STORAGE_KEY = 'fresh-settings'

const defaults: AppSettings = {
  jira: {
    enabled: false,
    baseUrl: '',
    email: '',
    apiToken: '',
    projects: [],
  },
  linear: {
    enabled: false,
    apiKey: '',
    teamIds: '',
    filterLabel: 'Bug',
  },
  slack: {
    webhookUrl: '',
    schedule: '',
  },
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={[
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none',
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaults)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }))
    } catch {}
  }, [])

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    window.dispatchEvent(new Event('fresh-settings-changed'))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-8 pt-6 pb-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Settings</h1>
        <p className="text-sm text-[#888]">Configure your task management platform integrations</p>
      </div>

      {/* Bug trackers — side by side, Linear left */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Linear */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
            <span className="text-sm font-semibold text-white">Linear</span>
            <Toggle
              enabled={settings.linear.enabled}
              onToggle={() =>
                setSettings({
                  ...settings,
                  linear: { ...settings.linear, enabled: !settings.linear.enabled },
                })
              }
            />
          </div>
          <div
            className={[
              'p-5 transition-opacity',
              settings.linear.enabled ? '' : 'opacity-40 pointer-events-none select-none',
            ].join(' ')}
          >
            <LinearPanel
              value={settings.linear}
              onChange={(linear) => setSettings({ ...settings, linear })}
            />
          </div>
        </div>

        {/* Jira */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
            <span className="text-sm font-semibold text-white">Jira</span>
            <Toggle
              enabled={settings.jira.enabled}
              onToggle={() =>
                setSettings({
                  ...settings,
                  jira: { ...settings.jira, enabled: !settings.jira.enabled },
                })
              }
            />
          </div>
          <div
            className={[
              'p-5 transition-opacity',
              settings.jira.enabled ? '' : 'opacity-40 pointer-events-none select-none',
            ].join(' ')}
          >
            <JiraPanel
              value={settings.jira}
              onChange={(jira) => setSettings({ ...settings, jira })}
            />
          </div>
        </div>
      </div>

      {/* Slack */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white mb-1">Slack</h2>
        <p className="text-sm text-[#888]">Send scheduled bug freshness reports to a Slack channel</p>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
        <SlackPanel
          value={settings.slack}
          onChange={(slack) => setSettings({ ...settings, slack })}
        />
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && (
          <span className="text-xs text-[#22c55e] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Saved
          </span>
        )}
        <button
          onClick={save}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-[#e5e5e5] transition-colors"
        >
          Save settings
        </button>
      </div>
    </div>
  )
}
