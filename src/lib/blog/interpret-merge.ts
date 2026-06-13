import type { BlogPost } from "../../data/blog";
import { mapPostRowToBlogPost } from "./post-row";

export type PostsQueryInterpretation =
  | { kind: "use_remote"; rows: unknown[] }
  | { kind: "use_fallback"; reason: "no_client" }
  | { kind: "query_error"; message: string };

export function interpretSupabasePostsResponse(
  data: unknown,
  error: { message: string } | null,
): PostsQueryInterpretation {
  if (error) {
    return {
      kind: "query_error",
      message: error.message || "Supabase posts query failed.",
    };
  }
  if (!Array.isArray(data)) return { kind: "query_error", message: "Supabase posts query returned an invalid payload." };
  return { kind: "use_remote", rows: data };
}

export function resolvePostsForBuild(
  interpretation: PostsQueryInterpretation,
  fallback: BlogPost[],
): BlogPost[] {
  if (interpretation.kind === "use_fallback") {
    return [...fallback];
  }
  if (interpretation.kind === "query_error") {
    throw new Error(interpretation.message);
  }

  return interpretation.rows.map((row) => mapPostRowToBlogPost(row));
}

export function sortPostsByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((left, right) => right.date.localeCompare(left.date));
}
