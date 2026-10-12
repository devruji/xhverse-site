-- Raw tool submissions and tracking events are admin data, not public benchmarks.
-- Preserve existing INSERT policies, table grants and aggregate benchmark access.

-- The live maturity read policy predates its tracked migration history.
-- Recreate it so clean database replays and the existing project both work.
drop policy if exists "authenticated_select_maturity"
  on public.data_platform_maturity_submissions;
create policy "authenticated_select_maturity"
  on public.data_platform_maturity_submissions
  for select
  to authenticated
  using ((select private.is_admin_user()));

alter policy "scd_design_lab_events_authenticated_read"
  on public.scd_design_lab_events
  to authenticated
  using ((select private.is_admin_user()));
