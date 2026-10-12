-- Isolated PostgreSQL regression. Run only against a disposable empty database:
-- psql -v ON_ERROR_STOP=1 -f supabase/tests/restrict_raw_tool_reads_to_admin.sql
-- Uses synthetic data and the existing helper contract; no production rows.
begin;

create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create schema private;
create function auth.uid() returns uuid language sql stable as $$
  select (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid;
$$;
grant usage on schema auth to anon, authenticated, service_role;
create table public.admin_users (user_id uuid primary key);
insert into public.admin_users values ('00000000-0000-4000-8000-000000000001');
create function private.is_admin_user() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function private.is_admin_user() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin_user() to authenticated;

-- Only columns relevant to authorization; application payload constraints are
-- unchanged by this migration and remain covered by existing tests.
create table public.data_platform_maturity_submissions (id integer, contact_email text);
create table public.scd_design_lab_events (id integer, payload jsonb);
create table public.data_platform_maturity_benchmark (submission_count integer);
insert into public.data_platform_maturity_submissions values (1, 'fixture@example.invalid');
insert into public.scd_design_lab_events values (1, '{"fixture":true}');
insert into public.data_platform_maturity_benchmark values (1);
alter table public.data_platform_maturity_submissions enable row level security;
alter table public.scd_design_lab_events enable row level security;
create policy authenticated_select_maturity on public.data_platform_maturity_submissions
  for select to authenticated using (true);
create policy scd_design_lab_events_authenticated_read on public.scd_design_lab_events
  for select to authenticated using (true);
create policy maturity_insert on public.data_platform_maturity_submissions
  for insert to anon with check (true);
create policy events_insert on public.scd_design_lab_events
  for insert to anon with check (true);
grant insert on public.data_platform_maturity_submissions, public.scd_design_lab_events to anon;
grant select on public.data_platform_maturity_submissions, public.scd_design_lab_events to authenticated;
grant all on public.data_platform_maturity_submissions, public.scd_design_lab_events to service_role;
grant select on public.data_platform_maturity_benchmark to anon, authenticated;

create function public.assert_count(actual bigint, expected bigint, label text)
returns void language plpgsql security invoker as $$
begin
  if actual is distinct from expected then
    raise exception '%: expected %, got %', label, expected, actual;
  end if;
end;
$$;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated","user_metadata":{"admin":true}}';
select public.assert_count((select count(*) from public.data_platform_maturity_submissions), 1, 'baseline exposes maturity');
select public.assert_count((select count(*) from public.scd_design_lab_events), 1, 'baseline exposes events');
reset role;

\ir ../migrations/20261012042431_restrict_raw_tool_reads_to_admin.sql

set local role authenticated;
select public.assert_count((select count(*) from public.data_platform_maturity_submissions), 0, 'live policy replaced');
select public.assert_count((select count(*) from public.scd_design_lab_events), 0, 'live events restricted');
reset role;

-- Tracked history never created the live-only maturity read policy. A recovery
-- replay must also work when that policy is absent. Events already exists.
drop policy authenticated_select_maturity on public.data_platform_maturity_submissions;
\ir ../migrations/20261012042431_restrict_raw_tool_reads_to_admin.sql

set local role authenticated;
select public.assert_count((select count(*) from public.data_platform_maturity_submissions), 0, 'non-admin cannot read maturity');
select public.assert_count((select count(*) from public.scd_design_lab_events), 0, 'non-admin cannot read events');
select public.assert_count((select count(*) from public.data_platform_maturity_benchmark), 1, 'non-admin benchmark retained');
set local request.jwt.claims = '{"role":"authenticated"}';
select public.assert_count((select count(*) from public.data_platform_maturity_submissions), 0, 'missing identity cannot read maturity');
select public.assert_count((select count(*) from public.scd_design_lab_events), 0, 'missing identity cannot read events');
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}';
select public.assert_count((select count(*) from public.data_platform_maturity_submissions), 1, 'admin maturity retained');
select public.assert_count((select count(*) from public.scd_design_lab_events), 1, 'admin events retained');
reset role;

set local role anon;
insert into public.data_platform_maturity_submissions values (2, null);
insert into public.scd_design_lab_events values (2, '{}');
select public.assert_count((select count(*) from public.data_platform_maturity_benchmark), 1, 'public benchmark retained');
do $$
begin
  begin
    perform id from public.data_platform_maturity_submissions;
    raise exception 'anon unexpectedly read maturity';
  exception when insufficient_privilege then null;
  end;
  begin
    perform id from public.scd_design_lab_events;
    raise exception 'anon unexpectedly read events';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

set local role service_role;
select public.assert_count((select count(*) from public.data_platform_maturity_submissions), 2, 'service role sees anonymous submission');
select public.assert_count((select count(*) from public.scd_design_lab_events), 2, 'service role sees anonymous event');
reset role;

rollback;
\echo 'PASS: raw reads restricted; admin/service reads and anonymous inserts/benchmark preserved'
