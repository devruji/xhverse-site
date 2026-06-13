---
name: supabase-backend
description: Guide for working with Supabase as a full backend — database, auth, storage, edge functions, realtime, and RLS policies. Use this skill whenever the user mentions Supabase, database tables, migrations, RLS policies, storage buckets, auth, edge functions, or any backend data work. Also trigger when the user asks about querying data, creating tables, managing permissions, uploading files, or connecting a frontend to a backend API. If you see imports from @supabase/supabase-js or references to SUPABASE_URL / SUPABASE_SECRET_KEY, use this skill.
---

# Supabase Backend Guide

This project uses Supabase as the blog CMS/source of truth, for selected runtime submissions, admin data access, CV PDF storage, and Edge Functions for CV email delivery. Use this skill only when the task explicitly involves Supabase/backend data work or the changed files already touch Supabase integrations.

## Current Usage in xhverse

### Database Tables
- `posts` — blog CMS source of truth with slug, title, body_markdown, tags, reading_time, medium_url, published_at, status, cover metadata, SEO metadata, and related_tool_ctas
- `data_platform_maturity_submissions` — anonymous maturity assessment submissions and aggregate stats
- `cv_download_requests` — CV gate requests, approval status, and send lifecycle
- `leads` — advisory/contact lead tracking for the admin panel

### Storage
- `documents` bucket → `cv/rujikorn-ngoensaard-cv.pdf` (public read)

### Client Access Patterns
- **Build time**: `SUPABASE_URL` + `SUPABASE_SECRET_KEY` (service role) for fetching published posts; when configured, Supabase posts are authoritative
- **Client side**: `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon key) for maturity submissions, CV requests, leads, and admin reads/updates gated by RLS and Cloudflare Access
- **Edge Functions**: Supabase service role + `RESEND_API_KEY` for CV request notifications and PDF delivery

### Security Model
- All tables have RLS enabled
- Anonymous users: insert-only on public submissions and constrained reads where explicitly allowed by RLS
- Admin pages are protected by Cloudflare Access before client-side Supabase calls
- Service role (build time): full read access to published posts
- Public storage: read-only on `documents` bucket

### Edge Functions
- `submit-cv-request` — handles public CV request submission
- `notify-cv-request` — emails the admin when a new CV request is created
- `send-cv` — sends the CV PDF after an admin approves a request

## Database

### Migrations
Located in `supabase/migrations/`. Applied with:
```bash
supabase db push          # push local migrations to remote
supabase migration new "description"  # create new migration file
supabase db reset         # reset local DB and reapply all migrations
```

### Writing Migrations
```sql
-- supabase/migrations/20260509000000_create_example.sql

create table if not exists public.example (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz not null default now()
);

-- Always enable RLS
alter table public.example enable row level security;

-- Define policies explicitly
create policy "Anyone can read published examples"
  on public.example for select
  using (status = 'published');

create policy "Service role can manage examples"
  on public.example for all
  using (auth.role() = 'service_role');
```

### Common Query Patterns
```typescript
// Fetch published posts (build time, service role)
const { data, error } = await supabase
  .from("posts")
  .select("slug,title,excerpt,body_markdown,tags,reading_time,medium_url,published_at,updated_at,cover_image_path,cover_image_alt,seo_title,seo_description,related_tool_ctas")
  .eq("status", "published")
  .not("published_at", "is", null)
  .order("published_at", { ascending: false });

// Insert anonymous submission (client side, anon key)
const { error } = await supabase
  .from("data_platform_maturity_submissions")
  .insert({ scores: payload, submitted_at: new Date().toISOString() });

// Insert public CV request (client side, anon key)
const { error: requestError } = await supabase
  .from("cv_download_requests")
  .insert({ email, status: "pending" });
```

### RLS Policy Patterns

**Public read, authenticated write:**
```sql
create policy "Public read" on public.table for select using (true);
create policy "Auth write" on public.table for insert with check (auth.uid() is not null);
```

**Anonymous insert only (no read back):**
```sql
create policy "Anon insert" on public.table for insert with check (true);
-- No select policy = no reads for anon
```

**Service role bypass:**
```sql
-- Service role always bypasses RLS, no policy needed
-- But explicit policy is clearer for documentation:
create policy "Service all" on public.table for all using (auth.role() = 'service_role');
```

## Auth

### Setup
```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
```

### Common Patterns
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "secure-password",
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "secure-password",
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();

// OAuth (e.g., GitHub)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "github",
  options: { redirectTo: "https://xhverse.co/auth/callback" },
});
```

### Auth Helpers for SSR (Astro)
For server-side auth in Astro endpoints:
```typescript
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient(request: Request) {
  const cookies = Object.fromEntries(
    request.headers.get("cookie")?.split("; ").map(c => c.split("=")) ?? []
  );
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { cookies: { get: (key) => cookies[key] } }
  );
}
```

## Storage

### Bucket Management
```bash
# Via CLI
supabase storage create my-bucket --public  # public bucket
supabase storage create my-bucket           # private bucket
```

### Upload / Download
```typescript
// Upload
const { data, error } = await supabase.storage
  .from("documents")
  .upload("path/to/file.pdf", file, {
    contentType: "application/pdf",
    upsert: true,
  });

// Get public URL
const { data } = supabase.storage
  .from("documents")
  .getPublicUrl("cv/rujikorn-ngoensaard-cv.pdf");

// Download (private bucket)
const { data, error } = await supabase.storage
  .from("private-bucket")
  .download("path/to/file.pdf");

// List files
const { data, error } = await supabase.storage
  .from("documents")
  .list("cv/", { limit: 100 });
```

### Storage Policies
```sql
-- Allow public read on a bucket
create policy "Public read" on storage.objects for select
  using (bucket_id = 'documents');

-- Allow authenticated upload
create policy "Auth upload" on storage.objects for insert
  with check (bucket_id = 'uploads' and auth.uid() is not null);
```

## Edge Functions

### Create & Deploy
```bash
supabase functions new my-function
supabase functions deploy my-function
supabase functions serve  # local dev
```

### Function Structure
```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase.from("posts").select("*");

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### Invoking from Client
```typescript
const { data, error } = await supabase.functions.invoke("my-function", {
  body: { key: "value" },
});
```

## Realtime

### Subscribe to Changes
```typescript
const channel = supabase
  .channel("posts-changes")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "posts",
  }, (payload) => {
    console.log("New post:", payload.new);
  })
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

### Broadcast (Ephemeral Messages)
```typescript
const channel = supabase.channel("room-1");
channel.on("broadcast", { event: "cursor" }, (payload) => {
  // handle cursor position
});
channel.subscribe();
channel.send({ type: "broadcast", event: "cursor", payload: { x: 100, y: 200 } });
```

## Local Development

### Setup
```bash
supabase init                    # one-time project init
supabase start                   # start local Supabase (Docker)
supabase status                  # show local URLs and keys
supabase db reset                # reset and reapply migrations
supabase migration new "name"    # create migration
supabase db push                 # push migrations to remote
supabase db pull                 # pull remote schema to local migrations
```

### Environment Variables
Local development uses the local Supabase instance:
```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=<local-service-role-key from supabase status>
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-anon-key from supabase status>
```

## Security Best Practices

1. **Never expose the service role key client-side** — it's for build-time/server-only use
2. **Always enable RLS** on every table, even if policies are permissive
3. **Validate inputs** in Edge Functions before database operations
4. **Use typed clients** — generate types with `supabase gen types typescript`
5. **Principle of least privilege** — give anonymous users only what they absolutely need
6. **Audit policies** — use `supabase inspect db policies` to review

## Type Generation
```bash
supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
# Or from local:
supabase gen types typescript --local > src/types/supabase.ts
```

Then use with the client:
```typescript
import type { Database } from "./types/supabase";
const supabase = createClient<Database>(url, key);
```
