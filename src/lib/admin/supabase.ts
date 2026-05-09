import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type BrowserSupabaseEnv = {
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
};

export function readBrowserSupabaseConfig(
  env: BrowserSupabaseEnv,
): { url: string; key: string } | null {
  const url = env.PUBLIC_SUPABASE_URL?.trim();
  const key =
    env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    env.PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return null;
  return { url, key };
}

export function createAdminClient(
  env: BrowserSupabaseEnv,
): SupabaseClient | null {
  const config = readBrowserSupabaseConfig(env);
  if (!config) return null;

  return createClient(config.url, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
