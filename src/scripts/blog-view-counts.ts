import {
  formatBlogViewCount,
  parseBlogViewSlugsParam,
  validateBlogViewSlug,
  type BlogViewCountsResponse,
  type BlogViewRecordResponse,
} from "../lib/blog-views/core";

const COUNT_SELECTOR = "[data-blog-view-count]";
const WRAPPER_SELECTOR = "[data-blog-view-wrapper]";
const VIEWED_PREFIX = "xhverse:blog-viewed:";
const INCREMENT_DELAY_MS = 5000;
let lastHydratedPath = "";

type CountElement = HTMLElement & {
  dataset: {
    blogViewCount?: string;
    blogViewIncrement?: string;
  };
};

function getCountElements(): CountElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(COUNT_SELECTOR)).filter(
    (element): element is CountElement =>
      typeof element.dataset.blogViewCount === "string" &&
      validateBlogViewSlug(element.dataset.blogViewCount) === null,
  );
}

function setCount(slug: string, count: number): void {
  const elements = getCountElements().filter(
    (element) => element.dataset.blogViewCount === slug,
  );
  for (const element of elements) {
    element.textContent = formatBlogViewCount(count);
    element.setAttribute("aria-busy", "false");
    const wrapper = element.closest<HTMLElement>(WRAPPER_SELECTOR);
    if (wrapper) {
      wrapper.classList.remove("hidden");
      wrapper.classList.add("inline-flex", "items-center", "gap-3");
    }
  }
}

function hideCountSlots(): void {
  for (const element of getCountElements()) {
    element.setAttribute("aria-busy", "false");
    element.closest<HTMLElement>(WRAPPER_SELECTOR)?.classList.add("hidden");
  }
}

async function fetchCounts(slugs: string[]): Promise<void> {
  if (slugs.length === 0) return;
  const uniqueSlugs = parseBlogViewSlugsParam(slugs.join(","));
  const params = new URLSearchParams({ slugs: uniqueSlugs.join(",") });
  const response = await fetch(`/api/blog/views?${params.toString()}`, {
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Blog view counts unavailable.");
  const payload = (await response.json()) as BlogViewCountsResponse;
  for (const slug of uniqueSlugs) {
    setCount(slug, payload.counts[slug] ?? 0);
  }
}

async function incrementCount(element: CountElement): Promise<void> {
  const slug = element.dataset.blogViewCount;
  if (!slug) return;
  const storageKey = `${VIEWED_PREFIX}${slug}`;
  if (hasSessionMarker(storageKey)) return;
  setSessionMarker(storageKey);

  const response = await fetch("/api/blog/views", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug,
      eventId: createEventId(),
      path: window.location.pathname,
    }),
  });
  if (!response.ok) return;
  const payload = (await response.json()) as BlogViewRecordResponse;
  setCount(payload.slug, payload.totalViews);
}

function scheduleIncrement(elements: CountElement[]): void {
  const incrementElement = elements.find(
    (element) => element.dataset.blogViewIncrement === "true",
  );
  if (!incrementElement) return;
  window.setTimeout(() => {
    incrementCount(incrementElement).catch(() => {});
  }, INCREMENT_DELAY_MS);
}

async function hydrateBlogViewCounts(): Promise<void> {
  if (lastHydratedPath === window.location.pathname) return;
  lastHydratedPath = window.location.pathname;
  const elements = getCountElements();
  if (elements.length === 0) return;
  const slugs = elements
    .map((element) => element.dataset.blogViewCount)
    .filter((slug): slug is string => Boolean(slug));

  try {
    await fetchCounts(slugs);
    scheduleIncrement(elements);
  } catch {
    hideCountSlots();
  }
}

document.addEventListener("astro:page-load", () => {
  hydrateBlogViewCounts().catch(() => hideCountSlots());
});

if (document.readyState !== "loading") {
  hydrateBlogViewCounts().catch(() => hideCountSlots());
}

function hasSessionMarker(key: string): boolean {
  try {
    return sessionStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function setSessionMarker(key: string): void {
  try {
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // Storage can be unavailable in hardened browser contexts. Counting can
    // still proceed because D1 event IDs make retries idempotent.
  }
}

function createEventId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const randomValues = crypto.getRandomValues(new Uint8Array(16));
  randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80;
  const hex = Array.from(randomValues, (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
