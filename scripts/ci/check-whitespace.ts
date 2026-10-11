import { execFileSync } from "node:child_process";
import { classifyRevision } from "./classify-changes";

export function checkWhitespace(base: string, head: string, cwd = process.cwd()): void {
  const complete = classifyRevision(base, head, cwd).historyComplete;
  // Missing base history must select full validation, rather than stop it before runtime phases.
  const args = complete ? ["diff", "--check", base, head] : ["show", "--format=", "--check", "HEAD"];
  console.log(complete ? "Whitespace: base to candidate" : "Whitespace: checked-out commit (base history unavailable; full validation required)");
  execFileSync("git", args, { cwd, stdio: "inherit" });
}

if (import.meta.main) {
  const argument = (name: string) => { const index = process.argv.indexOf(name); return index < 0 ? "" : process.argv[index + 1] ?? ""; };
  checkWhitespace(argument("--base"), argument("--head"));
}
