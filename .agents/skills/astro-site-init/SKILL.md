---
name: astro-site-init
description: Analyze an Astro (or any static/SSR) site codebase and generate a CLAUDE.md file with optional improvement recommendations. Use this whenever the user wants to initialize Claude Code documentation for a web project, asks to create or update a CLAUDE.md, says "init" or "analyze this project", or wants to understand an unfamiliar Astro/Next/static site codebase. Also trigger when a user says things like "document this repo for AI", "make this repo AI-ready", or "set up Claude Code for this project".
---

# Astro Site Init

Generate a tailored CLAUDE.md and actionable recommendations for any static site or SSR project. The goal is to make future Claude Code sessions immediately productive by capturing non-obvious architectural context.

## Analysis Process

Investigate these areas in order. Each produces a section in CLAUDE.md only if the project actually uses it.

### 1. Project Identity
- Read `package.json` for name, scripts, dependencies, engines
- Check for `.node-version`, `.nvmrc`, or `engines` field
- Identify the package manager: bun.lock → Bun, pnpm-lock.yaml → pnpm, yarn.lock → Yarn, package-lock.json → npm
- Identify the framework: astro.config.*, next.config.*, nuxt.config.*, vite.config.*

### 2. Commands
- Extract all scripts from `package.json`
- Determine the full verification command (if one exists that chains multiple checks)
- Note how to run a single test file
- Check for lint/format commands

### 3. Architecture
- **Framework config**: Read the framework config file for integrations, plugins, output mode
- **Styling**: Check for Tailwind (v3 config or v4 vite plugin), CSS modules, styled-components
- **Data layer**: Look in `src/data/`, `src/lib/`, `src/utils/`, `src/services/` for data patterns
- **External services**: Check `.env.example` or `.env.local` for service integrations (Supabase, Firebase, Stripe, etc.)
- **Routing**: File-based routing structure, dynamic routes, API routes
- **SEO/Meta**: How meta tags, sitemaps, canonical URLs, and OG images are handled
- **Content**: Content collections, MDX, markdown processing, CMS integration

### 4. Testing
- **Unit**: vitest.config.ts, jest.config.*, test location patterns, coverage thresholds
- **E2E**: playwright.config.ts, cypress.config.*, how the dev/preview server is started for tests
- **Type checking**: TypeScript config, `astro check`, `tsc --noEmit`

### 5. Deployment & CI
- Check `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`
- Identify deploy target: Cloudflare, Vercel, Netlify, AWS, etc.
- Branch strategy: protected branches, deploy branches

### 6. Existing AI/Agent Config
- Check for existing `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`
- Incorporate non-redundant rules from these into the output

## CLAUDE.md Template

Use this structure, omitting sections that don't apply:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
[One sentence: what it is, who it's for, where it deploys]

## Commands
[Code block with all useful scripts + how to run a single test]

## Architecture
[Bullet points covering framework, styling, data, testing — only what requires multi-file reading to understand]

## Branch & Release Flow
[Only if non-trivial — e.g., protected branches, deploy branches, tag conventions]

## Key Constraints
[Project-specific rules that aren't obvious from the code]

## Lessons Learned (Trial & Error)
[Empty section — gets populated over time as issues arise]
```

## Writing Rules

- Do not repeat what's obvious from file names or standard framework conventions
- Do not include generic development advice
- Do not list every component or route — those are discoverable
- Focus on the "why" and cross-cutting decisions that require reading multiple files
- Keep total length under 80 lines for small projects, under 150 for complex ones
- Use code blocks for commands, bullets for architecture

## Recommendations Output

After generating CLAUDE.md, produce a short "Recommendations" section (not written to a file, just presented to the user) covering:

1. **Missing test coverage**: Areas with logic but no tests
2. **SEO gaps**: Missing meta, weak titles, no sitemap, no robots.txt
3. **CI improvements**: Missing steps (type check, coverage, e2e)
4. **Security**: Missing CSP, exposed env vars, no `.env.example`
5. **DX improvements**: Missing format/lint scripts, no single verification command

Only flag items that are genuinely missing — don't suggest things the project already handles. Present as a prioritized list of 3-5 actionable items, not an exhaustive audit.

## Edge Cases

- If the project already has a CLAUDE.md, suggest improvements rather than overwriting
- If there's no test setup at all, note it but don't invent test commands
- If the deploy target isn't clear, ask the user rather than guessing
- If you find Cursor/Copilot rules, merge their unique content into CLAUDE.md's constraints section
