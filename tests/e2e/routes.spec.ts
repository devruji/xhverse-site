import { test, expect } from "@playwright/test";

test("about page loads expected sections", async ({ page }) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: /Senior Data Engineer/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Platform direction" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Architecture statement" }),
  ).toBeVisible();
});

test("blog page loads posts", async ({ page }) => {
  await page.goto("/blog");
  await expect(
    page.getByRole("heading", { name: "Notes, essays, and ongoing thoughts." }),
  ).toBeVisible();
  await expect(page.locator("article").first()).toBeVisible();
  await expect(page.getByText("Read article").first()).toBeVisible();
});

test("blog article page renders markdown body", async ({ page }) => {
  await page.goto("/blog");
  await page.locator("article a").first().click();
  await expect(page).toHaveURL(/\/blog\/[^/]+\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".article-body")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Table of contents" })).toBeVisible();
  await expect(page.locator(".article-body :is(h2, h3)[id]").first()).toBeVisible();
  await expect(page.locator("[data-blog-view-count]").first()).toHaveAttribute(
    "aria-live",
    "polite",
  );
});

test("blog article mobile layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/blog");
  await page.locator("article a").first().click();
  await expect(page.locator(".article-body")).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("admin blog routes load the protected shell", async ({ page }) => {
  await page.goto("/admin/blog/");
  await expect(page).toHaveTitle(/Blog Writer \| Admin \| XHVERSE/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.goto("/admin/blog/new/");
  await expect(page).toHaveTitle(/New Post \| Admin \| XHVERSE/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.goto("/admin/blog/analytics/");
  await expect(page).toHaveTitle(/Blog Analytics \| Admin \| XHVERSE/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("gallery page renders images", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
  await expect(page.locator("img").first()).toBeVisible();
});

test("cv page gates CV access via email capture modal", async ({ page }) => {
  await page.goto("/cv");
  await expect(page).toHaveTitle(/Rujikorn Ngoensaard CV/i);
  await expect(
    page.getByRole("heading", { name: "Rujikorn Ngoensaard" }),
  ).toBeVisible();
  const getCopyBtn = page.getByRole("button", { name: /Request CV/i }).first();
  await expect(getCopyBtn).toBeVisible();
  await getCopyBtn.click();
  const modal = page.locator("#cv-request-modal");
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("heading", { name: "Get the CV in your inbox" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
});

test("homepage sets SEO and referrer metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="referrer"][content="strict-origin-when-cross-origin"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"][href="https://xhverse.co/"]')).toHaveCount(1);
  await expect(page.locator('meta[name="author"][content="Rujikorn Ngoensaard"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"][content="https://xhverse.co/images/og-cover.jpg"]')).toHaveCount(1);
  await expect(page.locator('meta[name="twitter:image"][content="https://xhverse.co/images/og-cover.jpg"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"][href="/favicon.svg"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][sizes="192x192"][href="/icon-192.png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][sizes="32x32"][href="/favicon-32x32.png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"][href="/apple-touch-icon.png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="manifest"][href="/site.webmanifest"]')).toHaveCount(1);
});
