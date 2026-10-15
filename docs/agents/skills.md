# Repo-local engineering and design skills

The following skills are installed only in this repository under `.agents/skills/`.

| Skill | Use when |
| --- | --- |
| [tdd](../../.agents/skills/tdd/SKILL.md) | Building or fixing behavior test-first, one failing test and implementation at a time. |
| [codebase-design](../../.agents/skills/codebase-design/SKILL.md) | Designing a module interface or deciding where behavior should be tested. |
| [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md) | Resolving domain terminology or documenting an architecture decision. |
| [design-taste-frontend](../../.agents/skills/design-taste-frontend/SKILL.md) | Public portfolio art-direction methods guided by root `DESIGN.md` and its approval status. |
| [ui-ux-pro-max](../../.agents/skills/ui-ux-pro-max/SKILL.md) | Focused local UX/accessibility and Astro reference searches. |
| [ux-ui-auditor](../../.agents/skills/ux-ui-auditor/SKILL.md) | Evidence-based usability, accessibility, and responsive review. |

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

## Design skill integration

Read root [DESIGN.md](../../DESIGN.md) first. Refined Publication is approved
for both themes as of 2026-10-15. The [task brief](../design/redesign-brief.md)
records scope and the current experiment. Taste supplies subject-specific
composition and critique methods; Pro Max supplies focused references; the UX
auditor checks usability and accessibility. Existing implementation, content,
SEO, security, and release guidance remains authoritative for its work.

Use only repository-local design skills for xhverse. Updates and supporting
state stay in this repository/worktree, never a global skill or CLI location.
Replacing Taste does not change application dependencies or approve a design.

| Package | Reviewed immutable source | Installed scope |
| --- | --- | --- |
| Core tasteskill v2 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill/tree/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill) | `.agents/skills/design-taste-frontend`; complete core scripts/data/assets/references, no variants |
| UI UX Pro Max, metadata version 2.15.0 | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/7246805992a42b7bba37d4cac83b01416f0c6c44/.claude/skills/ui-ux-pro-max) | `.agents/skills/ui-ux-pro-max`; complete data, scripts, tests, and references |
| Geist variable Sans/Mono | [vercel/geist-font](https://github.com/vercel/geist-font/tree/10dc7658f13c38a474cde201bb09a4617267545b/fonts) | `public/fonts/geist-sans.woff2`, `geist-mono.woff2`, OFL license and provenance |

Pro Max was installed on 2026-10-13; Taste was replaced on 2026-10-14 using the
skill-installer download helper with an explicit project destination. The
superseded dial-driven Taste copy is no longer active. Original skill
entrypoints are preserved at `references/upstream-skill.md`; short local entries
route to `DESIGN.md` and supporting resources. Each `SOURCE.json` records the
pin, original hashes, and local adaptations. Pro Max executable logic/data are
unchanged; whitespace-only source lines in `scripts/design_system.py` are
normalized for the repository whitespace gate, with equivalent executable AST and cleaned docstrings, plus
separate local/source hashes. Taste has one declared history-path adaptation. MIT notices remain
in each skill's `LICENSE`. Font provenance remains beside its existing assets.

Read the local `SKILL.md`, not the archived upstream entry, for commands and
active rules. Upstream README/archive installation commands are reference
material, not the project's execution instructions.

From the repository/worktree root, Taste's offline inventory command is:

```bash
node .agents/skills/design-taste-frontend/scripts/draw.mjs --list
```

Direction draws are optional authorized exploration, not approval. They use
`.taste-skill/` for ignored project state; history defaults there rather than
`~/.taste-skill`. An explicit `TASTE_SKILL_HISTORY` must resolve inside the
current project. `--out` changes output, not the history destination. Run from
the project root and keep output paths local. The package has no application
imports. Browser review uses the existing isolated Playwright MCP, or installed
Playwright library/CLI fallback. Upstream `inspect.mjs` uses custom CDP and is
retained as source reference; direct execution is outside the current repo
workflow. Playwright review is not a claim that the upstream inspector ran.
Do not install a browser, dependency, or global CLI as part of this integration.

Pro Max runs from the same root with
`python3 -B .agents/skills/ui-ux-pro-max/scripts/search.py`, using only Python 3's
standard library. Search output is advisory. Automatic persistence and `--force`
are not part of the redesign workflow.

### Known source limitations and overrides

- Current Taste supports Astro and starts with real subject material, claims
  paired with proof, alternative compositions, screenshot critique, and rendered
  checks. Use that process without treating sampled directions as approved.
- Its fixed imagery/motion quotas and house bans on eyebrows, monospace,
  dividers, shadows, or accent colors are aesthetic preferences. User decisions,
  `DESIGN.md`, accessibility, and meaningful tool states take precedence. Do not
  add decoration to satisfy quotas or invent evidence to satisfy copy rules.
- Keep raw upstream lint/inspection failures visible. Record deliberate project
  exceptions separately with reasons; an exception does not turn a failed
  upstream inspection into a pass. Automated scores are not visual sign-off or
  measured visitor research.
- The separate taste redesign variant advises fabricated brands/metrics and
  randomized dates. That variant is not installed; fabricated public claims are
  prohibited regardless of upstream suggestion.
- Pro Max Astro row 20 recommends removed `Astro.glob()` despite active/verified
  metadata. [Official Astro v6 migration guidance](https://docs.astro.build/en/guides/upgrade-to/v6/#removed-astroglob)
  confirms removal. Keep current repo data patterns; do not apply that row.
- Astro results include optional framework islands, content collections, server
  routes and adapters. These are not migration instructions for this static site
  or its Supabase-authoritative blog. Keep production canonicals on xhverse.co.
- Pro Max typography supplies Google Fonts CSS imports; use approved self-hosted
  Geist instead. Its native/mobile `pro-rules.md` is scoped to apps, not a web
  protocol. Web reflow and target sizing take applicable CSS-pixel guidance.
- `--design-system` ignores `--stack`; query Astro separately. A `--motion` dial
  attaches GSAP snippets even at low intensity; omit it for this native-feedback
  design. Dataset ranks, confidence, and verification metadata are not measured
  accessibility, performance, or user-research evidence.

Update only after reviewing the upstream diff and these local overrides. Keep
instructions/data/scripts/references on one pinned revision, retain licenses,
verify original hashes and resource/import paths, exercise offline searches, and
run `bun run validate:surfaces`. Do not replace approved design decisions merely
because upstream defaults or style rankings changed.

## Motion skill integration

Installed on 2026-10-14 using the existing skill-installer download helper with
an explicit worktree `.agents/skills` destination. Source:
[emilkowalski/skills](https://github.com/emilkowalski/skills/tree/2d228630ba1446365f614a108cb8252f1feda202),
pinned commit `2d228630ba1446365f614a108cb8252f1feda202`. Selected paths are
`skills/animate`, `skills/improve-animations`, `skills/find-animation-opportunities`,
`skills/review-animations`, and `skills/animation-performance`.

Read [motion guidance](motion-skills.md) for responsibilities, local overrides,
source hashes, supporting recipes/standards/audits, MIT notices, update policy
and implementation/QA integration. No global installation, runtime dependency
or new agent role is introduced.
