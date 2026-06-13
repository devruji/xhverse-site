import {
  blogRebuildStatusMessage,
  triggerBlogRebuild,
  type BlogRebuildEnv,
} from "../../../../src/lib/blog/publish-rebuild";

type PagesContext = {
  request: Request;
  env: BlogRebuildEnv;
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  if (!assertSameOrigin(request)) {
    return json({ error: "Cross-origin rebuild requests are not allowed." }, 403);
  }

  let reason = "admin-blog-content-change";
  try {
    const body = (await request.json()) as unknown;
    if (body && typeof body === "object" && "reason" in body) {
      const value = (body as { reason?: unknown }).reason;
      if (typeof value === "string" && value.trim()) reason = value.trim().slice(0, 120);
    }
  } catch {
    reason = "admin-blog-content-change";
  }

  try {
    const result = await triggerBlogRebuild({ env, reason });
    const status = result.kind === "queued" ? 202 : result.kind === "failed" ? 502 : 200;
    return json({ result, message: blogRebuildStatusMessage(result) }, status);
  } catch {
    return json({ error: "Cloudflare rebuild unavailable." }, 503);
  }
};
