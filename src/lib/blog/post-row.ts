import {
  blogToolCtaDefinitions,
  type BlogPost,
  type BlogToolSlug,
  type RelatedToolCta,
  type RelatedToolCtaVariant,
} from "../../data/blog";
import { blogCoverPublicUrl } from "../../data/supabase-config";

export type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  tags: string[] | null;
  reading_time: string | null;
  medium_url: string | null;
  published_at: string;
  updated_at?: string | null;
  cover_image_path?: string | null;
  cover_image_alt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  related_tool_ctas?: unknown;
};

export const COVER_IMAGE_PATH_PATTERN =
  /^posts\/[a-z0-9]+(?:-[a-z0-9]+)*\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|avif|jpg|jpeg|png)$/;

type SupabaseUrlEnv = {
  PUBLIC_SUPABASE_URL?: string;
  SUPABASE_URL?: string;
};

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`posts.${field} must be a non-empty string`);
  }
  return value;
}

function optionalString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length ? t : null;
}

function optionalHttpUrl(value: unknown): string | null {
  const urlValue = optionalString(value);
  if (!urlValue) return null;
  try {
    const url = new URL(urlValue);
    return url.protocol === "http:" || url.protocol === "https:"
      ? urlValue
      : null;
  } catch {
    return null;
  }
}

function isKnownBlogToolSlug(value: unknown): value is BlogToolSlug {
  return (
    typeof value === "string" &&
    Object.hasOwn(blogToolCtaDefinitions, value)
  );
}

function isRelatedToolCtaVariant(
  value: unknown,
): value is RelatedToolCtaVariant {
  return value === "primary" || value === "secondary";
}

export function resolveRelatedToolCtas(value: unknown): RelatedToolCta[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const seen = new Set<BlogToolSlug>();
  const ctas: RelatedToolCta[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;

    const record = entry as Record<string, unknown>;
    if (!isKnownBlogToolSlug(record.slug)) continue;
    if (!isRelatedToolCtaVariant(record.variant)) continue;
    if (seen.has(record.slug)) continue;

    const definition = blogToolCtaDefinitions[record.slug];
    ctas.push({
      slug: record.slug,
      label: definition.label,
      href: definition.href,
      variant: record.variant,
    });
    seen.add(record.slug);
  }

  return ctas.length > 0 ? ctas : undefined;
}

export function isValidCoverImagePath(value: string): boolean {
  return COVER_IMAGE_PATH_PATTERN.test(value);
}

export function optionalValidCoverImagePath(value: unknown): string | null {
  const path = optionalString(value);
  if (!path) return null;
  return isValidCoverImagePath(path) ? path : null;
}

export function deriveCoverImageUrl(
  pathValue: unknown,
  env: SupabaseUrlEnv = {},
): string | undefined {
  const path = optionalValidCoverImagePath(pathValue);
  if (!path) return undefined;
  return blogCoverPublicUrl(path, env);
}

export function publishedDateFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const slice = iso.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
    throw new TypeError(`posts.published_at must be a valid date, got ${iso}`);
  }
  return d.toISOString().slice(0, 10);
}

export function estimateReadingTimeFromMarkdown(markdown: string): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export function mapPostRowToBlogPost(
  row: unknown,
  options?: { supabaseEnv?: SupabaseUrlEnv },
): BlogPost {
  if (!row || typeof row !== "object") {
    throw new TypeError("post row must be an object");
  }
  const r = row as Record<string, unknown>;
  const slug = requireNonEmptyString(r.slug, "slug");
  const title = requireNonEmptyString(r.title, "title");
  const excerpt = requireNonEmptyString(r.excerpt, "excerpt");
  const body_markdown =
    typeof r.body_markdown === "string" ? r.body_markdown : "";
  const published_at = requireNonEmptyString(r.published_at, "published_at");
  const date = publishedDateFromIso(published_at);
  const tags = Array.isArray(r.tags)
    ? r.tags.filter((t): t is string => typeof t === "string")
    : [];
  const readingTimeRaw = optionalString(r.reading_time);
  const readingTime =
    readingTimeRaw ?? estimateReadingTimeFromMarkdown(body_markdown);
  const mediumUrl = optionalHttpUrl(r.medium_url) ?? "";
  const updatedAtRaw = optionalString(r.updated_at);
  const updatedAt = updatedAtRaw ? publishedDateFromIso(updatedAtRaw) : date;
  const coverImageUrl = deriveCoverImageUrl(
    r.cover_image_path,
    options?.supabaseEnv,
  );
  const coverImageAlt = coverImageUrl
    ? (optionalString(r.cover_image_alt) ?? undefined)
    : undefined;
  const seoTitle = optionalString(r.seo_title) ?? undefined;
  const seoDescription = optionalString(r.seo_description) ?? undefined;
  const relatedToolCtas = resolveRelatedToolCtas(r.related_tool_ctas);

  return {
    slug,
    title,
    excerpt,
    date,
    tags,
    mediumUrl,
    readingTime,
    bodyMarkdown: body_markdown,
    updatedAt,
    coverImageUrl,
    coverImageAlt,
    seoTitle,
    seoDescription,
    relatedToolCtas,
  };
}

export function getAdjacentPosts(
  posts: BlogPost[],
  slug: string,
): { prev: BlogPost | null; next: BlogPost | null } {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export function getRelatedPostsByTags(
  posts: BlogPost[],
  slug: string,
  limit = 3,
): BlogPost[] {
  const current = posts.find((post) => post.slug === slug);
  if (!current || current.tags.length === 0) return [];
  const tagSet = new Set(current.tags);
  return posts
    .filter((post) => post.slug !== slug)
    .map((post) => ({
      post,
      overlap: post.tags.filter((tag) => tagSet.has(tag)).length,
    }))
    .filter((entry) => entry.overlap > 0)
    .sort((left, right) => {
      if (right.overlap !== left.overlap) return right.overlap - left.overlap;
      return right.post.date.localeCompare(left.post.date);
    })
    .slice(0, limit)
    .map((entry) => entry.post);
}
