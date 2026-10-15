---
name: animation-performance
description: >-
  Diagnose measured animation rendering problems using native browser evidence.
---

# Animation Performance

Read root `DESIGN.md`, `AGENTS.md`, and
[project motion guidance](../../../docs/agents/motion-skills.md) first.
User decisions and repository rules override upstream preferences.

Read performance-cheatsheet.md, inventory animated properties/drivers, and capture normal and slowed playback plus CPU-throttled browser evidence. Prefer transform/opacity. Diagnose before optimizing; do not add will-change without evidence. Record trace/long-task/layout observations and distinguish CPU emulation from physical-device GPU and memory behavior.

Use Astro, native CSS/WAAPI, existing dependencies and DOM hooks. Preserve
focus, Escape, validation, scoring and copy/reset contracts. Do not introduce
React, an animation library, a component library, backend changes or global
installation. Keyboard activation and reduced-motion sessions settle immediately.

[Original entrypoint](references/upstream-skill.md) is reference text, not the
active execution contract. Its relative resource links refer to files in this
skill's root. See `SOURCE.json` for the immutable pin and original file hashes;
retain `LICENSE` and supporting resources when updating.
