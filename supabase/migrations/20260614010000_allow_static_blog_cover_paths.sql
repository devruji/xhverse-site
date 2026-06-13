-- Allow emergency/generated blog covers that ship as same-origin static assets.
-- Admin uploads still use the blog-covers Storage bucket path pattern.

alter table public.posts
  drop constraint if exists posts_cover_image_path_check;

alter table public.posts
  add constraint posts_cover_image_path_check
  check (
    cover_image_path is null
    or cover_image_path ~ '^posts/[a-z0-9]+(?:-[a-z0-9]+)*\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|avif|jpg|jpeg|png)$'
    or cover_image_path ~ '^/images/[a-z0-9][a-z0-9._/-]*\.(webp|avif|jpg|jpeg|png)$'
  );
