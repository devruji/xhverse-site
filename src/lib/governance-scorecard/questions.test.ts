import { describe, it, expect } from "vitest";
import {
  governanceCategories,
  governanceQuestions,
  categoryLabels,
  categoryDescriptions,
} from "./questions";

describe("governanceCategories", () => {
  it("has five categories", () => {
    expect(governanceCategories).toHaveLength(5);
  });
});

describe("categoryLabels", () => {
  it("has a label for every category", () => {
    for (const category of governanceCategories) {
      expect(categoryLabels[category]).toBeTruthy();
    }
  });
});

describe("categoryDescriptions", () => {
  it("has a description for every category", () => {
    for (const category of governanceCategories) {
      expect(categoryDescriptions[category]).toBeTruthy();
    }
  });
});

describe("governanceQuestions", () => {
  it("has 20 questions (4 per category)", () => {
    expect(governanceQuestions).toHaveLength(20);
    for (const category of governanceCategories) {
      const count = governanceQuestions.filter(
        (q) => q.category === category,
      ).length;
      expect(count).toBe(4);
    }
  });

  it("all questions have unique ids", () => {
    const ids = governanceQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all questions have 4 options with values 1-4", () => {
    for (const question of governanceQuestions) {
      expect(question.options).toHaveLength(4);
      const values = question.options.map((o) => o.value);
      expect(values).toEqual([1, 2, 3, 4]);
    }
  });

  it("all questions have non-empty prompts and option labels", () => {
    for (const question of governanceQuestions) {
      expect(question.prompt.length).toBeGreaterThan(0);
      for (const option of question.options) {
        expect(option.label.length).toBeGreaterThan(0);
      }
    }
  });
});
