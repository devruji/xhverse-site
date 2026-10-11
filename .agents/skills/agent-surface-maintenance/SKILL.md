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
4. For MCP/plugin changes, prefer the smallest repo-scoped set that directly supports xhverse work. Keep unrelated global artifact, knowledge, and duplicated platform plugin packs disabled here so skill-description context budget stays focused. Do not add Notion here. Do not store bearer tokens in git.
5. For Codex + Cursor workflow, implementation-lane defaults, or engineering skill default changes, keep `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/codex-cursor-handoff.mdc`, `.cursor/rules/project.mdc`, `.agents/skills/xhverse-dev/SKILL.md`, and relevant `.codex/agents/*.toml` aligned.
6. For content-writing defaults, keep `technical_writer`, `blog-content-strategy`, `document-writer`, `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/blog-content.mdc`, `.cursor/rules/project.mdc`, and `.agents/skills/xhverse-dev/SKILL.md` aligned.
7. Use `docs/agents/validation.md`: validate changed Markdown/frontmatter/TOML and whitespace for guidance-only work; select relevant broader checks for delivery or application changes. Reuse matching successful evidence during unchanged review.

## MCP Policy

- Cloudflare belongs in this repo because xhverse runs on Cloudflare Pages and uses Access, Turnstile, security headers, and deployment checks.
- Supabase belongs only when the task touches backend data, migrations, RLS, storage, auth, or admin data flows.
- Playwright MCP is repo-scoped for browser automation and previews. Preserve its isolated-session configuration and the Playwright-only browser rule across agent surfaces; do not use Computer Use or native desktop automation. GitHub can remain general tooling.
- Avoid speculative MCP/plugin installs. A broken, slow, unused, or repo-irrelevant plugin should be disabled rather than carried as session startup tax.

## Codex + Cursor Handoff Policy

- Codex owns scope, planning, review, QA, security gates, and release evidence.
- Cursor implements only from bounded handoffs or explicit user direction.
- Use `.tmp/*-handoff.md` files to avoid copy-paste handoffs.
- Select verification commands through `docs/agents/validation.md`; guidance-only work validates changed surfaces and whitespace without runtime checks. Application PR CI retains the full pipeline.
- Codex does not operate Cursor through Computer Use for this repo; Codex prepares the handoff and the user runs Cursor Agent locally.
- Prefer Cursor worktree mode from the repo root: `cursor agent --workspace "$PWD" --worktree <task-name> --worktree-base development "Read .tmp/<task>-handoff.md and follow it exactly."`
- Only ask the user to run Cursor when Cursor is materially useful. Provide a short reason, exact terminal command, handoff path, expected result note path, and what to send back.
- Cursor writes `.tmp/<task>-cursor-result.md` with worktree path, changed files, command output, deviations, and unresolved risks so Codex can reconstruct the context.
- Cursor records checked revision or dirty fingerprint including relevant untracked inputs, environment/tool versions, commands and results. Codex reviews actual worktree and evidence once; unchanged successful evidence is reused. Repeat affected checks only after input/environment changes, missing evidence, unresolved failure or explicit request. See `docs/agents/validation.md`.
- After accepted Cursor-assisted implementation, remove temporary `.tmp/*-handoff.md` and `.tmp/*-cursor-result.md` files once evidence is captured in the final response or durable docs.
- Cursor multi-agent/multitask mode is allowed only for clearly separated file ownership.
- Use `debug-mantra` for debugging handoffs, `scrutinize` for review handoffs, and `post-mortem` only for validated post-fix writeups.
