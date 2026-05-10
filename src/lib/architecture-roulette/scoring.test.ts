import { describe, expect, it } from "vitest";
import { scenarios } from "./scenarios";
import { buildRouletteBrief, calculateRouletteResult } from "./scoring";

function allAgreeing(): Record<string, "a" | "b" | "c"> {
  return Object.fromEntries(
    scenarios.map((s) => [s.id, s.xhRecommendation]),
  );
}

function allDisagreeing(): Record<string, "a" | "b" | "c"> {
  return Object.fromEntries(
    scenarios.map((s) => {
      const wrong = s.xhRecommendation === "a" ? "b" : "a";
      return [s.id, wrong];
    }),
  );
}

describe("calculateRouletteResult", () => {
  it("returns 100% when all answers agree with XH", () => {
    const result = calculateRouletteResult(scenarios, allAgreeing());

    expect(result.totalScenarios).toBe(10);
    expect(result.answered).toBe(10);
    expect(result.agreements).toBe(10);
    expect(result.agreementPercentage).toBe(100);
    expect(result.scenarioResults).toHaveLength(10);
    expect(result.scenarioResults.every((r) => r.agreed)).toBe(true);
  });

  it("returns 0% when no answers agree with XH", () => {
    const result = calculateRouletteResult(scenarios, allDisagreeing());

    expect(result.totalScenarios).toBe(10);
    expect(result.answered).toBe(10);
    expect(result.agreements).toBe(0);
    expect(result.agreementPercentage).toBe(0);
    expect(result.scenarioResults.every((r) => !r.agreed)).toBe(true);
  });

  it("returns 50% when 5 out of 10 agree", () => {
    const answers: Record<string, "a" | "b" | "c"> = {};
    scenarios.forEach((s, i) => {
      if (i < 5) {
        answers[s.id] = s.xhRecommendation;
      } else {
        answers[s.id] = s.xhRecommendation === "a" ? "b" : "a";
      }
    });

    const result = calculateRouletteResult(scenarios, answers);

    expect(result.answered).toBe(10);
    expect(result.agreements).toBe(5);
    expect(result.agreementPercentage).toBe(50);
  });

  it("handles partial answers correctly (3/10 answered)", () => {
    const answers: Record<string, "a" | "b" | "c"> = {};
    for (let i = 0; i < 3; i++) {
      answers[scenarios[i].id] = scenarios[i].xhRecommendation;
    }

    const result = calculateRouletteResult(scenarios, answers);

    expect(result.totalScenarios).toBe(10);
    expect(result.answered).toBe(3);
    expect(result.agreements).toBe(3);
    expect(result.agreementPercentage).toBe(100);
    expect(result.scenarioResults).toHaveLength(3);
  });

  it("handles empty answers with 0 agreements and 0%", () => {
    const result = calculateRouletteResult(scenarios, {});

    expect(result.totalScenarios).toBe(10);
    expect(result.answered).toBe(0);
    expect(result.agreements).toBe(0);
    expect(result.agreementPercentage).toBe(0);
    expect(result.scenarioResults).toHaveLength(0);
  });

  it("populates scenarioResult fields correctly", () => {
    const answers: Record<string, "a" | "b" | "c"> = {
      [scenarios[0].id]: "b",
    };

    const result = calculateRouletteResult(scenarios, answers);

    expect(result.scenarioResults[0].scenarioId).toBe(scenarios[0].id);
    expect(result.scenarioResults[0].userPick).toBe("b");
    expect(result.scenarioResults[0].xhPick).toBe(
      scenarios[0].xhRecommendation,
    );
    expect(result.scenarioResults[0].agreed).toBe(
      "b" === scenarios[0].xhRecommendation,
    );
  });

  it("ignores answers for IDs not in scenarios", () => {
    const answers: Record<string, "a" | "b" | "c"> = {
      "nonexistent-id": "a",
      [scenarios[0].id]: scenarios[0].xhRecommendation,
    };

    const result = calculateRouletteResult(scenarios, answers);

    expect(result.answered).toBe(1);
    expect(result.agreements).toBe(1);
  });
});

describe("buildRouletteBrief", () => {
  it("contains agreement rate and URL", () => {
    const result = calculateRouletteResult(scenarios, allAgreeing());
    const brief = buildRouletteBrief(result);

    expect(brief).toContain("10/10 (100%)");
    expect(brief).toContain(
      "https://xhverse.co/tools/architecture-roulette",
    );
    expect(brief).toContain("Architecture Decision Roulette");
  });

  it("shows correct numbers for partial agreement", () => {
    const answers: Record<string, "a" | "b" | "c"> = {};
    scenarios.forEach((s, i) => {
      if (i < 7) {
        answers[s.id] = s.xhRecommendation;
      } else {
        answers[s.id] = s.xhRecommendation === "a" ? "b" : "a";
      }
    });

    const result = calculateRouletteResult(scenarios, answers);
    const brief = buildRouletteBrief(result);

    expect(brief).toContain("7/10 (70%)");
    expect(brief).toContain("aligned on 7 out of 10");
  });

  it("shows 0/0 for empty results", () => {
    const result = calculateRouletteResult(scenarios, {});
    const brief = buildRouletteBrief(result);

    expect(brief).toContain("0/0 (0%)");
    expect(brief).toContain("aligned on 0 out of 0");
  });
});
