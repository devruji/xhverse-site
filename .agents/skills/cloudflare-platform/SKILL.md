---
name: cloudflare-platform
description: >-
  Guide for working with the full Cloudflare platform — Pages, Workers, R2,
  D1, KV, DNS, and edge configuration. Use this skill whenever the user
  mentions Cloudflare in any context: deploying to Pages, configuring _headers
  or _redirects, setting up Workers or Functions, managing R2 buckets, D1
  databases, KV namespaces, DNS records, custom domains, or environment
  variables. Also trigger when discussing CDN caching, edge logic, security
  headers for Cloudflare-hosted sites, or debugging Cloudflare-specific
  deployment issues. If the user mentions "deploy", "production", "preview
  URL", or "edge" in the context of this project, use this skill.
---

# Cloudflare Platform Guide

This project deploys to Cloudflare Pages at https://xhverse.co. This skill covers the full Cloudflare ecosystem as used or potentially needed by xhverse.

## Current Setup

### Pages (Active)
- **Production branch**: `main` → https://xhverse.co
- **Preview branches**: `development`, `feat/*` → auto-generated preview URLs
- **Build command**: `bun run build`
- **Output directory**: `dist`
- **Node version**: Read from `.node-version` (currently 22.16.0)
- **Framework**: Astro (auto-detected by Cloudflare)

### Environment Variables
Production:
- `PUBLIC_PRODUCTION_BRANCH=main`
- `PUBLIC_SITE_URL=https://xhverse.co`

Preview:
- `PUBLIC_PRODUCTION_BRANCH=main`
- (no `PUBLIC_SITE_URL` — falls back to CF_PAGES_URL, triggering noindex)

### Headers & Redirects
- `public/_headers` — security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- `public/_redirects` — if needed for path rewrites

The CSP in `_headers` should stay aligned with the `<meta>` CSP in `BaseLayout.astro`. If you add a new external resource (font CDN, analytics, API endpoint), update both.

## Pages Configuration

### Custom Domains
- Primary: `xhverse.co`
- Add via Cloudflare Pages → Custom domains
- CNAME or direct zone integration if DNS is on Cloudflare

### Build Settings
```
Build command: bun run build
Build output directory: dist
Root directory: /
```

### Deployment Hooks
- Git push triggers build automatically
- No manual `wrangler pages deploy` needed for normal flow
- For emergency deploys: `bunx wrangler pages deploy dist --project-name=xhverse-site`

### Preview Deployments
Every PR and branch push creates a preview URL like `<hash>.<project>.pages.dev`. The app's SEO logic auto-adds `noindex` to preview builds via `shouldNoIndexDeployment()`.

## Workers & Functions

### Pages Functions (Recommended for this project)
Place files in `functions/` directory:
```
functions/
  api/
    hello.ts        → /api/hello
    [slug].ts       → /api/:slug
  _middleware.ts    → runs on all requests
```

Each function exports handlers:
```typescript
export const onRequestGet: PagesFunction = async (context) => {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
```

### Standalone Workers
For separate services not tied to the Pages deployment:
```bash
bunx wrangler init my-worker
bunx wrangler deploy
```

### Bindings (connecting services)
Configure in `wrangler.toml` or Pages dashboard:
```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "abc123"

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"

[[d1_databases]]
binding = "MY_DB"
database_name = "my-db"
database_id = "abc123"
```

## R2 (Object Storage)

### Use Cases
- Large static assets (images, PDFs) that don't belong in git
- User uploads
- Build artifacts / backups

### CLI Operations
```bash
bunx wrangler r2 object put my-bucket/path/to/file.pdf --file=./local-file.pdf
bunx wrangler r2 object get my-bucket/path/to/file.pdf
bunx wrangler r2 object delete my-bucket/path/to/file.pdf
bunx wrangler r2 bucket list
```

### Public Access
Enable public access on a bucket via custom domain or `r2.dev` subdomain. Add CORS rules in the dashboard if needed for client-side access.

## D1 (SQLite Database)

### When to Use
- Lightweight relational data that benefits from edge proximity
- When you want SQL without managing a server
- Read-heavy workloads (D1 is optimized for reads)

### CLI Operations
```bash
bunx wrangler d1 create my-db
bunx wrangler d1 execute my-db --command "SELECT * FROM users"
bunx wrangler d1 execute my-db --file ./schema.sql
bunx wrangler d1 migrations create my-db "add_users_table"
bunx wrangler d1 migrations apply my-db
```

### Migrations
Place in `migrations/` directory. D1 tracks applied migrations automatically.

## KV (Key-Value Store)

### When to Use
- Configuration data
- Cached API responses
- Session-like data at the edge
- Feature flags

### CLI Operations
```bash
bunx wrangler kv namespace create MY_KV
bunx wrangler kv key put --namespace-id=<id> "key" "value"
bunx wrangler kv key get --namespace-id=<id> "key"
```

## DNS Management

### Via Wrangler
```bash
bunx wrangler dns list <zone-id>
bunx wrangler dns create <zone-id> --type CNAME --name sub --content target.example.com
```

### Common Records for This Project
- `A` / `AAAA` → Cloudflare Pages (auto-managed)
- `CNAME` for subdomains (e.g., `medium.xhverse.co`)
- `TXT` for verification (Google Search Console, etc.)

## Security Headers Pattern

Keep `public/_headers` as the source of truth for production headers:
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self'; font-src 'self' data:; connect-src 'self' https://*.supabase.co; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
```

When adding external resources, update CSP in both `_headers` and `BaseLayout.astro`.

## Debugging Deployments

### Build Failures
- Check Cloudflare Pages → Deployments → failed build logs
- Common: Node version mismatch, missing env vars, dependency issues
- Verify `.node-version` matches what Cloudflare uses

### Preview vs Production Differences
- Preview doesn't have production env vars (by design)
- The app handles this via `shouldNoIndex()` — don't manually set noindex

### Wrangler Tail (Live Logs)
```bash
bunx wrangler pages deployment tail --project-name=xhverse-site
bunx wrangler tail my-worker  # for standalone workers
```

## Important Limitations

- Pages projects created via Direct Upload cannot be converted to Git integration later — must create a new project
- Pages Functions have 10ms CPU limit on free tier (50ms on paid)
- D1 has 10GB max database size
- R2 has no egress fees but has per-operation costs
- KV is eventually consistent (not suitable for counters or locks)
