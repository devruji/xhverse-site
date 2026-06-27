import {
  egressPriceCards,
  providerMetadata,
  regionOptions,
  routeDirectionLabels,
  scenarioLabels,
  type BillingUnit,
  type CountryId,
  type EgressPriceCard,
  type EgressTier,
  type ProviderId,
  type RouteDirection,
  type TransferScenario,
} from "./pricing";

export type TrafficUnit = "GB" | "TB";
export type ProviderSelection = ProviderId | "all";

export type EgressCalculatorInput = {
  scenario: TransferScenario;
  provider: ProviderSelection;
  sourceCountry: CountryId;
  routeDirection: RouteDirection;
  destinationProvider: ProviderId;
  transferAmount: number;
  transferUnit: TrafficUnit;
  applyFreeAllowance: boolean;
};

export type TierCharge = {
  label: string;
  quantity: number;
  unit: BillingUnit;
  unitPriceUsd: number;
  costUsd: number;
};

export type EgressEstimate = {
  id: string;
  provider: ProviderId;
  providerLabel: string;
  sourceRegionLabel: string;
  sourceRegionCode: string;
  destinationLabel: string;
  scenario: TransferScenario;
  scenarioLabel: string;
  pricingBasis: string;
  billingUnit: BillingUnit;
  rawTransferBytes: number;
  rawTransferDisplay: string;
  grossBillableQuantity: number;
  freeAllowanceQuantity: number;
  billableQuantity: number;
  grossCostUsd: number;
  netCostUsd: number;
  effectiveRateUsd: number;
  tierCharges: TierCharge[];
  pricingUrl: string;
  estimatorUrl: string;
  sourceUrl: string;
  sourceCheckedAt: string;
  notes: string[];
  unavailableReason: string | null;
};

export type EgressCalculatorResult = {
  input: EgressCalculatorInput;
  rawTransferBytes: number;
  estimates: EgressEstimate[];
  unavailable: EgressEstimate[];
  lowestEstimate: EgressEstimate | null;
  highestEstimate: EgressEstimate | null;
  spreadUsd: number;
};

const BYTES_PER_DECIMAL_GB = 1_000_000_000;
const BYTES_PER_BINARY_GIB = 1_073_741_824;

function isSameCloudScenario(scenario: TransferScenario): boolean {
  return (
    scenario === "same-cloud-same-account" ||
    scenario === "same-cloud-different-account"
  );
}

export function getTrafficBytes(input: EgressCalculatorInput): number {
  const amount = Math.max(0, input.transferAmount);
  return input.transferUnit === "TB"
    ? amount * 1000 * BYTES_PER_DECIMAL_GB
    : amount * BYTES_PER_DECIMAL_GB;
}

export function convertBytesToBillingQuantity(
  bytes: number,
  unit: BillingUnit,
): number {
  return bytes / (unit === "GiB" ? BYTES_PER_BINARY_GIB : BYTES_PER_DECIMAL_GB);
}

export function formatTraffic(bytes: number): string {
  const gb = bytes / BYTES_PER_DECIMAL_GB;
  if (gb >= 1000) {
    return `${(gb / 1000).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })} TB`;
  }

  return `${gb.toLocaleString("en-US", { maximumFractionDigits: 2 })} GB`;
}

function getRegionLabel(regionId: string): string {
  const region = regionOptions.find((option) => option.id === regionId)!;
  return `${region.label} (${region.regionCode})`;
}

function getRegionCode(regionId: string): string {
  const region = regionOptions.find((option) => option.id === regionId)!;
  return region.regionCode;
}

function getSameCloudDestinationLabel(
  provider: ProviderId,
  routeDirection: RouteDirection,
): string {
  const targetCountry =
    routeDirection === "thailand-to-singapore" ? "singapore" : "thailand";
  const region = regionOptions.find(
    (option) => option.provider === provider && option.country === targetCountry,
  )!;
  return `${region.label} (${region.regionCode})`;
}

function getDestinationLabel(
  input: EgressCalculatorInput,
  card: EgressPriceCard,
): string {
  if (input.scenario === "internet-egress") {
    return "public internet endpoint";
  }

  if (input.scenario === "external-cloud") {
    return `${providerMetadata[input.destinationProvider].shortLabel} over public internet`;
  }

  const accountBoundary =
    input.scenario === "same-cloud-same-account"
      ? "same account"
      : "different account";
  return `${getSameCloudDestinationLabel(card.provider, input.routeDirection)} (${accountBoundary})`;
}

function getScenarioCards(input: EgressCalculatorInput): EgressPriceCard[] {
  const scenario = isSameCloudScenario(input.scenario)
    ? "same-cloud-region"
    : "internet";
  const sourceCountry = isSameCloudScenario(input.scenario)
    ? input.routeDirection === "thailand-to-singapore"
      ? "thailand"
      : "singapore"
    : input.sourceCountry;

  return egressPriceCards.filter((card) => {
    const providerMatches = input.provider === "all" || input.provider === card.provider;
    const scenarioMatches = card.scenario === scenario;
    const countryMatches = card.sourceCountry === sourceCountry;
    const destinationMatches =
      input.scenario !== "external-cloud" || card.provider !== input.destinationProvider;

    return providerMatches && scenarioMatches && countryMatches && destinationMatches;
  });
}

function calculateTierCharges(
  billableQuantity: number,
  tiers: EgressTier[],
): TierCharge[] {
  const charges: TierCharge[] = [];

  for (const tier of tiers) {
    const tierEnd = tier.end === "Infinity" ? Number.POSITIVE_INFINITY : tier.end;
    const quantity = Math.max(
      0,
      Math.min(billableQuantity, tierEnd) - tier.start,
    );

    if (quantity > 0) {
      charges.push({
        label: tier.label,
        quantity,
        unit: tier.unit,
        unitPriceUsd: tier.unitPriceUsd,
        costUsd: quantity * tier.unitPriceUsd,
      });
    }
  }

  return charges;
}

function buildEstimate(
  input: EgressCalculatorInput,
  card: EgressPriceCard,
  rawTransferBytes: number,
): EgressEstimate {
  const grossBillableQuantity = convertBytesToBillingQuantity(
    rawTransferBytes,
    card.billingUnit,
  );
  const freeAllowanceQuantity =
    input.applyFreeAllowance && card.freeAllowance
      ? Math.min(grossBillableQuantity, card.freeAllowance.amount)
      : 0;
  const billableQuantity = Math.max(0, grossBillableQuantity - freeAllowanceQuantity);
  const tierCharges = calculateTierCharges(billableQuantity, card.tiers);
  const netCostUsd = tierCharges.reduce((total, charge) => total + charge.costUsd, 0);
  const grossCostUsd = calculateTierCharges(grossBillableQuantity, card.tiers).reduce(
    (total, charge) => total + charge.costUsd,
    0,
  );

  return {
    id: `${input.scenario}-${card.id}`,
    provider: card.provider,
    providerLabel: providerMetadata[card.provider].shortLabel,
    sourceRegionLabel: getRegionLabel(card.sourceRegionId),
    sourceRegionCode: getRegionCode(card.sourceRegionId),
    destinationLabel: getDestinationLabel(input, card),
    scenario: input.scenario,
    scenarioLabel: scenarioLabels[input.scenario],
    pricingBasis: card.pricingBasis,
    billingUnit: card.billingUnit,
    rawTransferBytes,
    rawTransferDisplay: formatTraffic(rawTransferBytes),
    grossBillableQuantity,
    freeAllowanceQuantity,
    billableQuantity,
    grossCostUsd,
    netCostUsd,
    effectiveRateUsd: grossBillableQuantity > 0 ? netCostUsd / grossBillableQuantity : 0,
    tierCharges,
    pricingUrl: card.pricingUrl,
    estimatorUrl: card.estimatorUrl,
    sourceUrl: card.sourceUrl,
    sourceCheckedAt: card.sourceCheckedAt,
    notes: buildNotes(input, card),
    unavailableReason: null,
  };
}

function buildNotes(
  input: EgressCalculatorInput,
  card: EgressPriceCard,
): string[] {
  const notes = [...card.notes];

  if (input.scenario === "external-cloud") {
    notes.push("Destination cloud ingress, processing, and private connectivity charges are excluded.");
  }

  if (isSameCloudScenario(input.scenario)) {
    notes.push("Same-account and different-account selections use the same public inter-region egress rate; the account boundary is shown for ownership, billing, and audit context.");
  }

  if (input.scenario === "same-cloud-different-account") {
    notes.push("Different-account ownership is labeled separately; this does not model peering, private links, or public-IP routing changes.");
  }

  if (card.freeAllowance && input.applyFreeAllowance) {
    notes.push(card.freeAllowance.scope);
  }

  return notes;
}

function buildUnavailableEstimate(
  input: EgressCalculatorInput,
  provider: ProviderId,
  reason: string,
  rawTransferBytes: number,
): EgressEstimate {
  return {
    id: `${input.scenario}-${provider}-unavailable`,
    provider,
    providerLabel: providerMetadata[provider].shortLabel,
    sourceRegionLabel: "Unavailable",
    sourceRegionCode: "n/a",
    destinationLabel: routeDirectionLabels[input.routeDirection],
    scenario: input.scenario,
    scenarioLabel: scenarioLabels[input.scenario],
    pricingBasis: "No supported Thailand/Singapore price path",
    billingUnit: "GB",
    rawTransferBytes,
    rawTransferDisplay: formatTraffic(rawTransferBytes),
    grossBillableQuantity: 0,
    freeAllowanceQuantity: 0,
    billableQuantity: 0,
    grossCostUsd: 0,
    netCostUsd: 0,
    effectiveRateUsd: 0,
    tierCharges: [],
    pricingUrl: providerMetadata[provider].pricingUrl,
    estimatorUrl: providerMetadata[provider].estimatorUrl,
    sourceUrl: providerMetadata[provider].pricingUrl,
    sourceCheckedAt: "2026-06-27",
    notes: [],
    unavailableReason: reason,
  };
}

function getUnavailableEstimates(
  input: EgressCalculatorInput,
  rawTransferBytes: number,
): EgressEstimate[] {
  if (!isSameCloudScenario(input.scenario)) {
    const azureThailandUnavailable =
      input.sourceCountry === "thailand" &&
      (input.provider === "all" || input.provider === "azure");

    return azureThailandUnavailable
      ? [
          buildUnavailableEstimate(
            input,
            "azure",
            "Azure Thailand South is announced but not available in current bandwidth pricing, so this tool does not map it to Singapore or generic Asia pricing.",
            rawTransferBytes,
          ),
        ]
      : [];
  }

  const includeAzure = input.provider === "all" || input.provider === "azure";
  return includeAzure
    ? [
        buildUnavailableEstimate(
          input,
          "azure",
          "Azure has no calculable Thailand/Singapore same-cloud regional path until Thailand South is active and priced.",
          rawTransferBytes,
        ),
      ]
    : [];
}

export function calculateEgressEstimates(
  input: EgressCalculatorInput,
): EgressCalculatorResult {
  const rawTransferBytes = getTrafficBytes(input);
  const estimates = getScenarioCards(input).map((card) =>
    buildEstimate(input, card, rawTransferBytes),
  );
  const unavailable = getUnavailableEstimates(input, rawTransferBytes);
  const sorted = [...estimates].sort((left, right) => left.netCostUsd - right.netCostUsd);
  const lowestEstimate = sorted[0] ?? null;
  const highestEstimate = sorted[sorted.length - 1] ?? null;
  const spreadUsd =
    lowestEstimate && highestEstimate
      ? highestEstimate.netCostUsd - lowestEstimate.netCostUsd
      : 0;

  return {
    input,
    rawTransferBytes,
    estimates,
    unavailable,
    lowestEstimate,
    highestEstimate,
    spreadUsd,
  };
}

export function buildEstimateBrief(result: EgressCalculatorResult): string {
  const lines = [
    "=== Cloud Egress Pricing Estimate ===",
    "",
    `Scenario: ${scenarioLabels[result.input.scenario]}`,
    `Transfer: ${formatTraffic(result.rawTransferBytes)}`,
    `Free allowance applied: ${result.input.applyFreeAllowance ? "Yes" : "No"}`,
    "",
    "--- Estimates ---",
    ...result.estimates.map(
      (estimate) =>
        `${estimate.providerLabel} | ${estimate.sourceRegionLabel} -> ${estimate.destinationLabel}: $${estimate.netCostUsd.toFixed(2)} (${estimate.billableQuantity.toFixed(2)} ${estimate.billingUnit} billable)`,
    ),
    ...result.unavailable.map(
      (estimate) => `${estimate.providerLabel}: unavailable - ${estimate.unavailableReason}`,
    ),
    "",
    "--- Boundaries ---",
    "Directional public list-price estimate only. Provider calculators remain authoritative.",
    "Excludes CDN, NAT, load balancer processing, private connectivity, storage/API requests, taxes, discounts, credits, and currency conversion.",
    "",
    "--- Official sources ---",
    ...result.estimates.map(
      (estimate) =>
        `${estimate.providerLabel}: ${estimate.pricingUrl} | estimator: ${estimate.estimatorUrl}`,
    ),
  ];

  return lines.join("\n");
}
