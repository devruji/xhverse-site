import {
  validateBlogViewSlug,
} from "../../../../src/lib/blog-views/core";
import {
  getBlogViewAnalytics,
  type D1DatabaseLike,
} from "../../../../src/lib/blog-views/server";

type BlogAnalyticsEnv = {
  BLOG_ANALYTICS_DB?: D1DatabaseLike;
};

type PagesContext = {
  request: Request;
  env: BlogAnalyticsEnv;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function optionalDate(value: string | null): string | null {
  if (!value) return null;
  return DATE_PATTERN.test(value) ? value : null;
}

function isInvalidDateFilter(value: string | null): boolean {
  return Boolean(value) && !DATE_PATTERN.test(value as string);
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const db = env.BLOG_ANALYTICS_DB;
  if (!db) return json({ error: "D1 binding unavailable." }, 503);

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const safeSlug = slug && validateBlogViewSlug(slug) === null ? slug : null;
  if (
    isInvalidDateFilter(url.searchParams.get("from")) ||
    isInvalidDateFilter(url.searchParams.get("to"))
  ) {
    return json({ error: "Date filters must use YYYY-MM-DD." }, 400);
  }

  try {
    return json(
      await getBlogViewAnalytics({
        db,
        slug: safeSlug,
        from: optionalDate(url.searchParams.get("from")),
        to: optionalDate(url.searchParams.get("to")),
      }),
    );
  } catch {
    return json({ error: "Blog analytics unavailable." }, 503);
  }
};
