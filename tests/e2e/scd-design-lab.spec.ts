import { expect, test } from "@playwright/test";

test("SCD Design Lab completes a guided scenario and exposes join form after completion", async ({
  page,
}) => {
  await page.goto("/tools/scd-design-lab");

  await expect(page.getByRole("heading", { name: "SCD Design Lab" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Loyalty Tier Changed" })).toBeVisible();
  await expect(page.getByText("Revenue by customer tier at transaction time")).toBeVisible();

  await page.locator('input[name="strategy"][value="type_2"]').check({ force: true });
  await page.getByRole("button", { name: "Submit decision" }).click({ force: true });
  await expect(page.getByText("Good fit")).toBeVisible();
  await expect(page.getByText("Recommended: Type 2 history")).toBeVisible();

  const answers = [
    "Type 1 overwrite",
    "Type 3 previous value",
    "Type 6 hybrid",
    "Ignore / Type 0",
  ];

  for (const answer of answers) {
    await page.getByRole("button", { name: "Next scenario" }).click({ force: true });
    const value = answer === "Type 1 overwrite"
      ? "type_1"
      : answer === "Type 3 previous value"
        ? "type_3"
        : answer === "Type 6 hybrid"
          ? "type_6"
          : "ignore";
    await page.locator(`input[name="strategy"][value="${value}"]`).check({ force: true });
    await page.getByRole("button", { name: "Submit decision" }).click({ force: true });
  }

  await expect(page.getByText("Lab result", { exact: true })).toBeVisible();
  await expect(page.getByText("Dimension Architect")).toBeVisible();
  await expect(page.getByText("Join the lab", { exact: true })).toBeVisible();
});
