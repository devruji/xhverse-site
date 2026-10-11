import { execFileSync } from "node:child_process";
import { appendFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isGuidancePath } from "./guidance-paths";

export interface Change { status: string; paths: string[] }
export interface Classification { mode: "guidance" | "full"; reason: string; changes: Change[]; routes: string[]; historyComplete: boolean }

export function parseChanges(raw: string): Change[] {
  const tokens = raw.split("\0");
  if (tokens.pop() !== "") throw new Error("Incomplete git diff");
  const changes: Change[] = [];
  while (tokens.length) {
    const status = tokens.shift()!;
    if (!/^(?:[ADMTUXB]|[RC]\d+)$/.test(status)) throw new Error("Unknown diff status");
    const paths = tokens.splice(0, /^[RC]/.test(status) ? 2 : 1);
    if (paths.length !== (/^[RC]/.test(status) ? 2 : 1) || paths.some((path) => !path)) throw new Error("Incomplete git path");
    changes.push({ status, paths });
  }
  return changes;
}

export function classify(changes: Change[], historyComplete = true): Classification {
  const guidance = historyComplete && changes.length > 0 && changes.every(({ status, paths }) =>
    !/^[TUXB]/.test(status) && paths.every(isGuidancePath));
  return { mode: guidance ? "guidance" : "full", reason: !historyComplete ? "Missing or incomplete Git history" : guidance ? "Only established guidance paths changed" : "Application, delivery, unknown, mixed, or empty change set", changes, routes: ["/", "/blog", "/tools"], historyComplete };
}

export function classifyRevision(base: string, head: string, cwd = process.cwd()): Classification {
  try {
    if (!/^[a-f\d]{40}$/.test(base) || !/^[a-f\d]{40}$/.test(head) || /^0+$/.test(base)) return classify([], false);
    execFileSync("git", ["merge-base", "--is-ancestor", base, head], { cwd, stdio: "pipe" });
    const raw = execFileSync("git", ["diff", "--name-status", "-z", "--find-renames", base, head], { cwd, encoding: "utf8" });
    return classify(parseChanges(raw));
  } catch {
    // Classification must fail closed; it must never skip validation on uncertain history.
    return classify([], false);
  }
}

export function publicRoute(path: string): string | undefined {
  if (!path.startsWith("src/pages/") || !path.endsWith(".astro")) return undefined;
  const route = path.slice("src/pages/".length, -".astro".length).replace(/(?:^|\/)index$/, "");
  if (route === "404" || route.startsWith("admin") || route.split("/").some((part) => part.includes("["))) return undefined;
  return `/${route}`.replace(/\/$/, "") || "/";
}

export function affectedRoutes(changes: Change[], cwd = process.cwd(), broad = false): string[] {
  const routes = new Set(["/", "/blog", "/tools"]);
  const add = (path: string) => { const route = publicRoute(path); if (route) routes.add(route); };
  for (const change of changes) if (change.status !== "D") add(change.paths.at(-1)!);
  // Shared UI and dynamic journeys can affect every public route. Deleted routes are not smoked.
  const sharedDelivery = ["astro.config.mjs", "package.json", "bun.lock", "public/_headers", "public/_redirects", "public/_routes.json", "functions/_middleware.ts", "scripts/generate-headers.ts"];
  if (broad || changes.some(({ paths }) => paths.some((path) => sharedDelivery.includes(path) || /^(src\/(layouts|components|styles|data|lib)\/|src\/pages\/.*\[)/.test(path)))) {
    const walk = (directory: string) => {
      for (const entry of readdirSync(join(cwd, directory), { withFileTypes: true })) {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory()) walk(path); else if (entry.isFile()) add(path);
      }
    };
    walk("src/pages");
    // Resolve generated routes through production's fresh sitemap during verification.
    routes.add("/blog/*");
    routes.add("/tools/*");
  }
  return [...routes];
}

if (import.meta.main) {
  const argument = (name: string) => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
  const result = classifyRevision(argument("--base") ?? "", argument("--head") ?? "");
  result.routes = affectedRoutes(result.changes, process.cwd(), !result.historyComplete);
  const output = argument("--output");
  if (output) writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
  const githubOutput = argument("--github-output");
  if (githubOutput) appendFileSync(githubOutput, `mode=${result.mode}\n`);
  console.log(`${result.mode}: ${result.reason} (${result.changes.length} changes)`);
}
