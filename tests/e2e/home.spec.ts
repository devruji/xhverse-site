import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/xhverse/i);
  await expect(page.getByText(/A personal space for/i)).toBeVisible();
});

test("primary links are visible", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Enter xhverse/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Read the journal/i }),
  ).toBeVisible();
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
