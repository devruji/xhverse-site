import { describe, expect, it } from "vitest";
import {
  egressPriceCards,
  PRICING_LAST_CHECKED,
  providerMetadata,
  regionOptions,
  routeDirectionLabels,
  scenarioLabels,
} from "./pricing";

describe("egress pricing metadata", () => {
  it("uses the current verified pricing date", () => {
    expect(PRICING_LAST_CHECKED).toBe("2026-06-27");
  });

  it("supports only AWS, Google Cloud, and Azure", () => {
    expect(Object.keys(providerMetadata)).toEqual(["aws", "google-cloud", "azure"]);

    for (const provider of Object.values(providerMetadata)) {
      expect(provider.label).toBeTruthy();
      expect(provider.shortLabel).toBeTruthy();
      expect(provider.pricingUrl).toMatch(/^https:\/\//);
      expect(provider.estimatorUrl).toMatch(/^https:\/\//);
    }
  });

  it("labels all supported scenarios and route directions", () => {
    expect(scenarioLabels).toEqual({
      "internet-egress": "Public internet egress",
      "external-cloud": "External cloud",
      "same-cloud-same-account": "Same cloud, same account",
      "same-cloud-different-account": "Same cloud, different account",
    });
    expect(routeDirectionLabels["thailand-to-singapore"]).toBe("Thailand to Singapore");
    expect(routeDirectionLabels["singapore-to-thailand"]).toBe("Singapore to Thailand");
  });
});

describe("regionOptions", () => {
  it("defines Thailand and Singapore options for each provider", () => {
    for (const provider of ["aws", "google-cloud", "azure"] as const) {
      const providerRegions = regionOptions.filter((region) => region.provider === provider);
      expect(providerRegions.map((region) => region.country).sort()).toEqual([
        "singapore",
        "thailand",
      ]);
    }
  });

  it("marks Azure Thailand as unavailable instead of mapping it to Singapore", () => {
    const azureThailand = regionOptions.find((region) => region.id === "azure-thailand");
    expect(azureThailand).toMatchObject({
      provider: "azure",
      country: "thailand",
      available: false,
      regionCode: "thailandsouth",
    });
    expect(azureThailand?.unavailableReason).toContain("does not expose active");
  });

  it("keeps available region IDs unique and reference-backed", () => {
    const ids = regionOptions.map((region) => region.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const region of regionOptions) {
      expect(region.referenceUrl).toMatch(/^https:\/\//);
      expect(region.label).toBeTruthy();
      expect(region.regionCode).toBeTruthy();
    }
  });
});

describe("egressPriceCards", () => {
  it("has source-backed pricing cards with valid tiers", () => {
    for (const card of egressPriceCards) {
      expect(card.pricingUrl).toMatch(/^https:\/\//);
      expect(card.estimatorUrl).toMatch(/^https:\/\//);
      expect(card.sourceUrl).toMatch(/^https:\/\//);
      expect(card.sourceCheckedAt).toBe(PRICING_LAST_CHECKED);
      expect(card.tiers.length).toBeGreaterThan(0);

      for (const tier of card.tiers) {
        expect(tier.start).toBeGreaterThanOrEqual(0);
        expect(tier.unitPriceUsd).toBeGreaterThanOrEqual(0);
        expect(tier.unit).toBe(card.billingUnit);
        expect(tier.label).toBeTruthy();
      }
    }
  });

  it("keeps tier boundaries sorted and contiguous", () => {
    for (const card of egressPriceCards) {
      for (let index = 1; index < card.tiers.length; index += 1) {
        expect(card.tiers[index].start).toBe(card.tiers[index - 1].end);
      }
      expect(card.tiers.at(-1)?.end).toBe("Infinity");
    }
  });

  it("does not include a calculable Azure Thailand pricing card", () => {
    expect(
      egressPriceCards.some(
        (card) => card.provider === "azure" && card.sourceCountry === "thailand",
      ),
    ).toBe(false);
  });

  it("separates internet and same-cloud regional pricing", () => {
    const internetCards = egressPriceCards.filter((card) => card.scenario === "internet");
    const sameCloudCards = egressPriceCards.filter(
      (card) => card.scenario === "same-cloud-region",
    );

    expect(internetCards).toHaveLength(5);
    expect(sameCloudCards).toHaveLength(4);
    expect(sameCloudCards.every((card) => card.freeAllowance === null)).toBe(true);
  });
});
