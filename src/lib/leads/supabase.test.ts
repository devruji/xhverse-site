import { describe, expect, it, vi } from "vitest";
import { createLead, fetchLeads, updateLeadStatus, validateLeadPayload } from "./supabase";
import type { LeadCreatePayload } from "./supabase";

describe("validateLeadPayload", () => {
  const validPayload: LeadCreatePayload = { email: "user@company.com", name: "Test User", source: "cv_request", source_id: null, notes: null };

  it("returns empty array for valid payload", () => { expect(validateLeadPayload(validPayload)).toEqual([]); });
  it("rejects empty email", () => { expect(validateLeadPayload({ ...validPayload, email: "" })).toContain("Email is required."); });
  it("rejects whitespace-only email", () => { expect(validateLeadPayload({ ...validPayload, email: "   " })).toContain("Email is required."); });
  it("rejects invalid email format", () => { expect(validateLeadPayload({ ...validPayload, email: "not-email" })).toContain("Email must be valid."); });
  it("rejects invalid source", () => { expect(validateLeadPayload({ ...validPayload, source: "invalid" })).toContain("Source is invalid."); });
  it("accepts all valid sources", () => { for (const source of ["cv_request", "maturity_tool", "governance_tool", "contact_form"]) { expect(validateLeadPayload({ ...validPayload, source })).toEqual([]); } });
  it("returns multiple errors when both email and source are invalid", () => { const errors = validateLeadPayload({ ...validPayload, email: "bad", source: "wrong" }); expect(errors).toContain("Email must be valid."); expect(errors).toContain("Source is invalid."); });
});

describe("fetchLeads", () => {
  it("returns skipped when client is null", async () => { expect(await fetchLeads(null)).toEqual({ kind: "skipped", reason: "not_configured" }); });

  it("returns loaded data on success", async () => {
    const mockData = [{ id: "1", email: "a@b.com", status: "new", collected_at: "2026-01-01T00:00:00Z" }];
    const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    const fromMock = vi.fn().mockReturnValue({ select: selectMock });
    expect(await fetchLeads({ from: fromMock } as never)).toEqual({ kind: "loaded", data: mockData });
  });

  it("returns loaded with empty array when data is null", async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    const fromMock = vi.fn().mockReturnValue({ select: selectMock });
    expect(await fetchLeads({ from: fromMock } as never)).toEqual({ kind: "loaded", data: [] });
  });

  it("returns failed on query error", async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: null, error: { message: "Auth error" } });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    const fromMock = vi.fn().mockReturnValue({ select: selectMock });
    expect(await fetchLeads({ from: fromMock } as never)).toEqual({ kind: "failed", message: "Auth error" });
  });

  it("filters by status when provided", async () => {
    const mockData = [{ id: "1", email: "a@b.com", status: "contacted", collected_at: "2026-01-01T00:00:00Z" }];
    const eqMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const orderMock = vi.fn().mockReturnValue({ eq: eqMock });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    const fromMock = vi.fn().mockReturnValue({ select: selectMock });
    const result = await fetchLeads({ from: fromMock } as never, "contacted");
    expect(result).toEqual({ kind: "loaded", data: mockData });
    expect(eqMock).toHaveBeenCalledWith("status", "contacted");
  });

  it("ignores invalid status filter", async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    const fromMock = vi.fn().mockReturnValue({ select: selectMock });
    expect(await fetchLeads({ from: fromMock } as never, "invalid" as never)).toEqual({ kind: "loaded", data: [] });
  });
});

describe("updateLeadStatus", () => {
  it("returns skipped when client is null", async () => { expect(await updateLeadStatus(null, "id-1", "contacted")).toEqual({ kind: "skipped", reason: "not_configured" }); });

  it("returns updated on success", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const fromMock = vi.fn().mockReturnValue({ update: updateMock });
    const result = await updateLeadStatus({ from: fromMock } as never, "id-1", "contacted");
    expect(result).toEqual({ kind: "updated" });
    expect(updateMock).toHaveBeenCalledWith({ status: "contacted" });
  });

  it("returns failed on update error", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: "Not found" } });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const fromMock = vi.fn().mockReturnValue({ update: updateMock });
    expect(await updateLeadStatus({ from: fromMock } as never, "id-1", "archived")).toEqual({ kind: "failed", message: "Not found" });
  });

  it("returns failed for invalid status", async () => { expect(await updateLeadStatus({ from: vi.fn() } as never, "id-1", "bogus" as never)).toEqual({ kind: "failed", message: "Invalid status." }); });

  it("accepts all valid statuses", async () => {
    for (const status of ["new", "contacted", "converted", "archived"] as const) {
      const eqMock = vi.fn().mockResolvedValue({ error: null });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });
      expect(await updateLeadStatus({ from: fromMock } as never, "id-1", status)).toEqual({ kind: "updated" });
    }
  });
});

describe("createLead", () => {
  const validPayload: LeadCreatePayload = { email: "user@company.com", name: "Test User", source: "cv_request", source_id: null, notes: null };

  it("returns skipped when client is null", async () => { expect(await createLead(null, validPayload)).toEqual({ kind: "skipped", reason: "not_configured" }); });

  it("returns validation_error for invalid payload", async () => { expect(await createLead({ from: vi.fn() } as never, { ...validPayload, email: "" })).toEqual({ kind: "validation_error", message: "Email is required." }); });

  it("returns created on success", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    const result = await createLead({ from: fromMock } as never, validPayload);
    expect(result).toEqual({ kind: "created" });
    expect(insertMock).toHaveBeenCalledWith({ email: "user@company.com", name: "Test User", source: "cv_request", source_id: null, notes: null });
  });

  it("returns failed on insert error", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: { message: "Duplicate" } });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    expect(await createLead({ from: fromMock } as never, validPayload)).toEqual({ kind: "failed", message: "Duplicate" });
  });

  it("trims email and name before insert", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    await createLead({ from: fromMock } as never, { ...validPayload, email: "  user@company.com  ", name: "  John  " });
    expect(insertMock).toHaveBeenCalledWith({ email: "user@company.com", name: "John", source: "cv_request", source_id: null, notes: null });
  });

  it("sets name to null when empty after trim", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    await createLead({ from: fromMock } as never, { ...validPayload, name: "   " });
    expect(insertMock).toHaveBeenCalledWith({ email: "user@company.com", name: null, source: "cv_request", source_id: null, notes: null });
  });

  it("trims notes before insert", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    await createLead({ from: fromMock } as never, { ...validPayload, notes: "  Some note  " });
    expect(insertMock).toHaveBeenCalledWith({ email: "user@company.com", name: "Test User", source: "cv_request", source_id: null, notes: "Some note" });
  });

  it("sets notes to null when empty after trim", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    await createLead({ from: fromMock } as never, { ...validPayload, notes: "   " });
    expect(insertMock).toHaveBeenCalledWith({ email: "user@company.com", name: "Test User", source: "cv_request", source_id: null, notes: null });
  });
});
