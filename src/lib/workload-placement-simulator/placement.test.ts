import { describe, expect, it } from "vitest";
import {
  buildWorkloadPlacementBrief,
  dataShapeOptions,
  evaluateWorkloadPlacement,
  fitForScore,
  freshnessOptions,
  governanceOptions,
  placementCandidates,
  platformEstateOptions,
  pressureOptions,
  scaleOptions,
  workloadIntentOptions,
  type WorkloadPlacementInput,
} from "./placement";

const baseInput: WorkloadPlacementInput = {
  intent: "scheduled-pipeline",
  estate: "databricks",
  dataShape: "delta-tables",
  freshness: "intraday",
  scale: "enterprise",
  governance: "standard",
  pressure: "minimize-ops",
};

describe("workload placement options", () => {
  it("exports route-safe option values and unique placement candidates", () => {
    const optionGroups = [
      workloadIntentOptions,
      platformEstateOptions,
      dataShapeOptions,
      freshnessOptions,
      scaleOptions,
      governanceOptions,
      pressureOptions,
    ];

    for (const group of optionGroups) {
      const values = group.map((option) => option.value);
      expect(new Set(values).size).toBe(values.length);
      for (const option of group) {
        expect(option.value).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
        expect(option.label.length).toBeGreaterThan(3);
        expect(option.description.length).toBeGreaterThan(40);
      }
    }

    const candidateIds = placementCandidates.map((candidate) => candidate.id);
    expect(new Set(candidateIds).size).toBe(placementCandidates.length);
    expect(placementCandidates).toHaveLength(10);
  });
});

describe("fitForScore", () => {
  it("maps score boundaries to placement fit labels", () => {
    expect(fitForScore(49)).toBe("Avoid for now");
    expect(fitForScore(50)).toBe("Conditional fit");
    expect(fitForScore(65)).toBe("Good fit");
    expect(fitForScore(80)).toBe("Strong fit");
  });
});

describe("evaluateWorkloadPlacement", () => {
  it("recommends Databricks Serverless Jobs for managed pipeline placement", () => {
    const result = evaluateWorkloadPlacement(baseInput);

    expect(result.topRecommendation.candidate.id).toBe("databricks-serverless-jobs");
    expect(result.topRecommendation.score).toBe(100);
    expect(result.topRecommendation.fit).toBe("Strong fit");
    expect(result.topRecommendation.reasons).toEqual(
      expect.arrayContaining([
        "The workload is a scheduled pipeline with owned execution.",
        "Managed serverless compute reduces cluster ownership and idle-time pressure.",
      ]),
    );
    expect(result.runnersUp).toHaveLength(3);
    expect(result.rankedPlacements[0]).toEqual(result.topRecommendation);
  });

  it("recommends Power BI Direct Lake for Fabric-backed BI performance", () => {
    const result = evaluateWorkloadPlacement({
      intent: "interactive-bi",
      estate: "fabric",
      dataShape: "delta-tables",
      freshness: "intraday",
      scale: "department",
      governance: "sensitive",
      pressure: "bi-performance",
    });

    expect(result.topRecommendation.candidate.id).toBe("power-bi-direct-lake");
    expect(result.topRecommendation.reasons).toEqual(
      expect.arrayContaining([
        "Interactive BI over Delta-backed Fabric data is a Direct Lake-shaped problem.",
        "Direct Lake is strongest when curated Delta tables are already the serving surface.",
      ]),
    );
    expect(result.reviewWarnings).toContain(
      "Validate row, column, workspace, and semantic model permissions together.",
    );
  });

  it("recommends a hybrid review for mixed governed sharing", () => {
    const result = evaluateWorkloadPlacement({
      intent: "governed-sharing",
      estate: "mixed",
      dataShape: "warehouse-star",
      freshness: "near-real-time",
      scale: "enterprise",
      governance: "regulated",
      pressure: "cost-attribution",
    });

    expect(result.topRecommendation.candidate.id).toBe("hybrid-placement-review");
    expect(result.topRecommendation.score).toBe(100);
    expect(result.reviewWarnings).toEqual(
      expect.arrayContaining([
        "Define staleness tolerance before selecting the serving path.",
        "Do not choose placement until audit evidence and exception ownership are explicit.",
      ]),
    );
  });

  it("prefers explicit compute when custom control dominates", () => {
    const result = evaluateWorkloadPlacement({
      intent: "ad-hoc-exploration",
      estate: "databricks",
      dataShape: "raw-files",
      freshness: "daily",
      scale: "team",
      governance: "regulated",
      pressure: "custom-control",
    });

    expect(result.topRecommendation.candidate.id).toBe("databricks-classic-jobs");
    expect(
      result.rankedPlacements.find(
        (placement) => placement.candidate.id === "databricks-serverless-jobs",
      )?.watchouts,
    ).toContain(
      "Check serverless limitations before choosing it for custom-control workloads.",
    );
  });
});

describe("buildWorkloadPlacementBrief", () => {
  it("builds a copyable brief with warnings when review risks exist", () => {
    const result = evaluateWorkloadPlacement({
      ...baseInput,
      pressure: "cost-attribution",
    });
    const brief = buildWorkloadPlacementBrief(result);

    expect(brief).toContain("Workload Placement Simulation Brief");
    expect(brief).toContain("Top recommendation: Databricks Serverless Jobs");
    expect(brief).toContain("Placement signal: 100/100");
    expect(brief).toContain("Platform boundary:");
    expect(brief).toContain("Serverless usage policies are Public Preview");
    expect(brief).toContain("Generated at xhverse.co/tools/workload-placement-simulator");
  });

  it("builds a brief fallback when no critical warnings exist", () => {
    const result = evaluateWorkloadPlacement(baseInput);
    const brief = buildWorkloadPlacementBrief(result);

    expect(brief).toContain("No critical placement warnings");
    expect(brief).toContain("Lakehouse Cost Calculator");
    expect(brief).toContain("Power BI Semantic Model Doctor");
  });
});
