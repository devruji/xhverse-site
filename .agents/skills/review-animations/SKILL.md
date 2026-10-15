---
name: review-animations
description: >-
  Review Astro motion for purpose, timing, accessibility, interruption, and evidence.
---

# Review Animations

Read root `DESIGN.md`, `AGENTS.md`, and
[project motion guidance](../../../docs/agents/motion-skills.md) first.
User decisions and repository rules override upstream preferences.

Read STANDARDS.md for exact upstream values, then trace the actual component lifecycle and apply project overrides. Report findings by severity with file/line and evidence; record justified differences separately. Verify immediate keyboard and reduced motion, rapid reversal, focus, cleanup/revisits, and ordinary-build isolation. End with a verdict and remaining verification gaps.

Use Astro, native CSS/WAAPI, existing dependencies and DOM hooks. Preserve
focus, Escape, validation, scoring and copy/reset contracts. Do not introduce
React, an animation library, a component library, backend changes or global
installation. Keyboard activation and reduced-motion sessions settle immediately.

[Original entrypoint](references/upstream-skill.md) is reference text, not the
active execution contract. Its relative resource links refer to files in this
skill's root. See `SOURCE.json` for the immutable pin and original file hashes;
retain `LICENSE` and supporting resources when updating.
