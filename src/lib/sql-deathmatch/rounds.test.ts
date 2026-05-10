import { describe, expect, it } from "vitest";
import { deathmatchConcepts, rounds } from "./rounds";

describe("rounds", () => {
  it("contains exactly 15 rounds", () => {
    expect(rounds).toHaveLength(15);
  });

  it("has unique IDs for every round", () => {
    const ids = rounds.map((r) => r.id);
    expect(new Set(ids).size).toBe(15);
  });

  it("has non-empty queryA.sql for every round", () => {
    for (const round of rounds) {
      expect(round.queryA.sql.length).toBeGreaterThan(0);
    }
  });

  it("has non-empty queryB.sql for every round", () => {
    for (const round of rounds) {
      expect(round.queryB.sql.length).toBeGreaterThan(0);
    }
  });

  it("has non-empty explanation for every round", () => {
    for (const round of rounds) {
      expect(round.explanation.length).toBeGreaterThan(0);
    }
  });

  it("has winner as 'a' or 'b' for every round", () => {
    for (const round of rounds) {
      expect(["a", "b"]).toContain(round.winner);
    }
  });

  it("uses a valid deathmatchConcept for every round", () => {
    const validConcepts: readonly string[] = deathmatchConcepts;
    for (const round of rounds) {
      expect(validConcepts).toContain(round.concept);
    }
  });

  it("covers all 15 concepts exactly once", () => {
    const usedConcepts = rounds.map((r) => r.concept);
    expect(new Set(usedConcepts).size).toBe(15);
    for (const concept of deathmatchConcepts) {
      expect(usedConcepts).toContain(concept);
    }
  });

  it("contains SQL keywords in queryA.sql", () => {
    const sqlKeywords = ["SELECT", "MERGE", "OPTIMIZE", "CACHE", "CREATE"];
    for (const round of rounds) {
      const upper = round.queryA.sql.toUpperCase();
      const hasKeyword = sqlKeywords.some((kw) => upper.includes(kw));
      expect(hasKeyword).toBe(true);
    }
  });

  it("contains SQL keywords in queryB.sql", () => {
    const sqlKeywords = ["SELECT", "MERGE", "OPTIMIZE", "CACHE", "CREATE"];
    for (const round of rounds) {
      const upper = round.queryB.sql.toUpperCase();
      const hasKeyword = sqlKeywords.some((kw) => upper.includes(kw));
      expect(hasKeyword).toBe(true);
    }
  });

  it("has non-empty title and context for every round", () => {
    for (const round of rounds) {
      expect(round.title.length).toBeGreaterThan(0);
      expect(round.context.length).toBeGreaterThan(0);
    }
  });

  it("has non-empty labels for both queries", () => {
    for (const round of rounds) {
      expect(round.queryA.label.length).toBeGreaterThan(0);
      expect(round.queryB.label.length).toBeGreaterThan(0);
    }
  });
});

describe("deathmatchConcepts", () => {
  it("contains exactly 15 concepts", () => {
    expect(deathmatchConcepts).toHaveLength(15);
  });

  it("contains only snake_case strings", () => {
    for (const concept of deathmatchConcepts) {
      expect(concept).toMatch(/^[a-z_]+$/);
    }
  });
});
