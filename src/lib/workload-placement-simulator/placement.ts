export const workloadIntentOptions = [
  {
    value: "scheduled-pipeline",
    label: "Scheduled pipeline",
    description: "Batch or incremental processing with owned release and retry behavior.",
  },
  {
    value: "interactive-bi",
    label: "Interactive BI",
    description: "Dashboards, semantic models, or governed analytical serving.",
  },
  {
    value: "ad-hoc-exploration",
    label: "Ad hoc exploration",
    description: "Notebook, SQL, or analyst-driven investigation with changing shape.",
  },
  {
    value: "governed-sharing",
    label: "Governed sharing",
    description: "Reusable data product, workspace, or cross-domain serving path.",
  },
] as const;

export const platformEstateOptions = [
  {
    value: "databricks",
    label: "Databricks-led",
    description: "Unity Catalog, Jobs, SQL Warehouse, notebooks, or Lakeflow are primary.",
  },
  {
    value: "fabric",
    label: "Fabric-led",
    description: "Fabric capacity, OneLake, Lakehouse, Warehouse, pipelines, or Spark are primary.",
  },
  {
    value: "power-bi",
    label: "Power BI-led",
    description: "The workload is mainly semantic model, report, or consumption shaped.",
  },
  {
    value: "mixed",
    label: "Mixed platform",
    description: "Databricks, Fabric, Power BI, or warehouse boundaries all matter.",
  },
] as const;

export const dataShapeOptions = [
  {
    value: "delta-tables",
    label: "Delta/open tables",
    description: "Curated lakehouse tables are the main serving or processing surface.",
  },
  {
    value: "warehouse-star",
    label: "Warehouse/star model",
    description: "Facts, dimensions, SQL serving, and stable joins dominate the design.",
  },
  {
    value: "raw-files",
    label: "Raw or semi-structured files",
    description: "The workload still needs Spark-style preparation or normalization.",
  },
  {
    value: "semantic-model",
    label: "Semantic model",
    description: "Metric definitions, BI storage mode, and report experience dominate.",
  },
] as const;

export const freshnessOptions = [
  {
    value: "daily",
    label: "Daily or slower",
    description: "Freshness is measured in business cycles, not user interaction.",
  },
  {
    value: "intraday",
    label: "Intraday",
    description: "Several refreshes per day, predictable latency, or active operations.",
  },
  {
    value: "near-real-time",
    label: "Near real time",
    description: "Users expect recent changes quickly and stale answers are visible.",
  },
] as const;

export const scaleOptions = [
  {
    value: "team",
    label: "Team",
    description: "Small group, low concurrency, and limited operational blast radius.",
  },
  {
    value: "department",
    label: "Department",
    description: "Shared service for a business unit or several downstream teams.",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Many consumers, high concurrency, chargeback, and formal governance.",
  },
] as const;

export const governanceOptions = [
  {
    value: "standard",
    label: "Standard",
    description: "Normal internal controls and moderate audit expectations.",
  },
  {
    value: "sensitive",
    label: "Sensitive",
    description: "PII, commercial sensitivity, or row/column policy expectations.",
  },
  {
    value: "regulated",
    label: "Regulated",
    description: "Strict audit, residency, evidence, or exception-control requirements.",
  },
] as const;

export const pressureOptions = [
  {
    value: "minimize-ops",
    label: "Minimize operations",
    description: "Reduce cluster ownership, idle time, patching, and platform toil.",
  },
  {
    value: "cost-attribution",
    label: "Cost attribution",
    description: "Budgets, tags, chargeback, and workload accountability matter.",
  },
  {
    value: "custom-control",
    label: "Custom control",
    description: "Network, libraries, runtime, or execution environment must be controlled.",
  },
  {
    value: "bi-performance",
    label: "BI performance",
    description: "Report latency, semantic serving, and user interaction are the pain.",
  },
] as const;

type OptionValue<T extends readonly { value: string }[]> = T[number]["value"];

export type WorkloadIntent = OptionValue<typeof workloadIntentOptions>;
export type PlatformEstate = OptionValue<typeof platformEstateOptions>;
export type DataShape = OptionValue<typeof dataShapeOptions>;
export type FreshnessNeed = OptionValue<typeof freshnessOptions>;
export type WorkloadScale = OptionValue<typeof scaleOptions>;
export type GovernanceLevel = OptionValue<typeof governanceOptions>;
export type PlacementPressure = OptionValue<typeof pressureOptions>;

export type WorkloadPlacementInput = {
  intent: WorkloadIntent;
  estate: PlatformEstate;
  dataShape: DataShape;
  freshness: FreshnessNeed;
  scale: WorkloadScale;
  governance: GovernanceLevel;
  pressure: PlacementPressure;
};

export type PlacementCandidateId =
  | "databricks-serverless-jobs"
  | "databricks-sql-warehouse"
  | "databricks-classic-jobs"
  | "fabric-lakehouse-spark"
  | "fabric-warehouse"
  | "fabric-pipeline"
  | "power-bi-direct-lake"
  | "power-bi-import"
  | "power-bi-directquery"
  | "hybrid-placement-review";

export type PlacementCandidate = {
  id: PlacementCandidateId;
  label: string;
  platform: string;
  summary: string;
  bestFor: string;
  sourceNote: string;
};

export type PlacementFit =
  | "Avoid for now"
  | "Conditional fit"
  | "Good fit"
  | "Strong fit";

export type PlacementScore = {
  candidate: PlacementCandidate;
  score: number;
  fit: PlacementFit;
  reasons: string[];
  watchouts: string[];
};

export type WorkloadPlacementResult = {
  input: WorkloadPlacementInput;
  topRecommendation: PlacementScore;
  runnersUp: PlacementScore[];
  rankedPlacements: PlacementScore[];
  reviewWarnings: string[];
};

type ScoreField = keyof WorkloadPlacementInput;

type ScoreRule = {
  field: ScoreField;
  value: WorkloadPlacementInput[ScoreField];
  candidateId: PlacementCandidateId;
  points: number;
  reasons: string[];
  watchouts: string[];
};

const BASE_SCORE = 45;

const fitLabels = [
  "Avoid for now",
  "Conditional fit",
  "Good fit",
  "Strong fit",
] as const satisfies readonly PlacementFit[];

export const placementCandidates = [
  {
    id: "databricks-serverless-jobs",
    label: "Databricks Serverless Jobs",
    platform: "Databricks",
    summary:
      "Use a managed Databricks compute path for scheduled notebooks, jobs, and Lakeflow workloads when quick startup and lower cluster toil matter.",
    bestFor: "Owned production pipelines with Unity Catalog and normal runtime requirements.",
    sourceNote:
      "Serverless compute is managed by Databricks and applies to notebooks, workflows, and Lakeflow Spark Declarative Pipelines.",
  },
  {
    id: "databricks-sql-warehouse",
    label: "Databricks SQL Warehouse",
    platform: "Databricks",
    summary:
      "Use a SQL-serving path when the workload is governed analytics, dashboard queries, or repeated warehouse-style access.",
    bestFor: "Interactive SQL and governed analytical serving over curated tables.",
    sourceNote:
      "SQL warehouses are configured separately from Databricks serverless compute for jobs and notebooks.",
  },
  {
    id: "databricks-classic-jobs",
    label: "Databricks Classic or Job Compute",
    platform: "Databricks",
    summary:
      "Use explicit job compute when custom libraries, networking, runtime control, or unsupported serverless requirements are material.",
    bestFor: "Controlled production workloads with custom execution requirements.",
    sourceNote:
      "Serverless can reduce compute management, but custom sources and environment needs still require limitation checks.",
  },
  {
    id: "fabric-lakehouse-spark",
    label: "Fabric Lakehouse + Spark",
    platform: "Microsoft Fabric",
    summary:
      "Use Fabric Spark over OneLake lakehouse data when preparation, Delta tables, and Fabric-native collaboration matter.",
    bestFor: "Lake-centric transformation inside a Fabric capacity-backed workspace.",
    sourceNote:
      "Fabric items depend on capacity and workspace configuration, so placement needs capacity awareness.",
  },
  {
    id: "fabric-warehouse",
    label: "Fabric Warehouse",
    platform: "Microsoft Fabric",
    summary:
      "Use a Fabric Warehouse when SQL modeling, warehouse serving, and stable relational access dominate the workload.",
    bestFor: "SQL-first serving and curated dimensional or warehouse-shaped workloads.",
    sourceNote:
      "Fabric capacities and workspaces are the resource boundary for Fabric workloads.",
  },
  {
    id: "fabric-pipeline",
    label: "Fabric Data Pipeline",
    platform: "Microsoft Fabric",
    summary:
      "Use Fabric Data Pipeline when orchestration, integration, and low-code operational handoff are more important than custom Spark control.",
    bestFor: "Fabric-native ingestion, movement, orchestration, and handoff workflows.",
    sourceNote:
      "Fabric pipelines are one of several Fabric item types governed by workspace and capacity decisions.",
  },
  {
    id: "power-bi-direct-lake",
    label: "Power BI Direct Lake",
    platform: "Power BI / Fabric",
    summary:
      "Use Direct Lake when large Delta-backed semantic models need interactive analysis without a full import refresh copy.",
    bestFor: "Gold-layer Fabric Delta tables serving high-value semantic models.",
    sourceNote:
      "Direct Lake loads data from OneLake Delta tables and uses a metadata framing refresh model.",
  },
  {
    id: "power-bi-import",
    label: "Power BI Import",
    platform: "Power BI",
    summary:
      "Use Import when self-service agility, small-to-medium model size, and predictable refresh are more important than lake-native scale.",
    bestFor: "Team-scale semantic models where copied cache and scheduled refresh are acceptable.",
    sourceNote:
      "Import remains relevant for many scenarios, especially self-service analyst workflows.",
  },
  {
    id: "power-bi-directquery",
    label: "Power BI DirectQuery",
    platform: "Power BI",
    summary:
      "Use DirectQuery only when query-time federation or strict freshness matters enough to accept source-system and latency pressure.",
    bestFor: "Constrained real-time reporting where cached or Direct Lake patterns cannot satisfy the requirement.",
    sourceNote:
      "DirectQuery federates queries to the underlying source instead of using the VertiPaq path used by Import and Direct Lake.",
  },
  {
    id: "hybrid-placement-review",
    label: "Hybrid Placement Review",
    platform: "Cross-platform",
    summary:
      "Split the workload by responsibility when ingestion, preparation, serving, semantic modeling, and governance have different best homes.",
    bestFor: "Mixed Databricks, Fabric, and Power BI estates with enterprise blast radius.",
    sourceNote:
      "A mixed platform estate often needs explicit ownership and handoff boundaries rather than a single default runtime.",
  },
] as const satisfies readonly PlacementCandidate[];

const scoreRules = [
  {
    field: "intent",
    value: "scheduled-pipeline",
    candidateId: "databricks-serverless-jobs",
    points: 28,
    reasons: ["The workload is a scheduled pipeline with owned execution."],
    watchouts: [],
  },
  {
    field: "intent",
    value: "scheduled-pipeline",
    candidateId: "fabric-pipeline",
    points: 22,
    reasons: ["Fabric-native orchestration is a reasonable fit for scheduled movement or integration."],
    watchouts: [],
  },
  {
    field: "intent",
    value: "interactive-bi",
    candidateId: "power-bi-direct-lake",
    points: 30,
    reasons: ["Interactive BI over Delta-backed Fabric data is a Direct Lake-shaped problem."],
    watchouts: [],
  },
  {
    field: "intent",
    value: "interactive-bi",
    candidateId: "databricks-sql-warehouse",
    points: 18,
    reasons: ["Repeated dashboard SQL can fit a warehouse serving layer."],
    watchouts: [],
  },
  {
    field: "intent",
    value: "ad-hoc-exploration",
    candidateId: "fabric-lakehouse-spark",
    points: 18,
    reasons: ["Exploration often needs Spark-style preparation before the access pattern stabilizes."],
    watchouts: [],
  },
  {
    field: "intent",
    value: "ad-hoc-exploration",
    candidateId: "databricks-classic-jobs",
    points: 14,
    reasons: ["Custom or exploratory workloads may need explicit compute control."],
    watchouts: [],
  },
  {
    field: "intent",
    value: "governed-sharing",
    candidateId: "hybrid-placement-review",
    points: 28,
    reasons: ["Governed sharing usually needs a placement boundary, not one default runtime."],
    watchouts: [],
  },
  {
    field: "intent",
    value: "governed-sharing",
    candidateId: "fabric-warehouse",
    points: 16,
    reasons: ["SQL-serving boundaries can make governed sharing easier to operate."],
    watchouts: [],
  },
  {
    field: "estate",
    value: "databricks",
    candidateId: "databricks-serverless-jobs",
    points: 18,
    reasons: ["The estate already centers on Databricks-managed workload paths."],
    watchouts: [],
  },
  {
    field: "estate",
    value: "databricks",
    candidateId: "databricks-sql-warehouse",
    points: 18,
    reasons: ["Databricks SQL is close to the existing platform boundary."],
    watchouts: [],
  },
  {
    field: "estate",
    value: "fabric",
    candidateId: "fabric-lakehouse-spark",
    points: 18,
    reasons: ["The estate already has Fabric workspace and capacity context."],
    watchouts: [],
  },
  {
    field: "estate",
    value: "fabric",
    candidateId: "fabric-warehouse",
    points: 18,
    reasons: ["Fabric Warehouse keeps SQL serving inside the Fabric capacity boundary."],
    watchouts: [],
  },
  {
    field: "estate",
    value: "power-bi",
    candidateId: "power-bi-import",
    points: 18,
    reasons: ["A Power BI-led estate often benefits from a simple semantic model cache first."],
    watchouts: [],
  },
  {
    field: "estate",
    value: "power-bi",
    candidateId: "power-bi-direct-lake",
    points: 14,
    reasons: ["Power BI-led teams can use Direct Lake when Fabric Delta tables are in place."],
    watchouts: [],
  },
  {
    field: "estate",
    value: "mixed",
    candidateId: "hybrid-placement-review",
    points: 26,
    reasons: ["The estate crosses platform boundaries, so handoff ownership matters."],
    watchouts: [],
  },
  {
    field: "estate",
    value: "mixed",
    candidateId: "databricks-serverless-jobs",
    points: 8,
    reasons: ["Databricks can own the production compute slice in a mixed estate."],
    watchouts: [],
  },
  {
    field: "dataShape",
    value: "delta-tables",
    candidateId: "power-bi-direct-lake",
    points: 24,
    reasons: ["Direct Lake is strongest when curated Delta tables are already the serving surface."],
    watchouts: [],
  },
  {
    field: "dataShape",
    value: "delta-tables",
    candidateId: "fabric-lakehouse-spark",
    points: 18,
    reasons: ["Delta tables keep lakehouse preparation close to the serving data."],
    watchouts: [],
  },
  {
    field: "dataShape",
    value: "warehouse-star",
    candidateId: "fabric-warehouse",
    points: 24,
    reasons: ["A star-shaped relational model fits a warehouse serving surface."],
    watchouts: [],
  },
  {
    field: "dataShape",
    value: "warehouse-star",
    candidateId: "databricks-sql-warehouse",
    points: 20,
    reasons: ["Repeated SQL access over modeled tables can fit a SQL warehouse."],
    watchouts: [],
  },
  {
    field: "dataShape",
    value: "raw-files",
    candidateId: "fabric-lakehouse-spark",
    points: 20,
    reasons: ["Raw and semi-structured data usually needs preparation before serving."],
    watchouts: [],
  },
  {
    field: "dataShape",
    value: "raw-files",
    candidateId: "databricks-classic-jobs",
    points: 18,
    reasons: ["Raw file handling may need custom libraries, networking, or runtime control."],
    watchouts: [],
  },
  {
    field: "dataShape",
    value: "semantic-model",
    candidateId: "power-bi-import",
    points: 22,
    reasons: ["Semantic-model-first work can start with Import when scale allows it."],
    watchouts: [],
  },
  {
    field: "dataShape",
    value: "semantic-model",
    candidateId: "power-bi-direct-lake",
    points: 20,
    reasons: ["Semantic serving over large Fabric Delta data is Direct Lake-shaped."],
    watchouts: [],
  },
  {
    field: "freshness",
    value: "daily",
    candidateId: "power-bi-import",
    points: 16,
    reasons: ["Daily freshness tolerates scheduled semantic refresh."],
    watchouts: [],
  },
  {
    field: "freshness",
    value: "daily",
    candidateId: "fabric-pipeline",
    points: 12,
    reasons: ["Daily movement and preparation can fit simple orchestration."],
    watchouts: [],
  },
  {
    field: "freshness",
    value: "intraday",
    candidateId: "databricks-serverless-jobs",
    points: 16,
    reasons: ["Intraday batch can benefit from managed startup and low idle time."],
    watchouts: [],
  },
  {
    field: "freshness",
    value: "intraday",
    candidateId: "power-bi-direct-lake",
    points: 14,
    reasons: ["Direct Lake framing can reduce semantic refresh overhead for Fabric data."],
    watchouts: [],
  },
  {
    field: "freshness",
    value: "near-real-time",
    candidateId: "power-bi-directquery",
    points: 24,
    reasons: ["Near-real-time BI may require query-time access instead of cached answers."],
    watchouts: ["Confirm source-system load and report latency before choosing DirectQuery."],
  },
  {
    field: "freshness",
    value: "near-real-time",
    candidateId: "hybrid-placement-review",
    points: 16,
    reasons: ["Near-real-time expectations usually need split serving and operational ownership."],
    watchouts: ["Define staleness tolerance before selecting the serving path."],
  },
  {
    field: "scale",
    value: "team",
    candidateId: "power-bi-import",
    points: 14,
    reasons: ["Team-scale models often reward simplicity over platform ceremony."],
    watchouts: [],
  },
  {
    field: "scale",
    value: "team",
    candidateId: "fabric-pipeline",
    points: 8,
    reasons: ["Small team orchestration can stay simple if operational risk is low."],
    watchouts: [],
  },
  {
    field: "scale",
    value: "department",
    candidateId: "databricks-sql-warehouse",
    points: 12,
    reasons: ["Department-scale analytics benefits from a shared serving layer."],
    watchouts: [],
  },
  {
    field: "scale",
    value: "department",
    candidateId: "power-bi-direct-lake",
    points: 12,
    reasons: ["Department-scale BI may outgrow repeated import refreshes."],
    watchouts: [],
  },
  {
    field: "scale",
    value: "enterprise",
    candidateId: "hybrid-placement-review",
    points: 18,
    reasons: ["Enterprise scale makes ownership, chargeback, and handoffs first-class concerns."],
    watchouts: [],
  },
  {
    field: "scale",
    value: "enterprise",
    candidateId: "databricks-serverless-jobs",
    points: 12,
    reasons: ["Enterprise pipelines can benefit from managed compute and budget evidence."],
    watchouts: [],
  },
  {
    field: "governance",
    value: "standard",
    candidateId: "power-bi-import",
    points: 8,
    reasons: ["Standard controls leave room for a simpler semantic serving path."],
    watchouts: [],
  },
  {
    field: "governance",
    value: "sensitive",
    candidateId: "databricks-sql-warehouse",
    points: 12,
    reasons: ["Sensitive analytical serving needs explicit governed access paths."],
    watchouts: [],
  },
  {
    field: "governance",
    value: "sensitive",
    candidateId: "power-bi-direct-lake",
    points: 10,
    reasons: ["Sensitive BI data needs semantic and lake access boundaries checked together."],
    watchouts: ["Validate row, column, workspace, and semantic model permissions together."],
  },
  {
    field: "governance",
    value: "regulated",
    candidateId: "hybrid-placement-review",
    points: 18,
    reasons: ["Regulated workloads need evidence across compute, storage, BI, and access paths."],
    watchouts: ["Do not choose placement until audit evidence and exception ownership are explicit."],
  },
  {
    field: "governance",
    value: "regulated",
    candidateId: "databricks-classic-jobs",
    points: 12,
    reasons: ["Strict control needs may favor explicit compute and runtime ownership."],
    watchouts: ["Managed serverless paths still need policy, region, and limitation checks."],
  },
  {
    field: "pressure",
    value: "minimize-ops",
    candidateId: "databricks-serverless-jobs",
    points: 20,
    reasons: ["Managed serverless compute reduces cluster ownership and idle-time pressure."],
    watchouts: [],
  },
  {
    field: "pressure",
    value: "minimize-ops",
    candidateId: "power-bi-direct-lake",
    points: 12,
    reasons: ["Direct Lake reduces full import refresh management for suitable Fabric data."],
    watchouts: [],
  },
  {
    field: "pressure",
    value: "cost-attribution",
    candidateId: "databricks-serverless-jobs",
    points: 18,
    reasons: ["Serverless usage policy tags can support workload cost attribution."],
    watchouts: [
      "Serverless usage policies are Public Preview; existing assets may need manual policy assignment and billing evidence readback.",
    ],
  },
  {
    field: "pressure",
    value: "cost-attribution",
    candidateId: "hybrid-placement-review",
    points: 12,
    reasons: ["Cross-platform chargeback needs explicit ownership boundaries."],
    watchouts: [],
  },
  {
    field: "pressure",
    value: "custom-control",
    candidateId: "databricks-classic-jobs",
    points: 26,
    reasons: ["Custom runtime or networking pressure usually needs explicit compute control."],
    watchouts: [],
  },
  {
    field: "pressure",
    value: "custom-control",
    candidateId: "databricks-serverless-jobs",
    points: -18,
    reasons: [],
    watchouts: ["Check serverless limitations before choosing it for custom-control workloads."],
  },
  {
    field: "pressure",
    value: "bi-performance",
    candidateId: "power-bi-direct-lake",
    points: 18,
    reasons: ["BI interaction pressure is a strong signal for semantic serving placement."],
    watchouts: [],
  },
  {
    field: "pressure",
    value: "bi-performance",
    candidateId: "databricks-sql-warehouse",
    points: 10,
    reasons: ["Repeated report queries may need a dedicated SQL serving layer."],
    watchouts: [],
  },
] as const satisfies readonly ScoreRule[];

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

function matchedRulesForInput(input: WorkloadPlacementInput): ScoreRule[] {
  return scoreRules.filter((rule) => input[rule.field] === rule.value);
}

export function fitForScore(score: number): PlacementFit {
  const fitIndex =
    Number(score >= 50) + Number(score >= 65) + Number(score >= 80);
  return fitLabels[fitIndex];
}

export function evaluateWorkloadPlacement(
  input: WorkloadPlacementInput,
): WorkloadPlacementResult {
  const matchedRules = matchedRulesForInput(input);
  const rankedPlacements = placementCandidates
    .map((candidate) => {
      const candidateRules = matchedRules.filter(
        (rule) => rule.candidateId === candidate.id,
      );
      const score = clampScore(
        candidateRules.reduce((sum, rule) => sum + rule.points, BASE_SCORE),
      );

      return {
        candidate,
        score,
        fit: fitForScore(score),
        reasons: uniqueValues(candidateRules.flatMap((rule) => rule.reasons)),
        watchouts: uniqueValues(candidateRules.flatMap((rule) => rule.watchouts)),
      };
    })
    .sort((left, right) =>
      right.score - left.score ||
      left.candidate.label.localeCompare(right.candidate.label),
    );

  const topRecommendation = rankedPlacements[0];
  const runnersUp = rankedPlacements.slice(1, 4);
  const reviewWarnings = uniqueValues(
    rankedPlacements.slice(0, 3).flatMap((placement) => placement.watchouts),
  );

  return {
    input,
    topRecommendation,
    runnersUp,
    rankedPlacements,
    reviewWarnings,
  };
}

export function buildWorkloadPlacementBrief(
  result: WorkloadPlacementResult,
): string {
  const runnerLines = result.runnersUp
    .map(
      (placement) =>
        `- ${placement.candidate.label}: ${placement.score}/100 (${placement.fit})`,
    )
    .join("\n");
  const reasonLines = result.topRecommendation.reasons
    .map((reason) => `- ${reason}`)
    .join("\n");
  const warningLines =
    result.reviewWarnings.length > 0
      ? result.reviewWarnings.map((warning) => `- ${warning}`).join("\n")
      : "- No critical placement warnings from this directional pass.";

  return [
    "Workload Placement Simulation Brief",
    "",
    `Top recommendation: ${result.topRecommendation.candidate.label}`,
    `Placement signal: ${result.topRecommendation.score}/100`,
    `Fit: ${result.topRecommendation.fit}`,
    `Platform: ${result.topRecommendation.candidate.platform}`,
    `Platform boundary: ${result.topRecommendation.candidate.sourceNote}`,
    "",
    "Why this fit surfaced:",
    reasonLines,
    "",
    "Runners up:",
    runnerLines,
    "",
    "Watchouts:",
    warningLines,
    "",
    "Next review moves:",
    "- Confirm platform eligibility, region, capacity, policy, and runtime limitations.",
    "- Validate cost attribution and operational ownership before release.",
    "- Re-test placement when freshness, concurrency, governance, or data shape changes.",
    "",
    "Related tools:",
    "- Lakehouse Cost Calculator: /tools/lakehouse-cost-calculator",
    "- Access Model Simulator: /tools/access-model-simulator",
    "- Power BI Semantic Model Doctor: /tools/power-bi-semantic-model-doctor",
    "",
    "Generated at xhverse.co/tools/workload-placement-simulator",
  ].join("\n");
}
