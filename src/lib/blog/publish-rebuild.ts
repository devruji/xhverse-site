export type BlogRebuildEnv = {
  BLOG_REBUILD_HOOK_URL?: string;
};

export type BlogRebuildResult =
  | { kind: "not_configured" }
  | { kind: "queued"; status: number }
  | { kind: "failed"; status: number; message: string };

type Fetcher = (
  input: string,
  init: { method: "POST"; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

export function readBlogRebuildHookUrl(env: BlogRebuildEnv): string | null {
  const value = env.BLOG_REBUILD_HOOK_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function triggerBlogRebuild(options: {
  env: BlogRebuildEnv;
  reason: string;
  fetcher?: Fetcher;
}): Promise<BlogRebuildResult> {
  const url = readBlogRebuildHookUrl(options.env);
  if (!url) return { kind: "not_configured" };

  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reason: options.reason,
      source: "xhverse-admin-blog",
    }),
  });
  if (response.ok) return { kind: "queued", status: response.status };

  const message = (await response.text()).slice(0, 240);
  return {
    kind: "failed",
    status: response.status,
    message: message || "Cloudflare rebuild hook failed.",
  };
}

export function blogRebuildStatusMessage(result: BlogRebuildResult): string {
  if (result.kind === "queued") return "Cloudflare rebuild queued.";
  if (result.kind === "not_configured") return "Cloudflare rebuild hook is not configured.";
  return `Cloudflare rebuild failed (${result.status}).`;
}
