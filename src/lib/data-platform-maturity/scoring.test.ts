import { describe, expect, it } from "vitest";
import { assessmentQuestions, type AssessmentAnswers } from "./questions";
import {
  buildReadinessBrief,
  calculateAssessmentResult,
  getBenchmarkMessage,
  getBenchmarkPosition,
  scoreToTier,
  type BenchmarkSummary,
} from "./scoring";
import { fallbackBenchmark } from "./supabase";

function answersWith(value: 1 | 2 | 3 | 4 | 5): AssessmentAnswers {
  return Object.fromEntries(
    assessmentQuestions.map((question) => [question.id, value]),
  ) as AssessmentAnswers;
}

describe("scoreToTier", () => {
  it.each([
    [0, "Foundational"],
    [39, "Foundational"],
    [40, "Developing"],
    [59, "Developing"],
    [60, "Operational"],
    [79, "Operational"],
    [80, "Advanced"],
    [100, "Advanced"],
  ] as const)("maps %i to %s", (score, tier) => {
    expect(scoreToTier(score)).toBe(tier);
  });
});

describe("calculateAssessmentResult", () => {
  it("calculates overall, category, strongest, weakest, and actions", () => {
    const answers = answersWith(3);
    answers["platform-architecture-1"] = 5;
    answers["platform-architecture-2"] = 5;
    answers["platform-architecture-3"] = 5;
    answers["documentation-1"] = 1;
    answers["documentation-2"] = 1;
    answers["documentation-3"] = 1;

    const result = calculateAssessmentResult(answers);

    expect(result.overallScore).toBe(60);
    expect(result.tier).toBe("Operational");
    expect(result.strongestCategory.label).toBe("Platform architecture");
    expect(result.strongestCategory.score).toBe(100);
    expect(result.weakestCategory.label).toBe("Documentation");
    expect(result.weakestCategory.score).toBe(20);
    expect(result.categoryScores).toHaveLength(5);
    expect(result.nextActions[0]).toMatch(/knowledge base/i);
  });

  it("treats missing answers as zero while tracking answered category counts", () => {
    const answers = answersWith(5);
    delete answers["operations-1"];

    const result = calculateAssessmentResult(answers);
    const operations = result.categoryScores.find(
      (item) => item.category === "operations",
    );

    expect(result.overallScore).toBe(93);
    expect(operations?.answered).toBe(2);
    expect(operations?.total).toBe(3);
  });
});

describe("benchmark helpers", () => {
  it.each([
    [70, 60, "above"],
    [60, 70, "below"],
    [63, 60, "near"],
    [63, null, "unavailable"],
  ] as const)("positions %i against %s as %s", (score, average, position) => {
    expect(getBenchmarkPosition(score, average)).toBe(position);
  });

  it.each([
    ["above", /above/i],
    ["below", /below/i],
    ["near", /near/i],
    ["unavailable", /will appear/i],
  ] as const)("returns copy for %s", (position, expected) => {
    expect(getBenchmarkMessage(position)).toMatch(expected);
  });
});

describe("buildReadinessBrief", () => {
  it("builds a copyable brief with benchmark context", () => {
    const result = calculateAssessmentResult(answersWith(4));
    const benchmark: BenchmarkSummary = {
      ...fallbackBenchmark,
      submissionCount: 5,
      averageOverallScore: 60,
    };

    expect(buildReadinessBrief(result, benchmark)).toContain(
      "Data Platform Architecture Readiness Brief",
    );
    expect(buildReadinessBrief(result, benchmark)).toContain(
      "Average public benchmark: 60/100 from 5 anonymous submission(s)",
    );
  });

  it("handles unavailable benchmark data", () => {
    const result = calculateAssessmentResult(answersWith(1));
    expect(buildReadinessBrief(result, null)).toContain(
      "Average public benchmark: not available yet",
    );
  });
});
