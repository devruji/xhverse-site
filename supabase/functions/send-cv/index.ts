// Deploy: bunx supabase functions deploy send-cv
// Secrets: bunx supabase secrets set RESEND_API_KEY=re_xxxxx
// Webhook: Supabase Dashboard → Database → Webhooks →
//   Table: cv_download_requests, Event: UPDATE, Function: send-cv
// DNS: Add Resend DKIM/SPF records for xhverse.co domain verification

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface CvRecord {
  id: string;
  email: string;
  name: string | null;
  status: string;
  sent_at: string | null;
}

interface WebhookPayload {
  type: "UPDATE" | "INSERT" | "DELETE";
  table: string;
  record: CvRecord;
  old_record: { status: string };
}

const CV_PDF_URL =
  "https://jxfpnfliioqbhzznaphd.supabase.co/storage/v1/object/public/documents/cv/rujikorn-ngoensaard-cv.pdf";

const RESEND_API_URL = "https://api.resend.com/emails";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildEmailHtml(name: string | null): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
  <p>${greeting}</p>
  <p>Thank you for your interest. Please find my CV attached.</p>
  <p>If you would like to discuss an engagement or explore how I can help your team, feel free to reply to this email or visit:<br>
    <a href="https://xhverse.co/services" style="color: #2563eb;">https://xhverse.co/services</a>
  </p>
  <p>Best regards,<br>Rujikorn Ngoensaard (XH)</p>
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
  <p style="font-size: 12px; color: #6b7280;">This email was sent because you requested a copy of my CV at xhverse.co.</p>
</body>
</html>`.trim();
}

serve(async (req: Request): Promise<Response> => {
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== "UPDATE") {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (payload.record.status !== "approved") {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (payload.old_record.status === "approved") {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (payload.record.sent_at !== null) {
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

    const pdfResponse = await fetch(CV_PDF_URL);
    if (!pdfResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve CV document" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const bytes = new Uint8Array(pdfBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const pdfBase64 = btoa(binary);

    const emailResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rujikorn Ngoensaard <cv@xhverse.co>",
        to: [payload.record.email],
        subject: "Your copy of Rujikorn Ngoensaard's CV",
        html: buildEmailHtml(payload.record.name),
        attachments: [
          {
            filename: "Rujikorn-Ngoensaard-CV.pdf",
            content: pdfBase64,
          },
        ],
      }),
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!emailResponse.ok) {
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from("cv_download_requests")
          .update({ delivery_status: "failed" })
          .eq("id", payload.record.id);
      }
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const emailResult = await emailResponse.json();
    const resendMessageId: string | null = emailResult?.id ?? null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from("cv_download_requests")
        .update({
          sent_at: new Date().toISOString(),
          resend_message_id: resendMessageId,
          delivery_status: "delivered",
        })
        .eq("id", payload.record.id);
    }

    return new Response(
      JSON.stringify({ sent: true, email: payload.record.email }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
