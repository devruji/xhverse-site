-- Data Platform Maturity Benchmark v1.
-- Raw submissions are insert-only for anonymous visitors.
-- Public reads are limited to the aggregate benchmark view below.

create table if not exists public.data_platform_maturity_submissions (
  id uuid primary key default gen_random_uuid(),
  overall_score integer not null check (overall_score between 0 and 100),
  tier text not null check (tier in ('Foundational', 'Developing', 'Operational', 'Advanced')),
  category_scores jsonb not null,
  answers jsonb not null,
  contact_email text,
  created_at timestamptz not null default now(),
  constraint data_platform_maturity_category_scores_is_object
    check (jsonb_typeof(category_scores) = 'object'),
  constraint data_platform_maturity_answers_is_object
    check (jsonb_typeof(answers) = 'object'),
  constraint data_platform_maturity_category_scores_keys
    check (
      category_scores ? 'platform_architecture'
      and category_scores ? 'governance'
      and category_scores ? 'analytics_delivery'
      and category_scores ? 'operations'
      and category_scores ? 'documentation'
      and category_scores - array[
        'platform_architecture',
        'governance',
        'analytics_delivery',
        'operations',
        'documentation'
      ] = '{}'::jsonb
    ),
  constraint data_platform_maturity_category_scores_values
    check (
      jsonb_typeof(category_scores -> 'platform_architecture') = 'number'
      and (category_scores ->> 'platform_architecture')::numeric between 0 and 100
      and jsonb_typeof(category_scores -> 'governance') = 'number'
      and (category_scores ->> 'governance')::numeric between 0 and 100
      and jsonb_typeof(category_scores -> 'analytics_delivery') = 'number'
      and (category_scores ->> 'analytics_delivery')::numeric between 0 and 100
      and jsonb_typeof(category_scores -> 'operations') = 'number'
      and (category_scores ->> 'operations')::numeric between 0 and 100
      and jsonb_typeof(category_scores -> 'documentation') = 'number'
      and (category_scores ->> 'documentation')::numeric between 0 and 100
    ),
  constraint data_platform_maturity_answers_keys
    check (
      answers ? 'platform-architecture-1'
      and answers ? 'platform-architecture-2'
      and answers ? 'platform-architecture-3'
      and answers ? 'governance-1'
      and answers ? 'governance-2'
      and answers ? 'governance-3'
      and answers ? 'analytics-delivery-1'
      and answers ? 'analytics-delivery-2'
      and answers ? 'analytics-delivery-3'
      and answers ? 'operations-1'
      and answers ? 'operations-2'
      and answers ? 'operations-3'
      and answers ? 'documentation-1'
      and answers ? 'documentation-2'
      and answers ? 'documentation-3'
      and answers - array[
        'platform-architecture-1',
        'platform-architecture-2',
        'platform-architecture-3',
        'governance-1',
        'governance-2',
        'governance-3',
        'analytics-delivery-1',
        'analytics-delivery-2',
        'analytics-delivery-3',
        'operations-1',
        'operations-2',
        'operations-3',
        'documentation-1',
        'documentation-2',
        'documentation-3'
      ] = '{}'::jsonb
    ),
  constraint data_platform_maturity_answers_values
    check (
      jsonb_typeof(answers -> 'platform-architecture-1') = 'number'
      and (answers ->> 'platform-architecture-1')::integer between 1 and 5
      and jsonb_typeof(answers -> 'platform-architecture-2') = 'number'
      and (answers ->> 'platform-architecture-2')::integer between 1 and 5
      and jsonb_typeof(answers -> 'platform-architecture-3') = 'number'
      and (answers ->> 'platform-architecture-3')::integer between 1 and 5
      and jsonb_typeof(answers -> 'governance-1') = 'number'
      and (answers ->> 'governance-1')::integer between 1 and 5
      and jsonb_typeof(answers -> 'governance-2') = 'number'
      and (answers ->> 'governance-2')::integer between 1 and 5
      and jsonb_typeof(answers -> 'governance-3') = 'number'
      and (answers ->> 'governance-3')::integer between 1 and 5
      and jsonb_typeof(answers -> 'analytics-delivery-1') = 'number'
      and (answers ->> 'analytics-delivery-1')::integer between 1 and 5
      and jsonb_typeof(answers -> 'analytics-delivery-2') = 'number'
      and (answers ->> 'analytics-delivery-2')::integer between 1 and 5
      and jsonb_typeof(answers -> 'analytics-delivery-3') = 'number'
      and (answers ->> 'analytics-delivery-3')::integer between 1 and 5
      and jsonb_typeof(answers -> 'operations-1') = 'number'
      and (answers ->> 'operations-1')::integer between 1 and 5
      and jsonb_typeof(answers -> 'operations-2') = 'number'
      and (answers ->> 'operations-2')::integer between 1 and 5
      and jsonb_typeof(answers -> 'operations-3') = 'number'
      and (answers ->> 'operations-3')::integer between 1 and 5
      and jsonb_typeof(answers -> 'documentation-1') = 'number'
      and (answers ->> 'documentation-1')::integer between 1 and 5
      and jsonb_typeof(answers -> 'documentation-2') = 'number'
      and (answers ->> 'documentation-2')::integer between 1 and 5
      and jsonb_typeof(answers -> 'documentation-3') = 'number'
      and (answers ->> 'documentation-3')::integer between 1 and 5
    ),
  constraint data_platform_maturity_contact_email_format
    check (
      contact_email is null
      or contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
);

create index if not exists data_platform_maturity_created_at_idx
  on public.data_platform_maturity_submissions (created_at desc);

alter table public.data_platform_maturity_submissions enable row level security;

drop policy if exists "data_platform_maturity_anon_insert" on public.data_platform_maturity_submissions;
create policy "data_platform_maturity_anon_insert"
  on public.data_platform_maturity_submissions
  for insert
  to anon
  with check (
    overall_score between 0 and 100
    and tier in ('Foundational', 'Developing', 'Operational', 'Advanced')
    and jsonb_typeof(category_scores) = 'object'
    and jsonb_typeof(answers) = 'object'
    and (
      contact_email is null
      or contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  );

revoke all on table public.data_platform_maturity_submissions from anon, authenticated;
grant insert on table public.data_platform_maturity_submissions to anon;

drop view if exists public.data_platform_maturity_benchmark;
create view public.data_platform_maturity_benchmark as
select
  count(*)::integer as submission_count,
  round(avg(overall_score))::integer as average_overall_score,
  jsonb_build_object(
    'platform_architecture', round(avg((category_scores ->> 'platform_architecture')::numeric))::integer,
    'governance', round(avg((category_scores ->> 'governance')::numeric))::integer,
    'analytics_delivery', round(avg((category_scores ->> 'analytics_delivery')::numeric))::integer,
    'operations', round(avg((category_scores ->> 'operations')::numeric))::integer,
    'documentation', round(avg((category_scores ->> 'documentation')::numeric))::integer
  ) as average_category_scores,
  jsonb_build_object(
    'Foundational', count(*) filter (where tier = 'Foundational')::integer,
    'Developing', count(*) filter (where tier = 'Developing')::integer,
    'Operational', count(*) filter (where tier = 'Operational')::integer,
    'Advanced', count(*) filter (where tier = 'Advanced')::integer
  ) as tier_distribution
from public.data_platform_maturity_submissions;

revoke all on table public.data_platform_maturity_benchmark from anon, authenticated;
grant select on table public.data_platform_maturity_benchmark to anon, authenticated;

comment on table public.data_platform_maturity_submissions is
  'Anonymous Data Platform Maturity assessment submissions. Public visitors can insert only; raw reads are not exposed.';

comment on view public.data_platform_maturity_benchmark is
  'Aggregate-only public benchmark for Data Platform Maturity results. Does not expose raw submissions.';
