-- Make Supabase posts the complete editorial source for published blog content.

alter table public.posts
  add column if not exists related_tool_ctas jsonb;

alter table public.posts
  drop constraint if exists posts_related_tool_ctas_check;

alter table public.posts
  add constraint posts_related_tool_ctas_check
  check (
    related_tool_ctas is null
    or (
      jsonb_typeof(related_tool_ctas) = 'array'
      and jsonb_array_length(related_tool_ctas) <= 3
    )
  );

drop policy if exists "posts_delete_admin" on public.posts;

create policy "posts_delete_admin"
  on public.posts
  for delete
  to authenticated
  using ((select private.is_admin_user()));

grant delete on table public.posts to authenticated;
