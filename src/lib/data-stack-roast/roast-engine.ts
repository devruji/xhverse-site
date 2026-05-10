import type { StackCategory, StackSelections } from "./stacks";

export type RoastSlot = "architecture" | "operations" | "growth";

export type RoastParagraph = {
  slot: RoastSlot;
  conditions: Array<{ category: StackCategory; optionIds: string[] }>;
  text: string;
};

export type RoastResult = {
  roastParagraphs: [string, string, string];
  improvementPath: string[];
  shareableSnippet: string;
};

const genericFallbacks: Record<RoastSlot, string> = {
  architecture:
    "Your architecture choices are... choices. Not necessarily good ones, but at least you made them. That puts you ahead of teams still debating in a Confluence doc from 2019.",
  operations:
    "Your operational setup suggests someone Googled 'data engineering best practices' and stopped reading after the first paragraph. There's room to grow here.",
  growth:
    "The growth trajectory of this stack is a flat line with ambition. You have the pieces, now you need the plan to make them work together at scale.",
};

export const roastParagraphs: RoastParagraph[] = [
  // === ARCHITECTURE SLOT (10+ paragraphs) ===
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["delta_lake"] },
      { category: "compute", optionIds: ["databricks"] },
      { category: "governance", optionIds: ["unity_catalog"] },
    ],
    text: "Delta Lake on Databricks with Unity Catalog — you actually read the docs. Respect. This is a cohesive lakehouse stack that'll scale without duct tape. Whoever made this call deserves a raise.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["hive"] },
      { category: "compute", optionIds: ["local"] },
    ],
    text: "Hive plus local scripts is like pairing a horse with a skateboard — both move, neither fast, and the handoff is going to hurt. This architecture was outdated when Hadoop was still cool.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["hive"] },
      { category: "governance", optionIds: ["none"] },
    ],
    text: "Hive with no governance is a swamp wearing a lake's nametag. Your data lineage is 'ask Steve, he remembers where that table came from.' Steve is going on vacation next month.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["snowflake"] },
      { category: "compute", optionIds: ["snowflake"] },
    ],
    text: "Snowflake for storage AND compute — you went all-in on the warehouse-as-platform bet. Clean architecture, though your CFO might have opinions about the credit burn rate.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["bigquery"] },
      { category: "compute", optionIds: ["bigquery"] },
    ],
    text: "BigQuery for everything — Google's dream customer. The architecture is dead simple, which is either genius minimalism or 'we only know one tool.' Either way, it works until it doesn't.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["iceberg"] },
      { category: "compute", optionIds: ["emr"] },
    ],
    text: "Iceberg on EMR — you're betting on open table formats before most teams can spell 'partition evolution.' Forward-thinking, but make sure your team can actually operate this thing.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["parquet_blob"] },
      { category: "compute", optionIds: ["local"] },
    ],
    text: "Parquet files on blob storage processed by local scripts — congratulations, you've built a data lake with the governance model of a shared Google Drive. This is one laptop failure away from disaster.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["delta_lake"] },
      { category: "compute", optionIds: ["synapse"] },
    ],
    text: "Delta Lake read by Synapse — Microsoft's 'have it both ways' pitch in action. It works on paper, but in practice you're navigating two ecosystems that occasionally pretend the other doesn't exist.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "compute", optionIds: ["synapse"] },
      { category: "governance", optionIds: ["purview"] },
    ],
    text: "Synapse with Purview — you're deep in the Microsoft ecosystem. The integration is getting better each quarter, but you're still early enough to feel every rough edge in the catalog UI.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "storage", optionIds: ["iceberg"] },
      { category: "governance", optionIds: ["unity_catalog"] },
    ],
    text: "Iceberg with Unity Catalog — you're playing the interoperability long game. Smart bet if you want engine flexibility, just make sure your team isn't spending more time on format gymnastics than actual analytics.",
  },
  {
    slot: "architecture",
    conditions: [
      { category: "compute", optionIds: ["local"] },
      { category: "governance", optionIds: ["none"] },
    ],
    text: "Local scripts with no governance — you're one 'rm -rf' away from starting over. This isn't a data platform, it's a personal hobby project that accidentally got stakeholders.",
  },

  // === OPERATIONS SLOT (10+ paragraphs) ===
  {
    slot: "operations",
    conditions: [
      { category: "orchestrator", optionIds: ["none"] },
      { category: "team_size", optionIds: ["30_plus"] },
    ],
    text: "No orchestrator with 30+ people? Your scheduling strategy is 'hope and Slack messages.' That's not operations, that's a prayer circle with laptops.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "orchestrator", optionIds: ["none"] },
      { category: "team_size", optionIds: ["1_3"] },
    ],
    text: "No orchestrator with a tiny team — honestly fair. You ARE the orchestrator. Just don't get sick, because your pipelines have exactly one point of failure: you.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "orchestrator", optionIds: ["airflow"] },
      { category: "compute", optionIds: ["databricks"] },
    ],
    text: "Airflow orchestrating Databricks — a classic combo that works great until you need to debug a failed task across two UIs, three log systems, and a partridge in a pear tree.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "orchestrator", optionIds: ["databricks_workflows"] },
      { category: "compute", optionIds: ["databricks"] },
    ],
    text: "Databricks Workflows on Databricks compute — single pane of glass, native integration, less operational overhead. You traded flexibility for simplicity and that's usually the right call.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "orchestrator", optionIds: ["adf"] },
      { category: "compute", optionIds: ["databricks"] },
    ],
    text: "ADF triggering Databricks is Microsoft's blessed path, but debugging a failed pipeline means clicking through 47 nested activities in a UI that was designed by someone who hates you.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "bi", optionIds: ["excel"] },
      { category: "team_size", optionIds: ["30_plus"] },
    ],
    text: "Excel as your BI layer with 30+ people is not a tool choice, it's a cry for help. Somewhere in your org, there are 15 versions of 'final_report_v3_REAL_final.xlsx' and nobody knows which is right.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "bi", optionIds: ["excel"] },
      { category: "team_size", optionIds: ["11_30"] },
    ],
    text: "Excel for reporting with a mid-size team means someone is spending 40% of their week copy-pasting numbers into pivot tables. That's not analytics, that's data entry with extra steps.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "orchestrator", optionIds: ["dagster"] },
      { category: "team_size", optionIds: ["4_10"] },
    ],
    text: "Dagster with a mid-size team — you picked the hipster orchestrator, and honestly it's a good one. Software-defined assets are the future, assuming your team survives the learning curve.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "orchestrator", optionIds: ["prefect"] },
      { category: "compute", optionIds: ["local"] },
    ],
    text: "Prefect orchestrating local scripts is like hiring a five-star conductor for a garage band. The orchestrator is more sophisticated than the workloads it's managing.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "bi", optionIds: ["power_bi"] },
      { category: "compute", optionIds: ["databricks"] },
    ],
    text: "Power BI on Databricks — DirectLake or bust. If you're still doing Import mode, you're paying for a lakehouse and then copying the data out of it like a tourist photographing a museum painting on their phone.",
  },
  {
    slot: "operations",
    conditions: [
      { category: "orchestrator", optionIds: ["adf"] },
      { category: "compute", optionIds: ["synapse"] },
    ],
    text: "ADF plus Synapse — the Azure-native combo that Microsoft pitches in every Enterprise architecture deck. It works, but maintaining it feels like assembling IKEA furniture with instructions in another language.",
  },

  // === GROWTH SLOT (10+ paragraphs) ===
  {
    slot: "growth",
    conditions: [
      { category: "governance", optionIds: ["none"] },
      { category: "team_size", optionIds: ["30_plus"] },
    ],
    text: "Your governance approach is 'hope nobody notices' — bold strategy for a team of 30+. You'll feel this pain at 3am when someone queries PII they shouldn't have access to and nobody knows who owns the table.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "governance", optionIds: ["none"] },
      { category: "team_size", optionIds: ["11_30"] },
    ],
    text: "No governance with 11-30 people is the 'we'll deal with it later' phase. Spoiler: later is now. Every week you delay, someone creates another ungoverned table that future-you will curse.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "governance", optionIds: ["manual"] },
      { category: "team_size", optionIds: ["30_plus"] },
    ],
    text: "Manual governance via spreadsheets for a 30+ person team — you're one resignation away from losing all institutional knowledge about who owns what. That spreadsheet is a single point of failure with conditional formatting.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "team_size", optionIds: ["1_3"] },
      { category: "governance", optionIds: ["none"] },
    ],
    text: "No governance with 1-3 people? Totally fine right now. But you're building habits, and 'we'll add governance later' is the data engineering equivalent of 'I'll start going to the gym Monday.'",
  },
  {
    slot: "growth",
    conditions: [
      { category: "compute", optionIds: ["databricks"] },
      { category: "governance", optionIds: ["unity_catalog"] },
      { category: "team_size", optionIds: ["4_10"] },
    ],
    text: "Databricks with Unity Catalog at your team size is genuinely well-positioned for growth. You've got the governance foundation before the pain hits. When you double the team, you won't be playing catch-up.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "storage", optionIds: ["hive"] },
      { category: "team_size", optionIds: ["11_30", "30_plus"] },
    ],
    text: "Still on Hive with a growing team? That's technical debt compounding faster than your cloud bill. Migration is inevitable — the only question is whether you do it planned or panicked.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "bi", optionIds: ["excel"] },
      { category: "governance", optionIds: ["none"] },
    ],
    text: "Excel for BI with no governance — your 'data culture' is everyone maintaining their own version of the truth in personal spreadsheets. Growth means more spreadsheets, more conflicts, more 'which number is right' meetings.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "compute", optionIds: ["local"] },
      { category: "team_size", optionIds: ["11_30", "30_plus"] },
    ],
    text: "Local scripts at your team size means you've outgrown your compute model three headcounts ago. Every new hire is learning 'how Dave's laptop runs things' instead of shipping value.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "orchestrator", optionIds: ["databricks_workflows"] },
      { category: "storage", optionIds: ["delta_lake"] },
      { category: "governance", optionIds: ["unity_catalog"] },
    ],
    text: "Full Databricks stack with Unity Catalog — your growth path is clear because Databricks already mapped it for you. The platform scales linearly, your bill scales... less linearly. Budget accordingly.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "storage", optionIds: ["snowflake"] },
      { category: "compute", optionIds: ["snowflake"] },
      { category: "bi", optionIds: ["looker"] },
    ],
    text: "Snowflake plus Looker — the modern analytics stack circa 2021. It scales well, but watch that credit consumption. Growth here means growing your Snowflake bill at roughly the same rate as your headcount.",
  },
  {
    slot: "growth",
    conditions: [
      { category: "governance", optionIds: ["collibra", "alation"] },
      { category: "team_size", optionIds: ["4_10"] },
    ],
    text: "Enterprise governance tooling for a team of 4-10 — either you're forward-thinking or someone sold your VP a catalog license before you needed one. Make sure it's actually adopted, not just deployed.",
  },
];

function matchesConditions(
  paragraph: RoastParagraph,
  selections: StackSelections,
): boolean {
  return paragraph.conditions.every((condition) =>
    condition.optionIds.includes(selections[condition.category]),
  );
}

function selectBestMatch(
  slot: RoastSlot,
  selections: StackSelections,
): string {
  const matches = roastParagraphs
    .filter((p) => p.slot === slot && matchesConditions(p, selections))
    .sort((a, b) => b.conditions.length - a.conditions.length);

  return matches.length > 0 ? matches[0].text : genericFallbacks[slot];
}

const improvementSuggestions: Array<{
  conditions: Array<{ category: StackCategory; optionIds: string[] }>;
  suggestion: string;
}> = [
  {
    conditions: [{ category: "governance", optionIds: ["none", "manual"] }],
    suggestion:
      "Implement a data catalog — even a lightweight one. You can't govern what you can't see.",
  },
  {
    conditions: [{ category: "orchestrator", optionIds: ["none"] }],
    suggestion:
      "Add an orchestrator. Cron jobs and manual triggers don't scale and can't alert on failure.",
  },
  {
    conditions: [{ category: "compute", optionIds: ["local"] }],
    suggestion:
      "Move compute to a managed service. Local scripts are a bus-factor-of-one risk that can't be monitored.",
  },
  {
    conditions: [{ category: "bi", optionIds: ["excel"] }],
    suggestion:
      "Graduate from Excel to a proper BI tool. Your analysts deserve governed, version-controlled dashboards.",
  },
  {
    conditions: [{ category: "storage", optionIds: ["hive"] }],
    suggestion:
      "Plan your migration off Hive to a modern table format (Delta, Iceberg). The ecosystem has moved on.",
  },
  {
    conditions: [
      { category: "team_size", optionIds: ["11_30", "30_plus"] },
      { category: "governance", optionIds: ["none", "manual"] },
    ],
    suggestion:
      "At your team size, governance isn't optional. Define data ownership, access policies, and a review process.",
  },
  {
    conditions: [
      { category: "team_size", optionIds: ["30_plus"] },
      { category: "orchestrator", optionIds: ["none"] },
    ],
    suggestion:
      "With 30+ people and no orchestrator, you need one yesterday. Evaluate Dagster or Databricks Workflows for modern options.",
  },
  {
    conditions: [
      { category: "compute", optionIds: ["local"] },
      { category: "team_size", optionIds: ["4_10", "11_30", "30_plus"] },
    ],
    suggestion:
      "Your team has outgrown local compute. Centralize on a shared platform so work is reproducible and observable.",
  },
];

const defaultImprovements = [
  "Document your data contracts between producers and consumers.",
  "Establish a cost monitoring practice — know what each workload costs per run.",
  "Build a data quality framework with automated checks at ingestion boundaries.",
];

function buildImprovementPath(selections: StackSelections): string[] {
  const matched = improvementSuggestions
    .filter((item) =>
      item.conditions.every((condition) =>
        condition.optionIds.includes(selections[condition.category]),
      ),
    )
    .map((item) => item.suggestion);

  if (matched.length >= 3) return matched.slice(0, 5);
  if (matched.length > 0) {
    const needed = 3 - matched.length;
    return [...matched, ...defaultImprovements.slice(0, needed)];
  }
  return defaultImprovements;
}

export function buildShareableSnippet(
  roastParagraphs: [string, string, string],
): string {
  const firstSentence = roastParagraphs[0].split(". ")[0];
  const wrapper = 'My data stack got roasted at xhverse.co — "…."';
  const maxQuoteLength = 280 - wrapper.length;

  if (firstSentence.length <= maxQuoteLength) {
    return `My data stack got roasted at xhverse.co — "${firstSentence}."`;
  }

  const truncated = firstSentence.slice(0, maxQuoteLength - 3) + "...";
  return `My data stack got roasted at xhverse.co — "${truncated}."`;
}

export function generateRoast(selections: StackSelections): RoastResult {
  const architecture = selectBestMatch("architecture", selections);
  const operations = selectBestMatch("operations", selections);
  const growth = selectBestMatch("growth", selections);

  const paragraphs: [string, string, string] = [
    architecture,
    operations,
    growth,
  ];

  const improvementPath = buildImprovementPath(selections);
  const shareableSnippet = buildShareableSnippet(paragraphs);

  return {
    roastParagraphs: paragraphs,
    improvementPath,
    shareableSnippet,
  };
}

export function buildRoastBrief(result: RoastResult): string {
  const lines = [
    "DATA STACK ROAST",
    "================",
    "",
    "Architecture:",
    result.roastParagraphs[0],
    "",
    "Operations:",
    result.roastParagraphs[1],
    "",
    "Growth:",
    result.roastParagraphs[2],
    "",
    "Improvement Path:",
    ...result.improvementPath.map((item, i) => `${i + 1}. ${item}`),
    "",
    "---",
    "Generated at xhverse.co/tools/data-stack-roast",
  ];

  return lines.join("\n");
}
