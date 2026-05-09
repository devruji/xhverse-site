export const DEFAULT_SUPABASE_PROJECT_URL =
  "https://jxfpnfliioqbhzznaphd.supabase.co";

export function resolveSupabaseOrigin(
  env: { PUBLIC_SUPABASE_URL?: string } = {},
): string {
  const url = env.PUBLIC_SUPABASE_URL?.trim();
  if (!url) return DEFAULT_SUPABASE_PROJECT_URL;
  try {
    return new URL(url).origin;
  } catch {
    return DEFAULT_SUPABASE_PROJECT_URL;
  }
}
