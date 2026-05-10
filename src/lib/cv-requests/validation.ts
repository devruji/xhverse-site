import { cvRequestContexts, type CvRequestSubmission } from "./types";

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "10minutemail.com",
  "trashmail.com",
  "fakeinbox.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "dispostable.com",
  "mailnesia.com",
  "maildrop.cc",
  "discard.email",
  "temp-mail.org",
  "getnada.com",
  "mohmal.com",
  "emailondeck.com",
  "tempail.com",
  "burnermail.io",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
]);

export function getDisposableDomains(): ReadonlySet<string> {
  return DISPOSABLE_DOMAINS;
}

export function extractDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return { valid: false, error: "Email is required." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  const domain = extractDomain(trimmed);
  if (isDisposableDomain(domain)) {
    return {
      valid: false,
      error: "Please use a non-disposable email address.",
    };
  }

  return { valid: true };
}

export function validateSubmission(
  submission: CvRequestSubmission,
): ValidationResult {
  if (submission.honeypot.trim() !== "") {
    return { valid: false, error: "Submission rejected." };
  }

  const emailResult = validateEmail(submission.email);
  if (!emailResult.valid) {
    return emailResult;
  }

  if (
    submission.context !== null &&
    !cvRequestContexts.includes(submission.context)
  ) {
    return { valid: false, error: "Invalid context selection." };
  }

  if (submission.name !== null && submission.name.trim().length > 100) {
    return { valid: false, error: "Name must be 100 characters or fewer." };
  }

  return { valid: true };
}
