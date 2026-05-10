# AGENTS.md

This file provides shared context for all Claude Code agents working in this repository. For the full project guide, see `CLAUDE.md`.

## Project State

- **Site**: xhverse.co — portfolio, blog, and interactive tools for Rujikorn Ngoensaard (XH / bossruji)
- **Role**: Senior Data Engineer | Platform Architecture
- **Version**: v3.0.0
- **Stack**: Astro 6 (static only), Tailwind CSS v4, Bun, Cloudflare Pages, Supabase, Resend
- **Pages**: 20 (homepage, about, cv, gallery, services, blog, 7 tools, admin panel)
- **Tests**: 422 unit tests at 100% coverage + 20 E2E tests

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
src/lib/          → Business logic + tests (11 modules, 100% coverage)
src/pages/*.astro → Routes → static HTML (20 pages)
src/components/   → Shared Astro components (10)
src/layouts/      → BaseLayout (SEO/CSP) + AdminLayout (admin panel)
dist/             → Deployed to Cloudflare CDN
```

### Interactive Tools (7 live)

All tools are fully client-side. Each follows:
```
src/lib/<tool-name>/   → Data + logic + tests
src/pages/tools/<slug>.astro → Page with <script> block
```

| Tool | Type |
|------|------|
| Data Platform Maturity Checker | Assessment (form → score + benchmark) |
| Governance Readiness Scorecard | Assessment (form → score + action plan) |
| Architecture Decision Roulette | Game (10 scenarios, agreement tracking) |
| Data Stack Roast | Generator (6 dropdowns → 3-paragraph roast) |
| SQL Deathmatch | Challenge (15 SQL rounds, tier ranking) |
| Lakehouse Cost Calculator | Calculator (cluster config → USD + optimizations) |
| Spark Explained | Visualizer (pipeline stages, animated partitions) |

### Key Systems

- **CV Gate**: Email capture → admin review → PDF sent via Resend
- **Admin Panel**: `/admin/*` behind Cloudflare Access (Zero Trust)
- **CSP**: Dual-layer (edge `_headers` + HTML meta tag) — must stay synced
- **Theme**: Dark default, light via `html.light`. Anti-FOUC inline script.

## Branch & Release Rules

1. **NEVER edit on `development` or `main`** — create a feature branch first
2. **ALWAYS branch from `development`** — never from `main`
3. **ALL PRs target `development`** — release PRs are `development` → `main`
4. **ALWAYS show user in browser before push** — no exceptions
5. **QA + Security gate every release** — both must PASS

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
| **engineering-lead** | Architecture, coordination, code review | Plans first, delegates to specialists |
| **backend-engineer** | `src/data/`, `src/lib/`, tests, types, Supabase | 100% coverage, no `any`, mock externals |
| **frontend-engineer** | Pages, components, layouts, styling, a11y | addEventListener only, mobile-first, both themes |
| **platform-engineer** | CI, CSP, headers, Cloudflare, build pipeline | Dual-layer CSP sync, `generate-headers.ts` |
| **product-manager** | Feature strategy, roadmap, UX decisions | Business case for every recommendation |

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
