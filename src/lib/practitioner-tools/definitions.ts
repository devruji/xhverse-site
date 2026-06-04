import type {
  AnswerValue,
  PractitionerToolDefinition,
  ToolOption,
  ToolQuestion,
  ToolTier,
} from "./types";

const readinessOptions: readonly ToolOption[] = [
  {
    value: 1,
    label: "Missing",
    description: "No explicit practice exists, or it only lives in tribal knowledge.",
  },
  {
    value: 2,
    label: "Informal",
    description: "A pattern exists, but teams apply it inconsistently or manually.",
  },
  {
    value: 3,
    label: "Defined",
    description: "The practice is documented and used for important production work.",
  },
  {
    value: 4,
    label: "Operated",
    description: "The practice is reviewed, measurable, and part of normal operations.",
  },
];

const tiers: readonly ToolTier[] = [
  {
    minScore: 85,
    label: "Production-ready",
    summary: "The design is ready to formalize, publish, or run with only minor cleanup.",
  },
  {
    minScore: 65,
    label: "Usable with gaps",
    summary: "The direction is workable, but several operating details still need owners.",
  },
  {
    minScore: 40,
    label: "Needs design work",
    summary: "The idea has promise, but the operating contract is not strong enough yet.",
  },
  {
    minScore: 0,
    label: "High-risk",
    summary: "Do not treat this as production-ready until the basic contract is clarified.",
  },
];

function question(
  id: string,
  dimension: string,
  prompt: string,
  helpText: string,
  actions: Record<AnswerValue, string>,
): ToolQuestion {
  return {
    id,
    dimension,
    prompt,
    helpText,
    options: readinessOptions,
    actions,
  };
}

export const practitionerToolDefinitions = [
  {
    slug: "data-product-contract-builder",
    title: "Data Product Contract Builder",
    category: "Data Product",
    kicker: "Contract tool",
    description:
      "Score the minimum contract behind a data product and produce a copyable brief for owners, consumers, and platform teams.",
    artifactLabel: "Data Product Contract Brief",
    blogSync: {
      title: "Data product as a platform contract",
      href: "/blog/data-product-as-platform-contract",
    },
    serviceCta: {
      label: "Turn this into an architecture review",
      href: "/services",
    },
    tiers,
    strongResultActions: [
      "Publish the contract in the catalog or workspace notes before expanding consumers.",
      "Schedule a lightweight monthly review for freshness, quality, access, and lifecycle promises.",
      "Use the contract as the approval gate for breaking schema or semantic changes.",
    ],
    questions: [
      question(
        "product-owner",
        "Named owner",
        "Can a consumer identify who owns this data product and who can approve changes?",
        "Ownership should be visible without asking through Slack or reading pipeline code.",
        {
          1: "Name an accountable product owner and a technical owner before adding consumers.",
          2: "Document the owner, deputy, and approval path in the workspace or catalog.",
          3: "Add review cadence and escalation rules so ownership is operational.",
          4: "Keep owner review evidence close to the catalog entry or product page.",
        },
      ),
      question(
        "product-grain",
        "Grain and boundaries",
        "Is the product grain, domain boundary, and consumer-facing purpose clear?",
        "The product should explain what one row or entity means and what it does not cover.",
        {
          1: "Write the grain, included entities, excluded entities, and intended decisions in one paragraph.",
          2: "Align the grain with consumers and remove ambiguous catch-all wording.",
          3: "Add examples of valid and invalid use so consumers do not stretch the product.",
          4: "Version the grain statement when the product boundary changes.",
        },
      ),
      question(
        "product-freshness",
        "Freshness and SLA",
        "Are freshness, latency, and support expectations explicit enough for production use?",
        "Consumers need to know whether the data is hourly, daily, intraday, late, or best effort.",
        {
          1: "Define refresh frequency, late-data behavior, and support hours before publishing.",
          2: "Add a target SLA and make missed refresh behavior visible to consumers.",
          3: "Connect the SLA to monitoring and ownership for failed refreshes.",
          4: "Review SLA adherence and consumer impact as part of product operations.",
        },
      ),
      question(
        "product-quality",
        "Quality contract",
        "Are quality rules, known limitations, and data acceptance checks documented?",
        "Useful products state what is tested, what is not guaranteed, and when consumers are warned.",
        {
          1: "Define critical quality checks before treating the product as trusted.",
          2: "Document known limitations and add minimum validation at the publishing boundary.",
          3: "Connect quality checks to alerts or consumer-visible status.",
          4: "Review failing checks with owners and track recurring defects.",
        },
      ),
      question(
        "product-access",
        "Access and sensitivity",
        "Is access behavior clear across workspace, catalog, semantic, and API paths?",
        "The contract should name who can request, approve, read, write, and audit access.",
        {
          1: "Classify sensitivity and define reader, writer, approver, and auditor paths.",
          2: "Separate workspace membership from actual data access and document exceptions.",
          3: "Add an access review cadence and record approved consumer groups.",
          4: "Use access reviews as part of product certification and lifecycle checks.",
        },
      ),
      question(
        "product-lifecycle",
        "Lifecycle and change",
        "Can consumers see how schema changes, retirement, and breaking changes are handled?",
        "A production contract needs a change policy, not only a launch checklist.",
        {
          1: "Create a change policy before adding dependent dashboards or downstream jobs.",
          2: "Define notification windows, versioning, and retirement behavior.",
          3: "Track consumer dependencies and require impact review for breaking changes.",
          4: "Run change reviews as part of the normal product lifecycle.",
        },
      ),
    ],
  },
  {
    slug: "access-model-simulator",
    title: "Access Model Simulator",
    category: "Governance",
    kicker: "Access tool",
    description:
      "Pressure-test platform access assumptions across role scope, sensitivity, row or column controls, and external access paths.",
    artifactLabel: "Access Model Simulation Brief",
    blogSync: {
      title: "ABAC row filters and column masks need production ownership",
      href: "/blog/abac-row-filters-column-masks-production-ownership",
    },
    serviceCta: {
      label: "Design a least-privilege access model",
      href: "/services",
    },
    tiers,
    strongResultActions: [
      "Use this model as a regression checklist for every new governed dataset.",
      "Keep access-path tests close to the policy definition and review them after platform upgrades.",
      "Publish the approved access pattern so workspace admins, catalog owners, and BI owners do not diverge.",
    ],
    questions: [
      question(
        "access-scope",
        "Role scope",
        "Is the role scoped to the smallest object boundary that can satisfy the user need?",
        "Least privilege starts with scope: workspace, catalog, schema, table, semantic model, or report.",
        {
          1: "Reduce broad admin or workspace-level access before adding row or column controls.",
          2: "Move from broad role grants to object-level or group-based grants where possible.",
          3: "Document why the selected boundary is acceptable for the use case.",
          4: "Keep scope evidence in the access review record.",
        },
      ),
      question(
        "access-sensitivity",
        "Sensitivity handling",
        "Does the model classify sensitive fields and separate confidential access from normal read access?",
        "Controls should reflect sensitivity, not only convenience.",
        {
          1: "Classify sensitive columns and records before granting broad read access.",
          2: "Separate privileged and standard reader groups with visible approval paths.",
          3: "Tie classifications to row filters, column masks, or semantic restrictions.",
          4: "Review sensitivity mappings when new columns or sources arrive.",
        },
      ),
      question(
        "access-controls",
        "Row and column controls",
        "Are row filters, masks, ABAC policies, or semantic restrictions owned as production controls?",
        "A policy is production code when it changes what people can see.",
        {
          1: "Assign ownership and tests before relying on row or column controls.",
          2: "Document policy intent, affected objects, and expected pass or block cases.",
          3: "Add verification queries or report checks for allowed and denied scenarios.",
          4: "Review policy evaluation after upgrades, schema changes, and group changes.",
        },
      ),
      question(
        "access-paths",
        "Access paths",
        "Are UI, SQL, API, shortcut, direct lake, and BI paths tested against the same intent?",
        "Users often reach the same data through more than one path.",
        {
          1: "List every access path before declaring the model governed.",
          2: "Test the riskiest direct and BI paths against the intended access outcome.",
          3: "Document exceptions where a path needs stronger or different controls.",
          4: "Automate recurring checks for the access paths that matter most.",
        },
      ),
      question(
        "access-exceptions",
        "Exception review",
        "Are temporary grants, break-glass paths, and privileged exceptions reviewed?",
        "Exceptions become the real model if nobody owns expiry and review.",
        {
          1: "Create an exception register with owner, reason, expiry, and reviewer.",
          2: "Set expiry dates for elevated access and review them on a fixed cadence.",
          3: "Tie exceptions to incident, support, or delivery records.",
          4: "Report expired or unused exceptions as access-risk evidence.",
        },
      ),
      question(
        "access-audit",
        "Audit readback",
        "Can the team prove who has access and why after a policy or group change?",
        "Readback matters more than intended diagrams.",
        {
          1: "Add a readback command or checklist for every material access change.",
          2: "Capture before and after evidence for role, group, and policy changes.",
          3: "Compare readback against the expected model during release review.",
          4: "Keep readback evidence available for audit and incident analysis.",
        },
      ),
    ],
  },
  {
    slug: "lakehouse-table-layout-advisor",
    title: "Lakehouse Table Layout Advisor",
    category: "Architecture",
    kicker: "Table layout tool",
    description:
      "Turn table size, file pressure, query filters, update pattern, and engine mix into practical layout and maintenance guidance.",
    artifactLabel: "Lakehouse Table Layout Brief",
    blogSync: {
      title: "Open table formats are an operating model decision",
      href: "/blog/open-table-formats-operating-model",
    },
    serviceCta: {
      label: "Review the table operating model",
      href: "/services",
    },
    tiers,
    strongResultActions: [
      "Track layout health alongside freshness and quality so performance work is not reactive.",
      "Document which layout choices are engine-specific and which are table-contract commitments.",
      "Review compaction and clustering after major query-pattern or ingestion changes.",
    ],
    questions: [
      question(
        "layout-file-size",
        "File pressure",
        "Are file counts, file sizes, and small-file patterns visible for production tables?",
        "Small files and uncontrolled ingestion patterns become query and maintenance cost.",
        {
          1: "Measure file counts and file sizes before changing partition or clustering strategy.",
          2: "Add a compaction trigger for high-file-count tables.",
          3: "Track file pressure as part of table health for critical datasets.",
          4: "Review file pressure after new pipelines, streaming jobs, or merge-heavy workloads.",
        },
      ),
      question(
        "layout-partitioning",
        "Partition strategy",
        "Does partitioning match stable, high-selectivity query filters without creating too many partitions?",
        "Partitioning is a contract with future readers and writers.",
        {
          1: "Avoid adding partitions until query filters and cardinality are known.",
          2: "Replace low-value partitioning with clearer clustering or maintenance guidance.",
          3: "Document accepted partition columns and anti-patterns for this table.",
          4: "Review partition usefulness with observed query and file statistics.",
        },
      ),
      question(
        "layout-clustering",
        "Clustering and pruning",
        "Are common filters supported by clustering, ordering, or engine-specific pruning features?",
        "Filter-heavy tables need layout choices that make skipping possible.",
        {
          1: "Identify top query predicates before choosing clustering or ordering columns.",
          2: "Pick a small set of stable pruning columns and avoid churn-heavy keys.",
          3: "Tie clustering maintenance to observed query patterns.",
          4: "Refresh clustering choices when consumers or engines change materially.",
        },
      ),
      question(
        "layout-updates",
        "Update and merge pattern",
        "Are deletes, merges, late updates, and CDC patterns reflected in maintenance expectations?",
        "High-change tables need different maintenance from append-only facts.",
        {
          1: "Classify the table as append, CDC, merge-heavy, or overwrite before publishing.",
          2: "Add maintenance guidance for merge-heavy or delete-heavy tables.",
          3: "Document late-arriving data and schema evolution behavior.",
          4: "Review maintenance cost after CDC volume or late-data behavior changes.",
        },
      ),
      question(
        "layout-engines",
        "Engine mix",
        "Do Databricks, Fabric, SQL, BI, or external clients have compatible expectations for this table?",
        "A shared table format does not remove engine-specific behavior.",
        {
          1: "List engines and clients before calling the layout production-ready.",
          2: "Test the table with the highest-risk read and write engines.",
          3: "Document which operations are supported by which engine.",
          4: "Use engine compatibility checks during release and platform upgrade review.",
        },
      ),
      question(
        "layout-cost",
        "Cost evidence",
        "Can the team connect layout choices to scan width, runtime, and maintenance cost?",
        "Layout work should reduce real operating cost, not just satisfy a style preference.",
        {
          1: "Capture a baseline query or job cost before optimizing layout.",
          2: "Estimate cost impact for compaction, clustering, or partition changes.",
          3: "Compare post-change scan width or runtime with the baseline.",
          4: "Keep layout decisions tied to cost and performance evidence.",
        },
      ),
    ],
  },
  {
    slug: "power-bi-semantic-model-doctor",
    title: "Power BI Semantic Model Doctor",
    category: "Power BI",
    kicker: "Semantic model tool",
    description:
      "Check whether a Power BI semantic model has clear grain, relationships, measures, refresh behavior, and support ownership.",
    artifactLabel: "Power BI Semantic Model Diagnosis",
    blogSync: {
      title: "Big table vs star schema",
      href: "/blog/big-table-vs-star-schema",
    },
    serviceCta: {
      label: "Review the semantic model architecture",
      href: "/services",
    },
    tiers,
    strongResultActions: [
      "Use the model contract as the review gate for new reports and certified datasets.",
      "Track measure ownership and refresh health so report issues do not become hidden platform debt.",
      "Keep model design guidance close to the BI migration or Fabric operating model.",
    ],
    questions: [
      question(
        "semantic-grain",
        "Fact grain",
        "Is the fact grain clear enough that every measure can explain what it counts?",
        "Ambiguous grain is the fastest path to conflicting reports.",
        {
          1: "Define fact grain before adding more measures or visuals.",
          2: "Document the main facts and remove mixed-grain shortcuts where possible.",
          3: "Add grain examples beside the model or catalog description.",
          4: "Review grain whenever a new fact table or aggregation is introduced.",
        },
      ),
      question(
        "semantic-dimensions",
        "Dimensions",
        "Are dimensions conformed, named, and separated from facts in a way report authors can understand?",
        "A model should make the correct path easy for analysts.",
        {
          1: "Separate core dimensions from wide fact tables before certifying the model.",
          2: "Normalize naming and hide technical keys that report authors should not use.",
          3: "Document conformed dimensions and known duplicate concepts.",
          4: "Review dimension drift when new business domains join the model.",
        },
      ),
      question(
        "semantic-relationships",
        "Relationships",
        "Are relationship directions, many-to-many cases, and bridge tables intentional?",
        "Relationship ambiguity creates subtle measure errors.",
        {
          1: "Inventory relationships and remove accidental many-to-many paths.",
          2: "Document bridge tables, inactive relationships, and filter direction choices.",
          3: "Test key measures against known business totals.",
          4: "Review relationships before every certified model release.",
        },
      ),
      question(
        "semantic-measures",
        "Measure ownership",
        "Are important measures centralized, reviewed, and owned instead of copied across reports?",
        "The semantic model should reduce metric drift.",
        {
          1: "Centralize critical measures before allowing broad report reuse.",
          2: "Assign measure owners and remove duplicate report-level calculations.",
          3: "Add acceptance examples for business-critical measures.",
          4: "Review measure changes with business owners and report maintainers.",
        },
      ),
      question(
        "semantic-refresh",
        "Refresh and performance",
        "Is refresh mode, Direct Lake or import behavior, aggregation, and performance evidence understood?",
        "Model design needs operational evidence, not only visual success.",
        {
          1: "Capture refresh duration, model size, and slow report symptoms before redesign.",
          2: "Align refresh mode with data freshness, cost, and consumer expectations.",
          3: "Use aggregations, model simplification, or source layout only with evidence.",
          4: "Review refresh and performance health after source or model changes.",
        },
      ),
      question(
        "semantic-lifecycle",
        "Certification and lifecycle",
        "Can users tell whether the model is experimental, certified, deprecated, or production-supported?",
        "Model status should reduce duplicate report creation and trust disputes.",
        {
          1: "Separate experimental models from certified or production-supported models.",
          2: "Add status, owner, support path, and deprecation rules to the model page.",
          3: "Create a certification checklist for metrics, security, and refresh behavior.",
          4: "Review certified models on a fixed cadence with usage and incident evidence.",
        },
      ),
    ],
  },
  {
    slug: "pipeline-recovery-planner",
    title: "Pipeline Recovery Planner",
    category: "Operations",
    kicker: "Recovery tool",
    description:
      "Convert failure mode, source behavior, checkpoint state, idempotency, merge logic, and consumer impact into a recovery runbook.",
    artifactLabel: "Pipeline Recovery Runbook Brief",
    blogSync: {
      title: "Serverless data engineering still needs an operating model",
      href: "/blog/serverless-data-engineering-operating-model",
    },
    serviceCta: {
      label: "Design production recovery runbooks",
      href: "/services",
    },
    tiers,
    strongResultActions: [
      "Run a tabletop recovery drill before the next high-risk production release.",
      "Keep replay, rollback, and consumer communication steps in the same runbook.",
      "Review recovery readiness after source, checkpoint, merge, or orchestration changes.",
    ],
    questions: [
      question(
        "recovery-failure-mode",
        "Failure mode",
        "Can the team classify the failure as source, transform, state, merge, orchestration, or downstream impact?",
        "Recovery starts with knowing what failed and what did not.",
        {
          1: "Create a failure-mode taxonomy before writing recovery instructions.",
          2: "Map common failures to owner, detection signal, and first response.",
          3: "Add failure-mode checks to incident triage.",
          4: "Review failure-mode patterns after incidents and near misses.",
        },
      ),
      question(
        "recovery-replay",
        "Replay boundary",
        "Is the replay window, source retention, and backfill boundary known?",
        "A replay plan is only useful if the source can still provide the needed data.",
        {
          1: "Document source retention and replay limits before relying on backfills.",
          2: "Define replay windows for common failure scenarios.",
          3: "Test replay from a controlled boundary in a non-production path.",
          4: "Review replay assumptions after source retention or schema changes.",
        },
      ),
      question(
        "recovery-idempotency",
        "Idempotency",
        "Can the pipeline safely rerun without duplicate facts, broken aggregates, or corrupted state?",
        "Recovery is much safer when rerun behavior is deterministic.",
        {
          1: "Define keys, deduplication, and overwrite or merge behavior before reruns.",
          2: "Add idempotency checks for common replay paths.",
          3: "Test reruns against duplicate and late-arriving inputs.",
          4: "Keep idempotency evidence in the production release checklist.",
        },
      ),
      question(
        "recovery-state",
        "Checkpoint and state",
        "Are checkpoints, offsets, watermarks, and state stores understood well enough to recover safely?",
        "Stateful recovery needs more care than rerunning a batch notebook.",
        {
          1: "Document checkpoint and state locations before production release.",
          2: "Define when checkpoint reset is allowed and who can approve it.",
          3: "Test state recovery or reset in a controlled environment.",
          4: "Review state assumptions after runtime, source, or schema changes.",
        },
      ),
      question(
        "recovery-consumers",
        "Consumer impact",
        "Can downstream dashboards, jobs, and data products be protected during recovery?",
        "Recovery should reduce damage, not silently spread it.",
        {
          1: "List downstream consumers and stop points before recovery work starts.",
          2: "Define quarantine, pause, or rollback behavior for affected consumers.",
          3: "Add consumer notification steps to the recovery runbook.",
          4: "Review consumer impact after recovery and update dependency records.",
        },
      ),
      question(
        "recovery-evidence",
        "Recovery evidence",
        "Does the team capture before, during, and after evidence for recovery decisions?",
        "Evidence makes recovery reviewable and improves the next incident response.",
        {
          1: "Capture incident timeline, failed run, affected data, and owner before changing state.",
          2: "Record recovery commands, approvals, and validation queries.",
          3: "Compare recovered outputs with expected totals before reopening consumers.",
          4: "Turn recovery evidence into runbook updates and post-incident actions.",
        },
      ),
    ],
  },
] as const satisfies readonly PractitionerToolDefinition[];

export const practitionerToolSlugs = practitionerToolDefinitions.map(
  (definition) => definition.slug,
);

export function getPractitionerToolDefinition(
  slug: string,
): PractitionerToolDefinition | undefined {
  return practitionerToolDefinitions.find((definition) => definition.slug === slug);
}
