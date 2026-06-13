import type { APIRoute } from "astro";
import { posts as staticFallback } from "../data/blog";
import {
  createSupabaseClientForBuild,
  loadPublishedPostsForBuild,
} from "../lib/blog/load-posts";
import type { BlogViewPostManifest } from "../lib/blog-views/core";

export const GET: APIRoute = async () => {
  const client = createSupabaseClientForBuild({
    SUPABASE_URL: import.meta.env.SUPABASE_URL,
    SUPABASE_SECRET_KEY: import.meta.env.SUPABASE_SECRET_KEY,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  const posts = await loadPublishedPostsForBuild(client, staticFallback);
  const manifest: BlogViewPostManifest = {
    generatedAt: new Date().toISOString(),
    posts: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
    })),
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
