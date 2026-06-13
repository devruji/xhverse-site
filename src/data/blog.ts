import type { ToolSlug } from "./tools";

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
  "data-product-contract-builder": {
    label: "Data Product Contract Builder",
    href: "/tools/data-product-contract-builder",
  },
  "access-model-simulator": {
    label: "Access Model Simulator",
    href: "/tools/access-model-simulator",
  },
  "lakehouse-table-layout-advisor": {
    label: "Lakehouse Table Layout Advisor",
    href: "/tools/lakehouse-table-layout-advisor",
  },
  "power-bi-semantic-model-doctor": {
    label: "Power BI Semantic Model Doctor",
    href: "/tools/power-bi-semantic-model-doctor",
  },
  "pipeline-recovery-planner": {
    label: "Pipeline Recovery Planner",
    href: "/tools/pipeline-recovery-planner",
  },
} as const satisfies Record<
  ToolSlug,
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
    slug: "most-teams-use-materialized-views-too-early",
    title: "Most Teams Use Materialized Views Too Early",
    excerpt:
      "Materialized views can reduce repeated analytical cost, but only after teams diagnose modeling, query shape, layout, freshness, and workload repeatability.",
    date: "2026-06-13",
    tags: [
      "data-architecture",
      "performance",
      "lakehouse",
      "analytics-engineering",
    ],
    mediumUrl: "",
    readingTime: "11 min read",
    updatedAt: "2026-06-13",
    coverImageUrl:
      "/images/blog-most-teams-use-materialized-views-too-early-cover.jpg",
    coverImageAlt:
      "Isometric data architecture cover showing a repeated recomputation loop, decision gateway, and shelves of precomputed analytical inventory.",
    seoTitle:
      "Most Teams Use Materialized Views Too Early | Data Architecture",
    seoDescription:
      "A practical decision framework for when materialized views reduce repeated analytical cost, and when they hide modeling, query, layout, or workload problems.",
    relatedToolCtas: [
      createRelatedToolCta("lakehouse-cost-calculator", "primary"),
      createRelatedToolCta("lakehouse-table-layout-advisor", "secondary"),
    ],
    bodyMarkdown: `A dashboard that used to load in five seconds now takes forty-five. The business notices before the platform team does. Executives complain. The BI owner asks whether the warehouse is down. Engineers open the query plan, see a large fact table, several joins, a few aggregations, and one familiar suggestion appears within minutes: create a materialized view.

That suggestion is not wrong. It is just early.

Materialized views are powerful because they replace repeated computation with persisted results. The platform stops rebuilding the same answer every time a dashboard tile refreshes. The query reads from a precomputed structure instead of scanning, joining, and aggregating the base data again.

But that power changes the architecture. It adds storage. It adds refresh behavior. It adds freshness questions. It creates another production object someone must own, monitor, secure, document, and retire.

The engineering question is not whether materialized views are useful. They are. The question is whether the slow query represents a stable repeated access pattern, or whether it is exposing a deeper design problem.

> [!decision]
> Do not materialize the first slow query. Materialize a stable workload pattern after you understand why the query is slow.

Evidence note: platform-specific behavior in this article is vendor behavior sourced from official documentation. Workload diagnosis, ownership, and sequencing guidance are engineering judgment from operating analytical platforms. View-selection and refresh trade-offs are supported by research and production engineering references near the end.

## Materialized views are architecture, not aspirin

A materialized view is often introduced as a performance fix. In production, it behaves more like an architectural commitment.

With a normal view, the database stores the query definition. Each query against the view still depends on the underlying tables at execution time. The view is a logical contract, not a stored result.

With a materialized view, the platform stores the result of the query. A future query can read that stored result directly or through optimizer rewrite, depending on the engine. The work moves from request time to refresh time.

That shift is the entire design trade-off:

- recompute on every read,
- or precompute on refresh and serve from stored state.

The first option spends compute during user interaction. The second option spends storage and refresh compute before the user asks.

If the same expensive aggregation is requested hundreds of times a day, precomputation can be a good contract. If the query is unstable, poorly modeled, or different every time, a materialized view can become a cache of confusion.

## Diagnose the workload before you materialize it

Dashboards do not become slow for one reason. They usually slow down because several small design compromises compound over time.

Fact tables grow from millions to billions of rows. A join that was acceptable last year now fans out because a dimension is no longer unique at the expected grain. A BI model pushes transformations into every visual instead of centralizing metrics. Partitioning is based on ingestion date while users filter by business date. Clustering was never revisited after query patterns changed. A dashboard that began with ten users now has hundreds of concurrent viewers at month end.

Adding more compute can hide these symptoms for a while, but it rarely changes their shape. More compute can make a bad scan faster. It does not make the table easier to prune. More compute can finish a repeated aggregation sooner. It does not decide whether that aggregation should be modeled as a reusable metric. More compute can absorb concurrency. It does not separate interactive workloads from batch workloads.

Before creating a materialized view, I want answers to five questions:

1. Is the query expensive because it repeats the same business question, or because the model is poorly shaped?
2. Is the filter pattern stable enough for precomputation to pay back?
3. Is the required freshness measured in milliseconds, minutes, hours, or business days?
4. Is the result much smaller than the base data, or are we copying almost the same table again?
5. Who owns the refresh, quality, lineage, access, and retirement of this object?

If the team cannot answer those questions, the materialized view may still speed up the dashboard. It may also postpone the real architecture work.

## What a materialized view commits you to

The useful mental model is a factory and a warehouse.

The factory is the raw query path. Every dashboard request triggers the same manufacturing line: scan the fact table, join dimensions, calculate business rules, aggregate the result, and send it to BI.

The warehouse is the materialized view. The result is already sitting on the shelf. The dashboard does not need to manufacture it again.

That warehouse is not free. Inventory must be built, refreshed, stored, counted, secured, and occasionally thrown away.

The commitments are practical:

- Storage cost: The result has to live somewhere.
- Refresh cost: The query still runs, just on a schedule, trigger, or background maintenance path.
- Freshness trade-off: Users may read data as of the last refresh, or the engine may have to compensate by reading base changes.
- Operational ownership: Someone must know when refresh fails and what business impact that creates.
- Governance: The materialized result can expose a different access surface than the base data.
- Observability: Query latency improves only if refresh health, staleness, optimizer rewrite, and storage growth are monitored.

This is why I do not treat materialized views as a simple SQL feature. They are a small serving layer inside the warehouse.

## Why teams love them

The appeal is obvious. A slow executive dashboard becomes fast. A repeated daily KPI query stops burning compute every time someone opens a BI page. A semantic model becomes easier to serve because common aggregates are already prepared. A platform team can reduce peak concurrency pressure without asking every analyst to rewrite SQL.

Materialized views work especially well when the output is small and heavily reused. Daily sales by region. Month-to-date margin by category. Active customers by market. Inventory position by store and product class. These are not ad hoc questions. They are repeated business surfaces.

They also help when the expensive part of the query is deterministic and shared. If ten dashboards independently compute the same revenue metric from the same raw tables, the problem is not just query latency. The problem is duplicated business logic. A materialized view can be one implementation of that logic, as long as ownership and definitions are explicit.

The best materialized views feel boring in production. They refresh on time, serve predictable query patterns, have clear lineage, and are boring enough that nobody debates their existence every month.

## The hidden costs nobody talks about

Materialized views are often sold internally as free performance. That framing causes trouble.

Storage is the easiest cost to see, but not always the most expensive one. Refresh can compete with ingestion, transformation, BI, and ad hoc workloads. On capacity-based platforms, refresh consumes slots, warehouse time, or pipeline resources. On cluster-based systems, refresh may run at the same time as other production jobs unless scheduled deliberately.

Freshness is usually the cost that creates trust problems. If a dashboard tile shows sales as of 8:00 a.m. and another tile reads the base table through a live query, users may see two answers for the same metric. Both can be technically correct. The experience still damages confidence.

Governance can be more subtle. A materialized view may aggregate or filter sensitive data, but it is still derived from sensitive data. If row filters, column masks, tags, or access policies are applied only to the base table, the derived object needs the same level of design attention. Materializing data does not remove the obligation to control it.

Maintenance is the long tail. Materialized views accumulate because nobody wants to delete a performance optimization. Months later, teams have twenty nearly identical objects, undocumented refresh schedules, unknown consumers, and stale business logic that still looks official because it runs fast.

Speed can make bad architecture harder to notice.

## When materialized views are the right tool

Use a materialized view when the workload has a stable shape and the economics are clear.

Good candidates include executive dashboards with repeated KPI tiles, financial reporting snapshots, daily operational scorecards, and high-volume BI models that repeatedly aggregate the same fact grain. They also make sense when many consumers need the same certified metric and the result set is meaningfully smaller than the base tables.

The strongest cases usually have these properties:

- The query runs frequently.
- The query is expensive because of aggregation, filtering, or joins that are stable.
- The result is smaller than the source.
- The business can tolerate the refresh interval.
- The platform can observe refresh health and staleness.
- Access policy on the derived object is understood.
- The owner can delete or redesign it when the workload changes.

In those cases, materialized views are not a shortcut. They are a deliberate serving structure.

One practical example is a daily KPI dashboard for leadership. The dashboard may need revenue, transactions, active customers, returns, margin, and loyalty activity across regions. Users open it many times a day, but the numbers only need to be current through the last completed business day. Recomputing those aggregates every time is wasteful. A materialized view refreshed after the finance-close or sales-close pipeline can reduce compute and improve user experience without weakening the architecture.

Another example is a large semantic model that repeatedly asks the same question through different visuals. If the semantic layer is clean but the warehouse still has to scan large tables for every slicer interaction, pre-aggregating the right grain can be more honest than asking BI capacity to absorb the cost.

## When they create debt

Materialized views become debt when they compensate for design mistakes the team should fix directly.

If the fact table has no useful partition strategy, materializing a filtered result may speed up one dashboard while leaving every other workload exposed. If a dimension table has duplicate business keys, materializing the join hides the grain problem instead of correcting it. If analysts are joining raw ingestion tables because curated models do not exist, a materialized view might become a permanent bandage over a missing modeling layer.

Watch for these signals:

- Every dashboard asks for a new materialized view.
- The materialized view is almost as large as the base table.
- The refresh query contains business logic that should live in a curated model or semantic layer.
- Freshness requirements are vague.
- Nobody can explain the source table grain.
- The platform team cannot tell which queries actually use the object.
- Multiple materialized views calculate the same metric differently.

In those cases, fix something else first. Revisit the dimensional model. Align partitioning and clustering with real predicates. Move repeated transformations into a curated layer. Separate interactive BI workloads from exploratory workloads. Reduce fan-out joins. Stabilize metric definitions.

A faster query is not automatically a better architecture.

## Platform behavior is not portable

The phrase materialized view sounds portable. The operating behavior is not.

| Platform | Engineering interpretation |
| --- | --- |
| PostgreSQL | Treat the materialized view like a table-like persisted result that you refresh deliberately. It can be indexed, but freshness is your operational responsibility. |
| Databricks | Treat materialized views as pipeline-managed objects with refresh behavior tied to Lakeflow Spark Declarative Pipelines. They can be incremental, but some changes require full recomputation. |
| Microsoft Fabric | Do not assume a warehouse materialized-view feature is available. The current Fabric Warehouse T-SQL surface area lists materialized views as unsupported, so choose an alternative serving pattern and validate the current platform state before porting designs. |
| Snowflake | Treat materialized views as an Enterprise Edition feature with automatic maintenance, but still evaluate whether repeated-query savings offset maintenance and storage costs. |
| BigQuery | Treat incremental and non-incremental materialized views differently. BigQuery can rewrite queries and maintain views in the background, but SQL support, staleness, and pricing rules matter. |
| Redshift | Treat refresh and optimizer rewrite as part of the design. Automatic rewrite is useful, but stale materialized views and workload-dependent refresh behavior must be managed. |

This is where teams get into trouble during platform migrations. A design that works in PostgreSQL because a nightly job refreshes a small aggregate may not map cleanly to BigQuery incremental rules. A Snowflake pattern with background maintenance may not map to Fabric Warehouse. A Databricks materialized view may imply pipeline ownership that the BI team did not expect.

Vendor behavior determines the operating model. Architecture should absorb that difference instead of pretending SQL syntax makes everything equivalent.

## Decision checklist

Before approving a materialized view, I use a simple decision table.

| Use a materialized view when... | Fix something else first when... |
| --- | --- |
| The query pattern is repeated and business-critical. | The query is a one-off or exploratory workload. |
| The result is much smaller than the source tables. | The result copies most of the base data. |
| The business accepts a clear freshness SLA. | Users expect live data but nobody can define live. |
| The metric definition is stable and owned. | The SQL contains ungoverned business logic. |
| Refresh cost is lower than repeated query cost. | Refresh would compete with ingestion or close windows. |
| The platform can monitor staleness and failures. | There is no alerting or owner for refresh failures. |
| Security on derived data is explicit. | Access rules exist only on the base tables. |

If most answers fall on the left, materialization is a strong candidate. If most fall on the right, the materialized view is probably hiding a platform or modeling issue.

A useful approval question is: what would we fix if materialized views did not exist?

That question forces the team to separate real reuse from accidental workaround.

## Lessons learned

Most teams introduce materialized views too early because the feature provides visible relief. A dashboard goes from slow to acceptable, and the immediate pain disappears. But production architecture is not judged by the first successful query after the change. It is judged by what the system becomes six months later.

The best materialized views I have seen had narrow purpose, clear ownership, and boring operations. Everyone knew what they served. Everyone knew when they refreshed. Everyone knew what freshness meant. They existed because the workload was stable enough to deserve a stored result.

The worst ones looked like performance wins at first. Later they became a parallel data model. Definitions drifted from curated tables. Refresh failures were discovered by users. Nobody knew whether stale results were acceptable. The platform had traded query latency for ambiguity.

Materialized views are not bad. Using them before diagnosis is bad engineering.

Architecture thinking starts one level earlier than the feature. Understand the grain. Understand the workload. Understand freshness. Understand cost. Understand ownership. Then decide whether precomputation belongs in the design.

The best optimization is not always making the slow query faster. Sometimes it is making the workload honest enough that the right optimization becomes obvious.

## Related tools

Use the [Lakehouse Cost Calculator](/tools/lakehouse-cost-calculator) to reason about repeated compute, refresh cost, and workload economics before turning every slow query into another persisted object.

Use the [Lakehouse Table Layout Advisor](/tools/lakehouse-table-layout-advisor) when the real issue may be partitioning, clustering, data skipping, or table-layout drift rather than missing precomputation.

## Key takeaways

- Materialized views solve repeated computation, not every performance problem.
- They are strongest when query patterns are stable, results are smaller than sources, and freshness is explicit.
- They introduce storage, refresh, governance, observability, and ownership costs.
- Platform behavior differs enough that portability should never be assumed.
- If a materialized view hides modeling, layout, or metric-definition problems, fix the design first.

## References

### Official Documentation

- **PostgreSQL: Materialized Views** - PostgreSQL. [URL](https://www.postgresql.org/docs/current/rules-materializedviews.html). Why it matters: explains the table-like persisted result model and explicit refresh behavior.
- **PostgreSQL: CREATE MATERIALIZED VIEW** - PostgreSQL. [URL](https://www.postgresql.org/docs/current/sql-creatematerializedview.html). Why it matters: supports implementation and lifecycle details for PostgreSQL materialized views.
- **Materialized Views** - Databricks. [URL](https://docs.databricks.com/aws/en/ldp/concepts/materialized-views). Why it matters: shows pipeline-managed refresh behavior, incremental processing, and limitations.
- **T-SQL surface area in Fabric Data Warehouse** - Microsoft Learn. [URL](https://learn.microsoft.com/en-us/fabric/data-warehouse/tsql-surface-area). Why it matters: identifies Fabric Warehouse support boundaries, including materialized-view caveats.
- **Working with Materialized Views** - Snowflake. [URL](https://docs.snowflake.com/en/user-guide/views-materialized). Why it matters: explains common use cases, automatic maintenance, and cost considerations.
- **Introduction to materialized views** - Google BigQuery. [URL](https://cloud.google.com/bigquery/docs/materialized-views-intro). Why it matters: covers incremental and non-incremental materialized views, smart tuning, pricing, and limitations.
- **Materialized views in Amazon Redshift** - AWS. [URL](https://docs.aws.amazon.com/redshift/latest/dg/materialized-view-overview.html). Why it matters: covers refresh, automatic rewrite, monitoring, and stale-result considerations.

### Engineering Blogs

- **Engineering Data Analytics with Presto and Apache Parquet at Uber** - Uber Engineering. [URL](https://www.uber.com/blog/presto/). Why it matters: illustrates how storage layout and scan efficiency can be the real performance lever before precomputation.
- **How Airbnb achieved metric consistency at scale** - Airbnb Engineering. [URL](https://medium.com/airbnb-engineering/how-airbnb-achieved-metric-consistency-at-scale-f23cc53dea70). Why it matters: supports the argument that repeated business metrics need governed definitions, not only faster queries.
- **Using Presto in our Big Data Platform on AWS** - Netflix Technology Blog. [URL](https://netflixtechblog.com/using-presto-in-our-big-data-platform-on-aws-938035909fd4). Why it matters: provides a large-scale analytics-platform example where workload patterns matter as much as a single optimization feature.
- **HTTP analytics for 6M requests per second using ClickHouse** - Cloudflare Blog. [URL](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/). Why it matters: shows that high-volume analytics performance is often an architecture and workload-shaping problem.

### Research Papers

- **Kaskade: Graph Views for Efficient Graph Analytics** - Microsoft Research and collaborators. [URL](https://arxiv.org/abs/1906.05162). Key relevance: demonstrates view selection as an optimizer and workload-design problem, not just a feature toggle.
- **Materialized View Selection and Maintenance Using Multi-Query Optimization** - Hoshi Mistry, Prasan Roy, Krithi Ramamritham, and S. Sudarshan. [URL](https://arxiv.org/abs/cs/0003006). Key relevance: connects materialized-view selection to workload-level optimization and maintenance cost.
- **Enzyme: Incremental View Maintenance for Data Engineering** - Ritwik Yadav et al. [URL](https://arxiv.org/abs/2603.27775). Key relevance: gives modern context for incremental maintenance, refresh planning, and the operational complexity behind materialized views.

### Additional Reading

- **KEA: Tuning an Exabyte-Scale Data Infrastructure** - Microsoft Research. [URL](https://arxiv.org/abs/2106.11445). Why it matters: reinforces that workload optimization at scale is an operating-model problem, not only a feature choice.

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard.`,
  },
  {
    slug: "onelake-platform-contract-not-storage",
    title: "OneLake is a platform contract, not just storage",
    excerpt:
      "OneLake works best when teams treat it as a tenant-wide platform contract for ownership, access, shortcuts, discovery, and cross-engine reuse, not just a managed storage layer.",
    date: "2026-06-04",
    tags: [
      "data-architecture",
      "microsoft-fabric",
      "lakehouse",
      "governance",
    ],
    mediumUrl: "",
    readingTime: "6 min read",
    updatedAt: "2026-06-04",
    coverImageUrl: "/images/blog-onelake-platform-contract-not-storage-cover.jpg",
    coverImageAlt:
      "Isometric OneLake-style platform surface showing a shared logical lake connected to workspaces, shortcuts, governance controls, and access boundaries.",
    seoTitle: "OneLake Is a Platform Contract, Not Just Storage | XHVERSE",
    seoDescription:
      "A practical Microsoft Fabric architecture brief on treating OneLake as a platform contract for ownership, access, shortcuts, discovery, and governance.",
    relatedToolCtas: [
      createRelatedToolCta("access-model-simulator", "primary"),
      createRelatedToolCta("governance-scorecard", "secondary"),
      createRelatedToolCta("data-product-contract-builder", "secondary"),
    ],
    bodyMarkdown: `OneLake is easy to undersell because the word lake sounds like storage. In Fabric, that framing is too small.

OneLake is the tenant-level surface where workspace ownership, item boundaries, shortcuts, access, discovery, and engine access all meet. If a team treats it like a nicer storage account, it can recreate lake sprawl inside a unified namespace.

> [!decision]
> The design question is not "where do we put files?" It is "what ownership and access contract should this namespace enforce?"

## The contract starts at tenant scope

Microsoft Fabric gives a tenant one logical OneLake. That matters because the design unit is not a storage account per team. The design unit is a shared platform namespace that multiple teams, workspaces, items, and engines will depend on.

That does not mean every team shares every asset. It means the platform has to decide how names, workspaces, domains, security boundaries, and shortcuts behave before the first production lakehouse becomes hard to move.

The practical contract should answer:

- which workspaces own which data products or analytical surfaces,
- which items are production assets rather than experiments,
- which domains are responsible for stewardship,
- which shortcuts are allowed and who owns the target,
- how access is reviewed,
- how stale items are retired,
- and which engines or API clients can reach the data.

Without those answers, OneLake can look unified while the operating model remains fragmented.

## Workspaces and items are ownership boundaries

Fabric organizes data through workspaces and items. Those are not just UI containers. They are where ownership, support behavior, access, lifecycle, and cost responsibility become visible.

A lakehouse, warehouse, semantic model, notebook, or pipeline should not be created only because someone needs a place to land data. It should sit in a workspace whose owner can explain:

- what the item is for,
- who can change it,
- who consumes it,
- what happens when it breaks,
- how access is granted,
- and when it should be archived or deleted.

If a workspace is a dumping ground, OneLake inherits that confusion. If workspaces map to stable ownership and support behavior, OneLake becomes easier to operate.

## Shortcuts are not ownership shortcuts

Shortcuts are one of the strongest OneLake features because they can make data appear local without moving it. That helps teams reuse ADLS, Amazon S3, Google Cloud Storage, Dataverse, or another Fabric item without building another copy by default.

But a shortcut is still a contract. The consuming workspace depends on:

- the target path staying valid,
- the source owner keeping the data reliable,
- the access model remaining compatible,
- the refresh and latency assumptions being documented,
- and deletion behavior being understood.

> [!warning]
> A shortcut can reduce copy pressure. It does not remove source ownership, permission review, lifecycle management, or incident responsibility.

Teams should keep a shortcut register for production dependencies. At minimum, record source, target, owner, consuming item, access pattern, and failure response.

## Security has more than one plane

OneLake security should be discussed before teams argue about folder layout.

Fabric has control-plane behavior around workspace and item management, and data-plane behavior around file and table access. Those are related, but they are not the same thing. A user might have enough workspace permission to perform some item actions while still needing the right data access path for external clients or APIs.

The platform contract should separate:

- who can administer a workspace,
- who can create or modify items,
- who can read the data,
- who can manage shortcuts,
- who can access OneLake through external tools,
- and who can review or certify governance status.

This is where a simple "workspace admin can do everything" mental model becomes dangerous. Admin, Member, Contributor, and Viewer roles need to be matched to the data-plane controls and the sensitivity of the item.

OneLake security roles are especially important for Viewer-style access. Workspace Admin, Member, and Contributor users can still read and write item data through their workspace role, so the platform cannot treat OneLake security roles as a universal deny layer.

## Domains and catalog help discovery, not permission magic

Domains and OneLake Catalog are useful because they make ownership and discovery more visible. A domain can group related data and delegate stewardship. The catalog gives users a practical surface to find items, review descriptions, inspect endorsement, and understand governance context.

That is valuable, but it is not a replacement for permissions.

Domain assignment should not be treated as access approval. Catalog visibility should not be treated as production readiness. A certified item with unclear support ownership can still fail consumers.

Use domains and catalog as governance surfaces:

- group items by business ownership,
- expose stewardship,
- make endorsement meaningful,
- find stale or uncertified assets,
- and support access review.

Then keep the permission model explicit.

## Delta Parquet makes maintenance part of the model

Fabric stores lakehouse tables in Delta Parquet, which supports reuse across Fabric experiences and engines. That is useful because many workloads can operate over the same table format.

It also means table maintenance is not somebody else's problem. File layout, schema changes, retention, shortcut behavior, and cross-engine compatibility become platform concerns. The more shared the table, the less safe it is to let each workspace invent its own pattern.

For production tables, define:

- naming and folder conventions,
- schema evolution policy,
- table maintenance expectations,
- data quality ownership,
- allowed shortcut exposure,
- and consumer notification for breaking changes.

The table format helps. The operating model still does the work.

## API and external access belong in the contract

OneLake is not only reached through Fabric screens. API and external tool access matter because platform teams, engineering teams, and BI teams often need automation or direct data access.

The contract should document:

- which URI pattern is approved,
- whether teams use the global or regional OneLake endpoint,
- which tenant settings affect external access,
- how Microsoft Entra ID authentication is handled,
- which clients are supported,
- and which operations still belong inside the Fabric experience rather than through ADLS-compatible APIs.

Ignoring this creates shadow conventions. One team uses APIs as a production dependency, another assumes UI-only governance, and the platform cannot explain which access path is authoritative.

## A short checklist before landing the next dataset

Before adding another production item to OneLake, ask:

- Does the workspace have a named owner?
- Is the item experimental, certified, or production-supported?
- Is the domain assignment meaningful?
- Are shortcuts documented as dependencies?
- Is access reviewed at both workspace and data level?
- Can external/API access be explained without reading tribal notes?
- Is the lifecycle policy clear?
- Do consumers know what will happen during breaking changes?

If those answers are missing, landing data is easy but operating the platform gets harder.

## Related tools

- Use the [Access Model Simulator](/tools/access-model-simulator) before assuming workspace, item, API, and shortcut paths behave the same way.
- Run the [Governance Readiness Scorecard](/tools/governance-scorecard) to test ownership and access-review readiness.
- Draft the minimum contract with the [Data Product Contract Builder](/tools/data-product-contract-builder) before publishing shared OneLake assets.

## References

- [Microsoft Fabric overview](https://learn.microsoft.com/en-us/fabric/get-started/microsoft-fabric-overview)
- [OneLake overview](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview)
- [Connecting to Microsoft OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-access-api)
- [OneLake shortcuts](https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts)
- [OneLake data security overview](https://learn.microsoft.com/en-us/fabric/onelake/security/get-started-security)
- [Get started with OneLake security](https://learn.microsoft.com/en-us/fabric/onelake/security/get-started-onelake-security)
- [OneLake catalog overview](https://learn.microsoft.com/en-us/fabric/governance/onelake-catalog-overview)
- [Microsoft Fabric domains](https://learn.microsoft.com/en-us/fabric/governance/domains)

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard.
`,
  },
  {
    slug: "abac-row-filters-column-masks-production-ownership",
    title: "ABAC row filters and column masks need production ownership",
    excerpt:
      "ABAC can make Databricks row and column controls consistent, but only if tags, policies, UDFs, exemptions, performance, and audit readback have named owners.",
    date: "2026-06-04",
    tags: ["databricks", "governance", "platform", "security"],
    mediumUrl: "",
    readingTime: "6 min read",
    updatedAt: "2026-06-04",
    coverImageUrl:
      "/images/blog-abac-row-filters-column-masks-production-ownership-cover.jpg",
    coverImageAlt:
      "Isometric governed table showing row-level access bands, masked columns, policy shields, tags, and owner control panels.",
    seoTitle: "Databricks ABAC Needs Production Ownership | XHVERSE",
    seoDescription:
      "A practical guide to owning Databricks Unity Catalog ABAC row filters, column masks, governed tags, UDFs, exemptions, and runtime risk in production.",
    relatedToolCtas: [
      createRelatedToolCta("access-model-simulator", "primary"),
      createRelatedToolCta("governance-scorecard", "secondary"),
      createRelatedToolCta("data-platform-maturity-checker", "secondary"),
    ],
    bodyMarkdown: `ABAC is a strong control pattern because it can move row and column rules away from one-table-at-a-time patching. That does not make it automatic governance.

In Unity Catalog, attribute-based access control depends on governed tags, policy scope, row filter logic, column mask logic, group membership, and runtime behavior. Each of those needs an owner.

> [!decision]
> ABAC centralizes policy expression. It does not remove the need for production ownership.

## The policy is not the ownership model

The most common mistake is treating ABAC as a security feature that someone can turn on after access has already sprawled.

ABAC row filters and column masks restrict visibility at query time. They do not replace object-level grants. A user still needs permission to access the object before a policy can constrain what that user sees.

That distinction matters. If grants are too broad, ABAC becomes the last line of defense. If tags are wrong, policies are missing, or exemptions are careless, the control can look consistent while the platform is carrying silent risk.

## What ABAC actually centralizes

ABAC lets platform teams define policies that apply based on governed tags and scope. A policy can apply at catalog, schema, table, or column level depending on how it is written and where the governed tags live.

That is powerful because higher-level ABAC policies are harder for individual table owners to remove or bypass than table-level filters and masks. It helps the platform express cross-domain controls consistently.

But centralization changes the risk shape:

- a tag taxonomy becomes a security boundary,
- tag assignment becomes an access-control operation,
- policy UDFs become production code,
- exempt principals become formal exceptions,
- and readback becomes part of the release process.

> [!warning]
> Governed tags are not harmless metadata. Changing tags can change which security policy applies.

Column classification needs special care. A tag inherited at catalog, schema, or table level does not automatically classify every column. Sensitive columns need deliberate column-level treatment where the policy depends on column tags.

## The ownership map

Before production rollout, name owners for each part of the control:

| Surface | Owner question |
| --- | --- |
| Governed tag taxonomy | Who can create, rename, or retire security tags? |
| Tag assignment | Who approves tags on catalogs, schemas, tables, and columns? |
| Policy logic | Who owns the SQL UDF and policy condition? |
| Group membership | Who controls the principal lists referenced by policy logic? |
| Exceptions | Who approves an EXCEPT clause and how often is it reviewed? |
| Compatibility | Who checks runtimes, workloads, sharing, and cross-engine behavior? |
| Performance | Who tests representative queries before rollout? |
| Audit readback | Who proves the effective policy after change? |

If any row says "platform team, probably," the model is not ready yet. Production ABAC needs explicit responsibility, not shared hope.

## Where production risk enters

ABAC risk usually appears around the edges, not in the basic syntax.

Missing tags can stop a policy from applying. Missing or deleted tags and UDFs referenced by a policy can also fail queries, so policy dependencies need the same release discipline as production code. Broad exemptions can turn into permanent bypasses. Older runtimes or unsupported surfaces can make a design look portable when it is not.

Materialized views, streaming tables, Delta Sharing, and cross-engine access deserve separate checks. They do not always behave like a simple interactive query against a managed table. The run identity, refresh behavior, owner permissions, and runtime support can change what "the same policy" means operationally.

> [!check]
> Do not approve a policy until representative workloads have been tested, not only ad hoc SELECT statements.

## UDFs are production code

Row filters and column masks often rely on SQL UDFs. That makes the UDF part of the platform's security and performance surface.

Keep policy UDFs simple:

- deterministic where possible,
- small enough to review,
- typed clearly,
- tested with representative principals,
- tested with representative query shapes,
- and owned like production code.

Avoid heavy Python UDFs, large lookup joins, complex regular expressions over wide text payloads, and anything that turns a security policy into a hidden performance problem.

The policy should be boring. If the logic needs a diagram to explain, it may belong in a governed table design or access model first, not directly inside the mask.

## EXCEPT is an operational contract

The EXCEPT clause is useful. It can keep platform owners, auditors, emergency operators, or trusted service identities from being blocked by a rule that is meant for normal consumers.

It is also easy to misuse.

Treat every exemption as a named exception:

- who is exempt,
- why they are exempt,
- who approved it,
- when it expires or gets reviewed,
- and what audit evidence confirms the exception is still needed.

If the exception list becomes the easiest place to fix access complaints, the ABAC program is drifting back toward manual policy sprawl.

## Verification is part of the rollout

Production policy work needs readback. Creation syntax is not enough.

Use the available policy inspection commands and evidence surfaces:

- show effective policies for the secured object,
- list and describe policies after deployment,
- query as representative principals where possible,
- inspect audit logs for policy and tag changes,
- check workload behavior across the intended runtime surfaces,
- and review exceptions on a schedule.

The goal is not only to prove that a policy exists. The goal is to prove which policy applies, why it applies, who can change it, and what a consumer will actually see.

## A practical rule

ABAC is ready for production when the team can answer six questions:

- Who owns the tag?
- Who owns the policy?
- Who can change either one?
- Who is exempt?
- What workload might break?
- How do we know the policy is effective today?

If those answers are unclear, row filters and column masks may still be useful, but they are not yet a production operating model.

## Related tools

- Use the [Access Model Simulator](/tools/access-model-simulator) before centralizing row and column controls.
- Run the [Governance Readiness Scorecard](/tools/governance-scorecard) to test whether the broader platform can support policy ownership.
- Check the broader operating model with the [Data Platform Maturity Checker](/tools/data-platform-maturity-checker).

## References

- [Databricks: Attribute-based access control in Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac)
- [Databricks: Core concepts for ABAC](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/core-concepts)
- [Databricks: Create and manage ABAC policies](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/policies)
- [Databricks: Best practices for ABAC policies](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/best-practices)
- [Databricks: Performance considerations for ABAC policies](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/performance)
- [Databricks: When to use ABAC vs table-level row filters and column masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/abac-vs-rls-cm)
- [Databricks: ABAC requirements, quotas, and limitations](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/requirements)
- [Databricks: Policy evaluation and runtime behavior](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/policy-evaluation)
- [Databricks: Row filters and column masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks)

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard.
`,
  },
  {
    slug: "serverless-data-engineering-operating-model",
    title: "Serverless data engineering still needs an operating model",
    excerpt:
      "Serverless removes cluster work, but production data teams still need ownership, eligibility gates, cost attribution, observability, release discipline, and recovery paths.",
    date: "2026-06-04",
    tags: ["data-engineering", "platform", "operations", "databricks"],
    mediumUrl: "",
    readingTime: "5 min read",
    updatedAt: "2026-06-04",
    coverImageUrl:
      "/images/blog-serverless-data-engineering-operating-model-cover.jpg",
    coverImageAlt:
      "Isometric serverless data engineering workflow showing on-demand compute nodes, cost meters, policy gates, monitoring panels, and recovery controls.",
    seoTitle: "Serverless Data Engineering Operating Model | XHVERSE",
    seoDescription:
      "A practical operating model for serverless Databricks data engineering: ownership, workload eligibility, cost attribution, observability, CI/CD, and recovery.",
    relatedToolCtas: [
      createRelatedToolCta("data-platform-maturity-checker", "primary"),
      createRelatedToolCta("pipeline-recovery-planner", "secondary"),
      createRelatedToolCta("lakehouse-cost-calculator", "secondary"),
    ],
    bodyMarkdown: `Serverless data engineering removes a lot of cluster work. It does not remove operational accountability.

The control surface changes. Instead of choosing node types, Spark versions, init scripts, and autoscaling settings for every job, teams need to own workload eligibility, run identity, cost attribution, observability, release checks, and recovery behavior.

> [!summary]
> Serverless is not "no ops." It is a different operating model.

## What changes when compute is managed

Serverless compute is Databricks-managed and versionless from the user side. That is useful because teams spend less time provisioning clusters and more time shipping workloads.

It also means teams should stop pretending runtime ownership disappeared. The work shifts toward:

- knowing which workloads are eligible,
- testing changes against representative jobs,
- watching product limitations,
- reviewing cost evidence,
- controlling identity and permissions,
- and defining fallback paths when a workload does not fit.

With classic compute, a platform team can often point to a cluster policy or runtime version. With serverless, the platform team needs clearer workload contracts.

## The platform team still owns guardrails

A mature serverless rollout still needs platform policy.

The platform team should define:

- who may use serverless for jobs or pipelines,
- which workspaces and environments are approved,
- what run-as identity pattern is required,
- which libraries and data access paths are allowed,
- how usage policies and tags are assigned,
- how cost is reviewed,
- and what evidence is needed before migration.

Without that, serverless adoption becomes a hidden migration. Teams stop creating clusters, but the platform loses visibility into why costs changed, which jobs moved, and which workloads are now harder to debug.

## Eligibility is a release gate

Not every data engineering workload belongs on serverless.

Before migration, check the workload against official limitations and the actual code path. Serverless behavior can differ where Spark Connect, DBFS access, custom libraries, streaming triggers, logging, or network-dependent patterns are involved.

Unity Catalog should be treated as part of the operating model, not an optional polish layer. Serverless data engineering depends on governed access paths, external data configuration, and clear ownership of tables, volumes, and credentials.

> [!check]
> A workload is eligible only after the team has tested the real job, not just confirmed that the notebook opens.

Use an eligibility checklist:

- Does the job use supported Spark APIs and libraries?
- Does it depend on DBFS paths or local files?
- Does it need unsupported streaming or trigger behavior?
- Does it use Unity Catalog governed objects correctly?
- Does it need external data access or networking review?
- Does logging still give the team enough incident evidence?
- Can it run under the intended service principal or run-as owner?

## Cost attribution needs new evidence

Classic cluster tags and legacy habits are not enough.

Serverless cost review should use usage policies, workspace or workload tagging where supported, and billing system tables such as system.billing.usage. The point is not to predict perfect savings. The point is to make cost attributable before usage becomes hard to explain.

Usage policies also need qualification. Databricks documents serverless usage policies as Public Preview, and policy assignment is not a retroactive fix for historical spend. Treat them as one attribution control, not the whole cost-governance system.

For each migrated workload, capture:

- baseline cost or runtime on the old path,
- expected schedule and concurrency,
- usage policy or attribution tag,
- owner,
- business purpose,
- and review cadence.

> [!warning]
> Do not claim serverless is cheaper without representative workload billing evidence. It may be cheaper, more expensive, or simply more operationally convenient depending on the workload.

## Observability is a design requirement

Serverless jobs still need monitoring. The signals may come from different surfaces:

- Lakeflow Jobs run history and notifications,
- pipeline event logs,
- query profiles,
- system tables,
- expectations and data quality checks,
- task duration and retry patterns,
- and cost or usage records.

The team should know where to look before the first incident. If only one person understands how to debug a serverless failure, the operating model is not production-ready.

For important workloads, define:

- success criteria,
- alert channels,
- owner and backup owner,
- expected runtime range,
- retry behavior,
- failure severity,
- and downstream impact.

## CI/CD is not optional polish

Serverless does not remove release discipline. Jobs, notebooks, pipeline definitions, permissions, and environment variables still need a source-controlled deployment path.

Declarative Automation Bundles are a strong fit because they make jobs and pipelines reviewable as project assets. Whether the team uses bundles or another controlled deployment route, the requirement is the same:

- code changes are reviewed,
- job settings are versioned,
- environments are separated,
- permissions are explicit,
- and rollback behavior is known.

The problem with ad hoc notebook edits is not the notebook. The problem is that production behavior changes without a release record.

## Recovery still needs an owner

A serverless job can fail for ordinary reasons: bad data, broken code, permission changes, dependency issues, timeout, concurrency pressure, or a platform limitation exposed by a workload change.

The recovery model should answer:

- who repairs failed runs,
- when a task can be rerun,
- when a full job repair is safer,
- how timeouts are handled,
- how downstream consumers are informed,
- when fallback to non-serverless compute is allowed,
- and who decides whether the workload should stay serverless.

If the answer is "the platform will check," the workflow is under-owned. Platform teams should provide guardrails and evidence. Workload owners still own the production data path.

## The practical rule

Move a workload to serverless when the team can explain:

- why the workload is eligible,
- who owns it,
- which identity runs it,
- how cost is attributed,
- how it is deployed,
- how it is monitored,
- and how it recovers.

If those answers are visible, serverless can reduce friction. If they are missing, serverless mostly hides cluster work while leaving the operating model unresolved.

## Related tools

- Use the [Data Platform Maturity Checker](/tools/data-platform-maturity-checker) before migrating shared data engineering workloads.
- Draft a recovery runbook with the [Pipeline Recovery Planner](/tools/pipeline-recovery-planner).
- Estimate workload trade-offs with the [Lakehouse Cost Calculator](/tools/lakehouse-cost-calculator).

## References

- [Databricks: Connect to serverless compute](https://docs.databricks.com/aws/en/compute/serverless/)
- [Databricks: Serverless compute limitations](https://docs.databricks.com/aws/en/compute/serverless/limitations)
- [Databricks: Run Lakeflow Jobs with serverless compute](https://docs.databricks.com/aws/en/jobs/run-serverless-jobs)
- [Databricks: Monitoring and observability for Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/monitor)
- [Databricks: Attribute usage with serverless usage policies](https://docs.databricks.com/aws/en/admin/usage/budget-policies)
- [Databricks: Monitor the cost of serverless compute](https://docs.databricks.com/aws/en/admin/system-tables/serverless-billing)
- [Databricks: What are Declarative Automation Bundles?](https://docs.databricks.com/aws/en/dev-tools/bundles)
- [Databricks: Best practices for Lakeflow Spark Declarative Pipelines](https://docs.databricks.com/aws/en/ldp/best-practices)

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard.
`,
  },
  {
    slug: "data-product-as-platform-contract",
    title: "Data product as a platform contract",
    excerpt:
      "Data products work when teams treat them as platform contracts: named consumers, explicit owners, quality expectations, access boundaries, and lifecycle rules before the consumer count grows.",
    date: "2026-06-03",
    tags: ["data-architecture", "platform", "governance", "operations"],
    mediumUrl: "",
    readingTime: "8 min read",
    updatedAt: "2026-06-03",
    coverImageUrl: "/images/blog-data-product-as-platform-contract-cover.jpg",
    coverImageAlt:
      "Isometric data platform operating board showing a central data product connected to sources, quality checks, governance controls, monitoring, and consumers.",
    seoTitle: "Data Product as a Platform Contract | XHVERSE",
    seoDescription:
      "A practical guide to deciding when a data product is worth building, what separates good products from rebranded datasets, and how to start with a minimal governed slice.",
    relatedToolCtas: [
      createRelatedToolCta("data-product-contract-builder", "primary"),
      createRelatedToolCta("governance-scorecard", "secondary"),
      createRelatedToolCta("data-platform-maturity-checker", "secondary"),
    ],
    bodyMarkdown: `A data product is not a table with a nicer name. It is a platform contract around data that someone depends on repeatedly.

That contract has a consumer, an owner, a use case, a stable interface, quality expectations, access rules, support behavior, and a lifecycle. Without those pieces, the word product mostly hides an unmanaged dataset.

> [!decision]
> You need a data product when a data asset has repeat users, business dependency, and failure consequences. You do not need one for every table.

## What a data product actually is

A **data product** is a reusable data asset designed around a real consumer workflow. The asset might be a table, semantic model, feature set, API, dashboard-ready mart, or governed bundle of assets. The shape matters less than the contract.

The minimum contract should answer:

- who consumes it,
- what decision or workflow it supports,
- what one row or output represents,
- who owns changes,
- how fresh and complete it should be,
- what access is allowed,
- how consumers report issues,
- and how breaking changes are handled.

If those answers are missing, the asset may still be useful. It is just not production-shaped yet.

## Should we have one or not?

Most teams should not start by launching a data product program. Start by finding one data dependency that already behaves like a product because people rely on it.

| Situation | Recommendation | Reason |
| --- | --- | --- |
| Repeated use, multiple consumers, and high trust requirement | Build a data product | The asset already has product-like blast radius. |
| One team exploring an unstable definition | Wait | The contract will churn before consumers can trust it. |
| One-off extract or dashboard | Do not productize | Support cost will be higher than reuse value. |
| Core metric used by finance, operations, or leadership | Productize carefully | Failure changes decisions, not just query results. |
| Domain data needed by many downstream teams | Build a narrow first version | Shared meaning is worth explicit ownership. |

The rule is simple: productize where reliability has a cost. Do not productize because the catalog needs more impressive objects.

## Good vs bad data products

A good data product makes a promise that consumers can understand and operators can keep.

Good data products usually have:

- a named owner,
- a named consumer or consumer group,
- a clear grain or interface,
- documented freshness and quality expectations,
- known limitations,
- access and privacy boundaries,
- usage feedback,
- incident ownership,
- and a deprecation path.

A bad data product is usually just platform debt with product language wrapped around it.

Bad patterns include:

- a gold table renamed as a product,
- a dashboard nobody owns,
- a metric layer without governance,
- a catalog entry with no support path,
- a dataset with ten meanings and no grain,
- or a product backlog that exists only because a transformation program needs one.

> [!warning]
> If nobody can name the user, the decision, the owner, and the failure mode, the team does not have a data product yet.

## Real-world data products

Useful data products are usually boring in the right way. They serve repeated work.

Retail operations might need a store performance product: daily sales, footfall, margin, staffing signal, promotion context, and store hierarchy at an agreed grain. The consumer is not "the business" in general. It is operations, regional managers, finance, or planning teams with specific decisions.

A loyalty or CRM team might need a customer 360 product. That does not mean every customer field goes into one giant table. It means the product contract explains identity resolution, consent boundaries, segmentation logic, freshness, and where current state differs from point-in-time truth.

An e-commerce team might depend on inventory availability. That product needs latency, stock status semantics, reservation behavior, exception handling, and ownership between merchandising, supply chain, and platform teams.

Finance might need a certified revenue metric product. The value is not only the calculation. The value is the release process, reconciliation path, auditability, and agreement about when the metric can change.

Planning teams might consume a demand forecast output. The data product includes model output, confidence or error behavior, retraining cadence, scenario limitations, and escalation when actual demand drifts.

Governance teams can also consume data products. A data quality signal product can expose freshness, completeness, policy exceptions, and incident counts so platform health becomes measurable instead of anecdotal.

## The minimal version that is still real

Start smaller than the architecture diagram.

Choose one recurring workflow where unreliable data creates visible cost. Name one consumer group. Define one output. Write the contract before expanding the surface.

The first version should include:

1. Consumer: who uses it and for what decision.
2. Grain: what one row, record, feature vector, or API response means.
3. Source boundary: which systems are included and which are not.
4. Quality checks: freshness, completeness, valid ranges, duplicates, and reconciliation where needed.
5. Access rules: who can use it, what sensitive fields are excluded, and how access is reviewed.
6. Change policy: what counts as breaking and how much notice consumers receive.
7. Support path: who answers issues and what incident severity means.
8. Usage signal: subscriptions, queries, dashboard dependencies, or downstream jobs.

This does not require a large platform program. It requires enough discipline that consumers can trust the asset without reading the source pipeline.

## The operating model matters more than the label

A data product needs platform behavior around it:

- publish with documented intent,
- monitor freshness and quality,
- alert the owner before consumers discover breakage,
- track consumers and downstream dependencies,
- version breaking changes,
- review access,
- retire stale outputs,
- and keep support ownership visible.

The platform team should provide shared capabilities for those behaviors. Domain or product owners should own the meaning, quality targets, and consumer commitments. When all ownership sits with one central data team, the product becomes a service queue. When all ownership sits with a domain team but the platform has no guardrails, every product becomes a special case.

> [!summary]
> The useful balance is centralized platform capability plus explicit domain accountability.

## XH data product thinking, for later

For xhverse, the interesting future data product is not a generic SaaS promise. It is a focused diagnostic asset.

The site already has practical tools around maturity, governance, architecture trade-offs, cost, and modeling. Over time, those interactions could support an anonymized benchmark or advisory signal:

- How ready is this platform compared with similar enterprise patterns?
- Which governance gaps usually block lakehouse adoption?
- Which operating-model fix should a team make first?
- What maturity profile appears before teams can safely productize shared data assets?

That should stay narrow. A useful XH data product would help teams reason about readiness and next action. It should not pretend that a form score replaces platform discovery, stakeholder interviews, or production evidence.

## Design check

Before calling something a data product, ask:

- Can a consumer explain what it is for?
- Can the owner explain what can safely change?
- Can the platform detect freshness or quality failure?
- Can access be reviewed without reading pipeline code?
- Can a breaking change be versioned or communicated?
- Can the product be retired when nobody depends on it?

If the answer is no, build the missing contract first.

## Related tools

- Draft the product contract with the [Data Product Contract Builder](/tools/data-product-contract-builder) before calling a shared dataset a product.
- Use the [Governance Readiness Scorecard](/tools/governance-scorecard) to test ownership, trust, and policy readiness.
- Run the [Data Platform Maturity Checker](/tools/data-platform-maturity-checker) to check whether the platform can operate the contract.

## References

- [Martin Fowler: Data Mesh Principles and Logical Architecture](https://martinfowler.com/articles/data-mesh-principles.html)
- [Martin Fowler: Designing Data Products](https://martinfowler.com/articles/designing-data-products.html)
- [Thoughtworks: Data Mesh in practice, technology and the architecture](https://www.thoughtworks.com/insights/articles/data-mesh-in-practice-technology-and-the-architecture)
- [Microsoft Learn: Data Products in Unified Catalog](https://learn.microsoft.com/en-au/purview/concept-data-products)
- [OpenMetadata: Creating Data Contracts](https://docs.open-metadata.org/v1.9.x/how-to-guides/data-contracts/spec)

## Disclosure

This article was co-written with an AI agent and reviewed by Rujikorn Ngoensaard.
`,
  },
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
      createRelatedToolCta("lakehouse-table-layout-advisor", "primary"),
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

- Use the [Lakehouse Table Layout Advisor](/tools/lakehouse-table-layout-advisor) to turn table-format trade-offs into operating checks.
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
      createRelatedToolCta("lakehouse-table-layout-advisor", "secondary"),
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
- Check layout and maintenance pressure with the [Lakehouse Table Layout Advisor](/tools/lakehouse-table-layout-advisor).
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
      createRelatedToolCta("power-bi-semantic-model-doctor", "primary"),
      createRelatedToolCta("scd-design-lab", "secondary"),
      createRelatedToolCta("lakehouse-cost-calculator", "secondary"),
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

## Related tools

- Diagnose model grain, relationships, measures, and refresh behavior with the [Power BI Semantic Model Doctor](/tools/power-bi-semantic-model-doctor).
- Practice history and dimensional boundaries with the [SCD Design Lab](/tools/scd-design-lab).
- Estimate serving-table and compute trade-offs with the [Lakehouse Cost Calculator](/tools/lakehouse-cost-calculator).

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
