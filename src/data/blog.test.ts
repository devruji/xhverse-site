import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { blogToolCtaDefinitions, createRelatedToolCta, posts } from "./blog";
import { toolDefinitions } from "./tools";

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
    expect(Object.keys(blogToolCtaDefinitions).sort()).toEqual(
      Object.keys(toolDefinitions).sort(),
    );

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

  it("should include the materialized views architecture post metadata", () => {
    const post = posts.find(
      (item) => item.slug === "most-teams-use-materialized-views-too-early",
    );

    expect(post).toBeDefined();
    expect(post?.title).toBe("Most Teams Use Materialized Views Too Early");
    expect(post?.date).toBe("2026-06-13");
    expect(post?.updatedAt).toBe("2026-06-13");
    expect(post?.readingTime).toBe("11 min read");
    expect(post?.coverImageUrl).toBe(
      "/images/blog-most-teams-use-materialized-views-too-early-cover.jpg",
    );
    expect(
      existsSync(
        new URL(
          "../../public/images/blog-most-teams-use-materialized-views-too-early-cover.jpg",
          import.meta.url,
        ),
      ),
    ).toBe(true);
    expect(post?.coverImageAlt).toContain("repeated recomputation");
    expect(post?.seoTitle).toBe(
      "Most Teams Use Materialized Views Too Early | Data Architecture",
    );
    expect(post?.seoDescription).toContain("modeling, query, layout");
    expect(post?.relatedToolCtas).toEqual([
      createRelatedToolCta("lakehouse-cost-calculator", "primary"),
      createRelatedToolCta("lakehouse-table-layout-advisor", "secondary"),
    ]);
    expect(post?.bodyMarkdown).toContain(
      "## Materialized views are architecture, not aspirin",
    );
    expect(post?.bodyMarkdown).toContain(
      "## Diagnose the workload before you materialize it",
    );
    expect(post?.bodyMarkdown).toContain(
      "## What a materialized view commits you to",
    );
    expect(post?.bodyMarkdown).toContain(
      "## When materialized views are the right tool",
    );
    expect(post?.bodyMarkdown).toContain("## When they create debt");
    expect(post?.bodyMarkdown).toContain("## Platform behavior is not portable");
    expect(post?.bodyMarkdown).toContain("## Decision checklist");
    expect(post?.bodyMarkdown).toContain(
      "Lakehouse Cost Calculator](/tools/lakehouse-cost-calculator)",
    );
    expect(post?.bodyMarkdown).toContain("Evidence note: platform-specific behavior");
    expect(post?.bodyMarkdown).toContain("## References");
    expect(post?.bodyMarkdown).toContain("### Official Documentation");
    expect(post?.bodyMarkdown).toContain("### Engineering Blogs");
    expect(post?.bodyMarkdown).toContain("### Research Papers");
    expect(post?.bodyMarkdown).toContain("### Additional Reading");
    expect(post?.bodyMarkdown).toContain(
      "https://www.postgresql.org/docs/current/rules-materializedviews.html",
    );
    expect(post?.bodyMarkdown).toContain(
      "https://learn.microsoft.com/en-us/fabric/data-warehouse/tsql-surface-area",
    );
    expect(post?.bodyMarkdown).toContain("## Disclosure");
    expect(post?.bodyMarkdown).toContain("co-written with an AI agent");
    expect(post?.bodyMarkdown).not.toContain("# Most Teams Use Materialized Views");
    expect(post?.bodyMarkdown).not.toContain("## Cover image concept");
    expect(post?.bodyMarkdown).not.toContain("Thumbnail review:");
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
        slug: "power-bi-semantic-model-doctor",
        label: "Power BI Semantic Model Doctor",
        href: "/tools/power-bi-semantic-model-doctor",
        variant: "primary",
      },
      {
        slug: "scd-design-lab",
        label: "SCD Design Lab",
        href: "/tools/scd-design-lab",
        variant: "secondary",
      },
      {
        slug: "lakehouse-cost-calculator",
        label: "Lakehouse Cost Calculator",
        href: "/tools/lakehouse-cost-calculator",
        variant: "secondary",
      },
    ]);
    expect(post?.bodyMarkdown).toContain("## The hybrid that usually works");
    expect(post?.bodyMarkdown).toContain("## Related tools");
    expect(post?.bodyMarkdown).toContain(
      "Power BI Semantic Model Doctor](/tools/power-bi-semantic-model-doctor)",
    );
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
        slug: "data-product-contract-builder",
        label: "Data Product Contract Builder",
        href: "/tools/data-product-contract-builder",
        variant: "primary",
      },
      {
        slug: "governance-scorecard",
        label: "Governance Readiness Scorecard",
        href: "/tools/governance-scorecard",
        variant: "secondary",
      },
      {
        slug: "data-platform-maturity-checker",
        label: "Data Platform Maturity Checker",
        href: "/tools/data-platform-maturity-checker",
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
      "Data Product Contract Builder](/tools/data-product-contract-builder)",
    );
    expect(post?.bodyMarkdown).toContain("## References");
    expect(post?.bodyMarkdown).toContain(
      "https://martinfowler.com/articles/designing-data-products.html",
    );
    expect(post?.bodyMarkdown).toContain("## Disclosure");
    expect(post?.bodyMarkdown).toContain("co-written with an AI agent");
  });

  it("should include the June 4 technical blog launch posts", () => {
    const expectedPosts = [
      {
        slug: "onelake-platform-contract-not-storage",
        title: "OneLake is a platform contract, not just storage",
        coverImageUrl:
          "/images/blog-onelake-platform-contract-not-storage-cover.jpg",
        readingTime: "6 min read",
        primaryCtaSlug: "access-model-simulator",
        secondaryCtaSlugs: ["governance-scorecard", "data-product-contract-builder"],
        reference: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview",
        bodyChecks: [
          "## Shortcuts are not ownership shortcuts",
          "## Security has more than one plane",
          "## API and external access belong in the contract",
          "Access Model Simulator](/tools/access-model-simulator)",
        ],
      },
      {
        slug: "abac-row-filters-column-masks-production-ownership",
        title: "ABAC row filters and column masks need production ownership",
        coverImageUrl:
          "/images/blog-abac-row-filters-column-masks-production-ownership-cover.jpg",
        readingTime: "6 min read",
        primaryCtaSlug: "access-model-simulator",
        secondaryCtaSlugs: ["governance-scorecard", "data-platform-maturity-checker"],
        reference:
          "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac",
        bodyChecks: [
          "## What ABAC actually centralizes",
          "## UDFs are production code",
          "## Verification is part of the rollout",
          "Access Model Simulator](/tools/access-model-simulator)",
        ],
      },
      {
        slug: "serverless-data-engineering-operating-model",
        title: "Serverless data engineering still needs an operating model",
        coverImageUrl:
          "/images/blog-serverless-data-engineering-operating-model-cover.jpg",
        readingTime: "5 min read",
        primaryCtaSlug: "data-platform-maturity-checker",
        secondaryCtaSlugs: ["pipeline-recovery-planner", "lakehouse-cost-calculator"],
        reference: "https://docs.databricks.com/aws/en/jobs/run-serverless-jobs",
        bodyChecks: [
          "## Eligibility is a release gate",
          "## Cost attribution needs new evidence",
          "## Recovery still needs an owner",
          "Pipeline Recovery Planner](/tools/pipeline-recovery-planner)",
        ],
      },
    ] as const;

    for (const expectedPost of expectedPosts) {
      const post = posts.find((item) => item.slug === expectedPost.slug);
      expect(post).toBeDefined();
      expect(post?.title).toBe(expectedPost.title);
      expect(post?.date).toBe("2026-06-04");
      expect(post?.updatedAt).toBe("2026-06-04");
      expect(post?.readingTime).toBe(expectedPost.readingTime);
      expect(post?.coverImageUrl).toBe(expectedPost.coverImageUrl);
      expect(
        existsSync(new URL(`../../public${expectedPost.coverImageUrl}`, import.meta.url)),
      ).toBe(true);
      expect(post?.coverImageAlt).toBeTruthy();
      expect(post?.seoTitle).toBeTruthy();
      expect(post?.seoDescription).toBeTruthy();
      expect(post?.bodyMarkdown).toContain("## References");
      expect(post?.bodyMarkdown).toContain(expectedPost.reference);
      expect(post?.bodyMarkdown).toContain("## Disclosure");
      expect(post?.bodyMarkdown).toContain("co-written with an AI agent");
      expect(post?.relatedToolCtas?.[0]?.slug).toBe(expectedPost.primaryCtaSlug);
      expect(post?.relatedToolCtas?.[0]?.variant).toBe("primary");
      expect(post?.relatedToolCtas?.slice(1).map((cta) => cta.slug)).toEqual(
        expectedPost.secondaryCtaSlugs,
      );

      for (const bodyCheck of expectedPost.bodyChecks) {
        expect(post?.bodyMarkdown).toContain(bodyCheck);
      }
    }
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
