import { describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  createCvRequestsPublicClient,
  readCvRequestsSupabaseConfig,
  submitCvRequest,
} from "./supabase";
import type { CvRequestSubmission } from "./types";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

const validSubmission: CvRequestSubmission = {
  email: "user@company.com",
  name: "Test User",
  context: "engagement",
  contextOther: null,
  honeypot: "",
};

describe("readCvRequestsSupabaseConfig", () => {
  it("returns null when credentials are missing", () => {
    expect(readCvRequestsSupabaseConfig({})).toBeNull();
    expect(
      readCvRequestsSupabaseConfig({
        PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      }),
    ).toBeNull();
    expect(
      readCvRequestsSupabaseConfig({
        PUBLIC_SUPABASE_URL: "  ",
        PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key",
      }),
    ).toBeNull();
  });

  it("prefers publishable key over anon key", () => {
    expect(
      readCvRequestsSupabaseConfig({
        PUBLIC_SUPABASE_URL: " https://x.supabase.co ",
        PUBLIC_SUPABASE_PUBLISHABLE_KEY: " pub-key ",
        PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toEqual({ url: "https://x.supabase.co", key: "pub-key" });
  });

  it("falls back to anon key", () => {
    expect(
      readCvRequestsSupabaseConfig({
        PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        PUBLIC_SUPABASE_ANON_KEY: " anon-key ",
      }),
    ).toEqual({ url: "https://x.supabase.co", key: "anon-key" });
  });
});

describe("createCvRequestsPublicClient", () => {
  it("returns null without credentials", () => {
    vi.mocked(createClient).mockReset();
    expect(createCvRequestsPublicClient({})).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("creates client with no session persistence", () => {
    vi.mocked(createClient).mockReset();
    const mockClient = { from: vi.fn() };
    vi.mocked(createClient).mockReturnValue(mockClient as never);

    const result = createCvRequestsPublicClient({
      PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key",
    });

    expect(result).toBe(mockClient);
    expect(createClient).toHaveBeenCalledWith(
      "https://x.supabase.co",
      "key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  });
});

describe("submitCvRequest", () => {
  it("returns skipped when client is null", async () => {
    const result = await submitCvRequest(null, validSubmission);
    expect(result).toEqual({ kind: "skipped", reason: "not_configured" });
  });

  it("returns validation_error for invalid submission", async () => {
    const from = vi.fn();
    const result = await submitCvRequest({ from } as never, {
      ...validSubmission,
      email: "bad",
    });
    expect(result).toEqual({
      kind: "validation_error",
      message: "Please enter a valid email address.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("returns validation_error when honeypot is filled", async () => {
    const from = vi.fn();
    const result = await submitCvRequest({ from } as never, {
      ...validSubmission,
      honeypot: "spam",
    });
    expect(result).toEqual({
      kind: "validation_error",
      message: "Submission rejected.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("returns saved on successful insert", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await submitCvRequest({ from } as never, validSubmission);

    expect(result).toEqual({ kind: "saved" });
    expect(from).toHaveBeenCalledWith("cv_download_requests");
    expect(insert).toHaveBeenCalledWith({
      email: "user@company.com",
      name: "Test User",
      context: "engagement",
      context_other: null,
      status: "pending",
    });
  });

  it("normalizes email to lowercase and trims", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    await submitCvRequest({ from } as never, {
      ...validSubmission,
      email: "  USER@Company.COM  ",
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ email: "user@company.com" }),
    );
  });

  it("normalizes empty name to null", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    await submitCvRequest({ from } as never, {
      ...validSubmission,
      name: "  ",
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: null }),
    );
  });

  it("returns duplicate_pending on unique constraint violation", async () => {
    const insert = vi
      .fn()
      .mockResolvedValue({ error: { code: "23505", message: "duplicate key value violates unique constraint" } });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await submitCvRequest({ from } as never, validSubmission);

    expect(result).toEqual({ kind: "duplicate_pending" });
  });

  it("returns failed when insert errors with non-duplicate error", async () => {
    const insert = vi
      .fn()
      .mockResolvedValue({ error: { code: "42501", message: "permission denied" } });
    const from = vi.fn().mockReturnValue({ insert });

    const result = await submitCvRequest({ from } as never, validSubmission);

    expect(result).toEqual({ kind: "failed", message: "permission denied" });
  });

  it("passes null context through", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    await submitCvRequest({ from } as never, {
      ...validSubmission,
      context: null,
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ context: null, context_other: null }),
    );
  });

  it("passes context_other when context is other", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    await submitCvRequest({ from } as never, {
      ...validSubmission,
      context: "other",
      contextOther: "  Recruiting for a startup  ",
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ context: "other", context_other: "Recruiting for a startup" }),
    );
  });

});
