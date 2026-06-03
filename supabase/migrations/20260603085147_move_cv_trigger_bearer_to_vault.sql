-- Store CV trigger Edge Function authorization in Vault instead of function source.
-- This migration extracts the already-configured bearer from the existing
-- trigger function during upgrade; fresh environments should seed the named
-- Vault secret before enabling the CV trigger functions.

create extension if not exists supabase_vault with schema vault;
create extension if not exists pg_net with schema extensions;

do $$
declare
  existing_secret_id uuid;
  extracted_bearer text;
begin
  select id
  into existing_secret_id
  from vault.decrypted_secrets
  where name = 'xhverse_cv_edge_service_bearer'
  limit 1;

  if existing_secret_id is null
    and to_regprocedure('public.trigger_notify_cv_request()') is not null
  then
    select substring(
      pg_get_functiondef('public.trigger_notify_cv_request()'::regprocedure)
      from 'Bearer ([A-Za-z0-9_\.-]+)'
    )
    into extracted_bearer;

    if extracted_bearer is null then
      raise exception 'Could not extract existing CV edge bearer from trigger function source';
    end if;

    perform vault.create_secret(
      extracted_bearer,
      'xhverse_cv_edge_service_bearer',
      'Bearer token used by CV request database triggers to invoke Supabase Edge Functions.'
    );
  end if;
end $$;

create or replace function private.cv_edge_bearer()
returns text
language sql
stable
security definer
set search_path = vault
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'xhverse_cv_edge_service_bearer'
  limit 1;
$$;

revoke all on function private.cv_edge_bearer() from public;
revoke all on function private.cv_edge_bearer() from anon;
revoke all on function private.cv_edge_bearer() from authenticated;

create or replace function public.trigger_notify_cv_request()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  bearer text;
begin
  bearer := private.cv_edge_bearer();
  if bearer is null then
    raise exception 'CV edge bearer secret is not configured';
  end if;

  perform net.http_post(
    url := 'https://jxfpnfliioqbhzznaphd.supabase.co/functions/v1/notify-cv-request',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || bearer
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'cv_download_requests',
      'record', jsonb_build_object(
        'id', new.id,
        'email', new.email,
        'name', new.name,
        'context', new.context,
        'context_other', new.context_other,
        'created_at', new.requested_at
      )
    )
  );
  return new;
end;
$$;

create or replace function public.trigger_send_cv()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  bearer text;
begin
  if new.status = 'approved' and old.status != 'approved' and new.sent_at is null then
    bearer := private.cv_edge_bearer();
    if bearer is null then
      raise exception 'CV edge bearer secret is not configured';
    end if;

    perform net.http_post(
      url := 'https://jxfpnfliioqbhzznaphd.supabase.co/functions/v1/send-cv',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || bearer
      ),
      body := jsonb_build_object(
        'type', 'UPDATE',
        'table', 'cv_download_requests',
        'record', jsonb_build_object(
          'id', new.id,
          'email', new.email,
          'name', new.name,
          'status', new.status,
          'sent_at', new.sent_at
        ),
        'old_record', jsonb_build_object('status', old.status)
      )
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.trigger_notify_cv_request() from public;
revoke execute on function public.trigger_notify_cv_request() from anon;
revoke execute on function public.trigger_notify_cv_request() from authenticated;

revoke execute on function public.trigger_send_cv() from public;
revoke execute on function public.trigger_send_cv() from anon;
revoke execute on function public.trigger_send_cv() from authenticated;

drop trigger if exists on_cv_request_inserted on public.cv_download_requests;
create trigger on_cv_request_inserted
  after insert on public.cv_download_requests
  for each row
  execute function public.trigger_notify_cv_request();

drop trigger if exists on_cv_request_approved on public.cv_download_requests;
create trigger on_cv_request_approved
  after update on public.cv_download_requests
  for each row
  execute function public.trigger_send_cv();
