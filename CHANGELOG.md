# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
