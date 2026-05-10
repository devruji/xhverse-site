// Deploy: bunx supabase functions deploy notify-cv-request
// Secrets: RESEND_API_KEY (shared with send-cv)
// Webhook: Supabase Dashboard → Database → Webhooks →
//   Table: cv_download_requests, Event: INSERT, Function: notify-cv-request

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface CvRecord {
  id: string;
  email: string;
  name: string | null;
  context: string | null;
  context_other: string | null;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: CvRecord;
}

const RESEND_API_URL = "https://api.resend.com/emails";
const ADMIN_EMAIL = "admin@xhverse.co";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

serve(async (req: Request): Promise<Response> => {
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== "INSERT") {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const { email, name, context, context_other } = payload.record;
    const displayName = name ? escapeHtml(name) : "(not provided)";
    const displayContext = context_other
      ? escapeHtml(context_other)
      : context
        ? escapeHtml(context)
        : "(not provided)";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="font-size: 18px; margin: 0 0 16px;">New CV Request</h2>
  <table style="border-collapse: collapse; width: 100%;">
    <tr><td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 600;">Email</td><td style="padding: 8px 12px; border: 1px solid #e5e5e5;">${escapeHtml(email)}</td></tr>
    <tr><td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 600;">Name</td><td style="padding: 8px 12px; border: 1px solid #e5e5e5;">${displayName}</td></tr>
    <tr><td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 600;">Context</td><td style="padding: 8px 12px; border: 1px solid #e5e5e5;">${displayContext}</td></tr>
  </table>
  <p style="margin-top: 20px;"><a href="https://xhverse.co/admin/cv-requests" style="color: #2563eb;">Review in Admin Panel →</a></p>
</body>
</html>`.trim();

    const emailResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "XHVerse Notifications <notifications@xhverse.co>",
        to: [ADMIN_EMAIL],
        subject: `New CV request from ${email}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const err = await emailResponse.text();
      return new Response(
        JSON.stringify({ error: "Failed to send notification", detail: err }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ notified: true, email }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
