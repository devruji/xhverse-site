# Blog Analytics

Blog analytics use Cloudflare Pages Functions and D1 to store anonymous
aggregate page-view counts for public blog posts.

## Scope

- v1: public aggregate view counts by blog slug.
- v2: admin/editorial rollups by slug, date, and referrer-origin bucket.
- v3: deferred. Unique visitor counting is not implemented in this phase.

The implementation does not store IP addresses, raw user agents, cookies, or
fingerprint hashes. Counts are directional editorial signals, not verified
unique readers.

## Runtime surfaces

| Surface | Purpose |
|---------|---------|
| `/api/blog/views` | Public same-origin count read/write endpoint |
| `/admin/api/blog/views` | Protected admin/editorial analytics endpoint |
| `/blog-post-manifest.json` | Build-time known published slug manifest |
| `BLOG_ANALYTICS_DB` | Cloudflare D1 binding for counters and rollups |
| `BLOG_VIEW_TRACKING=disabled` | Optional preview kill switch for write increments |
| `public/_routes.json` | Limits Pages Functions invocation to API routes |

## Cloudflare setup

Cloudflare is configured with separate preview and production D1 databases:

| Environment | Database | Pages binding |
|-------------|----------|---------------|
| Preview | `xhverse_blog_analytics_preview` | `BLOG_ANALYTICS_DB` |
| Production | `xhverse_blog_analytics` | `BLOG_ANALYTICS_DB` |

To recreate the setup, create separate preview and production D1 databases:

```sh
bunx wrangler d1 create xhverse_blog_analytics_preview
bunx wrangler d1 create xhverse_blog_analytics
```

Apply the migration to each database:

```sh
bunx wrangler d1 execute xhverse_blog_analytics_preview --file migrations/d1/0001_blog_views.sql --remote
bunx wrangler d1 execute xhverse_blog_analytics --file migrations/d1/0001_blog_views.sql --remote
```

Bind both databases to Cloudflare Pages as `BLOG_ANALYTICS_DB`:

- Preview deployments use `xhverse_blog_analytics_preview`.
- Production deployments use `xhverse_blog_analytics`.

Use [wrangler.example.toml](../wrangler.example.toml) as the binding shape,
not as live configuration. The live binding is managed in the Cloudflare Pages
project configuration. Before committing a real `wrangler.toml`, download and
reconcile the current Cloudflare Pages dashboard configuration so the repo does
not accidentally overwrite project settings.

If a preview should show counts but not increment them, set
`BLOG_VIEW_TRACKING=disabled` for that preview environment. The public endpoint
will return the current count with `counted: false`.

Do not expose D1 identifiers or service credentials to the browser. The public
site calls only same-origin API routes.

## Abuse controls

- Keep `/api/blog/views` same-origin only.
- Reject unknown slugs using the build-time manifest.
- Use client-side session de-dupe to reduce refresh noise.
- Increment after a short client delay so instant bounces are less likely to
  count as meaningful article views.
- Add a Cloudflare WAF rate limit for `POST /api/blog/views`.
- Treat public counts as approximate views, not unique readers.

## Verification

After implementation or binding changes:

```sh
bun run typecheck
bun run coverage
bun run test:e2e
bun run build
```

For a full release gate:

```sh
bun run check
```

In preview or production, verify:

- `/blog-post-manifest.json` contains the current published blog slugs.
- `GET /api/blog/views?slugs=<slug>` returns a count object.
- `POST /api/blog/views` increments after a valid article page visit.
- `/admin/blog/analytics/` loads behind admin protection.
