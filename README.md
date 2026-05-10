# XHVerse Site

[![CI](https://github.com/devruji/xhverse-site/actions/workflows/ci.yml/badge.svg)](https://github.com/devruji/xhverse-site/actions/workflows/ci.yml)
[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Personal portfolio, blog, and interactive tools site for [Rujikorn Ngoensaard](https://xhverse.co) (XH / bossruji) — Data Architect specializing in Azure, Databricks, Microsoft Fabric, and data governance.

## Tech Stack

- **Framework:** [Astro 6](https://astro.build/) (static output)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) via Vite plugin
- **Runtime:** [Bun](https://bun.sh/) + Node 22.16.0
- **Testing:** [Vitest](https://vitest.dev/) (100% coverage) & [Playwright](https://playwright.dev/) (E2E)
- **Database:** [Supabase](https://supabase.com/) (build-time blog, client-side benchmarks, CV gate)
- **Edge Functions:** Supabase Edge Functions (Deno) for email delivery
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) (Git integration)
- **Admin:** Protected by [Cloudflare Access](https://www.cloudflare.com/products/zero-trust/) (Zero Trust, email OTP)

## Architecture

```mermaid
graph LR
    subgraph Developer
        A[Local Dev] -->|git push| B[GitHub]
    end

    subgraph GitHub
        B -->|PR / push| C[CI: Tests + Build]
    end

    subgraph Cloudflare
        B -->|Git integration| D[Cloudflare Pages]
        D -->|serves| E["Static Site<br/>xhverse.co"]
        F["Cloudflare Access"] -->|protects /admin/*| E
    end

    subgraph Supabase
        G["PostgreSQL<br/>(posts, benchmarks,<br/>cv_requests, leads)"]
        H["Storage<br/>(CV PDF)"]
        I["Edge Functions<br/>(send-cv)"]
    end

    C -->|build-time fetch| G
    E -->|client INSERT/SELECT| G
    E -->|direct download| H
    G -->|webhook on UPDATE| I
    I -->|sends email via Resend| J[User Inbox]
```

See [docs/architecture.md](docs/architecture.md) for detailed data flow, security model, and page inventory.

## Features

- **Portfolio & Blog** — Static content with optional Supabase blog overlay
- **Interactive Tools** — Data Platform Maturity Checker, Governance Readiness Scorecard
- **Advisory Services** — Engagement types, process flow, conversion path
- **CV Gate** — Email capture modal → admin approval → automated PDF delivery via Edge Function
- **Admin Panel** — Dashboard, CV request management, lead tracking, tool submissions
- **Dark/Light Theme** — CSS variable system with anti-FOUC, zero-JS theme swap
- **100% Test Coverage** — Unit tests on all data/logic modules, E2E on all pages

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.2+)
- [Node.js](https://nodejs.org/) 22.16.0 (pinned in `.node-version`)

### Installation

```sh
git clone https://github.com/devruji/xhverse-site.git
cd xhverse-site
bun install
```

### Local Development

```sh
bun run dev          # http://localhost:4321
```

### Testing

```sh
bun run typecheck    # Astro type/content checks
bun run coverage     # Unit tests + 100% coverage enforcement
bun run test:e2e     # Playwright (chromium desktop + mobile)
bun run check        # Full pipeline: typecheck + build + coverage + e2e
```

### Building for Production

```sh
bun run build        # Output → ./dist/
```

### Edge Functions

```sh
bunx supabase functions deploy send-cv    # Deploy CV email function
bunx supabase secrets set RESEND_API_KEY=re_xxxxx
```

## Deployment

Cloudflare Pages Git integration handles all deployments:

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | https://xhverse.co |
| `development` | Preview | Auto-generated preview URL |
| `feat/*` | Preview | Auto-generated preview URL |

Cloudflare Pages settings:
- **Build command:** `bun run build`
- **Output directory:** `dist`
- **Node version:** Read from `.node-version`

### Environment Variables

| Variable | Environment | Purpose |
|----------|-------------|---------|
| `SUPABASE_URL` | Build | Database URL |
| `SUPABASE_SECRET_KEY` | Build (secret) | Service role key |
| `PUBLIC_SUPABASE_URL` | Build + client | For CSP connect-src |
| `PUBLIC_SITE_URL` | Production | Canonical URL override |
| `PUBLIC_ALLOW_INDEXING` | Preview (optional) | Force indexing on preview |

### Branch Flow

```
feat/* ──PR──→ development ──Release PR──→ main ──tag──→ GitHub Release
```

Both `development` and `main` are protected branches requiring PRs + passing CI.

## © License & Copyright

This project's code is licensed under the [MIT License](./LICENSE).

**Note:** Unless otherwise stated, all written content, images, and personal media published on the site are **all rights reserved** to the author.
