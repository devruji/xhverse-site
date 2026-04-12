-- Blog posts: full markdown on xhverse; optional Medium syndication link.
-- Apply with Supabase CLI or SQL editor on your project.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  body_markdown text not null default '',
  tags text[] not null default '{}',
  reading_time text,
  medium_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_published_list_idx
  on public.posts (published_at desc)
  where status = 'published' and published_at is not null;

alter table public.posts enable row level security;

create policy "posts_select_published"
  on public.posts
  for select
  to anon, authenticated
  using (status = 'published' and published_at is not null);

-- Writes: use the Supabase dashboard, service role, or add authenticated policies later.

comment on table public.posts is 'Site blog posts; Astro build reads published rows via Supabase API.';
