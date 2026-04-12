import { describe, it, expect } from "vitest";
import {
  estimateReadingTimeFromMarkdown,
  mapPostRowToBlogPost,
  publishedDateFromIso,
} from "./post-row";

describe("publishedDateFromIso", () => {
  it("returns YYYY-MM-DD from ISO timestamps", () => {
    expect(publishedDateFromIso("2026-04-01T12:00:00.000Z")).toBe("2026-04-01");
  });

  it("accepts date-only strings", () => {
    expect(publishedDateFromIso("2026-04-01")).toBe("2026-04-01");
  });

  it("uses a YYYY-MM-DD prefix when the full string does not parse", () => {
    expect(publishedDateFromIso("2026-04-01not-parseable")).toBe("2026-04-01");
  });

  it("rejects invalid dates", () => {
    expect(() => publishedDateFromIso("not-a-date")).toThrow(/valid date/);
  });
});

describe("estimateReadingTimeFromMarkdown", () => {
  it("returns at least one minute", () => {
    expect(estimateReadingTimeFromMarkdown("")).toBe("1 min read");
    expect(estimateReadingTimeFromMarkdown("hello")).toBe("1 min read");
  });

  it("scales with word count", () => {
    const words = Array.from({ length: 400 }, () => "word").join(" ");
    expect(estimateReadingTimeFromMarkdown(words)).toBe("2 min read");
  });
});

describe("mapPostRowToBlogPost", () => {
  const valid = {
    slug: "test-slug",
    title: "Title",
    excerpt: "Short excerpt.",
    body_markdown: "## Hello\n\nWorld.",
    tags: ["one", "two"],
    reading_time: "3 min read",
    medium_url: "https://medium.com/@x/story",
    published_at: "2026-01-15T00:00:00.000Z",
  };

  it("maps a complete row", () => {
    const post = mapPostRowToBlogPost(valid);
    expect(post.slug).toBe("test-slug");
    expect(post.title).toBe("Title");
    expect(post.excerpt).toBe("Short excerpt.");
    expect(post.bodyMarkdown).toBe("## Hello\n\nWorld.");
    expect(post.tags).toEqual(["one", "two"]);
    expect(post.readingTime).toBe("3 min read");
    expect(post.mediumUrl).toBe("https://medium.com/@x/story");
    expect(post.date).toBe("2026-01-15");
  });

  it("fills reading time from markdown when missing", () => {
    const post = mapPostRowToBlogPost({
      ...valid,
      reading_time: null,
      body_markdown: "one two three four five",
    });
    expect(post.readingTime).toBe("1 min read");
  });

  it("uses empty mediumUrl when absent", () => {
    const post = mapPostRowToBlogPost({ ...valid, medium_url: null });
    expect(post.mediumUrl).toBe("");
  });

  it("treats non-string body_markdown as empty", () => {
    const post = mapPostRowToBlogPost({
      ...valid,
      body_markdown: null as unknown as string,
    });
    expect(post.bodyMarkdown).toBe("");
  });

  it("ignores non-array tags and filters non-strings", () => {
    const post = mapPostRowToBlogPost({
      ...valid,
      tags: ["a", 1, "b"] as unknown as string[],
    });
    expect(post.tags).toEqual(["a", "b"]);
    const emptyTags = mapPostRowToBlogPost({ ...valid, tags: null });
    expect(emptyTags.tags).toEqual([]);
    const notArray = mapPostRowToBlogPost({
      ...valid,
      tags: "nope" as unknown as string[],
    });
    expect(notArray.tags).toEqual([]);
  });

  it("treats blank or non-string optional fields sanely", () => {
    const post = mapPostRowToBlogPost({
      ...valid,
      reading_time: "   ",
      medium_url: "   ",
    });
    expect(post.readingTime).toBeTruthy();
    expect(post.mediumUrl).toBe("");
    const numericOpts = mapPostRowToBlogPost({
      ...valid,
      reading_time: 99 as unknown as string,
      medium_url: false as unknown as string,
    });
    expect(numericOpts.readingTime).toBe("1 min read");
    expect(numericOpts.mediumUrl).toBe("");
  });

  it("rejects invalid rows", () => {
    expect(() => mapPostRowToBlogPost(null)).toThrow();
    expect(() => mapPostRowToBlogPost({})).toThrow();
    expect(() => mapPostRowToBlogPost({ ...valid, slug: "" })).toThrow();
  });
});
