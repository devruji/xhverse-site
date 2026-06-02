import { describe, expect, it } from "vitest";
import {
  getBlogViewAnalytics,
  getBlogViewCounts,
  recordBlogView,
  type D1DatabaseLike,
  type D1PreparedStatement,
  type D1Result,
} from "./server";

type StoredCounter = {
  totalViews: number;
  lastViewedAt: string | null;
};

class FakeD1 implements D1DatabaseLike {
  readonly events = new Set<string>();
  readonly counters = new Map<string, StoredCounter>();
  readonly daily = new Map<string, number>();
  readonly referrers = new Map<string, number>();

  prepare<T = unknown>(query: string) {
    const db = this;
    let bound: Array<string | number | null> = [];
    const statement: D1PreparedStatement<T> = {
      bind: (...values: Array<string | number | null>) => {
        bound = values;
        return statement;
      },
      first: async <R = T>() => null as R | null,
      all: async <R = T>(): Promise<D1Result<R>> => {
        if (query.includes("from blog_view_counters")) {
          const rows = Array.from(db.counters.entries()).map(([slug, counter]) => ({
            slug,
            total_views: counter.totalViews,
            last_viewed_at: counter.lastViewedAt,
          }));
          return { results: rows as R[] };
        }
        if (query.includes("from blog_view_daily_rollups")) {
          const rows = Array.from(db.daily.entries()).map(([key, totalViews]) => {
            const [slug, viewDate] = key.split("|");
            return { slug, view_date: viewDate, total_views: totalViews };
          });
          return { results: rows as R[] };
        }
        if (query.includes("from blog_view_referrer_rollups")) {
          const rows = Array.from(db.referrers.entries()).map(([key, totalViews]) => {
            const [slug, viewDate, referrerOrigin] = key.split("|");
            return {
              slug,
              view_date: viewDate,
              referrer_origin: referrerOrigin,
              total_views: totalViews,
            };
          });
          return { results: rows as R[] };
        }
        return { results: [] };
      },
      run: async (): Promise<D1Result<T>> => {
        if (query.includes("insert or ignore into blog_view_events")) {
          const eventId = String(bound[0]);
          if (db.events.has(eventId)) return { meta: { changes: 0 } };
          db.events.add(eventId);
          return { meta: { changes: 1 } };
        }
        if (query.includes("insert into blog_view_counters")) {
          const slug = String(bound[0]);
          const current = db.counters.get(slug)?.totalViews ?? 0;
          db.counters.set(slug, {
            totalViews: current + 1,
            lastViewedAt: "2026-06-02T00:00:00.000Z",
          });
        }
        if (query.includes("insert into blog_view_daily_rollups")) {
          const key = `${String(bound[0])}|${String(bound[1])}`;
          db.daily.set(key, (db.daily.get(key) ?? 0) + 1);
        }
        if (query.includes("insert into blog_view_referrer_rollups")) {
          const key = `${String(bound[0])}|${String(bound[1])}|${String(bound[2])}`;
          db.referrers.set(key, (db.referrers.get(key) ?? 0) + 1);
        }
        return { meta: { changes: 1 } };
      },
    };
    return statement;
  }
}

class MissingResultsD1 implements D1DatabaseLike {
  prepare<T = unknown>() {
    const statement: D1PreparedStatement<T> = {
      bind: () => statement,
      first: async <R = T>() => null as R | null,
      all: async <R = T>(): Promise<D1Result<R>> => ({}),
      run: async (): Promise<D1Result<T>> => ({}),
    };
    return statement;
  }
}

const request = {
  slug: "open-table-formats-operating-model",
  eventId: "123e4567-e89b-12d3-a456-426614174000",
  path: "/blog/open-table-formats-operating-model",
};

const post = {
  slug: "open-table-formats-operating-model",
  title: "Open table formats are an operating model decision",
  date: "2026-06-02",
};

describe("blog view server helpers", () => {
  it("records a first view and increments aggregate rollups", async () => {
    const db = new FakeD1();
    const response = await recordBlogView({
      db,
      request,
      post,
      referrerOrigin: "https://example.com",
    });

    expect(response).toEqual({
      slug: "open-table-formats-operating-model",
      totalViews: 1,
      counted: true,
    });
    expect(db.events).toContain(request.eventId);
    expect(db.counters.get(request.slug)?.totalViews).toBe(1);
    expect(Array.from(db.daily.values())).toEqual([1]);
    expect(Array.from(db.referrers.values())).toEqual([1]);
  });

  it("does not increment duplicate event IDs", async () => {
    const db = new FakeD1();
    await recordBlogView({ db, request, post, referrerOrigin: "" });
    const duplicate = await recordBlogView({
      db,
      request,
      post,
      referrerOrigin: "",
    });

    expect(duplicate.counted).toBe(false);
    expect(duplicate.totalViews).toBe(1);
  });

  it("returns zero counts for empty or missing counters", async () => {
    const db = new FakeD1();
    expect(await getBlogViewCounts(db, [])).toEqual({});
    expect(await getBlogViewCounts(db, ["missing-post"])).toEqual({
      "missing-post": 0,
    });
  });

  it("handles D1 responses with missing result arrays", async () => {
    const db = new MissingResultsD1();

    expect(await getBlogViewCounts(db, ["missing-post"])).toEqual({
      "missing-post": 0,
    });

    expect(
      await recordBlogView({
        db,
        request,
        post,
        referrerOrigin: "",
      }),
    ).toEqual({
      slug: request.slug,
      totalViews: 0,
      counted: false,
    });

    expect(
      await getBlogViewAnalytics({
        db,
        slug: null,
        from: null,
        to: null,
      }),
    ).toEqual({
      totals: [],
      daily: [],
      referrers: [],
    });
  });

  it("maps analytics rows into public response fields", async () => {
    const db = new FakeD1();
    await recordBlogView({ db, request, post, referrerOrigin: "" });

    const analytics = await getBlogViewAnalytics({
      db,
      slug: request.slug,
      from: "2026-06-01",
      to: "2026-06-30",
    });

    expect(analytics.totals).toEqual([
      {
        slug: request.slug,
        totalViews: 1,
        lastViewedAt: "2026-06-02T00:00:00.000Z",
      },
    ]);
    expect(analytics.daily[0]?.slug).toBe(request.slug);
    expect(analytics.daily[0]?.totalViews).toBe(1);
    expect(analytics.referrers[0]?.slug).toBe(request.slug);
    expect(analytics.referrers[0]?.totalViews).toBe(1);
  });

  it("supports unfiltered analytics queries", async () => {
    const db = new FakeD1();
    await recordBlogView({ db, request, post, referrerOrigin: "" });

    const analytics = await getBlogViewAnalytics({
      db,
      slug: null,
      from: null,
      to: null,
    });

    expect(analytics.totals).toHaveLength(1);
    expect(analytics.daily).toHaveLength(1);
    expect(analytics.referrers).toHaveLength(1);
  });
});
