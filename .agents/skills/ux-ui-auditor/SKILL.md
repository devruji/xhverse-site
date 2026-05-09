---
name: ux-ui-auditor
description: Full UX/UI audit and implementation for the xhverse.co portfolio site. Use this skill whenever the user mentions UX, UI, design, layout, spacing, typography, visual hierarchy, accessibility, mobile experience, page flow, user experience, interaction design, animations, hover states, responsive design, or wants to improve how pages look or feel. Also trigger when the user says things like "this looks off", "the spacing is wrong", "make it look better", "fix the mobile view", "the form feels clunky", or asks about contrast, readability, or visual polish. This skill both audits AND produces ready-to-apply code fixes.
---

# UX/UI Expert Auditor — xhverse.co

Full-stack UX/UI audit and implementation for xhverse.co. This skill operates in two modes:
- **Audit mode**: Systematic evaluation producing prioritized findings
- **Fix mode**: Direct code implementation following the design system

## Design System Reference

The site uses a dark, minimal, professional aesthetic. Any changes must respect these foundations:

### Colors
- Background: `--bg: #020617` (near-black navy)
- Accent: `--accent: #f97316` (orange, used sparingly for primary CTAs)
- Text: `--text: #e5e7eb` (light gray)
- Muted: `--muted: #9ca3af` (secondary text)
- Interactive: Emerald (`#10b981` → `#059669`) for success/interactive states
- Borders: `rgba(148, 163, 184, 0.3)` (subtle, never harsh)

### Typography
- System font stack (no web fonts — zero CLS from loading)
- Fluid scale: h1 `clamp(2.5rem, 4vw, 3.4rem)`, h2 `clamp(1.5rem, 2.3vw, 2rem)`
- Line-height: `1.7` for body text (generous for readability)
- Letter-spacing: `-0.03em` on large headings, `0.18em` on eyebrow text

### Spacing
- Section padding: `4.5rem 0` desktop, `3.25rem 0` mobile
- Container: `max-width: 1120px`, padding `0 1.5rem`
- Consistent scale: 0.5rem, 1rem, 1.5rem, 2.5rem, 3rem, 4.5rem

### Interactive States
- Hover transitions: `0.18s ease-out` (fast, subtle)
- Nav underline: width 0 → 100% animation
- Cards: border-color shift to emerald on hover
- Buttons: brightness filter on hover (not color swap)

### Layout Patterns
- Tailwind CSS v4 utilities + custom CSS in `global.css`
- Grid with `auto-fit` + `minmax()` for responsive card layouts
- Mobile-first: base styles are mobile, `md:` / `lg:` add complexity

## Audit Framework

Evaluate in this order. Each category has specific signals to check against the design system above.

### 1. Visual Hierarchy & Layout

**What to check:**
- Does the page have a clear visual flow? (Primary → secondary → tertiary content)
- Is the h1 the most prominent element?
- Do sections have adequate breathing room (section padding, margins)?
- Is the grid appropriate for the content density?
- Are cards/containers consistently sized and aligned?
- Does the hero section communicate the site's purpose within 3 seconds?

**Common issues in this project:**
- First viewport blank space on mobile (Hero grid collapse)
- Inconsistent card padding between pages
- Section headers misaligned with content below
- Visual monotony: identical section rhythm (border-t → eyebrow → heading → cards) repeated without variation breaks the scanning flow. Alternate patterns (full-bleed, asymmetric grids, pull quotes) at least once per page.

### 2. Typography & Readability

**What to check:**
- Max line length (should be 55-75 characters, ~58rem with current font)
- Heading hierarchy is logical (h1 > h2 > h3, no skipping)
- Contrast ratio: text on `#020617` background meets WCAG AA (4.5:1 minimum)
- Muted text (`--muted`) still meets 4.5:1 against the background
- Font sizes scale appropriately on mobile (no text that's too small to read)
- Blog post body is comfortable to read (line-height, paragraph spacing)

**Contrast math for this project:**
- `#e5e7eb` on `#020617` = 14.3:1 (excellent)
- `#9ca3af` on `#020617` = 7.2:1 (passes AA and AAA)
- `#f97316` on `#020617` = 5.8:1 (passes AA)

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
- Touch targets are minimum 44x44px (Apple HIG) / 48x48px (Material)
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

### 8. Conversion & Intent

**What to check:**
- Primary CTA (contact, CV download) is discoverable without scrolling
- The value proposition is clear on first viewport
- Trust signals are present (real photo, credentials, links to profiles)
- The journey from "who is this person" to "how do I contact them" is short
- Blog posts link back to relevant services/contact

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
- Fall back to `global.css` custom properties for design tokens
- Maintain the dark aesthetic — never introduce light backgrounds
- Respect existing spacing scale (don't invent new arbitrary values)
- Test at 375px and 1280px minimum
- Changes must pass `bun run typecheck`

Produce:
1. The specific file edits (with before/after)
2. A brief explanation of the UX reasoning
3. Viewport(s) affected

## Anti-Patterns to Flag

These specifically break the xhverse design language:
- Light mode elements or white backgrounds
- Rounded rectangles with heavy shadows (this isn't a SaaS dashboard)
- Gradients that aren't from the established palette
- Animation durations > 300ms (the site is deliberately fast/subtle)
- Generic stock photography or illustrations
- More than 2 accent colors on one page
- Centered text blocks longer than 3 lines

## Key Files

| Concern | File |
|---------|------|
| Design tokens & base styles | `src/styles/global.css` |
| Page shell & meta | `src/layouts/BaseLayout.astro` |
| Navigation | `src/components/Header.astro` |
| Footer | `src/components/Footer.astro` |
| Homepage sections | `src/pages/index.astro` |
| Hero pattern | `src/components/Hero.astro` |
| Interactive tool | `src/pages/tools/data-platform-maturity-checker.astro` |
| Blog layout | `src/pages/blog/[slug].astro` |
| Gallery layout | `src/pages/gallery.astro` |
