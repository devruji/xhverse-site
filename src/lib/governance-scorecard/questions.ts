export const governanceCategories = [
  "sponsorship",
  "policy",
  "tooling",
  "process",
  "regulatory",
] as const;

export type GovernanceCategory = (typeof governanceCategories)[number];

export type GovernanceOptionValue = 1 | 2 | 3 | 4;

export type GovernanceQuestion = {
  id: string;
  category: GovernanceCategory;
  prompt: string;
  options: Array<{ value: GovernanceOptionValue; label: string }>;
};

export type GovernanceAnswers = Record<string, GovernanceOptionValue>;

export const categoryLabels: Record<GovernanceCategory, string> = {
  sponsorship: "Sponsorship & Ownership",
  policy: "Policy & Standards",
  tooling: "Tooling & Catalog",
  process: "Process & Culture",
  regulatory: "Regulatory Exposure",
};

export const categoryDescriptions: Record<GovernanceCategory, string> = {
  sponsorship:
    "Executive backing, data owner roles, funding, and accountability structure.",
  policy:
    "Classification, retention, quality rules, and lineage tracking.",
  tooling:
    "Catalog deployment, access automation, PII scanning, and platform integration.",
  process:
    "Stewardship community, change management, training, and incident response.",
  regulatory:
    "Industry regulations, cross-border flows, audit frequency, and consent management.",
};

export const governanceQuestions: GovernanceQuestion[] = [
  {
    id: "sponsorship-1",
    category: "sponsorship",
    prompt: "Is there an identified executive sponsor for data governance?",
    options: [
      { value: 1, label: "No sponsor identified" },
      { value: 2, label: "Informal champion but no formal mandate" },
      { value: 3, label: "Named sponsor with partial authority" },
      { value: 4, label: "C-level sponsor with budget and mandate" },
    ],
  },
  {
    id: "sponsorship-2",
    category: "sponsorship",
    prompt: "Are data ownership roles clearly assigned across domains?",
    options: [
      { value: 1, label: "No defined owners — ad hoc responsibility" },
      { value: 2, label: "Some owners named but roles are unclear" },
      { value: 3, label: "Owners assigned with documented responsibilities" },
      { value: 4, label: "Owners accountable with regular review cadence" },
    ],
  },
  {
    id: "sponsorship-3",
    category: "sponsorship",
    prompt: "How is governance funded?",
    options: [
      { value: 1, label: "No dedicated funding" },
      { value: 2, label: "Funded as part of IT budget without clear allocation" },
      { value: 3, label: "Dedicated budget line item" },
      { value: 4, label: "Multi-year funded program with headcount" },
    ],
  },
  {
    id: "sponsorship-4",
    category: "sponsorship",
    prompt: "Is there a clear accountability structure for governance decisions?",
    options: [
      { value: 1, label: "Decisions happen informally or not at all" },
      { value: 2, label: "A committee exists but meets irregularly" },
      { value: 3, label: "Regular governance board with defined authority" },
      { value: 4, label: "Multi-tier structure (strategic + operational) with escalation paths" },
    ],
  },
  {
    id: "policy-1",
    category: "policy",
    prompt: "Does a data classification scheme exist?",
    options: [
      { value: 1, label: "No classification scheme" },
      { value: 2, label: "Informal labels used inconsistently" },
      { value: 3, label: "Defined scheme applied to critical datasets" },
      { value: 4, label: "Comprehensive scheme enforced with automated tagging" },
    ],
  },
  {
    id: "policy-2",
    category: "policy",
    prompt: "Are data retention policies documented and enforced?",
    options: [
      { value: 1, label: "No retention policies" },
      { value: 2, label: "Policies exist but not enforced" },
      { value: 3, label: "Policies enforced for regulated data" },
      { value: 4, label: "Comprehensive policies with automated lifecycle management" },
    ],
  },
  {
    id: "policy-3",
    category: "policy",
    prompt: "Are data quality rules defined for key datasets?",
    options: [
      { value: 1, label: "No quality rules defined" },
      { value: 2, label: "Ad hoc checks on some pipelines" },
      { value: 3, label: "Systematic rules for critical data products" },
      { value: 4, label: "Comprehensive DQ framework with SLAs and alerting" },
    ],
  },
  {
    id: "policy-4",
    category: "policy",
    prompt: "Is data lineage tracked across your platform?",
    options: [
      { value: 1, label: "No lineage tracking" },
      { value: 2, label: "Manual documentation for some flows" },
      { value: 3, label: "Automated lineage for key pipelines" },
      { value: 4, label: "End-to-end automated lineage with impact analysis" },
    ],
  },
  {
    id: "tooling-1",
    category: "tooling",
    prompt: "Is a data catalog deployed and actively used?",
    options: [
      { value: 1, label: "No catalog tool" },
      { value: 2, label: "Tool deployed but low adoption" },
      { value: 3, label: "Catalog used by data teams for discovery" },
      { value: 4, label: "Catalog is the single source of truth, used org-wide" },
    ],
  },
  {
    id: "tooling-2",
    category: "tooling",
    prompt: "Is access management automated or manual?",
    options: [
      { value: 1, label: "Fully manual (tickets, emails)" },
      { value: 2, label: "Partially automated with manual approval" },
      { value: 3, label: "Automated provisioning with policy-based rules" },
      { value: 4, label: "Self-service access with automated classification enforcement" },
    ],
  },
  {
    id: "tooling-3",
    category: "tooling",
    prompt: "Is PII/sensitive data scanning in place?",
    options: [
      { value: 1, label: "No scanning capability" },
      { value: 2, label: "Manual audits performed occasionally" },
      { value: 3, label: "Automated scanning on ingest for known patterns" },
      { value: 4, label: "Continuous scanning with auto-classification and masking" },
    ],
  },
  {
    id: "tooling-4",
    category: "tooling",
    prompt: "How integrated is your governance tooling with the data platform?",
    options: [
      { value: 1, label: "Completely separate systems" },
      { value: 2, label: "Some manual integration points" },
      { value: 3, label: "API-level integration with key platform components" },
      { value: 4, label: "Native platform integration (e.g., Unity Catalog, Purview)" },
    ],
  },
  {
    id: "process-1",
    category: "process",
    prompt: "Is there an active data stewardship community?",
    options: [
      { value: 1, label: "No stewards identified" },
      { value: 2, label: "Stewards named but inactive" },
      { value: 3, label: "Active stewards with regular meetings" },
      { value: 4, label: "Stewardship network with defined workflows and metrics" },
    ],
  },
  {
    id: "process-2",
    category: "process",
    prompt: "Is there a change management process for data assets?",
    options: [
      { value: 1, label: "No change management — changes happen ad hoc" },
      { value: 2, label: "Informal notification for breaking changes" },
      { value: 3, label: "Defined process with impact assessment" },
      { value: 4, label: "Versioned contracts with consumer notification and migration support" },
    ],
  },
  {
    id: "process-3",
    category: "process",
    prompt: "How is data governance training handled?",
    options: [
      { value: 1, label: "No training available" },
      { value: 2, label: "Ad hoc onboarding for new team members" },
      { value: 3, label: "Structured training program for data roles" },
      { value: 4, label: "Continuous education with role-specific certification paths" },
    ],
  },
  {
    id: "process-4",
    category: "process",
    prompt: "Is there an incident response process for data issues?",
    options: [
      { value: 1, label: "No defined process — firefighting mode" },
      { value: 2, label: "Basic escalation path exists" },
      { value: 3, label: "Defined severity levels with response SLAs" },
      { value: 4, label: "Full incident lifecycle with postmortems and prevention" },
    ],
  },
  {
    id: "regulatory-1",
    category: "regulatory",
    prompt: "How regulated is your industry?",
    options: [
      { value: 1, label: "Minimal regulation" },
      { value: 2, label: "Light regulation (general GDPR/privacy)" },
      { value: 3, label: "Moderately regulated (financial, healthcare adjacent)" },
      { value: 4, label: "Heavily regulated (banking, pharma, government)" },
    ],
  },
  {
    id: "regulatory-2",
    category: "regulatory",
    prompt: "Do you have cross-border data flows?",
    options: [
      { value: 1, label: "Single country operations" },
      { value: 2, label: "Regional with limited cross-border" },
      { value: 3, label: "Multi-region with data residency requirements" },
      { value: 4, label: "Global operations with complex jurisdictional rules" },
    ],
  },
  {
    id: "regulatory-3",
    category: "regulatory",
    prompt: "How frequently are you audited on data practices?",
    options: [
      { value: 1, label: "Never been audited" },
      { value: 2, label: "Annual internal review" },
      { value: 3, label: "Regular external audits (annual or biannual)" },
      { value: 4, label: "Continuous compliance monitoring with frequent external audits" },
    ],
  },
  {
    id: "regulatory-4",
    category: "regulatory",
    prompt: "Is consent and preference management in place?",
    options: [
      { value: 1, label: "No consent management" },
      { value: 2, label: "Basic cookie consent only" },
      { value: 3, label: "Consent tracked for key data collection points" },
      { value: 4, label: "Comprehensive preference center with downstream enforcement" },
    ],
  },
];
