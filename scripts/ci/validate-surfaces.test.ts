import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateFiles, validateSurface } from "./validate-surfaces";

test("surface validation accepts Markdown, rule/skill YAML, TOML, JSON", () => {
  validateSurface("README.md", "# Guide\n");
  validateSurface(".agents/skills/a/SKILL.md", "---\nname: a\ndescription: >-\n  A: useful guide\n---\n# Body\n");
  validateSurface(".cursor/rules/a.mdc", "---\ndescription: A\nalwaysApply: true\n---\n# Rule");
  validateSurface(".codex/a.toml", 'name = "qa"\n[instructions]\nvalue = "ok"');
  validateSurface("docs/a.yaml", "list:\n  - a\n");
  validateSurface("docs/a.json", '{"ok":true}');
});

test("malformed YAML/TOML and invalid required frontmatter fail lightweight validation", () => {
  for (const [path, source] of [
    ["docs/a.yml", "broken: ["], ["docs/a.yml", "same: a\nsame: b"],
    [".codex/a.toml", "broken = ["], [".codex/a.toml", 'a="1"\na="2"'],
    [".agents/skills/a/SKILL.md", "# Missing"], [".agents/skills/a/SKILL.md", "---\nname: a\n---\n"],
    [".cursor/rules/a.mdc", "---\na: [\n---\n"], ["README.md", "---\nbroken"],
    ["README.md", "bad\0text"], ["README.md", "bad\uFFFDtext"], ["docs/a.json", "{"],
  ]) assert.throws(() => validateSurface(path, source), path);
});

test("deleted guidance is allowed, symlinks and malformed existing files fail", () => {
  const cwd = mkdtempSync(join(tmpdir(), "xhverse-surfaces-"));
  try {
    mkdirSync(join(cwd, "docs"));
    writeFileSync(join(cwd, "README.md"), "# Valid");
    assert.equal(validateFiles(["README.md", "docs/deleted.md", "src/a.ts"], cwd), 1);
    symlinkSync(join(cwd, "README.md"), join(cwd, "docs/link.md"));
    assert.throws(() => validateFiles(["docs/link.md"], cwd), /regular file/);
    writeFileSync(join(cwd, "docs/bad.toml"), "broken = [");
    assert.throws(() => validateFiles(["docs/bad.toml"], cwd), /docs\/bad.toml/);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
