'use client'

import { useState } from 'react'
import type { JiraSettings, JiraProject } from '@/lib/types'

interface Props {
  value: JiraSettings
  onChange: (v: JiraSettings) => void
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  testId,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  testId?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#888] font-medium">{label}</label>
      <input
        data-testid={testId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors font-mono"
      />
    </div>
  )
}

export function JiraPanel({ value, onChange }: Props) {
  const [showToken, setShowToken] = useState(false)

  function updateProject(idx: number, field: keyof JiraProject, val: string) {
    const updated = value.projects.map((p, i) =>
      i === idx ? { ...p, [field]: val } : p
    )
    onChange({ ...value, projects: updated })
  }

  function addProject() {
    onChange({ ...value, projects: [...value.projects, { projectKey: '', boardId: '' }] })
  }

  function removeProject(idx: number) {
    onChange({ ...value, projects: value.projects.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-5">
      <Field
        label="Base URL"
        value={value.baseUrl}
        onChange={(v) => onChange({ ...value, baseUrl: v })}
        placeholder="https://company.atlassian.net"
        testId="jira-base-url"
      />
      <Field
        label="Email"
        value={value.email}
        onChange={(v) => onChange({ ...value, email: v })}
        placeholder="you@company.com"
        testId="jira-email"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#888] font-medium">API Token</label>
        <div className="relative">
          <input
            data-testid="jira-api-token"
            type={showToken ? 'text' : 'password'}
            value={value.apiToken}
            onChange={(e) => onChange({ ...value, apiToken: e.target.value })}
            placeholder="••••••••••••••••"
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 pr-10 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors font-mono"
          />
          <button
            data-testid="jira-api-token-reveal"
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
          >
            {showToken ? (
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

      {/* Projects */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[#888] font-medium">Projects</label>
          <button
            data-testid="jira-add-project-btn"
            type="button"
            onClick={addProject}
            className="text-[11px] text-[#555] hover:text-white transition-colors flex items-center gap-1"
          >
            <span>+</span> Add project
          </button>
        </div>

        {value.projects.length === 0 && (
          <p className="text-xs text-[#555] py-2">No projects added yet.</p>
        )}

        {value.projects.map((project, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              data-testid={`jira-project-key-${idx}`}
              type="text"
              value={project.projectKey}
              onChange={(e) => updateProject(idx, 'projectKey', e.target.value)}
              placeholder="Project key (e.g. ENG)"
              className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors font-mono"
            />
            <input
              data-testid={`jira-board-id-${idx}`}
              type="text"
              value={project.boardId}
              onChange={(e) => updateProject(idx, 'boardId', e.target.value)}
              placeholder="Board ID (e.g. 42)"
              className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors font-mono"
            />
            <button
              data-testid={`jira-remove-project-${idx}`}
              type="button"
              onClick={() => removeProject(idx)}
              className="text-[#555] hover:text-[#ef4444] transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
