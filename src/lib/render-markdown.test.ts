import { describe, it, expect } from "vitest";
import {
  extractTableOfContents,
  renderMarkdownToHtml,
  slugifyHeading,
  transformCalloutMarkdown,
} from "./render-markdown";

describe("renderMarkdownToHtml", () => {
  it("renders headings and paragraphs", () => {
    const html = renderMarkdownToHtml("## Title\n\nHello **world**.");
    expect(html).toContain('<h2 id="title">');
    expect(html).toContain("Title");
    expect(html).toContain("<strong>world</strong>");
  });

  it("extracts a table of contents with stable duplicate ids", () => {
    expect(extractTableOfContents("## Intro\n\n### Detail\n\n## Intro")).toEqual([
      { id: "intro", text: "Intro", level: 2 },
      { id: "detail", text: "Detail", level: 3 },
      { id: "intro-2", text: "Intro", level: 2 },
    ]);
  });

  it("does not treat fenced code headings as table of contents entries", () => {
    const markdown = "## Real\n\n```sql\n## Not a heading\n```\n\n### Detail";
    expect(extractTableOfContents(markdown)).toEqual([
      { id: "real", text: "Real", level: 2 },
      { id: "detail", text: "Detail", level: 3 },
    ]);
  });

  it("slugifies empty headings with a section fallback", () => {
    expect(slugifyHeading("!!!")).toBe("section");
  });

  it("returns plain rendered html when there are no toc headings", () => {
    const html = renderMarkdownToHtml("Paragraph only.");
    expect(html).toContain("<p>Paragraph only.</p>");
  });

  it("preserves existing heading ids and extra raw headings", () => {
    const html = renderMarkdownToHtml('<h2 id="manual">Manual</h2>\n\n## Generated\n\n<h2>Extra</h2>');
    expect(html).toContain('<h2 id="manual">Manual</h2>');
    expect(html).toContain('<h2 id="generated">Generated</h2>');
    expect(html).toContain("<h2>Extra</h2>");
  });

  it("strips script tags", () => {
    const html = renderMarkdownToHtml('<script>alert(1)</script>\n\nHi');
    expect(html.toLowerCase()).not.toContain("<script");
  });

  it("allows safe links with https", () => {
    const html = renderMarkdownToHtml("[x](https://example.com/path)");
    expect(html).toContain('href="https://example.com/path"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("strips unsafe javascript links", () => {
    const html = renderMarkdownToHtml("[x](javascript:alert(1))");
    expect(html.toLowerCase()).not.toContain("javascript:");
  });

  it("keeps links without href internal", () => {
    const html = renderMarkdownToHtml("<a>label</a>");
    expect(html).toContain("<a>label</a>");
    expect(html).not.toContain("target=");
  });

  it("strips data and external image sources", () => {
    const html = renderMarkdownToHtml("![x](data:image/svg+xml,<svg></svg>)");
    expect(html.toLowerCase()).not.toContain("data:image");
    const external = renderMarkdownToHtml("![x](https://cdn.example.com/cover.jpg)");
    expect(external).not.toContain("<img");
    expect(external).not.toContain("cdn.example.com");
    const missingSrc = renderMarkdownToHtml('<img alt="missing source">');
    expect(missingSrc).not.toContain("<img");
  });

  it("keeps same-origin images and adds lazy loading defaults", () => {
    const html = renderMarkdownToHtml("![x](/images/blog/cover.jpg)");
    expect(html).toContain('src="/images/blog/cover.jpg"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it("wraps markdown tables in a scrollable region for narrow screens", () => {
    const html = renderMarkdownToHtml("| Layer | Why it matters |\n| --- | --- |\n| Log | Snapshot isolation |");
    expect(html).toContain(
      '<div class="article-table-scroll" role="region" tabindex="0"><table>',
    );
    expect(html).toContain("<th>Layer</th>");
    expect(html).toContain("<td>Snapshot isolation</td>");
  });

  it("renders typed callouts with sanitized classes", () => {
    const html = renderMarkdownToHtml([
      "> [!decision]",
      "> Choose the star schema when shared meaning matters.",
      ">",
      "> - Preserve grain",
      "> - Preserve history",
    ].join("\n"));
    expect(html).toContain('class="article-callout article-callout--decision"');
    expect(html).toContain('class="article-callout__label"');
    expect(html).toContain("Decision rule");
    expect(html).toContain("<li>Preserve grain</li>");
  });

  it("leaves unknown callout markers as ordinary blockquotes", () => {
    const html = renderMarkdownToHtml("> [!custom]\n> Keep me plain.");
    expect(html).toContain("<blockquote>");
    expect(html).not.toContain("article-callout");
  });

  it("transforms callout markdown before rendering", () => {
    const transformed = transformCalloutMarkdown("> [!warning]\n> Public draft covers leak.");
    expect(transformed).toContain('article-callout--warning');
    expect(transformed).toContain("Watch out");
  });
});
