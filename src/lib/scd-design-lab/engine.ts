import {
  scdScenarios,
  strategyLabels,
  type DimensionRow,
  type FactRow,
  type ScdScenario,
  type ScdStrategy,
} from "./scenarios";

export type PreviewRowState = "unchanged" | "updated" | "expired" | "inserted";

export type PreviewRow = DimensionRow & {
  state: PreviewRowState;
};

export type FactImpact = {
  label: string;
  amount: number;
};

export type StrategyPreview = {
  strategy: ScdStrategy;
  rows: PreviewRow[];
  factImpact: FactImpact[];
  explanation: string;
};

export type DesignVerdict = "good_fit" | "partial_fit" | "needs_revision";

export type DesignEvaluation = {
  scenarioId: string;
  strategy: ScdStrategy;
  verdict: DesignVerdict;
  score: number;
  verdictLabel: string;
  explanation: string;
  risk: string;
  recommendedStrategy: ScdStrategy;
};

export type LabResult = {
  totalScenarios: number;
  completedScenarios: number;
  totalScore: number;
  averageScore: number;
  tier: "Needs Review" | "Practitioner" | "Dimension Architect";
  evaluations: DesignEvaluation[];
  strongestScenario: string;
  weakestScenario: string;
};

function getCurrentRow(scenario: ScdScenario): DimensionRow {
  const current = scenario.beforeRows.find((row) => row.isCurrent);
  return current ?? scenario.beforeRows[0];
}

function changedValues(row: DimensionRow, scenario: ScdScenario): Record<string, string> {
  return {
    ...row.values,
    [scenario.changedColumn]: scenario.incomingValue,
  };
}

function previousColumnName(scenario: ScdScenario): string {
  return `previous_${scenario.changedColumn}`;
}

function toImpact(rows: PreviewRow[], facts: FactRow[], scenario: ScdScenario): FactImpact[] {
  const impact: Record<string, number> = {};

  for (const fact of facts) {
    const matched = rows.find((row) => {
      if (row.naturalKey !== fact.naturalKey) return false;
      if (!row.isCurrent && row.validTo !== "9999-12-31") {
        return fact.eventDate >= row.validFrom && fact.eventDate < row.validTo;
      }
      if (row.validFrom <= fact.eventDate && row.validTo >= fact.eventDate) return true;
      return row.isCurrent;
    });
    const label = matched?.values[scenario.changedColumn] ?? "Unmatched";
    impact[label] = (impact[label] ?? 0) + fact.amount;
  }

  return Object.entries(impact).map(([label, amount]) => ({ label, amount }));
}

export function findScenario(scenarioId: string): ScdScenario {
  const scenario = scdScenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown SCD scenario: ${scenarioId}`);
  }
  return scenario;
}

export function buildStrategyPreview(
  scenario: ScdScenario,
  strategy: ScdStrategy,
): StrategyPreview {
  const current = getCurrentRow(scenario);
  const updatedValues = changedValues(current, scenario);
  const nextSk = String(Number(current.sk) + 1);

  if (strategy === "type_1") {
    const rows: PreviewRow[] = [
      { ...current, values: updatedValues, state: "updated" },
    ];
    return {
      strategy,
      rows,
      factImpact: toImpact(rows, scenario.facts, scenario),
      explanation:
        "The current row is overwritten. This is fast and simple, but prior facts join to the new value.",
    };
  }

  if (strategy === "type_2") {
    const rows: PreviewRow[] = [
      {
        ...current,
        validTo: scenario.changeDate,
        isCurrent: false,
        state: "expired",
      },
      {
        ...current,
        sk: nextSk,
        values: updatedValues,
        validFrom: scenario.changeDate,
        validTo: "9999-12-31",
        isCurrent: true,
        state: "inserted",
      },
    ];
    return {
      strategy,
      rows,
      factImpact: toImpact(rows, scenario.facts, scenario),
      explanation:
        "The old row is expired and a new current row is inserted, preserving point-in-time history.",
    };
  }

  if (strategy === "type_3") {
    const previousKey = previousColumnName(scenario);
    const rows: PreviewRow[] = [
      {
        ...current,
        values: {
          ...updatedValues,
          [previousKey]: current.values[scenario.changedColumn],
        },
        state: "updated",
      },
    ];
    return {
      strategy,
      rows,
      factImpact: toImpact(rows, scenario.facts, scenario),
      explanation:
        "The current value is overwritten and one previous value is retained on the same row.",
    };
  }

  if (strategy === "type_6") {
    const previousKey = previousColumnName(scenario);
    const rows: PreviewRow[] = [
      {
        ...current,
        values: {
          ...current.values,
          current_value: scenario.incomingValue,
        },
        validTo: scenario.changeDate,
        isCurrent: false,
        state: "expired",
      },
      {
        ...current,
        sk: nextSk,
        values: {
          ...updatedValues,
          [previousKey]: current.values[scenario.changedColumn],
          current_value: scenario.incomingValue,
        },
        validFrom: scenario.changeDate,
        validTo: "9999-12-31",
        isCurrent: true,
        state: "inserted",
      },
    ];
    return {
      strategy,
      rows,
      factImpact: toImpact(rows, scenario.facts, scenario),
      explanation:
        "The model keeps Type 2 history while also carrying the latest current value for hybrid reporting.",
    };
  }

  const rows: PreviewRow[] = [{ ...current, state: "unchanged" }];
  return {
    strategy,
    rows,
    factImpact: toImpact(rows, scenario.facts, scenario),
    explanation:
      "The incoming change is ignored. This is only safe when the record or attribute should not drive analytics.",
  };
}

export function evaluateDesign(
  scenario: ScdScenario,
  strategy: ScdStrategy,
): DesignEvaluation {
  if (strategy === scenario.recommendedStrategy) {
    return {
      scenarioId: scenario.id,
      strategy,
      verdict: "good_fit",
      score: 100,
      verdictLabel: "Good fit",
      explanation: scenario.lesson,
      risk: scenario.risk,
      recommendedStrategy: scenario.recommendedStrategy,
    };
  }

  if (scenario.partialStrategies.includes(strategy)) {
    return {
      scenarioId: scenario.id,
      strategy,
      verdict: "partial_fit",
      score: 60,
      verdictLabel: "Partial fit",
      explanation: `${strategyLabels[strategy]} can work, but ${strategyLabels[scenario.recommendedStrategy]} fits the stated reporting question better.`,
      risk: scenario.risk,
      recommendedStrategy: scenario.recommendedStrategy,
    };
  }

  return {
    scenarioId: scenario.id,
    strategy,
    verdict: "needs_revision",
    score: 20,
    verdictLabel: "Needs revision",
    explanation: `${strategyLabels[strategy]} does not answer this business-time requirement cleanly.`,
    risk: scenario.risk,
    recommendedStrategy: scenario.recommendedStrategy,
  };
}

export function calculateLabResult(
  answers: Record<string, ScdStrategy>,
): LabResult {
  const evaluations = scdScenarios
    .filter((scenario) => answers[scenario.id])
    .map((scenario) => evaluateDesign(scenario, answers[scenario.id]));

  const totalScore = evaluations.reduce((sum, item) => sum + item.score, 0);
  const completedScenarios = evaluations.length;
  const averageScore =
    completedScenarios > 0 ? Math.round(totalScore / completedScenarios) : 0;
  const tier =
    averageScore >= 85
      ? "Dimension Architect"
      : averageScore >= 60
        ? "Practitioner"
        : "Needs Review";
  const sorted = [...evaluations].sort((a, b) => b.score - a.score);

  return {
    totalScenarios: scdScenarios.length,
    completedScenarios,
    totalScore,
    averageScore,
    tier,
    evaluations,
    strongestScenario: sorted[0]?.scenarioId ?? "",
    weakestScenario: sorted.at(-1)?.scenarioId ?? "",
  };
}

export function buildLabBrief(result: LabResult): string {
  return [
    "SCD Design Lab — xhverse.co/tools/scd-design-lab",
    "",
    `Score: ${result.averageScore}/100 — ${result.tier}`,
    `Completed: ${result.completedScenarios}/${result.totalScenarios} scenarios`,
    "",
    "Core lesson: SCD is a business-time decision. The row pattern must match the reporting question.",
    "",
    "Try it yourself: https://xhverse.co/tools/scd-design-lab",
  ].join("\n");
}
