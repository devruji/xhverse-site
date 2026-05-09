import {
  governanceCategories,
  governanceQuestions,
  categoryLabels,
  type GovernanceAnswers,
  type GovernanceCategory,
} from "./questions";

export type ReadinessTier =
  | "Not Ready"
  | "Partially Ready"
  | "Ready with Gaps"
  | "Fully Ready";

export const readinessTiers: ReadinessTier[] = [
  "Not Ready",
  "Partially Ready",
  "Ready with Gaps",
  "Fully Ready",
];

export type CategoryScore = {
  category: GovernanceCategory;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
};

export type Blocker = {
  category: GovernanceCategory;
  label: string;
  reason: string;
};

export type ActionItem = {
  priority: number;
  action: string;
  category: GovernanceCategory;
  timeframe: string;
};

export type GovernanceResult = {
  overallPercentage: number;
  tier: ReadinessTier;
  categoryScores: CategoryScore[];
  topBlockers: Blocker[];
  actionPlan: ActionItem[];
};

const blockerReasons: Record<GovernanceCategory, string> = {
  sponsorship:
    "Governance programs without executive sponsorship and clear accountability fail 70% of the time within 12 months.",
  policy:
    "Without defined policies, governance becomes subjective enforcement — teams resist rules that aren't written down.",
  tooling:
    "Manual governance doesn't scale. Without integrated tooling, compliance becomes a bottleneck rather than an enabler.",
  process:
    "Tools and policies mean nothing without operating processes. Governance that nobody runs is governance that doesn't exist.",
  regulatory:
    "High regulatory exposure without matching controls creates material compliance risk and potential enforcement action.",
};

const actionsByCategory: Record<GovernanceCategory, ActionItem[]> = {
  sponsorship: [
    { priority: 0, action: "Identify and confirm an executive sponsor with budget authority", category: "sponsorship", timeframe: "Week 1-2" },
    { priority: 0, action: "Define data owner roles and assign to domain leads", category: "sponsorship", timeframe: "Week 2-4" },
    { priority: 0, action: "Establish governance board with regular cadence and decision authority", category: "sponsorship", timeframe: "Week 4-8" },
  ],
  policy: [
    { priority: 0, action: "Create a data classification scheme (public, internal, confidential, restricted)", category: "policy", timeframe: "Week 1-3" },
    { priority: 0, action: "Document retention policies for top 10 critical datasets", category: "policy", timeframe: "Week 3-6" },
    { priority: 0, action: "Define data quality rules and SLAs for tier-1 data products", category: "policy", timeframe: "Week 6-10" },
  ],
  tooling: [
    { priority: 0, action: "Deploy or activate a data catalog and register critical assets", category: "tooling", timeframe: "Week 1-4" },
    { priority: 0, action: "Implement automated PII scanning on ingest pipelines", category: "tooling", timeframe: "Week 4-8" },
    { priority: 0, action: "Integrate access management with platform identity (Unity Catalog / Purview)", category: "tooling", timeframe: "Week 6-12" },
  ],
  process: [
    { priority: 0, action: "Identify and activate data stewards across key domains", category: "process", timeframe: "Week 1-3" },
    { priority: 0, action: "Define a change management process for schema and contract changes", category: "process", timeframe: "Week 3-6" },
    { priority: 0, action: "Create incident response playbook for data quality issues", category: "process", timeframe: "Week 4-8" },
  ],
  regulatory: [
    { priority: 0, action: "Map data flows to identify cross-border and jurisdictional requirements", category: "regulatory", timeframe: "Week 1-4" },
    { priority: 0, action: "Implement consent preference center for customer-facing data collection", category: "regulatory", timeframe: "Week 4-10" },
    { priority: 0, action: "Schedule internal audit readiness review with compliance team", category: "regulatory", timeframe: "Week 6-12" },
  ],
};

export function scoreToTier(percentage: number): ReadinessTier {
  if (percentage >= 85) return "Fully Ready";
  if (percentage >= 65) return "Ready with Gaps";
  if (percentage >= 40) return "Partially Ready";
  return "Not Ready";
}

export function calculateGovernanceResult(
  answers: GovernanceAnswers,
): GovernanceResult {
  const categoryScores: CategoryScore[] = governanceCategories.map(
    (category) => {
      const questions = governanceQuestions.filter(
        (q) => q.category === category,
      );
      const totalScore = questions.reduce(
        (sum, q) => sum + (answers[q.id] ?? 0),
        0,
      );
      const maxScore = questions.length * 4;
      return {
        category,
        label: categoryLabels[category],
        score: totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
      };
    },
  );

  const totalScore = categoryScores.reduce((sum, c) => sum + c.score, 0);
  const totalMax = categoryScores.reduce((sum, c) => sum + c.maxScore, 0);
  const overallPercentage = Math.round((totalScore / totalMax) * 100);

  const weakest = [...categoryScores].sort(
    (a, b) => a.percentage - b.percentage,
  );
  const topBlockers: Blocker[] = weakest
    .filter((c) => c.percentage < 65)
    .slice(0, 3)
    .map((c) => ({
      category: c.category,
      label: c.label,
      reason: blockerReasons[c.category],
    }));

  const actionPlan: ActionItem[] = weakest
    .slice(0, 3)
    .flatMap((c) =>
      actionsByCategory[c.category].map((a, i) => ({
        ...a,
        priority: i + 1,
      })),
    )
    .slice(0, 8);

  return {
    overallPercentage,
    tier: scoreToTier(overallPercentage),
    categoryScores,
    topBlockers,
    actionPlan,
  };
}

export function buildGovernanceBrief(result: GovernanceResult): string {
  const categorySummary = result.categoryScores
    .map((c) => `- ${c.label}: ${c.percentage}%`)
    .join("\n");
  const blockers = result.topBlockers
    .map((b) => `- ${b.label}: ${b.reason}`)
    .join("\n");
  const actions = result.actionPlan
    .map((a) => `- [${a.timeframe}] ${a.action}`)
    .join("\n");

  return [
    "Data Governance Readiness Brief",
    "",
    `Overall readiness: ${result.overallPercentage}%`,
    `Tier: ${result.tier}`,
    "",
    "Category scores:",
    categorySummary,
    "",
    "Top blockers:",
    blockers || "- None identified",
    "",
    "90-day action plan:",
    actions,
    "",
    "This assessment evaluates organizational readiness to implement or scale a data governance program.",
    "For help turning this action plan into an execution roadmap: contact@xhverse.co",
  ].join("\n");
}
