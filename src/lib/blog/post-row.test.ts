import { describe, it, expect } from "vitest";
import {
  deriveCoverImageUrl,
  estimateReadingTimeFromMarkdown,
  getAdjacentPosts,
  getRelatedPostsByTags,
  isValidCoverImagePath,
  mapPostRowToBlogPost,
  optionalValidCoverImagePath,
  publishedDateFromIso,
  resolveRelatedToolCtas,
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
    const post = mapPostRowToBlogPost({
      ...valid,
      updated_at: "2026-01-16T00:00:00.000Z",
      cover_image_path:
        "posts/test-slug/11111111-1111-4111-8111-111111111111.webp",
      cover_image_alt: "Cover image",
      seo_title: "SEO title",
      seo_description: "SEO description",
      related_tool_ctas: [
        { slug: "scd-design-lab", variant: "primary" },
        { slug: "architecture-roulette", variant: "secondary" },
      ],
    }, {
      supabaseEnv: {
        PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      },
    });
    expect(post.slug).toBe("test-slug");
    expect(post.title).toBe("Title");
    expect(post.excerpt).toBe("Short excerpt.");
    expect(post.bodyMarkdown).toBe("## Hello\n\nWorld.");
    expect(post.tags).toEqual(["one", "two"]);
    expect(post.readingTime).toBe("3 min read");
    expect(post.mediumUrl).toBe("https://medium.com/@x/story");
    expect(post.date).toBe("2026-01-15");
    expect(post.updatedAt).toBe("2026-01-16");
    expect(post.coverImageUrl).toBe(
      "https://abc.supabase.co/storage/v1/object/public/blog-covers/posts/test-slug/11111111-1111-4111-8111-111111111111.webp",
    );
    expect(post.coverImageAlt).toBe("Cover image");
    expect(post.seoTitle).toBe("SEO title");
    expect(post.seoDescription).toBe("SEO description");
    expect(post.relatedToolCtas).toEqual([
      {
        slug: "scd-design-lab",
        label: "SCD Design Lab",
        href: "/tools/scd-design-lab",
        variant: "primary",
      },
      {
        slug: "architecture-roulette",
        label: "Architecture Decision Roulette",
        href: "/tools/architecture-roulette",
        variant: "secondary",
      },
    ]);
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
    expect(post.relatedToolCtas).toBeUndefined();
  });

  it("drops non-http medium URLs from remote rows", () => {
    expect(
      mapPostRowToBlogPost({
        ...valid,
        medium_url: "javascript:alert(1)",
      }).mediumUrl,
    ).toBe("");
    expect(
      mapPostRowToBlogPost({
        ...valid,
        medium_url: "not a url",
      }).mediumUrl,
    ).toBe("");
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
      cover_image_path: 99 as unknown as string,
    });
    expect(post.readingTime).toBeTruthy();
    expect(post.mediumUrl).toBe("");
    expect(post.coverImageUrl).toBeUndefined();
    const numericOpts = mapPostRowToBlogPost({
      ...valid,
      reading_time: 99 as unknown as string,
      medium_url: false as unknown as string,
    });
    expect(numericOpts.readingTime).toBe("1 min read");
    expect(numericOpts.mediumUrl).toBe("");
  });

  it("drops external cover image URLs from public post data", () => {
    const post = mapPostRowToBlogPost({
      ...valid,
      cover_image_path: "https://cdn.example.com/cover.jpg",
      cover_image_alt: "Cover",
    });
    expect(post.coverImageUrl).toBeUndefined();
    expect(post.coverImageAlt).toBeUndefined();
  });

  it("omits blank cover image alt text even when the cover path is valid", () => {
    const post = mapPostRowToBlogPost({
      ...valid,
      cover_image_path:
        "posts/test-slug/11111111-1111-4111-8111-111111111111.webp",
      cover_image_alt: "   ",
    });
    expect(post.coverImageUrl).toBe(
      "https://jxfpnfliioqbhzznaphd.supabase.co/storage/v1/object/public/blog-covers/posts/test-slug/11111111-1111-4111-8111-111111111111.webp",
    );
    expect(post.coverImageAlt).toBeUndefined();
  });

  it("rejects invalid rows", () => {
    expect(() => mapPostRowToBlogPost(null)).toThrow();
    expect(() => mapPostRowToBlogPost({})).toThrow();
    expect(() => mapPostRowToBlogPost({ ...valid, slug: "" })).toThrow();
  });
});

describe("cover image path helpers", () => {
  const validPath =
    "posts/my-post/11111111-1111-4111-8111-111111111111.jpg";

  it("validates Storage object keys", () => {
    expect(isValidCoverImagePath(validPath)).toBe(true);
    expect(isValidCoverImagePath("/posts/my-post/id.jpg")).toBe(false);
    expect(isValidCoverImagePath("posts/my_post/11111111-1111-4111-8111-111111111111.jpg")).toBe(false);
    expect(isValidCoverImagePath("https://cdn.example.com/cover.jpg")).toBe(false);
  });

  it("returns null for invalid optional cover paths", () => {
    expect(optionalValidCoverImagePath(validPath)).toBe(validPath);
    expect(optionalValidCoverImagePath("")).toBeNull();
    expect(optionalValidCoverImagePath("https://example.com/x.jpg")).toBeNull();
  });

  it("derives public URLs only for valid paths", () => {
    expect(
      deriveCoverImageUrl(validPath, {
        PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      }),
    ).toBe(
      `https://abc.supabase.co/storage/v1/object/public/blog-covers/${validPath}`,
    );
    expect(deriveCoverImageUrl("https://example.com/x.jpg")).toBeUndefined();
  });
});

describe("resolveRelatedToolCtas", () => {
  it("returns undefined when metadata is absent or contains no valid CTAs", () => {
    expect(resolveRelatedToolCtas(undefined)).toBeUndefined();
    expect(resolveRelatedToolCtas("not-json")).toBeUndefined();
    expect(resolveRelatedToolCtas([
      null,
      "nope",
      { slug: "not-a-tool", variant: "primary" },
      { slug: "sql-deathmatch", variant: "feature" },
    ])).toBeUndefined();
  });

  it("normalizes known tools and ignores duplicate slugs", () => {
    expect(resolveRelatedToolCtas([
      { slug: "scd-design-lab", variant: "primary" },
      { slug: "scd-design-lab", variant: "secondary" },
      { slug: "architecture-roulette", variant: "secondary" },
    ])).toEqual([
      {
        slug: "scd-design-lab",
        label: "SCD Design Lab",
        href: "/tools/scd-design-lab",
        variant: "primary",
      },
      {
        slug: "architecture-roulette",
        label: "Architecture Decision Roulette",
        href: "/tools/architecture-roulette",
        variant: "secondary",
      },
    ]);
  });
});

describe("post navigation helpers", () => {
  const posts = [
    {
      slug: "first",
      title: "First",
      excerpt: "First",
      date: "2026-06-01",
      tags: ["astro", "design"],
      mediumUrl: "",
      readingTime: "1 min read",
      bodyMarkdown: "First",
    },
    {
      slug: "second",
      title: "Second",
      excerpt: "Second",
      date: "2026-06-02",
      tags: ["astro"],
      mediumUrl: "",
      readingTime: "1 min read",
      bodyMarkdown: "Second",
    },
    {
      slug: "third",
      title: "Third",
      excerpt: "Third",
      date: "2026-06-03",
      tags: ["data", "astro"],
      mediumUrl: "",
      readingTime: "1 min read",
      bodyMarkdown: "Third",
    },
    {
      slug: "fifth",
      title: "Fifth",
      excerpt: "Fifth",
      date: "2026-05-01",
      tags: ["astro", "design"],
      mediumUrl: "",
      readingTime: "1 min read",
      bodyMarkdown: "Fifth",
    },
    {
      slug: "fourth",
      title: "Fourth",
      excerpt: "Fourth",
      date: "2026-06-04",
      tags: [],
      mediumUrl: "",
      readingTime: "1 min read",
      bodyMarkdown: "Fourth",
    },
  ];

  it("returns adjacent posts and null edges", () => {
    expect(getAdjacentPosts(posts, "second")).toEqual({
      prev: posts[0],
      next: posts[2],
    });
    expect(getAdjacentPosts(posts, "first")).toEqual({
      prev: null,
      next: posts[1],
    });
    expect(getAdjacentPosts(posts, "fourth")).toEqual({
      prev: posts[3],
      next: null,
    });
    expect(getAdjacentPosts(posts, "missing")).toEqual({
      prev: null,
      next: null,
    });
  });

  it("finds related posts by tag overlap and date tie-breaker", () => {
    expect(getRelatedPostsByTags(posts, "first", 3).map((post) => post.slug)).toEqual([
      "fifth",
      "third",
      "second",
    ]);
    expect(getRelatedPostsByTags(posts, "fourth")).toEqual([]);
    expect(getRelatedPostsByTags(posts, "missing")).toEqual([]);
  });
});
