-- CV Download Requests: gated CV delivery system
create table if not exists public.cv_download_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  context text check (context in ('engagement', 'evaluation', 'networking', 'other')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'blocked')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  sent_at timestamptz,
  notes text,
  ip_hash text
);

create index if not exists idx_cv_requests_email_date
  on public.cv_download_requests (email, requested_at desc);

create index if not exists idx_cv_requests_status
  on public.cv_download_requests (status);

-- Email blocklist for disposable domain server-side validation
create table if not exists public.cv_email_blocklist (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

-- RLS policies
alter table public.cv_download_requests enable row level security;
alter table public.cv_email_blocklist enable row level security;

-- Public: anyone can insert a request (anon key)
create policy "anon_insert_cv_requests"
  on public.cv_download_requests
  for insert
  to anon
  with check (true);

-- Anon: no read access (admin reads via authenticated role)

-- Admin: full access for authenticated users
create policy "admin_all_cv_requests"
  on public.cv_download_requests
  for all
  to authenticated
  using (true)
  with check (true);

-- Admin: read blocklist
create policy "admin_read_blocklist"
  on public.cv_email_blocklist
  for select
  to authenticated
  using (true);

-- Admin: manage blocklist
create policy "admin_manage_blocklist"
  on public.cv_email_blocklist
  for all
  to authenticated
  using (true)
  with check (true);
