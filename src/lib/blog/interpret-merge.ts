import type { BlogPost } from "../../data/blog";
import { mapPostRowToBlogPost } from "./post-row";

export type PostsQueryInterpretation =
  | { kind: "use_remote"; rows: unknown[] }
  | { kind: "use_fallback" };

export function interpretSupabasePostsResponse(
  data: unknown,
  error: { message: string } | null,
): PostsQueryInterpretation {
  if (error) return { kind: "use_fallback" };
  if (!Array.isArray(data) || data.length === 0) {
    return { kind: "use_fallback" };
  }
  return { kind: "use_remote", rows: data };
}

export function mergePostsWithStaticFallback(
  interpretation: PostsQueryInterpretation,
  fallback: BlogPost[],
): BlogPost[] {
  if (interpretation.kind === "use_fallback") {
    return [...fallback];
  }
  return interpretation.rows.map((row) => mapPostRowToBlogPost(row));
}

export function sortPostsByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((left, right) => right.date.localeCompare(left.date));
}
