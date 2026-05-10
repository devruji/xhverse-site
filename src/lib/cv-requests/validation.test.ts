import { describe, expect, it } from "vitest";
import {
  extractDomain,
  getDisposableDomains,
  isDisposableDomain,
  validateEmail,
  validateSubmission,
} from "./validation";
import type { CvRequestSubmission } from "./types";

describe("extractDomain", () => {
  it("extracts the lowercase domain from an email", () => {
    expect(extractDomain("user@Example.COM")).toBe("example.com");
    expect(extractDomain("alice@company.org")).toBe("company.org");
  });

  it("returns empty string for invalid emails", () => {
    expect(extractDomain("nodomain")).toBe("");
    expect(extractDomain("")).toBe("");
  });
});

describe("getDisposableDomains", () => {
  it("returns a read-only set with at least 20 domains", () => {
    const domains = getDisposableDomains();
    expect(domains.size).toBeGreaterThanOrEqual(20);
    expect(domains.has("mailinator.com")).toBe(true);
    expect(domains.has("yopmail.com")).toBe(true);
  });
});

describe("isDisposableDomain", () => {
  it("detects known disposable domains (case-insensitive)", () => {
    expect(isDisposableDomain("Mailinator.com")).toBe(true);
    expect(isDisposableDomain("GUERRILLAMAIL.COM")).toBe(true);
    expect(isDisposableDomain("tempmail.com")).toBe(true);
  });

  it("returns false for legitimate domains", () => {
    expect(isDisposableDomain("gmail.com")).toBe(false);
    expect(isDisposableDomain("company.co.th")).toBe(false);
  });
});

describe("validateEmail", () => {
  it("rejects empty or whitespace-only emails", () => {
    expect(validateEmail("")).toEqual({
      valid: false,
      error: "Email is required.",
    });
    expect(validateEmail("   ")).toEqual({
      valid: false,
      error: "Email is required.",
    });
  });

  it("rejects malformed emails", () => {
    expect(validateEmail("notanemail")).toEqual({
      valid: false,
      error: "Please enter a valid email address.",
    });
    expect(validateEmail("missing@tld")).toEqual({
      valid: false,
      error: "Please enter a valid email address.",
    });
    expect(validateEmail("@nodomain.com")).toEqual({
      valid: false,
      error: "Please enter a valid email address.",
    });
    expect(validateEmail("has spaces@domain.com")).toEqual({
      valid: false,
      error: "Please enter a valid email address.",
    });
    expect(validateEmail("short@x.c")).toEqual({
      valid: false,
      error: "Please enter a valid email address.",
    });
  });

  it("rejects disposable email domains", () => {
    expect(validateEmail("test@mailinator.com")).toEqual({
      valid: false,
      error: "Please use a non-disposable email address.",
    });
    expect(validateEmail("bot@yopmail.com")).toEqual({
      valid: false,
      error: "Please use a non-disposable email address.",
    });
  });

  it("accepts valid emails", () => {
    expect(validateEmail("user@company.com")).toEqual({ valid: true });
    expect(validateEmail("  user@domain.org  ")).toEqual({ valid: true });
    expect(validateEmail("person+tag@mail.co.uk")).toEqual({ valid: true });
  });
});

describe("validateSubmission", () => {
  const validSubmission: CvRequestSubmission = {
    email: "user@company.com",
    name: "Test User",
    context: "engagement",
    honeypot: "",
  };

  it("accepts a valid submission", () => {
    expect(validateSubmission(validSubmission)).toEqual({ valid: true });
  });

  it("accepts submission with null name and context", () => {
    expect(
      validateSubmission({ ...validSubmission, name: null, context: null }),
    ).toEqual({ valid: true });
  });

  it("rejects when honeypot is filled", () => {
    expect(
      validateSubmission({ ...validSubmission, honeypot: "bot-text" }),
    ).toEqual({ valid: false, error: "Submission rejected." });
  });

  it("rejects when honeypot has whitespace content", () => {
    expect(
      validateSubmission({ ...validSubmission, honeypot: " spam " }),
    ).toEqual({ valid: false, error: "Submission rejected." });
  });

  it("rejects invalid email", () => {
    const result = validateSubmission({ ...validSubmission, email: "bad" });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid context", () => {
    expect(
      validateSubmission({
        ...validSubmission,
        context: "invalid" as "engagement",
      }),
    ).toEqual({ valid: false, error: "Invalid context selection." });
  });

  it("rejects name over 100 characters", () => {
    expect(
      validateSubmission({ ...validSubmission, name: "a".repeat(101) }),
    ).toEqual({
      valid: false,
      error: "Name must be 100 characters or fewer.",
    });
  });

  it("accepts name exactly 100 characters", () => {
    expect(
      validateSubmission({ ...validSubmission, name: "a".repeat(100) }),
    ).toEqual({ valid: true });
  });

  it("accepts empty string name (treated as valid, not over limit)", () => {
    expect(validateSubmission({ ...validSubmission, name: "" })).toEqual({
      valid: true,
    });
  });
});
