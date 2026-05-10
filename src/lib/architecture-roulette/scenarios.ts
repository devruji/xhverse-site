export type ScenarioOption = {
  id: "a" | "b" | "c";
  label: string;
  tradeoff: string;
};

export type Scenario = {
  id: string;
  title: string;
  situation: string;
  options: [ScenarioOption, ScenarioOption, ScenarioOption];
  xhRecommendation: "a" | "b" | "c";
  reasoning: string;
};

export const scenarios: Scenario[] = [
  {
    id: "medallion-vs-mesh",
    title: "Medallion Architecture vs Data Mesh",
    situation:
      "A mid-size retail company with 50 analytics users wants to modernize their data platform. They have a central data team of 6 engineers and 4 domain teams that occasionally contribute pipelines. Data volume is growing 30% year-over-year and the existing warehouse is hitting performance ceilings.",
    options: [
      {
        id: "a",
        label: "Medallion architecture (Bronze/Silver/Gold)",
        tradeoff:
          "Central team becomes a bottleneck as domain requests pile up.",
      },
      {
        id: "b",
        label: "Full Data Mesh with domain ownership",
        tradeoff:
          "Requires significant org maturity and platform investment that a 6-person team cannot support.",
      },
      {
        id: "c",
        label: "Medallion with federated ingestion",
        tradeoff:
          "Hybrid complexity — domains must follow central standards without dedicated platform tooling.",
      },
    ],
    xhRecommendation: "a",
    reasoning:
      "At 50 users and 6 engineers, full mesh is organizational overhead disguised as architecture. Medallion gives you a clear contract between layers, predictable quality gates, and a team small enough to own the whole pipeline. You can evolve toward federation later when domain teams prove they can maintain SLAs.",
  },
  {
    id: "unity-catalog-timing",
    title: "Unity Catalog Migration Timing",
    situation:
      "Your Databricks workspace has 200+ tables in Hive Metastore, active pipelines running daily, and a quarterly compliance audit approaching. The platform team wants to move to Unity Catalog for centralized governance, but a major feature release is shipping in 6 weeks.",
    options: [
      {
        id: "a",
        label: "Migrate mid-project alongside feature work",
        tradeoff:
          "Parallel workstreams create merge conflicts and double the blast radius if something breaks.",
      },
      {
        id: "b",
        label: "Clean break after the release",
        tradeoff:
          "Delays governance improvements by 2+ months and the compliance audit may surface gaps.",
      },
      {
        id: "c",
        label: "Incremental migration — new tables in UC, backfill later",
        tradeoff:
          "Two catalog systems coexist, increasing cognitive load and complicating access policies.",
      },
    ],
    xhRecommendation: "c",
    reasoning:
      "Ripping and replacing 200 tables mid-flight is how outages happen. The incremental approach lets you prove UC works on new tables, train the team on the new model, and backfill legacy tables in a controlled window after the release ships. The temporary split is manageable if you document which catalog owns what.",
  },
  {
    id: "governance-vs-delivery",
    title: "Governance-First vs Delivery-First",
    situation:
      "A Series B fintech startup is building its first proper data platform. The CDO wants data classification, lineage, and access policies before any dashboards ship. The product team needs customer cohort analytics within 4 weeks to inform a pricing decision worth $2M ARR.",
    options: [
      {
        id: "a",
        label: "Governance-first — classify and secure before exposing data",
        tradeoff:
          "Product team waits 8-12 weeks; pricing decision relies on gut feel or stale spreadsheets.",
      },
      {
        id: "b",
        label: "Delivery-first — ship dashboards, govern later",
        tradeoff:
          "Technical debt compounds; PII may leak into dashboards that become hard to retract.",
      },
      {
        id: "c",
        label: "Minimal governance guardrails, then deliver",
        tradeoff:
          "Neither team gets their ideal outcome — governance is incomplete and delivery is slightly delayed.",
      },
    ],
    xhRecommendation: "c",
    reasoning:
      "In fintech, ungoverned PII is a regulatory time bomb, but a $2M decision cannot wait 12 weeks. Set up column-level masking on PII fields, basic access groups, and a classification tag for sensitive columns — that takes days, not months. Then ship the dashboards. You get 80% of governance value at 20% of the effort.",
  },
  {
    id: "monorepo-vs-multirepo",
    title: "Monorepo vs Multi-Repo for Data Pipelines",
    situation:
      "A data engineering team of 8 manages 40+ pipelines across ingestion, transformation, and ML feature engineering. They currently use one repo per pipeline, but CI/CD maintenance is unsustainable — each repo has its own workflow, dependency versions drift, and shared utilities are copy-pasted.",
    options: [
      {
        id: "a",
        label: "Consolidate into a monorepo",
        tradeoff:
          "CI becomes complex — every PR triggers all tests unless you invest in path-based filtering.",
      },
      {
        id: "b",
        label: "Keep multi-repo with shared library packages",
        tradeoff:
          "Publishing and versioning shared libraries adds release ceremony for a small team.",
      },
      {
        id: "c",
        label: "Monorepo with workspace tooling (e.g., Pants, Nx)",
        tradeoff:
          "Build tool learning curve and maintenance cost for a team that primarily writes Python/SQL.",
      },
    ],
    xhRecommendation: "a",
    reasoning:
      "For 8 engineers and 40 pipelines, a plain monorepo with path-based CI filters is the sweet spot. You eliminate dependency drift, share utilities via imports instead of packages, and reduce CI config from 40 files to 1. The build tool overhead of option C is not justified at this scale — simple glob-based CI triggers solve the selective testing problem.",
  },
  {
    id: "serverless-vs-provisioned",
    title: "Serverless SQL vs Provisioned Clusters for BI",
    situation:
      "A company runs 15 Power BI dashboards refreshing every 30 minutes during business hours (8am-6pm). Current provisioned cluster costs $3,200/month with 40% idle time. The BI team complains about cold start latency when clusters auto-terminate, but finance wants to reduce cloud spend.",
    options: [
      {
        id: "a",
        label: "Serverless SQL warehouse",
        tradeoff:
          "Per-query pricing can exceed provisioned costs if concurrency spikes unexpectedly.",
      },
      {
        id: "b",
        label: "Provisioned cluster with tighter auto-terminate",
        tradeoff:
          "Still has cold starts; the 30-minute refresh cycle may repeatedly trigger scale-up.",
      },
      {
        id: "c",
        label: "Serverless with query caching and staggered refreshes",
        tradeoff:
          "Requires reworking the refresh schedule and may surface stale data for some reports.",
      },
    ],
    xhRecommendation: "c",
    reasoning:
      "Serverless eliminates the 40% idle cost and cold start complaints in one move. Staggering refreshes across a 5-minute window instead of all 15 hitting at :00 reduces peak concurrency — which is what drives serverless cost. Query caching means repeated filters hit warm results. In practice this cuts the bill by 30-50% while improving latency.",
  },
  {
    id: "dlt-vs-custom-spark",
    title: "Delta Live Tables vs Custom Spark Jobs",
    situation:
      "A healthcare data team ingests data from 12 source systems. They need CDC processing, schema evolution handling, and data quality expectations with automatic quarantine. The team has strong Spark skills but limited time — they must ship the new ingestion layer in 8 weeks.",
    options: [
      {
        id: "a",
        label: "Delta Live Tables with expectations",
        tradeoff:
          "Less control over execution — DLT manages scheduling, retries, and cluster lifecycle opaquely.",
      },
      {
        id: "b",
        label: "Custom Spark structured streaming jobs",
        tradeoff:
          "Building CDC, schema evolution, and quality checks from scratch in 8 weeks is aggressive.",
      },
      {
        id: "c",
        label: "DLT for ingestion, custom Spark for complex transforms",
        tradeoff:
          "Two execution models to monitor and debug when failures cross the boundary.",
      },
    ],
    xhRecommendation: "a",
    reasoning:
      "DLT was purpose-built for exactly this scenario — CDC with apply_changes(), schema evolution via autoLoader, and quality expectations with quarantine tables. Building all of that in custom Spark within 8 weeks means cutting corners on error handling. The opacity trade-off is acceptable because DLT surfaces metrics and lineage natively. Use it for what it is good at.",
  },
  {
    id: "central-vs-federated-team",
    title: "Central Data Team vs Federated Ownership",
    situation:
      "An e-commerce company with 5 product domains (catalog, orders, payments, logistics, marketing) has a central data team of 10 serving all reporting needs. Request backlog is 6 weeks deep. Domain teams want to build their own pipelines but have no data engineering experience.",
    options: [
      {
        id: "a",
        label: "Keep central team, hire more engineers",
        tradeoff:
          "Hiring takes 3-6 months; backlog grows while onboarding new hires.",
      },
      {
        id: "b",
        label: "Federate ownership to domain teams immediately",
        tradeoff:
          "Domain teams without data engineering skills will produce inconsistent, ungoverned pipelines.",
      },
      {
        id: "c",
        label: "Embed data engineers into domains with central standards",
        tradeoff:
          "Requires rewriting team structures and dual-reporting relationships that create friction.",
      },
    ],
    xhRecommendation: "c",
    reasoning:
      "The backlog exists because centralized teams cannot context-switch across 5 domains efficiently. Embedding engineers in domains gives them product context while central standards (templates, CI checks, shared schemas) prevent quality regression. The org friction is real but manageable with clear ownership boundaries — the embedded engineer owns domain pipelines, central team owns the platform layer.",
  },
  {
    id: "streaming-vs-microbatch",
    title: "Real-Time Streaming vs Micro-Batch",
    situation:
      "A logistics company wants near-real-time package tracking dashboards for operations managers. Current batch ETL runs hourly. The operations team says they need updates within 5 minutes. Infrastructure budget is fixed, and the team has no Kafka experience.",
    options: [
      {
        id: "a",
        label: "Full streaming with Kafka + Spark Structured Streaming",
        tradeoff:
          "Kafka operational overhead is significant for a team with no streaming experience.",
      },
      {
        id: "b",
        label: "Micro-batch every 2-3 minutes with triggered jobs",
        tradeoff:
          "Not true real-time; job scheduling overhead and potential data staleness during peak.",
      },
      {
        id: "c",
        label: "Change Data Capture with DLT continuous mode",
        tradeoff:
          "Continuous clusters run 24/7, increasing cost compared to triggered micro-batch.",
      },
    ],
    xhRecommendation: "b",
    reasoning:
      "The requirement is 5-minute freshness, not sub-second — that is micro-batch territory. A triggered Spark job every 2-3 minutes on a serverless warehouse delivers the SLA without introducing Kafka operations to a team that has never run it. The cost is predictable, debugging is familiar, and you can upgrade to streaming later if the SLA tightens below 1 minute.",
  },
  {
    id: "buy-vs-build-quality",
    title: "Buy vs Build for Data Quality Tooling",
    situation:
      "A financial services firm needs column-level profiling, anomaly detection, and freshness monitoring across 500+ tables. The data team evaluated Great Expectations (open source) and Monte Carlo (SaaS). Budget exists for tooling but the compliance team requires all quality metadata to stay within the firm's cloud tenant.",
    options: [
      {
        id: "a",
        label: "Monte Carlo (managed SaaS)",
        tradeoff:
          "Quality metadata leaves the tenant — compliance may block deployment after procurement.",
      },
      {
        id: "b",
        label: "Great Expectations self-hosted",
        tradeoff:
          "Significant engineering effort to operationalize — alerting, scheduling, and UI are DIY.",
      },
      {
        id: "c",
        label: "Databricks Lakehouse Monitoring + Unity Catalog expectations",
        tradeoff:
          "Vendor lock-in to Databricks; limited customization compared to dedicated quality tools.",
      },
    ],
    xhRecommendation: "c",
    reasoning:
      "The compliance constraint eliminates SaaS options that move metadata off-tenant. Between self-hosted GX and native Databricks monitoring, the native option wins on operational burden — it is already integrated with Unity Catalog lineage, requires no separate infrastructure, and quality metrics are queryable tables. The lock-in concern is moot if you are already committed to Databricks as your compute layer.",
  },
  {
    id: "single-vs-multi-workspace",
    title: "Single Lakehouse vs Multi-Workspace Isolation",
    situation:
      "An enterprise with 3 business units (BU) — each with its own P&L and data regulations — is consolidating onto Databricks. Legal requires that BU-A (healthcare) data is provably isolated from BU-B (retail) at the infrastructure level. The platform team wants to minimize operational overhead.",
    options: [
      {
        id: "a",
        label: "Single workspace with Unity Catalog namespace isolation",
        tradeoff:
          "Logical isolation may not satisfy healthcare compliance auditors who expect physical boundaries.",
      },
      {
        id: "b",
        label: "One workspace per BU with shared metastore",
        tradeoff:
          "Triple the workspace administration — IAM, networking, and cost tracking are per-workspace.",
      },
      {
        id: "c",
        label: "Multi-workspace with account-level Unity Catalog",
        tradeoff:
          "Requires Databricks account-level features and cross-workspace governance coordination.",
      },
    ],
    xhRecommendation: "c",
    reasoning:
      "Healthcare compliance auditors will not accept logical namespace isolation as sufficient — they need infrastructure boundaries they can point to in audit evidence. Account-level Unity Catalog gives you the physical workspace separation legal requires while still providing a single governance plane for the platform team. The operational overhead is real but it is a compliance cost, not a technical luxury.",
  },
];
