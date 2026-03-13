export const site = {
  title: "xhverse",
  siteUrl: "https://xhverse.co",
  description:
    "XHVERSE is a personal archive for projects, writing, images, and notes by XH.",
  email: "contact@xhverse.co",
  github: "https://github.com/devruji",
  medium: "https://medium.xhverse.co",
  xHandle: "@xhverse",
  locale: "en_US",
  ogImage: "/images/og-cover.svg",
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
