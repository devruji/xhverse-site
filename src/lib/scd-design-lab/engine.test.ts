import { describe, expect, it } from "vitest";
import {
  buildLabBrief,
  buildStrategyPreview,
  calculateLabResult,
  evaluateDesign,
  findScenario,
} from "./engine";
import { scdScenarios, type ScdStrategy } from "./scenarios";

describe("findScenario", () => {
  it("returns known scenarios and rejects unknown ids", () => {
    expect(findScenario("loyalty-tier-at-transaction-time").title).toBe(
      "Loyalty Tier Changed",
    );
    expect(() => findScenario("missing")).toThrow("Unknown SCD scenario");
  });
});

describe("buildStrategyPreview", () => {
  const scenario = findScenario("loyalty-tier-at-transaction-time");

  it("builds Type 1 overwrite previews", () => {
    const preview = buildStrategyPreview(scenario, "type_1");

    expect(preview.rows).toHaveLength(1);
    expect(preview.rows[0].values.tier).toBe("Gold");
    expect(preview.rows[0].state).toBe("updated");
    expect(preview.factImpact).toEqual([{ label: "Gold", amount: 2500 }]);
  });

  it("uses the current row for out-of-range current-state facts", () => {
    const preview = buildStrategyPreview(
      {
        ...scenario,
        facts: [
          {
            id: "EARLY-1",
            eventDate: "2025-12-01",
            naturalKey: "C001",
            amount: 300,
          },
        ],
      },
      "type_1",
    );

    expect(preview.factImpact).toEqual([{ label: "Gold", amount: 300 }]);
  });

  it("builds Type 2 history previews", () => {
    const preview = buildStrategyPreview(scenario, "type_2");

    expect(preview.rows.map((row) => row.state)).toEqual(["expired", "inserted"]);
    expect(preview.rows[0].validTo).toBe("2026-03-01");
    expect(preview.rows[1].isCurrent).toBe(true);
    expect(preview.factImpact).toEqual([
      { label: "Bronze", amount: 1000 },
      { label: "Gold", amount: 1500 },
    ]);
  });

  it("builds Type 3 previous-value previews", () => {
    const scenario3 = findScenario("product-category-reclassification");
    const preview = buildStrategyPreview(scenario3, "type_3");

    expect(preview.rows).toHaveLength(1);
    expect(preview.rows[0].values.category).toBe("Health Snacks");
    expect(preview.rows[0].values.previous_category).toBe("Snacks");
  });

  it("builds Type 6 hybrid previews", () => {
    const scenario6 = findScenario("membership-plan-hybrid-reporting");
    const preview = buildStrategyPreview(scenario6, "type_6");

    expect(preview.rows).toHaveLength(2);
    expect(preview.rows[0].values.current_value).toBe("Premier");
    expect(preview.rows[1].values.previous_plan).toBe("Plus");
    expect(preview.factImpact).toEqual([
      { label: "Plus", amount: 1200 },
      { label: "Premier", amount: 2100 },
    ]);
  });

  it("builds ignore previews", () => {
    const ignoreScenario = findScenario("test-customer-ignore");
    const preview = buildStrategyPreview(ignoreScenario, "ignore");

    expect(preview.rows).toHaveLength(1);
    expect(preview.rows[0].state).toBe("unchanged");
    expect(preview.rows[0].values.name).toBe("Temporary User");
  });

  it("falls back to the first row and labels unmatched facts", () => {
    const preview = buildStrategyPreview(
      {
        ...scenario,
        beforeRows: [{ ...scenario.beforeRows[0], isCurrent: false }],
        facts: [
          {
            id: "OTHER-1",
            eventDate: "2026-01-20",
            naturalKey: "OTHER",
            amount: 50,
          },
        ],
      },
      "ignore",
    );

    expect(preview.rows[0].naturalKey).toBe("C001");
    expect(preview.factImpact).toEqual([{ label: "Unmatched", amount: 50 }]);
  });
});

describe("evaluateDesign", () => {
  const scenario = findScenario("loyalty-tier-at-transaction-time");

  it("scores recommended, partial, and incorrect strategies", () => {
    expect(evaluateDesign(scenario, "type_2")).toMatchObject({
      verdict: "good_fit",
      score: 100,
    });
    expect(evaluateDesign(scenario, "type_6")).toMatchObject({
      verdict: "partial_fit",
      score: 60,
    });
    expect(evaluateDesign(scenario, "type_1")).toMatchObject({
      verdict: "needs_revision",
      score: 20,
    });
  });
});

describe("calculateLabResult", () => {
  it("returns an empty baseline before any scenario is answered", () => {
    expect(calculateLabResult({})).toEqual({
      totalScenarios: scdScenarios.length,
      completedScenarios: 0,
      totalScore: 0,
      averageScore: 0,
      tier: "Needs Review",
      evaluations: [],
      strongestScenario: "",
      weakestScenario: "",
    });
  });

  it("assigns result tiers and strongest/weakest scenarios", () => {
    const perfectAnswers = Object.fromEntries(
      scdScenarios.map((scenario) => [scenario.id, scenario.recommendedStrategy]),
    ) as Record<string, ScdStrategy>;
    expect(calculateLabResult(perfectAnswers).tier).toBe("Dimension Architect");

    const mixed = calculateLabResult({
      "loyalty-tier-at-transaction-time": "type_6",
      "customer-email-current-contact": "type_2",
      "product-category-reclassification": "type_3",
    });
    expect(mixed.tier).toBe("Practitioner");
    expect(mixed.strongestScenario).toBe("product-category-reclassification");
    expect(mixed.weakestScenario).toBe("customer-email-current-contact");

    const weak = calculateLabResult({
      "loyalty-tier-at-transaction-time": "type_1",
    });
    expect(weak.tier).toBe("Needs Review");
  });
});

describe("buildLabBrief", () => {
  it("builds a copyable summary", () => {
    const result = calculateLabResult({
      "loyalty-tier-at-transaction-time": "type_2",
    });

    expect(buildLabBrief(result)).toContain("SCD Design Lab");
    expect(buildLabBrief(result)).toContain("Completed: 1/5 scenarios");
  });
});
