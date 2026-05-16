# Fresh — Vitest + CI + Slack Setup

Work through these tasks in order. After completing each one, check it off (`[x]`) before moving to the next.

Each task includes enough detail to execute without re-exploring the codebase.

---

## Tasks

### 1. [ ] Install Vitest dev dependencies

From `apps/web/`, run:

```bash
bun add -d vitest @vitest/coverage-v8 vite-tsconfig-paths
```

- `vitest` — test runner (Jest-compatible API)
- `@vitest/coverage-v8` — coverage via V8 (no extra native deps)
- `vite-tsconfig-paths` — auto-resolves the `@/*` alias from `tsconfig.json` so tests don't need manual alias config

---

### 2. [ ] Create `apps/web/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/app/api/**'],
    },
  },
})
```

---

### 3. [ ] Add test scripts and update turbo.json + CLAUDE.md

**`apps/web/package.json`** — add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**`turbo.json`** — read the file first, then add a `test` task to the `tasks` object:
```json
"test": {
  "dependsOn": [],
  "outputs": ["coverage/**"]
}
```

**Root `package.json`** — add to `scripts`:
```json
"test": "turbo test"
```

**`CLAUDE.md`** — replace the line:
```
No test runner or linter is configured yet.
```
with:
```
Test runner: Vitest. Run `bun test` from repo root or `bun test` from `apps/web/`. Watch mode: `bun test:watch` from `apps/web/`.
```

---

### 4. [ ] Write unit tests for `lib/classify.ts`

**File to create**: `apps/web/src/lib/__tests__/classify.test.ts`

Use `vi.useFakeTimers()` and `vi.setSystemTime()` to pin the clock so age calculations are deterministic. Restore with `vi.useRealTimers()` in `afterEach`.

Test `getFreshness`:
- 15 days ago → `'fresh'`
- 45 days ago → `'decaying'`
- 90 days ago → `'stale'`
- Boundary: exactly 30 days ago → `'decaying'`
- Boundary: exactly 60 days ago → `'stale'`

Test `getRelativeTime`:
- 0 days ago → `'today'`
- 1 day ago → `'1 day ago'`
- 15 days ago → `'15 days ago'`
- 31 days ago → `'1 month ago'`
- 90 days ago → `'3 months ago'`

Test `getShortRelativeTime`:
- 30 seconds ago → `'just now'`
- 5 minutes ago → `'5m ago'`
- 3 hours ago → `'3h ago'`
- 2 days ago → `'2 days ago'`

---

### 5. [ ] Write unit tests for `lib/group.ts`

**File to create**: `apps/web/src/lib/__tests__/group.test.ts`

Use minimal `Bug` fixture objects — only required fields: `id`, `title`, `status`, `priority`, `platform`, `createdAt`.

Test `groupBugsByYearMonth`:
- Empty array → returns `[]`
- All bugs in the same month → one group with correct `label` (e.g. `'January 2026'`), `year`, `month`
- Bugs across two months → two groups, sorted descending (most recent first)
- Bugs across two years → correct year-boundary ordering
- Each group's `bugs` array contains exactly the bugs for that month

---

### 6. [ ] Write unit tests for `lib/slack.ts`

**File to create**: `apps/web/src/lib/__tests__/slack.test.ts`

Use `vi.useFakeTimers()` to control `Date.now()` so freshness and age calculations are stable.

Test `buildSlackReport`:
- Returns `{ blocks: [...] }` where `blocks` is an array
- First block is `{ type: 'header' }` with text `'Fresh — Bug Freshness Report'`
- All fresh bugs (0 stale): no stale section appears in blocks
- With stale bugs: a stale section appears; each stale bug is a `section` block whose `text.text` contains the bug's `id`, `title`, `status`, and `priority`
- Bug with a `url`: stale block text uses `<url|id>` link syntax
- Bug without a `url`: stale block text uses plain `id`
- With > 10 stale bugs: exactly 10 `section` blocks for bugs + 1 `context` block containing `'more stale bugs'`

---

### 7. [ ] Write integration tests for `app/api/slack/send/route.ts`

**File to create**: `apps/web/src/app/api/slack/send/route.test.ts`

Import the handler directly — no HTTP server needed:
```ts
import { POST } from './route'
```

Mock global `fetch` in `beforeEach` with `vi.stubGlobal('fetch', vi.fn())`.
Restore in `afterEach` with `vi.unstubAllGlobals()`.

Construct requests inline:
```ts
new Request('http://localhost/api/slack/send', {
  method: 'POST',
  body: JSON.stringify({ webhookUrl: '...' }),
  headers: { 'Content-Type': 'application/json' },
})
```

Tests:
- No body → 400, response JSON contains `error: 'Invalid or missing webhook URL'`
- `webhookUrl` that does not start with `https://hooks.slack.com/` → 400
- Valid webhook URL, `fetch` mock returns `ok: true` → 200, `{ ok: true }`; verify `fetch` was called once with the webhook URL and `Content-Type: application/json`
- Valid webhook URL, `fetch` mock returns `ok: false` (status 400, body text `'invalid_payload'`) → 502, response JSON error contains `'400'` and `'invalid_payload'`

---

### 8. [ ] Add `buildCiReport()` to `lib/slack.ts`

Extend `apps/web/src/lib/slack.ts` — append after `buildSlackReport`.

Add the interface and function:

```ts
export interface CiResult {
  passed: number
  failed: number
  total: number
  durationSeconds: number
  branch: string
  commit: string   // short SHA (first 7 chars)
  runUrl: string   // link to the GitHub Actions run
}

export function buildCiReport(result: CiResult) {
  const passed = result.failed === 0
  const title = passed ? 'Tests passed ✓' : 'Tests failed ✗'
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `Fresh CI — ${title}`, emoji: true },
      },
      {
        type: 'context',
        elements: [{ type: 'plain_text', text: date }],
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Branch*\n${result.branch}` },
          { type: 'mrkdwn', text: `*Commit*\n${result.commit}` },
          { type: 'mrkdwn', text: `*Passed*\n${result.passed} / ${result.total}` },
          { type: 'mrkdwn', text: `*Duration*\n${result.durationSeconds.toFixed(1)}s` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${result.runUrl}|View run on GitHub Actions>`,
        },
      },
    ],
  }
}
```

---

### 9. [ ] Create `apps/web/scripts/post-ci-to-slack.ts`

**File to create**: `apps/web/scripts/post-ci-to-slack.ts`

Called from GitHub Actions after `vitest run --reporter=json` writes output to a file.

```ts
// Usage: bun scripts/post-ci-to-slack.ts <path-to-test-results.json>
// Required env: SLACK_WEBHOOK_URL, GITHUB_REF_NAME, GITHUB_SHA,
//               GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID
```

Logic:
1. Read the JSON results file from `process.argv[2]`
2. Parse vitest JSON — fields: `numPassedTests`, `numFailedTests`, `numTotalTests`, `testResults` (array with `duration` in ms)
3. Sum durations across `testResults` for total duration in seconds
4. Build `CiResult`:
   - `branch` from `GITHUB_REF_NAME`
   - `commit` from first 7 chars of `GITHUB_SHA`
   - `runUrl` = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
5. Call `buildCiReport(result)` and POST to `SLACK_WEBHOOK_URL` with `Content-Type: application/json`
6. Log success or error; exit with code 1 on failure

---

### 10. [ ] Create `.github/workflows/test.yml`

**File to create**: `.github/workflows/test.yml`

```yaml
name: Test

on:
  push:
    branches: ['**']
  pull_request:
    branches: ['**']

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test --reporter=default --reporter=json --outputFile=test-results.json
        working-directory: apps/web

      - name: Post results to Slack
        if: always()
        run: bun scripts/post-ci-to-slack.ts test-results.json
        working-directory: apps/web
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

Note: `GITHUB_REF_NAME`, `GITHUB_SHA`, `GITHUB_SERVER_URL`, `GITHUB_REPOSITORY`, and `GITHUB_RUN_ID` are automatically available in the Actions environment — no need to declare them.

---

## Verification

After all tasks are checked off:

1. `bun test` from repo root — all tests pass with no errors
2. `bun test:coverage` from `apps/web/` — coverage report written to `apps/web/coverage/`
3. Open Cursor → Extensions panel → search **"Vitest"** → install the official extension → the Tests panel (beaker icon) shows all test cases with individual run/debug buttons
4. Inspect `.github/workflows/test.yml` — confirm the `SLACK_WEBHOOK_URL` secret is added in the repo's GitHub Settings → Secrets → Actions before the first push
