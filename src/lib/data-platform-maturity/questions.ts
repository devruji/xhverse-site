export const maturityCategories = [
  "platform_architecture",
  "governance",
  "analytics_delivery",
  "operations",
  "documentation",
] as const;

export type MaturityCategory = (typeof maturityCategories)[number];

export type AssessmentOptionValue = 1 | 2 | 3 | 4 | 5;

export type AssessmentQuestion = {
  id: string;
  category: MaturityCategory;
  prompt: string;
  helpText: string;
};

export const categoryLabels: Record<MaturityCategory, string> = {
  platform_architecture: "Platform architecture",
  governance: "Governance",
  analytics_delivery: "Analytics delivery",
  operations: "Operations",
  documentation: "Documentation",
};

export const assessmentOptions: Array<{
  value: AssessmentOptionValue;
  label: string;
  description: string;
}> = [
  {
    value: 1,
    label: "Ad hoc",
    description: "Mostly informal or handled case by case.",
  },
  {
    value: 2,
    label: "Emerging",
    description: "Some patterns exist, but adoption is inconsistent.",
  },
  {
    value: 3,
    label: "Defined",
    description: "A clear standard exists for common work.",
  },
  {
    value: 4,
    label: "Managed",
    description: "Standards are operated, reviewed, and improved.",
  },
  {
    value: 5,
    label: "Optimized",
    description: "The capability is measured and continuously improved.",
  },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "platform-architecture-1",
    category: "platform_architecture",
    prompt: "How clearly is your data platform architecture defined across storage, compute, transformation, and serving layers?",
    helpText: "Think about whether teams share a common architecture map, not whether every component is perfect.",
  },
  {
    id: "platform-architecture-2",
    category: "platform_architecture",
    prompt: "How consistently do teams use approved platform patterns for environments, workspaces, pipelines, and data products?",
    helpText: "Look for repeatable patterns rather than one-off setup knowledge.",
  },
  {
    id: "platform-architecture-3",
    category: "platform_architecture",
    prompt: "How well does the platform separate experimental, operational, and production-grade workloads?",
    helpText: "Consider environment boundaries, compute policies, data zones, and promotion paths.",
  },
  {
    id: "governance-1",
    category: "governance",
    prompt: "How clear are ownership responsibilities for datasets, semantic models, access groups, and platform standards?",
    helpText: "Ownership should be discoverable and actionable, not only implied.",
  },
  {
    id: "governance-2",
    category: "governance",
    prompt: "How consistently are access, security, and data-sharing rules applied across the platform?",
    helpText: "Consider whether exceptions are visible, justified, and reviewed.",
  },
  {
    id: "governance-3",
    category: "governance",
    prompt: "How mature is your process for approving and auditing changes to data platform controls?",
    helpText: "This includes permission changes, policy changes, and production-impacting configuration.",
  },
  {
    id: "analytics-delivery-1",
    category: "analytics_delivery",
    prompt: "How reliably can teams deliver trusted analytics outputs from raw data through reporting or data products?",
    helpText: "Assess delivery quality across pipelines, models, dashboards, and handover.",
  },
  {
    id: "analytics-delivery-2",
    category: "analytics_delivery",
    prompt: "How consistently are business definitions and semantic layers managed across domains?",
    helpText: "Look for shared definitions, ownership, versioning, and change communication.",
  },
  {
    id: "analytics-delivery-3",
    category: "analytics_delivery",
    prompt: "How well do delivery teams balance speed with quality controls such as testing, review, and release checks?",
    helpText: "A mature path should reduce rework without blocking practical delivery.",
  },
  {
    id: "operations-1",
    category: "operations",
    prompt: "How visible are production health, incidents, pipeline failures, cost drivers, and service ownership?",
    helpText: "Consider whether issues can be detected, assigned, and resolved without tribal knowledge.",
  },
  {
    id: "operations-2",
    category: "operations",
    prompt: "How repeatable are operational tasks such as deployment, access review, environment setup, and recovery?",
    helpText: "Maturity shows up in runbooks, automation, and predictable execution.",
  },
  {
    id: "operations-3",
    category: "operations",
    prompt: "How actively are platform usage, performance, reliability, and cost signals reviewed?",
    helpText: "Signals should drive decisions, not only exist as dashboard noise.",
  },
  {
    id: "documentation-1",
    category: "documentation",
    prompt: "How current and useful is documentation for architecture, standards, ownership, and operating procedures?",
    helpText: "Useful documentation helps teams make decisions and run the platform.",
  },
  {
    id: "documentation-2",
    category: "documentation",
    prompt: "How well are major platform decisions recorded with context, trade-offs, and follow-up actions?",
    helpText: "Decision records reduce repeated debate and hidden assumptions.",
  },
  {
    id: "documentation-3",
    category: "documentation",
    prompt: "How easy is it for a new engineer or analyst to understand the platform path for common work?",
    helpText: "Assess onboarding clarity for real workflows, not only static diagrams.",
  },
];

export type AssessmentAnswers = Record<string, AssessmentOptionValue>;
