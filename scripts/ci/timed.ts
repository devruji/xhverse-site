import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const [label, ...command] = process.argv.slice(2);
if (!label || !command.length) throw new Error("Usage: bun scripts/ci/timed.ts <label> <command> [args...]");
const start = performance.now();
const result = spawnSync(command[0], command.slice(1), { stdio: "inherit", env: process.env });
const duration = ((performance.now() - start) / 1000).toFixed(2);
const status = result.status ?? 1;
const line = `| ${label} | ${duration}s | ${status === 0 ? "PASS" : "FAIL"} |\n`;
console.log(`[timing] ${label}: ${duration}s (exit ${status})`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, line);
if (result.error) console.error(result.error.message);
process.exit(status);
