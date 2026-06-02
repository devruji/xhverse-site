import {
  type BlogViewAnalyticsResponse,
  type BlogViewPostManifestEntry,
  type BlogViewRecordRequest,
  type BlogViewRecordResponse,
  toCount,
} from "./core";

export type D1Result<T = unknown> = {
  results?: T[];
  success?: boolean;
  meta?: {
    changes?: number;
  };
};

export type D1PreparedStatement<T = unknown> = {
  bind: (...values: Array<string | number | null>) => D1PreparedStatement<T>;
  first: <R = T>() => Promise<R | null>;
  all: <R = T>() => Promise<D1Result<R>>;
  run: () => Promise<D1Result<T>>;
};

export type D1DatabaseLike = {
  prepare: <T = unknown>(query: string) => D1PreparedStatement<T>;
};

export async function recordBlogView(options: {
  db: D1DatabaseLike;
  request: BlogViewRecordRequest;
  post: BlogViewPostManifestEntry;
  referrerOrigin: string;
}): Promise<BlogViewRecordResponse> {
  const { db, request, post, referrerOrigin } = options;

  await db
    .prepare(
      `insert into blog_post_registry (slug, title, published_at, last_seen_at)
       values (?, ?, ?, current_timestamp)
       on conflict(slug) do update set
         title = excluded.title,
         published_at = excluded.published_at,
         is_active = 1,
         last_seen_at = current_timestamp`,
    )
    .bind(post.slug, post.title, post.date)
    .run();

  const inserted = await db
    .prepare(
      `insert or ignore into blog_view_events
        (event_id, slug, path, referrer_origin)
       values (?, ?, ?, ?)`,
    )
    .bind(
      request.eventId,
      request.slug,
      request.path,
      referrerOrigin,
    )
    .run();

  const counted = (inserted.meta?.changes ?? 0) > 0;
  if (counted) {
    const viewDate = new Date().toISOString().slice(0, 10);
    await db
      .prepare(
        `insert into blog_view_counters (slug, total_views, last_viewed_at)
         values (?, 1, current_timestamp)
         on conflict(slug) do update set
           total_views = total_views + 1,
           last_viewed_at = current_timestamp`,
      )
      .bind(request.slug)
      .run();
    await db
      .prepare(
        `insert into blog_view_daily_rollups (slug, view_date, total_views)
         values (?, ?, 1)
         on conflict(slug, view_date) do update set
           total_views = total_views + 1`,
      )
      .bind(request.slug, viewDate)
      .run();
    await db
      .prepare(
        `insert into blog_view_referrer_rollups
          (slug, view_date, referrer_origin, total_views)
         values (?, ?, ?, 1)
         on conflict(slug, view_date, referrer_origin) do update set
           total_views = total_views + 1`,
      )
      .bind(request.slug, viewDate, referrerOrigin)
      .run();
  }

  const current = await getBlogViewCounts(db, [request.slug]);
  return {
    slug: request.slug,
    totalViews: current[request.slug],
    counted,
  };
}

export async function getBlogViewCounts(
  db: D1DatabaseLike,
  slugs: string[],
): Promise<Record<string, number>> {
  const counts = Object.fromEntries(slugs.map((slug) => [slug, 0]));
  if (slugs.length === 0) return counts;

  const placeholders = slugs.map(() => "?").join(",");
  const rows = await db
    .prepare<{ slug: string; total_views: number }>(
      `select slug, total_views from blog_view_counters where slug in (${placeholders})`,
    )
    .bind(...slugs)
    .all<{ slug: string; total_views: number }>();

  for (const row of rows.results ?? []) {
    counts[row.slug] = toCount(row.total_views);
  }

  return counts;
}

export async function getBlogViewAnalytics(options: {
  db: D1DatabaseLike;
  slug: string | null;
  from: string | null;
  to: string | null;
}): Promise<BlogViewAnalyticsResponse> {
  const { db, slug, from, to } = options;
  const filters: string[] = [];
  const values: string[] = [];

  if (slug) {
    filters.push("slug = ?");
    values.push(slug);
  }
  if (from) {
    filters.push("view_date >= ?");
    values.push(from);
  }
  if (to) {
    filters.push("view_date <= ?");
    values.push(to);
  }

  const rollupWhere = filters.length ? `where ${filters.join(" and ")}` : "";
  const counterWhere = slug ? "where slug = ?" : "";
  const counterValues = slug ? [slug] : [];

  const totalsResult = await db
    .prepare<{ slug: string; total_views: number; last_viewed_at: string | null }>(
      `select slug, total_views, last_viewed_at
       from blog_view_counters
       ${counterWhere}
       order by total_views desc, slug asc
       limit 50`,
    )
    .bind(...counterValues)
    .all<{ slug: string; total_views: number; last_viewed_at: string | null }>();

  const dailyResult = await db
    .prepare<{ slug: string; view_date: string; total_views: number }>(
      `select slug, view_date, total_views
       from blog_view_daily_rollups
       ${rollupWhere}
       order by view_date desc, total_views desc
       limit 200`,
    )
    .bind(...values)
    .all<{ slug: string; view_date: string; total_views: number }>();

  const referrerResult = await db
    .prepare<{ slug: string; view_date: string; referrer_origin: string; total_views: number }>(
      `select slug, view_date, referrer_origin, total_views
       from blog_view_referrer_rollups
       ${rollupWhere}
       order by view_date desc, total_views desc
       limit 200`,
    )
    .bind(...values)
    .all<{ slug: string; view_date: string; referrer_origin: string; total_views: number }>();

  return {
    totals: (totalsResult.results ?? []).map((row) => ({
      slug: row.slug,
      totalViews: toCount(row.total_views),
      lastViewedAt: row.last_viewed_at,
    })),
    daily: (dailyResult.results ?? []).map((row) => ({
      slug: row.slug,
      viewDate: row.view_date,
      totalViews: toCount(row.total_views),
    })),
    referrers: (referrerResult.results ?? []).map((row) => ({
      slug: row.slug,
      viewDate: row.view_date,
      referrerOrigin: row.referrer_origin,
      totalViews: toCount(row.total_views),
    })),
  };
}
