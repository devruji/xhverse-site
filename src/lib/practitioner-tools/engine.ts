import {
  answerValues,
  type AnswerValue,
  type PractitionerToolDefinition,
  type PractitionerToolResult,
  type ToolAnswers,
  type ToolQuestionResult,
  type ToolTier,
} from "./types";

export function isAnswerValue(value: number): value is AnswerValue {
  return answerValues.includes(value as AnswerValue);
}

export function getToolTier(
  score: number,
  tiers: readonly ToolTier[],
): ToolTier {
  const sortedTiers = [...tiers].sort((a, b) => b.minScore - a.minScore);

  for (const tier of sortedTiers) {
    if (score >= tier.minScore) {
      return tier;
    }
  }

  return sortedTiers[sortedTiers.length - 1];
}

export function calculatePractitionerToolResult(
  definition: PractitionerToolDefinition,
  answers: ToolAnswers,
): PractitionerToolResult {
  const questionResults: ToolQuestionResult[] = definition.questions.map((question) => {
    const answerValue = answers[question.id] ?? null;
    const answerOption =
      answerValue === null
        ? null
        : question.options.find((option) => option.value === answerValue) ?? null;
    const fallbackAction = question.actions[1];
    const score = answerValue === null ? 0 : Math.round((answerValue / 4) * 100);

    return {
      id: question.id,
      dimension: question.dimension,
      score,
      answerValue,
      answerLabel: answerOption?.label ?? null,
      action: answerValue === null ? fallbackAction : question.actions[answerValue],
    };
  });

  const rawScore = questionResults.reduce(
    (sum, result) => sum + (result.answerValue ?? 0),
    0,
  );
  const score = Math.round((rawScore / (definition.questions.length * 4)) * 100);
  const gaps = questionResults
    .filter((result) => result.answerValue === null || result.answerValue <= 2)
    .sort((a, b) => a.score - b.score || a.dimension.localeCompare(b.dimension));
  const strengths = questionResults.filter(
    (result) => result.answerValue !== null && result.answerValue >= 4,
  );
  const watchItems = questionResults.filter((result) => result.answerValue === 3);
  const priorityActions =
    gaps.length > 0
      ? gaps.slice(0, 4).map((result) => result.action)
      : watchItems.length > 0
        ? watchItems.slice(0, 4).map((result) => result.action)
        : [...definition.strongResultActions];

  return {
    score,
    tier: getToolTier(score, definition.tiers),
    questionResults,
    gaps,
    strengths,
    priorityActions,
  };
}

export function buildPractitionerToolBrief(
  definition: PractitionerToolDefinition,
  result: PractitionerToolResult,
): string {
  const scoreLines = result.questionResults
    .map(
      (item) =>
        `- ${item.dimension}: ${item.answerLabel ?? "Not answered"} (${item.score}/100)`,
    )
    .join("\n");
  const gapLines =
    result.gaps.length > 0
      ? result.gaps
          .map((item) => `- ${item.dimension}: ${item.action}`)
          .join("\n")
      : "- No critical gaps identified";
  const actionLines = result.priorityActions.map((action) => `- ${action}`).join("\n");

  return [
    `${definition.artifactLabel}`,
    "",
    `Tool: ${definition.title}`,
    `Overall score: ${result.score}/100`,
    `Tier: ${result.tier.label}`,
    result.tier.summary,
    "",
    "Dimension scores:",
    scoreLines,
    "",
    "Gaps to close:",
    gapLines,
    "",
    "Recommended actions:",
    actionLines,
    "",
    `Related reading: ${definition.blogSync.title} (${definition.blogSync.href})`,
    `Advisory path: ${definition.serviceCta.label} (${definition.serviceCta.href})`,
  ].join("\n");
}
