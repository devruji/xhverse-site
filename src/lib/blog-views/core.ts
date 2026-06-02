const BLOG_VIEW_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const BLOG_VIEW_EVENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const MAX_BLOG_VIEW_SLUG_LENGTH = 120;
export const MAX_BLOG_VIEW_SLUGS_PER_REQUEST = 50;

export type BlogViewPostManifestEntry = {
  slug: string;
  title: string;
  date: string;
};

export type BlogViewPostManifest = {
  generatedAt: string;
  posts: BlogViewPostManifestEntry[];
};

export type BlogViewRecordRequest = {
  slug: string;
  eventId: string;
  path: string;
};

export type BlogViewRecordResponse = {
  slug: string;
  totalViews: number;
  counted: boolean;
};

export type BlogViewCountsResponse = {
  counts: Record<string, number>;
};

export type BlogViewAnalyticsResponse = {
  totals: Array<{
    slug: string;
    totalViews: number;
    lastViewedAt: string | null;
  }>;
  daily: Array<{
    slug: string;
    viewDate: string;
    totalViews: number;
  }>;
  referrers: Array<{
    slug: string;
    viewDate: string;
    referrerOrigin: string;
    totalViews: number;
  }>;
};

export type BlogViewRequestErrorCode =
  | "invalid-json"
  | "invalid-body"
  | "invalid-slug"
  | "unknown-slug"
  | "invalid-event-id"
  | "invalid-path";

export type BlogViewRequestError = {
  code: BlogViewRequestErrorCode;
  message: string;
};

export function validateBlogViewSlug(slug: string): string | null {
  if (!slug.trim()) return "Slug is required.";
  if (slug.length > MAX_BLOG_VIEW_SLUG_LENGTH) {
    return `Slug must be ${MAX_BLOG_VIEW_SLUG_LENGTH} characters or fewer.`;
  }
  if (!BLOG_VIEW_SLUG_PATTERN.test(slug)) {
    return "Slug must be lowercase kebab-case.";
  }
  return null;
}

export function buildKnownBlogPostMap(
  manifest: BlogViewPostManifest,
): Map<string, BlogViewPostManifestEntry> {
  return new Map(manifest.posts.map((post) => [post.slug, post]));
}

export function parseBlogViewSlugsParam(value: string | null): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const raw of value.split(",")) {
    const slug = raw.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
    if (slugs.length >= MAX_BLOG_VIEW_SLUGS_PER_REQUEST) break;
  }
  return slugs;
}

export function parseBlogViewRecordBody(
  body: unknown,
  knownPosts: Map<string, BlogViewPostManifestEntry>,
): BlogViewRecordRequest | BlogViewRequestError {
  if (!isRecord(body)) {
    return { code: "invalid-body", message: "Request body must be an object." };
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
  const path = typeof body.path === "string" ? body.path.trim() : "";
  const slugError = validateBlogViewSlug(slug);

  if (slugError) return { code: "invalid-slug", message: slugError };
  if (!knownPosts.has(slug)) {
    return { code: "unknown-slug", message: "Slug is not a published blog post." };
  }
  if (!BLOG_VIEW_EVENT_ID_PATTERN.test(eventId)) {
    return { code: "invalid-event-id", message: "eventId must be a UUID." };
  }
  if (path !== `/blog/${slug}` && path !== `/blog/${slug}/`) {
    return { code: "invalid-path", message: "path must match the blog slug." };
  }

  return { slug, eventId, path };
}

export function sanitizeReferrerOrigin(referrer: string | null, siteOrigin: string): string {
  if (!referrer) return "";
  try {
    const origin = new URL(referrer).origin;
    return origin === siteOrigin ? "" : origin.slice(0, 180);
  } catch {
    return "";
  }
}

export function formatBlogViewCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return "0 views";
  const rounded = Math.floor(count);
  if (rounded < 1000) return `${rounded} ${rounded === 1 ? "view" : "views"}`;
  if (rounded < 10000) return `${(rounded / 1000).toFixed(1)}k views`;
  if (rounded < 1000000) return `${Math.floor(rounded / 1000)}k views`;
  return `${(rounded / 1000000).toFixed(1)}m views`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
  }
  return 0;
}
