import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument } from "yaml";
import { parse as parseToml } from "smol-toml";
import { isGuidancePath } from "./guidance-paths";

function yaml(source: string): unknown {
  const doc = parseDocument(source, { uniqueKeys: true });
  if (doc.errors.length) throw new Error(doc.errors.map((error) => error.message).join("; "));
  return doc.toJSON() as unknown;
}

export function validateSurface(path: string, source: string): void {
  if (source.includes("\0") || source.includes("\uFFFD")) throw new Error("Invalid text encoding");
  if (/\.ya?ml$/.test(path)) { yaml(source); return; }
  if (path.endsWith(".toml")) { parseToml(source); return; }
  if (path.endsWith(".json")) { JSON.parse(source); return; }
  const needsFrontmatter = path.endsWith(".mdc") || /(?:^|\/)SKILL\.md$/.test(path);
  if (source.startsWith("---\n") || source.startsWith("---\r\n")) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw new Error("Unclosed YAML frontmatter");
    const data = yaml(match[1]);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Frontmatter must be a mapping");
    if (/(?:^|\/)SKILL\.md$/.test(path)) {
      const fields = data as Record<string, unknown>;
      if (typeof fields.name !== "string" || !fields.name.trim() || typeof fields.description !== "string" || !fields.description.trim()) throw new Error("Skill requires name and description");
    }
  } else if (needsFrontmatter) throw new Error("Missing YAML frontmatter");
}

export function validateFiles(paths: string[], cwd = process.cwd()): number {
  let count = 0;
  for (const path of paths) {
    if (!isGuidancePath(path)) continue;
    const absolute = join(cwd, path);
    if (!existsSync(absolute)) continue; // Deleted guidance requires diff review, not parsing a nonexistent file.
    if (!lstatSync(absolute).isFile()) throw new Error(`${path}: Expected regular file`);
    try { validateSurface(path, readFileSync(absolute, "utf8")); count++; }
    catch (error) { throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  return count;
}

if (import.meta.main) {
  const files = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" }).split("\0").filter(Boolean);
  console.log(`Validated ${validateFiles([...new Set(files)])} guidance surfaces`);
}
