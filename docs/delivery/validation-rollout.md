# Validation and deployment rollout

This change keeps Git integration, protected branches and application coverage. The implementation has three reviewable parts: agent policy/local build ownership, PR classification/production verification, and narrow Pages settings. No application feature, Supabase schema, admin behavior, branch protection or release tag changes are included.

## Baseline captured on 2026-10-11

- Base branch: `development` at `389f2e1eb696270d9c4178d40f64b3b72a4df3f0`; existing production main: `9ee99678d2bc7f27bc133b33c2bbfe08ac337c60`.
- Both branches require `Test and Build` from GitHub Actions, with strict up-to-date checks. Protection was read, not changed.
- Previous CI runs: [feature PR](https://github.com/devruji/xhverse-site/actions/runs/37221980942), [development push](https://github.com/devruji/xhverse-site/actions/runs/37222137158), [release PR](https://github.com/devruji/xhverse-site/actions/runs/37222172143), [main push](https://github.com/devruji/xhverse-site/actions/runs/37222329042). Each ran full validation; main also created a synthetic success record. The main full job lasted 89s, queued about 2s, dependency install took 2s, browser setup 26s, and validation 40s with one build in CI. These are historical observations, not a comparable speed benchmark.
- Local Playwright configuration previously built inside its web-server command outside CI, causing a second build after `check` had built. The attempted local baseline could not finish under sandbox networking because configured Supabase content reads failed. No successful local before/after timing comparison is claimed.
- Pages caching was disabled, previews included all branches, and watch paths included all files without exclusions. The non-secret settings export is [cloudflare-baseline.json](./cloudflare-baseline.json); environment values and tokens are deliberately absent.
- Previous production deployment `8cea046d-72de-4dbe-aeff-2b12c0404432`: queued 0.003s, initialize/clone 7.960s, build 16.117s, deploy 14.122s; about 38.747s from creation to successful deploy. Its former Actions success record was not evidence of this state.

## Implementation and local evidence

Policy and examples live in [validation.md](../agents/validation.md). Matching evidence is reused during reviews; CI does not reuse results across application commits.

Local environment: macOS, Bun 1.3.10, Node v22.23.3, locked Astro 6.4.8 and Playwright 1.61.1. CI retains Bun 1.2.21 and `.node-version` (22.16.0). Differences are recorded rather than silently treated as identical environments.

- `bun run check` passed: typecheck, exactly one Astro build, 585 unit tests at 100% of all four coverage metrics, delivery fixtures, and 84 desktop/mobile E2E checks. Application inputs did not change afterward; later delivery edits received fresh fixture and type checks.
- Final delivery fixtures cover established guidance, application/mixed/unknown paths, deleted and renamed files, malformed frontmatter/YAML/TOML, missing history, occupied-server policy, and failure-safe deployment reporting.
- Standalone `bun run test:e2e` passed 84 checks from an isolated checkout with no `dist` or `.env`, confirming build-first and no-credentials behavior. A physical dependency copy was necessary: a symlink to another checkout's dependencies produced Astro compile-cache path errors. No application patch was needed.
- An actual Astro dev server occupying port 4321 caused `test:e2e:built` to fail clearly with “already used.” The test server was terminated; Playwright's own server exited after successful checks.
- `bun run validate:surfaces` and `git diff --check` passed. No visible UI changed; document and diff review apply.
- Read-only production verification passed for the existing commit and active deployment, including canonical URLs, indexing metadata and required security headers. Wildcard discovery also verified all 14 published articles and 15 tool pages through the production sitemap.

## Pages settings and rebuild evidence

The applied patch enables `build_config.build_caching`, custom preview includes `*`, excludes `dependabot/*`, watch includes `*`, and watch excludes `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/*`, `.agents/*`, `.cursor/*`, `.codex/*`. These exclusions are also exported by `scripts/ci/guidance-paths.ts`. Readback matched every patched field; production branch, build command/output/root, environment configuration, bindings, domains and active deployment were preserved.

An explicitly approved retry of the existing production deployment queued new deployment `bb7e1c1a-dc0d-4367-95e8-ad06904eb5fa` with unchanged Git SHA. It completed successfully and became canonical production. This checks rebuild behavior without editing content. Fresh static generation remains enabled; caching only supplies dependency/framework intermediates. Rebuild route verification is recorded separately from CI rollout evidence.

## Remaining rollout checks

The workflow becomes active when reviewed changes merge to development/main through the existing flow. Record live results in the PR/release evidence rather than rerunning checks merely to update this document:

1. Application pilot PR: required full check, both browser projects, preview creation/cache restoration and preview noindex.
2. Guidance-only pilot PR after adoption: lightweight required check and no Pages build. Confirm no development-push duplicate full run after merge.
3. Dependabot update: full GitHub validation and no preview. Compare cold/warm preview runs before claiming a timing improvement.
4. Next application release: merge-candidate CI, scoped QA/security and fresh advisories before merge, then verifier/GitHub record matching active Cloudflare production.

Keep human review time separate from setup, queue, build and verified-production time. Pages watch paths can intentionally build on empty pushes, 20+ commits or 3000+ changed files; exclusions are not an unconditional guarantee for those events. See [Cloudflare watch-path limits](https://developers.cloudflare.com/pages/configuration/build-watch-paths/).

## Rollback

If guidance classification skips required work or checks stop behaving correctly, revert the CI/classifier part through a feature PR to development. Unknown/missing history must always choose full validation. Revert only the affected stage.

For Pages, restore only the original `build_config.build_caching` and source config preview/watch controls from the baseline export through a narrow PATCH, then read back and compare. Do not submit the sanitized environment export as deployment configuration; it does not contain the preserved values. Leave production branch, bindings, domains and rebuild hooks unchanged.

Revert local build/policy changes through the same protected flow if preview ownership or evidence rules become unreliable. Do not recreate synthetic deployment-success reporting.
