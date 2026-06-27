import { describe, expect, it } from "vitest";
import {
  buildEstimateBrief,
  calculateEgressEstimates,
  convertBytesToBillingQuantity,
  formatTraffic,
  getTrafficBytes,
  type EgressCalculatorInput,
} from "./calculator";

const baseInput: EgressCalculatorInput = {
  scenario: "internet-egress",
  provider: "all",
  sourceCountry: "thailand",
  routeDirection: "thailand-to-singapore",
  destinationProvider: "aws",
  transferAmount: 5,
  transferUnit: "TB",
  applyFreeAllowance: true,
};

describe("traffic conversion", () => {
  it("converts known monthly transfer using decimal GB/TB", () => {
    expect(getTrafficBytes({ ...baseInput, transferAmount: 1, transferUnit: "GB" })).toBe(
      1_000_000_000,
    );
    expect(getTrafficBytes({ ...baseInput, transferAmount: 1, transferUnit: "TB" })).toBe(
      1_000_000_000_000,
    );
  });

  it("converts bytes into provider billing units", () => {
    expect(convertBytesToBillingQuantity(1_000_000_000, "GB")).toBe(1);
    expect(convertBytesToBillingQuantity(1_073_741_824, "GiB")).toBe(1);
  });

  it("formats traffic as GB or TB", () => {
    expect(formatTraffic(950_000_000_000)).toBe("950 GB");
    expect(formatTraffic(1_500_000_000_000)).toBe("1.5 TB");
  });
});

describe("calculateEgressEstimates for public internet egress", () => {
  it("calculates Thailand-source estimates and marks Azure unavailable", () => {
    const result = calculateEgressEstimates(baseInput);

    expect(result.estimates.map((estimate) => estimate.provider)).toEqual([
      "aws",
      "google-cloud",
    ]);
    expect(result.unavailable).toHaveLength(1);
    expect(result.unavailable[0].provider).toBe("azure");
    expect(result.unavailable[0].unavailableReason).toContain("Azure Thailand South");
    expect(result.lowestEstimate?.netCostUsd).toBeLessThanOrEqual(
      result.highestEstimate?.netCostUsd ?? Number.POSITIVE_INFINITY,
    );
    expect(result.spreadUsd).toBeGreaterThan(0);
  });

  it("calculates all Singapore-source providers", () => {
    const result = calculateEgressEstimates({
      ...baseInput,
      sourceCountry: "singapore",
      transferAmount: 1,
    });

    expect(result.estimates.map((estimate) => estimate.provider)).toEqual([
      "aws",
      "google-cloud",
      "azure",
    ]);
    expect(result.unavailable).toHaveLength(0);
    expect(result.highestEstimate?.netCostUsd).toBeGreaterThanOrEqual(
      result.lowestEstimate?.netCostUsd ?? 0,
    );
  });

  it("applies and excludes free allowance explicitly", () => {
    const withFree = calculateEgressEstimates({
      ...baseInput,
      provider: "aws",
      transferAmount: 100,
      transferUnit: "GB",
      applyFreeAllowance: true,
    }).estimates[0];
    const withoutFree = calculateEgressEstimates({
      ...baseInput,
      provider: "aws",
      transferAmount: 100,
      transferUnit: "GB",
      applyFreeAllowance: false,
    }).estimates[0];

    expect(withFree.netCostUsd).toBe(0);
    expect(withFree.freeAllowanceQuantity).toBe(100);
    expect(withoutFree.netCostUsd).toBeCloseTo(10.8, 2);
    expect(withoutFree.grossCostUsd).toBeCloseTo(10.8, 2);
  });

  it("crosses multiple provider tiers", () => {
    const estimate = calculateEgressEstimates({
      ...baseInput,
      provider: "aws",
      sourceCountry: "singapore",
      transferAmount: 60,
      transferUnit: "TB",
      applyFreeAllowance: false,
    }).estimates[0];

    expect(estimate.tierCharges).toHaveLength(3);
    expect(estimate.netCostUsd).toBeCloseTo(
      10240 * 0.12 + (51200 - 10240) * 0.085 + (60000 - 51200) * 0.082,
      2,
    );
  });

  it("handles over-final-tier traffic", () => {
    const estimate = calculateEgressEstimates({
      ...baseInput,
      provider: "azure",
      sourceCountry: "singapore",
      transferAmount: 200,
      transferUnit: "TB",
      applyFreeAllowance: false,
    }).estimates[0];

    expect(estimate.tierCharges.at(-1)?.label).toContain("Next 350 TB");
    expect(estimate.netCostUsd).toBeGreaterThan(0);
  });

  it("returns zero-cost estimates for zero traffic", () => {
    const result = calculateEgressEstimates({
      ...baseInput,
      provider: "google-cloud",
      transferAmount: 0,
    });

    expect(result.lowestEstimate?.netCostUsd).toBe(0);
    expect(result.highestEstimate?.netCostUsd).toBe(0);
    expect(result.estimates[0].effectiveRateUsd).toBe(0);
    expect(result.estimates[0].tierCharges).toHaveLength(0);
  });
});

describe("calculateEgressEstimates for external cloud", () => {
  it("excludes the destination provider from source egress estimates", () => {
    const result = calculateEgressEstimates({
      ...baseInput,
      scenario: "external-cloud",
      destinationProvider: "aws",
      sourceCountry: "singapore",
    });

    expect(result.estimates.map((estimate) => estimate.provider)).toEqual([
      "google-cloud",
      "azure",
    ]);
    expect(result.estimates[0].destinationLabel).toContain("AWS");
    expect(result.estimates[0].notes.join(" ")).toContain("Destination cloud ingress");
  });
});

describe("calculateEgressEstimates for same-cloud regional transfer", () => {
  it("calculates Thailand to Singapore for same account", () => {
    const result = calculateEgressEstimates({
      ...baseInput,
      scenario: "same-cloud-same-account",
      provider: "all",
      routeDirection: "thailand-to-singapore",
      applyFreeAllowance: true,
    });

    expect(result.estimates.map((estimate) => estimate.provider)).toEqual([
      "aws",
      "google-cloud",
    ]);
    expect(result.estimates[0].destinationLabel).toContain("same account");
    expect(result.estimates[0].notes.join(" ")).toContain(
      "same public inter-region egress rate",
    );
    expect(result.estimates[0].freeAllowanceQuantity).toBe(0);
    expect(result.unavailable[0].provider).toBe("azure");
  });

  it("calculates Singapore to Thailand for different account and labels the boundary", () => {
    const result = calculateEgressEstimates({
      ...baseInput,
      scenario: "same-cloud-different-account",
      provider: "google-cloud",
      routeDirection: "singapore-to-thailand",
      applyFreeAllowance: false,
    });

    expect(result.estimates).toHaveLength(1);
    expect(result.estimates[0].sourceRegionCode).toBe("asia-southeast1");
    expect(result.estimates[0].destinationLabel).toContain("different account");
    expect(result.estimates[0].notes.join(" ")).toContain(
      "same public inter-region egress rate",
    );
    expect(result.estimates[0].notes.join(" ")).toContain("Different-account ownership");
    expect(result.unavailable).toHaveLength(0);
  });

  it("returns only unavailable state when Azure same-cloud regional mode is selected", () => {
    const result = calculateEgressEstimates({
      ...baseInput,
      scenario: "same-cloud-same-account",
      provider: "azure",
    });

    expect(result.estimates).toHaveLength(0);
    expect(result.lowestEstimate).toBeNull();
    expect(result.highestEstimate).toBeNull();
    expect(result.spreadUsd).toBe(0);
    expect(result.unavailable[0].unavailableReason).toContain("no calculable");
  });
});

describe("buildEstimateBrief", () => {
  it("includes scenario, estimates, unavailable states, boundaries, and source links", () => {
    const result = calculateEgressEstimates(baseInput);
    const brief = buildEstimateBrief(result);

    expect(brief).toContain("Cloud Egress Pricing Estimate");
    expect(brief).toContain("Public internet egress");
    expect(brief).toContain("AWS");
    expect(brief).toContain("GCP");
    expect(brief).toContain("Azure: unavailable");
    expect(brief).toContain("Provider calculators remain authoritative");
    expect(brief).toContain("https://aws.amazon.com");
  });

  it("records when free allowance is disabled", () => {
    const result = calculateEgressEstimates({
      ...baseInput,
      applyFreeAllowance: false,
    });
    const brief = buildEstimateBrief(result);

    expect(brief).toContain("Free allowance applied: No");
  });
});
