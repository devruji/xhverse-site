import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CvRequestSubmission } from "./types";
import { validateSubmission } from "./validation";

type CvRequestsEnv = {
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
};

export type CvRequestSaveState =
  | { kind: "saved" }
  | { kind: "rate_limited" }
  | { kind: "validation_error"; message: string }
  | { kind: "skipped"; reason: "not_configured" }
  | { kind: "failed"; message: string };

export function readCvRequestsSupabaseConfig(
  env: CvRequestsEnv,
): { url: string; key: string } | null {
  const url = env.PUBLIC_SUPABASE_URL?.trim();
  const key =
    env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    env.PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return null;
  return { url, key };
}

export function createCvRequestsPublicClient(
  env: CvRequestsEnv,
): SupabaseClient | null {
  const config = readCvRequestsSupabaseConfig(env);
  if (!config) return null;

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function submitCvRequest(
  client: SupabaseClient | null,
  submission: CvRequestSubmission,
): Promise<CvRequestSaveState> {
  if (!client) return { kind: "skipped", reason: "not_configured" };

  const validationResult = validateSubmission(submission);
  if (!validationResult.valid) {
    return { kind: "validation_error", message: validationResult.error };
  }

  const { error } = await client.from("cv_download_requests").insert({
    email: submission.email.trim().toLowerCase(),
    name: submission.name?.trim() || null,
    context: submission.context,
    status: "pending",
  });

  if (error) {
    return { kind: "failed", message: error.message };
  }

  return { kind: "saved" };
}
