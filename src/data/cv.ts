import { resolveSupabaseOrigin } from "./supabase-config";

const cvFileName = "Rujikorn-Ngoensaard-CV.pdf";
const cvStoragePath =
  "storage/v1/object/public/documents/cv/rujikorn-ngoensaard-cv.pdf";
const defaultCvPdfUrl = `${resolveSupabaseOrigin()}/${cvStoragePath}`;

export const cvStorage = {
  bucket: "documents",
  path: "cv/rujikorn-ngoensaard-cv.pdf",
  fileName: cvFileName,
  publicUrl: defaultCvPdfUrl,
};

type CvEnvironment = Pick<ImportMetaEnv, "PUBLIC_CV_PDF_URL">;

export function resolveCvPdfUrl(env: CvEnvironment = import.meta.env) {
  const configuredUrl = env.PUBLIC_CV_PDF_URL?.trim();

  if (!configuredUrl) {
    return defaultCvPdfUrl;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error("PUBLIC_CV_PDF_URL must be an absolute HTTP(S) URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("PUBLIC_CV_PDF_URL must be an absolute HTTP(S) URL.");
  }

  return parsedUrl.toString();
}

export function buildCvDownloadUrl(pdfUrl: string, fileName = cvFileName) {
  const separator = pdfUrl.includes("?") ? "&" : "?";
  return `${pdfUrl}${separator}download=${encodeURIComponent(fileName)}`;
}

export const cvHighlights = [
  "6+ years across enterprise data platforms — E-Commerce, Manufacturing, and Marketplace industries.",
  "Azure, Databricks, Fabric, Spark, Terraform, Power BI — lakehouse design through to production CI/CD.",
  "Delivered governance frameworks for orgs with 50+ data consumers — access control, lineage, and cataloging.",
  "End-to-end ownership: architecture, data product delivery, ML pipelines, and platform operations.",
];
