# Repo-local engineering skills

The following skills are installed only in this repository under `.agents/skills/`.

| Skill | Use when |
| --- | --- |
| [tdd](../../.agents/skills/tdd/SKILL.md) | Building or fixing behavior test-first, one failing test and implementation at a time. |
| [codebase-design](../../.agents/skills/codebase-design/SKILL.md) | Designing a module interface or deciding where behavior should be tested. |
| [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md) | Resolving domain terminology or documenting an architecture decision. |

## Repository integration

- Follow `AGENTS.md` and `CLAUDE.md`; these skills do not change branch, review, release, or implementation ownership rules.
- Keep the existing test tooling and 100% coverage requirement for `src/lib/**` and `src/data/**`. Test replacement during refactoring must preserve behavior coverage and pass the existing checks.
- For `tdd`, record and agree the public interfaces to test before writing tests. Reuse agreement already captured in the current task or approved plan.
- Upstream examples illustrate patterns; production code still follows this repo's TypeScript and mocking conventions.
- Upstream references to a “Skill tool” mean load the named skill using the current agent's supported mechanism. `codebase-design` is installed locally. For `tdd`'s review-stage reference to `code-review`, use the existing `scrutinize` workflow and repository review gates; `code-review` is not installed by this setup.
- Use the existing `grilling` skill for interviews. Pair it with `domain-modeling` only when the requested work includes recording terms or decisions; Q&A-only requests remain read-only.
- Domain documents use root `GLOSSARY.md` and `docs/adr/`, created lazily. See [domain.md](domain.md). This replaces the older setup template's `CONTEXT.md` convention.

## Source and updates

- Source: [mattpocock/skills](https://github.com/mattpocock/skills/tree/24fe0ef7737efae15c87225755e9f6f5965e4888).
- Pinned commit: `24fe0ef7737efae15c87225755e9f6f5965e4888`.
- Upstream paths: `skills/engineering/tdd`, `skills/engineering/codebase-design`, and `skills/engineering/domain-modeling`.
- Installed on 2026-10-05, including each skill's supporting Markdown and `agents/openai.yaml` metadata.
- The installed skill files are unchanged copies of that revision. Keep repo-specific integration guidance in this document.

Updates are manual: review the upstream diff and compatibility, then validate skill frontmatter, UI metadata, supporting references, and source hashes before replacing the pinned copies.
