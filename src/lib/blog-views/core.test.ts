import { describe, expect, it } from "vitest";
import {
  buildKnownBlogPostMap,
  formatBlogViewCount,
  parseBlogViewRecordBody,
  parseBlogViewSlugsParam,
  sanitizeReferrerOrigin,
  toCount,
  validateBlogViewSlug,
  isRecord,
  type BlogViewPostManifest,
} from "./core";

const manifest: BlogViewPostManifest = {
  generatedAt: "2026-06-02T00:00:00.000Z",
  posts: [
    {
      slug: "open-table-formats-operating-model",
      title: "Open table formats are an operating model decision",
      date: "2026-06-02",
    },
  ],
};

const knownPosts = buildKnownBlogPostMap(manifest);

describe("blog view core helpers", () => {
  it("validates lowercase kebab-case blog slugs", () => {
    expect(validateBlogViewSlug("open-table-formats-operating-model")).toBeNull();
    expect(validateBlogViewSlug("")).toMatch(/required/i);
    expect(validateBlogViewSlug("Open-Table")).toMatch(/kebab-case/i);
    expect(validateBlogViewSlug("a".repeat(121))).toMatch(/120/);
  });

  it("parses and caps comma-separated slug params", () => {
    const slugs = parseBlogViewSlugsParam("a,b,a,,c");
    expect(slugs).toEqual(["a", "b", "c"]);
    expect(parseBlogViewSlugsParam(null)).toEqual([]);
    expect(parseBlogViewSlugsParam(Array.from({ length: 60 }, (_, index) => `p${index}`).join(","))).toHaveLength(50);
  });

  it("parses valid record bodies", () => {
    const parsed = parseBlogViewRecordBody(
      {
        slug: "open-table-formats-operating-model",
        eventId: "123e4567-e89b-12d3-a456-426614174000",
        path: "/blog/open-table-formats-operating-model",
      },
      knownPosts,
    );
    expect(parsed).toEqual({
      slug: "open-table-formats-operating-model",
      eventId: "123e4567-e89b-12d3-a456-426614174000",
      path: "/blog/open-table-formats-operating-model",
    });
  });

  it("rejects malformed record bodies", () => {
    expect(parseBlogViewRecordBody(null, knownPosts)).toMatchObject({ code: "invalid-body" });
    expect(parseBlogViewRecordBody({ slug: 1 }, knownPosts)).toMatchObject({ code: "invalid-slug" });
    expect(parseBlogViewRecordBody({ slug: "Bad" }, knownPosts)).toMatchObject({ code: "invalid-slug" });
    expect(parseBlogViewRecordBody({ slug: "missing-post" }, knownPosts)).toMatchObject({ code: "unknown-slug" });
    expect(parseBlogViewRecordBody({ slug: "open-table-formats-operating-model", eventId: "nope" }, knownPosts)).toMatchObject({ code: "invalid-event-id" });
    expect(
      parseBlogViewRecordBody(
        {
          slug: "open-table-formats-operating-model",
          eventId: "123e4567-e89b-12d3-a456-426614174000",
          path: "/blog/other",
        },
        knownPosts,
      ),
    ).toMatchObject({ code: "invalid-path" });
  });

  it("sanitizes referrer origins without storing same-origin or invalid values", () => {
    expect(sanitizeReferrerOrigin(null, "https://xhverse.co")).toBe("");
    expect(sanitizeReferrerOrigin("https://xhverse.co/blog", "https://xhverse.co")).toBe("");
    expect(sanitizeReferrerOrigin("https://example.com/path?q=1", "https://xhverse.co")).toBe("https://example.com");
    expect(sanitizeReferrerOrigin("not a url", "https://xhverse.co")).toBe("");
  });

  it("formats compact public counts", () => {
    expect(formatBlogViewCount(0)).toBe("0 views");
    expect(formatBlogViewCount(1)).toBe("1 view");
    expect(formatBlogViewCount(842)).toBe("842 views");
    expect(formatBlogViewCount(1240)).toBe("1.2k views");
    expect(formatBlogViewCount(12000)).toBe("12k views");
    expect(formatBlogViewCount(1200000)).toBe("1.2m views");
    expect(formatBlogViewCount(-1)).toBe("0 views");
    expect(formatBlogViewCount(Number.POSITIVE_INFINITY)).toBe("0 views");
  });

  it("normalizes database count values", () => {
    expect(toCount(4)).toBe(4);
    expect(toCount(4n)).toBe(4);
    expect(toCount("7")).toBe(7);
    expect(toCount(-2)).toBe(0);
    expect(toCount("nope")).toBe(0);
    expect(toCount(null)).toBe(0);
  });

  it("identifies plain records", () => {
    expect(isRecord({ ok: true })).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
  });
});
