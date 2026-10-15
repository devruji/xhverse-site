---
name: astro-page-implementation
description: Use this when implementing or refactoring Astro pages, layouts, or sections in this repository. Do not use for copy-only edits or SEO-only review.
---

# Goal
Implement Astro pages and sections in a way that matches repository patterns and keeps diffs production-grade.

# Workflow
1. Read the target page, layout, and shared components first.
2. Confirm the work is on a feature branch based on `development`, unless the user explicitly chose another base.
3. Reuse existing UI patterns before creating new abstractions.
4. Read root `DESIGN.md` and `docs/design/redesign-brief.md` for the approved Refined Publication baseline and public rollout scope. The user approved both themes on 2026-10-15; preserve that selection. For a new direction, inventory real material and compare complete desktop/mobile examples before selection. Public tokens/styles belong in `src/styles/public.css`; preserve shared admin foundations in `global.css`. Use only repo-local design skills without runtime dependencies. Validate the rollout locally and provide its preview for final browser review before push.
5. Preserve identity signals for `Rujikorn Ngoensaard`, `bossruji`, `XH`, and `xhverse` when touching profile, homepage, About, or SEO surfaces.
6. Avoid unrelated refactors and do not touch Supabase code unless the user explicitly asks.
7. Ensure mobile/desktop and both themes remain coherent. Preserve script selectors, form names, IDs, data attributes, output containers, keyboard semantics, and domain behavior when changing markup.
8. Summarize changed files, risks, and verification notes.

# Verification
- Select targeted local typechecks/affected-page Playwright checks through `docs/agents/validation.md`; broaden for shared changes and preserve full application PR CI.
- Reuse matching successful input/environment evidence; unchanged read-only review runs no automatic tests/builds. Visible changes require user review in both themes/mobile before push. Release QA/security gates must pass before merge.
- Report only checks that actually ran.

# Output
- concise implementation summary
- changed files
- risks / assumptions
- verification notes

## Bounded motion work

Read `DESIGN.md` and `docs/agents/motion-skills.md`. Use repo-local `animate`
for implementation; use `review-animations` for lifecycle critique and
`animation-performance` for measured rendering evidence. Preserve color feedback,
native semantics, immediate keyboard/reduced motion and interruption.
