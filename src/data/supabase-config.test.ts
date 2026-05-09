import { describe, expect, it } from "vitest";
import {
  DEFAULT_SUPABASE_PROJECT_URL,
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
