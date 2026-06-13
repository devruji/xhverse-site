import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { posts, type BlogPost } from "../src/data/blog";
import { BLOG_COVERS_BUCKET } from "../src/data/supabase-config";

type ExistingPostRow = {
  slug: string;
  cover_image_path: string | null;
};

type SeedPayload = {
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  tags: string[];
  reading_time: string;
  medium_url: string | null;
  status: "published";
  published_at: string;
  updated_at: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  related_tool_ctas: Array<{ slug: string; variant: "primary" | "secondary" }> | null;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function contentTypeForPath(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".avif") return "image/avif";
  if (extension === ".webp") return "image/webp";
  if (extension === ".png") return "image/png";
  return "image/jpeg";
}

function storageExtensionForPath(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase().replace(".", "");
  if (extension === "jpeg") return "jpg";
  if (["avif", "webp", "png", "jpg"].includes(extension)) return extension;
  return "jpg";
}

function publishedAt(post: BlogPost): string {
  return `${post.date}T00:00:00.000Z`;
}

function relatedToolCtas(post: BlogPost): SeedPayload["related_tool_ctas"] {
  if (!post.relatedToolCtas?.length) return null;
  return post.relatedToolCtas.map((cta) => ({
    slug: cta.slug,
    variant: cta.variant,
  }));
}

function coverFilePath(post: BlogPost): string | null {
  if (!post.coverImageUrl?.startsWith("/images/")) return null;
  return path.join(process.cwd(), "public", post.coverImageUrl);
}

async function uploadCover(options: {
  post: BlogPost;
  existingPath: string | null;
  dryRun: boolean;
  upload: (objectPath: string, bytes: Blob, contentType: string) => Promise<void>;
}): Promise<string | null> {
  if (options.existingPath) return options.existingPath;
  const filePath = coverFilePath(options.post);
  if (!filePath) return null;
  const objectPath = `posts/${options.post.slug}/${crypto.randomUUID()}.${storageExtensionForPath(filePath)}`;
  if (options.dryRun) return objectPath;
  const bytes = await readFile(filePath);
  await options.upload(
    objectPath,
    new Blob([bytes], { type: contentTypeForPath(filePath) }),
    contentTypeForPath(filePath),
  );
  return objectPath;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const url = requiredEnv("SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SECRET_KEY");
  const client = createClient(url, key);
  const slugs = posts.map((post) => post.slug);
  const { data, error } = await client
    .from("posts")
    .select("slug,cover_image_path")
    .in("slug", slugs);
  if (error) throw new Error(error.message);

  const existingRows = Array.isArray(data) ? (data as ExistingPostRow[]) : [];
  const existingBySlug = new Map(existingRows.map((row) => [row.slug, row]));
  const payloads: SeedPayload[] = [];

  for (const post of posts) {
    const coverPath = await uploadCover({
      post,
      existingPath: existingBySlug.get(post.slug)?.cover_image_path ?? null,
      dryRun,
      upload: async (objectPath, bytes, contentType) => {
        const { error: uploadError } = await client.storage
          .from(BLOG_COVERS_BUCKET)
          .upload(objectPath, bytes, {
            cacheControl: "31536000",
            contentType,
            upsert: false,
          });
        if (uploadError) throw new Error(uploadError.message);
      },
    });

    payloads.push({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body_markdown: post.bodyMarkdown,
      tags: post.tags,
      reading_time: post.readingTime,
      medium_url: post.mediumUrl || null,
      status: "published",
      published_at: publishedAt(post),
      updated_at: post.updatedAt ? `${post.updatedAt}T00:00:00.000Z` : null,
      cover_image_path: coverPath,
      cover_image_alt: coverPath ? (post.coverImageAlt ?? null) : null,
      seo_title: post.seoTitle ?? null,
      seo_description: post.seoDescription ?? null,
      related_tool_ctas: relatedToolCtas(post),
    });
  }

  if (dryRun) {
    console.info(`[blog-seed] dry run prepared ${payloads.length} post payload(s).`);
    return;
  }

  const { error: upsertError } = await client
    .from("posts")
    .upsert(payloads, { onConflict: "slug" });
  if (upsertError) throw new Error(upsertError.message);

  console.info(`[blog-seed] upserted ${payloads.length} published post(s).`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown seed failure.";
  console.error(`[blog-seed] ${message}`);
  process.exitCode = 1;
});
