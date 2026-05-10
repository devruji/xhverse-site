import { describe, expect, it } from "vitest";
import {
  buildRoastBrief,
  buildShareableSnippet,
  generateRoast,
  roastParagraphs,
} from "./roast-engine";
import { stackCategories, stackOptions, type StackSelections } from "./stacks";

function makeSelections(overrides: Partial<StackSelections> = {}): StackSelections {
  return {
    storage: "delta_lake",
    orchestrator: "airflow",
    compute: "databricks",
    bi: "power_bi",
    governance: "unity_catalog",
    team_size: "4_10",
    ...overrides,
  };
}

describe("roastParagraphs data", () => {
  it("has at least 30 paragraphs total", () => {
    expect(roastParagraphs.length).toBeGreaterThanOrEqual(30);
  });

  it("has at least 8 paragraphs per slot", () => {
    const architecture = roastParagraphs.filter((p) => p.slot === "architecture");
    const operations = roastParagraphs.filter((p) => p.slot === "operations");
    const growth = roastParagraphs.filter((p) => p.slot === "growth");

    expect(architecture.length).toBeGreaterThanOrEqual(8);
    expect(operations.length).toBeGreaterThanOrEqual(8);
    expect(growth.length).toBeGreaterThanOrEqual(8);
  });

  it("every paragraph has non-empty text", () => {
    for (const p of roastParagraphs) {
      expect(p.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("every paragraph has at least one condition", () => {
    for (const p of roastParagraphs) {
      expect(p.conditions.length).toBeGreaterThan(0);
    }
  });

  it("all conditions reference valid categories and option IDs", () => {
    for (const p of roastParagraphs) {
      for (const condition of p.conditions) {
        expect(stackCategories).toContain(condition.category);
        const validIds = stackOptions[condition.category].map((o) => o.id);
        for (const optionId of condition.optionIds) {
          expect(validIds).toContain(optionId);
        }
      }
    }
  });
});

describe("generateRoast", () => {
  it("produces exactly 3 non-empty paragraphs for any valid selection", () => {
    const selections = makeSelections();
    const result = generateRoast(selections);

    expect(result.roastParagraphs).toHaveLength(3);
    for (const paragraph of result.roastParagraphs) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    }
  });

  it("produces 3-5 improvement path items", () => {
    const selections = makeSelections();
    const result = generateRoast(selections);

    expect(result.improvementPath.length).toBeGreaterThanOrEqual(3);
    expect(result.improvementPath.length).toBeLessThanOrEqual(5);
  });

  it("produces a shareable snippet under 280 chars", () => {
    const selections = makeSelections();
    const result = generateRoast(selections);

    expect(result.shareableSnippet.length).toBeLessThanOrEqual(280);
    expect(result.shareableSnippet.length).toBeGreaterThan(0);
  });

  it("returns positive roast for ideal stack (delta_lake + databricks_workflows + databricks + power_bi + unity_catalog + 4_10)", () => {
    const selections = makeSelections({
      storage: "delta_lake",
      orchestrator: "databricks_workflows",
      compute: "databricks",
      bi: "power_bi",
      governance: "unity_catalog",
      team_size: "4_10",
    });
    const result = generateRoast(selections);

    expect(result.roastParagraphs[0]).toContain("read the docs");
    expect(result.roastParagraphs[2]).toContain("well-positioned");
  });

  it("returns maximum roast for worst stack (hive + none + local + excel + none + 1_3)", () => {
    const selections = makeSelections({
      storage: "hive",
      orchestrator: "none",
      compute: "local",
      bi: "excel",
      governance: "none",
      team_size: "1_3",
    });
    const result = generateRoast(selections);

    expect(result.roastParagraphs[0].toLowerCase()).not.toContain("respect");
    expect(result.roastParagraphs[1]).toBeTruthy();
    expect(result.roastParagraphs[2]).toBeTruthy();
  });

  it("uses generic fallback when no conditions match a slot", () => {
    const selections = makeSelections({
      storage: "bigquery",
      orchestrator: "prefect",
      compute: "bigquery",
      bi: "tableau",
      governance: "collibra",
      team_size: "1_3",
    });
    const result = generateRoast(selections);

    expect(result.roastParagraphs).toHaveLength(3);
    for (const paragraph of result.roastParagraphs) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    }
  });

  it("selects the most specific match (most conditions)", () => {
    const selections = makeSelections({
      storage: "delta_lake",
      orchestrator: "databricks_workflows",
      compute: "databricks",
      bi: "power_bi",
      governance: "unity_catalog",
      team_size: "4_10",
    });
    const result = generateRoast(selections);

    const threeConditionMatch = roastParagraphs.find(
      (p) =>
        p.slot === "architecture" &&
        p.conditions.length === 3 &&
        p.conditions.some((c) => c.category === "storage" && c.optionIds.includes("delta_lake")) &&
        p.conditions.some((c) => c.category === "compute" && c.optionIds.includes("databricks")) &&
        p.conditions.some((c) => c.category === "governance" && c.optionIds.includes("unity_catalog")),
    );
    expect(threeConditionMatch).toBeDefined();
    expect(result.roastParagraphs[0]).toBe(threeConditionMatch!.text);
  });

  it("handles all possible storage + compute combinations without crashing", () => {
    for (const storage of stackOptions.storage) {
      for (const compute of stackOptions.compute) {
        const selections = makeSelections({
          storage: storage.id,
          compute: compute.id,
        });
        const result = generateRoast(selections);
        expect(result.roastParagraphs).toHaveLength(3);
      }
    }
  });

  it("shareable snippet stays under 280 chars for long roast text", () => {
    const selections = makeSelections({
      storage: "hive",
      orchestrator: "none",
      compute: "local",
      bi: "excel",
      governance: "none",
      team_size: "1_3",
    });
    const result = generateRoast(selections);
    expect(result.shareableSnippet.length).toBeLessThanOrEqual(280);
  });

  it("shareable snippet truncates when first sentence exceeds available space", () => {
    const longSentence = "A".repeat(300) + ". Short second sentence.";
    const paragraphs: [string, string, string] = [longSentence, "b", "c"];
    const snippet = buildShareableSnippet(paragraphs);
    expect(snippet.length).toBeLessThanOrEqual(280);
    expect(snippet).toContain("...");
  });

  it("shareable snippet preserves short first sentence without truncation", () => {
    const shortSentence = "This is short. And has a second sentence.";
    const paragraphs: [string, string, string] = [shortSentence, "b", "c"];
    const snippet = buildShareableSnippet(paragraphs);
    expect(snippet).toContain("This is short");
    expect(snippet).not.toContain("...");
  });

  it("improvement path includes governance suggestion when governance is none", () => {
    const selections = makeSelections({ governance: "none" });
    const result = generateRoast(selections);
    const hasGovernanceSuggestion = result.improvementPath.some(
      (item) => item.toLowerCase().includes("catalog") || item.toLowerCase().includes("govern"),
    );
    expect(hasGovernanceSuggestion).toBe(true);
  });

  it("improvement path includes orchestrator suggestion when orchestrator is none", () => {
    const selections = makeSelections({ orchestrator: "none" });
    const result = generateRoast(selections);
    const hasOrchestratorSuggestion = result.improvementPath.some(
      (item) => item.toLowerCase().includes("orchestrat"),
    );
    expect(hasOrchestratorSuggestion).toBe(true);
  });

  it("improvement path includes compute suggestion when compute is local", () => {
    const selections = makeSelections({ compute: "local" });
    const result = generateRoast(selections);
    const hasComputeSuggestion = result.improvementPath.some(
      (item) => item.toLowerCase().includes("compute") || item.toLowerCase().includes("local"),
    );
    expect(hasComputeSuggestion).toBe(true);
  });

  it("improvement path uses defaults when stack is well-configured", () => {
    const selections = makeSelections({
      storage: "delta_lake",
      orchestrator: "databricks_workflows",
      compute: "databricks",
      bi: "power_bi",
      governance: "unity_catalog",
      team_size: "4_10",
    });
    const result = generateRoast(selections);
    expect(result.improvementPath.length).toBe(3);
    expect(result.improvementPath[0]).toContain("data contracts");
  });

  it("improvement path caps at 5 items for heavily flagged stacks", () => {
    const selections = makeSelections({
      storage: "hive",
      orchestrator: "none",
      compute: "local",
      bi: "excel",
      governance: "none",
      team_size: "30_plus",
    });
    const result = generateRoast(selections);
    expect(result.improvementPath.length).toBeLessThanOrEqual(5);
    expect(result.improvementPath.length).toBeGreaterThanOrEqual(3);
  });
});

describe("buildRoastBrief", () => {
  it("formats result as a multiline string", () => {
    const selections = makeSelections();
    const result = generateRoast(selections);
    const brief = buildRoastBrief(result);

    expect(brief).toContain("DATA STACK ROAST");
    expect(brief).toContain("Architecture:");
    expect(brief).toContain("Operations:");
    expect(brief).toContain("Growth:");
    expect(brief).toContain("Improvement Path:");
    expect(brief).toContain("xhverse.co/tools/data-stack-roast");
  });

  it("includes numbered improvement items", () => {
    const selections = makeSelections();
    const result = generateRoast(selections);
    const brief = buildRoastBrief(result);

    expect(brief).toContain("1. ");
    expect(brief).toContain("2. ");
    expect(brief).toContain("3. ");
  });

  it("includes all three roast paragraphs", () => {
    const selections = makeSelections();
    const result = generateRoast(selections);
    const brief = buildRoastBrief(result);

    for (const paragraph of result.roastParagraphs) {
      expect(brief).toContain(paragraph);
    }
  });
});
