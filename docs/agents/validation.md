# Validation and deployment evidence

Use the smallest sufficient local checks, preserve full application PR validation, and reuse valid evidence during review. This policy applies to Codex, Cursor, Claude, role cards, and QA/security skills.

## Choose checks from the change

| Change or situation | Local work and review | Required PR validation | Deployment |
|---|---|---|---|
| Read-only review; validated inputs unchanged | Inspect the actual diff and existing evidence; run no automatic runtime checks | Existing evidence; no new run required | None |
| Guidance or documentation only | Review documents; validate changed Markdown, YAML/frontmatter and TOML; whitespace check | Lightweight `Test and Build` check | None |
| Small application change | Targeted type/unit checks and affected-page preview | Full pipeline, 100% application coverage, desktop and mobile E2E | Existing Git integration |
| Shared logic, dependencies, tests, delivery code, or unknown paths | Relevant broader checks; delivery scripts also need fixture tests | Full pipeline | Existing Git integration |
| Production promotion | Review release diff, merge-candidate CI and QA/security evidence | Validate the release merge candidate | Verify active Cloudflare production and smoke test |
| Blog content changed without Git changes | Review content and cover under the editorial workflow | Existing editorial workflow | Fresh rebuild and verify blog/article routes |

Only `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/**`, `.agents/**`, `.cursor/**`, and `.codex/**` qualify as guidance paths. A change involving any other path uses full PR validation. Deleted and renamed paths count; both sides of a rename must qualify. Mixed changes, unknown paths, incomplete Git history, and changes to CI, scripts, tests, dependencies, runtime configuration or delivery inputs use full validation. Never skip the whole required workflow with path filters: its `Test and Build` job must report a result.

Visible changes require user browser review of affected pages in both themes and a mobile viewport before push. Guidance-only changes receive document review. Use Playwright MCP or the installed isolated Playwright fallback. Preserve branch protection and feature → development → main flow.

## Record and reuse evidence

The implementer records evidence once; the reviewer inspects the actual worktree and evidence once. Do not rerun a successful command merely because another agent performed it or a review started.

An evidence record contains:

- Checked commit and base revision, or a dirty-worktree fingerprint tied to its base commit. For dirty worktrees, include staged and unstaged differences plus content hashes for relevant untracked inputs; `git diff` alone omits them. List the validated input scope and record the fingerprint before and after commands.
- Environment and tool versions: OS, Bun, Node, relevant framework/test/browser versions, lockfile identity, and build/test configuration identity. Record relevant non-secret environment names and safe values or whether they are configured; never store credentials or hashes of secret values.
- Exact commands, runner, timestamp, exit statuses and useful output lines. Include tested routes/browser projects, coverage result, and any failure or unverified part.
- For CI, run URL, checked head/merge-candidate revision and results. For deployment, expected commit, deployment ID, active production confirmation, verified routes, metadata and headers.

Reuse evidence only when the relevant inputs, environment, tools, command scope and results still match. If source, lockfile, configuration, build-time content, tools or relevant environment changes, repeat the affected checks. A missing fingerprint, incomplete output or unresolved failure cannot establish a pass. An unchanged Cursor handback with complete evidence needs review only. A later edit to shared logic invalidates its unit/coverage evidence and dependent build/E2E evidence; a browser version change invalidates browser evidence. A guidance edit alone does not invalidate unchanged application inputs.

This is review evidence reuse, not automatic CI test-result caching across commits. Every application PR CI run validates its current merge candidate. Dependency installation/build caches may accelerate fresh work; Cloudflare still builds Astro and reads Supabase content afresh.

## Commands

- `bun run validate:surfaces`: validate established guidance surfaces; combine with `git diff --check` and document review.
- Targeted local checks: `bun run typecheck`, focused Vitest tests, affected-page browser checks, or relevant delivery fixture tests (`bun run test:delivery`). Select from the changed inputs and risk.
- `bun run check`: typecheck → build → coverage → `test:delivery` → `test:e2e:built`. It builds once.
- `bun run test:e2e`: builds first for standalone use. `bun run test:e2e:built` consumes an existing build whose inputs match the evidence. Playwright owns its preview server and must fail when its port is occupied rather than reuse an unrelated server.

Full application PR CI remains mandatory even when local checks are targeted. Retain all four 100% coverage thresholds on `src/lib/**` and `src/data/**`.

## Mobile interaction reports

For reported mobile failures, use the [mobile interaction workflow](mobile-interaction-validation.md).
A narrow viewport and a passing Chromium mouse click do not establish iPhone
touch behavior. Record browser engine/version, touch input, lifecycle, and
physical-device limits before accepting a regression fix.

## Release gates and verified deployment

A draft development → main release PR may collect merge-candidate CI evidence before QA/security review finishes. Before merging, require successful candidate CI and both QA and security gates. Scope review to the release diff and affected systems, broadening for shared, auth, platform, dependency or delivery changes. Reuse valid regression evidence; refresh dependency advisories for application releases because advisories change independently of Git. If advisory access fails, report that gap and do not claim the security gate passed.

Main-push Actions verifies deployment instead of repeating full validation. For application promotions, use read-only Cloudflare API calls with existing secret references: poll every 10 seconds for up to 15 minutes, require successful production deployment of the expected main commit, and confirm it is the active canonical deployment. Smoke-test homepage, blog, tools, and affected public routes; check `https://xhverse.co` canonical URLs, production indexing metadata and required security headers. Publish GitHub deployment success only after verification passes. Failure, missing credentials, timeout, preview-only/wrong-commit deployment or a superseding release cannot produce a current-production success claim. Guidance-only promotions report “deployment not required.”

Keep Cloudflare Git integration, human/development previews, Dependabot preview exclusions and guidance watch-path exclusions. Preserve environment values, bindings, domains, production branch and editorial rebuild hooks. Export non-secret settings before a narrow patch and compare live readback. Blog rebuilds with unchanged Git still require fresh deployment evidence.

## Review walkthroughs

1. **Unchanged Cursor handback:** compare its input fingerprint, environment and commands to the actual worktree; review the diff and accept matching successful evidence without running tests again.
2. **Subsequent edit/environment change:** identify affected evidence and rerun only those checks; CI still validates the current application candidate.
3. **Guidance-only:** validate changed surfaces and whitespace, review documents, and use the lightweight required check; no application build, browser review or deployment.
4. **Visible UI:** targeted local checks plus user review in both themes/mobile; full application PR CI.
5. **Auth/platform:** trace trust and delivery boundaries, run relevant broader checks and fixture tests, review security evidence; full application PR CI and verified production after promotion.

Record observed check/build counts and setup, queue and time-to-verified-production timings for rollout stages. Keep human review time separate. Do not promise a speed improvement without comparable runs. Revert the affected stage if classification skips required work, protected checks stop working, previews break or deployment verification becomes unreliable.
