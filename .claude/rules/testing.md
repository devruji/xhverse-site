---
description: Testing rules for all code in src/data/ and src/lib/
globs: ["src/data/**", "src/lib/**"]
---

# Testing Rules

- 100% coverage on lines, functions, branches, statements — non-negotiable
- Co-locate tests as `*.test.ts` next to source
- Mock external deps (Supabase) — never hit real services in tests
- Test error/fallback paths explicitly
- Run `bun run coverage` to verify — must pass before pushing
- Single test file: `bunx vitest run <path>`
