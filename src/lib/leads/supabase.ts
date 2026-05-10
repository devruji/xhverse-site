import type { SupabaseClient } from "@supabase/supabase-js";
import { leadSources, leadStatuses, type Lead, type LeadStatus } from "./types";

const TABLE_NAME = "leads";

export type LeadFetchState =
  | { kind: "loaded"; data: Lead[] }
  | { kind: "skipped"; reason: "not_configured" }
  | { kind: "failed"; message: string };

export type LeadUpdateState =
  | { kind: "updated" }
  | { kind: "skipped"; reason: "not_configured" }
  | { kind: "failed"; message: string };

export type LeadCreateState =
  | { kind: "created" }
  | { kind: "validation_error"; message: string }
  | { kind: "skipped"; reason: "not_configured" }
  | { kind: "failed"; message: string };

export type LeadCreatePayload = {
  email: string;
  name: string | null;
  source: string;
  source_id: string | null;
  notes: string | null;
};

export function validateLeadPayload(payload: LeadCreatePayload): string[] {
  const errors: string[] = [];

  if (!payload.email.trim()) {
    errors.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.push("Email must be valid.");
  }

  if (!leadSources.includes(payload.source as never)) {
    errors.push("Source is invalid.");
  }

  return errors;
}

export async function fetchLeads(
  client: SupabaseClient | null,
  statusFilter?: LeadStatus,
): Promise<LeadFetchState> {
  if (!client) return { kind: "skipped", reason: "not_configured" };

  let query = client
    .from(TABLE_NAME)
    .select("*")
    .order("collected_at", { ascending: false });

  if (statusFilter && leadStatuses.includes(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    return { kind: "failed", message: error.message };
  }

  return { kind: "loaded", data: (data ?? []) as Lead[] };
}

export async function updateLeadStatus(
  client: SupabaseClient | null,
  leadId: string,
  status: LeadStatus,
): Promise<LeadUpdateState> {
  if (!client) return { kind: "skipped", reason: "not_configured" };

  if (!leadStatuses.includes(status)) {
    return { kind: "failed", message: "Invalid status." };
  }

  const { error } = await client
    .from(TABLE_NAME)
    .update({ status })
    .eq("id", leadId);

  if (error) {
    return { kind: "failed", message: error.message };
  }

  return { kind: "updated" };
}

export async function createLead(
  client: SupabaseClient | null,
  payload: LeadCreatePayload,
): Promise<LeadCreateState> {
  if (!client) return { kind: "skipped", reason: "not_configured" };

  const validationErrors = validateLeadPayload(payload);
  if (validationErrors.length > 0) {
    return { kind: "validation_error", message: validationErrors.join(" ") };
  }

  const { error } = await client.from(TABLE_NAME).insert({
    email: payload.email.trim(),
    name: payload.name?.trim() || null,
    source: payload.source,
    source_id: payload.source_id,
    notes: payload.notes?.trim() || null,
  });

  if (error) {
    return { kind: "failed", message: error.message };
  }

  return { kind: "created" };
}
