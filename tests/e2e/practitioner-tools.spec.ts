import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { toolCatalog } from "../../src/data/tools";
import { practitionerToolDefinitions } from "../../src/lib/practitioner-tools/definitions";

const journeyThemeCopy: Record<string, string> = {
  contract: "Assemble the contract clauses",
  access: "Pass the access gates",
  layout: "Map the layout signals",
  semantic: "Diagnose the metric layers",
  recovery: "Run the recovery drill",
};

async function selectOperatedAnswerForEveryQuestion(page: Page): Promise<void> {
  const journeySteps = page.locator("[data-journey-step]");
  const journeyStepCount = await journeySteps.count();

  for (let index = 0; index < journeyStepCount; index += 1) {
    const activeFieldset = page.locator("fieldset:visible");
    await expect(activeFieldset).toHaveCount(1);
    await activeFieldset.locator("label").nth(3).click();

    if (index < journeyStepCount - 1) {
      await page.getByRole("button", { name: "Next checkpoint" }).click();
    }
  }
}

test("tools catalog links to all live tools", async ({ page }) => {
  await page.goto("/tools");

  await expect(
    page.getByRole("heading", { name: "Data platform tools by Rujikorn Ngoensaard" }),
  ).toBeVisible();
  await expect(page.getByText("14 free tools from XH / bossruji")).toBeVisible();

  for (const tool of toolCatalog) {
    await expect(
      page.getByRole("link", { name: new RegExp(tool.title, "i") }),
    ).toHaveAttribute("href", `/tools/${tool.slug}`);
  }
});

test("tools catalog lists newest practitioner tools first", async ({ page }) => {
  await page.goto("/tools");

  const visibleToolTitles = await page
    .locator("main .interactive-card h2")
    .evaluateAll((headings) =>
      headings.map((heading) => heading.textContent?.trim() ?? ""),
    );

  expect(visibleToolTitles.slice(0, 6)).toEqual([
    "Workload Placement Simulator",
    "Data Product Contract Builder",
    "Access Model Simulator",
    "Lakehouse Table Layout Advisor",
    "Power BI Semantic Model Doctor",
    "Pipeline Recovery Planner",
  ]);
});

test("generated practitioner tools initialize after catalog navigation", async ({
  page,
}) => {
  for (const definition of practitionerToolDefinitions) {
    await page.goto("/tools");
    const link = page.getByRole("link", { name: new RegExp(definition.title, "i") });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await page.waitForURL(new RegExp(`/tools/${definition.slug}/?$`));

    await expect(page.locator("[data-practitioner-tool-root]")).toHaveAttribute(
      "data-practitioner-tool-ready",
      "true",
    );
    await expect(page.getByTestId("journey-board")).toBeVisible();
    await expect(page.locator("fieldset:visible")).toHaveCount(1);
    await expect(page.locator("[data-journey-step]").first()).toHaveAttribute(
      "aria-current",
      "step",
    );
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
    await expect(page.getByTestId("journey-board")).toBeVisible();
    await expect(page.getByTestId("journey-guide")).toBeVisible();
    await expect(page.getByText(journeyThemeCopy[definition.experience.theme])).toBeVisible();
    await expect(page.locator("[data-journey-step]")).toHaveCount(
      definition.questions.length,
    );
    await expect(page.locator("[data-journey-step]").first()).toHaveAttribute(
      "aria-current",
      "step",
    );
    await expect(page.locator("fieldset:visible")).toHaveCount(1);
    await expect(page.getByTestId("journey-progress")).toContainText(
      `0/${definition.questions.length}`,
    );

    await page.locator("fieldset:visible").locator("label").nth(3).click();
    await expect(page.getByTestId("journey-progress")).toContainText(
      `1/${definition.questions.length}`,
    );
    await expect(page.locator("#journey-selected-move")).toContainText(
      definition.questions[0].actions[4],
    );
    await page.getByRole("button", { name: "Next checkpoint" }).click();
    await expect(page.locator("fieldset:visible")).toContainText(
      definition.questions[1].dimension,
    );
    await page.locator("[data-journey-step]").first().click();
    await expect(page.locator("fieldset:visible")).toContainText(
      definition.questions[0].dimension,
    );
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1);

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
    await expect(page.getByTestId("journey-progress")).toContainText(
      `0/${definition.questions.length}`,
    );
    await expect(page.locator("[data-journey-step]").first()).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
}

test("new practitioner tools give mobile validation feedback without clearing selections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const definition of practitionerToolDefinitions) {
    await page.goto(`/tools/${definition.slug}`);

    const fieldsets = page.locator("fieldset");
    await expect(page.locator("fieldset:visible")).toHaveCount(1);
    await fieldsets.nth(0).locator("label").nth(3).click();
    await expect(page.getByTestId("journey-progress")).toContainText(
      `1/${definition.questions.length}`,
    );

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByTestId("result-panel")).toBeHidden();
    await expect(page.getByTestId("form-status")).toBeVisible();
    await expect(page.getByTestId("form-status")).toContainText(
      "selections are still preserved",
    );
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1);
    await expect(page.locator("fieldset:visible")).toContainText(
      definition.questions[1].dimension,
    );

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByTestId("form-status")).toBeHidden();
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await expect(page.locator("[data-question-error]:visible")).toHaveCount(0);
    await expect(page.getByTestId("journey-progress")).toContainText(
      `0/${definition.questions.length}`,
    );
    await expect(page.locator("fieldset:visible")).toContainText(
      definition.questions[0].dimension,
    );

    await selectOperatedAnswerForEveryQuestion(page);
    await page.locator('form button[type="submit"]').click();

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
