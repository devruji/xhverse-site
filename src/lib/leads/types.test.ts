import { describe, expect, it } from "vitest";
import { leadSources, leadStatuses, sourceLabels, statusLabels } from "./types";

describe("leadSources", () => {
  it("contains all expected source values", () => {
    expect(leadSources).toEqual(["cv_request", "maturity_tool", "governance_tool", "contact_form"]);
  });
});

describe("leadStatuses", () => {
  it("contains all expected status values", () => {
    expect(leadStatuses).toEqual(["new", "contacted", "converted", "archived"]);
  });
});

describe("sourceLabels", () => {
  it("maps every source to a display label", () => {
    for (const source of leadSources) {
      expect(sourceLabels[source]).toBeDefined();
      expect(typeof sourceLabels[source]).toBe("string");
    }
  });

  it("returns expected labels", () => {
    expect(sourceLabels.cv_request).toBe("CV Request");
    expect(sourceLabels.maturity_tool).toBe("Maturity Tool");
    expect(sourceLabels.governance_tool).toBe("Governance Tool");
    expect(sourceLabels.contact_form).toBe("Contact Form");
  });
});

describe("statusLabels", () => {
  it("maps every status to a display label", () => {
    for (const status of leadStatuses) {
      expect(statusLabels[status]).toBeDefined();
      expect(typeof statusLabels[status]).toBe("string");
    }
  });

  it("returns expected labels", () => {
    expect(statusLabels.new).toBe("New");
    expect(statusLabels.contacted).toBe("Contacted");
    expect(statusLabels.converted).toBe("Converted");
    expect(statusLabels.archived).toBe("Archived");
  });
});
