export interface EngagementType {
  id: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
  stack: string;
}

export interface ProcessStep {
  label: string;
  title: string;
  description: string;
}

export const engagementTypes: EngagementType[] = [
  {
    id: "architecture-review",
    title: "Architecture Review",
    duration: "1–2 weeks",
    description:
      "I assess your current data platform architecture, identify structural gaps and governance risks, and recommend where to simplify.",
    deliverables: [
      "Architecture assessment document",
      "Risk and gap analysis",
      "Prioritized recommendations with effort estimates",
      "Architecture decision records (ADRs) for key choices",
    ],
    stack: "Azure · Databricks · Fabric · Lakehouse",
  },
  {
    id: "governance-design",
    title: "Governance Design",
    duration: "2–4 weeks",
    description:
      "I design access models, ownership patterns, naming standards, and operating rules for your data platform.",
    deliverables: [
      "Governance framework document",
      "Access and ownership model",
      "Naming and tagging standards",
      "Operating runbooks for platform teams",
    ],
    stack: "Unity Catalog · Workspace Design · Policy",
  },
  {
    id: "platform-strategy",
    title: "Platform Strategy",
    duration: "Ongoing advisory",
    description:
      "Ongoing advice on migration paths, vendor evaluations, capability roadmaps, and stakeholder communication.",
    deliverables: [
      "Platform capability roadmap",
      "Migration or consolidation strategy",
      "Stakeholder-ready architecture narratives",
      "Regular advisory sessions",
    ],
    stack: "Enterprise · Multi-cloud · Strategy",
  },
];

export const processSteps: ProcessStep[] = [
  {
    label: "01",
    title: "Scope",
    description:
      "We discuss your platform context, constraints, and what success looks like before agreeing on scope.",
  },
  {
    label: "02",
    title: "Deliver",
    description:
      "I work against the agreed scope and deliver documents, architecture decisions, and recommendations your team can review.",
  },
  {
    label: "03",
    title: "Handover",
    description:
      "I hand over the documentation, recorded decisions, and context your team needs to own and operate the outputs.",
  },
];

export const fitSignals: string[] = [
  "Your data platform is growing faster than your governance",
  "You're evaluating Databricks, Fabric, or a lakehouse migration",
  "Your team needs clearer architecture standards before scaling",
  "Stakeholders are asking questions your current documentation can't answer",
  "You want an independent perspective — not a vendor pitch",
];

export const antiSignals: string[] = [
  "You need hands-on engineering (building pipelines, writing Spark jobs)",
  "You're looking for a full-time hire rather than advisory",
  "The project scope isn't defined enough for a focused engagement yet",
  "You need vendor-certified implementation support",
];
