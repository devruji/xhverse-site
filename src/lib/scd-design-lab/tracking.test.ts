import { describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  buildJoinPayload,
  buildTrackingEvent,
  createScdDesignLabClient,
  getOrCreateLabIdentity,
  labVersion,
  readBrowserSupabaseConfig,
  shouldSkipTracking,
  submitScdDesignLabJoin,
  trackScdDesignLabEvent,
  validateJoinPayload,
  validateTrackingPayload,
} from "./tracking";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const state = { ...initial };
  return {
    get length() {
      return Object.keys(state).length;
    },
    clear: vi.fn(),
    getItem: vi.fn((key: string) => state[key] ?? null),
    key: vi.fn(),
    removeItem: vi.fn((key: string) => {
      delete state[key];
    }),
    setItem: vi.fn((key: string, value: string) => {
      state[key] = value;
    }),
  };
}

describe("Supabase config", () => {
  it("returns null when public credentials are missing and trims credentials", () => {
    expect(readBrowserSupabaseConfig({})).toBeNull();
    expect(
      readBrowserSupabaseConfig({ PUBLIC_SUPABASE_URL: "https://x.supabase.co" }),
    ).toBeNull();
    expect(
      readBrowserSupabaseConfig({
        PUBLIC_SUPABASE_URL: " https://x.supabase.co ",
        PUBLIC_SUPABASE_PUBLISHABLE_KEY: " pub ",
        PUBLIC_SUPABASE_ANON_KEY: "anon",
      }),
    ).toEqual({ url: "https://x.supabase.co", key: "pub" });
    expect(
      readBrowserSupabaseConfig({
        PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        PUBLIC_SUPABASE_ANON_KEY: " anon ",
      }),
    ).toEqual({ url: "https://x.supabase.co", key: "anon" });
  });

  it("creates a non-persistent browser client", () => {
    vi.mocked(createClient).mockReset();
    const client = { from: vi.fn() };
    vi.mocked(createClient).mockReturnValue(client as never);

    expect(createScdDesignLabClient({})).toBeNull();
    expect(
      createScdDesignLabClient({
        PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        PUBLIC_SUPABASE_PUBLISHABLE_KEY: "key",
      }),
    ).toBe(client);
    expect(createClient).toHaveBeenCalledWith("https://x.supabase.co", "key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  });
});

describe("lab identity", () => {
  it("creates and reuses visitor/session ids", () => {
    const storage = memoryStorage();
    const ids = ["visitor-1", "session-1"];
    const identity = getOrCreateLabIdentity(storage, () => ids.shift() ?? "fallback");
    expect(identity).toEqual({ visitorId: "visitor-1", sessionId: "session-1" });

    const reused = getOrCreateLabIdentity(storage, () => "new");
    expect(reused).toEqual(identity);
  });

  it("can create ids with the default random generator", () => {
    const storage = memoryStorage();

    const identity = getOrCreateLabIdentity(storage);

    expect(identity.visitorId).toBeTruthy();
    expect(identity.sessionId).toBeTruthy();
  });

  it("falls back when crypto randomUUID is unavailable", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: undefined,
    });
    const storage = memoryStorage();

    try {
      const identity = getOrCreateLabIdentity(storage);
      expect(identity.visitorId).toContain("-");
      expect(identity.sessionId).toContain("-");
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, "crypto", descriptor);
      }
    }
  });
});

describe("tracking events", () => {
  const identity = { visitorId: "visitor", sessionId: "session" };

  it("builds and validates tracking payloads", () => {
    const payload = buildTrackingEvent(identity, {
      eventType: "step_completed",
      stepId: "loyalty-tier-at-transaction-time",
      stepIndex: 1,
      totalSteps: 5,
      progressPercent: 20,
      resultKey: "good_fit",
      payload: { strategy: "type_2", correct: true },
    });

    expect(payload.lab_version).toBe(labVersion);
    expect(validateTrackingPayload(payload)).toEqual([]);

    expect(
      validateTrackingPayload({
        ...payload,
        session_id: "",
        visitor_id: "",
        event_type: "bad" as never,
        progress_percent: 101,
        step_index: -1,
        total_steps: 0,
      }),
    ).toEqual([
      "session_id is required.",
      "visitor_id is required.",
      "event_type is invalid.",
      "progress_percent must be an integer between 0 and 100.",
      "step_index must be a non-negative integer.",
      "total_steps must be a positive integer.",
    ]);
  });

  it("honors do-not-track signals", () => {
    expect(shouldSkipTracking("1")).toBe(true);
    expect(shouldSkipTracking("yes")).toBe(true);
    expect(shouldSkipTracking("0")).toBe(false);
    expect(shouldSkipTracking(undefined)).toBe(false);
  });

  it("skips without a client, validates before insert, and reports insert state", async () => {
    const valid = buildTrackingEvent(identity, {
      eventType: "lab_opened",
      progressPercent: 0,
    });

    await expect(trackScdDesignLabEvent(null, valid)).resolves.toEqual({
      kind: "skipped",
      reason: "not_configured",
    });
    await expect(trackScdDesignLabEvent(null, valid, "1")).resolves.toEqual({
      kind: "skipped",
      reason: "do_not_track",
    });

    const from = vi.fn();
    await expect(
      trackScdDesignLabEvent({ from } as never, { ...valid, progress_percent: -1 }),
    ).resolves.toEqual({
      kind: "validation_error",
      message: "progress_percent must be an integer between 0 and 100.",
    });
    expect(from).not.toHaveBeenCalled();

    const insert = vi.fn().mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({
      error: { message: "permission denied" },
    });
    const client = { from: vi.fn().mockReturnValue({ insert }) };

    await expect(trackScdDesignLabEvent(client as never, valid)).resolves.toEqual({
      kind: "saved",
    });
    await expect(trackScdDesignLabEvent(client as never, valid)).resolves.toEqual({
      kind: "failed",
      message: "permission denied",
    });
    expect(client.from).toHaveBeenCalledWith("scd_design_lab_events");
  });
});

describe("join payloads", () => {
  const identity = { visitorId: "visitor", sessionId: "session" };

  it("builds and validates explicit join payloads", () => {
    const payload = buildJoinPayload(identity, {
      email: " person@example.com ",
      name: " Ada ",
      company: " XH ",
      role: " Architect ",
      consentGiven: true,
      selectedStrategy: "type_2",
      score: 90,
    });

    expect(payload).toEqual({
      session_id: "session",
      email: "person@example.com",
      name: "Ada",
      company: "XH",
      role: "Architect",
      consent_given: true,
      selected_strategy: "type_2",
      score: 90,
    });
    expect(validateJoinPayload(payload)).toEqual([]);

    expect(
      validateJoinPayload({
        ...payload,
        session_id: "",
        email: "bad",
        consent_given: false,
        selected_strategy: "bad" as never,
        score: 101,
      }),
    ).toEqual([
      "session_id is required.",
      "Email must be valid.",
      "Consent is required.",
      "selected_strategy is invalid.",
      "score must be an integer between 0 and 100.",
    ]);
    expect(validateJoinPayload({ ...payload, email: " " })).toContain(
      "Email is required.",
    );
  });

  it("skips without a client, validates before insert, and reports insert state", async () => {
    const payload = buildJoinPayload(identity, {
      email: "person@example.com",
      consentGiven: true,
      selectedStrategy: "type_2",
      score: 90,
    });

    await expect(submitScdDesignLabJoin(null, payload)).resolves.toEqual({
      kind: "skipped",
      reason: "not_configured",
    });

    const from = vi.fn();
    await expect(
      submitScdDesignLabJoin({ from } as never, { ...payload, email: "bad" }),
    ).resolves.toEqual({
      kind: "validation_error",
      message: "Email must be valid.",
    });
    expect(from).not.toHaveBeenCalled();

    const insert = vi.fn().mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({
      error: { message: "duplicate" },
    });
    const client = { from: vi.fn().mockReturnValue({ insert }) };

    await expect(submitScdDesignLabJoin(client as never, payload)).resolves.toEqual({
      kind: "saved",
    });
    await expect(submitScdDesignLabJoin(client as never, payload)).resolves.toEqual({
      kind: "failed",
      message: "duplicate",
    });
    expect(client.from).toHaveBeenCalledWith("scd_design_lab_joins");
  });
});
