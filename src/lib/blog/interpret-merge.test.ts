import { describe, it, expect } from "vitest";
import { posts } from "../../data/blog";
import {
  interpretSupabasePostsResponse,
  mergePostsWithStaticFallback,
  sortPostsByDateDesc,
} from "./interpret-merge";

describe("interpretSupabasePostsResponse", () => {
  it("falls back on error", () => {
    expect(
      interpretSupabasePostsResponse([], { message: "nope" }),
    ).toEqual({ kind: "use_fallback" });
  });

  it("falls back on empty or non-array data", () => {
    expect(interpretSupabasePostsResponse([], null)).toEqual({
      kind: "use_fallback",
    });
    expect(interpretSupabasePostsResponse(null, null)).toEqual({
      kind: "use_fallback",
    });
  });

  it("uses remote rows when present", () => {
    const rows = [{ x: 1 }];
    expect(interpretSupabasePostsResponse(rows, null)).toEqual({
      kind: "use_remote",
      rows,
    });
  });
});

describe("mergePostsWithStaticFallback", () => {
  it("returns fallback copy when interpretation is fallback", () => {
    const out = mergePostsWithStaticFallback(
      { kind: "use_fallback" },
      posts,
    );
    expect(out).toEqual(posts);
    expect(out).not.toBe(posts);
  });

  it("maps remote rows when interpretation is remote", () => {
    const row = {
      slug: "remote-only",
      title: "Remote",
      excerpt: "Excerpt.",
      body_markdown: "## Hi",
      tags: ["t"] as string[],
      reading_time: "2 min read",
      medium_url: null as string | null,
      published_at: "2026-05-01T00:00:00.000Z",
    };
    const out = mergePostsWithStaticFallback(
      { kind: "use_remote", rows: [row] },
      posts,
    );
    expect(out).toHaveLength(1);
    expect(out[0].slug).toBe("remote-only");
    expect(out[0].bodyMarkdown).toContain("Hi");
  });
});

describe("sortPostsByDateDesc", () => {
  it("sorts by date descending", () => {
    const a = { ...posts[0], date: "2026-01-01" };
    const b = { ...posts[0], slug: "b", date: "2026-06-01" };
    const sorted = sortPostsByDateDesc([a, b]);
    expect(sorted[0].date).toBe("2026-06-01");
  });
});
