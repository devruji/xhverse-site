-- Harden blog admin helper functions after the initial blog writer migration.

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.is_admin_user() from anon;
revoke execute on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

revoke execute on function public.set_posts_updated_at() from public;
revoke execute on function public.set_posts_updated_at() from anon;
revoke execute on function public.set_posts_updated_at() from authenticated;
