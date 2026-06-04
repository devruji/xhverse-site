---
name: xhverse-dev
description: Project development guide for the xhverse-site repository. Use this skill whenever working in the xhverse-site codebase — editing pages, components, data modules, tests, CI, dependencies, or anything else in this repo. Trigger it for any development task including bug fixes, new features, refactoring, PR creation, release promotion, dependency updates, or running checks. Even if the user just asks to "fix something" or "add a page" in this repo, use this skill.
---

# XHVerse Site Development Guide

This skill provides the full context for working productively in xhverse-site — a personal portfolio and blog for Rujikorn Ngoensaard (XH / bossruji), deployed at https://xhverse.co.

## Stack

- **Framework**: Astro 6, static output
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **Runtime**: Bun (package manager + scripts), Node 22.16.0 (pinned in `.node-version`)
- **Data**: Static TypeScript modules in `src/data/` with optional Supabase overlay for blog posts at build time and selected runtime submissions
- **Deploy**: Cloudflare Pages via Git integration (no manual deploys)

## Commands

```
bun install              # Install deps (CI uses --frozen-lockfile)
bun run dev              # Dev server → localhost:4321
bun run build            # Production build → ./dist/
bun run typecheck        # Astro type/content checks
bun run test             # Unit tests (vitest)
bun run coverage         # Unit tests + 100% coverage enforcement
bun run test:e2e         # E2E (Playwright builds site first)
bun run check            # Full pipeline: typecheck + build + coverage + e2e
```

Single test file: `bunx vitest run src/data/blog.test.ts`

## Branch & Release Flow

1. **Feature work**: Branch from `development`, PR back to `development`
2. **Integration**: `development` is the default base for all work
3. **Release**: PR from `development` → `main`, then:
   - Tag the merged `main` commit: `git tag -a vX.Y.Z -m "message"`
   - Push the tag and create a GitHub Release marked as Latest
4. **Never** commit directly to `main` or `development`

## Architecture Decisions

### Data Layer
- `src/data/` contains static typed data (blog posts, gallery items, CV info, site config)
- `src/lib/blog/` handles Supabase → static merge at build time
- When `SUPABASE_URL` + `SUPABASE_SECRET_KEY` env vars are set, posts come from Supabase `posts` table with static fallback
- Without those vars, uses `src/data/blog.ts` directly

### SEO System
- `src/data/seo.js` resolves site URL: `PUBLIC_SITE_URL` > `CF_PAGES_URL` > `https://xhverse.co`
- Preview deploys get `noindex` automatically via `shouldNoIndexDeployment()`
- `BaseLayout.astro` handles canonical URLs, OG/Twitter cards, CSP headers, structured data slots

### Testing Strategy
- **Unit tests**: Co-located as `*.test.ts` next to source in `src/data/` and `src/lib/`
- **Coverage**: 100% thresholds on lines/functions/branches/statements — no exceptions
- **E2E**: Playwright in `tests/e2e/`, runs against built site (chromium desktop + mobile)
- When adding logic to `src/data/` or `src/lib/`, you must add matching tests that maintain 100% coverage

### Tools Page
- `/tools/scd-design-lab`: SCD modeling practice lab
- `/tools/data-platform-maturity-checker`: Assessment with benchmark persistence
- `/tools/governance-scorecard`: Assessment with blockers and action plan
- `/tools/architecture-roulette`: Decision game with agreement tracking
- `/tools/data-stack-roast`: Dropdown generator
- `/tools/sql-deathmatch`: SQL challenge game
- `/tools/lakehouse-cost-calculator`: Cost estimator
- `/tools/spark-explained`: Pipeline visualizer
- `/tools/data-product-contract-builder`: Data product contract assessment and brief
- `/tools/access-model-simulator`: Least-privilege access model assessment and brief
- `/tools/lakehouse-table-layout-advisor`: Lakehouse table layout and maintenance advisor
- `/tools/power-bi-semantic-model-doctor`: Power BI semantic model diagnosis
- `/tools/pipeline-recovery-planner`: Pipeline recovery runbook planner

## Agent Surfaces

- `AGENTS.md`: compact repo contract
- `CLAUDE.md`: full onboarding and implementation guide
- `.cursor/rules/*.mdc`: Cursor rule surfaces
- `.agents/skills/*/SKILL.md`: Codex skills; keep YAML frontmatter valid
- `.codex/agents/*.toml`: repo-local sub-agent role cards
- `.codex/config.toml`: runtime config only; never add `[instructions]` or `developer_instructions`
- `.agents/skills/agent-surface-maintenance/SKILL.md`: use for skills, rules, memory notes, Codex config, and repo-scoped MCP upkeep

## Codex + Cursor Workflow

- Codex is accountable for planning, review, QA, security gates, and release evidence.
- Default code implementation to `codex-spark` for bounded build/edit work when that lane is available.
- Escalate back to the smarter Codex lane when `codex-spark` produces too many bugs, misses repo constraints, cannot reach production-grade quality, or the task is high-risk/complex. State the reason for escalation.
- Cursor can implement bounded changes from a Codex-authored `.tmp/*-handoff.md` file.
- Handoff files must list allowed files, forbidden files, acceptance criteria, and verification commands for Cursor to run.
- Codex has standing approval to operate Cursor IDE through Computer Use for bounded xhverse handoffs when Cursor materially helps implementation or review.
- Ask again only for secrets, `.env` files, unrelated local folders, destructive actions, live production mutations, or scope outside this repo.
- Use Cursor multi-agent/multitask mode only for non-overlapping file ownership.
- After Cursor edits, review the actual `git diff` and Cursor's test evidence before accepting any summary.
- For Cursor-assisted work, ask Cursor to run the relevant checks, including `bun run check` when full confidence is needed; Codex reruns tests directly only if Cursor cannot run them, evidence is incomplete, or the user asks.
- If Cursor chat context gets noisy, open a fresh Cursor conversation and point it at the current handoff file.

## Engineering Skill Defaults

- Use `debug-mantra` for bugs, failing checks, regressions, stack traces, and broken behavior before proposing a fix.
- Use `scrutinize` for plan review, PR review, diff review, architecture/design sanity checks, and second-opinion review.
- Use `post-mortem` after a bug fix only when the repro, root cause, fix, and validation are known.
- For Cursor handoffs, name the expected skill lens in `.tmp/*-handoff.md` whenever debugging, review, or post-fix writeup work is in scope.

## Content Writing Defaults

- Use the repo-local `technical_writer` sub-agent when starting, outlining, drafting, or reviewing public content: blog posts, technical docs, release notes, page copy, article metadata, references, and related-tool CTAs.
- For blog work, pair `technical_writer` with `blog-content-strategy` and `document-writer`. Use it before body drafting and again for pre-publish content QA.
- Use `product-manager` before `technical_writer` when the task still needs topic selection, positioning, or business rationale.

## Constraints

- Do not modify generated folders: `coverage/`, `dist/`, `playwright-report/`, `test-results/`, `.astro/`
- Do not touch Supabase code/migrations unless explicitly asked
- Preserve identity SEO signals: "Rujikorn Ngoensaard", "bossruji", "XH", "xhverse"
- Keep `.node-version`, CI workflow, and Cloudflare Pages runtime aligned
- Keep `bun.lock` in sync — never bypass `--frozen-lockfile`
- CSP headers enforced in production via `<meta>` in BaseLayout — update if adding external resources
- For long skill descriptions, use YAML folded blocks (`description: >-`) so colons do not break skill loading
- Prefer minimal diffs; avoid unrelated refactors
- Dark, minimal, professional design language

## Verification Checklist

Before marking work done:
1. `bun run typecheck` passes
2. `bun run coverage` passes (100% thresholds)
3. If touching pages/layouts: `bun run test:e2e` passes
4. For full confidence: `bun run check`
5. Report only checks that were actually run
