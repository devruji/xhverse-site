create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  source text not null check (source in ('cv_request', 'maturity_tool', 'governance_tool', 'contact_form')),
  source_id uuid,
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'archived')),
  collected_at timestamptz not null default now(),
  notes text,
  constraint leads_email_source_unique unique (email, source)
);

create index if not exists leads_collected_at_idx
  on public.leads (collected_at desc);

create index if not exists leads_status_idx
  on public.leads (status);

alter table public.leads enable row level security;

drop policy if exists "leads_authenticated_all" on public.leads;
create policy "leads_authenticated_all"
  on public.leads
  for all
  to authenticated
  using (true)
  with check (true);

revoke all on table public.leads from anon, authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant select, insert, update, delete on table public.leads to service_role;

comment on table public.leads is
  'Unified leads from CV requests, maturity tool, governance tool, and contact form. Managed by authenticated admin users only.';
