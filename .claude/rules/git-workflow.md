---
description: Git workflow and branching rules
globs: ["**"]
---

# Git Workflow

- Always branch from `development` — never from `main`
- NEVER edit files while on `development` or `main` — create a feature/fix branch FIRST
- Before any edit: check `git branch --show-current` — if it's `development` or `main`, STOP and branch
- Feature branches: PR to `development`
- Releases: PR from `development` → `main`, then tag + GitHub Release
- Never commit directly to `main` or `development`
- Verify locally in browser before pushing
- Use `bun run check` for full pipeline validation
- Run QA + Security audit on every PR touching auth/RLS/edge functions/forms before merge
