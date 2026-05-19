import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { scdStrategies, type ScdStrategy } from "./scenarios";

const EVENTS_TABLE = "scd_design_lab_events";
const JOINS_TABLE = "scd_design_lab_joins";
const VISITOR_KEY = "xhverse-scd-lab-visitor-id";
const SESSION_KEY = "xhverse-scd-lab-session-id";

export const labVersion = "scd-design-lab-v1" as const;

export const trackingEventTypes = [
  "lab_opened",
  "lab_started",
  "step_completed",
  "design_selected",
  "result_generated",
  "completed",
  "joined",
] as const;

export type TrackingEventType = (typeof trackingEventTypes)[number];

type BrowserSupabaseEnv = {
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
};

export type LabIdentity = {
  visitorId: string;
  sessionId: string;
};

export type LabTrackingPayload = {
  session_id: string;
  visitor_id: string;
  lab_version: typeof labVersion;
  event_type: TrackingEventType;
  step_id: string | null;
  step_index: number | null;
  total_steps: number | null;
  progress_percent: number;
  result_key: string | null;
  payload: Record<string, string | number | boolean | null>;
};

export type LabJoinPayload = {
  session_id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string | null;
  consent_given: boolean;
  selected_strategy: ScdStrategy;
  score: number;
};

export type LabSaveState =
  | { kind: "saved" }
  | { kind: "skipped"; reason: "not_configured" | "do_not_track" }
  | { kind: "validation_error"; message: string }
  | { kind: "failed"; message: string };

export type BrowserStorage = Pick<Storage, "getItem" | "setItem">;

export function readBrowserSupabaseConfig(
  env: BrowserSupabaseEnv,
): { url: string; key: string } | null {
  const url = env.PUBLIC_SUPABASE_URL?.trim();
  const key =
    env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    env.PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return null;
  return { url, key };
}

export function createScdDesignLabClient(
  env: BrowserSupabaseEnv,
): SupabaseClient | null {
  const config = readBrowserSupabaseConfig(env);
  if (!config) return null;

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function getOrCreateLabIdentity(
  storage: BrowserStorage,
  generateId: () => string = randomId,
): LabIdentity {
  const visitorId = storage.getItem(VISITOR_KEY) ?? generateId();
  const sessionId = storage.getItem(SESSION_KEY) ?? generateId();
  storage.setItem(VISITOR_KEY, visitorId);
  storage.setItem(SESSION_KEY, sessionId);
  return { visitorId, sessionId };
}

export function shouldSkipTracking(doNotTrack: string | null | undefined): boolean {
  return doNotTrack === "1" || doNotTrack === "yes";
}

export function buildTrackingEvent(
  identity: LabIdentity,
  input: {
    eventType: TrackingEventType;
    stepId?: string | null;
    stepIndex?: number | null;
    totalSteps?: number | null;
    progressPercent: number;
    resultKey?: string | null;
    payload?: Record<string, string | number | boolean | null>;
  },
): LabTrackingPayload {
  return {
    session_id: identity.sessionId,
    visitor_id: identity.visitorId,
    lab_version: labVersion,
    event_type: input.eventType,
    step_id: input.stepId ?? null,
    step_index: input.stepIndex ?? null,
    total_steps: input.totalSteps ?? null,
    progress_percent: input.progressPercent,
    result_key: input.resultKey ?? null,
    payload: input.payload ?? {},
  };
}

export function validateTrackingPayload(payload: LabTrackingPayload): string[] {
  const errors: string[] = [];
  if (!payload.session_id.trim()) errors.push("session_id is required.");
  if (!payload.visitor_id.trim()) errors.push("visitor_id is required.");
  if (!trackingEventTypes.includes(payload.event_type)) {
    errors.push("event_type is invalid.");
  }
  if (!Number.isInteger(payload.progress_percent) || payload.progress_percent < 0 || payload.progress_percent > 100) {
    errors.push("progress_percent must be an integer between 0 and 100.");
  }
  if (payload.step_index !== null && (!Number.isInteger(payload.step_index) || payload.step_index < 0)) {
    errors.push("step_index must be a non-negative integer.");
  }
  if (payload.total_steps !== null && (!Number.isInteger(payload.total_steps) || payload.total_steps < 1)) {
    errors.push("total_steps must be a positive integer.");
  }
  return errors;
}

export async function trackScdDesignLabEvent(
  client: SupabaseClient | null,
  payload: LabTrackingPayload,
  doNotTrack?: string | null,
): Promise<LabSaveState> {
  if (shouldSkipTracking(doNotTrack)) {
    return { kind: "skipped", reason: "do_not_track" };
  }
  if (!client) return { kind: "skipped", reason: "not_configured" };

  const validationErrors = validateTrackingPayload(payload);
  if (validationErrors.length > 0) {
    return { kind: "validation_error", message: validationErrors.join(" ") };
  }

  const { error } = await client.from(EVENTS_TABLE).insert(payload);
  if (error) return { kind: "failed", message: error.message };
  return { kind: "saved" };
}

export function buildJoinPayload(
  identity: LabIdentity,
  input: {
    email: string;
    name?: string;
    company?: string;
    role?: string;
    consentGiven: boolean;
    selectedStrategy: ScdStrategy;
    score: number;
  },
): LabJoinPayload {
  return {
    session_id: identity.sessionId,
    email: input.email.trim(),
    name: input.name?.trim() || null,
    company: input.company?.trim() || null,
    role: input.role?.trim() || null,
    consent_given: input.consentGiven,
    selected_strategy: input.selectedStrategy,
    score: input.score,
  };
}

export function validateJoinPayload(payload: LabJoinPayload): string[] {
  const errors: string[] = [];
  if (!payload.session_id.trim()) errors.push("session_id is required.");
  if (!payload.email.trim()) {
    errors.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push("Email must be valid.");
  }
  if (!payload.consent_given) errors.push("Consent is required.");
  if (!scdStrategies.includes(payload.selected_strategy)) {
    errors.push("selected_strategy is invalid.");
  }
  if (!Number.isInteger(payload.score) || payload.score < 0 || payload.score > 100) {
    errors.push("score must be an integer between 0 and 100.");
  }
  return errors;
}

export async function submitScdDesignLabJoin(
  client: SupabaseClient | null,
  payload: LabJoinPayload,
): Promise<LabSaveState> {
  if (!client) return { kind: "skipped", reason: "not_configured" };

  const validationErrors = validateJoinPayload(payload);
  if (validationErrors.length > 0) {
    return { kind: "validation_error", message: validationErrors.join(" ") };
  }

  const { error } = await client.from(JOINS_TABLE).insert(payload);
  if (error) return { kind: "failed", message: error.message };
  return { kind: "saved" };
}
