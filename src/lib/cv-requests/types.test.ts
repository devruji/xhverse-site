import { describe, expect, it } from "vitest";
import {
  contextLabels,
  cvRequestContexts,
  cvRequestStatuses,
  type CvDownloadRequest,
  type CvRequestContext,
  type CvRequestStatus,
  type CvRequestSubmission,
} from "./types";

describe("cvRequestContexts", () => {
  it("contains the four context values", () => {
    expect(cvRequestContexts).toEqual([
      "engagement",
      "evaluation",
      "networking",
      "other",
    ]);
  });

  it("values satisfy CvRequestContext type", () => {
    const values: CvRequestContext[] = [...cvRequestContexts];
    expect(values).toHaveLength(4);
  });
});

describe("cvRequestStatuses", () => {
  it("contains the four status values", () => {
    expect(cvRequestStatuses).toEqual([
      "pending",
      "approved",
      "rejected",
      "blocked",
    ]);
  });

  it("values satisfy CvRequestStatus type", () => {
    const values: CvRequestStatus[] = [...cvRequestStatuses];
    expect(values).toHaveLength(4);
  });
});

describe("contextLabels", () => {
  it("maps each context to a human-readable label", () => {
    expect(contextLabels.engagement).toBe("Potential engagement");
    expect(contextLabels.evaluation).toBe("Evaluating fit");
    expect(contextLabels.networking).toBe("Networking / research");
    expect(contextLabels.other).toBe("Other");
  });

  it("has an entry for every context", () => {
    for (const ctx of cvRequestContexts) {
      expect(contextLabels[ctx]).toBeDefined();
    }
  });
});

describe("CvDownloadRequest type", () => {
  it("allows construction of a well-formed request object", () => {
    const request: CvDownloadRequest = {
      id: "uuid-123",
      email: "test@example.com",
      name: "Test User",
      context: "engagement",
      status: "pending",
      requested_at: "2026-01-01T00:00:00Z",
      approved_at: null,
      sent_at: null,
      notes: null,
      ip_hash: null,
    };
    expect(request.id).toBe("uuid-123");
    expect(request.status).toBe("pending");
  });

  it("allows nullable fields to be null", () => {
    const request: CvDownloadRequest = {
      id: "uuid-456",
      email: "another@example.com",
      name: null,
      context: null,
      status: "approved",
      requested_at: "2026-01-01T00:00:00Z",
      approved_at: "2026-01-02T00:00:00Z",
      sent_at: "2026-01-02T01:00:00Z",
      notes: "Sent via email",
      ip_hash: "abc123",
    };
    expect(request.name).toBeNull();
    expect(request.context).toBeNull();
    expect(request.approved_at).toBe("2026-01-02T00:00:00Z");
  });
});

describe("CvRequestSubmission type", () => {
  it("allows construction of a submission", () => {
    const submission: CvRequestSubmission = {
      email: "submit@example.com",
      name: "Submitter",
      context: "networking",
      honeypot: "",
    };
    expect(submission.email).toBe("submit@example.com");
    expect(submission.honeypot).toBe("");
  });
});
