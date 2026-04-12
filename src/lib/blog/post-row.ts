import type { BlogPost } from "../../data/blog";

export type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  tags: string[] | null;
  reading_time: string | null;
  medium_url: string | null;
  published_at: string;
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

export function mapPostRowToBlogPost(row: unknown): BlogPost {
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
  const mediumUrl = optionalString(r.medium_url) ?? "";

  return {
    slug,
    title,
    excerpt,
    date,
    tags,
    mediumUrl,
    readingTime,
    bodyMarkdown: body_markdown,
  };
}
