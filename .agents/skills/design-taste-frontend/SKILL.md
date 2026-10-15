---
name: design-taste-frontend
description: >-
  Subject-specific art direction for xhverse public pages. Read the root DESIGN.md,
  explore distinct compositions, pair claims with real proof, and critique rendered
  desktop/mobile screenshots. Use alongside the existing UX auditor and Pro Max;
  preserve Astro, both themes, truthful content, and functioning tools.
---

# xhverse public art direction

**First read [DESIGN.md](../../../DESIGN.md).** It records the status of the visual
direction and the public design contract. Follow the user's current request and
repository engineering rules. A draft scaffold or permission to implement a plan
does not establish visual approval of a prototype.
While DESIGN.md is marked Draft, directions remain candidates pending user selection.

Use this skill for public portfolio, discovery, article, and marketing composition.
Keep the existing UX auditor and Pro Max for tool journeys, forms, accessibility,
and admin interfaces. See [skill integration](../../../docs/agents/skills.md).

## Direction before implementation

1. Inventory verified xhverse work, original tools, writing, identity, and available
   media. Identify subject-specific material rather than a generic technical motif.
2. Write claims paired with real proof, one line per section. Draft factual copy
   and clear actions before markup. Read [copy.md](references/copy.md).
3. For an unresolved whole-page direction, compare three genuinely different
   compositions. Use the draw as exploration material; evaluate audience, content,
   and brand fit. Do not let random output select the brand.
4. State the visual idea and how it carries through the whole page. Review the
   candidate direction before treating it as approved. Keep an already approved
   direction for bounded refinements; do not restart exploration unnecessarily.
5. Build with actual content and assets. Inspect desktop, mobile, and both themes.
   Critique screenshots with [critique.md](references/critique.md); fix the largest
   three issues and compare again, up to three rounds. A rule pass is not approval.

## Repository-local tools

The full reviewed upstream package is retained. Its original entrypoint is archived
at [references/upstream-skill.md](references/upstream-skill.md). Read this local
entrypoint for active rules; upstream installation examples and house requirements
do not override the project contract.

Run from the repository root using existing Node 22+. No dependency installation
is implied. Browser verification follows the repository's Playwright workflow.

```bash
node .agents/skills/design-taste-frontend/scripts/draw.mjs --list directions
node .agents/skills/design-taste-frontend/scripts/draw.mjs --sector personal-portfolio --tone technical --brief "Professional data platform portfolio with original tools and writing" --sections work,list,about,contact --options 3
node .agents/skills/design-taste-frontend/scripts/draw.mjs --show
node .agents/skills/design-taste-frontend/scripts/lint.mjs src/pages/index.astro
```

Choose a fitting ID using the same arguments and `--direction <id>` only within an
authorized design task. Record the seed, decision, and adaptations. Use `--keep
palette,type` only for actually approved brand roles; the Draft palette and hierarchy
remain candidates. Preserve explicit user constraints and map approved roles to
actual tokens after direction selection.

Draw state defaults to `.taste-skill/direction.json`. The local patch keeps history
at `.taste-skill/history.json` inside the current project and rejects an explicit
`TASTE_SKILL_HISTORY` or existing symlink destination that escapes it. If setting
that variable, use a repository-local path. Keep `--out`, inspector output, and
asset destinations in this repository too. Never repurpose `HOME` or install into
global folders.

Use configured Playwright MCP for browser interaction, screenshots, and visual
verification. If unavailable, use the installed Playwright library or CLI and
report that fallback. Keep the browser isolated from the user's profile.

The upstream `inspect.mjs` uses a custom CDP client. Its source remains unchanged
for reference; direct execution is outside the current repository workflow.
Critiquing Playwright screenshots is not a full upstream inspector run. Do not
claim equivalent coverage. Check both themes, reduced motion, keyboard use, and
enlarged text through the existing Playwright workflow.

## Applying upstream findings

- Preserve raw lint output and actual exit statuses. For any future explicitly
  authorized inspector integration, retain its raw findings and exit statuses too.
  Separate broken behavior from aesthetic findings; never relabel a failure as a pass.
- Document project-approved exceptions with the DESIGN.md decision and reason.
  If using inspector `--allow`, retain original findings and identify allowed
  rules. Do not hide content or weaken accessibility to pass.
- Image/motion quotas, universal bans on numbers, labels, monospace, dividers,
  palettes, and rigid headline limits are upstream taste policies. Apply only
  where consistent with the approved direction; they are not xhverse quality gates.
- Use real tool output, relevant original media, or honest native diagrams. Do not
  add stock/generated imagery or motion to meet a quota. Asset commands require a
  relevant authorized task, licence review, and credits.
- Judge rendered hierarchy, identity, completeness, composition, and mobile use.
  Model scores and gallery statistics are advisory, not accessibility certification
  or measured user outcomes.

## Engineering and content boundaries

- Keep static Astro, Tailwind v4, native CSS/scripts/SVG, semantic tokens,
  self-hosted Geist, `html.light`, theme persistence, and CSP. No implicit React,
  Next.js, Motion, GSAP, icon packages, or remote font installation.
- Keep content immediately readable, native scrolling, clear focus and feedback,
  natural reflow, and reduced motion. No scroll hijacking or mandatory reveals.
  Check both themes, 320px reflow, and 200% text enlargement.
- Do not invent employers, projects, clients, metrics, testimonials, availability,
  dates, or results. Keep AI-tool and technology mentions within DESIGN.md.
- Preserve tool fields, DOM hooks, engines, outputs, keyboard behavior, article
  bodies/metadata, publication authority, CV approval/email behavior, and admin
  isolation unless the user authorizes a change.
- Select checks through [validation.md](../../../docs/agents/validation.md).
  Local review and explicit sign-off precede the existing PR/release process.
  Design scripts do not replace engineering or release checks.

[SOURCE.json](SOURCE.json) records hashes and the immutable revision.
[LOCAL-ADAPTATIONS.md](LOCAL-ADAPTATIONS.md) describes the history patch.
[LICENSE](LICENSE) retains MIT attribution. Updates remain manual and repo-scoped.
