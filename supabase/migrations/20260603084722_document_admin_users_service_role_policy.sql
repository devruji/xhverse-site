-- Make the intended service-role management path explicit for admin_users.

drop policy if exists "admin_users_service_role_all" on public.admin_users;
create policy "admin_users_service_role_all"
  on public.admin_users
  for all
  to service_role
  using (true)
  with check (true);
