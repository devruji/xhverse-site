import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BlogPost } from "../../data/blog";
import {
  interpretSupabasePostsResponse,
  mergePostsWithStaticFallback,
  sortPostsByDateDesc,
} from "./interpret-merge";

const SELECT_COLUMNS =
  "slug,title,excerpt,body_markdown,tags,reading_time,medium_url,published_at";

export function readSupabaseBuildCredentials(env: {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
}): { url: string; key: string } | null {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function createSupabaseClientForBuild(
  env: Record<string, string | undefined>,
): SupabaseClient | null {
  const creds = readSupabaseBuildCredentials({
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_SECRET_KEY: env.SUPABASE_SECRET_KEY,
  });
  if (!creds) return null;
  return createClient(creds.url, creds.key);
}

/**
 * Loads published posts for static generation. Uses Supabase when URL + secret
 * key are set; on error or empty result, falls back to static `blog.ts` data.
 */
export async function loadPublishedPostsForBuild(
  client: SupabaseClient | null,
  staticFallback: BlogPost[],
): Promise<BlogPost[]> {
  if (!client) {
    return sortPostsByDateDesc(staticFallback);
  }
  const { data, error } = await client
    .from("posts")
    .select(SELECT_COLUMNS)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  const interpretation = interpretSupabasePostsResponse(data, error);
  const merged = mergePostsWithStaticFallback(interpretation, staticFallback);
  return sortPostsByDateDesc(merged);
}
