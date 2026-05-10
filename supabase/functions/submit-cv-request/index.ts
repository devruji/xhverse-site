// Deploy: bunx supabase functions deploy submit-cv-request --no-verify-jwt
// Secrets: TURNSTILE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-available)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const ALLOWED_ORIGINS = ["https://xhverse.co", "http://localhost:4321"];

interface SubmitPayload {
  email: string;
  name?: string | null;
  context?: string | null;
  contextOther?: string | null;
  turnstileToken: string;
}

const VALID_CONTEXTS = [
  "engagement",
  "evaluation",
  "networking",
  "other",
];

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body: Record<string, unknown>, status: number, req: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
    const payload: SubmitPayload = await req.json();

    const email = payload.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ kind: "validation_error", message: "Valid email is required." }, 400, req);
    }

    if (!payload.turnstileToken) {
      return jsonResponse({ kind: "validation_error", message: "Verification challenge is required." }, 400, req);
    }

    const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!secretKey) {
      return jsonResponse({ kind: "failed", message: "Service not configured." }, 500, req);
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "";

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", payload.turnstileToken);
    if (clientIp) formData.append("remoteip", clientIp);

    const turnstileRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const turnstileResult = await turnstileRes.json();
    if (!turnstileResult.success) {
      return jsonResponse({ kind: "turnstile_failed", message: "Verification failed. Please try again." }, 403, req);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return jsonResponse({ kind: "failed", message: "Database not configured." }, 500, req);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const context = payload.context && VALID_CONTEXTS.includes(payload.context)
      ? payload.context
      : null;
    const contextOther = context === "other" ? (payload.contextOther?.trim() || null) : null;

    const { error } = await supabase.from("cv_download_requests").insert({
      email,
      name: payload.name?.trim() || null,
      context,
      context_other: contextOther,
      status: "pending",
    });

    if (error) {
      if (error.code === "23505") {
        return jsonResponse({ kind: "duplicate_pending" }, 200, req);
      }
      return jsonResponse({ kind: "failed", message: "Something went wrong." }, 500, req);
    }

    return jsonResponse({ kind: "saved" }, 200, req);
  } catch {
    return jsonResponse({ kind: "failed", message: "Internal server error." }, 500, req);
  }
});
