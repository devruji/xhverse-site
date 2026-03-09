import { describe, it, expect } from "vitest";
import { normalizeUrl } from "./site";

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
