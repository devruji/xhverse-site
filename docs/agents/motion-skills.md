# Repo-local motion guidance

The five skills installed from
[emilkowalski/skills](https://github.com/emilkowalski/skills/tree/2d228630ba1446365f614a108cb8252f1feda202)
are methods and references. User decisions, `DESIGN.md`, accessibility, and
repository engineering rules govern implementation. They do not approve visual
changes or authorize publishing.

| Skill | Responsibility | Supporting resources |
| --- | --- | --- |
| `find-animation-opportunities` | Purpose/frequency gate; record rejected candidates | Archived opportunity workflow |
| `improve-animations` | Read-only bounded audit and implementation scopes | `AUDIT.md`, `PLAN-TEMPLATE.md` |
| `animate` | Native interaction implementation | `RECIPES.md` |
| `review-animations` | Trace and critique actual lifecycle | `STANDARDS.md` |
| `animation-performance` | Diagnose observed rendering problems | `performance-cheatsheet.md` |

Read active local entrypoints first. Original `SKILL.md` files remain unchanged
as `references/upstream-skill.md`; their resource links refer to the skill root.
`SOURCE.json` records the immutable commit, upstream paths, original SHA-256
hashes and local adaptations. Each copy includes the unchanged root MIT notice.
All upstream supporting files from the selected skill folders are retained.
The performance cheatsheet has trailing blank lines normalized for the
repository whitespace gate; its original and local hashes are recorded separately.
No other upstream skills, dependencies, global configuration or agents are
installed. They become discoverable by the coding agent on its next turn.

## Accepted scope — 15 October 2026

The user accepted the four-surface pilot and requested the same treatments in
ordinary public-site builds: primary/secondary and icon press feedback, native
mobile menu opening, CV dialog opening/closing, and Pipeline Recovery Planner
checkpoint/result entrances. Admin pages are excluded. Timings and immediate
keyboard/reduced-motion behavior remain as specified in `DESIGN.md`.
Only comparison routes require `DESIGN_REVIEW=1`. Ordinary-build verification
is tracked in [the rollout record](../design/motion-rollout-validation.md);
the 14 October pilot evidence covers its original inputs only. The user also
approved Refined Publication's palette and complete-page styling in both themes
on 15 October for public-page extension. Additional motion remains a separate
decision; neither approval authorizes push, PR, merge or production release.

## Project overrides

- Use static Astro and native CSS/WAAPI with existing lifecycle patterns.
  Framework snippets are illustrative; do not convert the site or install
  Motion, GSAP, Base UI, or other animation/component libraries.
- Preserve native disclosure, focus trapping, Escape, form validation, CV
  submission, journey scoring, and copy/reset behavior. Visibility and focus
  state must settle correctly before decoration. Read `DESIGN.md` for approval.
- The accepted motion is interaction-first, crisp and noticeable. Use
  `cubic-bezier(0.23, 1, 0.32, 1)` for movement, with the prescribed per-surface
  durations. Keyboard actions and reduced-motion sessions complete immediately;
  runtime preference changes cancel active motion and settle logical state.
- Preserve justified color/background/border transitions and immediate focus
  outlines. Upstream transform/opacity preferences do not ban all paint work.
  Report specific expensive properties and measured evidence before diagnosing
  a performance failure or recommending `will-change`.
- Retarget interruptible native WAAPI motion from current rendered state and
  cancel superseded callbacks. Upstream preferences for CSS transitions are
  not a blanket ban on WAAPI. Verify rapid actions and cancellation rather than
  treating a driver label as proof of correctness or GPU acceleration.
- Keep reading content, portraits, writing covers and static cards stationary.
  There are no quotas for reveal, stagger, bounce or decoration. Scroll changes
  required by existing journeys remain immediate; no score/progress count-ups.
- CPU-throttled desktop evidence is browser evidence, not verification on a
  physical phone. Record normal/slowed playback, trace scope, device/browser,
  and remaining limits. Do not infer compositor promotion from property names.
- Do not apply archived greeting-only responses, blanket frequency thresholds,
  library-routing instructions or automatic delegation/approval requirements.
  Audit and implementation follow the user's current bounded request.

## Implementation and QA integration

Frontend implementation reads `animate` and the matching recipe after the
bounded audit. QA reads `review-animations`, traces actual state transitions,
and uses `animation-performance` when collecting rendering evidence. Evidence
selection/reuse follows [validation.md](validation.md). Maintain 100% unit
coverage for motion helpers and browser checks for native no-JS navigation,
keyboard/reduced motion, runtime preference changes, interruption, route
revisits, focus, form/journey contracts, themes, reflow and build isolation.

Updates are manual: review the pinned upstream diff and these overrides, retain
original files/notices, verify source hashes, validate guidance surfaces, and
run checks appropriate to any implementation change. A passing audit is not
user browser approval.
