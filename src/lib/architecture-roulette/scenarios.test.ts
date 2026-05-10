import { describe, expect, it } from "vitest";
import { scenarios, type Scenario } from "./scenarios";

describe("scenarios", () => {
  it("contains exactly 10 scenarios", () => {
    expect(scenarios).toHaveLength(10);
  });

  it("all scenarios have unique IDs", () => {
    const ids = scenarios.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("each scenario has exactly 3 options with IDs a, b, c", () => {
    for (const scenario of scenarios) {
      expect(scenario.options).toHaveLength(3);
      const optionIds = scenario.options.map((o) => o.id);
      expect(optionIds).toEqual(["a", "b", "c"]);
    }
  });

  it("xhRecommendation is one of the option IDs", () => {
    for (const scenario of scenarios) {
      expect(["a", "b", "c"]).toContain(scenario.xhRecommendation);
    }
  });

  it("all text fields are non-empty strings", () => {
    for (const scenario of scenarios) {
      expect(scenario.id.length).toBeGreaterThan(0);
      expect(scenario.title.length).toBeGreaterThan(0);
      expect(scenario.situation.length).toBeGreaterThan(0);
      expect(scenario.reasoning.length).toBeGreaterThan(0);

      for (const option of scenario.options) {
        expect(option.label.length).toBeGreaterThan(0);
        expect(option.tradeoff.length).toBeGreaterThan(0);
      }
    }
  });

  it("each scenario conforms to the Scenario type structure", () => {
    for (const scenario of scenarios) {
      const typed: Scenario = scenario;
      expect(typed.id).toBeDefined();
      expect(typed.title).toBeDefined();
      expect(typed.situation).toBeDefined();
      expect(typed.options).toBeDefined();
      expect(typed.xhRecommendation).toBeDefined();
      expect(typed.reasoning).toBeDefined();
    }
  });
});
