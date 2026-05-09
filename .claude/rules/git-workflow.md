---
description: Git workflow and branching rules
globs: ["**"]
---

# Git Workflow

- Always branch from `development` — never from `main`
- Feature branches: PR to `development`
- Releases: PR from `development` → `main`, then tag + GitHub Release
- Never commit directly to `main` or `development`
- Verify locally in browser before pushing
- Use `bun run check` for full pipeline validation
