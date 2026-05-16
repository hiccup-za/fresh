'use client'

import { useState } from 'react'
import type { LinearSettings } from '@/lib/types'

interface Props {
  value: LinearSettings
  onChange: (v: LinearSettings) => void
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#888] font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors font-mono"
      />
      {hint && <p className="text-[11px] text-[#555]">{hint}</p>}
    </div>
  )
}

export function LinearPanel({ value, onChange }: Props) {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#888] font-medium">API Key</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={value.apiKey}
            onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
            placeholder="lin_api_••••••••••••••••"
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 pr-10 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
          >
            {showKey ? (
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
      </div>

      <Field
        label="Team IDs"
        value={value.teamIds}
        onChange={(v) => onChange({ ...value, teamIds: v })}
        placeholder="team-id-1, team-id-2"
        hint="Comma-separated Linear team IDs"
      />

      <Field
        label="Filter Label"
        value={value.filterLabel}
        onChange={(v) => onChange({ ...value, filterLabel: v })}
        placeholder="Bug"
        hint="Only issues with this label will be fetched"
      />
    </div>
  )
}
