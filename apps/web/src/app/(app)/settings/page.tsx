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
  developer: {
    enableMockData: true,
    enableAnalyze: true,
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
      if (raw) {
        const saved = JSON.parse(raw)
        setSettings({
          jira:      { ...defaults.jira,      ...saved.jira },
          linear:    { ...defaults.linear,    ...saved.linear },
          slack:     { ...defaults.slack,     ...saved.slack },
          developer: { ...defaults.developer, ...saved.developer },
        })
      }
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

      {/* Developer */}
      <div className="mt-8 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base font-semibold text-[#f59e0b]">Developer</h2>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            DEV
          </span>
        </div>
        <p className="text-sm text-[#888]">Settings for development and testing purposes only</p>
      </div>

      <div className="bg-[#0a0a0a] border border-[#f59e0b]/20 rounded-lg overflow-hidden">
        <div className="px-1 py-0.5 bg-[#f59e0b]/5 border-b border-[#f59e0b]/20">
          <span className="px-2 text-[9px] font-bold tracking-widest uppercase text-[#f59e0b]/60">
            Developer options
          </span>
        </div>
        <div className="p-5 flex flex-col divide-y divide-[#f59e0b]/10">
          <div className="flex items-start justify-between gap-4 pb-5">
            <div>
              <p className="text-sm font-medium text-white mb-0.5">Enable Mock Data</p>
              <p className="text-xs text-[#666] max-w-sm">
                Populate the dashboard with sample Jira and Linear bugs. Turn off to simulate a clean
                first-run experience with no connected data sources.
              </p>
            </div>
            <Toggle
              enabled={settings.developer.enableMockData}
              onToggle={() => {
                const enabling = !settings.developer.enableMockData
                setSettings({
                  ...settings,
                  linear:    { ...settings.linear,    enabled: enabling },
                  jira:      { ...settings.jira,      enabled: enabling },
                  developer: { ...settings.developer, enableMockData: enabling },
                })
              }}
            />
          </div>
          <div className="flex items-start justify-between gap-4 pt-5">
            <div>
              <p className="text-sm font-medium text-white mb-0.5">Enable Analyze</p>
              <p className="text-xs text-[#666] max-w-sm">
                Show the Analyze button on bug rows and its side panel. Turn off to hide this
                functionality while it is not yet ready for use.
              </p>
            </div>
            <Toggle
              enabled={settings.developer.enableAnalyze}
              onToggle={() =>
                setSettings({
                  ...settings,
                  developer: { ...settings.developer, enableAnalyze: !settings.developer.enableAnalyze },
                })
              }
            />
          </div>
        </div>
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
