-- Restrict SCD Design Lab admin reads/updates to configured admin users.

drop policy if exists "scd_design_lab_joins_authenticated_select" on public.scd_design_lab_joins;
create policy "scd_design_lab_joins_authenticated_select"
  on public.scd_design_lab_joins
  for select
  to authenticated
  using ((select private.is_admin_user()));

drop policy if exists "scd_design_lab_joins_authenticated_update" on public.scd_design_lab_joins;
create policy "scd_design_lab_joins_authenticated_update"
  on public.scd_design_lab_joins
  for update
  to authenticated
  using ((select private.is_admin_user()))
  with check ((select private.is_admin_user()));
