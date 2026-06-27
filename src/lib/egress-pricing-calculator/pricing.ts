export type ProviderId = "aws" | "google-cloud" | "azure";
export type CountryId = "thailand" | "singapore";
export type BillingUnit = "GB" | "GiB";

export type TransferScenario =
  | "internet-egress"
  | "external-cloud"
  | "same-cloud-same-account"
  | "same-cloud-different-account";

export type RouteDirection = "thailand-to-singapore" | "singapore-to-thailand";

export type ProviderMetadata = {
  id: ProviderId;
  label: string;
  shortLabel: string;
  pricingUrl: string;
  estimatorUrl: string;
};

export type RegionAvailability = {
  id: string;
  provider: ProviderId;
  country: CountryId;
  label: string;
  regionCode: string;
  available: boolean;
  referenceUrl: string;
  unavailableReason?: string;
};

export type EgressTier = {
  start: number;
  end: number | "Infinity";
  unitPriceUsd: number;
  unit: BillingUnit;
  label: string;
};

export type FreeAllowance = {
  amount: number;
  unit: BillingUnit;
  scope: string;
};

export type EgressPriceCard = {
  id: string;
  provider: ProviderId;
  sourceRegionId: string;
  sourceCountry: CountryId;
  scenario: "internet" | "same-cloud-region";
  billingUnit: BillingUnit;
  pricingBasis: string;
  freeAllowance: FreeAllowance | null;
  tiers: EgressTier[];
  pricingUrl: string;
  estimatorUrl: string;
  sourceUrl: string;
  sourceCheckedAt: string;
  notes: string[];
};

export const PRICING_LAST_CHECKED = "2026-06-27";

export const providerMetadata: Record<ProviderId, ProviderMetadata> = {
  aws: {
    id: "aws",
    label: "Amazon Web Services",
    shortLabel: "AWS",
    pricingUrl: "https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer",
    estimatorUrl: "https://calculator.aws/",
  },
  "google-cloud": {
    id: "google-cloud",
    label: "Google Cloud",
    shortLabel: "GCP",
    pricingUrl: "https://cloud.google.com/vpc/network-pricing",
    estimatorUrl: "https://cloud.google.com/products/calculator",
  },
  azure: {
    id: "azure",
    label: "Microsoft Azure",
    shortLabel: "Azure",
    pricingUrl: "https://azure.microsoft.com/en-us/pricing/details/bandwidth/",
    estimatorUrl: "https://azure.microsoft.com/en-us/pricing/calculator/",
  },
};

export const regionOptions: RegionAvailability[] = [
  {
    id: "aws-thailand",
    provider: "aws",
    country: "thailand",
    label: "Thailand",
    regionCode: "ap-southeast-7",
    available: true,
    referenceUrl: "https://docs.aws.amazon.com/general/latest/gr/rande.html",
  },
  {
    id: "aws-singapore",
    provider: "aws",
    country: "singapore",
    label: "Singapore",
    regionCode: "ap-southeast-1",
    available: true,
    referenceUrl: "https://docs.aws.amazon.com/general/latest/gr/rande.html",
  },
  {
    id: "gcp-thailand",
    provider: "google-cloud",
    country: "thailand",
    label: "Bangkok",
    regionCode: "asia-southeast3",
    available: true,
    referenceUrl: "https://cloud.google.com/vpc/network-pricing",
  },
  {
    id: "gcp-singapore",
    provider: "google-cloud",
    country: "singapore",
    label: "Singapore",
    regionCode: "asia-southeast1",
    available: true,
    referenceUrl: "https://cloud.google.com/vpc/network-pricing",
  },
  {
    id: "azure-thailand",
    provider: "azure",
    country: "thailand",
    label: "Thailand South",
    regionCode: "thailandsouth",
    available: false,
    referenceUrl: "https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/",
    unavailableReason:
      "Microsoft lists Thailand South as an announced/intended region, but current Azure retail pricing does not expose active Thailand bandwidth SKUs.",
  },
  {
    id: "azure-singapore",
    provider: "azure",
    country: "singapore",
    label: "Southeast Asia",
    regionCode: "southeastasia",
    available: true,
    referenceUrl: "https://azure.microsoft.com/en-us/pricing/details/bandwidth/",
  },
];

const awsInternetSingaporeTiers: EgressTier[] = [
  {
    start: 0,
    end: 10240,
    unitPriceUsd: 0.12,
    unit: "GB",
    label: "First 10 TB beyond the global free tier",
  },
  {
    start: 10240,
    end: 51200,
    unitPriceUsd: 0.085,
    unit: "GB",
    label: "Next 40 TB",
  },
  {
    start: 51200,
    end: 153600,
    unitPriceUsd: 0.082,
    unit: "GB",
    label: "Next 100 TB",
  },
  {
    start: 153600,
    end: "Infinity",
    unitPriceUsd: 0.08,
    unit: "GB",
    label: "Greater than 150 TB",
  },
];

const awsInternetThailandTiers: EgressTier[] = [
  {
    start: 0,
    end: 10240,
    unitPriceUsd: 0.108,
    unit: "GB",
    label: "First 10 TB beyond the global free tier",
  },
  {
    start: 10240,
    end: 51200,
    unitPriceUsd: 0.0765,
    unit: "GB",
    label: "Next 40 TB",
  },
  {
    start: 51200,
    end: 153600,
    unitPriceUsd: 0.0738,
    unit: "GB",
    label: "Next 100 TB",
  },
  {
    start: 153600,
    end: "Infinity",
    unitPriceUsd: 0.072,
    unit: "GB",
    label: "Greater than 150 TB",
  },
];

const googleInternetAsiaTiers: EgressTier[] = [
  {
    start: 0,
    end: 1024,
    unitPriceUsd: 0.12,
    unit: "GiB",
    label: "Up to 1 TiB after the 1 GiB free allowance",
  },
  {
    start: 1024,
    end: 10240,
    unitPriceUsd: 0.11,
    unit: "GiB",
    label: "1 TiB to 10 TiB",
  },
  {
    start: 10240,
    end: "Infinity",
    unitPriceUsd: 0.085,
    unit: "GiB",
    label: "Above 10 TiB",
  },
];

const azureInternetAsiaTiers: EgressTier[] = [
  {
    start: 0,
    end: 10000,
    unitPriceUsd: 0.12,
    unit: "GB",
    label: "Next 10 TB after the 100 GB free allowance",
  },
  {
    start: 10000,
    end: 50000,
    unitPriceUsd: 0.085,
    unit: "GB",
    label: "Next 40 TB",
  },
  {
    start: 50000,
    end: 150000,
    unitPriceUsd: 0.082,
    unit: "GB",
    label: "Next 100 TB",
  },
  {
    start: 150000,
    end: "Infinity",
    unitPriceUsd: 0.08,
    unit: "GB",
    label: "Next 350 TB and provider quote beyond 500 TB",
  },
];

const flatAwsInterRegionTiers: EgressTier[] = [
  {
    start: 0,
    end: "Infinity",
    unitPriceUsd: 0.08,
    unit: "GB",
    label: "Thailand/Singapore inter-region outbound",
  },
];

const flatGoogleInterRegionTiers: EgressTier[] = [
  {
    start: 0,
    end: "Infinity",
    unitPriceUsd: 0.08,
    unit: "GiB",
    label: "Bangkok/Singapore VM-to-VM inter-region outbound",
  },
];

export const egressPriceCards: EgressPriceCard[] = [
  {
    id: "aws-internet-thailand",
    provider: "aws",
    sourceRegionId: "aws-thailand",
    sourceCountry: "thailand",
    scenario: "internet",
    billingUnit: "GB",
    pricingBasis: "AWS Data Transfer Out to the Internet from Asia Pacific (Thailand)",
    freeAllowance: {
      amount: 100,
      unit: "GB",
      scope: "Account-wide global 100 GB/month transfer-out allowance outside China and GovCloud.",
    },
    tiers: awsInternetThailandTiers,
    pricingUrl: providerMetadata.aws.pricingUrl,
    estimatorUrl: providerMetadata.aws.estimatorUrl,
    sourceUrl:
      "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/ap-southeast-7/index.json",
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Source feed publication checked: 2026-06-25T16:57:19Z."],
  },
  {
    id: "aws-internet-singapore",
    provider: "aws",
    sourceRegionId: "aws-singapore",
    sourceCountry: "singapore",
    scenario: "internet",
    billingUnit: "GB",
    pricingBasis: "AWS Data Transfer Out to the Internet from Asia Pacific (Singapore)",
    freeAllowance: {
      amount: 100,
      unit: "GB",
      scope: "Account-wide global 100 GB/month transfer-out allowance outside China and GovCloud.",
    },
    tiers: awsInternetSingaporeTiers,
    pricingUrl: providerMetadata.aws.pricingUrl,
    estimatorUrl: providerMetadata.aws.estimatorUrl,
    sourceUrl:
      "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/ap-southeast-1/index.json",
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Source feed publication checked: 2026-06-25T16:57:19Z."],
  },
  {
    id: "gcp-internet-thailand",
    provider: "google-cloud",
    sourceRegionId: "gcp-thailand",
    sourceCountry: "thailand",
    scenario: "internet",
    billingUnit: "GiB",
    pricingBasis: "Google Cloud Premium Tier internet data transfer to Asia",
    freeAllowance: {
      amount: 1,
      unit: "GiB",
      scope: "Monthly Premium Tier internet transfer allowance in the selected destination group.",
    },
    tiers: googleInternetAsiaTiers,
    pricingUrl: providerMetadata["google-cloud"].pricingUrl,
    estimatorUrl: providerMetadata["google-cloud"].estimatorUrl,
    sourceUrl: providerMetadata["google-cloud"].pricingUrl,
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Premium Tier is the default network tier for Google Cloud data transfer."],
  },
  {
    id: "gcp-internet-singapore",
    provider: "google-cloud",
    sourceRegionId: "gcp-singapore",
    sourceCountry: "singapore",
    scenario: "internet",
    billingUnit: "GiB",
    pricingBasis: "Google Cloud Premium Tier internet data transfer to Asia",
    freeAllowance: {
      amount: 1,
      unit: "GiB",
      scope: "Monthly Premium Tier internet transfer allowance in the selected destination group.",
    },
    tiers: googleInternetAsiaTiers,
    pricingUrl: providerMetadata["google-cloud"].pricingUrl,
    estimatorUrl: providerMetadata["google-cloud"].estimatorUrl,
    sourceUrl: providerMetadata["google-cloud"].pricingUrl,
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Premium Tier is the default network tier for Google Cloud data transfer."],
  },
  {
    id: "azure-internet-singapore",
    provider: "azure",
    sourceRegionId: "azure-singapore",
    sourceCountry: "singapore",
    scenario: "internet",
    billingUnit: "GB",
    pricingBasis: "Azure Internet Egress routed via Microsoft Premium Global Network from Asia",
    freeAllowance: {
      amount: 100,
      unit: "GB",
      scope: "Azure first 100 GB/month internet egress allowance.",
    },
    tiers: azureInternetAsiaTiers,
    pricingUrl: providerMetadata.azure.pricingUrl,
    estimatorUrl: providerMetadata.azure.estimatorUrl,
    sourceUrl: providerMetadata.azure.pricingUrl,
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Azure states 1 TB = 1,000 GB on the bandwidth pricing page."],
  },
  {
    id: "aws-interregion-thailand",
    provider: "aws",
    sourceRegionId: "aws-thailand",
    sourceCountry: "thailand",
    scenario: "same-cloud-region",
    billingUnit: "GB",
    pricingBasis: "AWS inter-region outbound from Thailand to Singapore",
    freeAllowance: null,
    tiers: flatAwsInterRegionTiers,
    pricingUrl: providerMetadata.aws.pricingUrl,
    estimatorUrl: providerMetadata.aws.estimatorUrl,
    sourceUrl:
      "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/ap-southeast-7/index.json",
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Standard inter-region outbound only; S3 Transfer Acceleration rows are excluded."],
  },
  {
    id: "aws-interregion-singapore",
    provider: "aws",
    sourceRegionId: "aws-singapore",
    sourceCountry: "singapore",
    scenario: "same-cloud-region",
    billingUnit: "GB",
    pricingBasis: "AWS inter-region outbound from Singapore to Thailand",
    freeAllowance: null,
    tiers: flatAwsInterRegionTiers,
    pricingUrl: providerMetadata.aws.pricingUrl,
    estimatorUrl: providerMetadata.aws.estimatorUrl,
    sourceUrl:
      "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/ap-southeast-1/index.json",
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Standard inter-region outbound only; S3 Transfer Acceleration rows are excluded."],
  },
  {
    id: "gcp-interregion-thailand",
    provider: "google-cloud",
    sourceRegionId: "gcp-thailand",
    sourceCountry: "thailand",
    scenario: "same-cloud-region",
    billingUnit: "GiB",
    pricingBasis: "Google Cloud VM-to-VM inter-region outbound from Bangkok to Singapore",
    freeAllowance: null,
    tiers: flatGoogleInterRegionTiers,
    pricingUrl: providerMetadata["google-cloud"].pricingUrl,
    estimatorUrl: providerMetadata["google-cloud"].estimatorUrl,
    sourceUrl: providerMetadata["google-cloud"].pricingUrl,
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Google Cloud attributes VM-to-VM inter-region cost to the sending project."],
  },
  {
    id: "gcp-interregion-singapore",
    provider: "google-cloud",
    sourceRegionId: "gcp-singapore",
    sourceCountry: "singapore",
    scenario: "same-cloud-region",
    billingUnit: "GiB",
    pricingBasis: "Google Cloud VM-to-VM inter-region outbound from Singapore to Bangkok",
    freeAllowance: null,
    tiers: flatGoogleInterRegionTiers,
    pricingUrl: providerMetadata["google-cloud"].pricingUrl,
    estimatorUrl: providerMetadata["google-cloud"].estimatorUrl,
    sourceUrl: providerMetadata["google-cloud"].pricingUrl,
    sourceCheckedAt: PRICING_LAST_CHECKED,
    notes: ["Google Cloud attributes VM-to-VM inter-region cost to the sending project."],
  },
];

export const scenarioLabels: Record<TransferScenario, string> = {
  "internet-egress": "Public internet egress",
  "external-cloud": "External cloud",
  "same-cloud-same-account": "Same cloud, same account",
  "same-cloud-different-account": "Same cloud, different account",
};

export const routeDirectionLabels: Record<RouteDirection, string> = {
  "thailand-to-singapore": "Thailand to Singapore",
  "singapore-to-thailand": "Singapore to Thailand",
};
