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
- For page/layout changes, prefer at least `bun run typecheck` and focused Playwright coverage.
- For release-ready changes, run `bun run check` when feasible.
- Report only checks that actually ran.

# Output
- concise implementation summary
- changed files
- risks / assumptions
- verification notes
