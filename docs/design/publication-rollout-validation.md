# Approved Publication public-site rollout

Status: **Implemented, validated locally and approved in full-site browser
review on 2026-10-15.** The user approved Refined Publication's graphite/blue
palette and complete-page styling in both themes on 2026-10-15. The separately
accepted four-surface motion remains unchanged.

Open the [public-site preview](http://127.0.0.1:4326/). Review About, Writing,
Advisory, CV, Gallery and the tools through its native navigation. The preserved
previews on ports 4321 and 4325 remain available. The
[approved comparison reference](http://127.0.0.1:4322/design-review/publication-refined)
now uses the same homepage component as the public route.

## Implementation

- `PublicationHome.astro` and `publication-home.css` own the approved identity,
  portrait/introduction band, professional record, two worked tool examples,
  newest three distinct articles, full writing cover, discovery and contact.
  Ordinary Home uses its existing BaseLayout, Header and Footer exactly once;
  the refined comparison delegates to the shared component. Earlier comparison
  directions retain their presentation and remain review-only.
- `publication-palette.css` defines the approved roles once for both themes;
  public and refined-review styling share them. Public pages retain their own
  layouts while adopting the common typography, controls and surfaces.
  Success, warning, danger and information colors retain their meanings.
- The existing content factory moved to typed `src/data/publication.ts`, with
  a compatibility re-export for review callers. Published-post loading remains
  authoritative when configured. Unit checks retain sort/deduplication/order,
  empty collections, canonical catalog and real-engine example fidelity.
- Discovery binds once per new DOM on first load and `astro:page-load`. It
  selects two non-example tools, keeps functional static links without scripts,
  and reports optional storage failures without breaking navigation. It never
  replaces visible links later on a timer. Legacy hash destinations remain
  outside the replaceable list.
- Writing index/article covers use stable 16:9 frames with `object-fit: contain`.
  CV branding is neutral; actual status colors remain semantic. Article bodies,
  metadata, CV request/review/email behavior and domain engines are preserved.
- Tests now assert the approved composition rather than the superseded topic
  map, four fixed tool rows or orange palette. Comparison parity checks compare
  rendered copy independently of source indentation, retaining exact link,
  example and original-presentation assertions. Status copy records approval;
  the shared empty-writing state is appropriate for ordinary pages.

No runtime dependency, animation library, backend, schema, infrastructure or
admin change was introduced. Ninety-nine protected source inputs, including
domain libraries, admin routes/layout, shared legacy CSS, profile/blog/CV data
and dependency manifests, match the preceding motion-rollout snapshot. Built
article-body text also matches for all nine local articles.

## Validation evidence

Branch `codex/portfolio-editorial-redesign`, base
`c0371bd78a6208deda1e9327c1000bec6bfd6567`. Existing worktree edits were preserved.
Environment: macOS 26.6.2 arm64, Node 22.23.3 via explicit PATH, Bun 1.3.10,
Astro 7.3.8, Vitest 5.0.3 and Playwright 1.64.0. Isolated browser inspection used
Chromium 156.0.8078.4.

Before/after/final input manifests match SHA-256
`bb6a6570bb96bf6b951423af22887c10c6fb284538ed5787f4deafa675097a1d`.
The manifest includes tracked/relevant untracked sources, configuration, tests,
guidance and the local verification wrapper. Generated artifacts, `DESIGN.md`
and the separately reviewed pilot/motion/publication validation records are
excluded. Exact commands, exit metadata and environment are retained with the logs.

| Check | Result |
| --- | --- |
| Full ordinary Node 22 pipeline, `DESIGN_REVIEW` unset | Exit 0: zero type diagnostics; 41 pages; 606 unit tests; all four coverage metrics 100%; 69 delivery tests; 160 desktop/mobile browser passes, 32 explicit skips |
| `DESIGN_REVIEW=1 bun run check`, with Node 22 PATH | Exit 0: zero type diagnostics; 47 pages; 606 unit tests/100% coverage; 69 delivery tests; 188 browser passes, four configured-service skips |
| Ordinary isolation | All 32 public pages use the approved public layer; all nine admin pages exclude it; no comparison routes or alternative-candidate CSS in ordinary output |
| Review isolation | Six review-only pages, all noindex/nofollow; no review URLs in either sitemap |
| Visual review | 106 captures across 14 page families at 1440px, 390px and 320px in both themes, with 200% text enlargement and generated Placement/SQL states; no horizontal overflow, missing images or tight body-text leading in the captured states |
| Homepage parity | Full-width 1312px desktop Contact; two equal 642px discovery columns; one mobile discovery column; approved typography, complete cover and stationary reading content |
| Generated result contrast | Placement score/labels: light 5.48:1/6.55:1, dark 10.34:1/7.57:1. SQL code: light 15.57:1, dark 14.07:1 |
| Keyboard SQL reading | At 320px, Chromium tabs into the native scrollable PRE; ArrowRight changes its scrollLeft from 0 to 40px while page width stays 320px and answer selection remains unchanged; no explicit nested tabindex added |
| Guidance/whitespace | Surface validation and `git diff --check` passed |

The ordinary pipeline runs `typecheck`, `build --outDir
.tmp/publication-rollout/ordinary-dist`, `coverage`, `test:delivery` and
`test:e2e:built --config .tmp/publication-rollout/playwright.config.ts`, with
Node 22 PATH and `DESIGN_REVIEW` unset. The ignored wrapper imports the real
configuration, retains both browser projects, owns port 4327 and requires
`reuseExistingServer: false`. The human preview consumes that validated output
on port 4326. Review-mode checks own port 4323. No default `dist/` build or
replacement of the preserved port 4321 server was performed.

## Findings addressed

Two focused visual rounds resolved four presentation findings without changing
domain behavior:

1. A legacy `.contact` max-width constrained the new desktop section to 416px.
   A homepage-only width reset restores its approved full-width composition.
2. A more-specific flex rule defeated the discovery grid. Matching selector
   specificity restores the approved desktop/mobile column behavior.
3. The generated placement tile's translucent black surface reduced contrast
   in light mode. An opaque semantic surface preserves its green status and
   corrects readability.
4. Started SQL challenges overflowed at 390px and used low-contrast code colors
   in light mode. Scoped grid/min-width constraints contain queries; code uses
   the approved text/surface roles and retains local horizontal scrolling.

An initial resize check also sampled a pre-commit 368px main width at a 320px
viewport. Reproduction showed the same page at 320/320 after fonts and two
render frames. The test restores explicit responsive-render settlement before
the unchanged strict overflow assertion; twelve focused repeats passed.
Intermediate failure logs and the browser falsification evidence are retained.

UX review passed with no remaining material findings in the reviewed scope.
Engineering/QA and documentation reviews consume the matching final evidence;
their verdicts are recorded in the accompanying validation summary.

## Limits and handoff

This record captures local validation before feature-PR CI. The 32 ordinary
skips are 28 comparison-only checks plus four configured-CV
saved/duplicate cases; review mode runs the comparison checks. The four CV
cases require `CV_MOCK_SERVICE=1` and a separate mocked-service build. Bot
protection was mocked for inspection. Live submission/email, live CMS publication
state, physical-device performance, CI and production deployment were not
verified. The preview uses the local fallback article collection.

The local static preview retains the existing meta-only framing-header
diagnostics; Cloudflare edge-header enforcement was not tested. Contrast and
browser evidence cover the inspected states, not a blanket accessibility
certification or a physical-device usability study.

Logs, manifests, exact commands/exit metadata, screenshots, contrast measurements,
resize probes, keyboard evidence and intermediate runs remain under
`.tmp/publication-rollout/`. Key files are `validation-summary.json`,
`ordinary-check.log`, `review-check.log`, `isolation.json`, `visual-matrix.json`
and `sql-keyboard-probe.json`. Original approved-candidate screenshots remain
under `.tmp/refined-final-review/`.

The user reviewed and approved the full public-site rollout on 2026-10-15.
The feature PR targets `development`; its remote CI results belong to the PR.
Target-branch merge and production promotion remain separate actions.

During delivery, the complete staged whitespace check also covered previously
untracked vendored resources. Trailing whitespace was normalized in the Pro Max
Python source, performance cheatsheet and research note. Upstream hashes and
original skill entrypoints remain preserved; local hashes record the two
resource adaptations. The Python executable AST and cleaned docstrings are
equivalent, and 26 targeted upstream tests passed. Application source is
unchanged from the validation above; guidance surfaces and the complete staged
whitespace check were validated again before commit.
