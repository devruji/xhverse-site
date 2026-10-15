---
name: ui-ux-pro-max
description: >-
  Search local UX guidance for xhverse web interfaces, including accessibility,
  responsive text, forms, navigation, charts, and Astro implementation references.
  Supports the repo-owned design baseline; does not choose brand positioning
  or authorize dependencies, persistence, native app rules, or runtime changes.
---

# Local UX reference search

Read root [DESIGN.md](../../../DESIGN.md) first and respect its Draft/approved
status. Read the [task brief](../../../docs/design/redesign-brief.md) for scope.
Use this package alongside repo-local Taste to compare compositions and answer
focused usability questions. Existing genre or layout recommendations are
comparison material, not a selected direction.
Treat keyword-ranked design-system output as a suggestion requiring evaluation,
not a brand decision. Portfolio queries can return unrelated conversion templates.
Its data are recommendations, not measured compliance or verified project facts.

## Search from the repository root

Requires existing Python 3; standard library only. No global installer or network
is needed for searches. Use `-B` to avoid bytecode files in the vendored package.

```bash
python3 -B .agents/skills/ui-ux-pro-max/scripts/search.py "focus not obscured" --domain ux
python3 -B .agents/skills/ui-ux-pro-max/scripts/search.py "error summary validation" --domain ux
python3 -B .agents/skills/ui-ux-pro-max/scripts/search.py "image optimization" --stack astro
```

Use one dominant intent and a few meaningful terms. Check the returned platform,
result identity, and relevance before applying a recommendation. Retry once with
a narrower phrase or explicit domain/stack if empty or off-topic. Disclose a
fallback; do not fabricate a match or persist unverified output.

For a proposed visual system, `--design-system` can provide comparison material:

```bash
python3 -B .agents/skills/ui-ux-pro-max/scripts/search.py "portfolio personal projects" --design-system
```

This does not replace `DESIGN.md`, user selection, or reference research. `--stack` is ignored in design-system
mode; run a separate Astro query. Omit `--motion`: it attaches GSAP snippets even
at low intensity, while this repo uses native CSS feedback. Do not use `--persist`
or `--force` to replace approved design decisions; document changes only within
the user's authorized scope and existing repo conventions.

## Applying results

- Use [quick-reference.md](references/quick-reference.md) for applicable web
  checks: contrast, keyboard navigation, focus visibility, labels, text reflow,
  full-value access, error recovery, state semantics, and reduced motion.
- [pro-rules.md](references/pro-rules.md) targets native/mobile applications.
  Native gestures, safe areas, and pt/dp minima do not apply wholesale to web.
  For web targets use CSS pixels and relevant WCAG exceptions; larger targets
  remain a usability choice.
- Keep existing Astro architecture, build-time blog source, inline SVGs,
  self-hosted fonts, public CSS tokens, scripts, and CSP. No imports or package
  installs are implied by a result.
- Astro row 20 incorrectly recommends removed `Astro.glob()`. Use current repo
  patterns and official documentation. Do not migrate the blog to content
  collections, add server output/adapters, or use preview URLs as canonicals.
- Ignore remote Google Fonts imports, framework/API snippets from other stacks,
  conversion templates that change portfolio positioning, and fabricated sample
  data as public claims. Preserve existing article text and domain behavior.
- Verify implemented behavior with the repo's actual checks and browser review.
  A dataset rating or search output is not accessibility/performance evidence.

The complete pinned data/scripts/references remain available. The original
[upstream entry](references/upstream-skill.md) is archived for audit, not for
executing its plugin-path commands. [SOURCE.json](SOURCE.json) records provenance;
[LICENSE](LICENSE) retains the MIT notice. See
[integration guidance](../../../docs/agents/skills.md) for known limitations and updates.
