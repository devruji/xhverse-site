create table if not exists blog_post_registry (
  slug text primary key not null,
  title text not null,
  source text not null default 'manifest' check (source in ('manifest')),
  published_at text,
  is_active integer not null default 1 check (is_active in (0, 1)),
  first_seen_at text not null default current_timestamp,
  last_seen_at text not null default current_timestamp,
  check (length(slug) between 1 and 120),
  check (slug = lower(slug)),
  check (slug not glob '*[^a-z0-9-]*'),
  check (slug not like '-%' and slug not like '%-' and slug not like '%--%')
);

create table if not exists blog_view_events (
  event_id text primary key not null,
  slug text not null references blog_post_registry(slug),
  viewed_at text not null default current_timestamp,
  path text not null,
  referrer_origin text not null default '',
  is_bot integer not null default 0 check (is_bot in (0, 1))
);

create table if not exists blog_view_counters (
  slug text primary key not null references blog_post_registry(slug),
  total_views integer not null default 0 check (total_views >= 0),
  last_viewed_at text
);

create table if not exists blog_view_daily_rollups (
  slug text not null references blog_post_registry(slug),
  view_date text not null,
  total_views integer not null default 0 check (total_views >= 0),
  primary key (slug, view_date)
);

create table if not exists blog_view_referrer_rollups (
  slug text not null references blog_post_registry(slug),
  view_date text not null,
  referrer_origin text not null,
  total_views integer not null default 0 check (total_views >= 0),
  primary key (slug, view_date, referrer_origin)
);

create index if not exists idx_blog_view_events_slug_viewed_at
  on blog_view_events(slug, viewed_at);

create index if not exists idx_blog_view_daily_rollups_view_date
  on blog_view_daily_rollups(view_date);
