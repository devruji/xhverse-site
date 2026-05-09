---
description: Code quality standards for all agents working in xhverse-site
globs: ["src/**/*.ts", "src/**/*.astro", "src/**/*.js"]
---

# Code Quality Standards

- No comments unless the WHY is non-obvious
- No `any` types — use explicit types on all public APIs
- No unnecessary abstractions — 3 similar lines > premature DRY
- Minimal diffs — don't refactor adjacent code
- No features beyond what the task requires
- Prefer editing existing files over creating new ones
- Run `bun run typecheck` before considering work done
