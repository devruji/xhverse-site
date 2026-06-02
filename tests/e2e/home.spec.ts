import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/xhverse/i);
  await expect(
    page.getByRole("heading", { name: "Rujikorn Ngoensaard" }),
  ).toBeVisible();
  await expect(page.getByText(/XH \/ bossruji · xhverse\.co/i)).toBeVisible();
});

test("primary links are visible", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Focus areas/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Writing/i }).first(),
  ).toBeVisible();
  await expect(page.locator("#profile").getByRole("link", { name: /^CV$/i })).toBeVisible();
});

test("contact links are visible", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /contact@xhverse.co/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /medium.xhverse.co/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /github.com\/devruji/i }).first(),
  ).toBeVisible();
});

test("writing cards stay synced with the blog index", async ({ page }) => {
  await page.goto("/blog");

  const firstBlogLink = page.locator("main article").first().getByRole("link", { name: /^Read article:/ });
  const firstBlogHref = await firstBlogLink.getAttribute("href");
  const firstBlogLabel = await firstBlogLink.getAttribute("aria-label");

  expect(firstBlogHref).toBeTruthy();
  expect(firstBlogLabel).toBeTruthy();

  await page.goto("/");

  const writingSection = page.locator("#writing");

  const articleLink = writingSection.getByRole("link", { name: firstBlogLabel ?? "" });
  await expect(articleLink).toBeVisible();
  await expect(articleLink).toHaveAttribute("href", firstBlogHref ?? "");

  await expect(writingSection).not.toContainText("Modern data platforms in practice");
});
