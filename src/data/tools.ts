export type ToolCategory =
  | "Architecture"
  | "Assessment"
  | "Cost"
  | "Data Product"
  | "Education"
  | "Governance"
  | "Operations"
  | "Power BI"
  | "SQL";

export type ToolStatus = "Live" | "New";

export type ToolMetadata = {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  homeLabel?: string;
};

export const toolDefinitions = {
  "scd-design-lab": {
    slug: "scd-design-lab",
    title: "SCD Design Lab",
    description:
      "Practice Slowly Changing Dimension design with realistic customer, product, and membership changes. Preview Type 1, Type 2, Type 3, Type 6, and ignore strategies.",
    category: "Education",
    status: "New",
    homeLabel: "Data modeling lab",
  },
  "data-platform-maturity-checker": {
    slug: "data-platform-maturity-checker",
    title: "Data Platform Maturity Checker",
    description:
      "A lightweight, anonymous maturity signal for platform architecture, governance, analytics delivery, operations, and documentation. Get a directional benchmark in under 3 minutes.",
    category: "Assessment",
    status: "Live",
    homeLabel: "Benchmark tool",
  },
  "governance-scorecard": {
    slug: "governance-scorecard",
    title: "Governance Readiness Scorecard",
    description:
      "Evaluate whether your organization is ready to implement a data governance program. Get a readiness tier, top blockers, and a prioritized 90-day action plan.",
    category: "Governance",
    status: "Live",
    homeLabel: "Governance tool",
  },
  "architecture-roulette": {
    slug: "architecture-roulette",
    title: "Architecture Decision Roulette",
    description:
      "10 real-world data platform scenarios. Pick your approach, then see how a Senior Data Engineer would call it.",
    category: "Architecture",
    status: "Live",
  },
  "data-stack-roast": {
    slug: "data-stack-roast",
    title: "Data Stack Roast",
    description:
      "Select your stack components and get a brutally honest 3-paragraph roast of your architecture choices.",
    category: "Architecture",
    status: "Live",
    homeLabel: "Architecture game",
  },
  "sql-deathmatch": {
    slug: "sql-deathmatch",
    title: "SQL Deathmatch",
    description:
      "15 rounds of paired Spark SQL queries. Pick the winner, learn execution plan reasoning, and discover your tier.",
    category: "SQL",
    status: "Live",
    homeLabel: "SQL challenge",
  },
  "lakehouse-cost-calculator": {
    slug: "lakehouse-cost-calculator",
    title: "Lakehouse Cost Calculator",
    description:
      "Estimate monthly Databricks costs from your cluster config. See optimization suggestions with projected savings.",
    category: "Cost",
    status: "Live",
  },
  "spark-explained": {
    slug: "spark-explained",
    title: "Spark Explained",
    description:
      "Animated pipeline visualizer showing how data flows through Spark stages - partitions, shuffles, skew, and spills.",
    category: "Education",
    status: "Live",
  },
  "data-product-contract-builder": {
    slug: "data-product-contract-builder",
    title: "Data Product Contract Builder",
    description:
      "Turn ownership, grain, freshness, quality, access, lifecycle, and consumer expectations into a copyable data product contract brief.",
    category: "Data Product",
    status: "New",
    homeLabel: "Contract builder",
  },
  "access-model-simulator": {
    slug: "access-model-simulator",
    title: "Access Model Simulator",
    description:
      "Pressure-test Databricks, Fabric, and Power BI access paths against least-privilege controls, sensitivity, and masking expectations.",
    category: "Governance",
    status: "New",
    homeLabel: "Access simulator",
  },
  "lakehouse-table-layout-advisor": {
    slug: "lakehouse-table-layout-advisor",
    title: "Lakehouse Table Layout Advisor",
    description:
      "Assess table size, file pressure, query filters, update patterns, and engine mix to get layout and maintenance guidance.",
    category: "Architecture",
    status: "New",
    homeLabel: "Layout advisor",
  },
  "power-bi-semantic-model-doctor": {
    slug: "power-bi-semantic-model-doctor",
    title: "Power BI Semantic Model Doctor",
    description:
      "Check fact grain, relationships, measures, refresh mode, and report symptoms before a semantic model becomes slow or inconsistent.",
    category: "Power BI",
    status: "New",
    homeLabel: "Model doctor",
  },
  "pipeline-recovery-planner": {
    slug: "pipeline-recovery-planner",
    title: "Pipeline Recovery Planner",
    description:
      "Choose a failure mode, source behavior, checkpoint state, merge strategy, and consumer impact to produce a recovery runbook.",
    category: "Operations",
    status: "New",
    homeLabel: "Recovery planner",
  },
} as const satisfies Record<string, ToolMetadata>;

export type ToolSlug = keyof typeof toolDefinitions;

export const toolCatalog = Object.values(toolDefinitions);

export const featuredToolSlugs = [
  "data-product-contract-builder",
  "access-model-simulator",
  "lakehouse-table-layout-advisor",
  "power-bi-semantic-model-doctor",
  "pipeline-recovery-planner",
] as const satisfies readonly ToolSlug[];

export const featuredTools = featuredToolSlugs.map((slug) => toolDefinitions[slug]);

export const liveToolCount = toolCatalog.length;
