import { describe, expect, it } from "vitest";
import { createPublicationSnapshot } from "./publication";
import { posts } from "./blog";
import { buildStrategyPreview, findScenario } from "../lib/scd-design-lab/engine";
import { calculatePractitionerToolResult } from "../lib/practitioner-tools/engine";
import { getPractitionerToolDefinition } from "../lib/practitioner-tools/definitions";

const article = (slug: string, date: string) => ({ ...posts[0], slug, date });
describe("publication homepage content", () => {
  it("leads with new publications and keeps three distinct articles without mutating the collection", () => {
    const input = [article("older", "2025-01-01"), article("latest", "2026-10-14"), article("abac-row-filters-column-masks-production-ownership", "2026-01-01"), article("latest", "2026-10-14"), article("middle", "2026-09-01")];
    const before = [...input];
    expect(createPublicationSnapshot(input).articles.map((p) => p.slug)).toEqual(["latest", "middle", "abac-row-filters-column-masks-production-ownership"]);
    expect(input).toEqual(before);
  });
  it("preserves the resolved order for same-day publications", () => {
    expect(createPublicationSnapshot([article("later-today", "2026-10-14"), article("earlier-today", "2026-10-14")]).articles.map((p) => p.slug)).toEqual(["later-today", "earlier-today"]);
  });
  it("offers the full canonical catalog for discovery, with newest tools first for the static fallback", () => {
    const tools = createPublicationSnapshot([]).discoveryTools;
    expect(tools).toHaveLength(15);
    expect(tools.slice(0, 2).map((tool) => tool.slug)).toEqual(["egress-pricing-calculator", "workload-placement-simulator"]);
    expect(tools.some((tool) => tool.slug === "spark-explained")).toBe(true);
  });
  it("uses latest available content without injecting absent articles", () => {
    expect(createPublicationSnapshot([article("older", "2025-01-01"), article("latest", "2026-01-01")]).articles.map((p) => p.slug)).toEqual(["latest", "older"]);
    expect(createPublicationSnapshot([]).articles).toEqual([]);
  });
  it("keeps the displayed examples faithful to the real tool engines", () => {
    const snapshot = createPublicationSnapshot([]);
    const scd = buildStrategyPreview(findScenario("loyalty-tier-at-transaction-time"), "type_2");
    expect(scd.factImpact).toEqual([{ label: "Bronze", amount: 1000 }, { label: "Gold", amount: 1500 }]);
    expect(snapshot.tools[0].example.lines).toContain("Bronze revenue: 1,000");
    expect(snapshot.tools[0].example.lines).toContain("Gold revenue: 1,500");
    const definition = getPractitionerToolDefinition("pipeline-recovery-planner")!;
    const recovery = calculatePractitionerToolResult(definition, { "recovery-failure-mode": 3, "recovery-replay": 2, "recovery-idempotency": 2, "recovery-state": 1, "recovery-consumers": 3, "recovery-evidence": 2 });
    expect(snapshot.tools[1].example.lines).toEqual([`${recovery.score}/100 · ${recovery.tier.label}`, ...recovery.priorityActions.slice(0, 2)]);
  });
});
