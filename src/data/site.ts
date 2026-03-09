export const site = {
  title: "xhverse",
  email: "contact@xhverse.co",
  github: "https://github.com/devruji",
  medium: "https://medium.xhverse.co",
};

export function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
