---
description: Cloudflare deployment rules that prevent production incidents
globs: ["src/**/*.astro", "scripts/**", "public/_headers"]
---

# Cloudflare Rules

- All `<script is:inline>` must have `data-cfasync="false"` (Rocket Loader)
- No inline `onclick`/`onX` handlers — use `addEventListener`
- CSP dual-layer: `scripts/generate-headers.ts` AND `src/layouts/BaseLayout.astro` must match
- Never add `unsafe-eval` to CSP
- Module scripts (`<script>` without is:inline) may not run on first load with View Transitions
- Use `astro:page-load` event for DOM re-initialization
