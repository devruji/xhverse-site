import { expect, test } from "@playwright/test";

test("workload placement simulator generates a copyable Databricks placement brief", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-write"]);
  await page.goto("/tools/workload-placement-simulator");

  await expect(
    page.getByRole("heading", { name: "Workload Placement Simulator" }),
  ).toBeVisible();
  await expect(page.getByText("Directional placement review")).toBeVisible();

  await page.getByRole("button", { name: "Simulate placement" }).click();

  const resultPanel = page.getByTestId("placement-result");
  await expect(resultPanel).toBeVisible();
  await expect(page.getByText("Databricks Serverless Jobs").first()).toBeVisible();
  await expect(resultPanel.getByText("Placement signal")).toBeVisible();
  await expect(page.getByText("100/100").first()).toBeVisible();
  await expect(page.getByText("Strong fit").first()).toBeVisible();
  await expect(resultPanel.getByText(/Platform boundary:/)).toBeVisible();
  await expect(page.getByTestId("placement-brief")).toHaveValue(
    /Workload Placement Simulation Brief/,
  );

  await page.getByRole("button", { name: "Copy brief" }).click();
  await expect(
    page.getByText(/Brief copied|Select the brief text and copy it from your browser/),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("placement-result")).toBeHidden();
  await expect(page.getByTestId("placement-brief")).toHaveValue("");
});

test("workload placement simulator ranks Direct Lake for Fabric BI pressure", async ({
  page,
}) => {
  await page.goto("/tools/workload-placement-simulator");

  await page.locator("#intent").selectOption("interactive-bi");
  await page.locator("#estate").selectOption("fabric");
  await page.locator("#data-shape").selectOption("delta-tables");
  await page.locator("#freshness").selectOption("intraday");
  await page.locator("#scale").selectOption("department");
  await page.locator("#governance").selectOption("sensitive");
  await page.locator("#pressure").selectOption("bi-performance");
  await page.getByRole("button", { name: "Simulate placement" }).click();

  await expect(page.getByTestId("placement-result")).toBeVisible();
  await expect(page.getByText("Power BI Direct Lake").first()).toBeVisible();
  await expect(
    page.getByText("Validate row, column, workspace, and semantic model permissions together."),
  ).toBeVisible();
});

test("workload placement simulator has no mobile horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools/workload-placement-simulator");

  await expect(
    page.getByRole("heading", { name: "Workload Placement Simulator" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Simulate placement" }).click();
  await expect(page.getByTestId("placement-result")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("workload placement simulator is listed in sitemap output", async ({
  page,
}) => {
  const sitemap = await page.request.get("/sitemap-0.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapXml = await sitemap.text();
  expect(sitemapXml).toContain(
    "https://xhverse.co/tools/workload-placement-simulator/",
  );
});

test("workload placement simulator rebinds after client-side route revisits", async ({
  page,
}) => {
  await page.goto("/tools");
  await page.getByRole("link", { name: /Workload Placement Simulator/ }).first().click();
  await expect(page).toHaveURL(/\/tools\/workload-placement-simulator\/?$/);

  await page.getByRole("link", { name: "Lakehouse Cost Calculator" }).click();
  await expect(page).toHaveURL(/\/tools\/lakehouse-cost-calculator\/?$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/tools\/workload-placement-simulator\/?$/);
  await page.getByRole("button", { name: "Simulate placement" }).click();

  await expect(page.getByTestId("placement-result")).toBeVisible();
  await expect(page.getByText("Databricks Serverless Jobs").first()).toBeVisible();
});
