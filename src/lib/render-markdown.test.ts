import { describe, it, expect } from "vitest";
import { renderMarkdownToHtml } from "./render-markdown";

describe("renderMarkdownToHtml", () => {
  it("renders headings and paragraphs", () => {
    const html = renderMarkdownToHtml("## Title\n\nHello **world**.");
    expect(html).toContain("<h2>");
    expect(html).toContain("Title");
    expect(html).toContain("<strong>world</strong>");
  });

  it("strips script tags", () => {
    const html = renderMarkdownToHtml('<script>alert(1)</script>\n\nHi');
    expect(html.toLowerCase()).not.toContain("<script");
  });

  it("allows safe links with https", () => {
    const html = renderMarkdownToHtml("[x](https://example.com/path)");
    expect(html).toContain('href="https://example.com/path"');
  });

  it("strips unsafe javascript links", () => {
    const html = renderMarkdownToHtml("[x](javascript:alert(1))");
    expect(html.toLowerCase()).not.toContain("javascript:");
  });

  it("strips data image sources", () => {
    const html = renderMarkdownToHtml("![x](data:image/svg+xml,<svg></svg>)");
    expect(html.toLowerCase()).not.toContain("data:image");
  });
});
