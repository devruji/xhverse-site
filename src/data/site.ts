export const site = {
  title: "xhverse",
  siteUrl: "https://xhverse.co",
  description:
    "XHVERSE is the data engineering journal and portfolio of Rujikorn Ngoensaard (Senior Data Engineer / Data Architect), also known as XH or bossruji, focused on enterprise data platforms, lakehouse architecture, governance, and platform delivery.",
  email: "contact@xhverse.co",
  github: "https://github.com/devruji",
  medium: "https://medium.xhverse.co",
  linkedin: "https://www.linkedin.com/in/rujikorn/",
  xHandle: "@xhverse",
  locale: "en_US",
  ogImage: "/images/og-cover.png",
  manifest: "/site.webmanifest",
};

export function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function buildCanonicalUrl(
  pathname: string,
  baseUrl: string = site.siteUrl,
) {
  const normalizedPath =
    pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return new URL(normalizedPath, baseUrl).toString();
}
