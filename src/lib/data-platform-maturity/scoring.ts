import {
  assessmentQuestions,
  categoryLabels,
  maturityCategories,
  type AssessmentAnswers,
  type MaturityCategory,
} from "./questions";

export type MaturityTier =
  | "Foundational"
  | "Developing"
  | "Operational"
  | "Advanced";

export type CategoryScore = {
  category: MaturityCategory;
  label: string;
  score: number;
  answered: number;
  total: number;
};

export type AssessmentResult = {
  overallScore: number;
  tier: MaturityTier;
  categoryScores: CategoryScore[];
  strongestCategory: CategoryScore;
  weakestCategory: CategoryScore;
  nextActions: string[];
};

export type BenchmarkSummary = {
  submissionCount: number;
  averageOverallScore: number | null;
  averageCategoryScores: Record<MaturityCategory, number | null>;
  tierDistribution: Record<MaturityTier, number>;
};

export type BenchmarkPosition = "above" | "near" | "below" | "unavailable";

export const maturityTiers: MaturityTier[] = [
  "Foundational",
  "Developing",
  "Operational",
  "Advanced",
];

const nextActionByCategory: Record<MaturityCategory, string> = {
  platform_architecture:
    "Clarify the target platform architecture, environment model, and standard workload patterns before expanding more tooling.",
  governance:
    "Define accountable owners, access rules, exception handling, and review cadence for platform controls.",
  analytics_delivery:
    "Standardize delivery quality gates for data products, semantic definitions, testing, and production handover.",
  operations:
    "Make platform operations observable through runbooks, service ownership, incident paths, and cost or reliability review.",
  documentation:
    "Create a small maintained knowledge base for architecture decisions, standards, ownership, and common delivery paths.",
};

export function scoreToTier(score: number): MaturityTier {
  if (score >= 80) return "Advanced";
  if (score >= 60) return "Operational";
  if (score >= 40) return "Developing";
  return "Foundational";
}

export function calculateAssessmentResult(
  answers: AssessmentAnswers,
): AssessmentResult {
  const categoryScores = maturityCategories.map((category) => {
    const categoryQuestions = assessmentQuestions.filter(
      (question) => question.category === category,
    );
    const answeredValues = categoryQuestions
      .map((question) => answers[question.id])
      .filter((value): value is NonNullable<typeof value> =>
        Number.isInteger(value),
      );
    const rawScore = answeredValues.reduce((sum, value) => sum + value, 0);
    const maxScore = categoryQuestions.length * 5;
    const score = Math.round((rawScore / maxScore) * 100);

    return {
      category,
      label: categoryLabels[category],
      score,
      answered: answeredValues.length,
      total: categoryQuestions.length,
    };
  });

  const totalRawScore = assessmentQuestions.reduce(
    (sum, question) => sum + (answers[question.id] ?? 0),
    0,
  );
  const overallScore = Math.round(
    (totalRawScore / (assessmentQuestions.length * 5)) * 100,
  );

  const sortedByScore = [...categoryScores].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.label.localeCompare(b.label);
  });
  const strongestCategory = sortedByScore[0];
  const weakestCategory = sortedByScore[sortedByScore.length - 1];
  const nextActionCategories = [...categoryScores]
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.label.localeCompare(b.label);
    })
    .slice(0, 3);

  return {
    overallScore,
    tier: scoreToTier(overallScore),
    categoryScores,
    strongestCategory,
    weakestCategory,
    nextActions: nextActionCategories.map(
      (item) => nextActionByCategory[item.category],
    ),
  };
}

export function getBenchmarkPosition(
  score: number,
  benchmarkAverage: number | null,
): BenchmarkPosition {
  if (benchmarkAverage === null) return "unavailable";
  if (score >= benchmarkAverage + 5) return "above";
  if (score <= benchmarkAverage - 5) return "below";
  return "near";
}

export function getBenchmarkMessage(position: BenchmarkPosition): string {
  if (position === "above") {
    return "Your result is above the current directional public benchmark.";
  }
  if (position === "below") {
    return "Your result is below the current directional public benchmark.";
  }
  if (position === "near") {
    return "Your result is near the current directional public benchmark.";
  }
  return "The public benchmark will appear once aggregate submissions are available.";
}

export function buildReadinessBrief(
  result: AssessmentResult,
  benchmark: BenchmarkSummary | null,
): string {
  const benchmarkPosition = getBenchmarkPosition(
    result.overallScore,
    benchmark?.averageOverallScore ?? null,
  );
  const categorySummary = result.categoryScores
    .map((item) => `- ${item.label}: ${item.score}/100`)
    .join("\n");
  const nextActions = result.nextActions
    .map((action) => `- ${action}`)
    .join("\n");

  return [
    "Data Platform Architecture Readiness Brief",
    "",
    `Overall maturity score: ${result.overallScore}/100`,
    `Maturity tier: ${result.tier}`,
    "",
    "Category summary:",
    categorySummary,
    "",
    `Strongest category: ${result.strongestCategory.label} (${result.strongestCategory.score}/100)`,
    `Weakest category: ${result.weakestCategory.label} (${result.weakestCategory.score}/100)`,
    "",
    "Recommended next actions:",
    nextActions,
    "",
    "Benchmark comparison:",
    getBenchmarkMessage(benchmarkPosition),
    benchmark?.averageOverallScore === null || !benchmark
      ? "Average public benchmark: not available yet"
      : `Average public benchmark: ${benchmark.averageOverallScore}/100 from ${benchmark.submissionCount} anonymous submission(s)`,
    "",
    "Enterprise-grade comparison requires deeper architecture context, including operating model, platform architecture, governance structure, data ownership, security model, delivery process, and business goals.",
    "For enterprise-grade comparison, request an architecture review: contact@xhverse.co",
  ].join("\n");
}
