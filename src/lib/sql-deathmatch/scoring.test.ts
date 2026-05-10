import { describe, expect, it } from "vitest";
import { rounds, type SqlRound } from "./rounds";
import {
  buildDeathmatchBrief,
  calculateDeathmatchResult,
  deathmatchTiers,
  getDeathmatchTier,
} from "./scoring";

describe("getDeathmatchTier", () => {
  it("returns SQL Novice for 0 correct out of 15", () => {
    expect(getDeathmatchTier(0, 15)).toBe("SQL Novice");
  });

  it("returns SQL Novice for 5 correct (33%)", () => {
    expect(getDeathmatchTier(5, 15)).toBe("SQL Novice");
  });

  it("returns Query Writer for 6 correct (40%)", () => {
    expect(getDeathmatchTier(6, 15)).toBe("Query Writer");
  });

  it("returns Query Writer for 9 correct (60%)", () => {
    expect(getDeathmatchTier(9, 15)).toBe("Query Writer");
  });

  it("returns Performance Aware for 10 correct (67%)", () => {
    expect(getDeathmatchTier(10, 15)).toBe("Performance Aware");
  });

  it("returns Performance Aware for 12 correct (80%)", () => {
    expect(getDeathmatchTier(12, 15)).toBe("Performance Aware");
  });

  it("returns Execution Plan Master for 13 correct (87%)", () => {
    expect(getDeathmatchTier(13, 15)).toBe("Execution Plan Master");
  });

  it("returns Execution Plan Master for 15 correct (100%)", () => {
    expect(getDeathmatchTier(15, 15)).toBe("Execution Plan Master");
  });

  it("returns SQL Novice when totalRounds is 0", () => {
    expect(getDeathmatchTier(0, 0)).toBe("SQL Novice");
  });
});

describe("calculateDeathmatchResult", () => {
  it("returns 0 correct and SQL Novice for empty answers", () => {
    const result = calculateDeathmatchResult(rounds, {});
    expect(result.correctCount).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.tier).toBe("SQL Novice");
    expect(result.totalRounds).toBe(15);
  });

  it("returns 15 correct and Execution Plan Master for all correct", () => {
    const answers: Record<string, "a" | "b"> = {};
    for (const round of rounds) {
      answers[round.id] = round.winner;
    }
    const result = calculateDeathmatchResult(rounds, answers);
    expect(result.correctCount).toBe(15);
    expect(result.percentage).toBe(100);
    expect(result.tier).toBe("Execution Plan Master");
  });

  it("counts correct answers accurately for partial correctness", () => {
    const answers: Record<string, "a" | "b"> = {};
    for (let i = 0; i < 10; i++) {
      answers[rounds[i].id] = rounds[i].winner;
    }
    for (let i = 10; i < 15; i++) {
      answers[rounds[i].id] = rounds[i].winner === "a" ? "b" : "a";
    }
    const result = calculateDeathmatchResult(rounds, answers);
    expect(result.correctCount).toBe(10);
    expect(result.percentage).toBe(67);
    expect(result.tier).toBe("Performance Aware");
  });

  it("identifies common mistakes by concept", () => {
    const answers: Record<string, "a" | "b"> = {};
    for (const round of rounds) {
      answers[round.id] = round.winner;
    }
    const partitionRound = rounds.find(
      (r) => r.concept === "partition_pruning",
    )!;
    const broadcastRound = rounds.find((r) => r.concept === "broadcast_join")!;
    answers[partitionRound.id] =
      partitionRound.winner === "a" ? "b" : "a";
    answers[broadcastRound.id] =
      broadcastRound.winner === "a" ? "b" : "a";

    const result = calculateDeathmatchResult(rounds, answers);
    expect(result.commonMistakes.length).toBeGreaterThan(0);
    expect(result.commonMistakes.length).toBeLessThanOrEqual(3);

    const mistakeText = result.commonMistakes.join(" ");
    expect(mistakeText).toContain("Partition pruning");
    expect(mistakeText).toContain("Broadcast joins");
  });

  it("limits common mistakes to top 3", () => {
    const answers: Record<string, "a" | "b"> = {};
    for (const round of rounds) {
      answers[round.id] = round.winner === "a" ? "b" : "a";
    }
    const result = calculateDeathmatchResult(rounds, answers);
    expect(result.commonMistakes.length).toBe(3);
  });

  it("returns correct roundResults structure", () => {
    const answers: Record<string, "a" | "b"> = {
      [rounds[0].id]: rounds[0].winner,
    };
    const result = calculateDeathmatchResult(rounds, answers);

    const firstResult = result.roundResults[0];
    expect(firstResult.roundId).toBe(rounds[0].id);
    expect(firstResult.userPick).toBe(rounds[0].winner);
    expect(firstResult.correct).toBe(true);
    expect(firstResult.concept).toBe(rounds[0].concept);
  });

  it("marks unanswered rounds as incorrect", () => {
    const answers: Record<string, "a" | "b"> = {
      [rounds[0].id]: rounds[0].winner,
    };
    const result = calculateDeathmatchResult(rounds, answers);
    const unansweredResult = result.roundResults[1];
    expect(unansweredResult.correct).toBe(false);
  });

  it("calculates percentage as 0 for empty round set", () => {
    const result = calculateDeathmatchResult([], {});
    expect(result.percentage).toBe(0);
    expect(result.totalRounds).toBe(0);
    expect(result.correctCount).toBe(0);
  });

  it("falls back to raw concept name when label is not mapped", () => {
    const customRounds: SqlRound[] = [
      {
        id: "custom-01",
        title: "Test",
        context: "Test context",
        queryA: { sql: "SELECT 1", label: "A" },
        queryB: { sql: "SELECT 2", label: "B" },
        winner: "a",
        explanation: "Test explanation",
        concept: "unknown_concept_xyz",
      },
    ];
    const answers: Record<string, "a" | "b"> = { "custom-01": "b" };
    const result = calculateDeathmatchResult(customRounds, answers);
    expect(result.commonMistakes).toContain("unknown_concept_xyz");
  });
});

describe("buildDeathmatchBrief", () => {
  it("contains the score line with correct values", () => {
    const answers: Record<string, "a" | "b"> = {};
    for (let i = 0; i < 11; i++) {
      answers[rounds[i].id] = rounds[i].winner;
    }
    for (let i = 11; i < 15; i++) {
      answers[rounds[i].id] = rounds[i].winner === "a" ? "b" : "a";
    }
    const result = calculateDeathmatchResult(rounds, answers);
    const brief = buildDeathmatchBrief(result);

    expect(brief).toContain("Score: 11/15 (73%) — Performance Aware");
  });

  it("contains the site URL", () => {
    const result = calculateDeathmatchResult(rounds, {});
    const brief = buildDeathmatchBrief(result);
    expect(brief).toContain("https://xhverse.co/tools/sql-deathmatch");
  });

  it("contains the header", () => {
    const result = calculateDeathmatchResult(rounds, {});
    const brief = buildDeathmatchBrief(result);
    expect(brief).toContain(
      "SQL Deathmatch — xhverse.co/tools/sql-deathmatch",
    );
  });

  it("shows common gaps when there are mistakes", () => {
    const answers: Record<string, "a" | "b"> = {};
    for (const round of rounds) {
      answers[round.id] = round.winner === "a" ? "b" : "a";
    }
    const result = calculateDeathmatchResult(rounds, answers);
    const brief = buildDeathmatchBrief(result);
    expect(brief).toContain("Common gaps:");
  });

  it("shows perfect score message when all correct", () => {
    const answers: Record<string, "a" | "b"> = {};
    for (const round of rounds) {
      answers[round.id] = round.winner;
    }
    const result = calculateDeathmatchResult(rounds, answers);
    const brief = buildDeathmatchBrief(result);
    expect(brief).toContain("No gaps — perfect score!");
  });

  it("contains tier name in the brief", () => {
    const result = calculateDeathmatchResult(rounds, {});
    const brief = buildDeathmatchBrief(result);
    expect(brief).toContain("SQL Novice");
  });
});

describe("deathmatchTiers", () => {
  it("contains exactly 4 tiers", () => {
    expect(deathmatchTiers).toHaveLength(4);
  });

  it("contains the expected tier names", () => {
    expect(deathmatchTiers).toContain("SQL Novice");
    expect(deathmatchTiers).toContain("Query Writer");
    expect(deathmatchTiers).toContain("Performance Aware");
    expect(deathmatchTiers).toContain("Execution Plan Master");
  });
});
