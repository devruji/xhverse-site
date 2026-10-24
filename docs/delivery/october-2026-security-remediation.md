# October 2026 dependency security remediation

Date: 24 October 2026. Local validation passed. Release authorization and
production verification remain separate.

The fresh dependency audit found 12 advisories: 3 high, 7 moderate, and 2 low.
This remediation targets those findings after the separate Node 22.23.4 update;
an audit result does not establish that the application was exploited.

## Dependency changes

| Dependency | Previous resolution | Patched resolution |
|---|---|---|
| fast-uri | 3.1.8 | 3.1.9 |
| sanitize-html | 2.18.0 | 2.18.1 |
| Zod | 4.3.6 and Astro's 4.6.6 | 4.6.7, deduplicated |
| Miniflare's Undici | 7.29.1 | 7.30.1 |
| Unifont's Undici | 8.11.2 | 8.12.2 |

The changes address [fast-uri URI handling](https://github.com/advisories/GHSA-w74x-v6f9-j3xg),
[sanitize-html recursion](https://github.com/advisories/GHSA-c9rx-x947-fp3h),
and [Zod memory exhaustion](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
Parent-scoped overrides preserve Miniflare's Undici 7 and Unifont's Undici 8
contracts while adopting the [7.30.1](https://github.com/nodejs/undici/releases/tag/v7.30.1)
and [8.12.2](https://github.com/nodejs/undici/releases/tag/v8.12.2) security fixes.
Wrangler remains at 4.149.0: the checked 4.152.0 release still pins an affected
Undici 7 version, so upgrading Wrangler alone does not resolve the finding.

## Package manager requirement

An isolated fixture showed Bun 1.3.10 ignoring the parent-scoped overrides.
Local Bun was upgraded to 1.4.4, pinned as `bun@1.4.4` in `packageManager`;
both CI setup steps now read that field through `bun-version-file: package.json`.
The refreshed lockfile uses format 3, required by [Bun's nested override
support](https://bun.com/docs/pm/overrides), and must be installed with the pinned
Bun version. Retain frozen-lockfile installation.

## Evidence and remaining checks

- **Passed:** clean `bun install --frozen-lockfile` under Bun 1.4.4 exited 0;
  the repository install also passed without changes. Fresh audit exited 0
  with no advisories reported across 453 packages.
- **Passed:** the application renderer reproduced a `RangeError` with 2,000
  repeated iframe tags under sanitize-html 2.18.0. The regression passes with
  2.18.1, preserving safe text and emitting no iframe element; fallback markup
  is escaped.
- **Passed:** Miniflare 5's exported `convertV4MiniflareOptions` and
  `dispatchFetch` smoke test returned HTTP 200 under explicit Node 22.23.4.
  Resolution assertions confirmed Undici 7.30.1/8.12.2 and Zod 4.6.7.
- **Passed:** `bun run check` exited 0: zero type diagnostics, 46 generated
  pages, 14 published Supabase posts, 607 unit tests with all four coverage metrics
  at 100%, 72 delivery tests, and 160 browser passes. The 32 skips were explicit
  comparison or mocked-service cases.
- **Passed:** a separate build without Supabase credentials exited 0 and
  generated 41 fallback pages in a separate output directory.
- **Verified separately:** authenticated preview Access identity returned
  `admin@xhverse.co`. Existing allowlists remain as documented in
  [architecture](../architecture.md); Access admission does not grant Supabase
  application or database permissions.
- **Merge requirement:** current candidate CI and matching Cloudflare preview
  evidence, recorded on the remediation PR. Production promotion remains separate.

These results do not establish production deployment. Preserve historical
validation records and require the merge checks before release readiness.
