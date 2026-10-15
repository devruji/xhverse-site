import { expect, test, type Page } from "@playwright/test";

type MotionRecord = { id: string; frames: Keyframe[]; duration: number | string | CSSNumericValue | undefined };
declare global { interface Window { motionLog: MotionRecord[]; } }
const designReview = process.env.DESIGN_REVIEW === "1";
async function record(page: Page) {
  await page.addInitScript(() => {
    window.motionLog = [];
    const native = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = function (frames, options) {
      window.motionLog.push({ id: this.id || this.className, frames: frames as Keyframe[], duration: typeof options === "number" ? options : options?.duration });
      return native.call(this, frames, options);
    };
  });
  await page.route("https://challenges.cloudflare.com/**", (route) => route.fulfill({ contentType: "application/javascript", body: "window.turnstile={render:function(){return 'mock';},reset:function(){},remove:function(){}}" }));
}
async function log(page: Page) { return page.evaluate(() => window.motionLog); }

test("motion review remains isolated and lists preserved comparison surfaces", async ({ page }) => {
  const response = await page.goto("/design-review/motion");
  if (!designReview) {
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Clearer interaction feedback." })).toHaveCount(0);
    return;
  }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.locator('a[href^="http://127.0.0.1:4321"]')).toHaveCount(3);
  await expect(page.locator('a[href^="http://127.0.0.1:4322"]')).toHaveCount(3);
});

test("CV pointer motion interrupts safely; keyboard and Escape return focus immediately", async ({ page }) => {
  await record(page);
  await page.goto("/cv");
  const opener = page.locator(".cv-request-open").first();
  await opener.click();
  await expect(page.locator("#cv-email")).toBeFocused();
  expect((await log(page)).filter((entry) => entry.id === "cv-modal-panel").at(-1)?.duration).toBe(220);
  await page.keyboard.press("Escape");
  await expect(page.locator("#cv-request-modal")).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await page.evaluate(() => {
    document.querySelector("#cv-modal-close")!.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    const modal = document.querySelector<HTMLElement>("#cv-request-modal")!;
    if (!modal.inert || document.activeElement !== document.querySelector(".cv-request-open")) throw new Error("Close must disable and return focus immediately");
    document.querySelector(".cv-request-open")!.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
  });
  await page.waitForTimeout(300);
  await expect(page.locator("#cv-request-modal")).toBeVisible();
  await expect(page.locator("#cv-email")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#cv-request-modal")).toBeHidden();
  await expect(opener).toBeFocused();
  await page.evaluate(() => { window.motionLog = []; });
  await opener.press("Enter");
  await expect(page.locator("#cv-email")).toBeFocused();
  expect((await log(page)).filter((entry) => entry.id.startsWith("cv-"))).toEqual([]);
  await page.locator("#cv-modal-close").focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#cv-submit-btn")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});

test("runtime reduced motion settles a closing CV and disables further motion", async ({ page }) => {
  await record(page);
  await page.goto("/cv");
  await page.locator(".cv-request-open").first().click();
  await page.evaluate(() => {
    document.querySelector("#cv-modal-close")!.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    document.getAnimations().filter((animation) => !(animation instanceof CSSTransition)).forEach((animation) => { animation.playbackRate = 0.01; });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#cv-request-modal")).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.evaluate(() => { window.motionLog = []; });
  await page.locator(".cv-request-open").first().click();
  await expect(page.locator("#cv-email")).toBeFocused();
  expect(await log(page)).toEqual([]);
});

test("native mobile navigation opens only on pointer and closes immediately", async ({ page }) => {
  await record(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.locator("#public-menu");
  await menu.locator("summary").click();
  expect((await log(page)).some((entry) => entry.duration === 200)).toBe(true);
  await menu.locator("summary").click();
  await expect(menu).not.toHaveAttribute("open");
  await page.evaluate(() => { window.motionLog = []; });
  await menu.locator("summary").press("Enter");
  expect(await log(page)).toEqual([]);
  await menu.locator("summary").press("Escape");
  await expect(menu).not.toHaveAttribute("open");
  await expect(menu.locator("summary")).toBeFocused();
  await page.evaluate(() => {
    const summary = document.querySelector("#public-menu summary")!;
    for (let index = 0; index < 3; index++) summary.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    document.getAnimations().filter((animation) => !(animation instanceof CSSTransition)).forEach((animation) => { animation.playbackRate = 0.01; });
  });
  await expect(menu).toHaveAttribute("open");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(menu.getByRole("link", { name: "Tools", exact: true })).toBeVisible();
  await menu.locator("summary").click();
  await page.evaluate(() => { window.motionLog = []; });
  await menu.locator("summary").click();
  expect(await log(page)).toEqual([]);
});

test("native navigation remains usable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 700 } });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  await page.locator("#public-menu summary").click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Tools", exact: true }).click();
  await expect(page).toHaveURL(/\/tools\/?$/);
  await context.close();
});

test("press feedback releases outside the control and on cancellation; content stays still", async ({ page }) => {
  await record(page);
  await page.goto("/cv");
  const opener = page.locator(".cv-request-open").first();
  const box = (await opener.boundingBox())!;
  await page.mouse.move(box.x + 12, box.y + 12);
  await page.mouse.down();
  await page.waitForTimeout(180);
  expect((await log(page)).at(-1)?.duration).toBe(160);
  await page.mouse.move(1, 1);
  await page.mouse.up();
  expect((await log(page)).at(-1)?.duration).toBe(120);
  await page.evaluate(() => {
    const button = document.querySelector(".cv-request-open")!;
    button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerId: 77, isPrimary: true }));
    document.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: 77 }));
  });
  expect((await log(page)).at(-1)?.duration).toBe(120);
  await page.waitForTimeout(150);
  expect(await opener.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  expect((await log(page)).every((entry) => !entry.id.includes("static-card"))).toBe(true);
  await page.mouse.move(box.x + 12, box.y + 12);
  await page.mouse.down();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => opener.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  await page.mouse.move(1, 1);
  await page.mouse.up();
});

test("recovery journey animates successful changes, preserves validation and reset", async ({ page }) => {
  await record(page);
  await page.goto("/tools/pipeline-recovery-planner");
  await page.getByRole("button", { name: "Next checkpoint" }).click();
  await expect(page.locator("[data-question-error]:visible")).toHaveCount(1);
  expect((await log(page)).filter((entry) => entry.duration === 180 || entry.duration === 220)).toEqual([]);
  const steps = await page.locator("[data-journey-step]").count();
  for (let index = 0; index < steps; index++) {
    await page.locator("fieldset:visible label").nth(3).click();
    if (index < steps - 1) await page.getByRole("button", { name: "Next checkpoint" }).click();
  }
  expect((await log(page)).some((entry) => entry.duration === 180 && entry.frames[0]?.opacity === 0.85)).toBe(true);
  await page.getByRole("button", { name: "Finish journey" }).click();
  await expect(page.locator("#result-panel")).toBeVisible();
  await expect(page.locator("#tool-score")).toHaveText("100/100");
  expect((await log(page)).find((entry) => entry.id === "result-panel")?.duration).toBe(220);
  await page.evaluate(() => { window.motionLog = []; });
  await page.getByRole("button", { name: "Generate brief", exact: true }).click();
  expect((await log(page)).find((entry) => entry.id === "result-panel")?.duration).toBe(220);
  await page.evaluate(() => {
    document.querySelector<HTMLButtonElement>('button[type="submit"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    document.getAnimations().filter((animation) => !(animation instanceof CSSTransition)).forEach((animation) => { animation.playbackRate = 0.01; });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator("#result-panel")).toBeVisible();
  await expect(page.locator("#tool-score")).toHaveText("100/100");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => { window.motionLog = []; });
  await page.getByRole("button", { name: "Generate brief", exact: true }).press("Enter");
  expect((await log(page)).filter((entry) => entry.id === "result-panel")).toEqual([]);
  await page.getByRole("button", { name: "Copy brief" }).click();
  await expect(page.locator("#copy-status")).toContainText(/Brief copied|Select the brief/);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("#result-panel")).toBeHidden();
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  await page.evaluate(() => { window.motionLog = []; });
  await page.locator("[data-journey-step]").nth(1).press("Enter");
  expect((await log(page)).filter((entry) => entry.duration === 180)).toEqual([]);
  await page.evaluate(() => {
    document.querySelector("[data-journey-step]")!.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
    document.getAnimations().filter((animation) => !(animation instanceof CSSTransition)).forEach((animation) => { animation.playbackRate = 0.01; });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator("fieldset:visible")).toHaveCount(1);
  await page.evaluate(() => { window.motionLog = []; });
  await page.locator("[data-journey-step]").nth(1).click();
  expect(await log(page)).toEqual([]);
});

test("other journeys remain stationary and motion handlers survive route revisits", async ({ page }) => {
  await record(page);
  await page.goto("/tools/data-product-contract-builder");
  await page.locator("[data-journey-step]").nth(1).click();
  expect((await log(page)).filter((entry) => entry.duration === 180 || entry.duration === 220)).toEqual([]);
  await page.goto("/cv");
  for (let index = 0; index < 2; index++) {
    await page.locator(".cv-request-open").first().click();
    await expect(page.locator("#cv-email")).toBeFocused();
    await page.keyboard.press("Escape");
    await page.locator(".public-wordmark").first().click();
    await page.waitForURL(/\/$/);
    await page.goBack();
    await page.waitForURL(/\/cv\/?$/);
  }
  await page.evaluate(() => { window.motionLog = []; });
  await page.locator(".cv-request-open").first().click();
  expect((await log(page)).filter((entry) => entry.id === "cv-modal-panel" && entry.duration === 220)).toHaveLength(1);
});

test("keyboard focus outlines are immediate and control transitions exclude outlines", async ({ page }) => {
  await record(page);
  await page.goto("/cv");
  await page.locator(".cv-request-open").first().press("Enter");
  const focused = await page.locator("#cv-email").evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: style.outlineWidth, offset: style.outlineOffset, transitions: element.getAnimations().filter((animation) => animation instanceof CSSTransition).map((animation) => (animation as CSSTransition).transitionProperty) };
  });
  expect(focused.width).toBe("2px");
  expect(focused.offset).toBe("4px");
  expect(focused.transitions.some((property) => property.startsWith("outline"))).toBe(false);
  expect(await page.locator("#cv-email").evaluate((element) => getComputedStyle(element).transitionProperty)).not.toBe("all");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.locator("#cv-email").evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
  await page.keyboard.press("Escape");
  await page.goto("/cv");
  await page.locator(".cv-request-open").first().press("Enter");
  expect(await page.locator("#cv-email").evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
});

test("recovery option descriptions reflow at 200 percent text size", async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tools/pipeline-recovery-planner");
    const descriptions = page.locator('fieldset:visible label > span.text-xs.leading-5');
    const measured = await descriptions.evaluateAll((elements) => elements.map((element) => {
      const description = element as HTMLElement;
      const before = getComputedStyle(description);
      const originalLine = parseFloat(before.lineHeight);
      const originalFont = parseFloat(before.fontSize);
      description.style.fontSize = `${originalFont * 2}px`;
      const enlarged = getComputedStyle(description);
      const range = document.createRange();
      range.selectNodeContents(description);
      const lines = [...range.getClientRects()];
      return { originalLine, enlargedLine: parseFloat(enlarged.lineHeight), overlap: lines.some((line, index) => index > 0 && lines[index - 1]!.bottom > line.top + 0.5) };
    }));
    for (const description of measured) {
      expect(description.enlargedLine).toBeCloseTo(description.originalLine * 2, 1);
      expect(description.overlap).toBe(false);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("accepted motion is enabled on public pages in ordinary and review builds", async ({ page }) => {
  for (const path of ["/", "/cv", "/tools/pipeline-recovery-planner"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-ui-motion", "");
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-pilot");
    await expect(page.locator('script[src*="UiMotion.astro"]')).toHaveCount(1);
  }
});

test("admin pages exclude the public motion marker and controller", async ({ page }) => {
  await record(page);
  await page.goto("/admin/blog/");
  await expect(page.locator("html")).not.toHaveAttribute("data-ui-motion");
  await expect(page.locator('script[src*="UiMotion.astro"]')).toHaveCount(0);
  const signIn = page.getByRole("button", { name: "Sign in", exact: true });
  await expect(signIn).toBeVisible();
  await signIn.dispatchEvent("pointerdown", { button: 0, pointerId: 5, isPrimary: true });
  await page.dispatchEvent("body", "pointerup", { pointerId: 5 });
  expect(await log(page)).toEqual([]);
});
