# AGENTS.md

This file provides shared context for all Claude Code agents working in this repository. For the full project guide, see `CLAUDE.md`.

## Project State

- **Site**: xhverse.co — portfolio, blog, and interactive tools for Rujikorn Ngoensaard (XH / bossruji)
- **Role**: Senior Data Engineer | Platform Architecture
- **Version**: v3.9.0
- **Stack**: Astro 6 (static only), Tailwind CSS v4, Bun, Cloudflare Pages, Supabase, Resend
- **Pages**: 27 Astro route files; current release build generates 38 static HTML pages
- **Tests**: 521 unit tests at 100% coverage + 48 E2E checks

## Commands

```bash
bun run dev              # Dev server → localhost:4321
bun run build            # Production build → ./dist/
bun run typecheck        # Type checks
bun run test             # Unit tests (vitest)
bun run coverage         # Unit tests + 100% coverage enforcement
bun run test:e2e         # E2E tests (Playwright)
bun run check            # Full pipeline: typecheck + build + coverage + e2e
```

Kill dev server: `lsof -ti :4321 | xargs kill -9 2>/dev/null`

## Architecture Overview

```
src/data/*.ts     → Static typed content (profile, cv, site, services, blog, gallery)
src/lib/          → Business logic + tests (14 domain folders, 100% coverage)
src/pages/*.astro → Routes → generated static HTML (27 route files, 38 current build pages)
src/components/   → Shared Astro components (10)
src/layouts/      → BaseLayout (SEO/CSP) + AdminLayout (admin panel)
dist/             → Deployed to Cloudflare CDN
```

### Interactive Tools (13 live)

All tools are fully client-side. Each follows:
```
src/lib/<tool-name>/   → Data + logic + tests
src/pages/tools/<slug>.astro → Page with <script> block
```

The five practitioner assessment tools share `src/lib/practitioner-tools/` and are generated through guided decision journeys in `src/pages/tools/[slug].astro`.

| Tool | Type |
|------|------|
| SCD Design Lab | Education (dimension modeling practice) |
| Data Platform Maturity Checker | Assessment (form → score + benchmark) |
| Governance Readiness Scorecard | Assessment (form → score + action plan) |
| Architecture Decision Roulette | Game (10 scenarios, agreement tracking) |
| Data Stack Roast | Generator (6 dropdowns → 3-paragraph roast) |
| SQL Deathmatch | Challenge (15 SQL rounds, tier ranking) |
| Lakehouse Cost Calculator | Calculator (cluster config → USD + optimizations) |
| Spark Explained | Visualizer (pipeline stages, animated partitions) |
| Data Product Contract Builder | Guided contract journey (clauses → copyable brief) |
| Access Model Simulator | Guided governance journey (policy gates → risk/actions) |
| Lakehouse Table Layout Advisor | Guided architecture journey (layout signals → maintenance plan) |
| Power BI Semantic Model Doctor | Guided semantic journey (metric diagnosis → actions) |
| Pipeline Recovery Planner | Guided recovery journey (drill checkpoints → runbook brief) |

### Key Systems

- **CV Gate**: Email capture → admin review → PDF sent via Resend
- **Admin Panel**: `/admin/*` behind Cloudflare Access (Zero Trust)
- **CSP**: Dual-layer (edge `_headers` + HTML meta tag) — must stay synced
- **Theme**: Dark default, light via `html.light`. Anti-FOUC inline script.

## Agent Knowledge Surfaces

- **AGENTS.md**: Compact operating contract for all agents
- **CLAUDE.md**: Full repo onboarding and implementation guide
- **.cursor/rules/*.mdc**: Cursor rule surfaces for project, git, testing, Cloudflare, code quality, and agent-surface maintenance
- **.agents/skills/*/SKILL.md**: Repo skills; frontmatter must be valid YAML
- **.codex/agents/*.toml**: Repo-local sub-agent role definitions
- **.codex/config.toml**: Codex runtime config only. Do not add `[instructions]` or `developer_instructions` tables here; put repo guidance in AGENTS.md, CLAUDE.md, skills, or rules.
- **Memory updates**: Only when explicitly requested. Add small notes under `/Users/bossruji/.codex/memories/extensions/ad_hoc/notes/`; do not edit generated memory files directly.
- **Repo-scoped MCPs**: Declare only project-relevant MCPs/connectors in `.codex/config.toml`. Store env var names, never token values. Do not add Notion for this repo.

## Codex + Cursor Flow

- **Default split**: Codex owns planning, scope control, review, QA, security gate, and release evidence. Cursor owns bounded implementation when explicitly used.
- **Implementation lane**: Default code implementation to `codex-spark` for bounded build/edit work. Codex still owns the plan, review, QA evidence, and final acceptance.
- **Escalation**: If `codex-spark` produces too many bugs, misses repo rules, cannot reach production-grade quality, or the task is high-risk/complex, switch back to the smarter Codex lane for implementation and say why.
- **Handoff surface**: Use repo files, usually `.tmp/*-handoff.md`, as the shared instruction channel. Include allowed files, forbidden files, acceptance criteria, and verification commands for Cursor to run.
- **Cursor Agent use**: The user has granted standing approval for Codex to operate Cursor IDE through Computer Use and submit bounded xhverse handoffs to Cursor Agent when it materially helps implementation. Ask again only if the handoff includes secrets, `.env` files, unrelated local folders, destructive actions, live production mutations, or scope outside this repo.
- **Mode choice**: Use Cursor normal agent for one focused implementation. Use Cursor multi-agent/multitask mode only when the work can be split into non-overlapping file ownership.
- **Review gate**: After Cursor edits, Codex must inspect `git status`, `git diff`, and Cursor's test evidence. For Cursor-assisted work, ask Cursor to run the relevant checks, including `bun run check` when full confidence is needed; Codex reruns tests directly only if Cursor cannot run them, evidence is incomplete, or the user asks.
- **Edit discipline**: One tool edits a file at a time. If Cursor is implementing, Codex stays review/QA-only unless explicitly asked to patch findings.
- **Chat hygiene**: If the Cursor chat gets long or confused, start a new Cursor conversation and point it at the current handoff file and branch state.

## Engineering Skill Defaults

- **debug-mantra**: Use for bug reports, failing checks, regressions, stack traces, or broken behavior before proposing a fix.
- **scrutinize**: Use as the default review lens for plans, PRs, diffs, architecture choices, and code-change sanity checks.
- **post-mortem**: Use after a bug fix has a reliable repro, known root cause, implemented fix, and validation evidence, especially when a writeup or RCA is requested.
- These defaults apply to both Codex and Cursor when the relevant skill is available. Codex-authored Cursor handoffs should name the expected skill lens when debugging, review, or post-fix writeup work is in scope.

## Content Writing Defaults

- **technical-writer**: Use the repo-local `technical_writer` sub-agent when starting, outlining, drafting, or reviewing public content: blog posts, technical docs, release notes, page copy, article metadata, references, or related-tool CTAs.
- Pair `technical_writer` with `blog-content-strategy` and `document-writer` for xhverse blog work. Use it before body drafting and again for pre-publish review.
- For content strategy, use `product-manager` first to choose the topic and `technical_writer` next to sharpen reader goal, thesis, outline, references, SEO metadata, disclosure, and CTA fit.

## Branch & Release Rules

1. **NEVER edit on `development` or `main`** — create a feature branch first
2. **ALWAYS branch from `development`** — never from `main`
3. **ALL PRs target `development`** — release PRs are `development` → `main`
4. **ALWAYS create an annotated release tag with a useful message after `main` promotion**
5. **ALWAYS show user in browser before push** — no exceptions
6. **QA + Security gate every release** — both must PASS

## Non-Negotiable Constraints

- 100% test coverage on `src/lib/**` and `src/data/**` (statements, branches, functions, lines)
- No `any` types
- No `onclick` or inline event handlers (Cloudflare Rocket Loader breaks them)
- `data-cfasync="false"` on all `<script is:inline>` tags
- No external runtime dependencies for tools (all client-side compute)
- Site must build without Supabase env vars (graceful degradation)
- Preserve SEO signals: "Rujikorn Ngoensaard", "bossruji", "XH", "xhverse"

## Agent Responsibilities

| Agent | Owns | Key Rules |
|-------|------|-----------|
| **engineering-lead** | Architecture, coordination, code review, agent-surface governance | Plans first, delegates to specialists |
| **site-planner** | Read-heavy planning, file-level implementation scopes | No edits; define owners, risks, and checks |
| **astro-builder** | Production Astro page/component implementation | Follow existing page patterns and visual system |
| **frontend-engineer** | Pages, components, layouts, styling, a11y | addEventListener only, mobile-first, both themes |
| **backend-engineer** | `src/data/`, `src/lib/`, tests, types, Supabase | 100% coverage, no `any`, mock externals |
| **platform-engineer** | CI, CSP, headers, Cloudflare, build pipeline, repo MCP config | Dual-layer CSP sync, `generate-headers.ts`, no secrets in config |
| **product-manager** | Feature strategy, roadmap, UX decisions | Business case for every recommendation |
| **technical-writer** | Blog posts, technical docs, article briefs, metadata, references, content QA | xhverse voice, primary sources, useful CTAs, no invented claims |
| **qa-reviewer** | Read-only regression, a11y, security, release readiness | Findings first; verify with real commands |

## Repo-Scoped MCP Policy

- **Cloudflare**: Default repo MCP because xhverse runs on Cloudflare Pages and uses Access, Turnstile, security headers, and deployment checks.
- **Supabase**: Allowed only for explicit backend/data/RLS/storage/auth/admin work.
- **Notion**: Not used by xhverse; keep it out of repo config.
- **Secrets**: Never commit bearer tokens, service-role keys, or `.env` files. Use env var references only.

## Content & Identity

- **Title**: Senior Data Engineer | Platform Architecture
- **Positioning**: Data platform craftsman — practical, production-focused
- **Tech focus**: Azure, Databricks, Fabric, Spark, Power BI, lakehouse, governance
- **Industries**: Retail, Real Estate, E-Commerce, Manufacturing, Loyalty
- **Current role**: Central Pattana (Oct 2024–Present) — enterprise platform delivery
- **Contact**: contact@xhverse.co (no phone number on site)
- **Advisory**: Available alongside full-time enterprise delivery

## Done When

- Requested change is implemented
- `bun run check` passes (typecheck + build + coverage + e2e)
- User has verified in browser (both themes, mobile viewport)
- Final summary includes: changed files, risks, verification status

For docs, rule, skill, or Codex-config-only changes, validate the relevant Markdown/YAML/TOML surfaces and state clearly that app runtime tests were not run.
