# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands can be run from the **repo root** via Turbo, or from `apps/web/` directly.

```bash
# From repo root
bun dev        # start all apps in dev mode
bun build      # build all apps
bun typecheck  # type-check all apps

# From apps/web/
bun dev             # Next.js dev server (Turbopack, default in v16)
bun build           # production build
bun start           # serve production build
bun x tsc --noEmit  # type-check (no typecheck script in apps/web — use bun x tsc directly)
```

No test runner or linter is configured yet. `TASK.md` in the repo root contains a step-by-step plan for adding Vitest + CI + Slack CI reporting — work through that file before designing any new test infrastructure.

## Next.js version warning

This is **Next.js 16**, not 15. Before writing any Next.js-specific code, read the relevant guide in `apps/web/node_modules/next/dist/docs/`. Key breaking changes:
- `params` and `searchParams` in pages/layouts are async — must be `await`ed
- Turbopack is the default bundler for both `dev` and `build`
- `turbopack` config lives at the top level of `next.config.ts`, not under `experimental`

## Architecture

**Monorepo layout** (Turborepo + bun workspaces):
- `apps/web/` — the only application, a Next.js 16 App Router app
- `packages/` — empty, reserved for future shared packages

**Route groups** in `app/`:
- `(auth)/login` — mock-only login page; any valid-format credentials pass, no backend auth
- `(app)/dashboard` and `(app)/settings` — main app pages wrapped in the Shell layout
- `api/slack/send/` — POST route: validates webhook URL, fetches bugs (mock or live), calls `buildSlackReport(bugs, settings.slack.messageFormat)`, forwards to Slack Incoming Webhook
- `api/slack/preview/` — POST route: same data-fetching logic as send but returns `{ blocks }` directly instead of posting to Slack; used by the settings UI to render a live preview
- `api/jira/issues/` — POST route that proxies to the Jira REST API (`/rest/api/3/search/jql`) using Basic auth; normalises results to `Bug[]`; exists to avoid CORS from the browser
- `api/linear/issues/` — POST route that proxies to the Linear GraphQL API (`https://api.linear.app/graphql`); accepts `{ apiKey, teamIds, filterLabel }`; `teamIds` must be team **keys** (e.g. `"AI"`, `"ENG"`) not UUIDs — the `IssueFilter` uses `team: { key: { in: [...] } }`

**Key lib files:**

- `lib/types.ts` — all shared types: `Bug`, `Platform`, `Freshness`, `Priority`, `AnalysisRun`, `AppSettings`, `JiraSettings`, `LinearSettings`, `SlackSettings`, `SlackMessageFormat`, `SlackBugRowFields`, `DeveloperSettings`
- `lib/classify.ts` — `getFreshness(date)`, `getRelativeTime(date)`, `getShortRelativeTime(date)`
- `lib/group.ts` — `groupBugsByYearMonth(bugs)` → `BugGroup[]` sorted descending
- `lib/slack.ts` — `buildSlackReport(bugs, format?)` → Slack Block Kit payload; `DEFAULT_FORMAT` is exported and used by the settings panel to resolve defaults. `format` controls title, introText, showDate, showStatsSummary, showEmoji, stale/decaying lists with per-list max counts, per-bug row fields (priority/status/age/platform), and footerText.
- `lib/slack-fetch.ts` — `fetchJiraBugs(jira)` and `fetchLinearBugs(linear)`; shared by both `api/slack/send` and `api/slack/preview` routes to fetch live data when mock mode is off
- `lib/mock/jira.ts` — 15 Jira mock bugs (daysAgo() offsets so freshness stays current)
- `lib/mock/linear.ts` — 15 Linear mock bugs (same pattern)
- `lib/mock/analysis-history.ts` — `AnalysisRun` records keyed by bugId; `getAnalysisHistory(bugId)`

**Data flow (mock mode)**: Mock data → `dashboard/page.tsx` (server) → `BugTable` (client) as props. Freshness is derived at render time via `getFreshness(createdAt)` — never stored. Filtering (platform/priority/status/freshness) runs entirely in `BugTable` state. Settings are localStorage-only (`fresh-settings` key); `BugTable` listens for `fresh-settings-changed` and `storage` events to react to changes.

**Data flow (live mode)**: When `developer.enableMockData` is false, `BugTable` ignores the mock props and fetches live data directly. Jira and Linear each have their own state slice (`jiraEnabled/jiraLoading/jiraError/liveJiraBugs` and the equivalent `linear*` vars), their own `useEffect` fetch, and their own error banner. Both are triggered by a shared `refreshTick` counter. The active bugs are `[...liveJiraBugs, ...liveLinearBugs]`. Adding another live integration follows the same pattern — no changes needed in the server page.

**Developer settings** (`DeveloperSettings` in `AppSettings`): four flags persisted under `fresh-settings.developer` in localStorage:
- `enableMockData` — also force-enables/disables both platform toggles when flipped
- `enableAnalyze` — shows/hides the Analyze button and `AnalysisPanel`
- `showTestIds` — triggers `TestIdHighlighter` to add `data-show-test-ids` to `<html>`, which CSS uses to overlay `data-testid` labels
- `userPlan` — simulates Free/Pro gating in the Account section

**Settings page** (`(app)/settings/page.tsx`): single `'use client'` page that owns all settings state and persists to localStorage on save. Deep-merges on hydration — nested objects like `slack.messageFormat` and `slack.messageFormat.bugRowFields` are spread individually so new fields get their defaults when loading old saved data. Passes the full `AppSettings` object down to `SlackPanel` (needed so preview/send routes receive the complete settings for live data fetching).

**Slack panel** (`components/settings/slack-panel.tsx`): rendered as two separate card containers —
1. **Connection**: webhook URL input, schedule picker, Send now button
2. **Message format**: full format editor + Preview toggle

The format editor resolves a `fmt` object by spreading `DEFAULT_FORMAT` over `value.messageFormat` (including `bugRowFields`) at the top of the render function. `updateFormat(patch)` and `updateBugRowField(field, val)` are local helpers that call `onChange` with the merged result.

**`data-testid` conventions**: key interactive elements carry `data-testid` attributes (e.g. `login-email`, `settings-save-btn`, `settings-dev-mock-data-toggle`). Enable "Show Data Test IDs" in Developer settings to see all coverage at runtime.

**Freshness thresholds** (from `lib/classify.ts`): < 30 days → fresh · 30–60 days → decaying · > 60 days → stale. Computed at render time, never stored.

**Shell / Sidebar**: `Shell` (`components/layout/shell.tsx`) is a client component that holds sidebar collapse state. `Sidebar` accepts a `collapsed` prop and animates width between `w-14` (icons only) and `w-56` (icons + labels). Icons come from `@phosphor-icons/react`.

**Styling**: Tailwind CSS v4 (no `tailwind.config.ts` — import-based). Dark-mode Vercel palette: `#000` page bg, `#0a0a0a` cards, `#1a1a1a` borders. Freshness accent colors: `#22c55e` fresh · `#f59e0b` decaying · `#ef4444` stale. `@/*` aliases to `src/*`.

## Sub-directory instructions

`apps/web/CLAUDE.md` (via `AGENTS.md`) warns: this is Next.js 16, not 15 — read `node_modules/next/dist/docs/` before writing Next.js-specific code. The `params`/`searchParams` async requirement and top-level `turbopack` config are the most common trip-wires.
