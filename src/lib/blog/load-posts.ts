import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BlogPost } from "../../data/blog";
import {
  interpretSupabasePostsResponse,
  resolvePostsForBuild,
  sortPostsByDateDesc,
} from "./interpret-merge";

const SELECT_COLUMNS =
  "slug,title,excerpt,body_markdown,tags,reading_time,medium_url,published_at,updated_at,cover_image_path,cover_image_alt,seo_title,seo_description,related_tool_ctas";
const LEGACY_SELECT_COLUMNS =
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
 * Loads published posts for static generation. Supabase is the source of truth
 * when build credentials exist. Static data is only a no-credentials fallback
 * for local builds and tests.
 */
export async function loadPublishedPostsForBuild(
  client: SupabaseClient | null,
  staticFallback: BlogPost[],
): Promise<BlogPost[]> {
  if (!client) {
    return sortPostsByDateDesc(staticFallback);
  }
  const nowIso = new Date().toISOString();
  const queryPublishedPosts = (columns: string) =>
    client
      .from("posts")
      .select(columns)
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false });

  let { data, error } = await queryPublishedPosts(SELECT_COLUMNS);
  if (isMissingEnhancedColumnError(error)) {
    console.warn(
      "[blog] Supabase posts metadata columns missing; retrying legacy post columns.",
    );
    ({ data, error } = await queryPublishedPosts(LEGACY_SELECT_COLUMNS));
  }

  const interpretation = interpretSupabasePostsResponse(data, error);

  if (interpretation.kind === "use_remote") {
    console.info(
      `[blog] Loaded ${interpretation.rows.length} published post(s) from Supabase.`,
    );
  }

  const resolved = resolvePostsForBuild(interpretation, staticFallback);
  return sortPostsByDateDesc(resolved);
}

function isMissingEnhancedColumnError(error: { message?: string } | null): boolean {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    message.includes("cover_image_path") ||
    message.includes("cover_image_alt") ||
    message.includes("seo_title") ||
    message.includes("seo_description") ||
    message.includes("related_tool_ctas") ||
    message.includes("updated_at")
  );
}
