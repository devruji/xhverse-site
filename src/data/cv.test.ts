import { describe, expect, it } from "vitest";
import { buildCvDownloadUrl, cvStorage, resolveCvPdfUrl } from "./cv";

describe("CV asset configuration", () => {
  it("uses the local PDF until the Supabase public URL is configured", () => {
    expect(resolveCvPdfUrl({})).toBe(cvStorage.localPath);
  });

  it("uses the configured public CV URL when present", () => {
    expect(
      resolveCvPdfUrl({
        PUBLIC_CV_PDF_URL:
          " https://example.supabase.co/storage/v1/object/public/documents/cv/rujikorn-ngoensaard-cv.pdf ",
      }),
    ).toBe(
      "https://example.supabase.co/storage/v1/object/public/documents/cv/rujikorn-ngoensaard-cv.pdf",
    );
  });

  it("rejects non-HTTP CV URLs", () => {
    expect(() =>
      resolveCvPdfUrl({ PUBLIC_CV_PDF_URL: "javascript:alert(1)" }),
    ).toThrow("PUBLIC_CV_PDF_URL must be an absolute HTTP(S) URL.");
  });

  it("rejects relative configured CV URLs", () => {
    expect(() =>
      resolveCvPdfUrl({ PUBLIC_CV_PDF_URL: "/documents/local.pdf" }),
    ).toThrow("PUBLIC_CV_PDF_URL must be an absolute HTTP(S) URL.");
  });

  it("adds a Supabase-compatible download filename query parameter", () => {
    expect(
      buildCvDownloadUrl(
        "https://example.supabase.co/storage/v1/object/public/documents/cv/file.pdf",
      ),
    ).toBe(
      "https://example.supabase.co/storage/v1/object/public/documents/cv/file.pdf?download=Rujikorn-Ngoensaard-CV.pdf",
    );
  });

  it("preserves existing query parameters when adding download behavior", () => {
    expect(buildCvDownloadUrl("/documents/mock.pdf?cache=1")).toBe(
      "/documents/mock.pdf?cache=1&download=Rujikorn-Ngoensaard-CV.pdf",
    );
  });
});
