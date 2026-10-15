---
name: animate
description: >-
  Build purposeful native UI motion in Astro; use for requested interaction feedback and state transitions.
---

# Animate

Read root `DESIGN.md`, `AGENTS.md`, and
[project motion guidance](../../../docs/agents/motion-skills.md) first.
User decisions and repository rules override upstream preferences.

Name the interaction purpose and frequency. Read RECIPES.md for the matching control, then implement with CSS or WAAPI. Preserve native semantics and existing lifecycle; use the specified timing in DESIGN.md. Verify interruption, keyboard access, runtime reduced motion, and state settlement.

Use Astro, native CSS/WAAPI, existing dependencies and DOM hooks. Preserve
focus, Escape, validation, scoring and copy/reset contracts. Do not introduce
React, an animation library, a component library, backend changes or global
installation. Keyboard activation and reduced-motion sessions settle immediately.

[Original entrypoint](references/upstream-skill.md) is reference text, not the
active execution contract. Its relative resource links refer to files in this
skill's root. See `SOURCE.json` for the immutable pin and original file hashes;
retain `LICENSE` and supporting resources when updating.
