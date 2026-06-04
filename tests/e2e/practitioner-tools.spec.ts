import { expect, test } from "@playwright/test";
import { toolCatalog } from "../../src/data/tools";
import { practitionerToolDefinitions } from "../../src/lib/practitioner-tools/definitions";

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

    for (const input of await page
      .locator('[data-testid^="answer-"][data-testid$="-4"]')
      .all()) {
      await input.check({ force: true });
    }

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
  });
}

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
