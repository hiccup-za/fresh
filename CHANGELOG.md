# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.7.0] - 2026-05-16

### Added
- Live Jira integration: new `POST /api/jira/issues` API route that proxies to Jira's REST API with Basic auth, avoiding browser CORS restrictions
- Live Jira bug fetching in `BugTable`: reads Jira credentials from localStorage and displays real-time issues when mock mode is disabled
- Loading and error banners in the bug table toolbar showing fetch status and error messages
- Refresh button in the toolbar to manually re-fetch live Jira issues

### Changed
- `BugTable` now switches between mock and live data sources based on `developer.enableMockData` setting
- Migrated Jira API endpoint from deprecated `/rest/api/3/search` to `/rest/api/3/search/jql` with JQL-based filtering
- Updated CLAUDE.md with corrected typecheck command (`bun x tsc --noEmit`) and documented the new Jira API integration pattern

### Fixed
- 410 error from deprecated Jira search endpoint by migrating to `/rest/api/3/search/jql`

## [0.6.0] - 2026-05-16

### Added
- Test ID highlighter: developer toggle to visually outline and label all `data-testid` elements on the page via a `data-show-test-ids` attribute on `<html>`
- `TestIdHighlighter` component mounted in root layout, reacting to `fresh-settings-changed` and `storage` events
- "Show Data Test IDs" toggle in developer settings
- Status badges (Mock / Live) on Linear and Jira panel headers reflecting data source state
- Comprehensive `data-testid` attributes across settings panels for test selector coverage
- `userPlan` developer toggle to simulate Free / Pro plan gating in the Account section

### Changed
- Slack panel schedule selector replaced native `<select>` with a custom dropdown component
- Settings page reorganised into four labelled sections: Account · Data Sources · Slack · Developer
- `DeveloperSettings` type extended with `showTestIds` and `userPlan` fields

## [0.5.0] - 2026-05-16

### Added
- Developer mode toggle on settings page to enable/disable mock data and analysis features
- Persistent developer preferences in localStorage under `developer` section

### Changed
- Mock bug data now only displays when Developer Mode is enabled via settings
- Analyze button and analysis panel visibility controlled by developer toggle for cleaner UI when not testing

## [0.4.0] - 2026-05-16

### Added
- Developer settings section with two feature toggles: "Enable Mock Data" and "Enable Analyze"
- Empty dashboard state showing "No data sources connected" card with Settings deep-link when mock data is disabled
- Per-section deep merge for localStorage settings to preserve new developer defaults when loading saved data

### Changed
- Settings persistence now merges each section (jira, linear, slack, developer) individually to support new settings without losing old saved data
- Analyze button, expand-to-show-history affordance, and analysis side panel now respect the "Enable Analyze" developer toggle
- Bug visibility on the dashboard now controlled by the "Enable Mock Data" developer toggle

## [0.3.0] - 2026-05-16

### Added
- Login page at `/login` with email and password validation
- Authentication route group `(auth)` to separate public auth routes from app routes
- Sign-out button in sidebar footer with Phosphor icon (responsive to collapsed state)

### Changed
- Refactored route structure: dashboard and settings moved into `(app)` route group for authenticated routes
- Root page now redirects to `/login` instead of `/dashboard`
- Moved `Shell` component from root layout to `(app)` layout for better separation of authenticated and public UI
- Sidebar footer sign-out button replaces version display (version still shown when not collapsed)

## [0.2.0] - 2026-05-16

### Added
- Colour-coded status pill badges (Open · Todo · In Progress · In Review · Backlog) on bug rows

### Changed
- Lightened muted text colours across dashboard and settings (`#444`/`#555`/`#666`/`#888`) for better legibility on dark backgrounds
- Filter dropdowns and platform segmented control now always render in white so inactive options stay readable

### Fixed
- Settings page `localStorage` read moved into a `useEffect` to prevent SSR/client hydration mismatch

## [0.1.0] - 2026-05-15

### Added
- Next.js 16 App Router application bootstrapped in a Turborepo + bun monorepo
- Bug triage dashboard with mock Linear and Jira data (15 bugs each)
- Freshness classification: fresh (< 30 days) · decaying (30–60 days) · stale (> 60 days)
- `BugTable` with filtering by platform, priority, status, and freshness
- `AnalysisPanel` side panel showing bug metadata and analysis history
- `StatsRow` displaying totals by freshness tier
- Collapsible sidebar with Phosphor icons (icon-only at `w-14`, full labels at `w-56`)
- Settings page with Linear, Jira, and Slack configuration panels; persisted to `localStorage`
- Slack integration: `POST /api/slack/send` validates webhook URL and delivers a Block Kit report
