# xhverse Site Agent Guide

## Repo purpose
Production website and blog for xhverse, built with Astro.
Primary goals: clean UX, strong content presentation, minimal design, SEO hygiene, and safe production-quality changes.

## Priority directories
- `src/pages` for routes
- `src/components` for reusable UI
- `src/layouts` for page shells
- `public` for static assets
- `tests` for automated coverage where applicable

## Before editing
- Read the relevant page, layout, and shared component first.
- Reuse existing patterns before creating new abstractions.
- Prefer minimal, reviewable diffs.
- Before making changes, open a new branch from the correct base branch; do not work directly on `development` or `main` unless the user explicitly asks.

## Commands
- install: `bun install`
- dev: `bun run dev`
- build: `bun run build`
- preview: `bun run preview`
- typecheck: `bun run typecheck`
- unit test: `bun run test`
- unit test (watch): `bun run test:watch`
- coverage: `bun run coverage`
- e2e test: `bun run test:e2e`
- full verification: `bun run check`

## Engineering rules
- Treat this repo as production code.
- Preserve existing behavior unless the task explicitly changes it.
- Do not edit generated folders such as `coverage`, `playwright-report`, `dist`, or `.astro`.
- Avoid unrelated refactors.
- Keep changes small and explainable.
- Prefer existing components, spacing, and typography patterns.
- For complex tasks, produce a plan first before editing.
- Keep the pinned Node runtime aligned across `/.node-version`, CI, and Cloudflare Pages when Astro or tooling requirements change.
- Keep `bun.lock` in sync with any dependency manifest changes; do not relax `--frozen-lockfile` to hide drift.
- Keep CI reporting steps non-fatal when their input artifacts were not produced because an earlier step failed.
- Report only checks that were actually run.

## Content rules
- Tone: concise, professional, minimal, credible.
- Avoid generic marketing copy.
- Keep CTAs subtle.
- Write for clarity first.

## SEO rules
- Important pages should have strong title and description metadata.
- Preserve clean heading hierarchy.
- Avoid duplicate or weak metadata.
- Do not ship placeholder OG/meta text.

## Release flow
- Merge feature work into `development` first.
- Target automated dependency and CI update PRs at `development` first unless the user explicitly asks otherwise.
- Promote releases from `development` to `main`.
- Prefer a PR from `development` to `main` for release promotion unless the user explicitly asks for a direct merge.
- Before any merge, verify the source branch and target branch explicitly.
- Every release promotion to `main` must include a useful release message that summarizes user-visible changes, security/runtime changes, verification, and known risks.
- After a release is merged to `main`, create and push a release tag for that exact `main` commit.
- Prefer annotated release tags such as `v1.2.3` with a concise message that explains what shipped and why it matters.
- Do not tag unreleased `development` commits or preview-only work.

## Branch hygiene
- Treat `development` and `main` as the long-lived branches.
- Always mention and confirm the branch plan before edits: open a new branch first, and state whether the base is currently `development` or `main`.
- Use `development` as the default base for feature, dependency, CI, and content work unless the user explicitly chooses `main`.
- Keep `main` for production release promotion only.
- Delete merged or abandoned feature branches after confirming they are no longer needed.
- Prune stale remote-tracking branches when branch state has drifted from GitHub.
- Verify PR state before deleting any remote branch.

## Done when
- requested change is implemented
- relevant checks have been run
- edited area has no obvious regression
- final summary includes changed files, risks, and verification status
