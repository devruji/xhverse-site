-- SCD Design Lab tracking v1.
-- Anonymous visitors can insert milestone events and explicit joins only.
-- Raw reads are admin/authenticated only; public pages do not read tracking data.

create table if not exists public.scd_design_lab_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  visitor_id uuid not null,
  lab_version text not null,
  event_type text not null check (
    event_type in (
      'lab_opened',
      'lab_started',
      'step_completed',
      'design_selected',
      'result_generated',
      'completed',
      'joined'
    )
  ),
  step_id text,
  step_index integer check (step_index is null or step_index >= 0),
  total_steps integer check (total_steps is null or total_steps >= 1),
  progress_percent integer not null check (progress_percent between 0 and 100),
  result_key text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint scd_design_lab_events_payload_object
    check (jsonb_typeof(payload) = 'object'),
  constraint scd_design_lab_events_payload_size
    check (octet_length(payload::text) <= 4096)
);

create index if not exists scd_design_lab_events_session_idx
  on public.scd_design_lab_events (session_id, occurred_at desc);

create index if not exists scd_design_lab_events_occurred_idx
  on public.scd_design_lab_events (occurred_at desc);

create table if not exists public.scd_design_lab_joins (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  email text not null,
  name text,
  company text,
  role text,
  consent_given boolean not null,
  selected_strategy text not null check (selected_strategy in ('type_1', 'type_2', 'type_3', 'type_6', 'ignore')),
  score integer not null check (score between 0 and 100),
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'archived')),
  joined_at timestamptz not null default now(),
  constraint scd_design_lab_join_email_format
    check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint scd_design_lab_join_consent_required
    check (consent_given is true)
);

create index if not exists scd_design_lab_joins_session_idx
  on public.scd_design_lab_joins (session_id, joined_at desc);

create index if not exists scd_design_lab_joins_joined_idx
  on public.scd_design_lab_joins (joined_at desc);

alter table public.scd_design_lab_events enable row level security;
alter table public.scd_design_lab_joins enable row level security;

drop policy if exists "scd_design_lab_events_anon_insert" on public.scd_design_lab_events;
create policy "scd_design_lab_events_anon_insert"
  on public.scd_design_lab_events
  for insert
  to anon
  with check (
    lab_version = 'scd-design-lab-v1'
    and event_type in (
      'lab_opened',
      'lab_started',
      'step_completed',
      'design_selected',
      'result_generated',
      'completed',
      'joined'
    )
    and progress_percent between 0 and 100
    and jsonb_typeof(payload) = 'object'
    and octet_length(payload::text) <= 4096
  );

drop policy if exists "scd_design_lab_events_authenticated_read" on public.scd_design_lab_events;
create policy "scd_design_lab_events_authenticated_read"
  on public.scd_design_lab_events
  for select
  to authenticated
  using (true);

drop policy if exists "scd_design_lab_joins_anon_insert" on public.scd_design_lab_joins;
create policy "scd_design_lab_joins_anon_insert"
  on public.scd_design_lab_joins
  for insert
  to anon
  with check (
    consent_given is true
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and selected_strategy in ('type_1', 'type_2', 'type_3', 'type_6', 'ignore')
    and score between 0 and 100
  );

drop policy if exists "scd_design_lab_joins_authenticated_all" on public.scd_design_lab_joins;
create policy "scd_design_lab_joins_authenticated_all"
  on public.scd_design_lab_joins
  for all
  to authenticated
  using (true)
  with check (true);

revoke all on table public.scd_design_lab_events from anon, authenticated;
revoke all on table public.scd_design_lab_joins from anon, authenticated;
grant insert on table public.scd_design_lab_events to anon;
grant insert on table public.scd_design_lab_joins to anon;
grant select on table public.scd_design_lab_events to authenticated;
grant select, update on table public.scd_design_lab_joins to authenticated;
grant select, insert, update, delete on table public.scd_design_lab_events to service_role;
grant select, insert, update, delete on table public.scd_design_lab_joins to service_role;

drop view if exists public.scd_design_lab_progress;
create view public.scd_design_lab_progress
with (security_invoker = true) as
with event_rollup as (
  select
    session_id,
    min(visitor_id::text)::uuid as visitor_id,
    min(lab_version) as lab_version,
    min(occurred_at) as first_seen_at,
    max(occurred_at) as last_seen_at,
    count(*)::integer as event_count,
    max(progress_percent)::integer as progress_percent,
    bool_or(event_type = 'completed') as completed,
    (array_agg(event_type order by occurred_at desc))[1] as latest_event_type,
    (array_agg(step_id order by occurred_at desc))[1] as latest_step_id,
    (array_agg(result_key order by occurred_at desc))[1] as latest_result_key
  from public.scd_design_lab_events
  group by session_id
),
latest_join as (
  select distinct on (session_id)
    session_id,
    id as join_id,
    email,
    name,
    company,
    role,
    selected_strategy,
    score,
    status,
    joined_at
  from public.scd_design_lab_joins
  order by session_id, joined_at desc
)
select
  er.session_id,
  er.visitor_id,
  er.lab_version,
  er.first_seen_at,
  er.last_seen_at,
  er.event_count,
  er.progress_percent,
  er.completed,
  er.latest_event_type,
  er.latest_step_id,
  er.latest_result_key,
  lj.join_id,
  lj.email,
  lj.name,
  lj.company,
  lj.role,
  lj.selected_strategy,
  lj.score,
  lj.status,
  lj.joined_at,
  case
    when lj.join_id is not null then 'joined'
    when er.completed then 'completed'
    when er.last_seen_at < now() - interval '30 minutes' then 'abandoned'
    else 'in_progress'
  end as progress_status
from event_rollup er
left join latest_join lj on lj.session_id = er.session_id;

revoke all on table public.scd_design_lab_progress from anon, authenticated;
grant select on table public.scd_design_lab_progress to authenticated;
grant select on table public.scd_design_lab_progress to service_role;

comment on table public.scd_design_lab_events is
  'Append-only anonymous milestone events for the SCD Design Lab. No raw public reads.';

comment on table public.scd_design_lab_joins is
  'Explicit SCD Design Lab joins with consent. Admin-authenticated reads and updates only.';

comment on view public.scd_design_lab_progress is
  'Admin rollup of SCD Design Lab progress, completion, and explicit joins.';
