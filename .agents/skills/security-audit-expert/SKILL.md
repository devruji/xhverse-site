---
name: security-audit-expert
description: Full-stack security audit and enforcement for xhverse.co. Use this skill before any release, when the user mentions security, vulnerabilities, secrets, CSP, OWASP, XSS, injection, RLS policies, dependency audit, privacy, GDPR, or data exposure. Also trigger when asked to "check for security issues", "audit the code", "is this safe to deploy", or "review security headers". This skill blocks critical/high issues from releasing and creates GitHub issues for medium/low findings to track resolution.
---

# Security Audit Expert

Security review covering application security, infrastructure hardening, and privacy. Critical/high findings block release merge; medium/low findings track resolution. Follow `docs/agents/validation.md` for change scope and reusable evidence. A draft release PR may collect merge-candidate CI before the gate finishes.

Inspect the actual diff and existing evidence once. Unchanged read-only review runs no automatic runtime checks; guidance-only work validates documents/surfaces and checks the diff for secrets. Scope the audit phases below to affected trust boundaries, broadening for auth, shared, dependency or platform changes. Evidence records checked revision or dirty fingerprint including relevant untracked inputs, environment/tool versions, commands and results. Repeat affected checks when inputs/environment change, evidence is missing or a failure remains unresolved.

Refresh dependency advisories for every application release even when the lockfile is unchanged: advisory data can change independently of Git. Report lookup failure as an unverified security gate; never hide it behind a passing fallback. QA and security must pass before merge.

## Audit Phases

Use the relevant phases for the change and record omitted areas with reasons. Stop and report immediately if a CRITICAL finding is discovered.

### Phase 1: Secrets & Credential Exposure

```bash
# Check for hardcoded secrets in source
grep -rn "SUPABASE_SECRET\|SECRET_KEY\|password\|api_key\|token" src/ --include="*.ts" --include="*.js" --include="*.astro" | grep -v "test\|\.env\|example\|import.meta.env"

# Check .env files aren't tracked
git ls-files | grep -i "\.env" | grep -v "\.example"

# Check dist/ for leaked secrets
grep -rn "SUPABASE_SECRET\|eyJ" dist/ 2>/dev/null

# Check if service role key could be in client bundle
grep -rn "SUPABASE_SECRET_KEY" src/ | grep -v "import.meta.env\|test"
```

**What to flag:**
- Any hardcoded credential → CRITICAL
- `.env` or `.env.local` tracked in git → CRITICAL
- Service role key accessible client-side → CRITICAL
- API keys in client-visible code without `PUBLIC_` prefix → HIGH

### Phase 2: Content Security Policy (CSP)

Check both layers (they must be aligned):
1. `public/_headers` (Cloudflare edge)
2. `src/layouts/BaseLayout.astro` (meta tag)

**Verify:**
- `default-src 'self'` present
- `script-src` includes `'self' 'unsafe-inline'` (required for Astro)
- `connect-src` only allows known origins (Supabase project URL)
- `object-src 'none'` (blocks plugins)
- `frame-ancestors 'none'` (prevents clickjacking)
- No `'unsafe-eval'` (XSS vector)
- Both layers match (diff them)

```bash
# Compare CSP in _headers vs BaseLayout
grep "Content-Security-Policy" public/_headers
grep "Content-Security-Policy" src/layouts/BaseLayout.astro
```

### Phase 3: OWASP Top 10 for Static Sites

#### A01: Broken Access Control
- Check Supabase RLS policies: every table must have RLS enabled
- Verify anon role has minimal permissions (insert-only on submissions, select-only on benchmarks)
- Check no `SECURITY DEFINER` functions expose data to anon

```bash
# Review migrations for RLS
grep -n "enable row level security\|create policy\|SECURITY DEFINER" supabase/migrations/*.sql
```

#### A02: Cryptographic Failures
- HSTS with `includeSubDomains; preload` in `_headers`
- `upgrade-insecure-requests` in CSP
- No HTTP-only resources referenced

#### A03: Injection
- Check `set:html` usage in Astro templates (XSS vector if user input)
- Verify `sanitize-html` is used for markdown rendering
- Check Supabase queries use parameterized inputs (not string concatenation)

```bash
# Find set:html usage (potential XSS)
grep -rn "set:html" src/ --include="*.astro"

# Verify sanitization
grep -rn "sanitize\|sanitizeHtml" src/lib/
```

#### A05: Security Misconfiguration
- Check response headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Verify no directory listing enabled
- Check `robots.txt` doesn't expose sensitive paths
- Verify preview deploys are noindexed

#### A06: Vulnerable Components
```bash
# Refresh known dependency advisories for application releases; preserve output/exit status
bun audit
```

#### A07: Authentication Failures
- If auth exists: check session handling, token storage, logout
- Verify Supabase auth config (if used)
- Check no auth bypass in RLS policies

### Phase 4: Infrastructure Security

#### Cloudflare
- HTTPS enforced (Always Use HTTPS)
- TLS 1.2+ minimum
- No exposed admin panels
- WAF rules appropriate
- Rate limiting on form submissions

#### Supabase
- RLS enabled on ALL tables
- Service role key NEVER in client code
- Anon key permissions are minimal
- Storage bucket policies reviewed
- No public read on sensitive buckets

```bash
# Check storage policies in migrations
grep -n "storage\|bucket" supabase/migrations/*.sql
```

#### DNS
- DNSSEC enabled
- No dangling CNAME records
- SPF/DKIM/DMARC for email domain

### Phase 5: Privacy & Compliance

#### GDPR / Data Collection
- What personal data is collected? (maturity checker: contact_email optional)
- Is there a privacy policy page?
- Are cookies used? If so, is there consent?
- Can users request data deletion?
- Is data retention defined?

#### Third-Party Services
- List all external domains in CSP `connect-src`
- Check for tracking scripts (Google Analytics, Meta Pixel, etc.)
- Verify no unauthorized data sharing

#### Data Minimization
- Is the contact_email field truly optional?
- Are anonymous submissions truly anonymous (no IP logging in RLS)?
- Is benchmark data aggregated (not exposing individual submissions)?

### Phase 6: Dependency Audit

```bash
# List all dependencies
cat package.json | jq '.dependencies, .devDependencies'

# Refresh known advisories; retain output/exit status and report lookup failures
bun audit

# Inspect update availability; preserve errors and review maintenance separately
bun outdated
```

**Flag:**
- Dependencies with known CVEs → HIGH
- Unmaintained packages (>2 years without update) → MEDIUM
- Packages with excessive permissions → MEDIUM

## Severity Classification

| Severity | Criteria | Action |
|----------|----------|--------|
| CRITICAL | Active exploit possible, data exposure, credential leak | **BLOCK RELEASE** — fix immediately |
| HIGH | Significant vulnerability, missing essential protection | **BLOCK RELEASE** — fix before deploy |
| MEDIUM | Defense-in-depth gap, best practice violation | Create GitHub issue, fix within 1 sprint |
| LOW | Minor hardening opportunity, informational | Create GitHub issue, fix when convenient |

## Output Format

```markdown
# Security Audit Report

**Date:** YYYY-MM-DD
**Scope:** [what was audited]
**Verdict:** BLOCK / PASS

## Critical Findings
- [ ] Finding — Impact — File:line — Fix

## High Findings
- [ ] Finding — Impact — File:line — Fix

## Medium Findings
- [ ] Finding — Impact — Recommendation

## Low Findings
- [ ] Finding — Recommendation

## Passed Checks
- What's already secure (reinforces good patterns)

## Compliance Status
| Area | Status | Notes |
|------|--------|-------|
| CSP | PASS/FAIL | |
| HSTS | PASS/FAIL | |
| RLS | PASS/FAIL | |
| Secrets | PASS/FAIL | |
| Dependencies | PASS/FAIL | |
| Privacy | PASS/FAIL | |
```

## Enforcement Integration

### Pre-Release (integrates with qa-expert)
If any CRITICAL or HIGH finding exists:
1. Set verdict to **BLOCK**
2. List specific fixes required
3. Do NOT merge the release PR. A draft may remain open to collect candidate CI evidence.

### Issue Tracking (MEDIUM/LOW)
For medium and low findings, create GitHub issues:
```bash
gh issue create --title "Security: [finding title]" --body "[details + fix recommendation]" --label "security"
```

## Production evidence

Report deployment success only after the expected main commit is the active successful Cloudflare production deployment and public route, indexing/canonical and security-header smoke checks pass. Missing credentials, API failure, timeout or supersession cannot pass. Guidance-only promotions require no deployment. See `docs/agents/validation.md`.

## Known Good Patterns in This Project

- CSP enforced at two layers (edge + meta)
- RLS on all Supabase tables
- Service role key only used at build time (`import.meta.env` server-only)
- HTML sanitization on markdown rendering (`sanitize-html`)
- Supabase anon key with minimal RLS permissions
- HSTS with preload
- No inline event handlers (Cloudflare Rocket Loader safe)
