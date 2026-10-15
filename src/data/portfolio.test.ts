import { describe, expect, it } from "vitest";
import type { BlogPost } from "./blog";
import { portfolioTopics, resolvePortfolioTopics, toolGroups } from "./portfolio";
import { toolCatalog, toolDefinitions } from "./tools";

function publishedPost(slug: string): BlogPost {
  return {
    slug,
    title: `Published ${slug}`,
    excerpt: "Article supplied by the authoritative build pool.",
    date: "2026-10-13",
    tags: [],
    mediumUrl: "",
    readingTime: "5 min read",
    bodyMarkdown: "Published article body.",
  };
}

describe("portfolio topics", () => {
  it("keeps the four approved tool and article pairings in reading order", () => {
    expect(
      portfolioTopics.map(({ id, number, toolSlug, articleSlug }) => ({
        id,
        number,
        toolSlug,
        articleSlug,
      })),
    ).toEqual([
      {
        id: "architecture",
        number: "01",
        toolSlug: "workload-placement-simulator",
        articleSlug: "data-product-as-platform-contract",
      },
      {
        id: "governance",
        number: "02",
        toolSlug: "access-model-simulator",
        articleSlug: "abac-row-filters-column-masks-production-ownership",
      },
      {
        id: "modeling",
        number: "03",
        toolSlug: "scd-design-lab",
        articleSlug: "big-table-vs-star-schema",
      },
      {
        id: "operations",
        number: "04",
        toolSlug: "pipeline-recovery-planner",
        articleSlug: "serverless-data-engineering-operating-model",
      },
    ]);
  });

  it("resolves original tools and articles from the supplied pool without mutating it", () => {
    const articles = portfolioTopics.map((topic) => publishedPost(topic.articleSlug));
    const pool = Object.freeze([publishedPost("unrelated-article"), ...articles.toReversed()]);
    const result = resolvePortfolioTopics(pool);

    expect(result).toHaveLength(4);
    for (const [index, resolved] of result.entries()) {
      expect(resolved.tool).toBe(toolDefinitions[portfolioTopics[index].toolSlug]);
      expect(resolved.article).toBe(articles[index]);
      expect(resolved.id).toBe(portfolioTopics[index].id);
      expect(resolved.title).toBe(portfolioTopics[index].title);
      expect(resolved.purpose).toBe(portfolioTopics[index].purpose);
    }
    expect(pool.map((post) => post.slug)).toEqual([
      "unrelated-article",
      ...articles.map((post) => post.slug).toReversed(),
    ]);
  });

  it("does not revive curated articles absent from an empty authoritative pool", () => {
    const result = resolvePortfolioTopics([]);

    expect(result.map((topic) => topic.article)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(result.map((topic) => topic.tool.slug)).toEqual(
      portfolioTopics.map((topic) => topic.toolSlug),
    );
  });

  it("omits unavailable links when only some curated posts are published", () => {
    const article = publishedPost(portfolioTopics[2].articleSlug);
    const result = resolvePortfolioTopics([article]);

    expect(result.map((topic) => topic.article)).toEqual([
      undefined,
      undefined,
      article,
      undefined,
    ]);
  });
});

describe("tool groups", () => {
  it("provides the six approved groups and tool order", () => {
    expect(
      toolGroups.map((group) => ({
        id: group.id,
        slugs: group.tools.map((tool) => tool.slug),
      })),
    ).toEqual([
      {
        id: "architecture",
        slugs: [
          "workload-placement-simulator",
          "lakehouse-table-layout-advisor",
          "data-product-contract-builder",
          "data-platform-maturity-checker",
        ],
      },
      { id: "governance", slugs: ["access-model-simulator", "governance-scorecard"] },
      { id: "modeling", slugs: ["scd-design-lab", "power-bi-semantic-model-doctor"] },
      { id: "operations", slugs: ["pipeline-recovery-planner"] },
      { id: "cost", slugs: ["egress-pricing-calculator", "lakehouse-cost-calculator"] },
      {
        id: "practice",
        slugs: ["spark-explained", "sql-deathmatch", "architecture-roulette", "data-stack-roast"],
      },
    ]);
  });

  it("includes every catalog tool exactly once with its original metadata", () => {
    const tools = toolGroups.flatMap((group) => group.tools);
    const slugs = tools.map((tool) => tool.slug);

    expect(tools).toHaveLength(toolCatalog.length);
    expect(new Set(slugs).size).toBe(toolCatalog.length);
    expect(slugs.toSorted()).toEqual(toolCatalog.map((tool) => tool.slug).toSorted());
    for (const tool of toolCatalog) {
      expect(tools.find((entry) => entry.slug === tool.slug)).toBe(tool);
    }
    for (const group of toolGroups) {
      expect(group.title).toBeTruthy();
      expect(group.description).toBeTruthy();
    }
  });
});
