-- Keep legacy CV webhook trigger functions trigger-only and pin their search path.
-- Guarded because older environments may not have these functions until the
-- Vault-backed trigger migration creates them.

do $$
begin
  if to_regprocedure('public.trigger_notify_cv_request()') is not null then
    alter function public.trigger_notify_cv_request()
      set search_path = public, extensions, net;

    revoke execute on function public.trigger_notify_cv_request() from public;
    revoke execute on function public.trigger_notify_cv_request() from anon;
    revoke execute on function public.trigger_notify_cv_request() from authenticated;
  end if;

  if to_regprocedure('public.trigger_send_cv()') is not null then
    alter function public.trigger_send_cv()
      set search_path = public, extensions, net;

    revoke execute on function public.trigger_send_cv() from public;
    revoke execute on function public.trigger_send_cv() from anon;
    revoke execute on function public.trigger_send_cv() from authenticated;
  end if;
end $$;
