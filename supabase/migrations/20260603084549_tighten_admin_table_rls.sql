-- Restrict admin-managed tables to users listed in public.admin_users.
-- If the project currently has one auth user and no admin row, seed that user
-- to preserve existing admin access while removing "any authenticated user".

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where (select count(*) from auth.users) = 1
  and not exists (select 1 from public.admin_users);

drop policy if exists "admin_all_cv_requests" on public.cv_download_requests;
create policy "admin_all_cv_requests"
  on public.cv_download_requests
  for all
  to authenticated
  using ((select private.is_admin_user()))
  with check ((select private.is_admin_user()));

drop policy if exists "admin_read_blocklist" on public.cv_email_blocklist;
drop policy if exists "admin_manage_blocklist" on public.cv_email_blocklist;
create policy "admin_manage_blocklist"
  on public.cv_email_blocklist
  for all
  to authenticated
  using ((select private.is_admin_user()))
  with check ((select private.is_admin_user()));

drop policy if exists "leads_authenticated_all" on public.leads;
create policy "leads_admin_all"
  on public.leads
  for all
  to authenticated
  using ((select private.is_admin_user()))
  with check ((select private.is_admin_user()));
