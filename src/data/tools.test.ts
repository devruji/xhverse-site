import { describe, expect, it } from "vitest";
import {
  featuredToolSlugs,
  featuredTools,
  liveToolCount,
  toolCatalog,
  toolDefinitions,
} from "./tools";

describe("tools data", () => {
  it("exports the full live tool catalog", () => {
    expect(liveToolCount).toBe(14);
    expect(toolCatalog).toHaveLength(liveToolCount);
  });

  it("keeps slugs unique and href-safe", () => {
    const slugs = toolCatalog.map((tool) => tool.slug);

    expect(new Set(slugs).size).toBe(toolCatalog.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(toolDefinitions[slug as keyof typeof toolDefinitions].slug).toBe(slug);
    }
  });

  it("defines the newest decision tools as featured tools", () => {
    expect(featuredToolSlugs).toEqual([
      "workload-placement-simulator",
      "data-product-contract-builder",
      "access-model-simulator",
      "lakehouse-table-layout-advisor",
      "power-bi-semantic-model-doctor",
      "pipeline-recovery-planner",
    ]);

    expect(featuredTools).toHaveLength(6);
    for (const tool of featuredTools) {
      expect(tool.status).toBe("New");
      expect(tool.homeLabel).toBeTruthy();
    }
  });

  it("sorts the catalog newest first by release date", () => {
    expect(toolCatalog.map((tool) => tool.slug).slice(0, 6)).toEqual([
      "workload-placement-simulator",
      "data-product-contract-builder",
      "access-model-simulator",
      "lakehouse-table-layout-advisor",
      "power-bi-semantic-model-doctor",
      "pipeline-recovery-planner",
    ]);

    for (let index = 1; index < toolCatalog.length; index += 1) {
      expect(toolCatalog[index - 1].releasedAt >= toolCatalog[index].releasedAt).toBe(
        true,
      );
    }
  });

  it("keeps catalog cards useful without placeholder text", () => {
    for (const tool of toolCatalog) {
      expect(tool.title.length).toBeGreaterThan(5);
      expect(tool.description.length).toBeGreaterThan(60);
      expect(tool.description).not.toMatch(/todo|tbd|lorem/i);
      expect(tool.category).toBeTruthy();
    }
  });
});
