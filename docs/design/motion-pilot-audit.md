# Interaction motion pilot audit

Date: 2026-10-14. Worktree: `codex/portfolio-editorial-redesign`, base
`c0371bd`. This records the bounded pre-implementation audit and prescribed
user intent. Existing redesign edits are preserved. Approval remains pending.

| Surface and existing path | Observed baseline | Purpose and chosen treatment | Risk and checks |
| --- | --- | --- | --- |
| Actions in `public.css`, `ThemeToggle.astro`, CV and journey controls | Color/focus feedback; content stationary | Pointer press `.97`/160ms, release `1`/120ms; feedback | Retarget; release outside/cancel; keyboard/reduced motion; immediate outline |
| `Header.astro` native `<details>` | Immediate disclosure; links and Escape close | Pointer open opacity `0→1`, scale `.97→1`, y `-4→0`/200ms; orientation from top-right | Native no-JS behavior; immediate close; rapid toggle; route cleanup |
| `cv.astro` lifecycle with `CvRequestModal.astro` markup | Immediate centered modal; validation, Escape and focus trap | Pointer overlay fade + centered scale `.97→1`/220ms; reverse/140ms | Immediate focus return/inert close; guarded reopen; validation/submission; runtime preference settlement |
| `tools/[slug].astro` shared practitioner journey | Immediate checkpoint/result scroll, scores/progress update directly | Recovery only: checkpoint opacity `.85→1`, y `6→0`/180ms; successful result `.85→1`, y `8→0`/220ms | Scroll before motion; validation stays immediate; scores/copy/reset unchanged; other tools stay unchanged |

Movement curve: `cubic-bezier(0.23, 1, 0.32, 1)`. All chosen changes are
interaction feedback or state orientation. Keyboard actions and reduced-motion
sessions complete immediately. Runtime preference changes cancel visual work
and settle logical state. Repeated actions cancel/retarget existing motion.

Rejected candidates: homepage reading text, portraits, writing covers, static
cards, theme crossfades, scroll reveals, decorative staggers and score/progress
count-ups. These would move stable reading material without serving the pilot.
Existing educational visualizer motion is outside this audit.

Use one small native motion controller with per-element cancellation and
current-state retargeting; do not add a library or backend/schema contract.
`DESIGN_REVIEW=1` isolates the pilot; ordinary builds preserve existing behavior.
The comparison route must be noindex and absent from ordinary output/sitemaps.
The preserved port 4321 remains untouched.

Verification and reviewer verdicts are recorded in
[motion-pilot-validation.md](motion-pilot-validation.md). A technical pass does
not approve the visible design. Stop at local browser review.
