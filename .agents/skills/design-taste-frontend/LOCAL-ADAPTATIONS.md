# Local adaptations

The package is vendored from Leonxlnx/taste-skill revision
`a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9`, path `skills/taste-skill`.
The upstream root MIT notice is included as `LICENSE`.

- `SKILL.md` is the active xhverse entrypoint. It reads root `DESIGN.md`, separates
  candidate direction from visual approval, assigns complementary roles to UX
  guidance, and protects existing engineering/content constraints. The current
  upstream entry is preserved byte-for-byte in `references/upstream-skill.md`.
- Browser review uses the repo's isolated Playwright MCP or installed Playwright
  fallback. The custom-CDP inspector remains unmodified reference source, without
  an active execution command or a claim that Playwright review is equivalent.
  Inspector findings/exception reporting applies only to a future explicitly
  authorized integration. Draw `--keep` applies only to approved brand roles;
  pending Draft palette and hierarchy values are not frozen by the example.
- `scripts/draw.mjs` changes the history destination only. It removes the home
  directory default, resolves history under the current project, and rejects an
  explicit history path or existing symlink ancestor that escapes the project.
  This prevents the upstream default `~/.taste-skill/history.json` side effect.
  Run from the repository root. `TASTE_SKILL_HISTORY` may select a path inside it.
- All other upstream scripts, assets, library data, evaluation fixtures, reference
  files, and README remain unchanged. Upstream README commands/claims are source
  documentation; the local entrypoint governs application to this repository.

`SOURCE.json` contains every upstream file hash, the archived-entry hash, and the
hashes of locally adapted files. No runtime application dependency or global
skill/configuration is introduced. The superseded experimental copy is removed
from the active repository skill path.
