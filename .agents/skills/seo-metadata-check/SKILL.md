---
name: seo-metadata-check
description: >-
  Use this when reviewing or planning SEO improvements for xhverse pages,
  especially metadata, heading hierarchy, branded search queries, canonical
  identity signals, structured data, internal links, sitemap/robots signals, or
  Search Console follow-up.
---

# Goal
Improve how search engines understand xhverse pages without overpromising
ranking outcomes.

# When To Use
- Branded-query work for `bossruji`, `Rujikorn Ngoensaard`, `xhverse`, or
  `xhverse co`.
- SEO reviews for homepage, About, CV, blog index, blog posts, tools, services,
  or profile-related copy.
- Changes to titles, descriptions, canonical URLs, robots/noindex behavior,
  sitemap output, OG/Twitter cards, JSON-LD, profile links, or public identity
  wording.
- Pre-release SEO checks when QA finds metadata, heading, indexing, or
  structured-data risk.

# Evidence First
1. Inspect the current page source or built HTML for the affected URLs.
2. Check the repo sources that generate SEO output:
   - `src/layouts/BaseLayout.astro`
   - `src/data/seo.js`
   - `src/data/site.ts`
   - `src/data/profile.ts`
   - affected `src/pages/**/*.astro`
   - `public/robots.txt`
   - Astro sitemap configuration in `astro.config.mjs`
3. For live ranking symptoms, treat Google results as external, delayed, and
   personalized. Use current search results only as directional evidence.
4. Prefer Google Search Console evidence when available: indexed canonical,
   last crawl, sitemap status, impressions, average position, queries, and
   pages. If Search Console is not available, say so and continue from repo and
   public-source evidence.
5. Use Google Search Central guidance as the source of truth for Search-specific
   behavior. Do not rely on generic SEO folklore.

# Review Checklist
1. Titles are descriptive, concise, page-specific, and not keyword-stuffed.
2. Descriptions are unique, human-readable summaries of the page, not keyword
   lists.
3. The visible H1/main hero title aligns with the page title and search intent.
4. Heading hierarchy is coherent and has one clear H1.
5. Canonical URLs resolve to `https://xhverse.co` for production pages.
6. Preview or non-production deployments remain `noindex`.
7. `robots.txt` points at the production sitemap and does not block important
   public pages.
8. Sitemap generation covers the public pages that should be indexed.
9. JSON-LD is visible-content aligned and uses the most specific useful types.
10. Person identity fields preserve `Rujikorn Ngoensaard`, `bossruji`, `XH`, and
    `xhverse` where relevant.
11. `sameAs` points to stable public profiles controlled by the owner.
12. Internal links help Google and users connect homepage, About, CV, blog,
    services, and high-value tools.
13. Public copy reinforces the real identity and expertise without repeating the
    same keywords unnaturally.
14. OG/Twitter images are crawlable production URLs when used in metadata.

# Branded Search Playbook
For branded-query ranking issues, evaluate in this order:
1. Homepage: title, description, H1, first paragraph, Person/WebSite JSON-LD,
   canonical URL, and prominent profile links.
2. About and CV pages: confirm they explicitly connect `Rujikorn Ngoensaard`,
   `XH`, `bossruji`, and `xhverse.co`.
3. Site-level signals: `site.webmanifest`, `humans.txt`, sitemap, robots,
   canonical URLs, and public social/profile links.
4. Internal links: make sure the homepage links to About/CV/Writing/Services in
   a way that reinforces the identity graph.
5. Off-site actions: Search Console URL inspection, sitemap submission, profile
   links from GitHub/LinkedIn/Medium, and consistent public bios. These require
   user-owned external accounts and should be listed as follow-up, not coded.

# What Not To Do
- Do not promise a specific Google rank or timeline.
- Do not keyword-stuff titles, headings, hidden text, alt text, or JSON-LD.
- Do not add misleading schema for content not visible on the page.
- Do not expose private backend, storage, admin, or contact details for SEO.
- Do not mark preview deployments indexable to chase temporary rankings.
- Do not add new analytics, tracking, or external SEO tools without explicit
  approval.

# Output
- Current evidence and uncertainty
- Must-fix issues
- Recommended implementation scope
- External follow-up for the user, if any
- Verification commands or browser checks
