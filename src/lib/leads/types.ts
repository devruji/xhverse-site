export const leadSources = [
  "cv_request",
  "maturity_tool",
  "governance_tool",
  "contact_form",
] as const;

export type LeadSource = (typeof leadSources)[number];

export const leadStatuses = [
  "new",
  "contacted",
  "converted",
  "archived",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type Lead = {
  id: string;
  email: string;
  name: string | null;
  source: LeadSource;
  source_id: string | null;
  status: LeadStatus;
  collected_at: string;
  notes: string | null;
};

export const sourceLabels: Record<LeadSource, string> = {
  cv_request: "CV Request",
  maturity_tool: "Maturity Tool",
  governance_tool: "Governance Tool",
  contact_form: "Contact Form",
};

export const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  archived: "Archived",
};
