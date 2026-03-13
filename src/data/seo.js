export const DEFAULT_SITE_URL = "https://xhverse.co";
export const DEFAULT_PRODUCTION_BRANCH = "main";

export function normalizeEnvUrl(url) {
  if (!url) {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^https?:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.endsWith("/")
    ? withProtocol.slice(0, -1)
    : withProtocol;
}

export function resolveSiteUrl(env = {}) {
  const publicSiteUrl = normalizeEnvUrl(env.PUBLIC_SITE_URL);
  if (publicSiteUrl) {
    return publicSiteUrl;
  }

  const cloudflarePagesUrl = normalizeEnvUrl(env.CF_PAGES_URL);
  if (cloudflarePagesUrl) {
    return cloudflarePagesUrl;
  }

  return DEFAULT_SITE_URL;
}

export function resolveProductionBranch(env = {}) {
  return env.PUBLIC_PRODUCTION_BRANCH?.trim() || DEFAULT_PRODUCTION_BRANCH;
}

export function shouldNoIndex(env = {}) {
  if (env.PUBLIC_ALLOW_INDEXING === "true") {
    return false;
  }

  if (env.CF_PAGES !== "1") {
    return false;
  }

  const branch = env.CF_PAGES_BRANCH?.trim();
  if (!branch) {
    return false;
  }

  return branch !== resolveProductionBranch(env);
}
