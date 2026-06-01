import { estimateReadingTimeFromMarkdown } from "./post-row";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_COVER_IMAGE_BYTES = 3 * 1024 * 1024;
export const COVER_IMAGE_MIME_TYPES = [
  "image/avif",
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

export type PostStatus = "draft" | "published";
export type CoverImageMimeType = (typeof COVER_IMAGE_MIME_TYPES)[number];

export type AdminPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  tags: string[] | null;
  reading_time: string | null;
  medium_url: string | null;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  cover_image_path?: string | null;
  cover_image_alt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
};

export type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  tagsInput: string;
  bodyMarkdown: string;
  readingTime: string;
  readingTimeManual: boolean;
  mediumUrl: string;
  coverImagePath: string;
  coverImageAlt: string;
  coverRemoved: boolean;
  hasStagedCoverImage: boolean;
  seoTitle: string;
  seoDescription: string;
  status: PostStatus;
  publishedAt: string;
};

export type FormValidationErrors = Partial<
  Record<keyof PostFormValues | "form", string>
>;

export type PostSaveIntent = "draft" | "publish" | "unpublish";

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateSlug(slug: string): string | null {
  if (!slug.trim()) return "Slug is required.";
  if (!SLUG_PATTERN.test(slug)) {
    return "Slug must be lowercase kebab-case (letters, numbers, hyphens).";
  }
  return null;
}

export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of input.split(",")) {
    const tag = part.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

export function formatTagsForInput(tags: string[] | null | undefined): string {
  if (!Array.isArray(tags)) return "";
  return tags.join(", ");
}

export function estimateReadingTime(markdown: string): string {
  return estimateReadingTimeFromMarkdown(markdown);
}

function optionalTrimmed(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSameOriginImagePath(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//");
}

export function isAllowedCoverImageMimeType(
  mimeType: string,
): mimeType is CoverImageMimeType {
  return COVER_IMAGE_MIME_TYPES.includes(mimeType as CoverImageMimeType);
}

export type CoverFileLike = {
  type: string;
  size: number;
};

export function validateCoverFile(file: CoverFileLike): string | null {
  if (!isAllowedCoverImageMimeType(file.type)) {
    return "Cover image must be AVIF, WebP, JPEG, or PNG.";
  }
  if (file.size > MAX_COVER_IMAGE_BYTES) {
    return "Cover image must be 3 MB or smaller.";
  }
  return null;
}

export function coverImageExtensionForMimeType(
  mimeType: CoverImageMimeType,
): "avif" | "webp" | "jpg" | "png" {
  if (mimeType === "image/avif") return "avif";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/png") return "png";
  return "jpg";
}

export function buildCoverImageObjectPath(
  slug: string,
  mimeType: CoverImageMimeType,
  id = crypto.randomUUID(),
): string {
  const slugError = validateSlug(slug);
  if (slugError) {
    throw new TypeError(slugError);
  }
  return `posts/${slug}/${id}.${coverImageExtensionForMimeType(mimeType)}`;
}

export function resolveCoverPathForSave(options: {
  existingPath: string;
  uploadedPath: string | null;
  coverRemoved: boolean;
}): string {
  if (options.coverRemoved) return "";
  return options.uploadedPath ?? options.existingPath;
}

export function shouldDeleteCoverAfterSave(options: {
  previousPath: string;
  nextPath: string;
}): boolean {
  return Boolean(
    options.previousPath && options.previousPath !== options.nextPath,
  );
}

export function validatePostForm(values: PostFormValues): FormValidationErrors {
  const errors: FormValidationErrors = {};

  if (!values.title.trim()) errors.title = "Title is required.";
  const slugError = validateSlug(values.slug);
  if (slugError) errors.slug = slugError;
  if (!values.excerpt.trim()) errors.excerpt = "Excerpt is required.";
  if (!values.bodyMarkdown.trim()) {
    errors.bodyMarkdown = "Body content is required.";
  }

  if (values.mediumUrl.trim() && !isValidHttpUrl(values.mediumUrl.trim())) {
    errors.mediumUrl = "Medium URL must be a valid http(s) URL.";
  }

  const hasCover =
    values.hasStagedCoverImage ||
    (Boolean(values.coverImagePath.trim()) && !values.coverRemoved);
  if (hasCover && !values.coverImageAlt.trim()) {
    errors.coverImageAlt = "Cover image alt text is required when a cover image is set.";
  }

  if (values.status === "published" && !values.publishedAt.trim()) {
    errors.publishedAt = "Publish date is required for published posts.";
  }

  return errors;
}

export function hasValidationErrors(errors: FormValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type PostUpsertPayload = {
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  tags: string[];
  reading_time: string | null;
  medium_url: string | null;
  status: PostStatus;
  published_at: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export function buildPostUpsertPayload(
  values: PostFormValues,
  intent: PostSaveIntent,
): PostUpsertPayload {
  const readingTime =
    values.readingTimeManual && values.readingTime.trim()
      ? values.readingTime.trim()
      : estimateReadingTime(values.bodyMarkdown);

  let status: PostStatus = values.status;
  let publishedAt: string | null = optionalTrimmed(values.publishedAt);

  if (intent === "draft") {
    status = "draft";
    publishedAt = null;
  } else if (intent === "publish") {
    status = "published";
    publishedAt = publishedAt ?? new Date().toISOString();
  } else if (intent === "unpublish") {
    status = "draft";
    publishedAt = null;
  }

  const shouldPersistCover = status === "published";

  return {
    slug: values.slug.trim(),
    title: values.title.trim(),
    excerpt: values.excerpt.trim(),
    body_markdown: values.bodyMarkdown,
    tags: parseTags(values.tagsInput),
    reading_time: readingTime,
    medium_url: optionalTrimmed(values.mediumUrl),
    status,
    published_at: publishedAt,
    cover_image_path: shouldPersistCover
      ? optionalTrimmed(values.coverImagePath)
      : null,
    cover_image_alt: shouldPersistCover && optionalTrimmed(values.coverImagePath)
      ? optionalTrimmed(values.coverImageAlt)
      : null,
    seo_title: optionalTrimmed(values.seoTitle),
    seo_description: optionalTrimmed(values.seoDescription),
  };
}

export type SupabasePostError = {
  message: string;
  code?: string;
  details?: string;
};

export function mapSupabasePostError(error: SupabasePostError): string {
  const message = error.message ?? "Unknown error";
  const lower = message.toLowerCase();

  if (error.code === "23505" || lower.includes("duplicate key")) {
    return "A post with this slug already exists.";
  }
  if (error.code === "23514" || lower.includes("posts_slug_format_check")) {
    return "Slug must be lowercase kebab-case.";
  }
  if (lower.includes("jwt") || lower.includes("not authenticated")) {
    return "Session expired. Please sign in again.";
  }
  if (lower.includes("permission denied") || lower.includes("row-level security")) {
    return "You do not have permission to modify posts.";
  }

  return message;
}

export type AdminPostsQueryResult =
  | { kind: "loaded"; data: AdminPostRow[] }
  | { kind: "failed"; message: string };

export function interpretAdminPostsResponse(
  data: unknown,
  error: SupabasePostError | null,
): AdminPostsQueryResult {
  if (error) {
    return { kind: "failed", message: mapSupabasePostError(error) };
  }
  if (!Array.isArray(data)) {
    return { kind: "failed", message: "Unexpected response from server." };
  }
  return { kind: "loaded", data: data as AdminPostRow[] };
}

export function filterAdminPosts(
  posts: AdminPostRow[],
  options: {
    status?: PostStatus | "all";
    query?: string;
  },
): AdminPostRow[] {
  const status = options.status ?? "all";
  const query = options.query?.trim().toLowerCase() ?? "";

  return posts.filter((post) => {
    if (status !== "all" && post.status !== status) return false;
    if (!query) return true;
    const haystack = [
      post.title,
      post.slug,
      formatTagsForInput(post.tags),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function adminPostFromFormValues(
  values: PostFormValues,
  existing?: Partial<AdminPostRow>,
): AdminPostRow {
  const now = new Date().toISOString();
  const payload = buildPostUpsertPayload(values, values.status === "published" ? "publish" : "draft");
  return {
    id: existing?.id ?? "",
    slug: payload.slug,
    title: payload.title,
    excerpt: payload.excerpt,
    body_markdown: payload.body_markdown,
    tags: payload.tags,
    reading_time: payload.reading_time,
    medium_url: payload.medium_url,
    status: payload.status,
    published_at: payload.published_at,
    updated_at: existing?.updated_at ?? now,
    created_at: existing?.created_at ?? now,
    cover_image_path: payload.cover_image_path,
    cover_image_alt: payload.cover_image_alt,
    seo_title: payload.seo_title,
    seo_description: payload.seo_description,
  };
}

export function formValuesFromAdminPost(post: AdminPostRow): PostFormValues {
  const estimated = estimateReadingTime(post.body_markdown);
  const readingTime = post.reading_time ?? estimated;
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    tagsInput: formatTagsForInput(post.tags),
    bodyMarkdown: post.body_markdown,
    readingTime,
    readingTimeManual: Boolean(post.reading_time && post.reading_time !== estimated),
    mediumUrl: post.medium_url ?? "",
    coverImagePath: post.cover_image_path ?? "",
    coverImageAlt: post.cover_image_alt ?? "",
    coverRemoved: false,
    hasStagedCoverImage: false,
    seoTitle: post.seo_title ?? "",
    seoDescription: post.seo_description ?? "",
    status: post.status,
    publishedAt: post.published_at
      ? post.published_at.slice(0, 16)
      : "",
  };
}

export function titleToSlugSuggestion(title: string): string {
  return normalizeSlug(title);
}
