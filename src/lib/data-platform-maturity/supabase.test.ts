import { describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { assessmentQuestions, type AssessmentAnswers } from "./questions";
import { calculateAssessmentResult } from "./scoring";
import {
  buildSubmissionPayload,
  createBrowserSupabaseClient,
  fallbackBenchmark,
  loadBenchmarkSummary,
  normalizeBenchmarkSummary,
  readBrowserSupabaseConfig,
  saveAssessmentSubmission,
  validateSubmissionPayload,
} from "./supabase";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

function answersWith(value: 1 | 2 | 3 | 4 | 5): AssessmentAnswers {
  return Object.fromEntries(
    assessmentQuestions.map((question) => [question.id, value]),
  ) as AssessmentAnswers;
}

describe("readBrowserSupabaseConfig", () => {
  it("returns null when public browser credentials are missing or blank", () => {
    expect(readBrowserSupabaseConfig({})).toBeNull();
    expect(
      readBrowserSupabaseConfig({ PUBLIC_SUPABASE_URL: "https://x.supabase.co" }),
    ).toBeNull();
    expect(
      readBrowserSupabaseConfig({
        PUBLIC_SUPABASE_URL: " ",
        PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key",
      }),
    ).toBeNull();
  });

  it("prefers publishable key and falls back to anon key", () => {
    expect(
      readBrowserSupabaseConfig({
        PUBLIC_SUPABASE_URL: " https://x.supabase.co ",
        PUBLIC_SUPABASE_PUBLISHABLE_KEY: " publishable ",
        PUBLIC_SUPABASE_ANON_KEY: "anon",
      }),
    ).toEqual({ url: "https://x.supabase.co", key: "publishable" });
    expect(
      readBrowserSupabaseConfig({
        PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        PUBLIC_SUPABASE_ANON_KEY: " anon ",
      }),
    ).toEqual({ url: "https://x.supabase.co", key: "anon" });
  });
});

describe("createBrowserSupabaseClient", () => {
  it("returns null without browser credentials", () => {
    vi.mocked(createClient).mockReset();

    expect(createBrowserSupabaseClient({})).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("creates a browser client without auth session persistence", () => {
    vi.mocked(createClient).mockReset();
    const client = { from: vi.fn() };
    vi.mocked(createClient).mockReturnValue(client as never);

    expect(
      createBrowserSupabaseClient({
        PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key",
      }),
    ).toBe(client);
    expect(createClient).toHaveBeenCalledWith("https://x.supabase.co", "key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  });
});

describe("submission payload", () => {
  it("builds anonymous payloads unless email is explicitly provided", () => {
    const answers = answersWith(4);
    const result = calculateAssessmentResult(answers);

    expect(buildSubmissionPayload(result, answers, " ").contact_email).toBeNull();
    expect(
      buildSubmissionPayload(result, answers, " person@example.com ").contact_email,
    ).toBe("person@example.com");
  });

  it("validates score, tier, category, answer, extra answer, and email constraints", () => {
    const answers = answersWith(3);
    const result = calculateAssessmentResult(answers);
    const valid = buildSubmissionPayload(result, answers, "");
    expect(validateSubmissionPayload(valid)).toEqual([]);

    const invalid = {
      ...valid,
      overall_score: 100.5,
      tier: "Unsupported",
      category_scores: { ...valid.category_scores, operations: -1 },
      answers: {
        ...valid.answers,
        "operations-1": 6,
        unexpected: 3,
      },
      contact_email: "not-an-email",
    };

    expect(validateSubmissionPayload(invalid as never)).toEqual([
      "overall_score must be an integer.",
      "overall_score must be between 0 and 100.",
      "tier is not supported.",
      "category score for operations must be between 0 and 100.",
      "answer for operations-1 must be between 1 and 5.",
      "answer unexpected is not part of this assessment.",
      "contact_email must be a valid email address when provided.",
    ]);
  });
});

describe("saveAssessmentSubmission", () => {
  it("skips when Supabase is not configured", async () => {
    const payload = buildSubmissionPayload(
      calculateAssessmentResult(answersWith(3)),
      answersWith(3),
      "",
    );

    await expect(saveAssessmentSubmission(null, payload)).resolves.toEqual({
      kind: "skipped",
      reason: "not_configured",
    });
  });

  it("fails before insert when validation fails", async () => {
    const from = vi.fn();
    const payload = buildSubmissionPayload(
      calculateAssessmentResult(answersWith(3)),
      answersWith(3),
      "bad-email",
    );

    await expect(saveAssessmentSubmission({ from } as never, payload)).resolves.toEqual({
      kind: "failed",
      message: "contact_email must be a valid email address when provided.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("returns saved or failed based on insert response", async () => {
    const payload = buildSubmissionPayload(
      calculateAssessmentResult(answersWith(3)),
      answersWith(3),
      "",
    );
    const insert = vi.fn().mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({
      error: { message: "permission denied" },
    });
    const from = vi.fn().mockReturnValue({ insert });
    const client = { from } as never;

    await expect(saveAssessmentSubmission(client, payload)).resolves.toEqual({
      kind: "saved",
    });
    await expect(saveAssessmentSubmission(client, payload)).resolves.toEqual({
      kind: "failed",
      message: "permission denied",
    });
    expect(from).toHaveBeenCalledWith("data_platform_maturity_submissions");
    expect(insert).toHaveBeenCalledWith(payload);
  });
});

describe("benchmark summary", () => {
  it("normalizes missing aggregate fields", () => {
    expect(
      normalizeBenchmarkSummary({
        submission_count: 2,
        average_overall_score: null,
        average_category_scores: { governance: 70 },
        tier_distribution: { Developing: 2 },
      }),
    ).toEqual({
      submissionCount: 2,
      averageOverallScore: null,
      averageCategoryScores: {
        platform_architecture: null,
        governance: 70,
        analytics_delivery: null,
        operations: null,
        documentation: null,
      },
      tierDistribution: {
        Foundational: 0,
        Developing: 2,
        Operational: 0,
        Advanced: 0,
      },
    });
  });

  it("loads fallback without client or when query fails", async () => {
    await expect(loadBenchmarkSummary(null)).resolves.toEqual(fallbackBenchmark);

    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } });
    const select = vi.fn().mockReturnValue({ single });
    const from = vi.fn().mockReturnValue({ select });

    await expect(loadBenchmarkSummary({ from } as never)).resolves.toEqual(
      fallbackBenchmark,
    );
  });

  it("loads aggregate benchmark rows", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        submission_count: 1,
        average_overall_score: 80,
        average_category_scores: { operations: 80 },
        tier_distribution: { Advanced: 1 },
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const from = vi.fn().mockReturnValue({ select });

    const summary = await loadBenchmarkSummary({ from } as never);

    expect(from).toHaveBeenCalledWith("data_platform_maturity_benchmark");
    expect(summary.averageOverallScore).toBe(80);
    expect(summary.tierDistribution.Advanced).toBe(1);
  });
});
