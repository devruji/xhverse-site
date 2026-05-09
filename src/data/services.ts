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
      "A focused assessment of your current data platform architecture — identifying structural gaps, governance risks, and opportunities to simplify before scaling.",
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
      "Designing the access model, ownership patterns, naming standards, and operating rules that make your platform governable at scale — not just today, but as the team grows.",
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
      "A longer-term partnership for teams navigating complex platform decisions — migration paths, vendor evaluations, capability roadmaps, and the communication that gets stakeholders aligned.",
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
      "We start with a short conversation to understand your platform context, constraints, and what success looks like. No proposals until I understand the problem.",
  },
  {
    label: "02",
    title: "Deliver",
    description:
      "Focused execution against a clear scope. You get working documents, architecture decisions, and practical recommendations — not slide decks.",
  },
  {
    label: "03",
    title: "Handover",
    description:
      "Everything is designed for your team to own and operate. Clear documentation, recorded decisions, and enough context that the work outlives the engagement.",
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
