import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveSupabaseOrigin } from "../src/data/supabase-config";

const supabaseOrigin = resolveSupabaseOrigin(
  process.env as Record<string, string>,
);

const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-DNS-Prefetch-Control: off
  X-Permitted-Cross-Domain-Policies: none
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), geolocation=(), microphone=()
  Cross-Origin-Opener-Policy: same-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' ${supabaseOrigin}; frame-src https://challenges.cloudflare.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=604800

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/
  Cache-Control: public, max-age=0, must-revalidate
`;

writeFileSync(resolve("public/_headers"), headers);
console.log(
  `[generate-headers] Wrote public/_headers (connect-src: ${supabaseOrigin})`,
);
