export const DEFAULT_SUPABASE_PROJECT_URL =
  "https://jxfpnfliioqbhzznaphd.supabase.co";

export const BLOG_COVERS_BUCKET = "blog-covers";

type SupabaseUrlEnv = {
  PUBLIC_SUPABASE_URL?: string;
  SUPABASE_URL?: string;
};

export function resolveSupabaseOrigin(
  env: SupabaseUrlEnv = {},
): string {
  for (const candidate of [env.PUBLIC_SUPABASE_URL, env.SUPABASE_URL]) {
    const url = candidate?.trim();
    if (!url) continue;
    try {
      return new URL(url).origin;
    } catch {
      continue;
    }
  }
  return DEFAULT_SUPABASE_PROJECT_URL;
}

export function blogCoverPublicUrl(
  path: string,
  env: SupabaseUrlEnv = {},
): string {
  const normalized = path.replace(/^\/+/, "");
  return `${resolveSupabaseOrigin(env)}/storage/v1/object/public/${BLOG_COVERS_BUCKET}/${normalized}`;
}
