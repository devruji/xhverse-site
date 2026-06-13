import { describe, it, expect } from "vitest";
import { posts } from "../../data/blog";
import {
  interpretSupabasePostsResponse,
  resolvePostsForBuild,
  sortPostsByDateDesc,
} from "./interpret-merge";

describe("interpretSupabasePostsResponse", () => {
  it("treats query errors as build-stopping errors", () => {
    expect(
      interpretSupabasePostsResponse([], { message: "nope" }),
    ).toEqual({ kind: "query_error", message: "nope" });
  });

  it("uses remote rows when an array is returned, including empty arrays", () => {
    expect(interpretSupabasePostsResponse([], null)).toEqual({
      kind: "use_remote",
      rows: [],
    });
  });

  it("treats non-array data as an invalid remote payload", () => {
    expect(interpretSupabasePostsResponse(null, null)).toEqual({
      kind: "query_error",
      message: "Supabase posts query returned an invalid payload.",
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

describe("resolvePostsForBuild", () => {
  it("returns fallback copy only when no Supabase client exists", () => {
    const out = resolvePostsForBuild(
      { kind: "use_fallback", reason: "no_client" },
      posts,
    );
    expect(out).toEqual(posts);
    expect(out).not.toBe(posts);
  });

  it("uses remote rows without leaking static-only posts", () => {
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
    const out = resolvePostsForBuild(
      { kind: "use_remote", rows: [row] },
      posts,
    );
    expect(out.some((post) => post.slug === "remote-only")).toBe(true);
    expect(out.some((post) => post.slug === "big-table-vs-star-schema")).toBe(
      false,
    );
    expect(out.find((post) => post.slug === "remote-only")?.bodyMarkdown).toContain(
      "Hi",
    );
  });

  it("uses remote content for matching static slugs", () => {
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
    const out = resolvePostsForBuild(
      { kind: "use_remote", rows: [row] },
      posts,
    );
    const merged = out.find((post) => post.slug === "big-table-vs-star-schema");
    expect(merged?.title).toBe("Remote title");
    expect(merged?.bodyMarkdown).toBe("## Remote body");
    expect(merged?.updatedAt).toBe("2026-06-02");
  });

  it("maps related tool CTAs from remote rows", () => {
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
    const out = resolvePostsForBuild(
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

  it("throws query errors instead of publishing stale fallback content", () => {
    expect(() =>
      resolvePostsForBuild({ kind: "query_error", message: "failed" }, posts),
    ).toThrow("failed");
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
