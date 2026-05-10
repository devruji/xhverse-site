import { describe, expect, it } from "vitest";
import {
  categoryLabels,
  stackCategories,
  stackOptions,
  type StackCategory,
} from "./stacks";

describe("stackCategories", () => {
  it("contains exactly 6 categories", () => {
    expect(stackCategories).toHaveLength(6);
  });

  it("includes all expected category names", () => {
    expect(stackCategories).toContain("storage");
    expect(stackCategories).toContain("orchestrator");
    expect(stackCategories).toContain("compute");
    expect(stackCategories).toContain("bi");
    expect(stackCategories).toContain("governance");
    expect(stackCategories).toContain("team_size");
  });
});

describe("stackOptions", () => {
  it("has options for all 6 categories", () => {
    for (const category of stackCategories) {
      expect(stackOptions[category].length).toBeGreaterThan(0);
    }
  });

  it("has unique option IDs within each category", () => {
    for (const category of stackCategories) {
      const ids = stackOptions[category].map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("has non-empty labels for all options", () => {
    for (const category of stackCategories) {
      for (const option of stackOptions[category]) {
        expect(option.label.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("has non-empty IDs for all options", () => {
    for (const category of stackCategories) {
      for (const option of stackOptions[category]) {
        expect(option.id.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("categoryLabels", () => {
  it("covers all categories in stackCategories", () => {
    for (const category of stackCategories) {
      expect(categoryLabels[category]).toBeDefined();
      expect(categoryLabels[category].trim().length).toBeGreaterThan(0);
    }
  });

  it("has no extra keys beyond stackCategories", () => {
    const labelKeys = Object.keys(categoryLabels) as StackCategory[];
    expect(labelKeys).toHaveLength(stackCategories.length);
  });
});
