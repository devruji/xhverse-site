# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XHVerse is a personal portfolio and blog site for Rujikorn Ngoensaard (XH / bossruji). Built with Astro, deployed to Cloudflare Pages. Production URL: https://xhverse.co

## Commands

```bash
bun install              # Install dependencies (uses --frozen-lockfile in CI)
bun run dev              # Dev server at http://localhost:4321
bun run build            # Production build → ./dist/ (runs generate-headers first)
bun run typecheck        # Astro type/content checks
bun run test             # Unit tests (vitest)
bun run test:watch       # Unit tests in watch mode
bun run coverage         # Unit tests with 100% coverage enforcement
bun run test:e2e         # E2E tests (Playwright, builds site first locally)
bun run check            # Full verification: typecheck + build + coverage + e2e
```

Run a single unit test file: `bunx vitest run src/data/blog.test.ts`

## Architecture

- **Framework**: Astro 6 (static output), Tailwind CSS v4 via Vite plugin
- **Runtime**: Bun (package manager + script runner), Node 22.16.0 (pinned in `.node-version`)
- **CLIs**: `wrangler` (Cloudflare) and `supabase` as dev deps — `bunx wrangler` / `bunx supabase`
- **Supabase config**: `src/data/supabase-config.ts` is the single source of truth for the Supabase project URL
- **Build pipeline**: `scripts/generate-headers.ts` generates `public/_headers` with CSP from env → then `astro build`
- **Data layer**: Static TypeScript in `src/data/` with optional Supabase overlay at build time for blog posts
- **Theme system**: CSS variables in `global.css` (`:root` for dark, `html.light` for light). Anti-FOUC inline script + `is:inline data-cfasync="false"` toggle. Theme-aware icon swap via `.theme-dark-only` / `.theme-light-only` classes.
- **Testing**: Vitest (100% coverage on `src/data/` + `src/lib/`), Playwright E2E (20 tests, chromium + mobile)

## Branch & Release Flow

- `development` — integration branch; base for all work
- `main` — production only; receives merges from `development`
- Feature branches → PR to `development`
- Release: PR from `development` → `main` → tag `vX.Y.Z` → GitHub Release
- Auto-merge enabled on repo — PRs merge automatically once CI passes

## Development Workflow (with Agents)

### Making Changes

1. Create feature branch from `development`
2. Make changes, run `bun run check` locally
3. **Show user locally before pushing**:
   ```bash
   lsof -ti :4321 | xargs kill -9 2>/dev/null; bun run dev
   ```
4. Wait for user approval in browser
5. Once approved: commit, push, create PR

### Pre-Release Gate (before development → main)

Spawn these agents in parallel before creating the release PR:

1. **`qa-expert`** — 8-phase regression checklist (pages, theme, SEO, headers, components)
2. **`security-audit-expert`** — 6-phase security audit (secrets, CSP, OWASP, RLS, privacy, deps)

If either returns BLOCK → fix before releasing.
If both PASS → create release PR, tag, and publish GitHub Release.

### Post-Deploy Verification

After release merges to `main`, verify production:
```bash
curl -s https://xhverse.co | grep -c "theme-toggle"  # toggle present
curl -s https://xhverse.co | grep -c "unsafe-inline"  # CSP correct
```

## Engineering Team (`.claude/agents/`)

Subagents with isolated context, specialized knowledge, and specific tool access.

| Agent | Role | Model | When to spawn |
|-------|------|-------|---------------|
| `product-manager` | Feature discovery, roadmap, competitive research | Opus | "What should we build?", feature ideas, site improvements, content strategy |
| `engineering-lead` | Tech lead, architect, coordinator | Opus | Planning, architecture decisions, code review, team coordination |
| `frontend-engineer` | UI, components, styling, a11y, perf | Opus | Page implementation, responsive fixes, theme work, animations |
| `backend-engineer` | Data layer, tests, types, Supabase | Opus | Data modules, test coverage, type errors, blog system |
| `platform-engineer` | Deploy, CI, headers, Cloudflare | Opus | CI issues, CSP changes, deploy problems, caching |

### How to use agents

Agents are spawned automatically by Claude Code when relevant. You can also request them explicitly:
- "Spawn the frontend engineer to fix this layout"
- "Have the backend engineer add tests for this module"
- "Get the platform engineer to update CSP for this new domain"
- "Ask the engineering lead to plan this feature"

### Delegation Pattern

For complex tasks, the engineering lead coordinates:
1. **Lead** plans the work and identifies concerns
2. **Frontend** handles visual implementation
3. **Backend** handles data/logic/tests
4. **Platform** handles deploy/headers/CI
5. **QA + Security** gate the release

## Available Skills (`.agents/skills/`)

Reusable prompts that run in main conversation context (not isolated).

| Skill | Purpose | When to use |
|-------|---------|-------------|
| `xhverse-dev` | Project development guide | Auto-triggers for all work |
| `astro-page-implementation` | Page/section implementation | Creating or editing pages |
| `content-to-page` | Content → page-ready sections | Turning notes into web content |
| `document-writer` | Technical docs + blog posts | Writing ADRs, changelogs, articles |
| `cloudflare-platform` | Pages, Workers, R2, DNS | Cloudflare config work |
| `supabase-backend` | Database, auth, storage | Supabase work |
| `qa-expert` | Pre-release regression gate | Before every release |
| `security-audit-expert` | Full-stack security audit | Before releases + on demand |
| `seo-metadata-check` | Quick page meta review | Single-page SEO check |
| `ux-ui-auditor` | Visual + accessibility audit | UI changes, mobile issues |

## Rules (`.claude/rules/`)

Topic-scoped instructions applied automatically based on file globs:

| Rule | Applies to | Key constraint |
|------|-----------|----------------|
| `code-quality` | `src/**/*.ts`, `*.astro`, `*.js` | No comments, no `any`, minimal diffs |
| `testing` | `src/data/**`, `src/lib/**` | 100% coverage, mock externals |
| `cloudflare` | `*.astro`, `scripts/**`, `_headers` | cfasync, no onclick, CSP alignment |
| `git-workflow` | All files | Branch from development, verify locally |

## Lessons Learned (Trial & Error)

_Update this when you hit a non-obvious issue._

- **Branch convention**: Always branch from `development`, never `main`. Agents default to `main` without explicit guidance.
- **Cloudflare Rocket Loader**: Blocks ALL inline `onclick`/`onX` handlers and rewrites `<script>` type attributes. Fix: use `<script is:inline data-cfasync="false">` with `addEventListener`.
- **CSP must include `'unsafe-inline'`**: Both `script-src` and `style-src` need it for Astro inline scripts and Tailwind.
- **Module scripts + View Transitions**: Astro `<script>` (non-inline) compiles to `type="module"` which may not execute on first load with `<ClientRouter />`. Use `is:inline data-cfasync="false"` for critical scripts.
- **CSS `background` vs `background-color`**: Use `background-color: var(--bg-page)` for theme-reactive elements. The shorthand can cache initial values.
- **Image lazy loading + Playwright**: First/LCP images must use `loading="eager"` or mobile E2E tests timeout.
- **Preview noindex override**: Set `PUBLIC_ALLOW_INDEXING=true` in Cloudflare Pages preview env to share URLs with clients.
- **Theme icon swap**: Use `.theme-dark-only` / `.theme-light-only` CSS classes for icons that need different variants per theme.
- **Always verify locally first**: Multiple production hotfixes came from not checking in browser. Never push without user approval.

## Key Constraints

- Do not modify generated folders: `coverage/`, `dist/`, `playwright-report/`, `test-results/`, `.astro/`
- Do not touch Supabase code/migrations unless explicitly asked
- Preserve identity SEO signals for "Rujikorn Ngoensaard", "bossruji", "XH", "xhverse"
- Keep `.node-version`, CI, and Cloudflare Pages runtime aligned
- Keep `bun.lock` in sync — do not bypass `--frozen-lockfile`
- CSP enforced at two layers: `public/_headers` (edge) and `<meta>` (HTML) — both must stay aligned
- Architecture docs: `docs/architecture.md`
