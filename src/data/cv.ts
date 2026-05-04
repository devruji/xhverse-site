const cvFileName = "Rujikorn-Ngoensaard-CV.pdf";
const fallbackCvPath = "/documents/rujikorn-ngoensaard-cv.pdf";

export const cvStorage = {
  bucket: "documents",
  path: "cv/rujikorn-ngoensaard-cv.pdf",
  fileName: cvFileName,
  localPath: fallbackCvPath,
};

type CvEnvironment = Pick<ImportMetaEnv, "PUBLIC_CV_PDF_URL">;

export function resolveCvPdfUrl(env: CvEnvironment = import.meta.env) {
  const configuredUrl = env.PUBLIC_CV_PDF_URL?.trim();

  if (!configuredUrl) {
    return fallbackCvPath;
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
  "Data Engineer / Data Architect focused on governed enterprise data platforms.",
  "Hands-on platform work across Azure, Databricks, Microsoft Fabric, Spark, Power BI, and Terraform.",
  "Strong operating focus around access design, documentation, delivery handover, and analytics reliability.",
];
