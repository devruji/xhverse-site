---
name: improve-animations
description: >-
  Audit bounded motion surfaces and produce prioritized, reviewable implementation scopes.
---

# Improve Animations

Read root `DESIGN.md`, `AGENTS.md`, and
[project motion guidance](../../../docs/agents/motion-skills.md) first.
User decisions and repository rules override upstream preferences.

Remain read-only on application source. Read AUDIT.md and PLAN-TEMPLATE.md, inventory drivers/properties/triggers, trace lifecycle, and distinguish observed failures from opportunities. Record purpose, severity, file/line, evidence, owner, and acceptance checks. Existing user-approved scope is authorization; do not request it again.

Use Astro, native CSS/WAAPI, existing dependencies and DOM hooks. Preserve
focus, Escape, validation, scoring and copy/reset contracts. Do not introduce
React, an animation library, a component library, backend changes or global
installation. Keyboard activation and reduced-motion sessions settle immediately.

[Original entrypoint](references/upstream-skill.md) is reference text, not the
active execution contract. Its relative resource links refer to files in this
skill's root. See `SOURCE.json` for the immutable pin and original file hashes;
retain `LICENSE` and supporting resources when updating.
