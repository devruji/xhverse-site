import { describe, it, expect } from "vitest";
import {
  calculateGovernanceResult,
  buildGovernanceBrief,
  scoreToTier,
  readinessTiers,
} from "./scoring";
import { governanceQuestions, type GovernanceAnswers } from "./questions";

function makeAnswers(value: 1 | 2 | 3 | 4): GovernanceAnswers {
  return Object.fromEntries(
    governanceQuestions.map((q) => [q.id, value]),
  ) as GovernanceAnswers;
}

describe("scoreToTier", () => {
  it("returns Not Ready for low scores", () => {
    expect(scoreToTier(0)).toBe("Not Ready");
    expect(scoreToTier(39)).toBe("Not Ready");
  });

  it("returns Partially Ready for mid-low scores", () => {
    expect(scoreToTier(40)).toBe("Partially Ready");
    expect(scoreToTier(64)).toBe("Partially Ready");
  });

  it("returns Ready with Gaps for mid-high scores", () => {
    expect(scoreToTier(65)).toBe("Ready with Gaps");
    expect(scoreToTier(84)).toBe("Ready with Gaps");
  });

  it("returns Fully Ready for high scores", () => {
    expect(scoreToTier(85)).toBe("Fully Ready");
    expect(scoreToTier(100)).toBe("Fully Ready");
  });
});

describe("readinessTiers", () => {
  it("exports all four tiers", () => {
    expect(readinessTiers).toHaveLength(4);
    expect(readinessTiers).toContain("Not Ready");
    expect(readinessTiers).toContain("Fully Ready");
  });
});

describe("calculateGovernanceResult", () => {
  it("calculates lowest tier for all-1 answers", () => {
    const result = calculateGovernanceResult(makeAnswers(1));
    expect(result.overallPercentage).toBe(25);
    expect(result.tier).toBe("Not Ready");
    expect(result.categoryScores).toHaveLength(5);
  });

  it("calculates highest tier for all-4 answers", () => {
    const result = calculateGovernanceResult(makeAnswers(4));
    expect(result.overallPercentage).toBe(100);
    expect(result.tier).toBe("Fully Ready");
    expect(result.topBlockers).toHaveLength(0);
  });

  it("identifies blockers for weak categories", () => {
    const answers = makeAnswers(4);
    governanceQuestions
      .filter((q) => q.category === "sponsorship")
      .forEach((q) => {
        (answers as Record<string, number>)[q.id] = 1;
      });
    const result = calculateGovernanceResult(answers);
    expect(result.topBlockers.length).toBeGreaterThan(0);
    expect(result.topBlockers[0].category).toBe("sponsorship");
  });

  it("generates action plan from weakest categories", () => {
    const result = calculateGovernanceResult(makeAnswers(2));
    expect(result.actionPlan.length).toBeGreaterThan(0);
    expect(result.actionPlan.length).toBeLessThanOrEqual(8);
    for (const action of result.actionPlan) {
      expect(action.action).toBeTruthy();
      expect(action.timeframe).toBeTruthy();
    }
  });

  it("returns correct percentage per category", () => {
    const result = calculateGovernanceResult(makeAnswers(3));
    for (const score of result.categoryScores) {
      expect(score.percentage).toBe(75);
      expect(score.score).toBe(score.maxScore * 0.75);
    }
  });

  it("handles missing answers gracefully", () => {
    const partial = { "sponsorship-1": 4 } as GovernanceAnswers;
    const result = calculateGovernanceResult(partial);
    expect(result.overallPercentage).toBe(5);
    expect(result.tier).toBe("Not Ready");
  });
});

describe("buildGovernanceBrief", () => {
  it("produces a non-empty string with key sections", () => {
    const result = calculateGovernanceResult(makeAnswers(2));
    const brief = buildGovernanceBrief(result);
    expect(brief).toContain("Data Governance Readiness Brief");
    expect(brief).toContain("Overall readiness:");
    expect(brief).toContain("Category scores:");
    expect(brief).toContain("90-day action plan:");
    expect(brief).toContain("contact@xhverse.co");
  });

  it("includes all category labels", () => {
    const result = calculateGovernanceResult(makeAnswers(3));
    const brief = buildGovernanceBrief(result);
    expect(brief).toContain("Sponsorship & Ownership");
    expect(brief).toContain("Policy & Standards");
    expect(brief).toContain("Tooling & Catalog");
    expect(brief).toContain("Process & Culture");
    expect(brief).toContain("Regulatory Exposure");
  });

  it("shows no blockers for high scores", () => {
    const result = calculateGovernanceResult(makeAnswers(4));
    const brief = buildGovernanceBrief(result);
    expect(brief).toContain("None identified");
  });
});
