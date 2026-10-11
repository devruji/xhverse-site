import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

interface Step { name: string; if?: string; run?: string; uses?: string; with?: Record<string, unknown>; env?: Record<string, string> }
interface Workflow { on: Record<string, { branches: string[]; paths?: string[]; 'paths-ignore'?: string[] }>; jobs: Record<string, { name: string; if: string; steps: Step[]; permissions?: Record<string, string> }> }

test("required PR job validates candidates and guidance completes without runtime phases", () => {
  const workflow = parse(readFileSync('.github/workflows/ci.yml', 'utf8')) as Workflow;
  assert.deepEqual(workflow.on.pull_request.branches, ['development', 'main']);
  assert.deepEqual(workflow.on.push.branches, ['main']);
  assert.equal(workflow.on.pull_request.paths, undefined);
  assert.equal(workflow.on.pull_request['paths-ignore'], undefined);
  const pr = workflow.jobs.test;
  assert.equal(pr.name, 'Test and Build');
  assert.equal(pr.if, "github.event_name == 'pull_request'");
  assert.equal(pr.steps.find((step) => step.uses?.startsWith('actions/checkout'))?.with?.['fetch-depth'], 0);
  for (const name of ['Delivery fixture tests', 'Install Chromium', 'Typecheck', 'Build', 'Coverage', 'E2E against existing build']) {
    assert.equal(pr.steps.find((step) => step.name === name)?.if, "steps.changes.outputs.mode == 'full'", name);
  }
  assert.ok(pr.steps.find((step) => step.name === 'Classify changes')?.env?.BASE_SHA.includes('pull_request.base.sha'));
  assert.ok(pr.steps.find((step) => step.name === 'Validate guidance surfaces and whitespace')?.run?.includes('scripts/ci/check-whitespace.ts'));
  assert.ok(pr.steps.find((step) => step.name === 'E2E against existing build')?.run?.endsWith('bun run test:e2e:built'));
  assert.ok(pr.steps.find((step) => step.name === 'Install Chromium')?.run?.endsWith('playwright install --with-deps chromium'));
  assert.ok(!pr.steps.some((step) => step.run?.includes('|| true')));
});

test("main push verifies before reporting and guidance creates no deployment record", () => {
  const workflow = parse(readFileSync('.github/workflows/ci.yml', 'utf8')) as Workflow;
  const main = workflow.jobs['report-production-deployment'];
  assert.ok(main.if.includes("github.event_name == 'push'"));
  const verify = main.steps.findIndex((step) => step.name === 'Verify active Cloudflare production and smoke routes');
  const record = main.steps.findIndex((step) => step.name === 'Record verified production deployment');
  assert.ok(verify >= 0 && record > verify);
  assert.equal(main.steps[verify].if, "steps.changes.outputs.mode == 'full'");
  assert.equal(main.steps[record].if, "steps.changes.outputs.mode == 'full'");
  assert.ok(main.steps[verify].env?.CLOUDFLARE_API_TOKEN.includes('secrets.CLOUDFLARE_API_TOKEN'));
  assert.ok(main.steps[record].run?.includes('test "$active_main" = "$GITHUB_SHA"'));
  assert.ok(main.steps[record].run?.includes('deployment-verification.json'));
  assert.ok(!main.steps.some((step) => /bun run (check|build|coverage|test:e2e)/.test(step.run ?? '')));
});

test("full local check builds once and standalone E2E builds before preview", () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
  const commands = pkg.scripts.check.split(' && ');
  assert.equal(commands.filter((command) => command === 'bun run build').length, 1);
  assert.ok(commands.includes('bun run coverage'));
  assert.equal(commands.at(-1), 'bun run test:e2e:built');
  assert.equal(pkg.scripts['test:e2e'], 'bun run build && bun run test:e2e:built');
  const config = readFileSync('playwright.config.ts', 'utf8');
  assert.ok(config.includes('reuseExistingServer: false'));
  assert.ok(!config.includes('bun run build'));
});
