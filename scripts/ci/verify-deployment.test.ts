import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseSecurityHeaders, validateRoutes, verifyDeployment, verifySmokeResponse,
  type Fetcher, type VerificationDependencies, type VerificationOptions } from './verify-deployment';

const SHA = 'a'.repeat(40);
const OLD_SHA = 'b'.repeat(40);
const headers = parseSecurityHeaders(await readFile('public/_headers', 'utf8'));
const options: VerificationOptions = {
  sha: SHA, accountId: 'account', cloudflareToken: 'private-cf-token',
  githubToken: 'private-gh-token', repository: 'owner/repo', securityHeaders: headers,
  timeoutMs: 30_000, pollMs: 10_000,
};
function deployment(sha = SHA, status = 'success', environment = 'production', id = 'expected') {
  return { id, environment, deployment_trigger: { metadata: { commit_hash: sha, branch: 'main' } },
    latest_stage: { name: status === 'success' ? 'deploy' : 'build', status } };
}
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}
function html(route: string, extra = '', overrideHeaders: Record<string, string> = {}): Response {
  const response = new Response(`<html><head><link href="https://xhverse.co${route}" rel="canonical">${extra}</head></html>`,
    { headers: { ...headers, 'content-type': 'text/html; charset=utf-8', ...overrideHeaders } });
  Object.defineProperty(response, 'url', { value: `https://xhverse.co${route}` });
  return response;
}
type Fixture = {
  active?: ReturnType<typeof deployment> | null;
  candidates?: ReturnType<typeof deployment>[];
  main?: string;
};
function harness(fixtures: Fixture[], smoke: (route: string) => Response = html) {
  let now = 0;
  let iteration = 0;
  let projectReads = 0;
  let mainReads = 0;
  const requests: string[] = [];
  const logs: string[] = [];
  const fakeFetch: Fetcher = async (url, init) => {
    requests.push(url);
    assert.ok(init.signal, 'HTTP requests have bounded cancellation');
    const fixture = fixtures[Math.min(iteration, fixtures.length - 1)];
    if (url.startsWith('https://api.github.com/')) {
      mainReads++;
      assert.equal(new Headers(init.headers).get('authorization'), 'Bearer private-gh-token');
      return json({ sha: fixture.main ?? SHA });
    }
    if (url.startsWith('https://api.cloudflare.com/')) {
      assert.equal(new Headers(init.headers).get('authorization'), 'Bearer private-cf-token');
      if (url.includes('/deployments?')) {
        // Observed Pages API contract: 25 entries succeeds; 26 and 100 return HTTP 400.
        if (Number(new URL(url).searchParams.get('per_page')) > 25) {
          return json({ success: false, errors: [{ code: 8000024, message: 'Invalid list options' }] }, 400);
        }
        return json({ success: true, result: fixture.candidates ?? [] });
      }
      projectReads++;
      return json({ success: true, result: { canonical_deployment: fixture.active ?? null } });
    }
    assert.equal(new Headers(init.headers).get('authorization'), null, 'Public requests contain no credentials');
    return smoke(new URL(url).pathname);
  };
  const deps: VerificationDependencies = { fetch: fakeFetch,
    now: () => now, sleep: async (ms) => { now += ms; iteration++; }, log: (message) => logs.push(message) };
  return { deps, requests, logs, counts: () => ({ projectReads, mainReads }) };
}

describe('production deployment verification', () => {
  it('waits for queued deployment, verifies active identity, smokes affected pages, and rechecks state', async () => {
    const test = harness([
      { active: deployment(OLD_SHA), candidates: [deployment(SHA, 'active')] },
      { active: deployment() },
    ]);
    const result = await verifyDeployment({ ...options, routes: ['/cv'] }, test.deps);
    assert.deepEqual(result, { sha: SHA, deploymentId: 'expected', url: 'https://xhverse.co',
      routes: ['/', '/blog', '/tools', '/cv'], elapsedMs: 10_000 });
    assert.deepEqual(test.counts(), { projectReads: 3, mainReads: 3 });
    assert.equal(test.requests.filter((url) => url.includes('/deployments?')).length, 1);
    assert.equal(test.logs.length, 1);
  });
  it('accepts the active rebuild identity for the same commit without selecting an old deployment', async () => {
    const test = harness([{ active: deployment(SHA, 'success', 'production', 'new-rebuild') }]);
    const result = await verifyDeployment(options, test.deps);
    assert.equal(result.deploymentId, 'new-rebuild');
    assert.ok(!test.requests.some((url) => url.includes('/deployments?')));
  });
  it('rejects a failed production build', async () => {
    const test = harness([{ candidates: [deployment(SHA, 'failure')] }]);
    await assert.rejects(verifyDeployment(options, test.deps), /failure at build/);
  });
  for (const label of ['wrong commit', 'preview only', 'no deployment']) {
    it(`times out for ${label} without claiming production success`, async () => {
      const candidate = label === 'wrong commit' ? deployment(OLD_SHA) : deployment(SHA, 'success', 'preview');
      const test = harness([{ active: candidate, candidates: label === 'no deployment' ? [] : [candidate] }]);
      await assert.rejects(verifyDeployment(options, test.deps), /timed out/);
      assert.ok(!test.requests.some((url) => url.startsWith('https://xhverse.co')));
      assert.equal(test.logs.length, 3);
    });
  }
  it('does not treat successful build stage as completed deployment', async () => {
    const active = deployment();
    active.latest_stage.name = 'build';
    const test = harness([{ active, candidates: [active] }]);
    await assert.rejects(verifyDeployment(options, test.deps), /timed out/);
  });
  it('paginates deployment discovery and detects a failure beyond the first page', async () => {
    const test = harness([{ active: deployment(OLD_SHA) }]);
    const original = test.deps.fetch;
    test.deps.fetch = async (url, init) => {
      if (url.includes('/deployments?')) {
        const page = new URL(url).searchParams.get('page');
        return json({ success: true, result: page === '1' ? [deployment(OLD_SHA)] : [deployment(SHA, 'failure')],
          result_info: { total_pages: 2 } });
      }
      return original(url, init);
    };
    await assert.rejects(verifyDeployment(options, test.deps), /failure/);
  });
  it('continues a full supported Pages batch without pagination metadata', async () => {
    const test = harness([{ active: deployment(OLD_SHA) }]);
    const original = test.deps.fetch;
    const pages: string[] = [];
    test.deps.fetch = async (url, init) => {
      if (url.includes('/deployments?')) {
        const query = new URL(url).searchParams;
        assert.equal(query.get('per_page'), '25');
        const page = query.get('page')!;
        pages.push(page);
        return json({ success: true, result: page === '1'
          ? Array.from({ length: 25 }, (_, index) => deployment(OLD_SHA, 'success', 'production', `old-${index}`))
          : [deployment(SHA, 'failure')] });
      }
      return original(url, init);
    };
    await assert.rejects(verifyDeployment(options, test.deps), /failure at build/);
    assert.deepEqual(pages, ['1', '2']);
  });
  it('rejects authentication failures without logging server bodies or credentials', async () => {
    const test = harness([]);
    test.deps.fetch = async () => json({ error: 'private-cf-token' }, 401);
    await assert.rejects(verifyDeployment(options, test.deps), /^Error: Verification request failed: HTTP 401$/);
    assert.deepEqual(test.logs, []);
  });
  it('rejects Cloudflare API success=false', async () => {
    const test = harness([{ active: deployment() }]);
    const original = test.deps.fetch;
    test.deps.fetch = async (url, init) => url.startsWith('https://api.cloudflare.com/')
      ? json({ success: false, errors: [{ message: 'private-cf-token' }] }) : original(url, init);
    await assert.rejects(verifyDeployment(options, test.deps), /^Error: Cloudflare API reported failure$/);
  });
  it('bounds an HTTP request even when the service never responds', async () => {
    const test = harness([{ active: deployment() }]);
    test.deps.fetch = async (_url, init) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new Error('private-gh-token')), { once: true });
    });
    await assert.rejects(verifyDeployment({ ...options, requestTimeoutMs: 5 }, test.deps), /request timed out/);
  });
  it('rejects a superseding GitHub main commit before smoke checks', async () => {
    const test = harness([{ active: deployment(), main: OLD_SHA }]);
    await assert.rejects(verifyDeployment(options, test.deps), /superseded/);
    assert.equal(test.requests.length, 1);
  });
  it('rejects a main commit changed during smoke checks', async () => {
    const test = harness([{ active: deployment() }]);
    const original = test.deps.fetch;
    let mainReads = 0;
    test.deps.fetch = async (url, init) => {
      if (url.startsWith('https://api.github.com/') && ++mainReads === 2) return json({ sha: OLD_SHA });
      return original(url, init);
    };
    await assert.rejects(verifyDeployment(options, test.deps), /superseded/);
  });
  it('rejects a changed active canonical deployment after smoke checks', async () => {
    const test = harness([{ active: deployment() }]);
    const original = test.deps.fetch;
    let projectReads = 0;
    test.deps.fetch = async (url, init) => {
      if (url.startsWith('https://api.cloudflare.com/') && ++projectReads === 2) {
        return json({ success: true, result: { canonical_deployment: deployment(SHA, 'success', 'production', 'replacement') } });
      }
      return original(url, init);
    };
    await assert.rejects(verifyDeployment(options, test.deps), /active production deployment changed/);
  });
  it('rejects missing credentials and abbreviated SHAs before making requests', async () => {
    const test = harness([{ active: deployment() }]);
    await assert.rejects(verifyDeployment({ ...options, cloudflareToken: '' }, test.deps), /Missing CLOUDFLARE_API_TOKEN/);
    await assert.rejects(verifyDeployment({ ...options, sha: 'abcdef' }, test.deps), /full commit SHA/);
    assert.deepEqual(test.requests, []);
  });
});

describe('production smoke checks', () => {
  it('accepts production canonical and all declared security headers', async () => {
    const response = html('/blog');
    verifySmokeResponse('/blog', response, await response.text(), headers);
  });
  const cases: [string, () => Response, RegExp][] = [
    ['HTTP error', () => new Response('failure', { status: 503 }), /HTTP 503/],
    ['wrong canonical URL', () => new Response('<link rel="canonical" href="https://preview.pages.dev/blog">',
      { headers: { ...headers, 'content-type': 'text/html' } }), /wrong canonical/],
    ['noindex meta', () => html('/blog', "<meta content='noindex,nofollow' name='robots'>"), /indexing is disabled/],
    ['noindex header', () => html('/blog', '', { 'x-robots-tag': 'googlebot: noindex' }), /indexing is disabled/],
    ['none robots alias', () => html('/blog', '<meta name="googlebot" content="none">'), /indexing is disabled/],
    ['missing header', () => { const response = html('/blog'); response.headers.delete('x-frame-options'); return response; }, /missing x-frame-options/],
    ['wrong header value', () => html('/blog', '', { 'x-frame-options': 'SAMEORIGIN' }), /unexpected x-frame-options/],
    ['unsafe CSP', () => html('/blog', '', { 'content-security-policy': "default-src 'self'; script-src 'unsafe-eval'" }), /unsafe or incomplete CSP/],
    ['weakened CSP', () => html('/blog', '', { 'content-security-policy': headers['content-security-policy'].replace("object-src 'none'", 'object-src *') }), /unsafe or incomplete CSP/],
    ['extra script origin', () => html('/blog', '', { 'content-security-policy': headers['content-security-policy'].replace("script-src 'self'", "script-src 'self' https://unexpected.supabase.co") }), /unsafe or incomplete CSP/],
    ['duplicate CSP directive', () => html('/blog', '', { 'content-security-policy': `object-src *; ${headers['content-security-policy']}` }), /duplicate CSP directive/],
    ['non HTML content', () => html('/blog', '', { 'content-type': 'application/json' }), /expected HTML/],
    ['duplicate canonical', () => html('/blog', '<link rel="canonical" href="https://xhverse.co/blog">'), /one canonical/],
  ];
  for (const [name, makeResponse, expected] of cases) {
    it(`rejects ${name}`, async () => {
      const bodyResponse = makeResponse();
      const body = await bodyResponse.text();
      assert.throws(() => verifySmokeResponse('/blog', bodyResponse, body, headers), expected);
    });
  }
  it('propagates smoke failure instead of returning successful deployment evidence', async () => {
    const test = harness([{ active: deployment() }], (route) => html(route, '<meta name="robots" content="noindex">'));
    await assert.rejects(verifyDeployment(options, test.deps), /indexing is disabled/);
  });
  it('allows the configured Supabase connect origin to differ from the checked-in generated header', async () => {
    const response = html('/blog', '', { 'content-security-policy': headers['content-security-policy']
      .replace(/https:\/\/[a-z0-9-]+\.supabase\.co/, 'https://production-project.supabase.co') });
    const body = await response.text();
    verifySmokeResponse('/blog', response, body, headers);
  });
  it('rejects redirected response routes', async () => {
    const response = html('/admin');
    const body = await response.text();
    assert.throws(() => verifySmokeResponse('/blog', response, body, headers), /redirected/);
  });
});

describe('dynamic route sitemap discovery', () => {
  const index = (locations: string[]) => `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations
    .map((location) => `<sitemap><loc>${location}</loc></sitemap>`).join('')}</sitemapindex>`;
  const urlset = (locations: string[]) => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations
    .map((location) => `<url><loc>${location}</loc><lastmod>2026-10-11</lastmod></url>`).join('')}</urlset>`;
  function sitemapHarness(documents: Record<string, string>) {
    const test = harness([{ active: deployment() }]);
    const original = test.deps.fetch;
    const fetched: string[] = [];
    test.deps.fetch = async (url, init) => {
      const path = new URL(url).pathname;
      if (path.endsWith('.xml')) {
        fetched.push(path);
        assert.equal(new Headers(init.headers).get('authorization'), null);
        return new Response(documents[path] ?? 'missing', { headers: { 'content-type': 'application/xml' } });
      }
      return original(url, init);
    };
    return { ...test, fetched };
  }
  it('resolves nested indexes, deduplicates generated routes, and never smokes wildcard markers', async () => {
    const test = sitemapHarness({
      '/sitemap-index.xml': index(['https://xhverse.co/nested.xml']),
      '/nested.xml': index(['https://xhverse.co/routes.xml', 'https://xhverse.co/routes.xml']),
      '/routes.xml': urlset(['https://xhverse.co/tools/access-model-simulator',
        'https://xhverse.co/blog/published-article', 'https://xhverse.co/blog/published-article',
        'https://xhverse.co/about', 'https://xhverse.co/admin/blog']),
    });
    const result = await verifyDeployment({ ...options, routes: ['/tools/*', '/blog/*'] }, test.deps);
    assert.deepEqual(result.routes, ['/', '/blog', '/tools', '/tools/access-model-simulator', '/blog/published-article']);
    assert.deepEqual(test.fetched, ['/sitemap-index.xml', '/nested.xml', '/routes.xml']);
    assert.ok(test.requests.includes('https://xhverse.co/blog/published-article'));
    assert.ok(!test.requests.some((url) => url.includes('*') || url.includes('/admin')));
  });
  for (const [label, document, expected] of [
    ['malformed root', '<urlset><url></url>', /Invalid production sitemap/],
    ['malformed entry', '<urlset><url><loc>https://xhverse.co/blog/article</loc><lastmod></url></urlset>', /entry/],
    ['foreign child', index(['https://attacker.test/child.xml']), /foreign/],
    ['foreign page', urlset(['https://attacker.test/blog/article']), /foreign/],
    ['relative page', urlset(['/blog/article']), /sitemap URL/],
    ['no matching article', urlset(['https://xhverse.co/about']), /no routes matched/],
    ['doctype', '<!DOCTYPE sitemap SYSTEM "https://attacker.test/x"><urlset></urlset>', /Invalid production sitemap/],
  ] as const) {
    it(`rejects ${label} before creating successful evidence`, async () => {
      const test = sitemapHarness({ '/sitemap-index.xml': document });
      await assert.rejects(verifyDeployment({ ...options, routes: ['/blog/*'] }, test.deps), expected);
    });
  }
  it('requires matches for every requested prefix', async () => {
    const test = sitemapHarness({ '/sitemap-index.xml': urlset(['https://xhverse.co/blog/article']) });
    await assert.rejects(verifyDeployment({ ...options, routes: ['/blog/*', '/tools/*'] }, test.deps), /no routes matched \/tools/);
  });
  it('rejects a sitemap redirect to a foreign origin', async () => {
    const test = sitemapHarness({});
    const original = test.deps.fetch;
    test.deps.fetch = async (url, init) => {
      if (url.endsWith('.xml')) {
        const response = new Response(urlset(['https://xhverse.co/blog/article']));
        Object.defineProperty(response, 'url', { value: 'https://attacker.test/routes.xml' });
        return response;
      }
      return original(url, init);
    };
    await assert.rejects(verifyDeployment({ ...options, routes: ['/blog/*'] }, test.deps), /foreign origin/);
  });
  it('bounds sitemap fanout and total URL count', async () => {
    const documents: Record<string, string> = { '/sitemap-index.xml': index(Array.from({ length: 21 },
      (_, i) => `https://xhverse.co/child-${i}.xml`)) };
    for (let i = 0; i < 21; i++) documents[`/child-${i}.xml`] = urlset(['https://xhverse.co/blog/article']);
    const test = sitemapHarness(documents);
    await assert.rejects(verifyDeployment({ ...options, routes: ['/blog/*'] }, test.deps), /too many child sitemaps/);
    assert.equal(test.fetched.length, 20);
    const large = sitemapHarness({ '/sitemap-index.xml': urlset(Array.from({ length: 2_001 },
      (_, i) => `https://xhverse.co/blog/article-${i}`)) });
    await assert.rejects(verifyDeployment({ ...options, routes: ['/blog/*'] }, large.deps), /too many locations/);
  });
});

describe('input contracts', () => {
  it('always includes baseline pages and deduplicates affected public routes', () => {
    assert.deepEqual(validateRoutes(['/blog', '/cv', '/cv']), ['/', '/blog', '/tools', '/cv']);
  });
  for (const routes of [null, ['https://attacker.test'], ['//attacker.test'], ['/\\attacker.test'],
    ['/admin/blog'], ['/api/health'], ['/blog?test=true'], ['/blog#title'], ['/blog/*/article'], ['/b*log/*'], [12]]) {
    it(`rejects invalid route input ${JSON.stringify(routes)}`, () => assert.throws(() => validateRoutes(routes)));
  }
  it('parses only the global header section and fails on incomplete contracts', () => {
    assert.equal(headers['x-frame-options'], 'DENY');
    assert.equal(headers['cache-control'], undefined);
    assert.throws(() => parseSecurityHeaders('/*\n  X-Frame-Options: DENY'), /incomplete/);
  });
  it('CLI removes stale success output and exits unsuccessfully when credentials are missing', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'xhverse-verification-'));
    const output = join(directory, 'result.json');
    try {
      await writeFile(output, JSON.stringify({ deploymentId: 'stale-success' }));
      const processResult = spawnSync(process.execPath,
        ['scripts/ci/verify-deployment.ts', '--sha', SHA, '--output', output],
        { encoding: 'utf8', env: { ...process.env, CLOUDFLARE_API_TOKEN: '', CLOUDFLARE_ACCOUNT_ID: '' } });
      assert.equal(processResult.status, 1);
      assert.match(processResult.stderr, /Missing CLOUDFLARE_ACCOUNT_ID/);
      assert.doesNotMatch(processResult.stdout, /Verified production/);
      await assert.rejects(readFile(output), { code: 'ENOENT' });
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
});
