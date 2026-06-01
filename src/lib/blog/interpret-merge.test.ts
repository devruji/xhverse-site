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
    ).toEqual({ kind: "use_fallback", reason: "query_error" });
  });

  it("falls back on empty or non-array data", () => {
    expect(interpretSupabasePostsResponse([], null)).toEqual({
      kind: "use_fallback",
      reason: "empty_result",
    });
    expect(interpretSupabasePostsResponse(null, null)).toEqual({
      kind: "use_fallback",
      reason: "empty_result",
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
      { kind: "use_fallback", reason: "empty_result" },
      posts,
    );
    expect(out).toEqual(posts);
    expect(out).not.toBe(posts);
  });

  it("merges remote rows with static-only posts", () => {
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
    expect(out.some((post) => post.slug === "remote-only")).toBe(true);
    expect(out.some((post) => post.slug === "big-table-vs-star-schema")).toBe(
      true,
    );
    expect(out.find((post) => post.slug === "remote-only")?.bodyMarkdown).toContain(
      "Hi",
    );
  });

  it("keeps static content canonical for repo-authored posts", () => {
    const staticPost = posts.find(
      (post) => post.slug === "big-table-vs-star-schema",
    );
    const row = {
      slug: "big-table-vs-star-schema",
      title: "Remote title",
      excerpt: "Remote excerpt.",
      body_markdown: "## Remote body",
      tags: ["remote"] as string[],
      reading_time: "2 min read",
      medium_url: null as string | null,
      published_at: "2026-06-02T00:00:00.000Z",
    };
    const out = mergePostsWithStaticFallback(
      { kind: "use_remote", rows: [row] },
      posts,
    );
    const merged = out.find((post) => post.slug === "big-table-vs-star-schema");
    expect(merged?.title).toBe(staticPost?.title);
    expect(merged?.bodyMarkdown).toBe(staticPost?.bodyMarkdown);
    expect(merged?.bodyMarkdown).toContain("## References");
    expect(merged?.updatedAt).toBe("2026-06-02");
    expect(merged?.relatedToolCtas).toEqual(staticPost?.relatedToolCtas);
  });

  it("prefers remote updatedAt and remote CTAs when provided for repo-authored posts", () => {
    const row = {
      slug: "big-table-vs-star-schema",
      title: "Remote title",
      excerpt: "Remote excerpt.",
      body_markdown: "## Remote body",
      tags: ["remote"] as string[],
      reading_time: "2 min read",
      updated_at: "2026-06-03T00:00:00.000Z",
      related_tool_ctas: [{ slug: "architecture-roulette", variant: "secondary" }],
      medium_url: null as string | null,
      published_at: "2026-06-03T00:00:00.000Z",
    };
    const out = mergePostsWithStaticFallback(
      { kind: "use_remote", rows: [row] },
      posts,
    );
    const merged = out.find((post) => post.slug === "big-table-vs-star-schema");
    expect(merged?.updatedAt).toBe("2026-06-03");
    expect(merged?.relatedToolCtas).toEqual([
      {
        slug: "architecture-roulette",
        label: "Architecture Decision Roulette",
        href: "/tools/architecture-roulette",
        variant: "secondary",
      },
    ]);
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
