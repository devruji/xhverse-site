import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { toolCatalog } from "../../src/data/tools";
import { practitionerToolDefinitions } from "../../src/lib/practitioner-tools/definitions";

async function selectOperatedAnswerForEveryQuestion(page: Page): Promise<void> {
  const fieldsets = page.locator("fieldset");
  const fieldsetCount = await fieldsets.count();

  for (let index = 0; index < fieldsetCount; index += 1) {
    await fieldsets.nth(index).locator("label").nth(3).click();
  }
}

test("tools catalog links to all live tools", async ({ page }) => {
  await page.goto("/tools");

  await expect(page.getByRole("heading", { name: "Interactive tools" })).toBeVisible();
  await expect(page.getByText("13 free tools for data platform teams")).toBeVisible();

  for (const tool of toolCatalog) {
    await expect(
      page.getByRole("link", { name: new RegExp(tool.title, "i") }),
    ).toHaveAttribute("href", `/tools/${tool.slug}`);
  }
});

for (const definition of practitionerToolDefinitions) {
  test(`${definition.title} generates a copyable brief and resets`, async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["clipboard-write"]);
    await page.goto(`/tools/${definition.slug}`);

    await expect(
      page.getByRole("heading", { name: definition.title }),
    ).toBeVisible();
    await expect(page.getByText(definition.blogSync.title)).toBeVisible();

    await selectOperatedAnswerForEveryQuestion(page);

    await page.getByRole("button", { name: "Generate brief" }).click();

    await expect(page.getByTestId("result-panel")).toBeVisible();
    await expect(page.getByText("100/100").first()).toBeVisible();
    await expect(page.getByText("Production-ready").first()).toBeVisible();
    await expect(page.getByTestId("tool-brief")).toHaveValue(
      new RegExp(definition.artifactLabel),
    );

    await page.getByRole("button", { name: "Copy brief" }).click();
    await expect(
      page.getByText(/Brief copied|Select the brief text and copy it from your browser/),
    ).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByTestId("result-panel")).toBeHidden();
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
}

test("new practitioner tools give mobile validation feedback without clearing selections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const definition of practitionerToolDefinitions) {
    await page.goto("/tools/");
    await page.getByRole("link", { name: new RegExp(definition.title, "i") }).click();
    await page.waitForURL(new RegExp(`/tools/${definition.slug}/?$`));

    const fieldsets = page.locator("fieldset");
    await fieldsets.nth(0).locator("label").nth(3).click();

    await page.getByRole("button", { name: "Generate brief" }).click();

    await expect(page.getByTestId("result-panel")).toBeHidden();
    await expect(page.getByTestId("form-status")).toBeVisible();
    await expect(page.getByTestId("form-status")).toContainText(
      "selections are still preserved",
    );
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1);

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByTestId("form-status")).toBeHidden();
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await expect(page.locator("[data-question-error]:visible")).toHaveCount(0);

    await selectOperatedAnswerForEveryQuestion(page);
    await page.getByRole("button", { name: "Generate brief" }).click();

    await expect(page.getByTestId("form-status")).toBeHidden();
    await expect(page.getByTestId("result-panel")).toBeVisible();
    await expect(page.getByText("100/100").first()).toBeVisible();
  }
});

test("new practitioner tools do not create mobile horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const definition of practitionerToolDefinitions) {
    await page.goto(`/tools/${definition.slug}`);
    await expect(
      page.getByRole("heading", { name: definition.title }),
    ).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  }
});
