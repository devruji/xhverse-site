import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  assessmentQuestions,
  maturityCategories,
  type AssessmentAnswers,
  type AssessmentOptionValue,
  type MaturityCategory,
} from "./questions";
import {
  maturityTiers,
  type AssessmentResult,
  type BenchmarkSummary,
  type MaturityTier,
} from "./scoring";

const BENCHMARK_RELATION = "data_platform_maturity_benchmark";

type BrowserSupabaseEnv = {
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
};

type BenchmarkRpcRow = {
  submission_count: number;
  average_overall_score: number | null;
  average_category_scores: Record<string, number | null> | null;
  tier_distribution: Record<string, number> | null;
};

export type AssessmentSubmissionPayload = {
  overall_score: number;
  tier: MaturityTier;
  category_scores: Record<MaturityCategory, number>;
  answers: AssessmentAnswers;
  contact_email: string | null;
};

export type SupabaseSaveState =
  | { kind: "saved" }
  | { kind: "skipped"; reason: "not_configured" }
  | { kind: "failed"; message: string };

export const fallbackBenchmark: BenchmarkSummary = {
  submissionCount: 0,
  averageOverallScore: null,
  averageCategoryScores: {
    platform_architecture: null,
    governance: null,
    analytics_delivery: null,
    operations: null,
    documentation: null,
  },
  tierDistribution: {
    Foundational: 0,
    Developing: 0,
    Operational: 0,
    Advanced: 0,
  },
};

export function readBrowserSupabaseConfig(
  env: BrowserSupabaseEnv,
): { url: string; key: string } | null {
  const url = env.PUBLIC_SUPABASE_URL?.trim();
  const key =
    env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    env.PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return null;
  return { url, key };
}

export function createBrowserSupabaseClient(
  env: BrowserSupabaseEnv,
): SupabaseClient | null {
  const config = readBrowserSupabaseConfig(env);
  if (!config) return null;

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function buildSubmissionPayload(
  result: AssessmentResult,
  answers: AssessmentAnswers,
  contactEmail: string,
): AssessmentSubmissionPayload {
  const trimmedEmail = contactEmail.trim();

  return {
    overall_score: result.overallScore,
    tier: result.tier,
    category_scores: Object.fromEntries(
      result.categoryScores.map((item) => [item.category, item.score]),
    ) as Record<MaturityCategory, number>,
    answers,
    contact_email: trimmedEmail ? trimmedEmail : null,
  };
}

export function validateSubmissionPayload(
  payload: AssessmentSubmissionPayload,
): string[] {
  const errors: string[] = [];

  if (!Number.isInteger(payload.overall_score)) {
    errors.push("overall_score must be an integer.");
  }
  if (payload.overall_score < 0 || payload.overall_score > 100) {
    errors.push("overall_score must be between 0 and 100.");
  }
  if (!maturityTiers.includes(payload.tier)) {
    errors.push("tier is not supported.");
  }

  for (const category of maturityCategories) {
    const score = payload.category_scores[category];
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      errors.push(`category score for ${category} must be between 0 and 100.`);
    }
  }

  for (const question of assessmentQuestions) {
    if (!isAssessmentOptionValue(payload.answers[question.id])) {
      errors.push(`answer for ${question.id} must be between 1 and 5.`);
    }
  }

  const allowedQuestionIds = new Set(
    assessmentQuestions.map((question) => question.id),
  );
  for (const answerId of Object.keys(payload.answers)) {
    if (!allowedQuestionIds.has(answerId)) {
      errors.push(`answer ${answerId} is not part of this assessment.`);
    }
  }

  if (
    payload.contact_email !== null &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact_email)
  ) {
    errors.push("contact_email must be a valid email address when provided.");
  }

  return errors;
}

export async function saveAssessmentSubmission(
  client: SupabaseClient | null,
  payload: AssessmentSubmissionPayload,
): Promise<SupabaseSaveState> {
  if (!client) return { kind: "skipped", reason: "not_configured" };

  const validationErrors = validateSubmissionPayload(payload);
  if (validationErrors.length > 0) {
    return { kind: "failed", message: validationErrors.join(" ") };
  }

  const { error } = await client
    .from("data_platform_maturity_submissions")
    .insert(payload);

  if (error) {
    return { kind: "failed", message: error.message };
  }

  return { kind: "saved" };
}

export async function loadBenchmarkSummary(
  client: SupabaseClient | null,
): Promise<BenchmarkSummary> {
  if (!client) return fallbackBenchmark;

  const { data, error } = await client
    .from(BENCHMARK_RELATION)
    .select(
      "submission_count,average_overall_score,average_category_scores,tier_distribution",
    )
    .single();
  if (error || !data) return fallbackBenchmark;

  return normalizeBenchmarkSummary(data as BenchmarkRpcRow);
}

export function normalizeBenchmarkSummary(
  row: BenchmarkRpcRow,
): BenchmarkSummary {
  return {
    submissionCount: row.submission_count,
    averageOverallScore: row.average_overall_score,
    averageCategoryScores: Object.fromEntries(
      maturityCategories.map((category) => [
        category,
        row.average_category_scores?.[category] ?? null,
      ]),
    ) as Record<MaturityCategory, number | null>,
    tierDistribution: Object.fromEntries(
      maturityTiers.map((tier) => [tier, row.tier_distribution?.[tier] ?? 0]),
    ) as Record<MaturityTier, number>,
  };
}

function isAssessmentOptionValue(
  value: unknown,
): value is AssessmentOptionValue {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}
