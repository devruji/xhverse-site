---
name: qa-expert
description: Pre-release QA gate for xhverse.co. Use this skill BEFORE every release promotion (development → main). It runs full regression testing, verifies production deployment, checks all pages in both themes, validates SEO/structured data, and compares against the previous release. Block the release if any check fails. Also trigger when the user says "QA this", "is this ready to release", "check production", "verify the deploy", "run regression", or "pre-release check".
---

# QA Expert — Pre-Release Gate

This skill runs before every release promotion from `development` to `main`. It verifies the site works correctly end-to-end before going to production. **Do not create a release PR until this skill passes.**

## When to Run

- Before any `development → main` PR
- After a release deploys (post-deploy verification)
- When asked to "QA", "verify", or "check if ready to release"

## Full Regression Checklist

Execute these checks in order. Stop and report if any CRITICAL check fails.

### Phase 1: Code Verification (Local)

Run the full CI pipeline locally:
```bash
bun run check
```

This executes: typecheck → build → coverage (100%) → E2E (46 checks).

**CRITICAL**: If this fails, stop here. Do not proceed.

### Phase 2: Build Output Inspection

After build, verify the generated output:

```bash
# Check all pages were generated
ls dist/*.html dist/**/*.html 2>/dev/null | wc -l
# Expected: 38 generated static HTML pages in the current release

# Verify _headers file was generated with correct CSP
grep "connect-src" dist/_headers

# Verify sitemap
cat dist/sitemap-index.xml

# Check no sensitive data leaked into dist/
grep -r "SUPABASE_SECRET" dist/ | wc -l
# Expected: 0
```

### Phase 3: Theme System Verification

Start the preview server and verify both themes:

```bash
bun run preview --host 127.0.0.1 --port 4321 &
sleep 2
```

Check production HTML for theme infrastructure:
```bash
# Anti-FOUC script present and NOT mangled by Cloudflare
curl -s http://127.0.0.1:4321 | grep 'data-cfasync="false"' | wc -l
# Expected: 5 on the current homepage

# Theme toggle button exists
curl -s http://127.0.0.1:4321 | grep 'id="theme-toggle"' | wc -l
# Expected: 1

# html.light CSS variables present in stylesheet
curl -s http://127.0.0.1:4321 | grep -oP 'href="/_astro/[^"]*\.css"' | head -1 | xargs -I{} curl -s "http://127.0.0.1:4321{}" | grep -c "html.light"
# Expected: 1+ (minified CSS may collapse repeated selectors)

# No inline onclick handlers (Cloudflare Rocket Loader blocks them)
curl -s http://127.0.0.1:4321 | grep -c 'onclick='
# Expected: 0
```

### Phase 4: All Pages Render (Both Modes)

Verify every page returns 200 and has key elements:

```bash
for page in / /blog /blog/onelake-platform-contract-not-storage /about /cv /gallery /tools /tools/data-platform-maturity-checker /tools/data-product-contract-builder /tools/access-model-simulator /tools/lakehouse-table-layout-advisor /tools/power-bi-semantic-model-doctor /tools/pipeline-recovery-planner; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:4321${page}")
  echo "${page}: ${status}"
done
# All should be 200
```

Check key elements on each page:
```bash
# Homepage: has structured data, theme toggle, footer
curl -s http://127.0.0.1:4321 | grep -c "application/ld+json"
# Expected: 1

# Blog: has article cards
curl -s http://127.0.0.1:4321/blog | grep -c "<article"
# Expected: 1+ (number of posts)

# CV: has PDF link
curl -s http://127.0.0.1:4321/cv | grep -c "supabase.co/storage"
# Expected: 1+
```

### Phase 5: SEO & Structured Data

```bash
# Homepage Person schema
curl -s http://127.0.0.1:4321 | grep -o '"@type":"Person"' | wc -l
# Expected: 1+

# Blog posts have BlogPosting with author
curl -s http://127.0.0.1:4321/blog/onelake-platform-contract-not-storage | grep -o '"@type":"BlogPosting"'
# Expected: 1
curl -s http://127.0.0.1:4321/blog/onelake-platform-contract-not-storage | grep -o '"author"'
# Expected: 1

# OG image is raster (not SVG)
curl -s http://127.0.0.1:4321 | grep -oP 'og:image.*?content="[^"]*"' | grep -v ".svg"
# Should match (PNG or JPG)

# Canonical URLs present
curl -s http://127.0.0.1:4321 | grep 'rel="canonical"'
# Expected: contains xhverse.co

# No accidental noindex on production pages
curl -s http://127.0.0.1:4321 | grep -c "noindex"
# Expected: 0 (production should not noindex)
```

### Phase 6: Security Headers

```bash
# Verify _headers has all required security headers
headers=$(cat dist/_headers)
echo "$headers" | grep -q "X-Frame-Options: DENY" && echo "PASS: X-Frame-Options" || echo "FAIL"
echo "$headers" | grep -q "X-Content-Type-Options: nosniff" && echo "PASS: XCTO" || echo "FAIL"
echo "$headers" | grep -q "Strict-Transport-Security" && echo "PASS: HSTS" || echo "FAIL"
echo "$headers" | grep -q "Content-Security-Policy" && echo "PASS: CSP" || echo "FAIL"
echo "$headers" | grep -q "connect-src" && echo "PASS: CSP connect-src" || echo "FAIL"
```

### Phase 7: Shared Components Consistency

Verify all pages use the same shared components (no inline duplicates):

```bash
# All pages should use the shared Header (check for xhverse.co subtext)
for page in / /blog /about /cv /gallery; do
  has_header=$(curl -s "http://127.0.0.1:4321${page}" | grep -c "xhverse.co")
  echo "${page} header: ${has_header}"
done
# All should be 1+

# All pages should have the shared Footer
for page in / /blog /about /cv /gallery; do
  has_footer=$(curl -s "http://127.0.0.1:4321${page}" | grep -c "Rujikorn Ngoensaard. All rights reserved")
  echo "${page} footer: ${has_footer}"
done
# All should be 1
```

### Phase 8: Production Deployment Verification (Post-Deploy)

After the release is merged and deployed to Cloudflare:

```bash
# Verify production responds
curl -s -o /dev/null -w "%{http_code}" https://xhverse.co
# Expected: 200

# Verify production has the latest CSS (check for html.light rules)
CSS_URL=$(curl -s https://xhverse.co | grep -oP 'href="/_astro/[^"]*\.css"' | head -1 | sed 's/href="//' | sed 's/"//')
curl -s "https://xhverse.co${CSS_URL}" | grep -c "html.light"
# Expected: 1+ (minified CSS may collapse repeated selectors)

# Verify scripts aren't blocked by Rocket Loader
curl -s https://xhverse.co | grep -c 'type=".*text/javascript"'
# Expected: 0 (no mangled type attributes)

# Verify theme toggle script runs (not deferred)
curl -s https://xhverse.co | grep 'data-cfasync="false"' | grep -c "addEventListener\|initThemeToggle\|initPageEffects\|localStorage"
# Expected: 5 on the current homepage

# Check response headers from Cloudflare
curl -sI https://xhverse.co | grep -i "x-frame-options\|strict-transport\|content-security-policy"
# Should show security headers
```

## Output Format

```markdown
# QA Report: Pre-Release v[X.Y.Z]

## Summary
- Status: PASS / FAIL
- Date: YYYY-MM-DD
- Commits since last release: N
- Pages tested: N/N

## Phase Results
| Phase | Status | Notes |
|-------|--------|-------|
| 1. Code verification | PASS/FAIL | |
| 2. Build output | PASS/FAIL | |
| 3. Theme system | PASS/FAIL | |
| 4. All pages render | PASS/FAIL | |
| 5. SEO & structured data | PASS/FAIL | |
| 6. Security headers | PASS/FAIL | |
| 7. Component consistency | PASS/FAIL | |
| 8. Production deploy | PASS/FAIL or PENDING | |

## Issues Found
- [ ] Issue description — severity — how to fix

## Release Decision
- APPROVE: All phases pass, safe to release
- BLOCK: [reason] — must fix before release
```

## Known Gotchas (from past incidents)

These are issues that have broken production before — always verify:

1. **Cloudflare Rocket Loader**: Rewrites script `type` attributes. All `<script is:inline>` must have `data-cfasync="false"`.
2. **View Transitions reinit**: `astro:page-load` must be used for all DOM initialization scripts.
3. **CSS opacity:0 on scroll elements**: Must use progressive enhancement (`.will-animate` added by JS, not CSS default).
4. **Inline onclick handlers**: Blocked by Rocket Loader. Use `addEventListener` in `data-cfasync="false"` scripts instead.
5. **SVG OG images**: Social platforms can't render them. Must be raster PNG.
6. **`/tools` exists**: The tools index should return 200 and link to all 13 live tools.
7. **CV page inline footer**: Must use shared `<Footer />` component, not inline HTML.
8. **AWS logo dual-theme**: Needs both `aws.png` (light) and `aws-dark.png` (dark), no CSS invert hack.
