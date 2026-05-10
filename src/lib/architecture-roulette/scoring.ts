import type { Scenario } from "./scenarios";

export type ScenarioResult = {
  scenarioId: string;
  userPick: "a" | "b" | "c";
  xhPick: "a" | "b" | "c";
  agreed: boolean;
};

export type RouletteResult = {
  totalScenarios: number;
  answered: number;
  agreements: number;
  agreementPercentage: number;
  scenarioResults: ScenarioResult[];
};

export function calculateRouletteResult(
  scenarios: Scenario[],
  answers: Record<string, "a" | "b" | "c">,
): RouletteResult {
  const scenarioResults: ScenarioResult[] = [];

  for (const scenario of scenarios) {
    const userPick = answers[scenario.id];
    if (userPick) {
      scenarioResults.push({
        scenarioId: scenario.id,
        userPick,
        xhPick: scenario.xhRecommendation,
        agreed: userPick === scenario.xhRecommendation,
      });
    }
  }

  const answered = scenarioResults.length;
  const agreements = scenarioResults.filter((r) => r.agreed).length;
  const agreementPercentage = answered > 0 ? Math.round((agreements / answered) * 100) : 0;

  return {
    totalScenarios: scenarios.length,
    answered,
    agreements,
    agreementPercentage,
    scenarioResults,
  };
}

export function buildRouletteBrief(result: RouletteResult): string {
  const lines = [
    "Architecture Decision Roulette — xhverse.co/tools/architecture-roulette",
    "",
    `Agreement rate: ${result.agreements}/${result.answered} (${result.agreementPercentage}%)`,
    `You and XH aligned on ${result.agreements} out of ${result.answered} architecture decisions.`,
    "",
    "Try it yourself: https://xhverse.co/tools/architecture-roulette",
  ];

  return lines.join("\n");
}
