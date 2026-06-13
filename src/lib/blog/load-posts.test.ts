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
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

  beforeEach(() => {
    vi.mocked(createClient).mockReset();
    warnSpy.mockClear();
    infoSpy.mockClear();
  });

  it("returns sorted static posts when client is null", async () => {
    const posts = await loadPublishedPostsForBuild(null, staticFallback);
    expect(posts.length).toBe(staticFallback.length);
    const dates = posts.map((p) => p.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("throws when configured Supabase returns an error", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "failed" },
    });
    const lte = vi.fn().mockReturnValue({ order });
    const not = vi.fn().mockReturnValue({ lte });
    const eq = vi.fn().mockReturnValue({ not });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as never;

    await expect(loadPublishedPostsForBuild(client, staticFallback)).rejects.toThrow(
      "failed",
    );
    expect(warnSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("throws a generic error when the query error has no message", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: {},
    });
    const lte = vi.fn().mockReturnValue({ order });
    const not = vi.fn().mockReturnValue({ lte });
    const eq = vi.fn().mockReturnValue({ not });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as never;

    await expect(loadPublishedPostsForBuild(client, staticFallback)).rejects.toThrow(
      "Supabase posts query failed.",
    );
    expect(warnSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("returns no posts when configured Supabase returns no published rows", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const lte = vi.fn().mockReturnValue({ order });
    const not = vi.fn().mockReturnValue({ lte });
    const eq = vi.fn().mockReturnValue({ not });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as never;

    const posts = await loadPublishedPostsForBuild(client, staticFallback);
    expect(posts).toEqual([]);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      "[blog] Loaded 0 published post(s) from Supabase.",
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
          related_tool_ctas: [{ slug: "lakehouse-cost-calculator", variant: "primary" }],
        },
      ],
      error: null,
    });
    const lte = vi.fn().mockReturnValue({ order });
    const not = vi.fn().mockReturnValue({ lte });
    const eq = vi.fn().mockReturnValue({ not });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as never;

    const posts = await loadPublishedPostsForBuild(client, staticFallback);
    expect(posts).toHaveLength(1);
    expect(posts[0]?.slug).toBe("db-post");
    expect(posts[0]?.relatedToolCtas).toEqual([
      {
        slug: "lakehouse-cost-calculator",
        label: "Lakehouse Cost Calculator",
        href: "/tools/lakehouse-cost-calculator",
        variant: "primary",
      },
    ]);
    expect(from).toHaveBeenCalledWith("posts");
    expect(lte).toHaveBeenCalledWith("published_at", expect.any(String));
    expect(infoSpy).toHaveBeenCalledWith(
      "[blog] Loaded 1 published post(s) from Supabase.",
    );
  });

  it("retries legacy columns when enhanced metadata columns are not migrated yet", async () => {
    const enhancedOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "column posts.cover_image_path does not exist" },
    });
    const legacyOrder = vi.fn().mockResolvedValue({
      data: [
        {
          slug: "legacy-db-post",
          title: "Legacy DB",
          excerpt: "Legacy excerpt.",
          body_markdown: "# Legacy",
          tags: ["db"],
          reading_time: "1 min read",
          medium_url: null,
          published_at: "2026-11-01T00:00:00.000Z",
        },
      ],
      error: null,
    });
    const enhancedLte = vi.fn().mockReturnValue({ order: enhancedOrder });
    const legacyLte = vi.fn().mockReturnValue({ order: legacyOrder });
    const not = vi
      .fn()
      .mockReturnValueOnce({ lte: enhancedLte })
      .mockReturnValueOnce({ lte: legacyLte });
    const eq = vi.fn().mockReturnValue({ not });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as never;

    const posts = await loadPublishedPostsForBuild(client, staticFallback);
    expect(posts.some((p) => p.slug === "legacy-db-post")).toBe(true);
    expect(select).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      "[blog] Supabase posts metadata columns missing; retrying legacy post columns.",
    );
  });
});
