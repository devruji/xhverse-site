-- Move the blog admin RLS helper out of the exposed public API schema.

create schema if not exists private;

create or replace function private.is_admin_user()
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

revoke all on function private.is_admin_user() from public;
revoke all on function private.is_admin_user() from anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin_user() to authenticated;

drop policy if exists "posts_select_published" on public.posts;
drop policy if exists "posts_select_admin" on public.posts;
drop policy if exists "posts_insert_admin" on public.posts;
drop policy if exists "posts_update_admin" on public.posts;

create policy "posts_select_published"
  on public.posts
  for select
  to anon
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );

create policy "posts_select_admin"
  on public.posts
  for select
  to authenticated
  using ((select private.is_admin_user()));

create policy "posts_insert_admin"
  on public.posts
  for insert
  to authenticated
  with check ((select private.is_admin_user()));

create policy "posts_update_admin"
  on public.posts
  for update
  to authenticated
  using ((select private.is_admin_user()))
  with check ((select private.is_admin_user()));

drop policy if exists "blog_covers_public_read" on storage.objects;
drop policy if exists "blog_covers_admin_insert" on storage.objects;
drop policy if exists "blog_covers_admin_update" on storage.objects;
drop policy if exists "blog_covers_admin_delete" on storage.objects;

create policy "blog_covers_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-covers'
    and (storage.foldername(name))[1] = 'posts'
    and (select private.is_admin_user())
  );

create policy "blog_covers_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-covers'
    and (storage.foldername(name))[1] = 'posts'
    and (select private.is_admin_user())
  )
  with check (
    bucket_id = 'blog-covers'
    and (storage.foldername(name))[1] = 'posts'
    and (select private.is_admin_user())
  );

create policy "blog_covers_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-covers'
    and (storage.foldername(name))[1] = 'posts'
    and (select private.is_admin_user())
  );

revoke execute on function public.is_admin_user() from public;
revoke execute on function public.is_admin_user() from anon;
revoke execute on function public.is_admin_user() from authenticated;
drop function if exists public.is_admin_user();
