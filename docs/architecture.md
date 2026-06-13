# Architecture

## System Overview

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
        F["Cloudflare Access<br/>(Zero Trust)"] -->|protects /admin/*| E
        E -->|POST /api/blog/views| K["Pages Function<br/>blog view counter"]
        E -->|GET /admin/api/blog/views| L["Pages Function<br/>editorial analytics"]
        E -->|POST /admin/api/blog/rebuild| N["Pages Function<br/>deploy hook caller"]
        F -->|protects /admin/* and /admin/api/*| L
        F -->|protects /admin/* and /admin/api/*| N
    end

    subgraph Supabase
        G["PostgreSQL<br/>(posts CMS, benchmarks,<br/>cv_requests, leads)"]
        H["Storage<br/>(CV PDF)"]
        I["Edge Functions<br/>(send-cv only)"]
    end

    subgraph CloudflareD1["Cloudflare D1"]
        M["blog view counters<br/>daily + referrer rollups"]
    end

    C -->|build-time fetch| G
    E -->|client INSERT/SELECT| G
    N -->|POST deploy hook| D
    E -->|direct download| H
    G -->|webhook on UPDATE| I
    I -->|sends email via Resend| J[User Inbox]
    K -->|aggregate by slug| M
    L -->|read admin rollups| M

    %% v3 deferred: no unique visitor tracking or fingerprinting in this phase
```

## Data Flow

### Build Time (Astro Static Generation)

1. CI or Cloudflare Pages runs `bun run build`
2. `scripts/generate-headers.ts` writes `public/_headers` with CSP derived from `PUBLIC_SUPABASE_URL`
3. Astro fetches published blog posts from Supabase (`SUPABASE_URL` + `PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `SUPABASE_SECRET_KEY` is a legacy fallback)
4. Falls back to `src/data/blog.ts` only when Supabase build credentials are absent
5. Generates static HTML for all pages and `/blog-post-manifest.json` → `dist/`
6. The manifest contains the final published blog slugs used by the Cloudflare view-count API

### Client Side (Browser)

- **Maturity Checker**: Submits assessment results (INSERT) and reads aggregate benchmarks (SELECT) via Supabase anon key
- **Governance Scorecard**: Client-side scoring only — no Supabase persistence yet
- **CV Gate**: User submits email via modal → INSERT to `cv_download_requests` (status: pending)
- **Blog Views**: Blog detail pages call same-origin `/api/blog/views` after a short delay; failures hide the count without affecting reading
- **Admin Panel**: Reads/updates cv_requests, leads, maturity submissions via Supabase anon key + RLS
- **Admin Blog Writer**: Creates, edits, drafts, publishes, deletes, and stores cover metadata in Supabase; successful mutations can queue a Cloudflare Pages rebuild through `/admin/api/blog/rebuild`
- **Admin Blog Analytics**: `/admin/blog/analytics/` reads aggregate D1 rollups through `/admin/api/blog/views`
- **CSP**: Both `_headers` (Cloudflare edge) and `<meta>` (BaseLayout) allow same-origin API calls and restrict external `connect-src` to the Supabase project origin

### CV Delivery Flow

```
User clicks "Get a Copy" → CvRequestModal opens
    → User submits email → INSERT cv_download_requests (status: pending)
    → Admin approves at /admin/cv-requests → UPDATE status = approved
    → Supabase webhook fires → send-cv Edge Function triggered
    → Edge Function sends email with PDF link via Resend API
    → UPDATE status = sent, sent_at = now()
```

### Deployment

- **Production**: push to `main` → Cloudflare Pages builds and deploys to `xhverse.co`
- **Preview**: push to `development` or `feat/*` → preview URL with auto `noindex`
- **CI**: GitHub Actions runs typecheck, build, coverage (100%), and E2E on every push/PR
- **Pages Functions**: `/api/*` and `/admin/api/*` invoke Cloudflare Pages Functions; static routes stay static through `public/_routes.json`
- **Admin content publish**: Supabase writes are immediate in the admin UI; public static blog pages update after the configured Cloudflare deploy hook rebuilds the site from Supabase
- **Edge Functions**: deployed separately via `bunx supabase functions deploy send-cv`

## Security Model

| Layer | Mechanism |
|-------|-----------|
| Edge headers | `public/_headers` → CSP, HSTS, X-Frame-Options, CORP (generated at build) |
| HTML meta | `BaseLayout.astro` → CSP `connect-src` from env (production only) |
| Admin access | Cloudflare Access (Zero Trust) → email OTP for `/admin/*` routes |
| Admin analytics API | Cloudflare Access protects `/admin/api/*`; API returns aggregate D1 rollups only |
| Admin rebuild API | Cloudflare Access protects `/admin/api/*`; deploy hook URL is stored server-side only |
| Blog view API | Same-origin Pages Function validates known published slugs and stores aggregate counters |
| Database | RLS on all tables; anon: insert-only on submissions, select-only on reads |
| D1 analytics | Aggregate blog counts, daily rollups, and referrer-origin buckets only; no IP, raw user agent, or fingerprint hash |
| Storage | Public read on `documents` bucket; no write access via client |
| Build read key | `PUBLIC_SUPABASE_PUBLISHABLE_KEY` reads published blog rows through public RLS; `SUPABASE_SECRET_KEY` remains an optional legacy server-side fallback |
| Edge Function secrets | `RESEND_API_KEY` set via `bunx supabase secrets set` |

## Pages

| Route | Purpose | Data Source |
|-------|---------|-------------|
| `/` | Homepage — profile, work themes, tools, contact | `src/data/profile.ts`, `src/data/site.ts` |
| `/about` | Extended bio | Static |
| `/blog` | Architecture notes | Supabase `posts` table (build-time) |
| `/blog/[slug]` | Static article page with optional anonymous view count | Static build + Cloudflare D1 aggregate count |
| `/cv` | Resume with PDF view + gated download | Supabase Storage + `cv_download_requests` |
| `/gallery` | Visual work samples | `src/data/gallery.ts` |
| `/services` | Advisory engagement types, process, fit signals | `src/data/services.ts` |
| `/tools` | Tool index page | Static |
| `/tools/data-platform-maturity-checker` | 15-question maturity assessment | Client-side + Supabase benchmarks |
| `/tools/governance-scorecard` | 20-question governance readiness | Client-side only |
| `/admin` | Dashboard (protected) | Supabase (client-side) |
| `/admin/blog/analytics` | Blog view analytics (protected) | Cloudflare D1 via Pages Function |
| `/admin/cv-requests` | CV request management | `cv_download_requests` table |
| `/admin/leads` | Lead tracking | `leads` table |
| `/admin/tools/maturity` | Maturity submissions | `maturity_submissions` table |

## Database Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `posts` | Blog CMS source of truth (fetched at build time) | select: anon published rows; admin select/insert/update/delete via RLS |
| `maturity_submissions` | Anonymous tool submissions | insert: anon; select: anon (aggregate view) |
| `cv_download_requests` | CV gate email submissions | insert: anon; select/update: service_role + admin |
| `leads` | Contact/engagement leads | insert: anon; select: service_role + admin |

## Cloudflare D1 Tables

| Table | Purpose |
|-------|---------|
| `blog_post_registry` | Known published blog slugs observed from the build manifest |
| `blog_view_events` | Idempotency records keyed by client event ID |
| `blog_view_counters` | Public aggregate total views by slug |
| `blog_view_daily_rollups` | Admin/editorial daily totals by slug |
| `blog_view_referrer_rollups` | Admin/editorial referrer-origin buckets |

Unique visitor counting is deferred. The current design does not store IP
addresses, raw user agents, cookies, or fingerprint hashes for blog analytics.

## Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `send-cv` | Webhook on `cv_download_requests` UPDATE (status → approved) | Sends CV PDF link via Resend email |

## Cloudflare Pages Functions

| Route | Purpose |
|-------|---------|
| `POST /api/blog/views` | Records one anonymous aggregate blog page-view event |
| `GET /api/blog/views?slugs=a,b` | Returns public aggregate counts for known published blog slugs |
| `GET /admin/api/blog/views` | Returns protected admin/editorial rollups |
| `POST /admin/api/blog/rebuild` | Calls the server-side Cloudflare rebuild hook after admin blog mutations |
