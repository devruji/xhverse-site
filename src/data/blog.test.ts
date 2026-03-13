import { describe, it, expect } from "vitest";
import { posts } from "./blog";

describe("Blog Data", () => {
  it("should export a list of posts", () => {
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("should have valid post structures", () => {
    const post = posts[0];
    expect(post).toHaveProperty("slug");
    expect(post).toHaveProperty("title");
    expect(post).toHaveProperty("excerpt");
    expect(post).toHaveProperty("date");
    expect(post).toHaveProperty("tags");
    expect(post).toHaveProperty("mediumUrl");
    expect(post).toHaveProperty("readingTime");
    expect(Array.isArray(post.tags)).toBe(true);
  });

  it("should have unique slugs and valid ISO dates", () => {
    const slugs = posts.map((post) => post.slug);
    expect(new Set(slugs).size).toBe(posts.length);

    for (const post of posts) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(post.date))).toBe(false);
      expect(post.mediumUrl.startsWith("https://")).toBe(true);
    }
  });
});
