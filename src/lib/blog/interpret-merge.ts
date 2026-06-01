import type { BlogPost } from "../../data/blog";
import { mapPostRowToBlogPost } from "./post-row";

export type PostsQueryInterpretation =
  | { kind: "use_remote"; rows: unknown[] }
  | { kind: "use_fallback"; reason: "query_error" | "empty_result" };

export function interpretSupabasePostsResponse(
  data: unknown,
  error: { message: string } | null,
): PostsQueryInterpretation {
  if (error) return { kind: "use_fallback", reason: "query_error" };
  if (!Array.isArray(data) || data.length === 0) {
    return { kind: "use_fallback", reason: "empty_result" };
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

  const fallbackBySlug = new Map(fallback.map((post) => [post.slug, post]));
  const mergedBySlug = new Map<string, BlogPost>();

  for (const fallbackPost of fallback) {
    mergedBySlug.set(fallbackPost.slug, fallbackPost);
  }

  for (const row of interpretation.rows) {
    const remotePost = mapPostRowToBlogPost(row);
    const fallbackPost = fallbackBySlug.get(remotePost.slug);
    if (fallbackPost) {
      const mergedPost: BlogPost = {
        ...fallbackPost,
        updatedAt: remotePost.updatedAt,
      };
      if (remotePost.relatedToolCtas) {
        mergedPost.relatedToolCtas = remotePost.relatedToolCtas;
      }
      mergedBySlug.set(remotePost.slug, mergedPost);
      continue;
    }
    mergedBySlug.set(remotePost.slug, {
      ...remotePost,
      relatedToolCtas: remotePost.relatedToolCtas,
    });
  }

  return [...mergedBySlug.values()];
}

export function sortPostsByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((left, right) => right.date.localeCompare(left.date));
}
