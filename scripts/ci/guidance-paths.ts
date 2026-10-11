// Keep these exclusions aligned with the Cloudflare Pages watch paths.
export const guidanceFiles = ["AGENTS.md", "CLAUDE.md", "README.md"];
export const guidanceDirectories = ["docs/", ".agents/", ".cursor/", ".codex/"];
export const pagesPathExcludes = [
  ...guidanceFiles,
  ...guidanceDirectories.map((directory) => `${directory}*`),
];

export function isGuidancePath(path: string): boolean {
  if (path.includes("\\") || path.split("/").some((part) => part === ".." || part === ".")) return false;
  return guidanceFiles.includes(path) || guidanceDirectories.some((directory) => path.startsWith(directory));
}
