# Interaction motion pilot validation

Status: **Historical pilot validation passed; user accepted the four-surface
pilot on 2026-10-15 and requested ordinary public-site enablement.**
Date: 2026-10-14. Branch: `codex/portfolio-editorial-redesign`, base
`c0371bd78a6208deda1e9327c1000bec6bfd6567`. Existing redesign edits are preserved.
Motion specification and approval status live in root [DESIGN.md](../../DESIGN.md).
The [bounded audit](motion-pilot-audit.md) records scope and rejected candidates.

This record describes the 14 October pilot and its original inputs. Its checks,
fingerprint, build isolation and approval limits below are historical.
They do not validate the subsequent ordinary-build enablement. See
[motion-rollout-validation.md](motion-rollout-validation.md) for that work's
verification status. Palette and complete-page styling remain pending;
the motion acceptance does not authorize push, PR, merge or production release.

Review [the live comparison](http://127.0.0.1:4322/design-review/motion) and
[recordings](http://127.0.0.1:4324/). The recording viewer provides baseline,
normal pilot, and 5x slower animation playback. Use linear playback; WebM
scrubbing was unreliable in the inspected Chromium viewer. Port 4321 retains
the existing baseline server, PID 26702, with HTTP 200 and no pilot marker.
All builds use separate output directories; that preview was not restarted.

## Changed scope

- Five repo-local skills under `.agents/skills/`, with archived entrypoints,
  supporting resources, MIT notices and source hashes. Pin:
  `2d228630ba1446365f614a108cb8252f1feda202`. Installation used the existing
  skill-installer's explicit worktree destination. No global installation,
  new runtime dependency, animation library or agent role was added.
- Native internal `src/lib/ui-motion/` controller and co-located tests;
  `MotionPilot.astro` for action feedback and scoped styles.
- Header disclosure, BaseLayout build gate, CV lifecycle in `cv.astro`, and
  recovery journey in `tools/[slug].astro`. Modal markup and submission
  contracts remain unchanged. Reading content, images and static cards stay still.
- Injected `src/design-review/motion.astro` route, Astro configuration,
  `motion.spec.ts` regressions, and the existing public-design reduced-motion
  assertion aligned to pilot `0s` versus ordinary `1e-05s` behavior.
- Motion specification, audit/validation, skills index, frontend/QA skills,
  AGENTS/CLAUDE, Cursor project guidance and existing frontend/QA role guidance.

## Matching evidence

macOS 26.6.2 arm64, Node 22.23.3 via explicit PATH override, Bun 1.3.10,
Astro 7.3.8, Vitest 5.0.3 and Playwright 1.64.0. Artifact capture used isolated
Chromium 156.0.8078.4. Playwright MCP handled interactive inspection/recordings;
the installed Playwright library handled the extended capture matrix and CDP traces.

Tracked and relevant untracked input manifests matched before, after and at
final review. SHA-256:
`621ded82a9acda3226916682ee169f9182c9eced77cfc3e1566395c4ff1247a5`.
Generated artifacts, this evidence record and separately reviewed `DESIGN.md`
are excluded. Dependencies and lockfile are unchanged.

| Check | Observed result |
| --- | --- |
| `DESIGN_REVIEW=1 bun run check`, with Node 22 PATH | Exit 0: zero type diagnostics; 47 pages; 605 unit tests; all four coverage metrics 100%; 69 delivery tests; 168 browser tests passed, four configured-service cases skipped |
| `env -u DESIGN_REVIEW bun run build --outDir .tmp/motion/ordinary-dist`, with Node 22 PATH | Exit 0: 41 pages; no pilot attributes or review routes |
| Fresh ordinary browser readback on temporary port 4325 | Review route 404; no pilot marker; no motion WAAPI calls for menu/CV/checkpoint; pointer CV closes immediately; reduced control duration remains `1e-05s` |
| Indexing isolation | Explicit noindex/nofollow review page; no review URLs in either sitemap |
| Motion browser suite | 20 desktop/mobile checks covering rapid reversal/reopen, immediate keyboard/Escape/focus, runtime reduced changes, pointer cancellation/outside release, native no-JS navigation, validation/calculation/copy/reset, other-tool isolation and route revisits |
| Both themes at 1440px, 390px and 320px | 36 captures across comparison/menu/CV/recovery and doubled-text CV/recovery states; no horizontal overflow; enlarged CV actions remain reachable by panel scrolling |
| Focus and enlarged reading | Immediate accent 2px outline/4px offset; no outline CSS transition; pilot reduced transitions exactly 0s; recovery description line height 20px normal/40px with doubled text; glyph-line nonoverlap verified |
| Interaction contrast | Sampled steady-state visible text minimum 5.18:1. Raw border/focus measurements retained; low existing decorative/unselected borders are not represented as a blanket WCAG pass. Reviewers found no motion-specific affordance blocker |
| 4x CPU rendering traces | Menu/CV/actions and six-checkpoint recovery/result: no RunTask above 50ms; maximum Layout 1.048ms and 4.298ms respectively. Includes legitimate disclosure, focus, scrolling and form state work; not proof of compositor promotion |
| Retained source hashes | 15 original skill/resource/notice hashes verified against recorded immutable source hashes |
| Guidance and whitespace | `bun run validate:surfaces` and `git diff --check` exit 0 |

## Expert verdicts and focused fixes

**UX: PASS. Product: ready for user browser review. Engineering/QA: PASS.**
No outstanding material pilot findings remain. Reviews covered actual live
behavior, normal/slowed recordings, themes, enlargement, interruption,
native semantics, lifecycle/build isolation and matching final test evidence.

Two visible findings were reproduced before patching: existing controls
animated focus outlines for 180ms, and recovery descriptions retained fixed
20px line height when text doubled. Browser-only CSS changes falsified the
alternative hypotheses. The final fixes are pilot-only: explicit justified
color transition properties, immediate outlines/zero reduced duration, and
relative recovery description leading that preserves normal spacing.
The new regressions pass. One pre-existing test expectation was aligned with
the intentional pilot duration. Two focused UI review rounds were sufficient.

## Evidence and limits

Raw commands, exit metadata, environment, manifests, hashes, failed/intermediate
logs, screenshots, recordings and traces remain under `.tmp/motion/`.
Final logs are `check.log`, `ordinary-build.log`, `surfaces.log`, and
`diff-check.log`; summaries include `validation-summary.json`, `isolation.json`,
`visual-matrix.json`, `cpu4-summary.json` and `cpu4-recovery-summary.json`.
Recordings are `baseline-normal.webm`, `pilot-normal.webm` and
`pilot-slow-5x.webm`. The served viewer and pilot remain available for review;
the temporary ordinary server was stopped after validation.

Four saved/duplicate CV checks require `CV_MOCK_SERVICE=1` and a separate
isolated mocked-service build; they were skipped explicitly. Bot-protection
widgets were mocked for motion inspection. No live CV submission/email,
live CMS publication status, physical phone/GPU performance, CI, push,
deployment, user visual approval, or wider motion rollout was verified.
CPU throttling is desktop browser evidence and does not model phone GPU or memory.
The local static preview reports existing meta-only `frame-ancestors` and
`X-Frame-Options` diagnostics. Cloudflare edge-header enforcement was not checked.

The 14 October checkpoint ended at local browser review. Reviewer passes do not authorize
publishing or establish measured visitor/usability-study results.
