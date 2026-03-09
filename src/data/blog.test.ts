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
    expect(Array.isArray(post.tags)).toBe(true);
  });
});
