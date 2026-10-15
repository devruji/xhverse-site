# xhverse design baseline

Status: **APPROVED baseline — Refined Publication composition and graphite/blue
complete-page styling in both themes, accepted 15 October 2026. Public-page
extension is implemented and validated; the user reviewed and approved the
full site on 15 October 2026.**

This is the design baseline for xhverse. The user selected Technical publication
as the preferred composition on 14 October 2026 and requested a more professional,
minimal color and motion treatment. On 15 October 2026, the user accepted the
four-surface motion pilot and requested it in ordinary public-site builds.
The user subsequently approved the Refined Publication homepage and its
graphite/blue styling in both themes on 15 October 2026, authorizing extension
of that baseline to the public pages. Additional motion remains a separate decision.

## Purpose and audience

xhverse is Rujikorn Ngoensaard’s professional portfolio.

Primary audience: senior data engineers, architects, platform leads, and
technical evaluators.

The site should help visitors:

- Understand who Rujikorn is and what he works on.
- Inspect his thinking through published writing.
- Explore working tools and their limitations.
- Find career context or get in touch.

Identity and expertise lead the portfolio. Work, thinking, and tools substantiate
them. Advisory is secondary.

## Confirmed identity and content constraints

- Professional name: Rujikorn Ngoensaard.
- Supporting identities: XH, bossruji, xhverse.
- Role: Senior Data Engineer | Platform Architecture.
- Use existing profile, public CV, published articles, tools, and assets.
- Make platform mentions relevant to the work being described.
- Separate capability descriptions, public artifacts, and career claims.
- Do not present work themes as client case studies.
- Do not invent metrics, clients, testimonials, dates, credentials, or outcomes.
- Do not promise response times, availability, or referral results.
- Keep wording direct; headings should explain what follows.
- About may include a small text line: Cursor · Codex · Databricks Genie.
- Do not add a homepage AI inventory or AI logo grid.

## Confirmed implementation constraints

- Static Astro, Tailwind, and existing native JavaScript patterns.
- Use existing dependencies; additions require explicit authorization.
- Dark-first, with a complete and equally considered light theme.
- Keep self-hosted Geist unless the user changes that preference.
- Preserve routes, tool inputs, scoring, calculations, and result caveats.
- Preserve article bodies and factual publication metadata.
- Supabase published posts remain authoritative when configured.
- Preserve CV request review and email delivery.
- Preserve backend, authentication, admin, and security contracts.

## Accessibility baseline

- All actions must work with keyboard navigation and visible focus.
- Use semantic headings, native links, and native controls.
- Normal text contrast: at least 4.5:1; large text: at least 3:1.
- Essential content must remain readable without entrance animations.
- Essential navigation and content must be available without JavaScript.
- Preserve clear JavaScript requirements for interactive tools.
- Check reflow at 320 CSS pixels and readability at 200% zoom.
- Respect reduced-motion preferences.
- Provide meaningful image alternatives; decorative images use empty alt text.
- Verify both themes, including focus, hover, controls, and result states.

## Visual decision status

| Decision | Status |
| --- | --- |
| Distinctive visual idea for xhverse | Refined Publication approved 15 October 2026 |
| Homepage composition and focal point | Approved: prominent identity, portrait/introduction band, professional record, tools, writing and contact |
| Desktop and mobile hierarchy | Refined Publication reference approved in both themes |
| Type scale, weights, and line lengths | Approved reference; self-hosted Geist Sans/Mono |
| Palette, accent use, and color proportions | Graphite/blue approved in both themes; roles below |
| Spacing, borders, surfaces, and density | Refined Publication reference approved |
| Portrait and work-artifact presentation | Approved: stationary portrait, labeled examples, complete writing artwork |
| Section rhythm and navigation treatment | Approved reference; public-page adaptation requires verification |
| Interaction and motion choices | Four-surface pilot accepted 15 October 2026 for ordinary public-site builds; additional motion requires separate approval |

These approvals refer to the inspected Refined Publication reference. They do
not authorize unrelated layouts, additional motion or invented content.

## Current implementation and references

[Public CSS](src/styles/public.css) implements the public system. Align its
roles and page treatments to the approved reference below. Avoid duplicating
token tables across agent guidance.

Approved complete styling example: **Refined Publication, both themes**, at
`/design-review/publication-refined`. Its source is
[Candidate.astro](src/components/design-review/Candidate.astro) with
`direction="publication"` and `refined={true}`, plus
[refined.css](src/components/design-review/refined.css). Original Publication
remains a comparison reference. The bounded interaction motion below is also accepted.

## Refined Publication acceptance — 15 October 2026

The user explicitly approved the complete Refined Publication homepage in both
themes and authorized applying its baseline to the public pages. Preserve the
identity/name, portrait/introduction, experience record, tools, writing and
contact composition, with advisory secondary. Keep self-hosted Geist Sans for
reading/interface copy and Geist Mono for selected technical metadata and results.

| Role | Dark | Light |
| --- | --- | --- |
| Page | `#17191c` | `#f8f9fb` |
| Surface | `#202328` | `#ffffff` |
| Text | `#f1f2f4` | `#20242b` |
| Secondary text | `#afb4bd` | `#555e6c` |
| Divider | `#343942` | `#d8dde5` |
| Essential control border | `#737c8a` | `#7a8493` |
| Accent | `#a8bff2` | `#34568e` |
| Accent hover | `#c4d2f8` | `#274271` |
| Text on accent | `#172544` | `#ffffff` |

Neutral structure and reading content dominate. Accent belongs to actions;
links retain underline cues. Preserve justified 110ms color feedback and
immediate focus. Reading content, portraits, complete uncropped writing covers
and static cards stay stationary. Home writing shows the newest three distinct
articles from the resolved collection. Its two additional tool links rotate
from the remaining catalog; the authored SCD and recovery examples stay fixed
and visibly labeled as examples.

Extend the approved system to Home, writing discovery/articles, About,
Advisory, CV, Gallery, the tools index, individual tools and 404. Preserve
public routes and useful anchors, identity/SEO, published-post authority,
article bodies/metadata, domain engines, tool hooks and the CV workflow.
Admin appearance and behavior remain excluded. Comparison navigation stays
on review routes rather than ordinary pages.

[Public-page rollout evidence](docs/design/publication-rollout-validation.md)
records the implementation checks and final browser-review status. The prior
candidate and motion checks describe their recorded inputs and do not alone
verify the extended pages.
The user completed the full-site browser review and approved the rollout on
15 October 2026. Delivery proceeds through a feature PR into `development`;
target-branch merge and production promotion remain separate actions.
Approval authorizes this implementation scope, not push, PR, merge or production
promotion. Existing browser, CI, QA/security and release controls still apply.

Reference qualities to study:

- [Simon Späti](https://www.ssp.sh/): technical identity and content connections.
- [Josh Comeau](https://www.joshwcomeau.com/): readable editorial hierarchy.
- [Brittany Chiang](https://brittanychiang.com/): inspectable work and career context.

These are references, not templates or approval of their visual treatments.
See [research context](docs/design/taste-and-design-governance-research.md).

## Design and review process

1. Inventory real profile/CV facts, published articles, tools, and assets.
2. Pair significant claims with available evidence or label them as capabilities.
3. Produce 2–3 distinct full-homepage compositions for desktop and mobile.
4. Review identity, hierarchy, artifacts, reading paths, and both themes.
5. Obtain user visual selection before recording approved decisions here.
6. Implement and review Home locally first; provide the running preview URL.
7. Extend the accepted system to other public pages.

## Ownership of decisions and evidence

- `DESIGN.md`: visual decisions and their pending or approved status.
- [Task brief](docs/design/redesign-brief.md): scope, boundaries, and rollout.
- CSS/components: implementation of those decisions.
- [Validation record](docs/design/redesign-validation.md): checks, revision,
  environment, and limitations.
- [Repo-local skills](docs/agents/skills.md): methods and references, subordinate
  to user decisions and repository engineering rules.

A passing build or test suite does not constitute visual approval.
User browser review precedes push or deployment of visible changes; the
existing PR, QA/security, and release controls still apply.

## Approval and next checks

- [x] Select Technical publication as the composition to refine.
- [x] Review the complete Refined Publication homepage.
- [x] Approve hierarchy, palette, density and artifact treatment in both themes.
- [x] Record the selected reference and authorize public-page extension.
- [ ] Verify the extended public pages and record matching evidence.

## Homepage comparison — 14 October 2026

Historical checkpoint: the visual system was **Draft**. Four local candidates were compared at
`http://127.0.0.1:4322/design-review/compare`:

| Candidate | Direction | Selection |
| --- | --- | --- |
| `/design-review/publication-refined` | Selected Publication composition; graphite/blue, neutral structure, brief interaction feedback | Styling awaited sign-off at this checkpoint |
| `/design-review/dossier` | Graphite and blue; portrait identity rail with a structured professional record | Alternative |
| `/design-review/publication` | Large name, portrait band, editorial reading rhythm; warm palette to be refined | Composition selected |
| `/design-review/studio` | Deep ink and teal; introduction beside a genuine tool example | Alternative |

Each shares the same factual snapshot, destinations, and resolved article
collection. The original homepage on port 4321 remains available for comparison.
Dark/light desktop and mobile examples, checks, and limitations are recorded in
[the comparison checkpoint](docs/design/homepage-comparison.md).

The user selected Publication's composition after reviewing this checkpoint.
Its palette and motion were researched and co-reviewed in
[the professional palette and motion study](docs/design/professional-palette-motion-research.md).
Palette and refined page examples were awaiting approval at that checkpoint;
the 15 October acceptance above supersedes that status.

## Refined Publication checkpoint — 14 October 2026

**Historical checkpoint: local implementation validated; sign-off was pending.** Review
[Refined Publication](http://127.0.0.1:4322/design-review/publication-refined) beside
[Original Publication](http://127.0.0.1:4322/design-review/publication) through
[the comparison page](http://127.0.0.1:4322/design-review/compare).
The selected composition is preserved. This is the historical 14 October
checkpoint; the 15 October full-page and bounded motion acceptances supersede
its pending approval status.

The user requested the writing-image and content-selection refinements below.
Palette and motion were unapproved at this checkpoint.

The optional internal `refined` prop defaults to `false`. Both Publication
versions receive the same resolved content snapshot. Comparison leads with
Refined Publication and Original Publication; Dossier and Studio remain
secondary alternatives. All five review routes require `DESIGN_REVIEW=1`,
use a separate output directory, explicitly set `noindex, nofollow`, and stay
out of the sitemap. The ordinary homepage on port 4321 remains available.

[Refined review CSS](src/components/design-review/refined.css) defines the
graphite/blue roles once and maps them to the shell and candidate. Navigation,
linked titles, informational labels, and footer are neutral at rest. Primary
and inline actions use blue; links retain underline cues, and essential control
borders are stronger than structural dividers. Original image colors,
portrait proportions, self-hosted Geist, responsive composition, and identity
remain intact. Experience and Writing use direct headings. Contact has a
1px neutral divider and normal section-heading scale; email remains its clear
primary action.

SCD reporting amounts and the recovery score/status receive stronger type and
grouping. Supporting explanation and actions remain subordinate, with Example
and Illustrative assessment labels visible. Values and wording are unchanged;
there are no derived outputs, badges, or string-parsing logic.

Refined interactions use 110ms `ease-out` transitions only for color,
background-color, border-color, and text-decoration-color. Explicit hover
tokens replace brightness filtering. Focus keeps an immediate 3px outline
with offset; anchors scroll immediately. Reduced motion disables transitions.
Content is immediately visible, with no entrance, reveal, image zoom, moving
cards, or theme crossfade. This policy does not change educational tool motion.

### Review and evidence

The technical writer found no factual correction needed and confirmed the
bounded heading changes and example labels. UX and product reviewers inspected
four complete 1440px/390px dark/light screenshots and found no material issues.
Engineering/QA traced route injection, shared content, original presentation,
scoped styles, focus, motion, and build isolation. These reviews establish
readiness for user review, not visual approval.

Validated on branch `codex/portfolio-editorial-redesign`, base `c0371bd`, with
macOS 26.6.2 arm64, Node 22.23.3, Bun 1.3.10, Astro 7.3.8, Vitest 5.0.3,
and Playwright 1.64.0. Existing dependencies and lockfile are unchanged.
The before/after manifest includes tracked and relevant untracked application,
configuration, and test inputs, excluding this separately reviewed record.
Its SHA-256 fingerprint is
`4bb1edfec43460ae1f835c241fb74f9cd79478c35156a3d75c71bcb9e88c2acb`;
inputs were unchanged across the successful checks.

| Check | Result |
| --- | --- |
| `DESIGN_REVIEW=1 bun run check` with repository Node 22 | Exit 0: no type errors/warnings; 46 pages; 594 unit tests; 100% statements, branches, functions, lines; 69 delivery tests; 140 browser tests passed, 4 skipped |
| `env -u DESIGN_REVIEW bun run build --outDir .tmp/design-review-disabled` | Exit 0: 41 pages; no review routes or candidate style markers |
| Review indexing/isolation readback | Five explicit noindex pages; no review URLs in either sitemap output |
| Refined E2E, desktop/mobile projects | Shared content/destinations, distinct articles limited to three or truthful empty state, original presentation, theme persistence, keyboard focus, native anchors, images, no-JS content/navigation |
| Both themes at 1440px, 390px, 320px | No horizontal overflow; 200% root enlargement and doubling all computed text sizes checked, including fixed-pixel navigation; enlarged links remain reachable |
| Rendered normal/focus/hover contrast, including transition samples | Minimum text 6.22:1; control border 3.59:1; focus 6.95:1; no failures |
| Feedback and reduced motion | 110ms color-only `ease-out` computed; zero transition duration under reduced motion; content stays visible |
| Playwright MCP screenshots and HTTP readback | Four complete refined screenshots with decoded images; comparison/refined routes 200; port 4321 remains 200 with its original heading |
| `bun run validate:surfaces` | Exit 0: 171 guidance surfaces |
| `git diff --check` | Exit 0 |

Raw logs, before/after manifests, environment, isolation readback, and contrast
attachments are retained under `.tmp/publication-refined/`. Final screenshots:
`refined-{1440,390}-{dark,light}.png`. The first sandbox run could not bind
Playwright's preview port; the permitted local listener resolved that setup
failure. The initial light-theme checks exposed existing palette declarations
overriding the refined roles; scoped mapping precedence was corrected and all
affected checks rerun successfully.

The preview uses the local article fallback; live publication status was not
verified. Four configured-CV saved/duplicate tests require the separate
mock-service build and were skipped. No live submission/email, CMS refresh,
CI, push, deployment, or site-wide promotion was performed.

## Writing image and discovery refinement — 14 October 2026

**Historical checkpoint: implemented and validated locally; browser acceptance was pending.**
[Research and primary sources](docs/design/writing-images-content-order-research.md)
support showing complete artwork without image motion. Refined Publication
now places the featured cover above its copy in a stable 16:9 frame using
`object-fit: contain`. Landscape covers remain complete; other proportions
receive neutral letterboxing. Warm Publication retains its original styling.

A delayed-image experiment caught a loading regression in the first natural-ratio
attempt: the `aspect-ratio: auto` override reserved zero height and shifted
reading content. The final frame reserved 484.77px before and after decoding
at 1440px. The measured shift sum dropped from 0.12927 to zero in this local
experiment. This is bounded preview evidence, not a production performance claim.

The user selected **newest writing; rotating tools**. The shared snapshot now
shows the newest three distinct articles, without pinning ABAC ahead of newer
publications. Same-day entries retain the resolved collection order. The full
catalog feeds two rotating **Explore more tools** links in the refined candidate;
the two genuine worked examples remain fixed and are excluded from that pool.
New publications and catalog tools enter the selection after a successful
static rebuild. The local preview continues to use fallback articles.

Discovery draws once per document, without timers or later replacement.
It stores only the preceding two slugs in a review-specific browser-storage
key, avoiding them on sequential refreshes and new tabs when storage works.
Concurrent tabs or unavailable storage may repeat a selection. Storage failure
keeps usable links and reports a console warning. Without JavaScript, the
newest two eligible catalog links remain available.

UX and product reviewed four complete desktop/mobile screenshots in both
themes and found no material issues. Engineering/QA reviewed the loading fix,
newest-first selection, safe DOM construction, optional history, style
isolation, and matching validation inputs. **Team verdict: ready for user
browser review, with no outstanding material findings.** This does not approve
the palette or authorize rollout.

Node 22.23.3/Bun 1.3.10 and existing dependencies were retained. Final validation:

| Check | Result |
| --- | --- |
| `DESIGN_REVIEW=1 bun run check` | Exit 0: 46 pages; 596 unit tests; all four coverage metrics 100%; 69 delivery tests; 148 browser tests passed, 4 configured-CV service tests skipped |
| Image/browser regression evidence | Complete landscape and square-source fitting, pending-load reservation, no image motion, refresh/new-tab variation, blocked/malformed history, no-JS fallback, both themes, 320px reflow, 200% text enlargement |
| `env -u DESIGN_REVIEW bun run build --outDir .tmp/design-review-disabled` | Exit 0: 41 pages; no review routes, refined styles, or discovery script markers; no review sitemap entries |
| `bun run validate:surfaces`; `git diff --check` | Exit 0: 172 guidance surfaces; no whitespace errors |

Input scope includes tracked and relevant untracked sources/configuration/tests
and the research report; this separately reviewed design record is excluded.
Before/after inputs matched across the final check. Fingerprint:
`6dd3bff8e20cf145867ef784e2290d93df9b9f438f158067071038aa242033e1`.
Logs, manifests, the delayed-image experiment, and decoded screenshots are
in `.tmp/publication-refined-content/`; final screenshots are
`refined-{1440,390}-{dark,light}.png`, with matching `-writing.png` details.
No live CMS publication, CV service submission, push, or deployment was performed.

## Interaction-first motion — pilot 14 October, accepted 15 October 2026

**User accepted the pilot on 15 October 2026. The same four surfaces are enabled
in ordinary public-site builds and validated locally.**
Open the [ordinary-build preview](http://127.0.0.1:4325/). The
[rollout validation](docs/design/motion-rollout-validation.md) records matching
ordinary/review evidence, scope and remaining limits.
The [interaction comparison](http://127.0.0.1:4322/design-review/motion) and
[before/after recordings](http://127.0.0.1:4324/) document the original pilot.
The original baseline used port 4321. The accepted defaults are
interaction-first, crisp and noticeable, with Pipeline Recovery Planner as
the only journey entrance treatment.

| Surface | Pointer treatment |
| --- | --- |
| Primary/secondary actions and icon controls | Scale to 0.97 over 160ms; return to 1 over 120ms |
| Native mobile menu | Opacity 0 to 1, scale 0.97 to 1, y -4px to 0 over 200ms; origin top-right; close immediately |
| CV dialog | Overlay fade and centered panel scale 0.97 to 1 over 220ms; reverse over 140ms |
| Recovery checkpoint | Opacity 0.85 to 1, y 6px to 0 over 180ms, after immediate scroll |
| Successful recovery result | Opacity 0.85 to 1, y 8px to 0 over 220ms, after immediate scroll |

Movement uses `cubic-bezier(0.23, 1, 0.32, 1)`. Keyboard activation and
reduced-motion sessions settle immediately. Runtime preference changes cancel
active motion and settle logical state. Repeated actions retarget from current
rendered values. CV close returns focus immediately, disables the closing
surface, and guards completion against a reopened dialog.

Existing color feedback remains. Focus outlines are immediate. Homepage
reading text, portraits, writing covers, static cards, scores and progress
numbers remain stationary; existing educational visualizer behavior is outside
the accepted scope. Journey entrance motion applies only to Pipeline Recovery Planner.

The accepted interactions apply to ordinary public-site builds as well as
design-review builds; admin pages are excluded. Only the comparison routes
remain gated by `DESIGN_REVIEW=1`, noindex and absent from ordinary output and
both sitemaps. No backend/API/schema, runtime dependency, or animation library
is added. Native disclosure, CV validation/submission, Escape/focus handling,
journey calculation, copy and reset contracts remain.

Five pinned repo-local motion skills provide methods, recipes and standards;
[project motion guidance](docs/agents/motion-skills.md) records local overrides,
licenses, hashes and update policy. The
[bounded audit](docs/design/motion-pilot-audit.md) records scope and rejected
candidates; [validation and reviewer verdicts](docs/design/motion-pilot-validation.md)
record the historical pilot evidence and limitations. The
[ordinary-build rollout record](docs/design/motion-rollout-validation.md)
tracks verification for the 15 October enablement; the pilot fingerprint does
not validate changed inputs.

Motion acceptance covers these four surfaces only. The separate Refined
Publication acceptance above covers palette and complete-page styling.
Additional motion, push, PR, merge and production promotion remain outside
these authorizations.
