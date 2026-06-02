import {
  buildKnownBlogPostMap,
  isRecord,
  parseBlogViewRecordBody,
  parseBlogViewSlugsParam,
  sanitizeReferrerOrigin,
  validateBlogViewSlug,
  type BlogViewPostManifest,
} from "../../../src/lib/blog-views/core";
import {
  getBlogViewCounts,
  recordBlogView,
  type D1DatabaseLike,
} from "../../../src/lib/blog-views/server";

type BlogViewsEnv = {
  BLOG_ANALYTICS_DB?: D1DatabaseLike;
  BLOG_VIEW_TRACKING?: string;
};

type PagesContext = {
  request: Request;
  env: BlogViewsEnv;
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function loadManifest(request: Request): Promise<BlogViewPostManifest> {
  const manifestUrl = new URL("/blog-post-manifest.json", request.url);
  const response = await fetch(manifestUrl.toString());
  if (!response.ok) {
    throw new Error("Blog post manifest unavailable.");
  }
  const payload = (await response.json()) as unknown;
  if (!isRecord(payload) || !Array.isArray(payload.posts)) {
    throw new Error("Blog post manifest is invalid.");
  }
  return payload as BlogViewPostManifest;
}

function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const db = env.BLOG_ANALYTICS_DB;
  if (!db) return json({ error: "D1 binding unavailable." }, 503);

  try {
    const manifest = await loadManifest(request);
    const knownPosts = buildKnownBlogPostMap(manifest);
    const url = new URL(request.url);
    const requestedSlugs = parseBlogViewSlugsParam(url.searchParams.get("slugs") ?? url.searchParams.get("slug"));
    const invalidSlug = requestedSlugs.find((slug) => validateBlogViewSlug(slug) !== null);
    if (invalidSlug) return json({ error: "Invalid blog slug.", slug: invalidSlug }, 400);
    const slugs = requestedSlugs.filter((slug) => knownPosts.has(slug));
    const counts = await getBlogViewCounts(db, slugs);
    return json({ counts });
  } catch {
    return json({ error: "Blog view counts unavailable." }, 503);
  }
};

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const db = env.BLOG_ANALYTICS_DB;
  if (!db) return json({ error: "D1 binding unavailable." }, 503);
  if (!assertSameOrigin(request)) return json({ error: "Cross-origin writes are not allowed." }, 403);

  try {
    const manifest = await loadManifest(request);
    const knownPosts = buildKnownBlogPostMap(manifest);
    let body: unknown;
    body = await request.json();
    const parsed = parseBlogViewRecordBody(body, knownPosts);
    if ("code" in parsed) return json({ error: parsed.message, code: parsed.code }, parsed.code === "unknown-slug" ? 404 : 400);

    if (env.BLOG_VIEW_TRACKING === "disabled") {
      const counts = await getBlogViewCounts(db, [parsed.slug]);
      return json({ slug: parsed.slug, totalViews: counts[parsed.slug] ?? 0, counted: false });
    }

    const siteOrigin = new URL(request.url).origin;
    const response = await recordBlogView({
      db,
      request: parsed,
      post: knownPosts.get(parsed.slug) ?? {
        slug: parsed.slug,
        title: parsed.slug,
        date: new Date().toISOString().slice(0, 10),
      },
      referrerOrigin: sanitizeReferrerOrigin(request.headers.get("Referer"), siteOrigin),
    });

    return json(response);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json({ error: "Request body must be valid JSON." }, 400);
    }
    return json({ error: "Blog view tracking unavailable." }, 503);
  }
};
