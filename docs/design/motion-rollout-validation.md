# Accepted motion in ordinary public builds

Status: **Implemented and validated locally.** The user accepted the motion
pilot on 2026-10-15 and explicitly requested ordinary-build enablement on the
same four surfaces. Palette, complete-page design and additional motion remain
separate decisions. No push, PR, merge or production promotion was performed.

Preview: [ordinary build](http://127.0.0.1:4325/),
[CV](http://127.0.0.1:4325/cv),
[Recovery Planner](http://127.0.0.1:4325/tools/pipeline-recovery-planner).
The original port 4321 preview is preserved. The optional
[comparison](http://127.0.0.1:4322/design-review/motion) remains available.

## Change and boundaries

`src/components/UiMotion.astro` now owns the accepted action feedback and scoped
styles, replacing the component under `design-review/`. BaseLayout always
includes it and sets the neutral internal `data-ui-motion` attribute. Header,
CV lifecycle and the recovery journey use that attribute. `DESIGN_REVIEW`
controls comparison routes only; ordinary public interactions no longer
depend on it. AdminLayout is unchanged and excludes the marker/controller.

The [accepted specification](../../DESIGN.md) is unchanged: primary/secondary
and icon-button press feedback, native mobile menu, CV dialog, and Pipeline
Recovery Planner checkpoint/result entrances. Timings, easing, pointer
eligibility, interruption guards, immediate keyboard/reduced motion and focus
outlines remain intact. Other journeys have no checkpoint/result entrance
motion. Reading text, portraits, writing covers, static cards and numeric
scores/progress stay stationary. No dependency, backend, schema or public API
change was introduced.

Interaction tests now run in both build modes instead of being review-only.
New checks confirm ordinary public enablement and admin exclusion. Existing
ordinary reduced-motion expectations now match the accepted zero duration.
Only the internal helper description/test label changed; its implementation
and cancellation guard were preserved.

## Validation

Branch `codex/portfolio-editorial-redesign`, base
`c0371bd78a6208deda1e9327c1000bec6bfd6567`. Existing worktree edits were preserved.
Environment: macOS 26.6.2 arm64, Node 22.23.3 via explicit PATH, Bun 1.3.10,
Astro 7.3.8, Vitest 5.0.3, Playwright 1.64.0. Isolated browser capture:
Chromium 156.0.8078.4.

Before/after/final input manifests matched SHA-256
`55e2f3baac959c543b2c6e7a5db4c7d42d327fb7813666611aead615ad8ffe4f`.
Scope includes tracked and relevant untracked sources/configuration/tests and
the local test wrapper. Generated artifacts, `DESIGN.md` and the historical
pilot/current rollout evidence records are excluded and reviewed separately.

| Check | Result |
| --- | --- |
| Ordinary full pipeline, `DESIGN_REVIEW` unset | Exit 0: typecheck zero diagnostics; 41 pages; 605 unit tests; all four coverage metrics 100%; 69 delivery tests; 144 desktop/mobile browser passes, 32 skips |
| Review compatibility, `DESIGN_REVIEW=1 bun run check` with Node 22 PATH | Exit 0: zero type diagnostics; 47 pages; 605 unit tests/100% coverage; 69 delivery tests; 172 browser passes, four configured-service skips |
| Motion regressions | All 24 desktop/mobile cases run in both modes: press cancellation, rapid disclosure/CV reversal, focus/Escape, fresh/runtime reduced motion, native no-JS navigation, recovery validation/calculation/copy/reset, immediate outlines, enlarged text, other-tool isolation and revisits |
| Ordinary output/readback | All 32 public pages marked; all nine admin pages excluded; review route 404; real checkpoint entry starts at opacity 0.85/y6px over 180ms; CV Escape returns focus |
| Comparison isolation | Six review-only pages; explicit noindex on motion comparison; no comparison routes in ordinary output or either sitemap |
| Themes/reflow | 36 captures at 1440px, 390px and 320px in both themes, including doubled-text CV/recovery; no horizontal overflow |
| Rendering | 4x desktop CPU traces for menu/CV/actions and recovery checkpoints/results: no RunTask above 50ms; maximum Layout 1.13ms and 6.078ms respectively; physical-phone performance is unverified |
| Guidance/whitespace | Surface validation and `git diff --check` passed |

The ordinary pipeline runs the repository's five full stages: `typecheck`,
`build --outDir .tmp/motion-rollout/ordinary-dist`, `coverage`, `test:delivery`,
and `test:e2e:built --config .tmp/motion-rollout/playwright.config.ts`, with
Node 22 PATH and `DESIGN_REVIEW` unset. The ignored local wrapper imports the
real Playwright configuration, retains both projects, and owns port 4325 with
`reuseExistingServer: false`. Astro preview consumes the explicit ordinary
output. This preserves ports 4321/4322 without changing committed test/runtime
configuration. Review-mode validation owns port 4323.

The 32 ordinary skips are 28 comparison-only cases plus four CV saved/duplicate
service cases. Review mode runs those comparison cases; its four CV service
skips require `CV_MOCK_SERVICE=1` and a separate mocked-service build. Motion
inspection uses a mocked bot-protection widget; no live submission/email was
verified. Local fallback content does not establish live CMS publication state.

Raw logs, exact commands/exit metadata, environment, manifests, screenshots,
isolation readback and traces are in `.tmp/motion-rollout/`. The
[historical pilot record](motion-pilot-validation.md) retains its original
evidence and recordings; its fingerprint is not reused for these changed inputs.

Independent engineering/QA verdict: **PASS**, with no material findings.
The reviewer traced enablement, lifecycle, admin isolation and recovery-only
entries, and matched both pipeline results and artifacts to the current input
fingerprint. The accepted visible treatment is unchanged.

The ordinary-build preview remains running for inspection. Local static
preview retains the existing meta-only framing-header diagnostics; Cloudflare
edge-header enforcement, live services, physical devices and production state
were not verified. This implementation does not approve the remaining visual
design or extend motion to additional surfaces.
