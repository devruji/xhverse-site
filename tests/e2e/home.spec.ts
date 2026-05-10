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
  await expect(page.getByRole("link", { name: /Request CV/i })).toBeVisible();
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
