import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const PRODUCTION_URL = 'https://xhverse.co';
const DEFAULT_ROUTES = ['/', '/blog', '/tools'];
const DEPLOYMENT_PAGE_SIZE = 25;
type JsonObject = Record<string, unknown>;
export type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

export interface VerificationOptions {
  sha: string;
  accountId: string;
  cloudflareToken: string;
  githubToken: string;
  repository: string;
  project?: string;
  routes?: string[];
  securityHeaders: Record<string, string>;
  timeoutMs?: number;
  pollMs?: number;
  requestTimeoutMs?: number;
}
export interface VerificationDependencies {
  fetch: Fetcher;
  sleep: (milliseconds: number) => Promise<void>;
  now: () => number;
  log: (message: string) => void;
}
export interface VerificationResult {
  sha: string;
  deploymentId: string;
  url: string;
  routes: string[];
  elapsedMs: number;
}

function object(value: unknown, context: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Invalid ${context} response`);
  }
  return value as JsonObject;
}
function deploymentDetails(value: unknown) {
  const deployment = object(value, 'deployment');
  const trigger = object(deployment.deployment_trigger, 'deployment trigger');
  const metadata = object(trigger.metadata, 'deployment metadata');
  const stage = object(deployment.latest_stage, 'deployment stage');
  if (typeof deployment.id !== 'string' || typeof metadata.commit_hash !== 'string') {
    throw new Error('Deployment identity is missing');
  }
  return {
    id: deployment.id,
    sha: metadata.commit_hash,
    branch: metadata.branch,
    environment: deployment.environment,
    stage: stage.name,
    status: stage.status,
  };
}
function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
  }
  return result;
}
function normalizedPath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

export function validateRoutes(routes: unknown): string[] {
  if (!Array.isArray(routes) || routes.some((route: unknown) => typeof route !== 'string')) {
    throw new Error('Affected routes must be a JSON array of public paths');
  }
  for (const route of routes as string[]) {
    if (route.includes('*') && (!route.endsWith('/*') || route.slice(0, -1).includes('*'))) {
      throw new Error('Affected route wildcards must be terminal /* prefixes');
    }
    const url = new URL(route, PRODUCTION_URL);
    if (!route.startsWith('/') || route.startsWith('//') || route.includes('\\') ||
        url.origin !== PRODUCTION_URL || url.search || url.hash ||
        url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
      throw new Error('Affected routes must be public paths without queries or fragments');
    }
  }
  return [...new Set([...DEFAULT_ROUTES, ...routes as string[]])];
}

function sitemapLocations(source: string): { index: boolean; locations: string[] } {
  if (source.length > 5_000_000 || /<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('Invalid production sitemap');
  const document = source.replace(/<!--[\s\S]*?-->/g, '').trim();
  const root = document.match(/^(?:<\?xml\b[^?]*\?>\s*)?<(sitemapindex|urlset)\b[^>]*>([\s\S]*)<\/\1>$/);
  if (!root) throw new Error('Invalid production sitemap');
  const index = root[1] === 'sitemapindex';
  const entry = index ? 'sitemap' : 'url';
  const expression = new RegExp(`<${entry}\\b[^>]*>([\\s\\S]*?)<\\/${entry}>`, 'g');
  const locations: string[] = [];
  const remainder = root[2].replace(expression, (_match: string, body: string) => {
    const locs = [...body.matchAll(/<loc\b[^>]*>([^<]*)<\/loc>/g)];
    const remaining = body.replace(/<loc\b[^>]*>[^<]*<\/loc>/g, '')
      .replace(/<(lastmod|changefreq|priority)\b[^>]*>[^<]*<\/\1>/g, '').trim();
    if (locs.length !== 1 || remaining) throw new Error('Invalid production sitemap entry');
    const location = locs[0][1].trim().replace(/&([^;]+);/g, (_entity: string, code: string) => {
      const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
      if (named[code]) return named[code];
      const numeric = /^#(?:x[\da-f]+|\d+)$/i.test(code);
      if (!numeric) throw new Error('Invalid production sitemap entity');
      const point = code.slice(0, 2).toLowerCase() === '#x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      if (point <= 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) throw new Error('Invalid production sitemap entity');
      return String.fromCodePoint(point);
    });
    if (!location || /&[^;\s]*$/.test(location)) throw new Error('Invalid production sitemap location');
    locations.push(location);
    return '';
  }).trim();
  if (remainder) throw new Error('Invalid production sitemap entries');
  return { index, locations };
}

/** Read the global security-header contract, excluding route-specific cache rules. */
export function parseSecurityHeaders(source: string): Record<string, string> {
  const global = source.split(/\r?\n/);
  const headers: Record<string, string> = {};
  let inGlobal = false;
  for (const line of global) {
    if (line.trim() === '/*') { inGlobal = true; continue; }
    if (inGlobal && line.trim() && !/^\s/.test(line)) break;
    const match = inGlobal && line.match(/^\s+([\w-]+):\s*(.+)$/);
    if (match) headers[match[1].toLowerCase()] = match[2];
  }
  if (!headers['content-security-policy'] || !headers['strict-transport-security'] ||
      !headers['x-content-type-options'] || !headers['x-frame-options']) {
    throw new Error('Global security-header contract is incomplete');
  }
  return headers;
}

export function verifySmokeResponse(route: string, response: Response, html: string,
  securityHeaders: Record<string, string>): void {
  if (!response.ok) throw new Error(`Smoke ${route}: HTTP ${response.status}`);
  const expectedUrl = new URL(route, PRODUCTION_URL);
  const actualUrl = new URL(response.url || expectedUrl.href);
  if (actualUrl.origin !== PRODUCTION_URL ||
      normalizedPath(actualUrl.pathname) !== normalizedPath(expectedUrl.pathname)) {
    throw new Error(`Smoke ${route}: redirected away from the expected production route`);
  }
  if (!response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
    throw new Error(`Smoke ${route}: expected HTML`);
  }
  const document = html.replace(/<!--[\s\S]*?-->/g, '');
  const canonicals = [...document.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => attributes(match[0]))
    .filter((tag) => tag.rel?.toLowerCase().split(/\s+/).includes('canonical'));
  if (canonicals.length !== 1 || !canonicals[0].href) {
    throw new Error(`Smoke ${route}: expected one canonical URL`);
  }
  let canonical: URL;
  try { canonical = new URL(canonicals[0].href); }
  catch { throw new Error(`Smoke ${route}: invalid canonical URL`); }
  if (canonical.origin !== PRODUCTION_URL || canonical.username || canonical.password || canonical.search || canonical.hash ||
      normalizedPath(canonical.pathname) !== normalizedPath(expectedUrl.pathname)) {
    throw new Error(`Smoke ${route}: wrong canonical URL`);
  }
  const robotTags = [...document.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => attributes(match[0]))
    .filter((tag) => /^(robots|googlebot|bingbot)$/i.test(tag.name ?? ''));
  if (robotTags.some((tag) => /\b(noindex|none)\b/i.test(tag.content ?? '')) ||
      /\b(noindex|none)\b/i.test(response.headers.get('x-robots-tag') ?? '')) {
    throw new Error(`Smoke ${route}: production indexing is disabled`);
  }
  for (const [name, expected] of Object.entries(securityHeaders)) {
    const actual = response.headers.get(name);
    if (!actual) throw new Error(`Smoke ${route}: missing ${name}`);
    if (name === 'content-security-policy') {
      // Build-time Supabase sources may differ from the checked-in generated file.
      const directives = (policy: string) => {
        const parsed = new Map<string, string>();
        for (const directive of policy.split(';')) {
          const [key, ...sources] = directive.trim().split(/\s+/);
          if (key) {
            if (parsed.has(key.toLowerCase())) throw new Error(`Smoke ${route}: duplicate CSP directive`);
            parsed.set(key.toLowerCase(), sources
              .filter((source) => key.toLowerCase() !== 'connect-src' ||
                !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(source)).sort().join(' '));
          }
        }
        return parsed;
      };
      const expectedPolicy = directives(expected);
      const actualPolicy = directives(actual);
      if (/unsafe-eval/i.test(actual) || [...expectedPolicy]
        .some(([directive, value]) => actualPolicy.get(directive) !== value)) {
        throw new Error(`Smoke ${route}: unsafe or incomplete CSP`);
      }
    } else {
      const normalize = (value: string) => value.toLowerCase().split(/[;,]/)
        .map((part) => part.trim()).filter(Boolean).sort().join(';');
      if (normalize(actual) !== normalize(expected)) {
        throw new Error(`Smoke ${route}: unexpected ${name}`);
      }
    }
  }
}

export async function verifyDeployment(options: VerificationOptions,
  dependencies: Partial<VerificationDependencies> = {}): Promise<VerificationResult> {
  const deps: VerificationDependencies = {
    fetch: (url, init) => fetch(url, init),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    now: Date.now,
    log: console.log,
    ...dependencies,
  };
  for (const [name, value] of Object.entries({ CLOUDFLARE_ACCOUNT_ID: options.accountId,
    CLOUDFLARE_API_TOKEN: options.cloudflareToken, GH_TOKEN: options.githubToken,
    GITHUB_REPOSITORY: options.repository })) {
    if (!value?.trim()) throw new Error(`Missing ${name}`);
  }
  if (!/^[a-f0-9]{40}$/i.test(options.sha)) throw new Error('Expected a full commit SHA');
  if (!/^[\w.-]+\/[\w.-]+$/.test(options.repository)) throw new Error('Invalid GitHub repository');
  const requestedRoutes = validateRoutes(options.routes ?? []);
  const prefixes = requestedRoutes.filter((route) => route.endsWith('/*')).map((route) => route.slice(0, -1));
  const routes = requestedRoutes.filter((route) => !route.endsWith('/*'));
  const start = deps.now();
  const deadline = start + (options.timeoutMs ?? 15 * 60_000);
  const base = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(options.accountId)}` +
    `/pages/projects/${encodeURIComponent(options.project ?? 'xhverse-site-git')}`;
  const cfHeaders = { Authorization: `Bearer ${options.cloudflareToken}` };
  const ghHeaders = { Authorization: `Bearer ${options.githubToken}`,
    Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

  async function request<T>(url: string, headers: Record<string, string>,
    consume: (response: Response) => Promise<T>): Promise<T> {
    const remaining = deadline - deps.now();
    if (remaining <= 0) throw new Error('Deployment verification timed out');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(remaining, options.requestTimeoutMs ?? 30_000));
    try {
      const response = await deps.fetch(url, { headers, signal: controller.signal,
        redirect: headers.Authorization ? 'error' : 'follow' });
      if (!response.ok) throw new Error(`Verification request failed: HTTP ${response.status}`);
      return await consume(response);
    } catch (error) {
      // Fetch errors can contain authorization details; only controlled errors leave this boundary.
      if (error instanceof Error && /^(Verification request failed: HTTP|Smoke |Invalid production sitemap)/.test(error.message)) throw error;
      throw new Error(controller.signal.aborted ? 'Verification request timed out' : 'Verification request failed');
    } finally { clearTimeout(timer); }
  }
  async function api(url: string): Promise<JsonObject> {
    const value = await request(url, cfHeaders, (response) => response.json() as Promise<unknown>);
    const envelope = object(value, 'Cloudflare');
    if (envelope.success !== true) throw new Error('Cloudflare API reported failure');
    return envelope;
  }
  async function assertMain(): Promise<void> {
    const data = object(await request(`https://api.github.com/repos/${options.repository}/commits/main`,
      ghHeaders, (response) => response.json() as Promise<unknown>), 'GitHub main');
    if (typeof data.sha !== 'string') throw new Error('GitHub main commit is missing');
    if (data.sha !== options.sha) throw new Error('Release superseded: GitHub main no longer matches the expected commit');
  }
  async function activeDeployment() {
    const project = object((await api(base)).result, 'Cloudflare project');
    return project.canonical_deployment == null ? undefined : deploymentDetails(project.canonical_deployment);
  }
  async function findCandidate() {
    for (let page = 1; ; page++) {
      const envelope = await api(`${base}/deployments?env=production&per_page=${DEPLOYMENT_PAGE_SIZE}&page=${page}`);
      if (!Array.isArray(envelope.result)) throw new Error('Invalid Cloudflare deployments response');
      for (const entry of envelope.result) {
        const deployment = deploymentDetails(entry);
        if (deployment.environment === 'production' && deployment.branch === 'main' && deployment.sha === options.sha) {
          return deployment;
        }
      }
      const info = envelope.result_info == null ? undefined : object(envelope.result_info, 'pagination');
      if (typeof info?.total_pages === 'number' ? page >= info.total_pages : envelope.result.length < DEPLOYMENT_PAGE_SIZE) return undefined;
    }
  }
  function successful(deployment: ReturnType<typeof deploymentDetails> | undefined): boolean {
    return deployment?.environment === 'production' && deployment.branch === 'main' &&
      deployment.sha === options.sha && deployment.stage === 'deploy' && deployment.status === 'success';
  }

  async function discoverDynamicRoutes(): Promise<void> {
    if (!prefixes.length) return;
    const pending = [`${PRODUCTION_URL}/sitemap-index.xml`];
    const visited = new Set<string>();
    const discovered = new Set<string>();
    let locationsRead = 0;
    while (pending.length) {
      const url = pending.shift()!;
      if (visited.has(url)) continue;
      if (visited.size >= 20) throw new Error('Invalid production sitemap: too many child sitemaps');
      visited.add(url);
      const sitemap = await request(url, { 'Cache-Control': 'no-cache' }, async (response) => {
        if (response.url && new URL(response.url).origin !== PRODUCTION_URL) {
          throw new Error('Invalid production sitemap: redirected to a foreign origin');
        }
        return sitemapLocations(await response.text());
      });
      locationsRead += sitemap.locations.length;
      if (locationsRead > 2_000) throw new Error('Invalid production sitemap: too many locations');
      for (const location of sitemap.locations) {
        let target: URL;
        try { target = new URL(location); }
        catch { throw new Error('Invalid production sitemap URL'); }
        if (target.origin !== PRODUCTION_URL || target.username || target.password || target.search || target.hash) {
          throw new Error('Invalid production sitemap: foreign or invalid URL');
        }
        if (sitemap.index) {
          if (!visited.has(target.href)) pending.push(target.href);
        } else if (!target.pathname.startsWith('/admin') && !target.pathname.startsWith('/api') &&
          prefixes.some((prefix) => target.pathname.startsWith(prefix) && target.pathname.length > prefix.length)) {
          discovered.add(target.pathname);
        }
      }
    }
    for (const prefix of prefixes) {
      if (![...discovered].some((route) => route.startsWith(prefix))) {
        throw new Error(`Invalid production sitemap: no routes matched ${prefix}*`);
      }
    }
    for (const route of discovered) if (!routes.includes(route)) routes.push(route);
  }

  while (deps.now() < deadline) {
    await assertMain();
    const active = await activeDeployment();
    if (successful(active) && active) {
      await discoverDynamicRoutes();
      for (const route of routes) {
        await request(new URL(route, PRODUCTION_URL).href, { 'Cache-Control': 'no-cache' }, async (response) => {
          verifySmokeResponse(route, response, await response.text(), options.securityHeaders);
        });
      }
      await assertMain();
      const final = await activeDeployment();
      if (!successful(final) || final?.id !== active.id) {
        throw new Error('Release superseded: active production deployment changed during smoke checks');
      }
      return { sha: options.sha, deploymentId: active.id, url: PRODUCTION_URL, routes, elapsedMs: deps.now() - start };
    }
    const candidate = await findCandidate();
    if (candidate && ['failure', 'canceled', 'skipped'].includes(String(candidate.status))) {
      throw new Error(`Production deployment ${candidate.id} ${candidate.status} at ${candidate.stage}`);
    }
    deps.log(`Waiting for production commit ${options.sha}: ${candidate?.status ?? 'not found'}`);
    await deps.sleep(Math.min(options.pollMs ?? 10_000, Math.max(0, deadline - deps.now())));
  }
  throw new Error('Deployment verification timed out');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!['--sha', '--output', '--routes-file'].includes(key) || !value || value.startsWith('--') || parsed[key]) {
      throw new Error('Usage: bun scripts/ci/verify-deployment.ts --sha <full-sha> --output <file> [--routes-file <json>]');
    }
    parsed[key] = value;
  }
  if (!parsed['--sha'] || !parsed['--output']) throw new Error('--sha and --output are required');
  // A reused workspace must not retain an earlier success artifact after a failed run.
  await rm(parsed['--output'], { force: true });
  const routes: unknown = parsed['--routes-file'] ? JSON.parse(await readFile(parsed['--routes-file'], 'utf8')) : [];
  const result = await verifyDeployment({
    sha: parsed['--sha'],
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
    cloudflareToken: process.env.CLOUDFLARE_API_TOKEN ?? '',
    githubToken: process.env.GH_TOKEN ?? '',
    repository: process.env.GITHUB_REPOSITORY ?? '',
    project: process.env.CLOUDFLARE_PAGES_PROJECT_NAME,
    routes: validateRoutes(routes),
    securityHeaders: parseSecurityHeaders(await readFile('public/_headers', 'utf8')),
  });
  await mkdir(dirname(parsed['--output']), { recursive: true });
  await writeFile(parsed['--output'], `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Verified production ${result.sha}, deployment ${result.deploymentId}, ${result.elapsedMs}ms`);
}
if (import.meta.main) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Deployment verification failed');
    process.exitCode = 1;
  });
}
