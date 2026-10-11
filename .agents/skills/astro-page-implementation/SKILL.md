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
4. Keep styling aligned with the current dark, minimal, professional data-architecture portfolio direction.
5. Preserve identity signals for `Rujikorn Ngoensaard`, `bossruji`, `XH`, and `xhverse` when touching profile, homepage, About, or SEO surfaces.
6. Avoid unrelated refactors and do not touch Supabase code unless the user explicitly asks.
7. Ensure mobile and desktop layout both remain coherent, with no excessive first-viewport blank space.
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
