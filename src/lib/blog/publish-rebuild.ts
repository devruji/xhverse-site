export type BlogRebuildEnv = {
  BLOG_REBUILD_HOOK_URL?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_PAGES_PROJECT_NAME?: string;
  CLOUDFLARE_PAGES_REBUILD_BRANCH?: string;
};

export type BlogRebuildResult =
  | { kind: "not_configured" }
  | { kind: "queued"; status: number; mode: "deploy_hook" | "pages_api" }
  | {
      kind: "failed";
      status: number;
      mode: "deploy_hook" | "pages_api";
      message: string;
    };

type RebuildRequestInit = {
  method: "POST";
  headers: Record<string, string>;
  body?: BodyInit;
};

type Fetcher = (
  input: string,
  init: RebuildRequestInit,
) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

type CloudflarePagesRebuildConfig = {
  accountId: string;
  apiToken: string;
  projectName: string;
  branch: string;
};

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

export function readCloudflarePagesRebuildConfig(
  env: BlogRebuildEnv,
): CloudflarePagesRebuildConfig | null {
  const apiToken = env.CLOUDFLARE_API_TOKEN?.trim();
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const projectName = env.CLOUDFLARE_PAGES_PROJECT_NAME?.trim();
  const branch = env.CLOUDFLARE_PAGES_REBUILD_BRANCH?.trim() || "main";
  if (!apiToken || !accountId || !projectName) return null;
  return { apiToken, accountId, projectName, branch };
}

export async function triggerBlogRebuild(options: {
  env: BlogRebuildEnv;
  reason: string;
  fetcher?: Fetcher;
}): Promise<BlogRebuildResult> {
  const fetcher = options.fetcher ?? fetch;
  const url = readBlogRebuildHookUrl(options.env);
  if (url) {
    return triggerDeployHookRebuild({ fetcher, url, reason: options.reason });
  }

  const pagesConfig = readCloudflarePagesRebuildConfig(options.env);
  if (pagesConfig) {
    return triggerCloudflarePagesRebuild({
      fetcher,
      config: pagesConfig,
      reason: options.reason,
    });
  }

  return { kind: "not_configured" };
}

async function triggerDeployHookRebuild(options: {
  fetcher: Fetcher;
  url: string;
  reason: string;
}): Promise<BlogRebuildResult> {
  const response = await options.fetcher(options.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reason: options.reason,
      source: "xhverse-admin-blog",
    }),
  });
  if (response.ok) {
    return { kind: "queued", status: response.status, mode: "deploy_hook" };
  }

  const message = (await response.text()).slice(0, 240);
  return {
    kind: "failed",
    status: response.status,
    mode: "deploy_hook",
    message: message || "Cloudflare rebuild hook failed.",
  };
}

async function triggerCloudflarePagesRebuild(options: {
  fetcher: Fetcher;
  config: CloudflarePagesRebuildConfig;
  reason: string;
}): Promise<BlogRebuildResult> {
  const { accountId, apiToken, branch, projectName } = options.config;
  const form = new FormData();
  form.set("branch", branch);
  form.set("commit_message", `Admin blog rebuild: ${options.reason}`);
  form.set("commit_dirty", "false");

  const response = await options.fetcher(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
      accountId,
    )}/pages/projects/${encodeURIComponent(projectName)}/deployments`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
      body: form,
    },
  );
  if (response.ok) {
    return { kind: "queued", status: response.status, mode: "pages_api" };
  }

  const message = (await response.text()).slice(0, 240);
  return {
    kind: "failed",
    status: response.status,
    mode: "pages_api",
    message: message || "Cloudflare Pages deployment API failed.",
  };
}

export function blogRebuildStatusMessage(result: BlogRebuildResult): string {
  if (result.kind === "queued") return "Cloudflare rebuild queued.";
  if (result.kind === "not_configured") return "Cloudflare rebuild is not configured.";
  return `Cloudflare rebuild failed (${result.status}).`;
}
