export const scdStrategies = [
  "type_1",
  "type_2",
  "type_3",
  "type_6",
  "ignore",
] as const;

export type ScdStrategy = (typeof scdStrategies)[number];

export const strategyLabels: Record<ScdStrategy, string> = {
  type_1: "Type 1 overwrite",
  type_2: "Type 2 history",
  type_3: "Type 3 previous value",
  type_6: "Type 6 hybrid",
  ignore: "Ignore / Type 0",
};

export type ScenarioColumn = {
  key: string;
  label: string;
  trackChange: boolean;
};

export type DimensionRow = {
  sk: string;
  naturalKey: string;
  values: Record<string, string>;
  validFrom: string;
  validTo: string;
  isCurrent: boolean;
};

export type FactRow = {
  id: string;
  eventDate: string;
  naturalKey: string;
  amount: number;
};

export type ScdScenario = {
  id: string;
  title: string;
  entity: "Customer" | "Product" | "Membership";
  summary: string;
  businessQuestion: string;
  naturalKeyLabel: string;
  changeDate: string;
  changedColumn: string;
  incomingValue: string;
  columns: ScenarioColumn[];
  beforeRows: DimensionRow[];
  facts: FactRow[];
  recommendedStrategy: ScdStrategy;
  partialStrategies: ScdStrategy[];
  lesson: string;
  risk: string;
};

export const scdScenarios: ScdScenario[] = [
  {
    id: "loyalty-tier-at-transaction-time",
    title: "Loyalty Tier Changed",
    entity: "Customer",
    summary:
      "Customer C001 moved from Bronze to Gold after a campaign. Finance wants revenue by the tier that was true when each order happened.",
    businessQuestion: "Revenue by customer tier at transaction time",
    naturalKeyLabel: "customer_id",
    changeDate: "2026-03-01",
    changedColumn: "tier",
    incomingValue: "Gold",
    columns: [
      { key: "name", label: "Name", trackChange: false },
      { key: "tier", label: "Tier", trackChange: true },
      { key: "region", label: "Region", trackChange: false },
    ],
    beforeRows: [
      {
        sk: "101",
        naturalKey: "C001",
        values: { name: "Alice Tan", tier: "Bronze", region: "Bangkok" },
        validFrom: "2026-01-01",
        validTo: "9999-12-31",
        isCurrent: true,
      },
    ],
    facts: [
      { id: "O-1001", eventDate: "2026-01-15", naturalKey: "C001", amount: 1000 },
      { id: "O-2044", eventDate: "2026-03-20", naturalKey: "C001", amount: 1500 },
    ],
    recommendedStrategy: "type_2",
    partialStrategies: ["type_6"],
    lesson:
      "Use Type 2 when historical reporting must join facts to the dimension state that was valid on the fact date.",
    risk:
      "Type 1 would rewrite the past and move January revenue into Gold, which changes the business answer.",
  },
  {
    id: "customer-email-current-contact",
    title: "Email Address Corrected",
    entity: "Customer",
    summary:
      "A customer corrected a mistyped email address. Support only needs the best current contact record.",
    businessQuestion: "Current reachable customer contact",
    naturalKeyLabel: "customer_id",
    changeDate: "2026-02-10",
    changedColumn: "email",
    incomingValue: "mira.lee@example.com",
    columns: [
      { key: "name", label: "Name", trackChange: false },
      { key: "email", label: "Email", trackChange: true },
      { key: "segment", label: "Segment", trackChange: false },
    ],
    beforeRows: [
      {
        sk: "220",
        naturalKey: "C014",
        values: { name: "Mira Lee", email: "mira.l@example.com", segment: "Family" },
        validFrom: "2026-01-01",
        validTo: "9999-12-31",
        isCurrent: true,
      },
    ],
    facts: [
      { id: "T-8801", eventDate: "2026-01-20", naturalKey: "C014", amount: 260 },
      { id: "T-9130", eventDate: "2026-02-18", naturalKey: "C014", amount: 180 },
    ],
    recommendedStrategy: "type_1",
    partialStrategies: ["type_3"],
    lesson:
      "Use Type 1 for corrections and attributes where only the trusted current value matters.",
    risk:
      "Type 2 would create noisy history for a typo and make downstream contact logic more complex.",
  },
  {
    id: "product-category-reclassification",
    title: "Product Category Reclassified",
    entity: "Product",
    summary:
      "A product moved from Snacks to Health Snacks. Commercial teams still ask what the previous category was during transition.",
    businessQuestion: "Current category with one previous category visible",
    naturalKeyLabel: "product_id",
    changeDate: "2026-04-05",
    changedColumn: "category",
    incomingValue: "Health Snacks",
    columns: [
      { key: "name", label: "Name", trackChange: false },
      { key: "category", label: "Category", trackChange: true },
      { key: "brand", label: "Brand", trackChange: false },
    ],
    beforeRows: [
      {
        sk: "330",
        naturalKey: "P890",
        values: { name: "Protein Crackers", category: "Snacks", brand: "FitBite" },
        validFrom: "2026-01-01",
        validTo: "9999-12-31",
        isCurrent: true,
      },
    ],
    facts: [
      { id: "S-441", eventDate: "2026-03-12", naturalKey: "P890", amount: 700 },
      { id: "S-522", eventDate: "2026-04-16", naturalKey: "P890", amount: 950 },
    ],
    recommendedStrategy: "type_3",
    partialStrategies: ["type_2", "type_6"],
    lesson:
      "Use Type 3 when the business only needs the current value plus one previous value, not a full timeline.",
    risk:
      "Type 3 is not enough if analysts need to reconstruct every historical category assignment.",
  },
  {
    id: "membership-plan-hybrid-reporting",
    title: "Membership Plan Upgrade",
    entity: "Membership",
    summary:
      "A member upgraded from Plus to Premier. Executives want current-plan rollups, but analysts also need the plan at transaction time.",
    businessQuestion: "Current plan and historical plan in the same dimensional model",
    naturalKeyLabel: "member_id",
    changeDate: "2026-05-01",
    changedColumn: "plan",
    incomingValue: "Premier",
    columns: [
      { key: "name", label: "Name", trackChange: false },
      { key: "plan", label: "Plan", trackChange: true },
      { key: "homeMall", label: "Home Mall", trackChange: false },
    ],
    beforeRows: [
      {
        sk: "440",
        naturalKey: "M077",
        values: { name: "Narin Chai", plan: "Plus", homeMall: "Central Rama 9" },
        validFrom: "2026-02-01",
        validTo: "9999-12-31",
        isCurrent: true,
      },
    ],
    facts: [
      { id: "R-7001", eventDate: "2026-04-12", naturalKey: "M077", amount: 1200 },
      { id: "R-8120", eventDate: "2026-05-18", naturalKey: "M077", amount: 2100 },
    ],
    recommendedStrategy: "type_6",
    partialStrategies: ["type_2"],
    lesson:
      "Use Type 6 when the model must support Type 2 history and a current-value attribute on each version.",
    risk:
      "Hybrid dimensions are powerful but harder to maintain. Use them only when both reporting paths are real requirements.",
  },
  {
    id: "test-customer-ignore",
    title: "Test Customer Cleanup",
    entity: "Customer",
    summary:
      "A non-production test customer was renamed during QA. It should not affect analytics, lifecycle history, or customer reporting.",
    businessQuestion: "Keep production dimensional history clean",
    naturalKeyLabel: "customer_id",
    changeDate: "2026-05-12",
    changedColumn: "name",
    incomingValue: "QA Test Customer",
    columns: [
      { key: "name", label: "Name", trackChange: true },
      { key: "tier", label: "Tier", trackChange: false },
      { key: "region", label: "Region", trackChange: false },
    ],
    beforeRows: [
      {
        sk: "550",
        naturalKey: "TEST-9",
        values: { name: "Temporary User", tier: "Internal", region: "Sandbox" },
        validFrom: "2026-01-01",
        validTo: "9999-12-31",
        isCurrent: true,
      },
    ],
    facts: [
      { id: "Q-1", eventDate: "2026-05-11", naturalKey: "TEST-9", amount: 0 },
      { id: "Q-2", eventDate: "2026-05-13", naturalKey: "TEST-9", amount: 0 },
    ],
    recommendedStrategy: "ignore",
    partialStrategies: ["type_1"],
    lesson:
      "Sometimes the right SCD decision is to exclude or ignore records that should not be part of analytics.",
    risk:
      "Tracking test-only noise creates false confidence and makes real history harder to audit.",
  },
];
