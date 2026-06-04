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
    expect(liveToolCount).toBe(13);
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

  it("defines five new practitioner tools as featured tools", () => {
    expect(featuredToolSlugs).toEqual([
      "data-product-contract-builder",
      "access-model-simulator",
      "lakehouse-table-layout-advisor",
      "power-bi-semantic-model-doctor",
      "pipeline-recovery-planner",
    ]);

    expect(featuredTools).toHaveLength(5);
    for (const tool of featuredTools) {
      expect(tool.status).toBe("New");
      expect(tool.homeLabel).toBeTruthy();
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
