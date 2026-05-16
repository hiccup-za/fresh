'use client'

import { useState, useEffect } from 'react'
import { JiraPanel } from '@/components/settings/jira-panel'
import { LinearPanel } from '@/components/settings/linear-panel'
import { SlackPanel } from '@/components/settings/slack-panel'
import type { AppSettings } from '@/lib/types'

const MOCK_ACCOUNT = {
  name: 'Chris',
  email: 'chriszeuch.cz@gmail.com',
  plan: 'Free' as 'Free' | 'Pro',
}

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
    showTestIds: false,
    userPlan: 'Free',
  },
}

function Toggle({ enabled, onToggle, testId }: { enabled: boolean; onToggle: () => void; testId?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      data-testid={testId}
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
  const [accountName, setAccountName] = useState(MOCK_ACCOUNT.name)

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
        <p className="text-sm text-[#888]">Manage your account and platform integrations</p>
      </div>

      {/* Account */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white mb-1">Account</h2>
        <p className="text-sm text-[#888]">Your profile and subscription details</p>
      </div>

      <div data-testid="settings-account-container" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden mb-8">
        <div className="p-5 flex flex-col gap-5">
          {/* Name + Plan side by side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888] font-medium">Name</label>
              <input
                data-testid="settings-account-name"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Your name"
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors"
              />
            </div>

            {/* Plan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#888] font-medium">Plan</label>
              <div className="flex items-center gap-3 flex-wrap">
                {settings.developer.userPlan === 'Pro' ? (
                  <span data-testid="settings-account-plan" className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    Pro
                  </span>
                ) : (
                  <>
                    <span data-testid="settings-account-plan" className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-[#1a1a1a] text-[#888] border border-[#333]">
                      Free
                    </span>
                    <button data-testid="settings-account-upgrade-btn" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1L2 5.5l4.2-.9L8 1Z" fill="currentColor" />
                      </svg>
                      Upgrade to Pro
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#888] font-medium">Email</label>
            <p data-testid="settings-account-email" className="text-sm text-[#666]">{MOCK_ACCOUNT.email}</p>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white mb-1">Data Sources</h2>
        <p className="text-sm text-[#888]">Connect your bug tracking platforms</p>
      </div>

      <div data-testid="settings-data-sources-container" className="grid grid-cols-2 gap-4 mb-8">
        {/* Linear */}
        <div data-testid="settings-linear-container" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Linear</span>
              {settings.linear.enabled && (
                settings.developer.enableMockData
                  ? <span data-testid="settings-linear-badge" className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">Mock</span>
                  : <span data-testid="settings-linear-badge" className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">Live</span>
              )}
            </div>
            <Toggle
              testId="settings-linear-toggle"
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
        <div data-testid="settings-jira-container" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Jira</span>
              {settings.jira.enabled && (
                settings.developer.enableMockData
                  ? <span data-testid="settings-jira-badge" className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">Mock</span>
                  : <span data-testid="settings-jira-badge" className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">Live</span>
              )}
            </div>
            <Toggle
              testId="settings-jira-toggle"
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

      <div data-testid="settings-slack-container" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6">
        <SlackPanel
          value={settings.slack}
          onChange={(slack) => setSettings({ ...settings, slack })}
        />
      </div>

      {/* Developer */}
      <div className="mt-8 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base font-semibold text-[#f59e0b]">Developer</h2>
        </div>
        <p className="text-sm text-[#888]">Settings for development and testing purposes only</p>
      </div>

      <div data-testid="settings-developer-container" className="bg-[#0a0a0a] border border-[#f59e0b]/20 rounded-lg overflow-hidden">
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
              testId="settings-dev-mock-data-toggle"
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
          <div className="flex items-start justify-between gap-4 pt-5 pb-5 border-b border-[#f59e0b]/10">
            <div>
              <p className="text-sm font-medium text-white mb-0.5">Enable Analyze</p>
              <p className="text-xs text-[#666] max-w-sm">
                Show the Analyze button on bug rows and its side panel. Turn off to hide this
                functionality while it is not yet ready for use.
              </p>
            </div>
            <Toggle
              testId="settings-dev-analyze-toggle"
              enabled={settings.developer.enableAnalyze}
              onToggle={() =>
                setSettings({
                  ...settings,
                  developer: { ...settings.developer, enableAnalyze: !settings.developer.enableAnalyze },
                })
              }
            />
          </div>
          <div className="flex items-start justify-between gap-4 pt-5 pb-5 border-b border-[#f59e0b]/10">
            <div>
              <p className="text-sm font-medium text-white mb-0.5">Show Data Test IDs</p>
              <p className="text-xs text-[#666] max-w-sm">
                Highlight elements that have a <code className="font-mono text-[#f59e0b]/80">data-testid</code> attribute and display their tag name as an overlay. Useful for verifying test selector coverage.
              </p>
            </div>
            <Toggle
              testId="settings-dev-show-test-ids-toggle"
              enabled={settings.developer.showTestIds}
              onToggle={() =>
                setSettings({
                  ...settings,
                  developer: { ...settings.developer, showTestIds: !settings.developer.showTestIds },
                })
              }
            />
          </div>
          <div className="flex items-start justify-between gap-4 pt-5">
            <div>
              <p className="text-sm font-medium text-white mb-0.5">User Plan</p>
              <p className="text-xs text-[#666] max-w-sm">
                Simulate a Free or Pro account to test plan-gated UI.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                data-testid="settings-dev-plan-free-btn"
                type="button"
                onClick={() => setSettings({ ...settings, developer: { ...settings.developer, userPlan: 'Free' } })}
                className={[
                  'px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors',
                  settings.developer.userPlan === 'Free'
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40'
                    : 'bg-transparent text-[#444] border-[#2a2a2a] hover:text-[#666] hover:border-[#333]',
                ].join(' ')}
              >
                Free
              </button>
              <button
                data-testid="settings-dev-plan-pro-btn"
                type="button"
                onClick={() => setSettings({ ...settings, developer: { ...settings.developer, userPlan: 'Pro' } })}
                className={[
                  'px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors',
                  settings.developer.userPlan === 'Pro'
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40'
                    : 'bg-transparent text-[#444] border-[#2a2a2a] hover:text-[#666] hover:border-[#333]',
                ].join(' ')}
              >
                Pro
              </button>
            </div>
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
          data-testid="settings-save-btn"
          onClick={save}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-[#e5e5e5] transition-colors"
        >
          Save settings
        </button>
      </div>
    </div>
  )
}
