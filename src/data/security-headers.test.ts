import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const headers = readFileSync(resolve("public/_headers"), "utf8");

describe("Cloudflare security headers", () => {
  it("enforces browser isolation and MIME hardening as HTTP headers", () => {
    expect(headers).toContain("X-Frame-Options: DENY");
    expect(headers).toContain("X-Content-Type-Options: nosniff");
    expect(headers).toContain(
      "Referrer-Policy: strict-origin-when-cross-origin",
    );
    expect(headers).toContain(
      "Permissions-Policy: camera=(), geolocation=(), microphone=()",
    );
  });

  it("sets a restrictive CSP at the edge", () => {
    expect(headers).toContain("Content-Security-Policy:");
    expect(headers).toContain("default-src 'self'");
    expect(headers).toContain("object-src 'none'");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("base-uri 'self'");
    expect(headers).toContain("upgrade-insecure-requests");
    expect(headers).not.toContain("'unsafe-inline'");
  });

  it("uses immutable caching only for fingerprinted Astro assets", () => {
    expect(headers).toContain("/_astro/*");
    expect(headers).toContain("Cache-Control: public, max-age=31536000, immutable");
    expect(headers).toContain("/*.html");
    expect(headers).toContain("Cache-Control: public, max-age=0, must-revalidate");
  });
});
