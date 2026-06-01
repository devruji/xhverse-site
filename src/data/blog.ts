export const blogToolCtaDefinitions = {
  "scd-design-lab": {
    label: "SCD Design Lab",
    href: "/tools/scd-design-lab",
  },
  "data-platform-maturity-checker": {
    label: "Data Platform Maturity Checker",
    href: "/tools/data-platform-maturity-checker",
  },
  "governance-scorecard": {
    label: "Governance Readiness Scorecard",
    href: "/tools/governance-scorecard",
  },
  "architecture-roulette": {
    label: "Architecture Decision Roulette",
    href: "/tools/architecture-roulette",
  },
  "data-stack-roast": {
    label: "Data Stack Roast",
    href: "/tools/data-stack-roast",
  },
  "sql-deathmatch": {
    label: "SQL Deathmatch",
    href: "/tools/sql-deathmatch",
  },
  "lakehouse-cost-calculator": {
    label: "Lakehouse Cost Calculator",
    href: "/tools/lakehouse-cost-calculator",
  },
  "spark-explained": {
    label: "Spark Explained",
    href: "/tools/spark-explained",
  },
} as const satisfies Record<
  string,
  {
    label: string;
    href: `/tools/${string}`;
  }
>;

export type BlogToolSlug = keyof typeof blogToolCtaDefinitions;
export type RelatedToolCtaVariant = "primary" | "secondary";

export type RelatedToolCta = {
  slug: BlogToolSlug;
  label: string;
  href: `/tools/${string}`;
  variant: RelatedToolCtaVariant;
};

export function createRelatedToolCta(
  slug: BlogToolSlug,
  variant: RelatedToolCtaVariant,
): RelatedToolCta {
  const definition = blogToolCtaDefinitions[slug];
  return {
    slug,
    label: definition.label,
    href: definition.href,
    variant,
  };
}

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  /** Optional syndication link; empty when the piece is site-only. */
  mediumUrl: string;
  readingTime: string;
  /** Full post body (Markdown); used on `/blog/[slug]` and when Supabase is empty. */
  bodyMarkdown: string;
  /** ISO date for structured data dateModified; falls back to publish date. */
  updatedAt?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedToolCtas?: RelatedToolCta[];
};

export const posts: BlogPost[] = [
  {
    slug: "big-table-vs-star-schema",
    title: "Big table vs star schema",
    excerpt:
      "A practical guide to choosing between wide analytical tables, dimensional models, and the hybrid layer that usually survives production.",
    date: "2026-06-01",
    tags: ["data-architecture", "modeling", "lakehouse", "analytics"],
    mediumUrl: "",
    readingTime: "9 min read",
    updatedAt: "2026-06-01",
    coverImageUrl: "/images/blog-big-table-vs-star-schema-cover.webp",
    coverImageAlt:
      "A data architect comparing a wide table and a dimensional star model on a holographic warehouse design board.",
    seoTitle: "Big Table vs Star Schema | Data Modeling Design Patterns",
    seoDescription:
      "Trade-offs, constraints, and design strategy for choosing between big-table analytics models, star schemas, and hybrid semantic layers.",
    relatedToolCtas: [
      createRelatedToolCta("scd-design-lab", "primary"),
      createRelatedToolCta("lakehouse-cost-calculator", "secondary"),
      createRelatedToolCta("architecture-roulette", "secondary"),
    ],
    bodyMarkdown: `A table design is not good because it has fewer joins. It is good when it answers the right questions with the right amount of friction.

The **big table** pattern and the **star schema** pattern usually appear as opposites: one wide table for fast consumption, or a fact table surrounded by dimensions. In real platforms, the useful answer is rarely ideological. Most production systems end up with both, separated by ownership, workload, and semantic risk.

> [!summary]
> This choice is not a style preference. It is a shared-contract decision: where should semantic truth live, and where should convenience live?

> [!check]
> Confirm two governance owners before modeling: one for serving behavior, one for shared semantics.

## The two shapes

A **big table** is a wide, denormalized analytical table. It often contains facts, descriptive attributes, derived flags, and reporting-ready columns in one place. The promise is simple: fewer joins, faster onboarding, and less modeling knowledge required from the consumer.

A **star schema** separates measurements from descriptive context. Facts hold events or transactions. Dimensions hold business entities such as customer, product, store, region, account, membership tier, or date. The promise is also simple: shared meaning, reusable context, and cleaner history.

Both patterns can be correct. They fail for different reasons.

## Why teams like big tables

Big tables reduce the distance between a question and a query. A BI developer can drag columns into a report without joining five objects. A data scientist can sample one table and start profiling. A product analyst can move faster because common attributes are already present.

That speed matters. If every question requires reconstructing joins, filtering logic, and effective-date handling, the platform pushes work downstream. People will build their own extracts anyway, often with less testing and less visibility.

Big tables also work well for stable, narrow analytical surfaces:

- a daily customer snapshot
- an order-level reporting table
- a marketing campaign performance table
- a feature table for model training
- a curated export for one consuming application

The trade-off is that the table starts carrying too many meanings. A column called \`customer_segment\` looks harmless until one dashboard needs the current segment, another needs the segment at purchase time, and a third needs the segment assigned by a campaign model.

The join disappeared, but the semantic decision did not.

> [!warning]
> The more teams reuse a big table, the more dangerous a single ambiguous semantic column becomes.

## Where big tables break

Wide tables are expensive when change is frequent. Every new dimension attribute can require backfills, schema changes, tests, documentation, and downstream validation. If multiple domains use the same table, every team waits behind one surface.

They also duplicate context. Product name, category, brand, department, and lifecycle state may be repeated across millions of rows. Storage can be cheap, but repeated context still affects scan cost, file size, cache behavior, and maintenance.

The deeper issue is **history**. A big table usually has to choose one version of an attribute:

- current customer region
- region at order time
- corrected region after data quality cleanup
- reporting region after reorganization

If the table does not make that choice explicit, users will make it accidentally.

> [!check]
> Before widening a serving table, verify that history intent is explicit:
> - what does this field represent over time,
> - which timeline is authoritative,
> - and who owns historical corrections.

## Why teams choose star schemas

Star schemas force a platform to name the grain, separate measures from context, and make history visible.

The fact table answers: what happened, at what grain, with which keys, and with which measures?

The dimensions answer: what did those keys mean, and which attributes should be reused consistently?

That separation is valuable when the same entities appear across many business processes. Customer, product, store, date, region, and membership tier should not be redefined in every reporting table. A dimensional model creates a shared vocabulary.

It also handles slowly changing attributes more deliberately. If product category or customer tier changes over time, the model can support point-in-time reporting instead of overwriting the past silently.

> [!warning]
> A star schema without clear ownership, tests, and release contracts becomes a maintenance drag, not a governance advantage.

This is where dimensional modeling becomes less about joins and more about governance.

## Where star schemas hurt

Star schemas require discipline. Someone must own dimensions, surrogate keys, conformed attributes, effective dates, and tests. Someone must explain which dimension to use when there are multiple valid views of the same entity.

The model can also feel slow to consumers who just need a quick answer. A well-designed star schema is easy to query, but it still asks the user to understand grain and joins. If the semantic layer is weak, every report becomes a modeling exercise.

There is also a platform cost. More tables mean more objects to document, monitor, test, secure, and evolve. If the organization does not have clear ownership, a star schema can become a museum of half-trusted dimensions.

The pattern is not automatically more mature. It only becomes mature when the operating model supports it.

> [!decision]
> Use this rule: if the same entity appears across teams and reports, prioritize dimensions. If one team owns one clear reporting workflow, a serving table can be a stronger first choice.

## A practical model comparison

| Dimension | Big table | Star schema |
| --- | --- | --- |
| Primary risk | Semantic overload in one contract | Slow adoption if ownership is weak |
| Shared entities | Repeated context and duplicate logic | Reused, governed definitions |
| Time behavior | Requires explicit conventions for point-in-time columns | Handles history through temporal patterns |
| Consumer speed | Fast for fixed workflows | Fast after semantic model is explained |
| Governance overhead | Lower object count, higher semantic risk | Higher object count, lower semantic risk |
| Best fit when | Workflows are stable and narrow | Entities are reused across domains |

If teams cannot answer all six rows decisively, the table shape is likely not production-ready.

## The decision starts with grain

Before choosing a shape, define the grain.

Grain is the level at which a row means one thing:

- one order line
- one customer per day
- one subscription per billing cycle
- one product per store per week
- one account balance snapshot per month

If the grain is unclear, both patterns fail. A big table becomes a pile of mixed measures. A star schema becomes a set of joins that can multiply rows and distort metrics.

The first design question is not "big table or star schema?" It is "what does one row represent?"

> [!summary]
> Most post-incident recoveries in modeling teams happen when grain is made explicit before SQL patterns are optimized.

## Choose big table when consumption stability matters

A big table is a good choice when the access pattern is narrow, the grain is stable, and the semantic decisions are already settled.

Use it when:

- the table serves one clear workflow
- consumers need speed more than flexibility
- dimensions are simple or change slowly
- history rules are already baked into the grain
- the table can be rebuilt reliably
- the cost of duplicated attributes is acceptable

A big table is especially useful as a **serving layer**. It can sit on top of a cleaner dimensional or normalized layer and package the most common joins for consumption.

In that role, denormalization is not a shortcut. It is a product decision.

## Choose star schema when shared meaning matters

A star schema is a better choice when entities are reused, history matters, and metrics need to survive across many dashboards and teams.

Use it when:

- facts share common dimensions
- analysts need point-in-time reporting
- multiple domains reuse customer, product, store, or account context
- metric definitions must be consistent
- the platform has owners for dimensions and tests
- downstream users can access a semantic layer or clear examples

The star schema earns its keep when the same dimensions reduce repeated logic across the platform.

If every report still creates its own customer logic, the star exists only on paper.

## The hybrid that usually works

In production, the durable design is often layered:

1. Raw and cleaned source-aligned tables preserve lineage.
2. Core facts and dimensions define grain, keys, history, and shared entities.
3. Serving tables package common joins for BI, ML, APIs, or operational use.
4. A semantic layer or metric layer defines business-facing measures.

This gives the platform both control and speed. The star schema protects meaning. The big table protects usability.

The mistake is mixing those responsibilities in one place. A single table should not be the source of truth, the semantic layer, the performance cache, the data science feature set, and the export contract all at once.

## Practical constraints that decide the pattern

The right model depends on constraints, not taste.

Query workload:

- If users repeatedly scan the same joined dataset, a serving big table can reduce cost and latency.
- If users slice many facts by shared dimensions, a star schema keeps reuse cleaner.

History:

- If current-state reporting is enough, a big table is simpler.
- If point-in-time truth matters, dimensions need explicit change strategy.

Ownership:

- If nobody owns dimensions, the star schema will decay.
- If nobody owns serving tables, big tables will become inconsistent extracts.

Change rate:

- Fast-changing attributes favor dimensional boundaries.
- Stable reporting contracts favor wide serving tables.

Security:

- Sensitive attributes are easier to isolate in dimensions.
- Wide tables can accidentally expose more context than a user needs.

Cost:

- Joins are not free.
- Repeated wide attributes are not free either.
- The workload decides which cost matters more.

## A useful design strategy

Start with the business questions and the grain. Then model facts and dimensions where shared meaning or history matters. After that, create big tables only for surfaces that have a clear consumer and a clear service contract.

For each table, write down:

- primary grain
- intended consumers
- history behavior
- owner
- refresh cadence
- expected query pattern
- allowed joins
- sensitive columns
- deprecation path

If a table cannot answer those questions, it is not ready to become a platform contract.

## Mixing patterns without losing control

Mixing big tables and star schemas is healthy when the boundaries are explicit.

A fact table can be the governed measurement layer. Dimensions can carry reusable business context. A wide table can materialize a common reporting view. A semantic layer can hide joins and expose metrics.

The design gets risky when users cannot tell which layer is authoritative.

Use names and documentation that reveal intent:

- \`fact_order_line\`
- \`dim_customer\`
- \`dim_product\`
- \`mart_sales_daily\`
- \`feature_customer_churn_daily\`
- \`reporting_order_line_enriched\`

Names will not save a bad model, but they reduce accidental misuse.

## The real question

The real question is not whether big tables or star schemas are better.

The question is which responsibilities belong in which layer.

Use star schemas to protect shared meaning. Use big tables to package stable consumption paths. Use governance to keep both honest. The platform becomes easier to trust when each table has a job, a grain, and an owner.

When those are missing, every pattern eventually becomes just another table people are afraid to touch.

---

## References

These public references informed the terminology and trade-off framing in this article:

- [Kimball Group: Dimensional Modeling Techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/)
- [Kimball Group: Fact Tables and Dimension Tables](https://www.kimballgroup.com/2003/01/fact-tables-and-dimension-tables/)
- [Microsoft Learn: Understand star schema and the importance for Power BI](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema)
- [Google Cloud: Use nested and repeated fields in BigQuery](https://docs.cloud.google.com/bigquery/docs/best-practices-performance-nested)

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard for technical framing, editorial judgment, and fit with xhverse.`,
  },
  {
    slug: "building-xhverse",
    title: "Building xhverse",
    excerpt:
      "Notes on the design, architecture, and guiding ideas behind this small corner of the web.",
    date: "2026-03-01",
    tags: ["process", "astro", "design"],
    mediumUrl: "https://medium.xhverse.co/building-xhverse",
    readingTime: "6 min read",
    bodyMarkdown: `## Why this site exists

xhverse is a **personal archive**: a stable place on my own domain for projects, writing, and references.

## What I optimized for

- **Clarity** over novelty
- **Fast static delivery** with Astro
- **Honest metadata** and readable structure

## Medium

A longer version of some pieces may also appear on [Medium](https://medium.xhverse.co); this page is the canonical, full-text home when published here.`,
  },
  {
    slug: "images-as-interfaces",
    title: "Images as interfaces",
    excerpt:
      "Thinking about images not just as decoration, but as interactive surfaces for navigation and story.",
    date: "2026-02-14",
    tags: ["visuals", "interaction"],
    mediumUrl: "https://medium.xhverse.co/images-as-interfaces",
    readingTime: "4 min read",
    bodyMarkdown: `## Beyond illustration

Images can do more than illustrate a paragraph. They can **carry hierarchy**, suggest sequence, and invite exploration.

## Quiet interaction

Not every interface needs motion. Sometimes contrast, cropping, and placement are enough to signal *where to look next*.`,
  },
  {
    slug: "fragments-and-worlds",
    title: "Fragments & worlds",
    excerpt:
      "On using tiny textual fragments to suggest larger fictional spaces without fully defining them.",
    date: "2026-01-27",
    tags: ["writing", "worldbuilding"],
    mediumUrl: "https://medium.xhverse.co/fragments-and-worlds",
    readingTime: "5 min read",
    bodyMarkdown: `## Small pieces, large implication

A single line can imply history, geography, or conflict if the reader meets it in the right context.

## Leaving room

Worldbuilding does not require a wiki. **Strategic gaps** often feel more alive than exhaustive explanation.`,
  },
];
