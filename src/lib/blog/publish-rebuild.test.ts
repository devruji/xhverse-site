import { describe, expect, it, vi } from "vitest";
import {
  blogRebuildStatusMessage,
  readBlogRebuildHookUrl,
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

  it("skips rebuild when the hook is not configured", async () => {
    const fetcher = vi.fn();
    const result = await triggerBlogRebuild({
      env: {},
      reason: "blog-publish",
      fetcher,
    });
    expect(result).toEqual({ kind: "not_configured" });
    expect(fetcher).not.toHaveBeenCalled();
    expect(blogRebuildStatusMessage(result)).toBe("Cloudflare rebuild hook is not configured.");
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
    expect(result).toEqual({ kind: "queued", status: 202 });
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
    expect(result).toEqual({ kind: "queued", status: 200 });
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
      message: "Cloudflare rebuild hook failed.",
    });
  });
});
