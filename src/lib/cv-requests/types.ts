export const cvRequestContexts = [
  "engagement",
  "evaluation",
  "networking",
  "other",
] as const;

export type CvRequestContext = (typeof cvRequestContexts)[number];

export const cvRequestStatuses = [
  "pending",
  "approved",
  "rejected",
  "blocked",
] as const;

export type CvRequestStatus = (typeof cvRequestStatuses)[number];

export type CvDownloadRequest = {
  id: string;
  email: string;
  name: string | null;
  context: CvRequestContext | null;
  status: CvRequestStatus;
  requested_at: string;
  approved_at: string | null;
  sent_at: string | null;
  notes: string | null;
  ip_hash: string | null;
};

export type CvRequestSubmission = {
  email: string;
  name: string | null;
  context: CvRequestContext | null;
  honeypot: string;
};

export const contextLabels: Record<CvRequestContext, string> = {
  engagement: "Potential engagement",
  evaluation: "Evaluating fit",
  networking: "Networking / research",
  other: "Other",
};
