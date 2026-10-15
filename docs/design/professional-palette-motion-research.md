# Professional palette and motion review

Date: 14 October 2026. Status: **Research and team recommendation; palette and motion remain proposed.**

The user prefers Technical publication's composition and requests a more professional, minimal color tone and animation policy. This review keeps identity, experience, tools, writing, and contact in that order. It does not approve the current warm palette or extend the design across the site.

## Recommendation

Keep the Publication composition, replace brown/amber with neutral graphite and an understated blue, and reserve color for actionable elements. Use a quiet 110ms color/border response on pointer interactions; keep reading content stationary and available immediately.

Blue is our aesthetic recommendation, not a demonstrated cause of trust or professionalism. UX initially proposed muted green/teal and supports graphite/blue as the primary candidate after co-review. The team agrees on neutral surfaces, functional color roles, a quieter contact section, and restrained feedback. Exact hue and timing require rendered user review.

## Current implementation evidence

- Publication body: brown-black `#211f1c`, amber `#e8c293`; light background `#f5f0e7`, brown accent `#805426`. The shell has separate, slightly different values. Sources: [candidate tokens](../../src/components/design-review/candidates.css#L109), [light tokens](../../src/components/design-review/candidates.css#L170), [shell tokens](../../src/components/design-review/ReviewLayout.astro#L39).
- Accent repeats on eyebrows, example labels, email labels, primary action, and the 4px contact rule. Sources: [eyebrows](../../src/components/design-review/candidates.css#L28), [example labels](../../src/components/design-review/candidates.css#L62), [email label](../../src/components/design-review/candidates.css#L83), [contact rule](../../src/components/design-review/candidates.css#L129).
- The candidate has **no keyframes or entrance/reveal transitions**. Normal hover changes are immediate; the primary button uses a brightness filter. Smooth anchor scrolling is enabled, with a reduced-motion override. Sources: [hover](../../src/components/design-review/candidates.css#L25), [button filter](../../src/components/design-review/candidates.css#L39), [scroll](../../src/components/design-review/ReviewLayout.astro#L37), [reduced motion](../../src/components/design-review/ReviewLayout.astro#L95).
- Public-site animation declarations do not establish behavior in this isolated review shell. This review makes no claim that the candidate currently has parallax, page transitions, or reveal effects.

The warmth and repeated accent make the present candidate feel more like a print journal than enterprise-platform practice to the reviewers. That is design judgment, not a measured user-research result.

## What the primary sources support

**Accessibility requirements.** WCAG 2.2 AA requires at least 4.5:1 for ordinary text and 3:1 for qualifying large text. Meaningful component boundaries/states and graphical cues need 3:1 where required for recognition; decorative dividers do not all need that ratio. Color cannot be the only way to convey meaning. See [WCAG 2.2](https://www.w3.org/TR/WCAG22/#contrast-minimum), [non-text contrast explanation](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), and [use of color explanation](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

WCAG 2.3.3 is **AAA**, not AA: interaction-triggered movement must be disableable unless essential. Its definition distinguishes movement/size changes from color or opacity changes alone. We still suppress optional transitions under reduced motion as a project choice. See [animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

**Design-system guidance.** Carbon uses dominant neutral grays, role-based tokens, distinct light/dark layering, and purposeful action color. GOV.UK separates text, link, focus, border, and feedback roles. Borrow that separation; do not import either system's brand palette or component library. See [Carbon color](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview) and [GOV.UK colour](https://design-system.service.gov.uk/styles/colour/).

Carbon distinguishes unobtrusive task feedback from expressive motion; its fast fade token is 110ms. That supports a small feedback budget, not a universal optimal duration. See [Carbon motion](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview).

**First-party portfolio references.** Brittany Chiang exposes name, role, experience, projects, and résumé; Simon Späti connects technical writing and related knowledge; Josh Comeau provides article descriptions and category discovery. Borrow inspectable career context and clear article paths. Their content establishes neither an xhverse palette nor a motion requirement. Sources: [Brittany Chiang](https://brittanychiang.com/), [Simon Späti](https://www.ssp.sh/), [Josh Comeau](https://www.joshwcomeau.com/). These observations concern source content; external-site motion was not browser-tested.

## Three viable palette approaches

| Approach | Rationale and trade-off |
| --- | --- |
| **A — Graphite and quiet blue: recommended** | Removes the warm cast while retaining a small colored action cue. Technical identity comes from real work and typography. Blue can look generic if spread over headings, borders, and large panels. |
| **B — Neutral monochrome** | Strongest reduction in hue. Leaves portrait and article images as the main color. Provides fewer color cues, so underline, focus, hierarchy, and action styling must do the work; discoverability has not been user-tested. |
| **C — Slate and muted teal** | Keeps a subtle connection to existing technical artifacts without neon. Retains the alternative initially proposed by UX. Avoid broad teal fills or it will repeat the Studio/product tone. |

These are xhverse proposals, not colors prescribed by the sources.

| Role | A dark | A light | B dark | B light | C dark | C light |
| --- | --- | --- | --- | --- | --- | --- |
| Page | #17191c | #f8f9fb | #191919 | #fafafa | #181c1f | #f6f8f8 |
| Example surface | #202328 | #ffffff | #242424 | #ffffff | #22282c | #ffffff |
| Primary text | #f1f2f4 | #20242b | #f2f2f2 | #202020 | #eef2f3 | #233035 |
| Secondary text | #afb4bd | #555e6c | #b5b5b5 | #595959 | #abb8bf | #55656c |
| Decorative rule | #343942 | #d8dde5 | #3d3d3d | #dddddd | #38434a | #d5dfe1 |
| Essential control border | #737c8a | #7a8493 | #818181 | #808080 | #75848d | #75868c |
| Link / focus / primary fill | #a8bff2 | #34568e | #d6d6d6 | #333333 | #a0ccc8 | #386661 |
| Link / primary hover | #c4d2f8 | #274271 | #ffffff | #111111 | #c0e0dd | #294e4a |
| Text on primary fill | #172544 | #ffffff | #202020 | #ffffff | #19312f | #ffffff |

Implementation roles: neutral labels, structural rules, navigation, artifact titles, and footer at rest. Accent appears on the compact primary action, small prose links, hover, and focus; making every linked title blue would recreate pervasive color. Neutral title links retain clear underline/arrow/read-action cues. Use a 1px neutral contact divider and make the email action the focal point. Keep real portrait/article colors unchanged.

Decorative rules must not double as essential input outlines. Use the stronger control-border token for recognizable controls. Underline links in prose and maintain a persistent non-color cue for selected/error states. Feedback colors for individual tools are outside this palette review.

## Contrast verification

Computed in JavaScript using sRGB linearization and `(Llighter + .05) / (Ldarker + .05)`, with channel breakpoint `.04045` and luminance weights `.2126/.7152/.0722`. Source: [W3C relative luminance and contrast definitions](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html#dfn-relative-luminance).

Text, secondary, link/focus, hover, and control columns show the **lower** contrast against page and example-surface backgrounds; button columns measure its label against normal/hover fill. Ratios displayed to two decimals; pass decisions use unrounded values.

| Approach / theme | Text | Secondary | Link / focus | Hover | Button | Hover button | Control border |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A dark | 14.07 | 7.57 | 8.56 | 10.45 | 8.23 | 10.05 | 3.74 |
| A light | 14.78 | 6.22 | 6.95 | 9.47 | 7.32 | 9.98 | 3.59 |
| B dark | 13.87 | 7.57 | 10.68 | 15.52 | 11.21 | 16.29 | 3.98 |
| B light | 15.61 | 6.71 | 12.10 | 18.09 | 12.63 | 18.88 | 3.78 |
| C dark | 13.23 | 7.34 | 8.50 | 10.62 | 7.86 | 9.82 | 3.86 |
| C light | 12.75 | 5.69 | 6.08 | 8.63 | 6.48 | 9.20 | 3.55 |

Every proposed text pair exceeds 4.5:1; essential control borders exceed 3:1. Focus uses the accent with a visible offset so it meets a page/surface background rather than a matching button fill. Decorative rules are intentionally below 3:1 and cannot convey essential state. This verifies proposed solid-color pairs, not rendered-page conformance, translucent overlays, actual focus geometry, or image-backed text.

## Restrained motion policy

| Moment | Proposed behavior | Purpose |
| --- | --- | --- |
| Initial page, portrait, sections, article covers | Immediately visible; no stagger, scroll reveal, zoom, lift, parallax, or ambient loop | Preserve the reading sequence and stable composition |
| Link/button pointer feedback | 110ms ease-out color/background/border transition with explicit hover tokens | Confirm interactivity without moving content |
| Keyboard focus | Immediate 3px outline with visible offset; never animate or suppress it | Track navigation clearly |
| Theme choice | Retain current persistence/anti-FOUC; no intentional page crossfade or main-surface animation. Local control colors may use the same 110ms transition when theme tokens change | Make the chosen mode available directly without additional JavaScript suppression |
| Section anchors | Native links; instant scroll by default | Minimal baseline; smooth scroll is optional only if separately selected |
| Later menus/modals/results | Native operation and immediate state first; consider a short opacity response only where useful | Clarify a user-triggered state, preserve focus and content |
| Reduced motion | Optional transitions/animations disabled; anchors instant; all states still visible | Respect the preference without removing feedback |

The existing homepage needs no new animation library, observers, canvas effects, view-transition work, or JavaScript motion machinery. A scoped CSS property list is sufficient: `color`, `background-color`, `border-color`, and `text-decoration-color`; avoid `transition: all`. Replace the current brightness filter with a checked hover token.

This policy governs the homepage and discovery shell. Preserve meaningful user-controlled teaching animations such as Spark Explained, loading/error/status feedback, and native form behavior. Blue does not replace success/error/chart semantics. Reduced-motion treatment in educational tools must provide equivalent static information or controls; do not apply a blanket site-wide animation ban.

Small color transitions may repaint; this is an intentional bounded trade-off, not a claim that they run entirely on the compositor. Browser-vendor guidance advises evaluating layout/paint cost and avoiding premature `will-change` use. See [web.dev animation guide](https://web.dev/articles/animations-guide). CSS supports explicit transition properties and durations: [CSS Transitions specification](https://www.w3.org/TR/css-transitions-1/#transition-shorthand-property).

## Team co-review

| Lens | Concrete finding | Resolution or open choice |
| --- | --- | --- |
| UX | Existing Publication dark/light, 1440px/390px screenshots show warm casts throughout and accent repeated across labels, examples, and the heavy contact rule | Neutralize those roles; reduce contact rule to 1px. Initially favored green/teal; supports graphite/blue as the primary candidate with neutral navigation/artifact titles/footer |
| Product | Current print-journal tone is less aligned with the desired enterprise-practitioner positioning; tool samples must explain real output | Keep identity first, useful examples, and one email action. No animated fake activity or decorative severity badges |
| Technical writing | “Enterprise platforms. Everyday practice.” and “Thinking in public.” are less explicit than the actual sections | Consider direct “Experience” and “Writing” headings in a bounded later copy pass; preserve factual claims and article bodies |
| Engineering | Two token families can diverge; brightness filters produce uncontrolled state colors; review shell is isolated from public/admin | One scoped role definition mapped to shell and candidate variables; native CSS states; preserve admin isolation and existing theme behavior |

Agreement is on behavior and color roles. Hue and exact duration remain discretionary. Screenshot evidence referenced by UX/Product: `.tmp/design-review/publication-{1440,390}-{dark,light}.png`, described in [homepage comparison](homepage-comparison.md).

## Acceptance for a future visual pass

1. Render the selected approach at 1440px and 390px in both themes; compare with preserved warm Publication. Identity, title, focus, and next action remain clear in the first viewport.
2. Inspect 320px reflow, 200% text enlargement, keyboard focus, touch actions, theme persistence, image loading, and no-JavaScript navigation.
3. Measure actual rendered text and essential control contrast in normal/hover/focus/selected states. Keep prose links recognizable without hue; test any interpolated colors or overlays added by implementation.
4. In the homepage/discovery shell, reduced motion disables optional transitions, smooth scroll, and decorative movement; ordinary mode has no content reveal or movement. Essential content never waits for animation. Preserve meaningful tool instruction and equivalent reduced-motion information.
5. Verify shared shell/body roles, local prototype isolation with the flag enabled/disabled, and unchanged tool/CV/navigation behavior. Preserve routes, hooks, scoring, article authority, backend/admin contracts, and existing dependencies.
6. User reviews the rendered candidate before palette/motion become approved in `DESIGN.md`. Later application changes follow the repository validation pipeline.

Scope of this checkpoint: research, source inspection, token calculation, and team review. No application code, runtime behavior, dependency, or production state changed. App runtime checks were not rerun for this research document.
