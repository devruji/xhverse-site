# Dependency security remediation

[Issue #327](https://github.com/devruji/xhverse-site/issues/327) tracks the dependency advisory findings that blocked [draft release PR #326](https://github.com/devruji/xhverse-site/pull/326). The user approved the remediation on 2026-10-11. The branch starts from development `9748fdf0692a01b5c8fe2146b18ea3ed2df4b541`; v3.9.9 is release-candidate metadata, with production promotion pending.

The release-preparation audit reported 57 issues: 1 critical, 28 high, 23 moderate and 5 low. This is the pre-remediation snapshot, not a current pass or a confirmed count of exploitable production defects.

## Approved changes

- Upgrade Astro from 6.4.8 to 7.2.8 with its supported Vite 8/Sharp dependency graph. Sharp resolved to 0.35.5, beyond the initially approved 0.35.4 target; remove the unsupported global Sharp override.
- Raise the `smol-toml` override to 1.9.0. A bounded subprocess regression captured the old parser failing to finish within a two-second timeout; validate the same fixture against the patched parser.
- Apply the remaining advisory fixes within the approved dependency scope; the resolved graph and observed checks are recorded below.

Astro 7 uses Vite 8; remove the old forced Vite 7 override so the framework resolves its supported bundler. Review the compiler, HTML whitespace, Markdown and transition changes against the [official Astro 7 migration guide](https://docs.astro.build/en/guides/upgrade-to/v7/). The supported dependency graph requires Node 22.19.0 or newer: Astro’s Unifont chain declares Undici 8, whose patched version raises the runtime floor. Remove the forced Undici 7 override rather than violating that dependency range. The repository/CI pin is 22.23.3; Cloudflare builds read `.node-version`, so this does not require a live environment-variable change. Production adoption remains pending release promotion.

`compressHTML: true` explicitly retains Astro 6 inline whitespace behavior rather than adopting Astro 7’s new JSX whitespace default. Rendered output and navigation checks are recorded below.

The intended application behavior remains static publishing, client-side tools, `ClientRouter` navigation, both themes and existing SEO/CSP behavior. Backend schemas, admin behavior, environment values and branch protection are outside this remediation. Migration compatibility fixes must stay limited to confirmed failures.

## Resolved dependency graph

| Area | Resolved versions |
|---|---|
| Framework/image build | Astro 7.2.8, Vite 8.3.4, Sharp 0.35.5 |
| HTML and tests | sanitize-html 2.17.7, Vitest/coverage 4.1.11 |
| Cloudflare tooling | Wrangler 4.149.0, vendor-declared Miniflare 5.20261006.1-alpha |
| Parsing | smol-toml 1.9.0, js-yaml 4.3.2, fast-uri 3.1.8 |
| Serialization/style | devalue 5.9.3, PostCSS 8.5.29, Nanoid 3.3.19 |
| Other patches | source-map-js 1.2.2, SVGO 4.1.0, http-cache-semantics 4.3.0 |
| Fetch chains | Astro/Unifont Undici 8.11.2; Wrangler Undici 7.29.1 |

Wrangler and Astro resolve their declared fetch dependencies separately; no global Undici override forces one major across incompatible ranges. Astro uses Vite 8.3.4 while the separate Vitest/Tailwind peer chain retains Vite 7.3.5. The global Vite override is removed; the graph does not force every consumer onto one Vite major.

## Compatibility fixes

Astro's stricter compiler exposed a missing closing `div` on the homepage; the matching close tag was added without an intended design change. The initial E2E attempt failed because Astro 7.2 automatically detached its preview server when detecting an agent. Playwright's child environment now sets `ASTRO_PREVIEW_BACKGROUND=0` to preserve foreground server ownership and teardown, using the [documented background-mode opt-out](https://docs.astro.build/en/guides/build-with-ai/#background-mode). The corrected E2E rerun passed.

## Validation and release gates

Dependency and bundler inputs changed, so prior Astro 6 checks do not establish migration correctness. The independent scoped code/security review passed for the dirty candidate based on `9748fdf0692a01b5c8fe2146b18ea3ed2df4b541`. Checked input fingerprints use SHA-256 of the sorted compact JSON mapping of path to SHA-256 content:

- Application: `abcf4a3772a4f2d0ad1ecadd577fcefe2428dcaa4fc9207f57b8598ce4eb7b1d` across 220 files.
- Delivery: `53e406d3d631b906287aa2574f61cbe9970802861ce3caa5a682009cbd066cdb` across 15 files.

Configured validation used macOS, Node 22.23.3, Bun 1.3.10 and Playwright 1.61.1. The CI runtime was separately checked with Bun 1.2.21 frozen installation.

Observed checks on the updated graph:

- Fresh `bun audit`: zero advisory findings.
- Bun 1.2.21 frozen-lockfile installation: exit 0 with no lockfile change; format remains version 1.
- Bounded TOML regression: four checks passed in 36ms; the old-parser reproduction timed out at two seconds.
- `bun run typecheck`: zero errors. `bun run build`: 46 static pages. `bun run coverage`: 585 tests, 100% on all four metrics. `bun run test:delivery`: 68 passed.
- Corrected `bun run test:e2e:built`: 84 checks passed in 12.2s across Chromium desktop and Pixel 5 projects.
- Isolated build without environment credentials: 41 static pages. The difference from the configured 46-page build reflects the local fallback editorial dataset.
- Miniflare 5 local-worker smoke returned HTTP 200 through the official v4 migration adapter; Wrangler 4.149.0 CLI smoke passed.
- Five controlled captures (desktop dark/light, mobile dark/light and contact) were byte-identical to the same-environment baseline after visible images loaded, with no overflow in either viewport. Earlier zoom-mismatched captures were repeated. Measured CSS viewports were 1422×1000 desktop and 433×938 mobile at DPR 0.9; standard E2E project viewports were checked separately. This comparison covers those captures, not every page or interaction.

The literal `bun run check` attempts first failed on the missing tag and later on detached preview ownership. All selected component checks passed after the minimal compatibility fixes; this is not a claim that a final literal `bun run check` invocation passed. The local pipeline retains one build per successful full check.

The remediation feature PR must pass fresh merge-candidate CI before merging to development. Draft release PR #326 still targets the previous candidate and remains blocked until remediation reaches development and the updated release candidate passes CI and its gates. After production promotion, verify the expected commit is active successful Cloudflare production and smoke-test public routes/metadata/headers. No production migration or timing improvement is claimed.

## Rollback

If compatibility or advisory checks fail, keep the release blocked and correct or revert only the affected dependency/migration change through the protected PR flow. Do not promote the vulnerable baseline as a rollback shortcut. Preserve the validation and deployment controls delivered by PRs #324 and #325.
