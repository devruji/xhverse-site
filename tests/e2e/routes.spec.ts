import { test, expect } from "@playwright/test";

test("about page loads expected sections", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Architecture statement" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
});

test("blog page loads posts", async ({ page }) => {
  await page.goto("/blog");
  await expect(
    page.getByRole("heading", { name: "Notes, essays, and ongoing thoughts." }),
  ).toBeVisible();
  await expect(page.getByText(/Building xhverse/i)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Read article$/i }).first(),
  ).toBeVisible();
});

test("blog article page renders markdown body", async ({ page }) => {
  await page.goto("/blog/building-xhverse");
  await expect(
    page.getByRole("heading", { name: "Building xhverse" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why this site exists" })).toBeVisible();
});

test("gallery page renders images", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
  await expect(page.locator("img").first()).toBeVisible();
});

test("homepage sets SEO and referrer metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="referrer"][content="strict-origin-when-cross-origin"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"][href="https://xhverse.co/"]')).toHaveCount(1);
});
