---
name: document-writer
description: Write technical documentation and blog content for xhverse projects. Use this skill whenever the user asks to write, update, or draft any documentation (README, ADR, changelog, API docs, migration guides) OR blog posts/articles. Trigger it for requests like "write a blog post about X", "update the README", "document this feature", "draft an ADR", "write release notes", or any content creation that needs to match the xhverse voice and project conventions. Also use when the user says "explain this for the docs" or wants to turn technical work into written content.
---

# Document Writer

Write documentation and blog content that matches xhverse conventions: concise, professional, technically credible, no filler.

When starting or reviewing public content, use the repo-local `technical_writer`
sub-agent lens when the current runtime supports repo-local sub-agents. For blog
work, pair it with `blog-content-strategy` before body drafting and before
pre-publish review.

## Two Modes

### Technical Documentation
For README sections, ADRs, changelogs, API docs, migration guides, and inline documentation.

### Blog Content
For articles published on xhverse.co/blog — data architecture, platform engineering, governance, and practical strategy topics.

## Voice & Tone

- **Concise** — every sentence earns its place. Cut filler words, marketing fluff, and generic statements.
- **Professional** — write for peers (senior engineers, architects, tech leads), not for a general audience.
- **Credible** — state what you know, qualify uncertainty, never overclaim. Frame unverified experience as capability areas, not client claims.
- **Minimal** — prefer short paragraphs, clear headings, and whitespace over dense walls of text.
- **Quiet confidence** — no exclamation marks, no "amazing", no hyperbole. Let the content speak.

## Architectural Article Style

Use this mode for senior data-platform articles, especially Medium-style
architecture pieces. Write as a practitioner teaching decision-making through a
concrete feature, pattern, or platform choice, not as a vendor-documentation
summary.

Before drafting from an article brief or template, confirm the concrete topic.
Do not implement a source brief that still has a placeholder topic. Lock the
strongest angle, core thesis, assumption to challenge, practical takeaway,
reader goal, scope boundary, source plan, and cover-image concept first.

The article should answer why the topic matters, what breaks if teams do
nothing, what alternatives exist, why one approach fits, which trade-offs it
creates, when to use it, when to avoid it, and what production operation teaches.
Use short paragraphs, practical examples, decision tables, checklists, and
implementation scenarios. Avoid beginner definitions unless they support a
deeper architecture point.

Preferred structure:
1. Production problem hook.
2. Problem statement with operational and business impact.
3. First-principles explanation.
4. Architecture perspective across warehouse, lakehouse, BI, governance,
   security, cost, and scale where relevant.
5. Design options with benefits, drawbacks, complexity, cost, and operational
   impact.
6. Practical implementation pattern with only necessary code.
7. Trade-off analysis, hidden costs, and common mistakes.
8. Decision framework or checklist.
9. Lessons learned and a non-generic closing takeaway.

Evidence discipline:
- Separate fact, observation, opinion, vendor behavior, and engineering
  judgment.
- Prefer official docs, research, and credible engineering blogs over generic
  community summaries.
- Do not invent private client stories or present unverifiable production
  claims as facts.
- Include a references section when technical claims depend on external
  platform behavior or industry practice.

Cover-image briefs should communicate the article thesis, not just the product.
Prefer architectural metaphors, operational trade-offs, bottlenecks, decision
visualizations, or production scenarios. Avoid product screenshots, logo
collages, generic dashboards, server racks, people at monitors, and AI robots.
Specify main visual, key objects, composition, symbolism, mood, color direction,
alt text, and thumbnail readability.

For xhverse blog covers, default to the established publication style unless the
user asks for a different direction: dark isometric data-architecture
illustration, charcoal background, glassmorphism panels, cyan/teal glow,
restrained amber accents, abstract platform objects, and a clear visual metaphor
for the article thesis. Avoid photorealistic scenes, people, logos, screenshots,
readable text, server racks, AI robots, and decorative gradient blobs. The cover
must remain legible at blog-card thumbnail size and should normally be delivered
as a 16:9 asset under `public/images/`, resized to the existing 960x540 pattern.

## Technical Documentation Rules

### README Updates
- Keep the existing structure; add sections where they logically belong
- Commands in fenced code blocks with shell language tag
- Prerequisites before installation steps
- Link to related docs rather than duplicating content

### Architecture Decision Records (ADRs)
Use this structure:
```
# ADR-NNN: [Title]
**Status:** [Proposed | Accepted | Deprecated | Superseded by ADR-NNN]
**Date:** YYYY-MM-DD
**Context:** What is the issue we're seeing?
**Decision:** What did we decide to do?
**Consequences:** What are the trade-offs?
```

### Changelog Entries
Follow Keep a Changelog format:
- `Added` for new features
- `Changed` for changes in existing functionality
- `Fixed` for bug fixes
- `Removed` for removed features
- `Security` for vulnerability fixes

### Migration Guides
- Start with "What changed" summary
- Include before/after code examples
- List breaking changes explicitly
- End with verification steps

## Blog Content Rules

### Structure
- **Title**: Short, specific, lowercase-friendly (matches xhverse style: "Building xhverse", "Images as interfaces")
- **Excerpt**: One sentence that tells you what the piece is about without clickbait
- **Body**: Markdown with `##` sections. Short sections (3-8 sentences). Use bold for key terms on first use.
- **Tags**: 2-4 lowercase tags from the project's domain (data-architecture, platform, governance, astro, process, etc.)
- **Reading time**: Estimate honestly based on ~200 words/minute

### Content Principles
- Write from direct experience or clear reasoning — not from summaries of other summaries
- One idea per section; if a section tries to do two things, split it
- Use concrete examples over abstract statements
- End pieces with a forward-looking thought, not a generic conclusion
- No "In this article, we will discuss..." style intros

### BlogPost Data Format
When creating blog entries for `src/data/blog.ts`:
```typescript
{
  slug: "kebab-case-title",
  title: "Title case or sentence case",
  excerpt: "One sentence summary.",
  date: "YYYY-MM-DD",
  tags: ["tag1", "tag2"],
  mediumUrl: "",  // empty unless syndicated
  readingTime: "N min read",
  bodyMarkdown: `## First heading\n\nContent...`
}
```

## Quality Checklist

Before delivering any document:
1. No placeholder text ("TODO", "TBD", "Lorem ipsum")
2. No generic marketing language ("cutting-edge", "revolutionary", "best-in-class")
3. No first-person plural unless genuinely representing a team ("we" should mean something specific)
4. Headings form a scannable outline on their own
5. Code examples are syntactically valid and runnable
6. Links point to real, verifiable URLs (or are clearly marked as needing replacement)
