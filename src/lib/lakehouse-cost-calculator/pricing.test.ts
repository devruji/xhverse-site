import { describe, expect, it } from "vitest";
import {
  nodeTypes,
  nodeCategoryLabels,
  pricingTiers,
  PRICING_LAST_UPDATED,
  SPOT_DISCOUNT,
  workloadTypeLabels,
} from "./pricing";

describe("pricing constants", () => {
  it("SPOT_DISCOUNT is between 0 and 1", () => {
    expect(SPOT_DISCOUNT).toBeGreaterThan(0);
    expect(SPOT_DISCOUNT).toBeLessThan(1);
  });

  it("PRICING_LAST_UPDATED is a non-empty string", () => {
    expect(PRICING_LAST_UPDATED.length).toBeGreaterThan(0);
  });
});

describe("nodeTypes", () => {
  it("all nodes have positive dbuPerHour", () => {
    for (const node of nodeTypes) {
      expect(node.dbuPerHour).toBeGreaterThan(0);
    }
  });

  it("all nodes have positive vmCostPerHour", () => {
    for (const node of nodeTypes) {
      expect(node.vmCostPerHour).toBeGreaterThan(0);
    }
  });

  it("node IDs are unique", () => {
    const ids = nodeTypes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all nodes have a valid category", () => {
    const validCategories = Object.keys(nodeCategoryLabels);
    for (const node of nodeTypes) {
      expect(validCategories).toContain(node.category);
    }
  });

  it("contains at least one node per category", () => {
    const categories = new Set(nodeTypes.map((n) => n.category));
    expect(categories.size).toBe(3);
    expect(categories.has("general_purpose")).toBe(true);
    expect(categories.has("memory_optimized")).toBe(true);
    expect(categories.has("compute_optimized")).toBe(true);
  });
});

describe("pricingTiers", () => {
  it("covers all 3 workload types", () => {
    const types = pricingTiers.map((t) => t.workloadType);
    expect(types).toContain("jobs");
    expect(types).toContain("all_purpose");
    expect(types).toContain("sql_warehouse");
  });

  it("all tiers have positive dbuPricePerUnit", () => {
    for (const tier of pricingTiers) {
      expect(tier.dbuPricePerUnit).toBeGreaterThan(0);
    }
  });

  it("jobs tier is cheapest per DBU", () => {
    const jobsTier = pricingTiers.find((t) => t.workloadType === "jobs")!;
    for (const tier of pricingTiers) {
      expect(jobsTier.dbuPricePerUnit).toBeLessThanOrEqual(
        tier.dbuPricePerUnit,
      );
    }
  });
});

describe("label maps", () => {
  it("nodeCategoryLabels covers all categories", () => {
    expect(Object.keys(nodeCategoryLabels)).toHaveLength(3);
    expect(nodeCategoryLabels.general_purpose).toBe("General Purpose");
    expect(nodeCategoryLabels.memory_optimized).toBe("Memory Optimized");
    expect(nodeCategoryLabels.compute_optimized).toBe("Compute Optimized");
  });

  it("workloadTypeLabels covers all workload types", () => {
    expect(Object.keys(workloadTypeLabels)).toHaveLength(3);
    expect(workloadTypeLabels.jobs).toBe("Jobs Compute");
    expect(workloadTypeLabels.all_purpose).toBe("All-Purpose Compute");
    expect(workloadTypeLabels.sql_warehouse).toBe("SQL Warehouse");
  });
});
