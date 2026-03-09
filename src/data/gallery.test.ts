import { describe, it, expect } from "vitest";
import { items } from "./gallery";

describe("Gallery Data", () => {
  it("should export a list of items", () => {
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it("should have valid item structures", () => {
    const item = items[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("src");
    expect(item).toHaveProperty("alt");
    expect(item).toHaveProperty("caption");
  });
});
