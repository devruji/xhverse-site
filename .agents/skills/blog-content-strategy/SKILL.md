---
name: blog-content-strategy
description: >-
  Use when planning, writing, publishing, or reviewing xhverse blog posts,
  especially posts that need cover images, SEO metadata, related tools, or
  calls to action. Keeps articles practical, static-safe, and connected to
  xhverse tools without adding unnecessary backend dependency.
---

# Blog Content Strategy

Use this skill for xhverse blog articles, article metadata, related tool CTAs,
and cover-image briefs.

## Workflow

1. Start with reader intent: what decision, practice, or implementation problem
   should the reader be able to handle after reading?
2. Before drafting, define the writing brief:
   - document type (`explanation`, `how-to`, `reference`, `lab companion`)
   - target audience
   - desired reader goal
   - scope boundaries
   - compact outline
3. Draft the article metadata before writing the body:
   - `slug`
   - `title`
   - `excerpt`
   - `date`
   - `tags`
   - `readingTime`
   - `seoTitle`
   - `seoDescription`
   - `coverImageUrl`
   - `coverImageAlt`
   - `relatedTools`
4. Shape the reading experience before polishing prose:
   - start with the decision or takeaway
   - use `> [!summary]`, `> [!decision]`, `> [!warning]`, `> [!check]`,
     or `> [!note]` only when they clarify scanning
   - use markdown tables for comparison, constraints, or decision matrices
   - use normal markdown lists for checklists and decision details; article
     styles will render them with symbolic markers
   - keep paragraphs short enough for mobile reading
5. Keep the body practical and peer-facing. Prefer decision frameworks,
   constraints, examples, and trade-offs over generic definitions.
6. Add public references for technical claims and design patterns:
   - prefer primary docs, vendor docs, standards, or widely recognized public
     references
   - do not cite private client work, unreleased systems, or unverifiable claims
   - keep references near the end under `## References`
7. Add a disclosure when AI assists with drafting or editing:
   - use `## Disclosure`
   - state that the article was co-written with an AI agent and reviewed by
     Rujikorn Ngoensaard
8. Add related tool CTAs only when the tool naturally advances the article:
   - SCD or dimensional history topics -> `SCD Design Lab`
   - Platform maturity, ownership, and operating model -> `Data Platform Maturity Checker`
   - Governance, contracts, and metric trust -> `Governance Readiness Scorecard`
   - Architecture trade-off scenarios -> `Architecture Decision Roulette`
   - Cost, scan width, compute sizing -> `Lakehouse Cost Calculator`
   - Query practice -> `SQL Deathmatch`
   - Spark execution concepts -> `Spark Explained`
9. Use lightweight CTA links or cards. Do not embed interactive tools inside
   blog articles.
10. For generated covers, write an image brief that includes subject,
    composition, style, avoid list, and alt text. Do not use readable text in the
    image unless explicitly required.
11. Keep Supabase optional. Static posts must build without Supabase env vars,
    and Supabase-sourced posts without related tool metadata must render safely.

## Related Tool Rules

- Prefer 1 primary CTA and at most 2 supporting CTAs.
- Use internal links with known tool slugs only.
- Keep CTA labels short and action-oriented.
- Do not add lead capture, scripts, inline handlers, or tracking pixels from a
  blog CTA.
- Validate static metadata in `src/data/blog.test.ts`.

## Quality Bar

- The title is specific enough to compete in search without clickbait.
- The excerpt explains the practical value in one sentence.
- The article has clear section headings and short paragraphs.
- SEO metadata preserves xhverse identity and the technical topic.
- Cover image is relevant at thumbnail size and has useful alt text.
- CTAs are useful next actions, not decorative links.
