import type { BlogPost } from "./blog";
import { toolDefinitions, type ToolSlug } from "./tools";

type PortfolioTopicId = "architecture" | "governance" | "modeling" | "operations";

type PortfolioTopic = {
  id: PortfolioTopicId;
  number: "01" | "02" | "03" | "04";
  title: string;
  purpose: string;
  toolSlug: ToolSlug;
  articleSlug: string;
};

export const portfolioTopics = [
  {
    id: "architecture",
    number: "01",
    title: "Architecture",
    purpose: "Choose where workloads run and define the contracts between platforms.",
    toolSlug: "workload-placement-simulator",
    articleSlug: "data-product-as-platform-contract",
  },
  {
    id: "governance",
    number: "02",
    title: "Governance",
    purpose: "Make access rules, ownership, and policy enforcement explicit.",
    toolSlug: "access-model-simulator",
    articleSlug: "abac-row-filters-column-masks-production-ownership",
  },
  {
    id: "modeling",
    number: "03",
    title: "Modeling",
    purpose: "Keep change history and analytical grain clear.",
    toolSlug: "scd-design-lab",
    articleSlug: "big-table-vs-star-schema",
  },
  {
    id: "operations",
    number: "04",
    title: "Operations",
    purpose: "Plan recoverable pipelines and define day-two responsibilities.",
    toolSlug: "pipeline-recovery-planner",
    articleSlug: "serverless-data-engineering-operating-model",
  },
] as const satisfies readonly PortfolioTopic[];

const groupDefinitions = [
  {
    id: "architecture",
    title: "Architecture",
    description: "Placement, table layout, data contracts, and platform maturity.",
  },
  {
    id: "governance",
    title: "Governance",
    description: "Access models and readiness for a governance program.",
  },
  {
    id: "modeling",
    title: "Modeling",
    description: "Change history, analytical grain, and semantic models.",
  },
  {
    id: "operations",
    title: "Operations",
    description: "Recovery decisions and a usable runbook.",
  },
  {
    id: "cost",
    title: "Cost estimates",
    description: "Directional estimates for cloud egress and lakehouse compute.",
  },
  {
    id: "practice",
    title: "Practice and experiments",
    description: "Explore Spark, compare SQL, and test architecture choices.",
  },
] as const;

type ToolGroupId = (typeof groupDefinitions)[number]["id"];
type ToolDefinition = (typeof toolDefinitions)[ToolSlug];

const toolGroupBySlug = {
  "workload-placement-simulator": "architecture",
  "lakehouse-table-layout-advisor": "architecture",
  "data-product-contract-builder": "architecture",
  "data-platform-maturity-checker": "architecture",
  "access-model-simulator": "governance",
  "governance-scorecard": "governance",
  "scd-design-lab": "modeling",
  "power-bi-semantic-model-doctor": "modeling",
  "pipeline-recovery-planner": "operations",
  "egress-pricing-calculator": "cost",
  "lakehouse-cost-calculator": "cost",
  "spark-explained": "practice",
  "sql-deathmatch": "practice",
  "architecture-roulette": "practice",
  "data-stack-roast": "practice",
} as const satisfies Record<ToolSlug, ToolGroupId>;

const groupedTools: Record<ToolGroupId, ToolDefinition[]> = {
  architecture: [],
  governance: [],
  modeling: [],
  operations: [],
  cost: [],
  practice: [],
};

for (const slug of Object.keys(toolGroupBySlug) as ToolSlug[]) {
  groupedTools[toolGroupBySlug[slug]].push(toolDefinitions[slug]);
}

export const toolGroups = groupDefinitions.map((group) => ({
  ...group,
  tools: groupedTools[group.id],
}));

export function resolvePortfolioTopics(
  publishedPosts: readonly BlogPost[],
): Array<PortfolioTopic & { tool: ToolDefinition; article: BlogPost | undefined }> {
  return portfolioTopics.map((topic) => ({
    ...topic,
    tool: toolDefinitions[topic.toolSlug],
    article: publishedPosts.find((post) => post.slug === topic.articleSlug),
  }));
}
