# Homepage comparison checkpoint

Status: **Publication composition selected; palette and motion refinement pending.**

Review: <http://127.0.0.1:4322/design-review/compare>. The preserved homepage is
at <http://127.0.0.1:4321/>. No push, publication, or production change was made.

## What is implemented

- Professional dossier: portrait and professional identity beside a structured
  record, graphite and blue, stacked content on mobile.
- Technical publication: large name, natural-proportion portrait and introduction
  band, warm charcoal/paper palette. Mobile introduces the person and actions
  before the larger portrait.
- Practitioner studio: identity beside the SCD history example, deep ink and
  teal, compact artifact rows, distinct contact panel.

All candidates use `src/data/design-review.ts` for identical profile, experience,
examples, links, and article selection. The route resolves the existing blog
loader once and shares that collection across all four pages. ABAC is featured
only when present; otherwise the latest article leads. Two additional distinct
articles may follow. Empty collections render a truthful empty state. Configured
loader failures still fail the build rather than inventing available content.
This local build uses the repository fallback; live publication status was not
verified. The comparison page states that limitation.

The tool examples are excerpts from existing engines, not client outcomes:

- SCD: `loyalty-tier-at-transaction-time`, `type_2`; C001 changes Bronze to Gold
  on 1 March 2026. Reporting remains Bronze 1,000 / Gold 1,500, without an
  invented currency.
- Recovery: `recovery-failure-mode=3`, `recovery-replay=2`,
  `recovery-idempotency=2`, `recovery-state=1`, `recovery-consumers=3`,
  `recovery-evidence=2`. Output: 54/100, Needs design work; first two genuine
  actions cover checkpoint/state documentation and idempotency.

## Isolation and operation

`DESIGN_REVIEW=1` injects the route family from `src/design-review/page.astro`
and builds into `.tmp/design-review-dist`. Ordinary builds inject no review
routes or candidate CSS. Both build modes exclude review URLs from the sitemap;
all four review pages explicitly set `noindex, nofollow`. Review CSS lives in
its own shell/components, with no import into the public or admin layouts.

From this worktree, with the repository's Node 22 on PATH:

```sh
DESIGN_REVIEW=1 bun run build
DESIGN_REVIEW=1 ASTRO_PREVIEW_BACKGROUND=0 bun run preview --host 127.0.0.1 --port 4322 --ignore-lock
```

`--ignore-lock` starts a foreground preview beside the existing port 4321
instance; do not use `--force`, which would replace it. Review E2E uses port 4323
and retains `reuseExistingServer: false`. Existing no-JavaScript tests now use
Playwright's configured base URL instead of hard-coding port 4321.

## Review findings and refinements

The UX reviewer inspected twelve complete screenshots: three directions at
1440px and 390px, in both themes. One focused refinement round addressed:

1. Publication's desktop portrait crop: now contained at natural proportions.
2. Publication's mobile composition: now full-width intro and actions before
   the portrait, distinguishable from Dossier's portrait/text columns.
3. Duplicate footer rows: candidates retain one footer; comparison controls
   remain accessible from the header.

Initial full-page captures sometimes preceded lazy article-image loading.
Final captures await image decoding; no content or lazy-loading behavior was
changed to hide a defect. The PM found no positioning blocker: Dossier favors
career scanning, Publication balances identity and writing, Studio foregrounds
technical craft and puts employer context later on mobile. The writer found no
material factual or clarity issue. Engineering review traced route injection,
article authority/selection, style isolation, theme reuse, and preserved routes.
These reviews establish review readiness, not visual approval.

Reference qualities were studied from [Brittany Chiang](https://brittanychiang.com/)
(career inspection), [Simon Späti](https://www.ssp.sh/) (connected technical
content), and [Josh Comeau](https://www.joshwcomeau.com/) (article discovery).
The composition and public copy use xhverse material.

## Validation evidence

Checked on 14 October 2026 in `codex/portfolio-editorial-redesign`, base commit
`c0371bd`. The worktree already contained the broader redesign. This checkpoint
adds the review family, shared snapshot/tests, scoped presentation, build/test
isolation, and these records; the existing homepage implementation is preserved.

Environment: Node 22.23.3, Bun 1.3.10, Astro 7.3.8, Vitest 5.0.3,
Playwright 1.64.0. Existing dependencies and lockfile unchanged. Lockfile SHA-256:
`9d4495582f28f65862f4ac53b6e10b14207eb6ea14cf1768f573cbc28a82c803`.

| Check | Result |
| --- | --- |
| `DESIGN_REVIEW=1 bun run check` | Exit 0: typecheck; 45-page build; 594 unit tests; 100% statements, branches, functions, lines; 69 delivery tests; 128 browser tests passed, 4 skipped |
| `bun run build --outDir .tmp/design-review-disabled` | Exit 0: 41 pages; no review route directory or candidate CSS |
| Both sitemap outputs | No `/design-review/` URLs |
| `bun run validate:surfaces` | Exit 0: 170 guidance surfaces |
| `git diff --check` | Exit 0 |
| Playwright MCP screenshots | All three directions, 1440px/390px, dark/light, all images decoded |
| Review E2E | Both themes, 1440px/390px/320px, 200% root text enlargement at 320px, theme persistence, reduced motion, image loading, section links, no-JS navigation and keyboard focus |
| Existing behavioral E2E | Tool calculations/journeys, CV local availability/focus flow, public navigation, admin isolation |
| Computed text contrast | Sampled header links, candidate headings, paragraphs, lists and links: no failures; minimum 5.12:1 across both themes, including tool surfaces |
| Live local HTTP readback | All four comparison routes 200; port 4321 remains 200 with original homepage heading |

Raw logs, per-file hashes, and screenshots are ignored local artifacts in
`.tmp/design-review/`. Screenshot names are
`{dossier,publication,studio}-{1440,390}-{dark,light}.png`.
`input-hashes.json` was captured before the successful full check and verified
unchanged afterward. The final source manifest includes tracked and relevant
untracked source/config/test inputs, not credentials.

Resolved validation failures: the new recovery test initially omitted the
`recovery-` prefix on answer IDs; the corrected fixture matches engine output.
The new browser test initially used an untyped image locator; explicit
`document.images` resolves the TypeScript error. Astro's CLI preview lock was
resolved with its supported foreground `--ignore-lock` flag.

Limitations: four configured-CV saved/duplicate service tests require a separate
mock-service build and were skipped. No live CV submission/email delivery,
authoritative CMS refresh, release security gate, CI, or deployment was performed.
The user subsequently selected Publication's composition and requested research
and team review of a more professional, minimal palette and motion treatment.
See [the follow-up study](professional-palette-motion-research.md). The original
warm styling has not received full visual approval.
