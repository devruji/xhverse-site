import { describe, it, expect } from "vitest";
import { buildCanonicalUrl, normalizeUrl } from "./site";

describe("normalizeUrl", () => {
  it("removes the trailing slash from a URL", () => {
    const urlWithSlash = "https://example.com/";
    const normalized = normalizeUrl(urlWithSlash);
    expect(normalized).toBe("https://example.com");
  });

  it("leaves a URL without a trailing slash unchanged", () => {
    const urlWithoutSlash = "https://example.com";
    const normalized = normalizeUrl(urlWithoutSlash);
    expect(normalized).toBe("https://example.com");
  });
});

describe("buildCanonicalUrl", () => {
  it("keeps the root URL canonical", () => {
    expect(buildCanonicalUrl("/")).toBe("https://xhverse.co/");
  });

  it("removes trailing slashes for nested routes", () => {
    expect(buildCanonicalUrl("/blog/")).toBe("https://xhverse.co/blog");
  });

  it("uses the provided deployment base URL", () => {
    expect(
      buildCanonicalUrl("/blog/", "https://preview.xhverse.pages.dev"),
    ).toBe("https://preview.xhverse.pages.dev/blog");
  });
});
