import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { affectedRoutes, classify, classifyRevision, parseChanges, publicRoute } from "./classify-changes";
import { isGuidancePath, pagesPathExcludes } from "./guidance-paths";
import { checkWhitespace } from "./check-whitespace";

test("only established guidance paths take lightweight validation", () => {
  for (const path of ["AGENTS.md", "CLAUDE.md", "README.md", "docs/deep/guide.md", ".codex/agents/qa.toml", ".agents/skills/a/SKILL.md", ".cursor/rules/a.mdc"]) {
    assert.equal(classify([{ status: "M", paths: [path] }]).mode, "guidance", path);
    assert.ok(pagesPathExcludes.some((pattern) => pattern.endsWith("*") ? path.startsWith(pattern.slice(0, -1)) : path === pattern));
  }
  for (const path of ["src/pages/index.astro", "src/lib/a.test.ts", "package.json", "bun.lock", ".github/workflows/ci.yml", "scripts/ci/check.ts", "playwright.config.ts", "functions/a.ts", "public/image.png", "CHANGELOG.md", "unknown.md", "docs/../src/a.ts", "/docs/a.md"]) {
    assert.equal(isGuidancePath(path), false, path);
    assert.equal(classify([{ status: "M", paths: [path] }]).mode, "full", path);
  }
  assert.equal(classify([{ status: "M", paths: ["docs/a.md"] }, { status: "A", paths: ["src/a.ts"] }]).mode, "full");
});

test("deletions and both ends of renames are classified", () => {
  assert.equal(classify(parseChanges("D\0docs/old.md\0R100\0docs/one.md\0docs/two.md\0")).mode, "guidance");
  for (const raw of ["R099\0src/a.ts\0docs/a.md\0", "R100\0docs/a.md\0src/a.ts\0", "D\0src/a.ts\0", "T\0docs/a.md\0"]) assert.equal(classify(parseChanges(raw)).mode, "full");
  assert.deepEqual(parseChanges("M\0docs/a\nwith space.md\0"), [{ status: "M", paths: ["docs/a\nwith space.md"] }]);
  for (const raw of ["M\0docs/a.md", "R100\0one\0", "?\0docs/a.md\0"]) assert.throws(() => parseChanges(raw));
  assert.equal(classify([], false).mode, "full");
  assert.equal(classify([]).mode, "full");
});

test("real Git revisions fail closed for missing history and classify merge candidate", () => {
  const cwd = mkdtempSync(join(tmpdir(), "xhverse-classifier-"));
  const git = (...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" }).trim();
  try {
    git("init"); git("config", "user.email", "test@example.invalid"); git("config", "user.name", "Fixture");
    writeFileSync(join(cwd, "README.md"), "base"); git("add", "."); git("commit", "-m", "base");
    const base = git("rev-parse", "HEAD");
    writeFileSync(join(cwd, "README.md"), "guidance"); git("add", "."); git("commit", "-m", "guidance");
    const head = git("rev-parse", "HEAD");
    assert.equal(classifyRevision(base, head, cwd).mode, "guidance");
    git("switch", "-c", "feature");
    mkdirSync(join(cwd, "docs")); writeFileSync(join(cwd, "docs/new.md"), "guidance");
    git("add", "."); git("commit", "-m", "feature guidance");
    git("switch", "-");
    writeFileSync(join(cwd, "README.md"), "base advance"); git("add", "."); git("commit", "-m", "base advance");
    const advancedBase = git("rev-parse", "HEAD");
    git("merge", "--no-ff", "feature", "-m", "merge candidate");
    assert.equal(classifyRevision(advancedBase, git("rev-parse", "HEAD"), cwd).mode, "guidance");
    assert.equal(classifyRevision("0".repeat(40), head, cwd).mode, "full");
    assert.equal(classifyRevision("f".repeat(40), head, cwd).mode, "full");
    assert.doesNotThrow(() => checkWhitespace("f".repeat(40), head, cwd));
    assert.equal(classifyRevision(head, base, cwd).mode, "full");
    writeFileSync(join(cwd, "package.json"), "{}"); git("add", "."); git("commit", "-m", "app");
    assert.equal(classifyRevision(base, git("rev-parse", "HEAD"), cwd).mode, "full");
    writeFileSync(join(cwd, "README.md"), "bad trailing whitespace  \n"); git("add", "."); git("commit", "-m", "bad whitespace");
    assert.throws(() => checkWhitespace("f".repeat(40), git("rev-parse", "HEAD"), cwd));
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});

test("public smoke routes omit removed, admin, and unresolved dynamic paths", () => {
  assert.equal(publicRoute("src/pages/about.astro"), "/about");
  assert.equal(publicRoute("src/pages/blog/index.astro"), "/blog");
  assert.equal(publicRoute("src/pages/index.astro"), "/");
  assert.equal(publicRoute("src/pages/admin/index.astro"), undefined);
  assert.equal(publicRoute("src/pages/404.astro"), undefined);
  assert.equal(publicRoute("src/pages/tools/[slug].astro"), undefined);
  const cwd = mkdtempSync(join(tmpdir(), "xhverse-routes-"));
  try {
    mkdirSync(join(cwd, "src/pages/tools"), { recursive: true });
    writeFileSync(join(cwd, "src/pages/tools/live.astro"), "");
    assert.deepEqual(affectedRoutes([{ status: "D", paths: ["src/pages/removed.astro"] }], cwd), ["/", "/blog", "/tools"]);
    assert.ok(affectedRoutes([{ status: "M", paths: ["src/layouts/BaseLayout.astro"] }], cwd).includes("/tools/live"));
    assert.ok(affectedRoutes([{ status: "M", paths: ["src/pages/blog/[slug].astro"] }], cwd).includes("/blog/*"));
    assert.ok(affectedRoutes([{ status: "M", paths: ["src/lib/practitioner-tools/tools.ts"] }], cwd).includes("/tools/*"));
    assert.ok(affectedRoutes([], cwd, true).includes("/tools/*"));
    assert.ok(affectedRoutes([{ status: "M", paths: ["bun.lock"] }], cwd).includes("/blog/*"));
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
