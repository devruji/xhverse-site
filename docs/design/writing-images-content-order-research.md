# Writing images and homepage content order

Date: 14 October 2026. Status: **Research and implementation recommendation; visual acceptance remains pending.**

The user reports a cropped writing image in Refined Publication and asks for a better presentation, current writing/tool selection, and expert UX review. This report records the inspected starting behavior and primary-source constraints. It does not approve the palette, motion, or a site-wide rollout.

## Recommendation

Show the complete lead cover in a stable **16:9 landscape frame with `object-fit: contain`**, above its article copy. Keep the artwork stationary and link it to the article. This reserves the chosen frame before a lazy image decodes, preserves the known 16:9 covers, and fits other proportions with neutral space instead of cropping. Native proportional sizing is optional only when the genuine intrinsic ratio remains properly reserved before loading. The choice of composition is design judgment; `contain` preserves the image within its frame while `cover` fills the frame and can clip it. [CSS Images, object fitting](https://www.w3.org/TR/css-images-3/#the-object-fit), [CSS intrinsic aspect ratio](https://www.w3.org/TR/css-sizing-4/#aspect-ratio)

Implementation decision evidence, **reported by the coordinating agent rather than run by this researcher**: a deliberately slow-image experiment found that the proposed `aspect-ratio: auto` override reserved zero image height before lazy loading despite the 1200×675 HTML hints, producing a layout-shift value of 0.1293. The coordinator selected the stable 16:9 `contain` alternative and reported that known 16:9 covers retain their full artwork and a square fixture fits without cropping. This bounded experiment supports the current frame choice; it does not establish a general failure of native image sizing.

The user explicitly selected **newest writing; rotating tools**. Show at most three distinct published articles, with the newest leading. Rotate a separate pair of tool discovery links from the full canonical catalog once per new document; preserve the authored SCD and recovery examples with clear example labeling. The latest two tools remain the no-JavaScript fallback. New catalog entries join the pool after rebuild without a homepage slug-list edit. This fulfills rotating discovery, while the two featured example cards remain fixed; do not claim that their outputs rotate or invent examples for other tools.

## Verified starting behavior

- The cover is rendered with `width="1200" height="675"`, but Publication changes its CSS aspect ratio to **3:4** on desktop. Shared `object-fit: cover` fills that portrait box. At 1100px and below, a media rule changes the box to 16:9. This explains the desktop crop without any image animation. Sources: [Candidate](../../src/components/design-review/Candidate.astro), [candidate styles](../../src/components/design-review/candidates.css), selectors `.article-cover img`, `.candidate-publication .article-cover img`, and the 1100px media rule.
- `createReviewSnapshot()` sorts articles by date, then pins `abac-row-filters-column-masks-production-ownership` ahead of newer posts when that slug exists. Tool examples and two secondary links are explicitly listed. Source: [snapshot construction](../../src/data/design-review.ts). A new entry cannot replace those fixed tool selections automatically.
- `toolCatalog` already sorts `releasedAt` descending. Its metadata supplies title, description, category, slug, and publication date. Source: [tool catalog](../../src/data/tools.ts). Reusing this list avoids a second manually maintained selection list.
- Review pages resolve one build-time post collection and share its snapshot across candidates. The loader requests only published, nonfuture posts ordered by `published_at` descending; the row mapper stores a UTC calendar date. Stable date sorting preserves the resolver's order for same-day posts, so retain that order rather than replacing it with a slug tie-break. Sources: [review generation](../../src/design-review/page.astro), [loader](../../src/lib/blog/load-posts.ts), [date mapping](../../src/lib/blog/post-row.ts), [stable sort requirement](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort).

These are pre-change observations. Implementation may replace the identified selectors and selection logic while preserving this report as the reason for the change.

## Image options and trade-offs

| Approach | Benefit | Trade-off and recommendation |
| --- | --- | --- |
| Landscape frame, complete image | Complete original artwork; stable space before lazy loading | Selected: 16:9 `contain`; neutral space for other proportions |
| Natural image ratio | Complete image without added framing space | Optional when genuine dimensions reserve the ratio before loading; the tested `auto` override failed this condition |
| Portrait crop with focal position | Compact existing column | Moving `object-position` only chooses which area survives; it does not show the full composition. Keep only for intentionally art-directed portrait assets |
| Hover zoom or pan | Optional inspection effect | Zoom can crop further, pan hides part of the artwork until interaction, and touch has no persistent hover. No demonstrated reading need in this task; omit |
| Lightbox | Can inspect a detailed diagram | Introduces a second action, dialog focus handling, Escape/close behavior, and focus return. The homepage already links to an article; defer unless full-size inspection is a separate reader requirement |

The fitting behavior follows [CSS Images](https://www.w3.org/TR/css-images-3/#the-object-fit). Intentionally different crops can be supplied declaratively through `picture`; responsive resolutions use `srcset`/`sizes`, which solve download selection rather than layout cropping. [HTML image selection](https://html.spec.whatwg.org/multipage/images.html#images) A modal entails focus containment and keyboard close behavior described by the [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

Keep below-fold covers lazy-loaded with asynchronous decoding. Width/height attributes reserve space before download, but hard-coded dimensions must represent a known image ratio or a deliberately stable frame. `srcset` is useful only when real alternate resources exist; do not invent URLs. [HTML images](https://html.spec.whatwg.org/multipage/images.html#images) Astro can infer dimensions of authorized remote images, but that adds a build-time fetch and does not itself remove a CSS crop. This bounded pass need not change the image pipeline. [Astro image API](https://docs.astro.build/en/reference/modules/astro-assets/#infersize)

Treat an abstract cover as decorative only when it adds no information beyond the adjacent article text. Empty alt is appropriate then; a genuinely explanatory diagram needs a meaningful alternative. Avoid an extra unnamed keyboard stop for a duplicate decorative image link. [WAI decorative images](https://www.w3.org/WAI/tutorials/images/decorative/)

Animation does not remedy an unsuitable image frame. Keep the existing bounded color feedback and immediate focus outline; add no cover transform, moving frame, or content reveal. Nonessential interaction motion should be removable, and the operating-system preference can be detected with `prefers-reduced-motion`. [WCAG animation guidance, Level AAA](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [Media Queries specification](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)

## Newest versus random selection

Astro prerenders static routes at build time. Therefore a newly published article becomes visible after the existing publishing rebuild completes; opening a tab cannot refresh the baked content collection. Sorting requires no new server or browser API. [Astro rendering model](https://docs.astro.build/en/guides/on-demand-rendering/)

| Policy | Behavior | Fit for this checkpoint |
| --- | --- | --- |
| Newest-first at build | New publications lead after a successful rebuild; same results on reload | Selected for writing; newest tools also provide the no-JavaScript fallback |
| Random at build | One sample baked into HTML until the next build | Does not meet per-refresh variation |
| Random once per document in browser | Fresh draw when a new document runs the script | Selected for discovery links; retain static usable links and stable geometry. Never rotate while reading or move a focused link |

`Math.random()` supplies pseudorandom values, not a promise of a different sample on every refresh. [ECMAScript random definition](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-math.random) Draw two distinct entries without replacement, excluding the previous pair when enough entries remain. Read and store only their slugs in one review-specific `localStorage` key. This avoids the preceding pair on ordinary sequential reloads and tab opens when persistence succeeds and the catalog has at least four eligible entries. These are engineering recommendations, not requirements imposed by the specification.

`localStorage` spans same-origin windows, but WHATWG explicitly advises assuming no locking: concurrent tabs can read the same previous pair before either writes. The getter may throw `SecurityError` when persistence is blocked; a write can throw `QuotaExceededError`. Therefore cross-tab nonrepetition is best effort, not an absolute guarantee. Ignore malformed/unknown stored slugs, keep drawing usable distinct links if persistence fails, and catch only the optional storage/parse operations. No script means the newest two static links remain. [HTML Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html#the-localstorage-attribute)

Place the small inline classic script immediately after the discovery markup. Its parser execution can update the existing anchors before later markup is parsed; avoid delayed hydration, timers, storage-event listeners, or an automatic carousel. Parser blocking is not a proof that a fallback was never painted, so check actual first-render geometry and layout shift. [HTML script processing](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element) A stable pair of link slots, retained focus semantics, and no later mutation reduce disruption. No credentials, backend, admin behavior, or dependencies are needed for this client-side discovery selection.

## Acceptance evidence to collect

1. Inspect full-page desktop/mobile dark/light screenshots. The lead artwork must remain complete at 1440px, 390px, 320px, and 200% text enlargement, with no overflow or distortion. Check a non-16:9 cover as well as the current source, and delay image loading to confirm the frame reserves its height before decode.
2. Confirm actual image loading, link destinations, immediate visibility, keyboard order, and no-JavaScript content. Verify the cover stays stationary in normal and reduced-motion settings.
3. Feed a new latest article into snapshot tests: it leads, duplicates are removed, the limit is three, and an empty collection stays truthful. Check same-day source order and unchanged input arrays.
4. Verify rotating links derive from the full catalog, stay distinct, and do not repeat the last pair on sequential reload/new-tab tests with storage available. Test blocked/malformed storage and no-JavaScript fallback; document concurrent-tab limits. New metadata should enter the pool after rebuild without editing a homepage slug list. Keep fixed example output attributed to its actual tool and confirm no mutation after the initial draw.
5. Keep warm Publication and other comparison candidates available. Confirm review-only styling and routes are absent from ordinary builds; preserve backend/admin behavior and all coverage gates.
6. Collect product, UX, and engineering verdicts against the final screenshots and test evidence. User browser acceptance remains the final visual gate before push or promotion.

Research validation: primary sources and local implementation inspected; this document changes no runtime code. Application checks are owned by the coordinated implementation checkpoint and are not claimed by this research report.
