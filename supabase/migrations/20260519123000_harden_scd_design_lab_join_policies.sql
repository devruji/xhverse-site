-- Tighten SCD Design Lab admin policies to the operations the admin UI needs.

drop policy if exists "scd_design_lab_joins_authenticated_all" on public.scd_design_lab_joins;

drop policy if exists "scd_design_lab_joins_authenticated_select" on public.scd_design_lab_joins;
create policy "scd_design_lab_joins_authenticated_select"
  on public.scd_design_lab_joins
  for select
  to authenticated
  using (auth.uid() is not null);

drop policy if exists "scd_design_lab_joins_authenticated_update" on public.scd_design_lab_joins;
create policy "scd_design_lab_joins_authenticated_update"
  on public.scd_design_lab_joins
  for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
