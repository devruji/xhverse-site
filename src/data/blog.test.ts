import { describe, it, expect } from "vitest";
import { blogToolCtaDefinitions, posts } from "./blog";

describe("Blog Data", () => {
  it("should export a list of posts", () => {
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("should have valid post structures", () => {
    const post = posts[0];
    expect(post).toHaveProperty("slug");
    expect(post).toHaveProperty("title");
    expect(post).toHaveProperty("excerpt");
    expect(post).toHaveProperty("date");
    expect(post).toHaveProperty("tags");
    expect(post).toHaveProperty("mediumUrl");
    expect(post).toHaveProperty("readingTime");
    expect(post).toHaveProperty("bodyMarkdown");
    expect(typeof post.bodyMarkdown).toBe("string");
    expect(post.bodyMarkdown.length).toBeGreaterThan(0);
    expect(Array.isArray(post.tags)).toBe(true);
  });

  it("should have unique slugs and valid ISO dates", () => {
    const slugs = posts.map((post) => post.slug);
    expect(new Set(slugs).size).toBe(posts.length);

    for (const post of posts) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(post.date))).toBe(false);
      if (post.mediumUrl) {
        expect(post.mediumUrl.startsWith("https://")).toBe(true);
      }
    }
  });

  it("should have valid related tool CTA metadata", () => {
    for (const post of posts) {
      const ctas = post.relatedToolCtas ?? [];
      const ctaSlugs = ctas.map((cta) => cta.slug);
      expect(new Set(ctaSlugs).size).toBe(ctaSlugs.length);

      for (const cta of ctas) {
        const definition = blogToolCtaDefinitions[cta.slug];
        expect(definition).toBeDefined();
        expect(cta.label).toBe(definition.label);
        expect(cta.href).toBe(definition.href);
        expect(cta.href).toBe(`/tools/${cta.slug}`);
        expect(["primary", "secondary"]).toContain(cta.variant);
      }
    }
  });

  it("should include the big table vs star schema post metadata", () => {
    const post = posts.find((item) => item.slug === "big-table-vs-star-schema");
    expect(post).toBeDefined();
    expect(post?.coverImageUrl).toBe(
      "/images/blog-big-table-vs-star-schema-cover.webp",
    );
    expect(post?.coverImageAlt).toContain("wide table");
    expect(post?.seoTitle).toBe(
      "Big Table vs Star Schema | Data Modeling Design Patterns",
    );
    expect(post?.seoDescription).toContain("semantic layers");
    expect(post?.relatedToolCtas).toEqual([
      {
        slug: "scd-design-lab",
        label: "SCD Design Lab",
        href: "/tools/scd-design-lab",
        variant: "primary",
      },
      {
        slug: "lakehouse-cost-calculator",
        label: "Lakehouse Cost Calculator",
        href: "/tools/lakehouse-cost-calculator",
        variant: "secondary",
      },
      {
        slug: "architecture-roulette",
        label: "Architecture Decision Roulette",
        href: "/tools/architecture-roulette",
        variant: "secondary",
      },
    ]);
    expect(post?.bodyMarkdown).toContain("## The hybrid that usually works");
    expect(post?.bodyMarkdown).toContain("## References");
    expect(post?.bodyMarkdown).toContain("https://learn.microsoft.com/en-us/power-bi/guidance/star-schema");
    expect(post?.bodyMarkdown).toContain("## Disclosure");
    expect(post?.bodyMarkdown).toContain("co-written with an AI agent");
  });

  it("should include the data product platform contract post metadata", () => {
    const post = posts.find(
      (item) => item.slug === "data-product-as-platform-contract",
    );

    expect(post).toBeDefined();
    expect(post?.date).toBe("2026-06-03");
    expect(post?.updatedAt).toBe("2026-06-03");
    expect(post?.coverImageUrl).toBe(
      "/images/blog-data-product-as-platform-contract-cover.jpg",
    );
    expect(post?.coverImageAlt).toContain("central data product");
    expect(post?.seoTitle).toBe(
      "Data Product as a Platform Contract | XHVERSE",
    );
    expect(post?.seoDescription).toContain("minimal governed slice");
    expect(post?.relatedToolCtas).toEqual([
      {
        slug: "data-platform-maturity-checker",
        label: "Data Platform Maturity Checker",
        href: "/tools/data-platform-maturity-checker",
        variant: "primary",
      },
      {
        slug: "governance-scorecard",
        label: "Governance Readiness Scorecard",
        href: "/tools/governance-scorecard",
        variant: "secondary",
      },
      {
        slug: "architecture-roulette",
        label: "Architecture Decision Roulette",
        href: "/tools/architecture-roulette",
        variant: "secondary",
      },
    ]);
    expect(post?.bodyMarkdown).toContain("## Should we have one or not?");
    expect(post?.bodyMarkdown).toContain("## Good vs bad data products");
    expect(post?.bodyMarkdown).toContain("## Real-world data products");
    expect(post?.bodyMarkdown).toContain(
      "## XH data product thinking, for later",
    );
    expect(post?.bodyMarkdown).toContain(
      "Data Platform Maturity Checker](/tools/data-platform-maturity-checker)",
    );
    expect(post?.bodyMarkdown).toContain("## References");
    expect(post?.bodyMarkdown).toContain(
      "https://martinfowler.com/articles/designing-data-products.html",
    );
    expect(post?.bodyMarkdown).toContain("## Disclosure");
    expect(post?.bodyMarkdown).toContain("co-written with an AI agent");
  });

  it("should include required static replacement posts with media and CTAs", () => {
    const requiredSlugs = [
      "data-product-as-platform-contract",
      "open-table-formats-operating-model",
      "real-cost-open-tables",
      "envelope-encryption-data-platforms",
    ] as const;

    const expectedDates = {
      "data-product-as-platform-contract": "2026-06-03",
      "open-table-formats-operating-model": "2026-06-02",
      "real-cost-open-tables": "2026-06-02",
      "envelope-encryption-data-platforms": "2026-06-02",
    } satisfies Record<(typeof requiredSlugs)[number], string>;

    for (const slug of requiredSlugs) {
      const post = posts.find((item) => item.slug === slug);
      expect(post).toBeDefined();
      expect(post?.coverImageUrl).toBeTruthy();
      expect(post?.coverImageAlt).toBeTruthy();
      expect((post?.relatedToolCtas?.length ?? 0)).toBeGreaterThan(0);
      expect(post?.date).toBe(expectedDates[slug]);
    }
  });

  it("should not include old placeholder writing posts", () => {
    const removedSlugs = ["images-as-interfaces", "fragments-and-worlds"];
    const slugs = posts.map((post) => post.slug);

    for (const slug of removedSlugs) {
      expect(slugs).not.toContain(slug);
    }
  });
});
