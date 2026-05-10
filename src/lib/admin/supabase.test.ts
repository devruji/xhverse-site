import { describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient, readBrowserSupabaseConfig } from "./supabase";

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

describe("readBrowserSupabaseConfig", () => {
  it("returns null when credentials are missing", () => {
    expect(readBrowserSupabaseConfig({})).toBeNull();
    expect(readBrowserSupabaseConfig({ PUBLIC_SUPABASE_URL: "https://x.supabase.co" })).toBeNull();
    expect(readBrowserSupabaseConfig({ PUBLIC_SUPABASE_URL: " ", PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key" })).toBeNull();
  });

  it("prefers publishable key over anon key", () => {
    expect(readBrowserSupabaseConfig({ PUBLIC_SUPABASE_URL: " https://x.supabase.co ", PUBLIC_SUPABASE_PUBLISHABLE_KEY: " pk ", PUBLIC_SUPABASE_ANON_KEY: "anon" })).toEqual({ url: "https://x.supabase.co", key: "pk" });
  });

  it("falls back to anon key when publishable is missing", () => {
    expect(readBrowserSupabaseConfig({ PUBLIC_SUPABASE_URL: "https://x.supabase.co", PUBLIC_SUPABASE_ANON_KEY: " anon " })).toEqual({ url: "https://x.supabase.co", key: "anon" });
  });
});

describe("createAdminClient", () => {
  it("returns null without credentials", () => {
    vi.mocked(createClient).mockReset();
    expect(createAdminClient({})).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("creates client with session persistence", () => {
    vi.mocked(createClient).mockReset();
    const client = { from: vi.fn() } as never;
    vi.mocked(createClient).mockReturnValue(client);
    const result = createAdminClient({ PUBLIC_SUPABASE_URL: "https://x.supabase.co", PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key" });
    expect(result).toBe(client);
    expect(createClient).toHaveBeenCalledWith("https://x.supabase.co", "key", { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  });
});
