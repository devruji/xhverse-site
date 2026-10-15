---
name: ux-ui-auditor
description: Full UX/UI audit and implementation for the xhverse.co portfolio site. Use this skill whenever the user mentions UX, UI, design, layout, spacing, typography, visual hierarchy, accessibility, mobile experience, page flow, user experience, interaction design, animations, hover states, responsive design, or wants to improve how pages look or feel. Also trigger when the user says things like "this looks off", "the spacing is wrong", "make it look better", "fix the mobile view", "the form feels clunky", or asks about contrast, readability, or visual polish. This skill both audits AND produces ready-to-apply code fixes.
---

# UX/UI Expert Auditor — xhverse.co

Full-stack UX/UI audit and implementation for xhverse.co. This skill operates in two modes:
- **Audit mode**: Systematic evaluation producing prioritized findings
- **Fix mode**: Direct code implementation following the design system

## Design System Reference

Read root [DESIGN.md](../../../DESIGN.md) first and respect its Draft/approved
status. Refined Publication is approved for both themes as of 2026-10-15. The
[task brief](../../../docs/design/redesign-brief.md) records scope and the current
experiment. Use only repo-local design skills: Taste for art-direction methods,
Pro Max for focused references, and this auditor for measured usability.

Public tokens, type helpers, spacing, and layout implementation live in
`src/styles/public.css` through `BaseLayout`; `global.css` retains shared admin
foundations. Read actual values there rather than maintaining duplicate tables.
Approved visual decisions belong in `DESIGN.md`, not an auditor preset.

- Dark-first and complete light themes; self-hosted Geist with system fallbacks.
- Measure normal text contrast at 4.5:1 and large text at 3:1 in both themes.
- Preserve semantic status/chart colors and never rely on color alone.
- Assess hierarchy, reading measure, density, and natural wrapping against
  actual content and the selected direction, not a mandatory card or grid genre.
- Verify font loading and layout stability in the browser.
- Distinguish native links/buttons from static information; provide visible
  focus and clear interaction states without implying false interactivity.
- Check 320px reflow, 200% text enlargement, and reduced-motion behavior.
- Passing automated checks does not establish visual approval or usability-study
  results; retain raw Taste findings and explain project exceptions separately.

## Audit Framework

Evaluate in this order. Each category has specific signals to check against the design system above.

### 1. Visual Hierarchy & Layout

**What to check:**
- Does the page have a clear visual flow? (Primary → secondary → tertiary content)
- Is the page purpose prominent and its h1 easy to identify?
- Do sections have adequate breathing room (section padding, margins)?
- Is the grid appropriate for the content density?
- Are repeated elements aligned consistently where their content and composition require it?
- Does the hero section communicate the site's purpose within 3 seconds?

**Common issues in this project:**
- First viewport blank space on mobile (Hero grid collapse)
- Inconsistent card padding between pages
- Section headers misaligned with content below
- Visual monotony: assess whether repeated section rhythm obscures the reading path. Evaluate section variation against actual content and the selected direction rather than imposing a full-bleed block, asymmetric grid, or pull quote on every page.

### 2. Typography & Readability

**What to check:**
- Evaluate prose line length with the actual font and viewport against the selected hierarchy; `DESIGN.md` owns the approved reading measure
- Heading hierarchy is logical (h1 > h2 > h3, no skipping)
- Normal text meets 4.5:1 against its actual background in both themes; large text and meaningful non-text controls use the applicable 3:1 threshold
- Muted text (`--muted`) still meets 4.5:1 against the background
- Font sizes scale appropriately on mobile (no text that's too small to read)
- Blog post body is comfortable to read (line-height, paragraph spacing)

Measure actual token pairs from `src/styles/public.css`, including semantic status colors, composed backgrounds, and focused/hovered controls. Do not reuse contrast calculations from an earlier palette.

### 3. Navigation & Information Architecture

**What to check:**
- Can users find every major section from any page?
- Is the current page indicated in navigation?
- Does the mobile navigation work without JavaScript?
- Is the footer useful (not just copyright)?
- Do breadcrumbs or contextual navigation exist where needed?
- Is the back-to-top journey reasonable on long pages?

### 4. Mobile Experience

**What to check:**
- Assess touch targets in CSS pixels using applicable web guidance and exceptions; native Apple HIG/Material dimensions are not blanket web requirements
- No horizontal scroll on any viewport 320px+
- Images don't overflow their containers
- Text is readable without zooming (minimum 16px effective body size)
- Forms are usable on mobile (input sizing, label positioning)
- Sticky header doesn't consume too much viewport on small screens

**Test viewports:**
- 375px (iPhone SE/mini)
- 390px (iPhone 14/15)
- 768px (iPad portrait)
- 1024px (iPad landscape / small laptop)

### 5. Interaction Design

**What to check:**
- Focus states are visible (keyboard navigation)
- Hover states provide feedback without being distracting
- Clickable cards are distinguishable from static cards before hover
- Static information cards do not react like controls
- Text links are recognizable without relying on color alone
- Loading states exist for async operations (maturity tool submission)
- Error states are clear and helpful
- Success states confirm completed actions
- Animations respect `prefers-reduced-motion`

### 6. Accessibility (WCAG 2.1 AA)

**What to check:**
- All images have meaningful `alt` text (not empty unless decorative)
- Form inputs have associated labels
- Color is not the only means of conveying information
- Skip-to-content link exists (or landmark regions are properly defined)
- ARIA attributes are used correctly (not overused)
- Page is navigable with keyboard alone
- Screen reader announces content in logical order

### 7. Perceived Performance

**What to check:**
- Above-the-fold content renders immediately (no layout shift)
- LCP image is eager-loaded with preload hint
- No unnecessary JavaScript blocking first paint
- Font loading doesn't cause flash of invisible text (FOIT)
- Skeleton states or placeholders for async content

### 8. Portfolio Intent

**What to check:**
- Primary paths to work, writing, and tools are easy to find; contact and career context remain reachable
- The value proposition is clear on first viewport
- Trust signals are present (real photo, credentials, links to profiles)
- The journey from "who is this person" to "how do I contact them" is short
- Articles offer relevant next reading or tool paths; advisory and contact remain secondary

## Output Format — Audit Mode

```markdown
# UX/UI Audit: [scope]

## Executive Summary
[2-3 sentences: overall UX health, biggest opportunity, key strength]

## Critical (Breaks usability)
- [ ] Issue — Impact — File:line — Fix effort [S/M/L]

## High Priority (Significantly hurts experience)
- [ ] Issue — Impact — File:line — Fix effort [S/M/L]

## Medium Priority (Noticeable friction)
- [ ] Issue — Impact — File:line — Fix effort [S/M/L]

## Low Priority (Polish)
- [ ] Issue — Impact — File:line — Fix effort [S/M/L]

## Strengths (Keep these)
- What's working well

## Quick Wins (< 30min each, high impact)
1. Fix description — file to change — what to change
2. ...
```

## Output Format — Fix Mode

When implementing fixes, follow these rules:
- Use Tailwind utilities where possible (project uses v4)
- Use public semantic custom properties in `src/styles/public.css`; protect shared admin tokens
- Follow `DESIGN.md` and its approval status; preserve dark-first and complete light themes through `html.light`
- Respect existing spacing scale (don't invent new arbitrary values)
- Test at 375px and 1280px minimum
- Select checks and reuse matching evidence through `docs/agents/validation.md`; targeted local typechecks/affected-page checks and full application PR CI remain required. Unchanged read-only review runs no automatic tests/builds.

Produce:
1. The specific file edits (with before/after)
2. A brief explanation of the UX reasoning
3. Viewport(s) affected

## Anti-Patterns to Flag

Evaluate these against the content, accessibility baseline, and selected direction:
- Unintended theme inversions or unreadable text in either theme
- Decorative effects, repeated cards, or surfaces that obscure hierarchy
- Unmotivated motion, scroll hijacking, or required content hidden by reveal animations
- Generic stock photography or illustrations
- Decorative accent proliferation; semantic status/chart colors may remain distinct
- Long centered reading blocks, clipped text, or forced line breaks that fail at zoom

## Key Files

| Concern | File |
|---------|------|
| Visual decisions and approval status | `DESIGN.md` |
| Public design tokens & styles | `src/styles/public.css` |
| Shared admin foundations | `src/styles/global.css` |
| Page shell & meta | `src/layouts/BaseLayout.astro` |
| Navigation | `src/components/Header.astro` |
| Footer | `src/components/Footer.astro` |
| Homepage sections | `src/pages/index.astro` |
| Hero pattern | `src/components/Hero.astro` |
| Interactive tool | `src/pages/tools/data-platform-maturity-checker.astro` |
| Blog layout | `src/pages/blog/[slug].astro` |
| Gallery layout | `src/pages/gallery.astro` |

## Bounded motion work

Read `DESIGN.md` and `docs/agents/motion-skills.md`. Use repo-local `animate`
for implementation; use `review-animations` for lifecycle critique and
`animation-performance` for measured rendering evidence. Preserve color feedback,
native semantics, immediate keyboard/reduced motion and interruption.
