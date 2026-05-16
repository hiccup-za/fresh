# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands can be run from the **repo root** via Turbo, or from `apps/web/` directly.

```bash
# From repo root
bun dev    # start all apps in dev mode
bun build  # build all apps

# From apps/web/
bun dev             # Next.js dev server (Turbopack, default in v16)
bun build           # production build
bun start           # serve production build
bun x tsc --noEmit  # type-check (no typecheck script exists — use bun x tsc directly)
```

No test runner or linter is configured yet.

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
- `api/slack/send/` — POST route validating webhook URL and forwarding Slack Block Kit payload
- `api/jira/issues/` — POST route that proxies to the Jira REST API (`/rest/api/3/search/jql`) using Basic auth; normalises results to `Bug[]`; exists to avoid CORS from the browser

**`apps/web/src/` structure:**

```
app/
  page.tsx              — redirect('/dashboard')
  layout.tsx            — root layout: Geist font, TestIdHighlighter, dark bg
  (auth)/login/         — mock login form; pushes to /dashboard on submit
  (app)/layout.tsx      — wraps children in Shell (sidebar + main area)
  (app)/dashboard/      — server component; passes all mock bugs to BugTable
  (app)/settings/       — Account · Data Sources · Slack · Developer sections; persists to localStorage

lib/
  types.ts              — Bug, Platform, Freshness, Priority, AnalysisRun, AnalysisOutcome, AppSettings (incl. DeveloperSettings)
  classify.ts           — getFreshness(date), getRelativeTime(date), getShortRelativeTime(date)
  group.ts              — groupBugsByYearMonth(bugs) → BugGroup[] sorted descending
  slack.ts              — buildSlackReport(bugs) → Slack Block Kit payload
  mock/
    jira.ts             — 15 Jira mock bugs (daysAgo() offsets so freshness stays current)
    linear.ts           — 15 Linear mock bugs (same pattern)
    analysis-history.ts — AnalysisRun records keyed by bugId; getAnalysisHistory(bugId)

components/
  layout/               — Shell (page wrapper) + Sidebar (left nav, client component for active state)
  dashboard/
    bug-table.tsx       — primary client component: filtering state, platform segmented control,
                          opens AnalysisPanel on "Analyze" click; exports COL widths shared with bug-row
    bug-group.tsx       — BugGroupSection: renders a month heading + its BugRow list
    bug-row.tsx         — single row with expand-to-show-history affordance
    analysis-panel.tsx  — sticky side panel showing bug metadata + analysis output placeholder
    stats-row.tsx       — 4 stat cards (totals by freshness)
  settings/
    jira-panel.tsx      — Jira credentials + project config ('use client')
    linear-panel.tsx    — Linear API key + team/label config ('use client')
    slack-panel.tsx     — Slack webhook URL, schedule picker, "Send now" button ('use client')
  dev/
    test-id-highlighter.tsx — mounts in root layout; toggles data-show-test-ids on <html> based on developer.showTestIds setting
```

**Data flow (mock mode)**: Mock data → `dashboard/page.tsx` (server) → `BugTable` (client) as props. Freshness is derived at render time via `getFreshness(createdAt)` — never stored. Filtering (platform/priority/status/freshness) runs entirely in `BugTable` state. Settings are localStorage-only (`fresh-settings` key); `BugTable` listens for `fresh-settings-changed` and `storage` events to react to changes.

**Data flow (live mode)**: When `developer.enableMockData` is false, `BugTable` ignores the mock props and fetches live data directly. For Jira: it reads credentials from localStorage and `POST`s to `/api/jira/issues`, which proxies to Jira server-side. A `refreshTick` counter state triggers a re-fetch when the Refresh button is clicked. Loading and error states are shown as banners above the toolbar. Adding a new live integration follows the same pattern inside `BugTable` — no changes needed in the server page.

**Developer settings** (`DeveloperSettings` in `AppSettings`): four flags persisted under `fresh-settings.developer` in localStorage:
- `enableMockData` — also force-enables/disables both platform toggles when flipped
- `enableAnalyze` — shows/hides the Analyze button and `AnalysisPanel`
- `showTestIds` — triggers `TestIdHighlighter` to add `data-show-test-ids` to `<html>`, which CSS uses to overlay `data-testid` labels
- `userPlan` — simulates Free/Pro gating in the Account section

**`data-testid` conventions**: key interactive elements carry `data-testid` attributes (e.g. `login-email`, `settings-save-btn`, `settings-dev-mock-data-toggle`). Enable "Show Data Test IDs" in Developer settings to see all coverage at runtime.

**Slack integration**: `SlackPanel` → `POST /api/slack/send` → `buildSlackReport()` → Slack Incoming Webhook. The API route validates that the webhook URL starts with `https://hooks.slack.com/`. Scheduled delivery is not yet wired — the schedule field is UI-only.

**Freshness thresholds** (from `lib/classify.ts`): < 30 days → fresh · 30–60 days → decaying · > 60 days → stale. Computed at render time, never stored.

**Platform filter visibility**: `BugTable` reads `fresh-settings` from localStorage on mount and on `fresh-settings-changed` / `storage` events. If neither platform is enabled, all bugs show and the platform segmented control is hidden. If only one is enabled, only that platform's bugs show (no segmented control). If both are enabled, the platform segmented control appears and both datasets are shown.

**Shell / Sidebar**: `Shell` (`components/layout/shell.tsx`) is a client component that holds sidebar collapse state (`useState`). `Sidebar` accepts a `collapsed` prop and animates width between `w-14` (icons only) and `w-56` (icons + labels). Icons come from `@phosphor-icons/react`.

**Styling**: Tailwind CSS v4 (no `tailwind.config.ts` — import-based). Dark-mode Vercel palette: `#000` page bg, `#0a0a0a` cards, `#1a1a1a` borders. Freshness accent colors: `#22c55e` fresh · `#f59e0b` decaying · `#ef4444` stale. `@/*` aliases to `src/*`.

## Sub-directory instructions

`apps/web/CLAUDE.md` (via `AGENTS.md`) warns: this is Next.js 16, not 15 — read `node_modules/next/dist/docs/` before writing Next.js-specific code. The `params`/`searchParams` async requirement and top-level `turbopack` config are the most common trip-wires.
