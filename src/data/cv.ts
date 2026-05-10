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
  "5+ years in cloud data engineering — Retail, Real Estate, E-Commerce, Manufacturing, and Loyalty.",
  "Azure, Databricks, Microsoft Fabric, Spark, Power BI — lakehouse architecture through to BI migration.",
  "Led a 3-month migration: 200+ datasets, 100+ reports, 1,000+ users from Tableau to Fabric/Power BI.",
  "Currently leading platform delivery and managing engineers at enterprise scale (Central Pattana, Data & AI).",
];
