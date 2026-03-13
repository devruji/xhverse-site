import { describe, expect, it } from "vitest";
import {
  DEFAULT_SITE_URL,
  normalizeEnvUrl,
  resolveProductionBranch,
  resolveSiteUrl,
  shouldNoIndex,
} from "./seo.js";

describe("normalizeEnvUrl", () => {
  it("adds https when the URL has no protocol", () => {
    expect(normalizeEnvUrl("preview.xhverse.pages.dev")).toBe(
      "https://preview.xhverse.pages.dev",
    );
  });

  it("trims whitespace and trailing slashes", () => {
    expect(normalizeEnvUrl(" https://xhverse.co/ ")).toBe("https://xhverse.co");
  });
});

describe("resolveSiteUrl", () => {
  it("prefers PUBLIC_SITE_URL over Cloudflare URLs", () => {
    expect(
      resolveSiteUrl({
        PUBLIC_SITE_URL: "https://staging.xhverse.co",
        CF_PAGES_URL: "branch.project.pages.dev",
      }),
    ).toBe("https://staging.xhverse.co");
  });

  it("uses CF_PAGES_URL when PUBLIC_SITE_URL is absent", () => {
    expect(
      resolveSiteUrl({
        CF_PAGES_URL: "branch.project.pages.dev",
      }),
    ).toBe("https://branch.project.pages.dev");
  });

  it("falls back to the production site URL", () => {
    expect(resolveSiteUrl({})).toBe(DEFAULT_SITE_URL);
  });
});

describe("resolveProductionBranch", () => {
  it("uses the configured production branch", () => {
    expect(resolveProductionBranch({ PUBLIC_PRODUCTION_BRANCH: "development" })).toBe(
      "development",
    );
  });

  it("defaults to main", () => {
    expect(resolveProductionBranch({})).toBe("main");
  });
});

describe("shouldNoIndex", () => {
  it("returns false for the production branch", () => {
    expect(
      shouldNoIndex({
        CF_PAGES: "1",
        CF_PAGES_BRANCH: "development",
        PUBLIC_PRODUCTION_BRANCH: "development",
      }),
    ).toBe(false);
  });

  it("returns true for preview branches on Cloudflare Pages", () => {
    expect(
      shouldNoIndex({
        CF_PAGES: "1",
        CF_PAGES_BRANCH: "feat/seo-medium-integration",
        PUBLIC_PRODUCTION_BRANCH: "development",
      }),
    ).toBe(true);
  });

  it("allows a manual override", () => {
    expect(
      shouldNoIndex({
        CF_PAGES: "1",
        CF_PAGES_BRANCH: "preview",
        PUBLIC_ALLOW_INDEXING: "true",
      }),
    ).toBe(false);
  });
});
