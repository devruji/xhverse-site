import { describe, expect, it } from "vitest";
import {
  adminPostFromFormValues,
  buildCoverImageObjectPath,
  buildPostUpsertPayload,
  coverImageExtensionForMimeType,
  filterAdminPosts,
  formatTagsForInput,
  formValuesFromAdminPost,
  hasValidationErrors,
  interpretAdminPostsResponse,
  isAllowedCoverImageMimeType,
  isSameOriginImagePath,
  mapSupabasePostError,
  MAX_COVER_IMAGE_BYTES,
  normalizeSlug,
  parseTags,
  parseRelatedToolCtasInput,
  resolveCoverPathForSave,
  validateRelatedToolCtasInput,
  shouldDeleteCoverAfterSave,
  titleToSlugSuggestion,
  validateCoverFile,
  validatePostForm,
  validateSlug,
  type AdminPostRow,
  type PostFormValues,
  type PostSaveIntent,
} from "./admin-posts";

const baseValues: PostFormValues = {
  title: "Publishing Quality",
  slug: "publishing-quality",
  excerpt: "A concise article.",
  tagsInput: "astro, design, Astro",
  bodyMarkdown: "## Intro\n\nA short article body.",
  readingTime: "",
  readingTimeManual: false,
  mediumUrl: "",
  coverImagePath: "",
  coverImageAlt: "",
  coverRemoved: false,
  hasStagedCoverImage: false,
  seoTitle: "",
  seoDescription: "",
  relatedToolCtasInput: "",
  status: "draft",
  publishedAt: "",
};

const baseRow: AdminPostRow = {
  id: "post-1",
  slug: "publishing-quality",
  title: "Publishing Quality",
  excerpt: "A concise article.",
  body_markdown: "## Intro\n\nA short article body.",
  tags: ["astro", "design"],
  reading_time: "1 min read",
  medium_url: null,
  status: "draft",
  published_at: null,
  updated_at: "2026-06-01T10:00:00.000Z",
  created_at: "2026-06-01T09:00:00.000Z",
  cover_image_path: null,
  cover_image_alt: null,
  seo_title: null,
  seo_description: null,
  related_tool_ctas: null,
};

describe("admin post helpers", () => {
  it("normalizes and validates slugs", () => {
    expect(normalizeSlug(" Hello, XH Verse! ")).toBe("hello-xh-verse");
    expect(titleToSlugSuggestion("A Better Post")).toBe("a-better-post");
    expect(validateSlug("valid-post-1")).toBeNull();
    expect(validateSlug("")).toBe("Slug is required.");
    expect(validateSlug("Invalid Slug")).toMatch(/lowercase kebab-case/);
  });

  it("parses tags without duplicate casing", () => {
    expect(parseTags("astro, design, Astro, , data")).toEqual([
      "astro",
      "design",
      "data",
    ]);
    expect(formatTagsForInput(["a", "b"])).toBe("a, b");
    expect(formatTagsForInput(null)).toBe("");
  });

  it("validates required fields, urls, and cover metadata", () => {
    const errors = validatePostForm({
      ...baseValues,
      title: "",
      slug: "Bad Slug",
      excerpt: "",
      bodyMarkdown: "",
      mediumUrl: "ftp://example.com",
      coverImagePath: "posts/publishing-quality/11111111-1111-4111-8111-111111111111.webp",
      relatedToolCtasInput: "missing-tool:primary",
      status: "published",
    });
    expect(hasValidationErrors(errors)).toBe(true);
    expect(errors.title).toBe("Title is required.");
    expect(errors.slug).toMatch(/lowercase kebab-case/);
    expect(errors.mediumUrl).toMatch(/valid http/);
    expect(errors.coverImageAlt).toBe("Cover image alt text is required when a cover image is set.");
    expect(errors.excerpt).toBe("Excerpt is required.");
    expect(errors.bodyMarkdown).toBe("Body content is required.");
    expect(errors.publishedAt).toBe("Publish date is required for published posts.");
    expect(errors.relatedToolCtasInput).toBe("Unknown related tool slug: missing-tool.");

    expect(
      validatePostForm({
        ...baseValues,
        mediumUrl: "http://example.com/post",
        coverImagePath: "posts/publishing-quality/11111111-1111-4111-8111-111111111111.webp",
        coverImageAlt: "Cover",
      }),
    ).toEqual({});

    expect(
      validatePostForm({
        ...baseValues,
        hasStagedCoverImage: true,
      }).coverImageAlt,
    ).toBe("Cover image alt text is required when a cover image is set.");

    expect(
      validatePostForm({
        ...baseValues,
        coverImagePath: "posts/publishing-quality/11111111-1111-4111-8111-111111111111.webp",
        coverRemoved: true,
      }),
    ).toEqual({});

    expect(validatePostForm({ ...baseValues, mediumUrl: "not a url" }).mediumUrl).toMatch(/valid http/);
    expect(
      validatePostForm({
        ...baseValues,
        relatedToolCtasInput: "lakehouse-cost-calculator:tertiary",
      }).relatedToolCtasInput,
    ).toBe("Related tool variant must be primary or secondary.");
  });

  it("parses and formats related tool CTAs", () => {
    expect(
      parseRelatedToolCtasInput(
        "lakehouse-cost-calculator:primary\nunknown:primary, architecture-roulette:secondary, lakehouse-cost-calculator:secondary",
      ),
    ).toEqual([
      { slug: "lakehouse-cost-calculator", variant: "primary" },
      { slug: "architecture-roulette", variant: "secondary" },
    ]);
    expect(parseRelatedToolCtasInput("lakehouse-cost-calculator")).toEqual([
      { slug: "lakehouse-cost-calculator", variant: "secondary" },
    ]);
    expect(validateRelatedToolCtasInput("lakehouse-cost-calculator")).toBeNull();
    expect(validateRelatedToolCtasInput("lakehouse-cost-calculator:primary")).toBeNull();
    expect(validateRelatedToolCtasInput(":primary")).toBe("Unknown related tool slug: :primary.");
  });

  it("validates cover image files and object paths", () => {
    expect(isAllowedCoverImageMimeType("image/webp")).toBe(true);
    expect(isAllowedCoverImageMimeType("image/gif")).toBe(false);
    expect(validateCoverFile({ type: "image/webp", size: MAX_COVER_IMAGE_BYTES })).toBeNull();
    expect(validateCoverFile({ type: "image/gif", size: 10 })).toMatch(/AVIF/);
    expect(validateCoverFile({ type: "image/png", size: MAX_COVER_IMAGE_BYTES + 1 })).toMatch(/3 MB/);
    expect(coverImageExtensionForMimeType("image/avif")).toBe("avif");
    expect(coverImageExtensionForMimeType("image/webp")).toBe("webp");
    expect(coverImageExtensionForMimeType("image/jpeg")).toBe("jpg");
    expect(coverImageExtensionForMimeType("image/png")).toBe("png");
    expect(
      buildCoverImageObjectPath(
        "publishing-quality",
        "image/webp",
        "11111111-1111-4111-8111-111111111111",
      ),
    ).toBe("posts/publishing-quality/11111111-1111-4111-8111-111111111111.webp");
    expect(() => buildCoverImageObjectPath("Bad Slug", "image/webp")).toThrow(/lowercase/);
    expect(isSameOriginImagePath("/images/cover.png")).toBe(true);
    expect(isSameOriginImagePath("//cdn.example.com/cover.png")).toBe(false);
    expect(isSameOriginImagePath("https://example.com/cover.png")).toBe(false);
  });

  it("resolves cover paths and cleanup decisions", () => {
    expect(
      resolveCoverPathForSave({
        existingPath: "posts/old/id.webp",
        uploadedPath: null,
        coverRemoved: false,
      }),
    ).toBe("posts/old/id.webp");
    expect(
      resolveCoverPathForSave({
        existingPath: "posts/old/id.webp",
        uploadedPath: "posts/new/id.webp",
        coverRemoved: false,
      }),
    ).toBe("posts/new/id.webp");
    expect(
      resolveCoverPathForSave({
        existingPath: "posts/old/id.webp",
        uploadedPath: "posts/new/id.webp",
        coverRemoved: true,
      }),
    ).toBe("");
    expect(
      shouldDeleteCoverAfterSave({
        previousPath: "posts/old/id.webp",
        nextPath: "posts/new/id.webp",
      }),
    ).toBe(true);
    expect(
      shouldDeleteCoverAfterSave({
        previousPath: "",
        nextPath: "posts/new/id.webp",
      }),
    ).toBe(false);
  });

  it("builds payloads for draft, publish, and unpublish intents", () => {
    const draft = buildPostUpsertPayload(baseValues, "draft");
    expect(draft.status).toBe("draft");
    expect(draft.tags).toEqual(["astro", "design"]);
    expect(draft.reading_time).toBe("1 min read");
    expect(draft.published_at).toBeNull();
    expect(draft.cover_image_path).toBeNull();
    expect(draft.cover_image_alt).toBeNull();

    const manual = buildPostUpsertPayload(
      {
        ...baseValues,
        readingTimeManual: true,
        readingTime: "9 min read",
        mediumUrl: "https://medium.xhverse.co/post",
        coverImagePath:
          "posts/publishing-quality/11111111-1111-4111-8111-111111111111.webp",
        coverImageAlt: "Cover",
        seoTitle: "SEO",
        seoDescription: "Description",
        relatedToolCtasInput:
          "lakehouse-cost-calculator:primary\narchitecture-roulette:secondary",
      },
      "publish",
    );
    expect(manual.status).toBe("published");
    expect(manual.reading_time).toBe("9 min read");
    expect(manual.medium_url).toBe("https://medium.xhverse.co/post");
    expect(manual.cover_image_path).toBe(
      "posts/publishing-quality/11111111-1111-4111-8111-111111111111.webp",
    );
    expect(manual.cover_image_alt).toBe("Cover");
    expect(manual.seo_title).toBe("SEO");
    expect(manual.seo_description).toBe("Description");
    expect(manual.related_tool_ctas).toEqual([
      { slug: "lakehouse-cost-calculator", variant: "primary" },
      { slug: "architecture-roulette", variant: "secondary" },
    ]);
    expect(manual.published_at).toBeTruthy();

    const scheduled = buildPostUpsertPayload(
      { ...baseValues, publishedAt: "2026-06-01T10:00" },
      "publish",
    );
    expect(scheduled.published_at).toBe("2026-06-01T10:00");

    const unpublished = buildPostUpsertPayload(
      { ...baseValues, status: "published", publishedAt: "2026-06-01T10:00" },
      "unpublish",
    );
    expect(unpublished.status).toBe("draft");
    expect(unpublished.published_at).toBeNull();
    expect(unpublished.cover_image_path).toBeNull();
    expect(unpublished.cover_image_alt).toBeNull();

    const unchanged = buildPostUpsertPayload(
      { ...baseValues, status: "published", publishedAt: "2026-06-01T10:00" },
      "noop" as unknown as PostSaveIntent,
    );
    expect(unchanged.status).toBe("published");
    expect(unchanged.published_at).toBe("2026-06-01T10:00");
  });

  it("maps rows to and from form values", () => {
    const values = formValuesFromAdminPost(baseRow);
    expect(values.title).toBe(baseRow.title);
    expect(values.tagsInput).toBe("astro, design");
    expect(values.publishedAt).toBe("");

    const row = adminPostFromFormValues(
      { ...baseValues, status: "published", publishedAt: "2026-06-01T10:00" },
      baseRow,
    );
    expect(row.id).toBe(baseRow.id);
    expect(row.status).toBe("published");
    expect(row.published_at).toBe("2026-06-01T10:00");

    const newRow = adminPostFromFormValues(baseValues);
    expect(newRow.id).toBe("");
    expect(newRow.created_at).toBeTruthy();
    expect(newRow.updated_at).toBeTruthy();

    const publishedValues = formValuesFromAdminPost({
      ...baseRow,
      reading_time: null,
      published_at: "2026-06-01T10:00:00.000Z",
      medium_url: "https://medium.xhverse.co/post",
      cover_image_path:
        "posts/publishing-quality/11111111-1111-4111-8111-111111111111.webp",
      cover_image_alt: "Cover",
      seo_title: "SEO",
      seo_description: "Description",
      related_tool_ctas: [
        { slug: "lakehouse-cost-calculator", variant: "primary" },
        { slug: "architecture-roulette", variant: "secondary" },
      ],
      status: "published",
    });
    expect(publishedValues.readingTimeManual).toBe(false);
    expect(publishedValues.publishedAt).toBe("2026-06-01T10:00");
    expect(publishedValues.mediumUrl).toBe("https://medium.xhverse.co/post");
    expect(publishedValues.coverImagePath).toBe(
      "posts/publishing-quality/11111111-1111-4111-8111-111111111111.webp",
    );
    expect(publishedValues.coverImageAlt).toBe("Cover");
    expect(publishedValues.seoTitle).toBe("SEO");
    expect(publishedValues.seoDescription).toBe("Description");
    expect(publishedValues.relatedToolCtasInput).toBe(
      "lakehouse-cost-calculator:primary\narchitecture-roulette:secondary",
    );
  });

  it("filters posts by status and query", () => {
    const posts: AdminPostRow[] = [
      baseRow,
      { ...baseRow, id: "post-2", slug: "data-work", title: "Data Work", status: "published", tags: ["data"] },
    ];
    expect(filterAdminPosts(posts, { status: "draft" })).toEqual([baseRow]);
    expect(filterAdminPosts(posts, { query: "data" })).toHaveLength(1);
    expect(filterAdminPosts(posts, { status: "all", query: "publishing" })).toEqual([baseRow]);
  });

  it("interprets admin query responses and maps database errors", () => {
    expect(interpretAdminPostsResponse([baseRow], null)).toEqual({
      kind: "loaded",
      data: [baseRow],
    });
    expect(interpretAdminPostsResponse(null, { message: "duplicate key", code: "23505" })).toEqual({
      kind: "failed",
      message: "A post with this slug already exists.",
    });
    expect(interpretAdminPostsResponse(null, null)).toEqual({
      kind: "failed",
      message: "Unexpected response from server.",
    });

    expect(mapSupabasePostError({ message: "posts_slug_format_check", code: "23514" })).toBe("Slug must be lowercase kebab-case.");
    expect(mapSupabasePostError({ message: "JWT expired" })).toBe("Session expired. Please sign in again.");
    expect(mapSupabasePostError({ message: "row-level security violation" })).toBe("You do not have permission to modify posts.");
    expect(mapSupabasePostError({ message: "Other failure" })).toBe("Other failure");
    expect(mapSupabasePostError({ message: undefined as unknown as string })).toBe("Unknown error");
  });
});
