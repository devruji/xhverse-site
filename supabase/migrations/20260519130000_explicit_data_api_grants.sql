-- Make Data API exposure explicit for Supabase's 2026 grant-default change.
-- Grants are intentionally narrower than the old public-schema defaults.

grant usage on schema public to anon, authenticated, service_role;

-- Blog posts: public and admin clients can read published rows through RLS.
revoke all on table public.posts from anon, authenticated;
grant select on table public.posts to anon, authenticated;
grant select, insert, update, delete on table public.posts to service_role;

-- Data Platform Maturity: public visitors insert raw submissions; public reads
-- only the aggregate benchmark; authenticated admin screens can read raw rows.
revoke all on table public.data_platform_maturity_submissions from anon, authenticated;
grant insert on table public.data_platform_maturity_submissions to anon;
grant select on table public.data_platform_maturity_submissions to authenticated;
grant select, insert, update, delete on table public.data_platform_maturity_submissions to service_role;

revoke all on table public.data_platform_maturity_benchmark from anon, authenticated;
grant select on table public.data_platform_maturity_benchmark to anon, authenticated;
grant select, insert, update, delete on table public.data_platform_maturity_benchmark to service_role;

-- CV requests: public visitors insert requests; authenticated admin UI manages
-- review state. Blocklist remains admin-only.
revoke all on table public.cv_download_requests from anon, authenticated;
grant insert on table public.cv_download_requests to anon;
grant select, insert, update, delete on table public.cv_download_requests to authenticated;
grant select, insert, update, delete on table public.cv_download_requests to service_role;

revoke all on table public.cv_email_blocklist from anon, authenticated;
grant select, insert, update, delete on table public.cv_email_blocklist to authenticated;
grant select, insert, update, delete on table public.cv_email_blocklist to service_role;

-- Leads: admin-managed only.
revoke all on table public.leads from anon, authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant select, insert, update, delete on table public.leads to service_role;

-- SCD Design Lab: public visitors append milestones and explicit joins; admin
-- screens read progress and can update join status.
revoke all on table public.scd_design_lab_events from anon, authenticated;
grant insert on table public.scd_design_lab_events to anon;
grant select on table public.scd_design_lab_events to authenticated;
grant select, insert, update, delete on table public.scd_design_lab_events to service_role;

revoke all on table public.scd_design_lab_joins from anon, authenticated;
grant insert on table public.scd_design_lab_joins to anon;
grant select, update on table public.scd_design_lab_joins to authenticated;
grant select, insert, update, delete on table public.scd_design_lab_joins to service_role;

revoke all on table public.scd_design_lab_progress from anon, authenticated;
grant select on table public.scd_design_lab_progress to authenticated;
grant select on table public.scd_design_lab_progress to service_role;
