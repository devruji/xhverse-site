import { describe, expect, it } from "vitest";
import {
  BLOG_COVERS_BUCKET,
  DEFAULT_SUPABASE_PROJECT_URL,
  blogCoverPublicUrl,
  resolveSupabaseOrigin,
} from "./supabase-config";

describe("DEFAULT_SUPABASE_PROJECT_URL", () => {
  it("is a valid HTTPS URL", () => {
    const url = new URL(DEFAULT_SUPABASE_PROJECT_URL);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toContain("supabase.co");
  });
});

describe("resolveSupabaseOrigin", () => {
  it("returns default when env is empty", () => {
    expect(resolveSupabaseOrigin()).toBe(DEFAULT_SUPABASE_PROJECT_URL);
    expect(resolveSupabaseOrigin({})).toBe(DEFAULT_SUPABASE_PROJECT_URL);
  });

  it("returns default when PUBLIC_SUPABASE_URL is empty string", () => {
    expect(resolveSupabaseOrigin({ PUBLIC_SUPABASE_URL: "" })).toBe(
      DEFAULT_SUPABASE_PROJECT_URL,
    );
    expect(resolveSupabaseOrigin({ PUBLIC_SUPABASE_URL: "  " })).toBe(
      DEFAULT_SUPABASE_PROJECT_URL,
    );
  });

  it("extracts origin from a valid URL", () => {
    expect(
      resolveSupabaseOrigin({
        PUBLIC_SUPABASE_URL: "https://abc123.supabase.co/rest/v1",
      }),
    ).toBe("https://abc123.supabase.co");
  });

  it("uses SUPABASE_URL when PUBLIC_SUPABASE_URL is not set", () => {
    expect(
      resolveSupabaseOrigin({
        SUPABASE_URL: "https://private.supabase.co/rest/v1",
      }),
    ).toBe("https://private.supabase.co");
  });

  it("prefers PUBLIC_SUPABASE_URL over SUPABASE_URL", () => {
    expect(
      resolveSupabaseOrigin({
        PUBLIC_SUPABASE_URL: "https://public.supabase.co",
        SUPABASE_URL: "https://private.supabase.co",
      }),
    ).toBe("https://public.supabase.co");
  });

  it("extracts origin without path", () => {
    expect(
      resolveSupabaseOrigin({
        PUBLIC_SUPABASE_URL: "https://myproject.supabase.co",
      }),
    ).toBe("https://myproject.supabase.co");
  });

  it("returns default for malformed URL", () => {
    expect(
      resolveSupabaseOrigin({ PUBLIC_SUPABASE_URL: "not-a-url" }),
    ).toBe(DEFAULT_SUPABASE_PROJECT_URL);
  });
});

describe("blogCoverPublicUrl", () => {
  it("builds a public Storage URL for blog covers", () => {
    expect(BLOG_COVERS_BUCKET).toBe("blog-covers");
    expect(
      blogCoverPublicUrl("/posts/demo/id.webp", {
        PUBLIC_SUPABASE_URL: "https://abc.supabase.co/rest/v1",
      }),
    ).toBe(
      "https://abc.supabase.co/storage/v1/object/public/blog-covers/posts/demo/id.webp",
    );
  });
});
