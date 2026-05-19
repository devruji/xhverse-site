---
name: agent-surface-maintenance
description: >-
  Maintain xhverse repo agent surfaces: AGENTS.md, CLAUDE.md, .cursor/rules,
  .agents/skills, .codex/agents, .codex/config.toml, repo-scoped MCP choices,
  and memory update notes. Use when the user asks to uplift skills, rules,
  memory, agents, Codex config, MCPs, or instruction surfaces.
---

# Agent Surface Maintenance

Keep future sessions aligned without turning runtime config into documentation.

## Workflow

1. Confirm the branch is not `development` or `main`; create a branch from `development` before edits.
2. Read `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.agents/skills/*/SKILL.md`, `.codex/config.toml`, and the relevant memory entries before changing rules.
3. Keep guidance in the right surface:
   - `AGENTS.md`: compact repo contract.
   - `CLAUDE.md`: full onboarding and lessons learned.
   - `.cursor/rules/*.mdc`: editor rules with frontmatter.
   - `.agents/skills/*/SKILL.md`: task workflows with valid YAML frontmatter.
   - `.codex/config.toml`: runtime config only, including repo-scoped MCP/plugin declarations.
   - Memory: add a small note under the Codex memory extension path only when the user explicitly asks to update memory.
4. For MCP changes, prefer the smallest repo-scoped set that directly supports xhverse work. Do not add Notion here. Do not store bearer tokens in git.
5. Validate changed Markdown, TOML, and skill YAML before sign-off. Run app tests only when application behavior changes.

## MCP Policy

- Cloudflare belongs in this repo because xhverse runs on Cloudflare Pages and uses Access, Turnstile, security headers, and deployment checks.
- Supabase belongs only when the task touches backend data, migrations, RLS, storage, auth, or admin data flows.
- Browser and GitHub capabilities can remain general tooling; do not duplicate them in repo MCP config unless a concrete workflow needs it.
- Avoid speculative MCP installs. A broken or slow MCP should be removed rather than carried as session startup tax.
