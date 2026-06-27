import { expect, test } from "@playwright/test";

test("egress pricing calculator generates a copyable default estimate", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-write"]);
  await page.goto("/tools/egress-pricing-calculator");

  await expect(
    page.getByRole("heading", { name: "Cloud Egress Pricing Calculator" }),
  ).toBeVisible();
  await expect(page.getByText("Public pricing estimate")).toBeVisible();
  await expect(page.getByText("Monthly outbound transfer")).toBeVisible();
  await expect(page.getByText("Azure Thailand South is visible but not calculable")).toBeVisible();

  await page.getByRole("button", { name: "Calculate egress" }).click();

  const result = page.getByTestId("egress-result");
  await expect(result).toBeVisible();
  await expect(result.getByText("Lowest estimate")).toBeVisible();
  await expect(result.getByText("AWS").first()).toBeVisible();
  await expect(result.getByText("GCP").first()).toBeVisible();
  await expect(result.getByText("Azure").first()).toBeVisible();
  await expect(result.getByText("Unavailable").first()).toBeVisible();
  await expect(page.getByTestId("egress-brief")).toHaveValue(
    /Cloud Egress Pricing Estimate/,
  );

  await page.getByRole("button", { name: "Copy brief" }).click();
  await expect(
    page.getByText(/Brief copied|Select the brief text and copy it from your browser/),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(result).toBeHidden();
  await expect(page.getByTestId("egress-brief")).toHaveValue("");
});

test("egress pricing calculator supports external cloud and same-cloud account modes", async ({
  page,
}) => {
  await page.goto("/tools/egress-pricing-calculator");

  await page.locator("label").filter({ hasText: "External cloud" }).click();
  await expect(page.locator("#destination-provider-field")).toBeVisible();
  await page.locator("#source-country").selectOption("singapore");
  await page.locator("#destination-provider").selectOption("aws");
  await page.getByRole("button", { name: "Calculate egress" }).click();

  await expect(page.getByTestId("egress-result")).toBeVisible();
  await expect(page.getByText("AWS over public internet").first()).toBeVisible();
  await expect(page.getByText("Destination cloud ingress").first()).toBeVisible();

  await page.locator("label").filter({ hasText: "Same cloud, different account" }).click();
  await expect(page.locator("#route-direction-field")).toBeVisible();
  await page.locator("#provider").selectOption("google-cloud");
  await page.locator("#route-direction").selectOption("singapore-to-thailand");
  await page.getByRole("button", { name: "Calculate egress" }).click();

  await expect(page.getByText("different account").first()).toBeVisible();
  await expect(page.getByText("Singapore (asia-southeast1)").first()).toBeVisible();
  await expect(page.getByText("Bangkok (asia-southeast3)").first()).toBeVisible();
});

test("egress pricing calculator preserves transfer display for unavailable-only selections", async ({
  page,
}) => {
  await page.goto("/tools/egress-pricing-calculator");

  await page.locator("label").filter({ hasText: "Same cloud, same account" }).click();
  await page.locator("#provider").selectOption("azure");
  await page.getByRole("button", { name: "Calculate egress" }).click();

  const result = page.getByTestId("egress-result");
  await expect(result).toBeVisible();
  await expect(result.getByText("Transfer")).toBeVisible();
  await expect(result.getByText("5 TB")).toBeVisible();
  await expect(result.getByText("Unavailable").first()).toBeVisible();
});

test("egress pricing calculator exposes official pricing and estimator links", async ({
  page,
}) => {
  await page.goto("/tools/egress-pricing-calculator");

  await expect(page.getByRole("link", { name: "Pricing source" })).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Official estimator" })).toHaveCount(3);
  await expect(
    page.getByRole("link", { name: "Official estimator" }).first(),
  ).toHaveAttribute("href", "https://calculator.aws/");
});

test("egress pricing calculator has no mobile horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools/egress-pricing-calculator");

  await expect(
    page.getByRole("heading", { name: "Cloud Egress Pricing Calculator" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Calculate egress" }).click();
  await expect(page.getByTestId("egress-result")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("egress pricing calculator is listed in sitemap output", async ({ page }) => {
  const sitemap = await page.request.get("/sitemap-0.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapXml = await sitemap.text();
  expect(sitemapXml).toContain(
    "https://xhverse.co/tools/egress-pricing-calculator/",
  );
});
