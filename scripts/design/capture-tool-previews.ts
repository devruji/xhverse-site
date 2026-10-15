import { chromium, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Capture existing tool output, without sending tracking or form submissions.
// Run against the local built preview: bun scripts/design/capture-tool-previews.ts
const baseURL = process.env.TOOL_PREVIEW_BASE_URL ?? "http://127.0.0.1:4321";
const output = fileURLToPath(new URL("../../src/assets/tool-previews/", import.meta.url));
await mkdir(output, { recursive: true });

async function completeJourney(page: Page, answers: readonly number[]) {
  for (const [index, answer] of answers.entries()) {
    const fieldset = page.locator("fieldset:visible");
    await fieldset.locator(`label:has(input[value="${answer}"])`).click();
    if (!await fieldset.locator(`input[value="${answer}"]`).isChecked()) {
      throw new Error(`Capture answer ${index + 1} was not selected`);
    }
    if (index < answers.length - 1) {
      await page.getByRole("button", { name: "Next checkpoint" }).click();
    }
  }
  await page.getByRole("button", { name: "Generate brief" }).click();
  await page.locator("#result-panel").waitFor({ state: "visible" });
}

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const theme of ["dark", "light"] as const) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
    await context.route("**/*", async (route) => {
      if (!["GET", "HEAD"].includes(route.request().method())) await route.abort();
      else await route.continue();
    });
    const page = await context.newPage();
    for (const topic of ["architecture", "governance", "modeling", "operations"] as const) {
      await page.setViewportSize({ width: topic === "modeling" ? 900 : 1440, height: 1000 });
      let selector: string;
      if (topic === "architecture") {
        await page.goto(`${baseURL}/tools/workload-placement-simulator/`);
        await page.getByRole("button", { name: "Simulate placement" }).click();
        await page.locator("#top-label").waitFor({ state: "visible" });
        selector = "#result-panel > div > div:first-child > div:first-child";
      } else if (topic === "modeling") {
        await page.goto(`${baseURL}/tools/scd-design-lab/`);
        await page.locator('label:has(input[name="strategy"][value="type_2"])').click();
        await page.locator("#submit-decision").click();
        selector = "#fact-impact";
      } else {
        await page.goto(`${baseURL}/tools/${topic === "governance" ? "access-model-simulator" : "pipeline-recovery-planner"}/`);
        await completeJourney(page, topic === "governance" ? [2, 3, 2, 3, 2, 3] : [2, 3, 3, 2, 3, 3]);
        selector = topic === "governance" ? "#action-list" : "#tool-brief";
      }
      await page.evaluate(() => document.fonts.ready);
      const target = topic === "modeling" || topic === "governance"
        ? page.locator(selector).locator("..")
        : page.locator(selector);
      await target.scrollIntoViewIfNeeded();
      const box = await target.boundingBox();
      if (!box) throw new Error(`Missing output for ${topic}`);
      const path = `${output}/${topic}-${theme}.png`;
      // Upper excerpts are cropped from genuine output, never reconstructed.
      await page.screenshot({ path, animations: "disabled", clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 430) } });
      console.log(`${topic} ${theme}: ${path}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
