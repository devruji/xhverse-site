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
    slug: "open-table-formats-operating-model",
    title: "Open table formats are an operating model decision",
    excerpt:
      "Delta, Iceberg, and Hudi are not just file formats. They change who owns metadata, how tables are maintained, and where lock-in appears.",
    date: "2026-06-02",
    tags: [
      "data-architecture",
      "lakehouse",
      "governance",
      "platform",
    ],
    mediumUrl: "",
    readingTime: "8 min read",
    updatedAt: "2026-06-02",
    coverImageUrl: "/images/blog-open-table-formats-operating-model-cover.jpg",
    coverImageAlt:
      "Abstract lakehouse control room with metadata layers, storage blocks, and operating panels for open table format decisions.",
    relatedToolCtas: [
      createRelatedToolCta("architecture-roulette", "primary"),
      createRelatedToolCta("governance-scorecard", "secondary"),
      createRelatedToolCta("lakehouse-cost-calculator", "secondary"),
    ],
    bodyMarkdown: `Open table format debates usually sound like tech theater. Teams compare features on a slide, then discover the hard part is the contract they just signed by choosing a format.

Formats matter, but they also encode assumptions that your platform team must operate every day: metadata behavior, maintenance ownership, evolution constraints, and support boundaries.

## Why format choice is an operating model

If the table is a shared platform object, the format determines:

- who can safely reason about schema and partition changes,
- how quickly teams can repair corruption,
- which team owns table health,
- what cross-engine support actually works in practice,
- and which incidents count as infrastructure versus data mistakes.

When we say open table format, we are usually choosing a pattern for shared operating behavior before choosing a SQL syntax.

## Metadata and control plane: more than a pointer file

**Delta Lake** stores transactional history in a JSON-based log. The protocol and feature matrix are not just implementation details:

- protocol versions affect which features are legal in your runtime,
- table features can silently split compatibility between engines,
- and upgrade paths depend on which readers your cluster team still has to support.

Delta UniForm is a concrete example. It improves interoperability, but only when your table feature set and runtime versions stay aligned.

**Apache Iceberg** builds a control structure from snapshots and manifests. Good for visibility, but operationally it adds a set of state objects you must care for with intent.

**Apache Hudi** uses table services and timelines, so your maintenance model includes explicit lifecycle steps rather than only append/compaction decisions.

## Table maintenance is now part of your service model

In all three formats, maintenance is not optional:

- Delta relies on compacting and vacuuming as part of normal operations.
- Iceberg requires periodic rewrite/maintenance behavior to prevent metadata and file bloat.
- Hudi expects compaction, cleaning, and clustering planning to preserve read cost and correctness.

A platform team that treats this as a one-time setup task quickly inherits backlog from every ingestion owner.

## Schema, partition, and protocol evolution

Most outages are not from wrong SQL; they are from unmanaged evolution. With shared tables, you need governance around:

- partitioning policy (including evolution strategy),
- schema compatibility windows,
- protocol changes in Delta,
- and rollback/repair behavior your job scheduler can explain under pressure.

Delta has protocol and features, Iceberg has snapshot and metadata evolution, and Hudi has timeline-driven evolution patterns. Same surface problem, different control knobs.

## Interoperability without illusions

No engine supports all corner cases equally. Query engine drift is a real thing: the same table can behave differently across engines because of parser, planning, or feature support variance.

You do not need to avoid open formats for this reason. You need explicit compatibility contracts:

- what read/write features are required,
- what fallback options are allowed,
- what happens when one engine misses a feature set.

## Performance failure modes and lock-in beyond Parquet

Everyone expects file-level performance. Real incidents happen in metadata paths:

- snapshot/log growth causing planning delay,
- manifest drift causing unnecessary scan overhead,
- compaction lag creating too many small files,
- and cleanup debt causing query instability.

These are still lock-in problems beyond simply staying on a format like Parquet. They may not be vendor lock-in; they can be runbook lock-in if you do not define clear ownership and cost model.

## Governance, security, and support boundaries

Treat open table formats as product decisions with clear ownership:

- platform team owns feature/reader policy,
- domain teams own data quality and evolution requests,
- platform SRE owns operational cadence and alerting,
- leaders own the explicit cost of incident ownership.

When everyone agrees on this, table format debates get easier and incidents cheaper.

## Related tools

- Try [Architecture Decision Roulette](/tools/architecture-roulette) to compare operating assumptions under different trade-offs.
- Validate team readiness using [Governance Readiness Scorecard](/tools/governance-scorecard).
- Estimate maintenance and compute trade-offs with [Lakehouse Cost Calculator](/tools/lakehouse-cost-calculator).

## References

- [Delta Lake documentation](https://docs.delta.io/)
- [Delta Lake UniForm](https://docs.delta.io/delta-uniform/)
- [Apache Iceberg documentation](https://iceberg.apache.org/docs/latest/)
- [Apache Iceberg maintenance](https://iceberg.apache.org/docs/1.4.1/maintenance/)
- [Apache Hudi overview](https://hudi.apache.org/docs/overview/)
- [Apache Hudi compaction](https://hudi.apache.org/docs/compaction/)
- [Apache Hudi cleaning](https://hudi.apache.org/docs/cleaning/)

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard.
`,
  },
  {
    slug: "real-cost-open-tables",
    title: "The real cost of open tables",
    excerpt:
      "Open formats move cost from one place to another. The winning teams track metadata health, compaction debt, and ownership load as first-class operating costs.",
    date: "2026-06-02",
    tags: ["lakehouse", "performance", "platform", "operations"],
    mediumUrl: "",
    readingTime: "7 min read",
    updatedAt: "2026-06-02",
    coverImageUrl: "/images/blog-real-cost-open-tables-cover.jpg",
    coverImageAlt:
      "Hundreds of small data-file tiles being compacted into organized table blocks with metadata and maintenance overlays.",
    relatedToolCtas: [
      createRelatedToolCta("lakehouse-cost-calculator", "primary"),
      createRelatedToolCta("spark-explained", "secondary"),
    ],
    bodyMarkdown: `Open table formats remove one class of storage cost argument, but they do not remove operational cost. They relocate it into metadata health, file layout, maintenance jobs, and ownership.

That is a good move when teams intentionally budget for it. It is expensive when teams assume the format choice itself is the full cost model.

## The new recurring cost buckets

### Small file handling

Small file pressure is the most common tax. Ingesting too fast or too fragmented creates thousands of tiny objects. Without compaction or clustering discipline, query performance degrades and your job runtimes become noisy and expensive.

## Snapshot, log, and manifest growth

Every table format tracks history differently:

- Delta keeps transaction logs and checkpoints.
- Iceberg has snapshots and manifests.
- Hudi tracks timeline actions.

Growth in these state layers is expected. Unmanaged growth is not.

## Retention, vacuum, expire, and orphan cleanup

You need to define retention windows and enforce them.

- Delta: VACUUM for stale file cleanup, with retention policy aligned to replay requirements.
- Iceberg: snapshot expiration and orphan file removal, plus periodic manifest rewrites for consistent planning.
- Hudi: compaction, cleaning, and clustering as part of the table service budget.

## Query engine drift and rewrite overhead

Multiple engines on the same table means your optimization settings are never purely a storage problem. You must monitor:

- read amplification,
- metadata cache misses,
- manifest/log bloat,
- and write/read latency shifts after schema or partition changes.

When one engine writes to one table and another reads, the team should assume ongoing compatibility work, not one-time setup.

## What to monitor

Track at least:

- file sizes and compaction age,
- stale snapshots/log checkpoints,
- small file ratio,
- orphan and undeleted file growth,
- queue lag in maintenance jobs,
- and ownership response times for table incidents.

## Who owns table health

If no one owns maintenance, no one owns cost. If no one owns cost, nobody owns incidents.

Create a small matrix per domain:

- domain owner: schema and business contract,
- platform owner: maintenance and feature policy,
- incident owner: on-call escalation.

## Small checklist

1. Set table-level compaction and retention policy before onboarding the first producer.
2. Decide retention and snapshot/orphan cleanup jobs by default, not per team.
3. Validate read/write feature compatibility across engines before production launch.
4. Add maintenance debt metrics to every platform health dashboard.
5. Assign a clear owner when metadata or maintenance deviates from expected behavior.

## Related tools

- Estimate this cost using [Lakehouse Cost Calculator](/tools/lakehouse-cost-calculator).
- Refresh engine-level intuition with [Spark Explained](/tools/spark-explained).

## References

- [Delta Lake documentation](https://docs.delta.io/)
- [Apache Iceberg documentation](https://iceberg.apache.org/docs/latest/)
- [Apache Iceberg maintenance](https://iceberg.apache.org/docs/1.4.1/maintenance/)
- [Apache Hudi overview](https://hudi.apache.org/docs/overview/)
- [Apache Hudi compaction](https://hudi.apache.org/docs/compaction/)
- [Apache Hudi cleaning](https://hudi.apache.org/docs/cleaning/)

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard.
`,
  },
  {
    slug: "envelope-encryption-data-platforms",
    title: "Envelope encryption for data platforms",
    excerpt:
      "Most teams adopt envelope encryption to scale security, then keep treating key management like an afterthought. This breaks quickly under shared-platform operating pressure.",
    date: "2026-06-02",
    tags: ["security", "governance", "platform", "encryption"],
    mediumUrl: "",
    readingTime: "7 min read",
    updatedAt: "2026-06-02",
    coverImageUrl: "/images/blog-envelope-encryption-data-platforms-cover.jpg",
    coverImageAlt:
      "Layered data platform vault showing data-key capsules, a central key boundary, and separated storage and workload zones.",
    relatedToolCtas: [
      createRelatedToolCta("governance-scorecard", "primary"),
      createRelatedToolCta("architecture-roulette", "secondary"),
      createRelatedToolCta("data-platform-maturity-checker", "secondary"),
    ],
    bodyMarkdown: `Most data platforms do not fail because AES is weak.

Most fail because too many systems can decrypt too much data with too little control.

Envelope encryption is the practical way to keep encryption usable at platform scale. It is not a promise that decryption is impossible. It is a framework to reduce blast radius.

## The key stack: DEK, CEK, KEK, and KMS

In practical terms:

- **DEK/CEK** protects actual data at rest.
- **KEK** (or CMK, depending on provider language) protects DEKs in a central key service.
- **KMS** keeps keys in a central policy boundary.
- **Wrapping** means the DEK is encrypted by a key from the KMS and stored alongside data metadata.

This is good because you do not need to re-encrypt all stored data every time you rotate a top-level key.

## Why symmetric encryption plus central KMS

Symmetric encryption at storage/service layers stays fast and manageable. The KMS adds centralized control: audit, lifecycle, and separation between storage operators and key operators. The result is better than embedding keys per service, as long as governance is explicit.

## Rotation: rewrap vs full re-encryption

Rotation confusion causes many false incidents.

- If you rotate KEK with wrapped DEKs, you often only need rewrap operations.
- If crypto policy requires algorithmic upgrades, some cases still require data re-encryption.

Treat this as an operating decision, not just a compliance checkbox.

## Where plaintext still appears

Envelope encryption protects stored bytes. Plaintext still appears in memory and in authorized compute paths. Anyone with strong workload access can still process plaintext if access controls are weak.

So security still depends on workload isolation, short-lived credentials, and strict authorization.

## KMS audit logs are not full data access proof

Key usage logs are important. They are also incomplete.

An API call can prove a key was requested. It does not prove which app instance requested the decrypted payload, what transformation happened afterward, or whether least-privilege policy was enforced end-to-end.

## DEK granularity and boundaries

Fine-grained DEKs reduce impact when one dataset segment is rekeyed or revoked. Coarse DEKs increase operational convenience and increase blast radius. You need to choose based on risk profile, not simplicity alone.

## Storage-layer vs application-layer

Storage-layer encryption covers object confidentiality at rest and key rotation mechanics. Application-layer encryption can constrain exposure in memory and application-specific flows, but it increases engineering complexity and key-carrying paths.

Neither layer alone is enough.

## What envelope encryption does not solve

It does not replace authorization.

It does not replace tokenization, masking, row-level permissions, or network segmentation.

It does not prevent misuse by an authorized user or application that legitimately has access. Envelope encryption limits what happens after a boundary breach.

## Related tools

- Measure governance posture with [Governance Readiness Scorecard](/tools/governance-scorecard).
- Test operating decisions with [Architecture Decision Roulette](/tools/architecture-roulette).
- Run a quick baseline check in [Data Platform Maturity Checker](/tools/data-platform-maturity-checker).

## References

- [AWS KMS cryptographic details](https://docs.aws.amazon.com/kms/latest/developerguide/kms-cryptography.html)
- [Google Cloud KMS envelope encryption](https://cloud.google.com/kms/docs/envelope-encryption)
- [Azure Storage client-side encryption](https://learn.microsoft.com/en-us/azure/storage/blobs/client-side-encryption)
- [NIST KEK glossary](https://csrc.nist.gov/glossary/term/key_encrypting_key)
- [NIST SP 800-38F](https://csrc.nist.gov/publications/detail/sp/800-38f/final)

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard.
`,
  },
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
];
