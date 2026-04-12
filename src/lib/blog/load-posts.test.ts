import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@supabase/supabase-js";
import { posts as staticFallback } from "../../data/blog";
import {
  createSupabaseClientForBuild,
  loadPublishedPostsForBuild,
  readSupabaseBuildCredentials,
} from "./load-posts";

describe("readSupabaseBuildCredentials", () => {
  it("returns null when URL or key is missing", () => {
    expect(readSupabaseBuildCredentials({})).toBeNull();
    expect(
      readSupabaseBuildCredentials({ SUPABASE_URL: "https://x.co" }),
    ).toBeNull();
    expect(
      readSupabaseBuildCredentials({ SUPABASE_SECRET_KEY: "k" }),
    ).toBeNull();
  });

  it("returns null for blank strings", () => {
    expect(
      readSupabaseBuildCredentials({
        SUPABASE_URL: "  ",
        SUPABASE_SECRET_KEY: "key",
      }),
    ).toBeNull();
  });

  it("returns trimmed credentials when both are set", () => {
    expect(
      readSupabaseBuildCredentials({
        SUPABASE_URL: " https://x.supabase.co ",
        SUPABASE_SECRET_KEY: " secret ",
      }),
    ).toEqual({ url: "https://x.supabase.co", key: "secret" });
  });
});

describe("createSupabaseClientForBuild", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("returns null without env", () => {
    expect(createSupabaseClientForBuild({})).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns a client when credentials exist", () => {
    const fake = { from: vi.fn() };
    vi.mocked(createClient).mockReturnValue(fake as never);
    const client = createSupabaseClientForBuild({
      SUPABASE_URL: "https://a.supabase.co",
      SUPABASE_SECRET_KEY: "k",
    });
    expect(client).toBe(fake);
    expect(createClient).toHaveBeenCalledWith(
      "https://a.supabase.co",
      "k",
    );
  });
});

describe("loadPublishedPostsForBuild", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("returns sorted static posts when client is null", async () => {
    const posts = await loadPublishedPostsForBuild(null, staticFallback);
    expect(posts.length).toBe(staticFallback.length);
    const dates = posts.map((p) => p.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it("falls back when the query returns an error", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "failed" },
    });
    const not = vi.fn().mockReturnValue({ order });
    const eq = vi.fn().mockReturnValue({ not });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as never;

    const posts = await loadPublishedPostsForBuild(client, staticFallback);
    expect(posts.map((p) => p.slug).sort()).toEqual(
      staticFallback.map((p) => p.slug).sort(),
    );
  });

  it("uses Supabase rows when the query succeeds", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          slug: "db-post",
          title: "From DB",
          excerpt: "E.",
          body_markdown: "# DB",
          tags: ["db"],
          reading_time: "1 min read",
          medium_url: null,
          published_at: "2026-12-01T00:00:00.000Z",
        },
      ],
      error: null,
    });
    const not = vi.fn().mockReturnValue({ order });
    const eq = vi.fn().mockReturnValue({ not });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as never;

    const posts = await loadPublishedPostsForBuild(client, staticFallback);
    expect(posts.some((p) => p.slug === "db-post")).toBe(true);
    expect(from).toHaveBeenCalledWith("posts");
  });
});
