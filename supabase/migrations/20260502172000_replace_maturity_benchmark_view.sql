-- Replace the public benchmark view with an RLS-protected aggregate table.
--
-- Supabase views are SECURITY DEFINER by default, which is flagged by the
-- Security Advisor. A security-invoker view would also make the aggregate
-- unreadable to anonymous users because raw submissions intentionally do not
-- grant SELECT. This table stores only aggregate benchmark values and is
-- refreshed by a private trigger function.

drop view if exists public.data_platform_maturity_benchmark;

create table public.data_platform_maturity_benchmark (
  id boolean primary key default true check (id),
  submission_count integer not null default 0 check (submission_count >= 0),
  average_overall_score integer check (
    average_overall_score is null
    or average_overall_score between 0 and 100
  ),
  average_category_scores jsonb not null default jsonb_build_object(
    'platform_architecture',
    null,
    'governance',
    null,
    'analytics_delivery',
    null,
    'operations',
    null,
    'documentation',
    null
  ),
  tier_distribution jsonb not null default jsonb_build_object(
    'Foundational',
    0,
    'Developing',
    0,
    'Operational',
    0,
    'Advanced',
    0
  ),
  updated_at timestamptz not null default now()
);

alter table public.data_platform_maturity_benchmark enable row level security;

drop policy if exists "data_platform_maturity_benchmark_select"
  on public.data_platform_maturity_benchmark;
create policy "data_platform_maturity_benchmark_select"
  on public.data_platform_maturity_benchmark
  for select
  to anon, authenticated
  using (true);

revoke all on table public.data_platform_maturity_benchmark from anon, authenticated;
grant select on table public.data_platform_maturity_benchmark to anon, authenticated;

create schema if not exists private;

create or replace function private.recompute_data_platform_maturity_benchmark()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.data_platform_maturity_benchmark as benchmark (
    id,
    submission_count,
    average_overall_score,
    average_category_scores,
    tier_distribution,
    updated_at
  )
  select
    true,
    count(*)::integer,
    round(avg(overall_score))::integer,
    jsonb_build_object(
      'platform_architecture',
      round(avg((category_scores ->> 'platform_architecture')::numeric))::integer,
      'governance',
      round(avg((category_scores ->> 'governance')::numeric))::integer,
      'analytics_delivery',
      round(avg((category_scores ->> 'analytics_delivery')::numeric))::integer,
      'operations',
      round(avg((category_scores ->> 'operations')::numeric))::integer,
      'documentation',
      round(avg((category_scores ->> 'documentation')::numeric))::integer
    ),
    jsonb_build_object(
      'Foundational',
      count(*) filter (where tier = 'Foundational')::integer,
      'Developing',
      count(*) filter (where tier = 'Developing')::integer,
      'Operational',
      count(*) filter (where tier = 'Operational')::integer,
      'Advanced',
      count(*) filter (where tier = 'Advanced')::integer
    ),
    now()
  from public.data_platform_maturity_submissions
  on conflict (id) do update set
    submission_count = excluded.submission_count,
    average_overall_score = excluded.average_overall_score,
    average_category_scores = excluded.average_category_scores,
    tier_distribution = excluded.tier_distribution,
    updated_at = excluded.updated_at;
end;
$$;

create or replace function private.refresh_data_platform_maturity_benchmark_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.recompute_data_platform_maturity_benchmark();
  return null;
end;
$$;

revoke all on function private.recompute_data_platform_maturity_benchmark()
  from public, anon, authenticated;
revoke all on function private.refresh_data_platform_maturity_benchmark_trigger()
  from public, anon, authenticated;

drop trigger if exists data_platform_maturity_refresh_benchmark
  on public.data_platform_maturity_submissions;
create trigger data_platform_maturity_refresh_benchmark
after insert or update or delete or truncate on public.data_platform_maturity_submissions
for each statement
execute function private.refresh_data_platform_maturity_benchmark_trigger();

select private.recompute_data_platform_maturity_benchmark();

comment on table public.data_platform_maturity_benchmark is
  'Aggregate-only public benchmark for Data Platform Maturity results. Does not expose raw submissions.';
