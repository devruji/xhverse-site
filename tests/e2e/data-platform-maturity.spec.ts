import { expect, test } from "@playwright/test";

test("data platform maturity checker completes assessment and supports copy/reset", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-write"]);
  await page.goto("/tools/data-platform-maturity-checker");

  await expect(
    page.getByRole("heading", { name: "Data Platform Maturity Checker" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Assessment data is stored anonymously unless you provide an email. Do not submit confidential company or platform details.",
    ),
  ).toBeVisible();

  for (const input of await page.locator('[data-testid^="answer-"][data-testid$="-4"]').all()) {
    await input.check({ force: true });
  }

  await page.getByRole("button", { name: "Show maturity result" }).click();

  await expect(page.getByTestId("result-panel")).toBeVisible();
  await expect(page.getByText("80/100").first()).toBeVisible();
  await expect(page.getByText("Advanced").first()).toBeVisible();
  await expect(page.getByTestId("benchmark-panel")).toBeVisible();
  await expect(
    page.getByText("For enterprise-grade comparison, request an architecture review."),
  ).toBeVisible();
  await expect(page.getByTestId("readiness-brief")).toHaveValue(
    /Data Platform Architecture Readiness Brief/,
  );

  await page.getByRole("button", { name: "Copy brief" }).click();
  await expect(
    page.getByText(/Brief copied|Select the brief text and copy it from your browser/),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("result-panel")).toBeHidden();
});
