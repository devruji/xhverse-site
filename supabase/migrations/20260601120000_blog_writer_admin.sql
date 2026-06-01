-- Blog writer admin: optional reader metadata, slug validation, updated_at trigger,
-- tighter public visibility, authenticated admin CRUD policies, and blog cover storage.

alter table public.posts
  add column if not exists cover_image_path text,
  add column if not exists cover_image_alt text,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

alter table public.posts
  drop column if exists cover_image_url;

alter table public.posts
  drop constraint if exists posts_slug_format_check;

alter table public.posts
  add constraint posts_slug_format_check
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

alter table public.posts
  drop constraint if exists posts_cover_image_path_check;

alter table public.posts
  add constraint posts_cover_image_path_check
  check (
    cover_image_path is null
    or cover_image_path ~ '^posts/[a-z0-9]+(?:-[a-z0-9]+)*\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|avif|jpg|jpeg|png)$'
  );

alter table public.posts
  drop constraint if exists posts_cover_image_alt_check;

alter table public.posts
  add constraint posts_cover_image_alt_check
  check (
    cover_image_path is null
    or nullif(trim(cover_image_alt), '') is not null
  );

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon, authenticated;
grant select, insert, update, delete on table public.admin_users to service_role;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;

create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_posts_updated_at();

drop policy if exists "posts_select_published" on public.posts;

create policy "posts_select_published"
  on public.posts
  for select
  to anon, authenticated
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );

create policy "posts_select_admin"
  on public.posts
  for select
  to authenticated
  using (public.is_admin_user());

create policy "posts_insert_admin"
  on public.posts
  for insert
  to authenticated
  with check (public.is_admin_user());

create policy "posts_update_admin"
  on public.posts
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

revoke all on table public.posts from anon, authenticated;
grant select on table public.posts to anon, authenticated;
grant select, insert, update on table public.posts to authenticated;
grant select, insert, update, delete on table public.posts to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-covers',
  'blog-covers',
  true,
  3145728,
  array['image/avif', 'image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "blog_covers_public_read" on storage.objects;
drop policy if exists "blog_covers_admin_insert" on storage.objects;
drop policy if exists "blog_covers_admin_update" on storage.objects;
drop policy if exists "blog_covers_admin_delete" on storage.objects;

create policy "blog_covers_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'blog-covers');

create policy "blog_covers_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-covers'
    and (storage.foldername(name))[1] = 'posts'
    and public.is_admin_user()
  );

create policy "blog_covers_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-covers'
    and (storage.foldername(name))[1] = 'posts'
    and public.is_admin_user()
  )
  with check (
    bucket_id = 'blog-covers'
    and (storage.foldername(name))[1] = 'posts'
    and public.is_admin_user()
  );

create policy "blog_covers_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-covers'
    and (storage.foldername(name))[1] = 'posts'
    and public.is_admin_user()
  );
