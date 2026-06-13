import { describe, expect, it, vi } from "vitest";
import {
  blogRebuildStatusMessage,
  readBlogRebuildHookUrl,
  readCloudflarePagesRebuildConfig,
  triggerBlogRebuild,
} from "./publish-rebuild";

describe("blog rebuild helpers", () => {
  it("reads only https rebuild hook URLs", () => {
    expect(readBlogRebuildHookUrl({})).toBeNull();
    expect(readBlogRebuildHookUrl({ BLOG_REBUILD_HOOK_URL: " " })).toBeNull();
    expect(readBlogRebuildHookUrl({ BLOG_REBUILD_HOOK_URL: "http://example.com" })).toBeNull();
    expect(readBlogRebuildHookUrl({ BLOG_REBUILD_HOOK_URL: "not a url" })).toBeNull();
    expect(
      readBlogRebuildHookUrl({
        BLOG_REBUILD_HOOK_URL: " https://api.cloudflare.com/client/v4/pages/hooks/abc ",
      }),
    ).toBe("https://api.cloudflare.com/client/v4/pages/hooks/abc");
  });

  it("reads Cloudflare Pages API rebuild config", () => {
    expect(readCloudflarePagesRebuildConfig({})).toBeNull();
    expect(
      readCloudflarePagesRebuildConfig({
        CLOUDFLARE_API_TOKEN: "token",
        CLOUDFLARE_ACCOUNT_ID: "account",
      }),
    ).toBeNull();
    expect(
      readCloudflarePagesRebuildConfig({
        CLOUDFLARE_API_TOKEN: " token ",
        CLOUDFLARE_ACCOUNT_ID: " account ",
        CLOUDFLARE_PAGES_PROJECT_NAME: " project ",
      }),
    ).toEqual({
      apiToken: "token",
      accountId: "account",
      projectName: "project",
      branch: "main",
    });
    expect(
      readCloudflarePagesRebuildConfig({
        CLOUDFLARE_API_TOKEN: "token",
        CLOUDFLARE_ACCOUNT_ID: "account",
        CLOUDFLARE_PAGES_PROJECT_NAME: "project",
        CLOUDFLARE_PAGES_REBUILD_BRANCH: " development ",
      }),
    ).toMatchObject({ branch: "development" });
  });

  it("skips rebuild when the hook is not configured", async () => {
    const fetcher = vi.fn();
    const result = await triggerBlogRebuild({
      env: {},
      reason: "blog-publish",
      fetcher,
    });
    expect(result).toEqual({ kind: "not_configured" });
    expect(fetcher).not.toHaveBeenCalled();
    expect(blogRebuildStatusMessage(result)).toBe("Cloudflare rebuild is not configured.");
  });

  it("queues rebuilds through the configured hook", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      text: async () => "",
    });
    const result = await triggerBlogRebuild({
      env: { BLOG_REBUILD_HOOK_URL: "https://example.com/hook" },
      reason: "blog-publish",
      fetcher,
    });
    expect(result).toEqual({ kind: "queued", status: 202, mode: "deploy_hook" });
    expect(fetcher).toHaveBeenCalledWith(
      "https://example.com/hook",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      reason: "blog-publish",
      source: "xhverse-admin-blog",
    });
    expect(blogRebuildStatusMessage(result)).toBe("Cloudflare rebuild queued.");
  });

  it("queues rebuilds through the Cloudflare Pages API when no hook exists", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
    });
    const result = await triggerBlogRebuild({
      env: {
        CLOUDFLARE_API_TOKEN: "token",
        CLOUDFLARE_ACCOUNT_ID: "account id",
        CLOUDFLARE_PAGES_PROJECT_NAME: "xhverse-site-git",
        CLOUDFLARE_PAGES_REBUILD_BRANCH: "main",
      },
      reason: "blog-publish",
      fetcher,
    });
    expect(result).toEqual({ kind: "queued", status: 200, mode: "pages_api" });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/account%20id/pages/projects/xhverse-site-git/deployments",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer token" },
      }),
    );
    const body = fetcher.mock.calls[0][1].body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("branch")).toBe("main");
    expect((body as FormData).get("commit_message")).toBe(
      "Admin blog rebuild: blog-publish",
    );
    expect((body as FormData).get("commit_dirty")).toBe("false");
  });

  it("prefers the deploy hook when both rebuild modes are configured", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      text: async () => "",
    });
    const result = await triggerBlogRebuild({
      env: {
        BLOG_REBUILD_HOOK_URL: "https://example.com/hook",
        CLOUDFLARE_API_TOKEN: "token",
        CLOUDFLARE_ACCOUNT_ID: "account",
        CLOUDFLARE_PAGES_PROJECT_NAME: "project",
      },
      reason: "blog-edit",
      fetcher,
    });
    expect(result).toEqual({ kind: "queued", status: 202, mode: "deploy_hook" });
    expect(fetcher.mock.calls[0][0]).toBe("https://example.com/hook");
  });

  it("uses global fetch when a fetcher is not provided", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetcher);
    const result = await triggerBlogRebuild({
      env: { BLOG_REBUILD_HOOK_URL: "https://example.com/hook" },
      reason: "blog-edit",
    });
    expect(result).toEqual({ kind: "queued", status: 200, mode: "deploy_hook" });
    vi.unstubAllGlobals();
  });

  it("maps failed hook responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "failed".repeat(80),
    });
    const result = await triggerBlogRebuild({
      env: { BLOG_REBUILD_HOOK_URL: "https://example.com/hook" },
      reason: "blog-delete",
      fetcher,
    });
    expect(result).toMatchObject({ kind: "failed", status: 500 });
    expect(result).toMatchObject({ mode: "deploy_hook" });
    expect(result.kind === "failed" ? result.message.length : 0).toBe(240);
    expect(blogRebuildStatusMessage(result)).toBe("Cloudflare rebuild failed (500).");
  });

  it("uses a default message for empty failed hook responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => "",
    });
    const result = await triggerBlogRebuild({
      env: { BLOG_REBUILD_HOOK_URL: "https://example.com/hook" },
      reason: "blog-delete",
      fetcher,
    });
    expect(result).toEqual({
      kind: "failed",
      status: 502,
      mode: "deploy_hook",
      message: "Cloudflare rebuild hook failed.",
    });
  });

  it("maps failed Cloudflare Pages API responses", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "forbidden",
    });
    const result = await triggerBlogRebuild({
      env: {
        CLOUDFLARE_API_TOKEN: "token",
        CLOUDFLARE_ACCOUNT_ID: "account",
        CLOUDFLARE_PAGES_PROJECT_NAME: "project",
      },
      reason: "blog-publish",
      fetcher,
    });
    expect(result).toEqual({
      kind: "failed",
      status: 403,
      mode: "pages_api",
      message: "forbidden",
    });
  });

  it("uses a default message for empty Cloudflare Pages API failures", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "",
    });
    const result = await triggerBlogRebuild({
      env: {
        CLOUDFLARE_API_TOKEN: "token",
        CLOUDFLARE_ACCOUNT_ID: "account",
        CLOUDFLARE_PAGES_PROJECT_NAME: "project",
      },
      reason: "blog-publish",
      fetcher,
    });
    expect(result).toEqual({
      kind: "failed",
      status: 500,
      mode: "pages_api",
      message: "Cloudflare Pages deployment API failed.",
    });
  });
});
