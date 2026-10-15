# Taste Skill and xhverse design governance

Research date: 2026-10-14. Scope: primary-source review and one research note. No skill installation, application changes, `DESIGN.md` creation, or runtime checks.

Historical assessment: this note describes the state before the authorized
skill replacement and Draft baseline scaffold later on 2026-10-14. Current
package provenance and commands are in [skills.md](../agents/skills.md), and
approval status is in [DESIGN.md](../../DESIGN.md). Old local hashes and line
references below describe the pre-upgrade snapshot, not the replacement files.

## Verdict

**Use the current Taste workflow selectively alongside the existing redesign capabilities. Add a root `DESIGN.md` after selecting and reviewing the next direction.** Taste should help establish a visual idea and critique the rendered result; the existing UX auditor, Pro Max references, Astro implementation guidance, and engineering checks should keep their respective responsibilities. This is a recommendation, not an approved new visual direction.

The main opportunity is a stronger design decision process. Passing tests and reducing section height cannot establish that a portfolio feels distinctive or convincing. The upstream critique itself separates measured rules from visual judgment. [Screenshot critique](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/references/critique.md)

## What changed upstream

The public GitHub API reported main at **`a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9`**, committed **2026-10-13 21:50:32 UTC**. The reviewed core identifies itself as **tasteskill v2**. Its emphasis is subject-specific art direction, alternative compositions, deliberate imagery, browser inspection, and visual iteration. It supports Astro and other public-web stacks. [Revision API](https://api.github.com/repos/Leonxlnx/taste-skill/commits/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9), [immutable core](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/SKILL.md)

This is different from the older dial-driven version vendored in the feature worktree. Upstream now keeps that family separately as `design-taste-frontend-v2-experimental`; the new default has no variance/motion/density dials. Its README distinguishes the core's public-page art direction from `redesign-existing-projects`, an audit-and-improvement variant. [Upstream README](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/README.md)

Verified byte hashes:

| File | SHA-256 |
| --- | --- |
| Local archived core at `d237dd399d57524945c0c81327da5da19f7a468d` | `2136ed83016bfada39f7b8013b2aafd9f78fcbd9799110ed222a79c6419ba5fb` |
| Local adapted entrypoint | `d847a54cfdafc6f183ee45fbcc1c657af2973b11b11b434660b6540c2afb3f7e` |
| Current upstream core at the reviewed revision | `ee847084e58f5a81a46120912be9cd15f083570a6ca8f3d1a30372a720633043` |

The local hashes match [SOURCE.json](../../.agents/skills/design-taste-frontend/SOURCE.json), lines 3–16. The local entry applies 6/3/4 and selected old-reference sections, rather than the new process. [Local Taste entry](../../.agents/skills/design-taste-frontend/SKILL.md), lines 14–25

## Useful additions to the existing capability

| Responsibility | Recommended owner and method |
| --- | --- |
| Audience, purpose, factual material | PM and writer establish what each section communicates and the evidence it can show. The copy reference explicitly starts with reader intent and claims paired with proof. [Copy reference](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/references/copy.md) |
| Distinctive visual direction | Taste-supported UX/design lead proposes genuinely different compositions rooted in xhverse's actual material. Explore before freezing a brief; preserve the established palette and type when appropriate. [Core workflow](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/SKILL.md) |
| Rendered quality | Inspect screenshots for focal point, hierarchy, subject specificity, section variety, content substance, and mobile composition; fix the largest issues and compare again. These are design judgments, not usability-study results. [Critique rubric](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/references/critique.md) |
| Usability and accessibility | Keep the repo UX auditor and Pro Max for navigation, focus, contrast, responsive content, and interaction states. Pro Max's local entry already treats ranked output as advice rather than brand authority. [UX auditor](../../.agents/skills/ux-ui-auditor/SKILL.md), lines 54–80; [Pro Max entry](../../.agents/skills/ui-ux-pro-max/SKILL.md), lines 12–18 and 48–67 |
| Implementation and delivery | Keep Astro/native CSS, real domain engines, published-post authority, local fonts, both themes, and local browser sign-off. The local Taste overrides correctly protect these boundaries. [Local overrides](../../.agents/skills/design-taste-frontend/SKILL.md), lines 27–44; [delivery boundaries](redesign-brief.md), lines 122–156 |

## What to adapt rather than adopt wholesale

The new house rules prohibit decorative numbers, eyebrows, non-code monospace, hairline dividers, gradients, and static shadows. They also impose a minimum of four pictures; the inspector rejects sparse imagery and can flag orange/rust accents. These are encoded aesthetic policies, not general accessibility requirements. For xhverse, treat repetitive labels/rules as review questions, retain meaningful tool states and code conventions, and require each image to earn its place. [Inspector rules](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/scripts/lib/rules.mjs)

The inspector defaults to 1440/768/390px and explicitly fails desktop pages with fewer than eight counted moving elements. Mandatory motion counts conflict with the repo's restrained-motion requirement. Its automated contrast findings also cannot substitute for the existing accessibility gate. Use appropriate measurements and a documented exception policy; retain both-theme, reduced-motion, 320px, and enlarged-text checks. [Inspector source](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/scripts/inspect.mjs), [repo acceptance](redesign-brief.md), lines 140–156

Do not import the separate redesign variant wholesale. It has useful scan/diagnose/fix structure but also suggests invented brands, altered numeric examples, and randomized blog dates. Its advice about textures/gradients also differs from the new core's bans. xhverse must keep truthful evidence and original dates. [Redesign variant](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/redesign-skill/SKILL.md), [existing source caveats](../agents/skills.md), lines 63–84

The study used 21 **model** reviewers assessing curated gallery screenshots, not human jurors, actual Awwwards scores, or xhverse visitors. The methodology admits fashion bias, one-day captures, motion inference, and detector limitations. Its numerical patterns are useful inspiration, not proof that a particular design improves comprehension or hiring outcomes. [Study method and limits](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/references/research.md)

## Current repo findings and interpretation

Read-only file inventory confirmed that Taste, Pro Max, and the redesign brief exist in the isolated feature worktree, but not the primary `development` checkout. Neither checkout contains a root `DESIGN.md`. File presence in a worktree does not establish automatic discovery in another checkout or execution during a session. The feature guidance explicitly routes design work to those resources; no completed new-v2 run was verified here. [Feature integration guidance](../agents/skills.md), lines 33–61; [feature AGENTS.md](../../AGENTS.md), lines 90–101

The homepage currently includes topic numbers, numbered section labels, repeated arrows, and a technical map; the compact tools and contact compositions are already prescribed in the existing brief. [Homepage](../../src/pages/index.astro), lines 65–144; [brief](redesign-brief.md), lines 83–113

Approval to execute a plan is distinct from approval of the rendered design. The user remains dissatisfied, so the current prototype should remain a candidate. Historical wording calling its direction approved must not turn into a claim that visual sign-off has occurred.

**Interpretation:** further isolated spacing and surface changes risk polishing the same composition without resolving the user's dissatisfaction. A subject-specific visual concept and comparison of alternative full-page compositions should precede another implementation pass. This is a hypothesis based on the code, guidance, and user feedback; this research did not run usability testing or a new visual audit. A filename or a new skill alone will not resolve that gap.

## Proposed role of root DESIGN.md

Make `DESIGN.md` the concise, repo-owned visual contract, with approved examples. Do not merely copy the current dissatisfied design into it. Upstream's Stitch variant can export such a file, but that output targets Stitch generation; adopting the document idea does not require adding Stitch or following its perpetual-motion guidance. [Stitch skill](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/stitch-skill/SKILL.md)

Recommended contents:

1. **Status and purpose:** candidate versus approved decisions, audience, professional positioning, and primary visitor tasks.
2. **One visual idea:** the xhverse-specific concept, reference qualities to borrow, and approved desktop/mobile examples.
3. **Design roles:** color proportions, type hierarchy, content measure, spacing rhythm, surfaces, media treatment, glyphs, motion, and dark/light behavior.
4. **Page patterns:** homepage, discovery indexes, articles, tool journeys, About, and contact; show purposeful variations rather than one repeated section template.
5. **Content rules:** direct wording, original tool names, evidence requirements, contextual technology mentions, minimal AI-tool line, and primary/secondary action hierarchy.
6. **Accessibility and review:** clear link/focus states, native keyboard use, 320px and 200% reflow, both themes, reduced motion, image honesty, and approved screenshot references.
7. **Change control:** how a new direction becomes approved, which exceptions are deliberate, and who updates the document alongside CSS.

Recommended relationship: `AGENTS.md` links to this contract and preserves engineering/release authority; `DESIGN.md` owns visual decisions; `src/styles/public.css` implements semantic tokens; the redesign brief owns temporary scope and rollout; the validation record owns evidence. Add explicit pointers from the relevant agent/skill guidance when this change is authorized; the filename alone does not establish that a session reads it. Avoid duplicating token tables and differing layout prescriptions across all these files. Current examples demonstrate why: the UX auditor describes an 1120px container, while public CSS implements 1200px. Consolidating future guidance should resolve that discrepancy explicitly. [UX spacing](../../.agents/skills/ux-ui-auditor/SKILL.md), lines 32–35; [public container](../../src/styles/public.css), lines 77–79

## Safe next step

Agree the visual contract's role, then prepare two or three substantively different homepage directions using real xhverse material. Review a complete desktop and mobile composition before selecting one. After approval, author `DESIGN.md`, update the local Taste integration if wanted, and implement through the existing local-first workflow. No global installation is needed.

If updating Taste, vendor the complete supporting files from one immutable revision, preserve provenance/licensing, and review script effects. The direction generator writes project state **and defaults history to `~/.taste-skill/history.json`**; set `TASTE_SKILL_HISTORY` to a repository-local path before any future run. Its `--out` flag alone does not move that history file. No generator was executed during this research. [Direction generator](https://raw.githubusercontent.com/Leonxlnx/taste-skill/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/scripts/draw.mjs)

Verification limits: source contents, revision metadata, local hashes, file locations, and relevant guidance were inspected. No script trial, generated design, new browser measurements, app build/test, accessibility certification, or user-outcome claim is included.
