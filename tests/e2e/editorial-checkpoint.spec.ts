import { test, expect, type Locator } from "@playwright/test";

async function compositedTextContrast(locator: Locator): Promise<number> {
  return locator.evaluate((element) => {
    type Rgb = readonly [number, number, number];
    type Rgba = { rgb: Rgb; alpha: number };

    function parseColor(value: string): Rgba {
      const match = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/);
      if (!match) throw new Error(`Unsupported computed color: ${value}`);
      const rgb: Rgb = [Number(match[1]), Number(match[2]), Number(match[3])];
      const alpha = match[4] === undefined ? 1 : Number(match[4]);
      if (rgb.some((channel) => !Number.isFinite(channel) || channel < 0 || channel > 255) || !Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
        throw new Error(`Invalid computed color: ${value}`);
      }
      return { rgb, alpha };
    }

    function composite(foreground: Rgba, background: Rgb): Rgb {
      return [
        foreground.rgb[0] * foreground.alpha + background[0] * (1 - foreground.alpha),
        foreground.rgb[1] * foreground.alpha + background[1] * (1 - foreground.alpha),
        foreground.rgb[2] * foreground.alpha + background[2] * (1 - foreground.alpha),
      ];
    }

    function luminance(rgb: Rgb): number {
      const linear = rgb.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    }

    const ancestors: Element[] = [];
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) ancestors.unshift(ancestor);
    let background: Rgb | null = null;
    for (const ancestor of ancestors) {
      const style = getComputedStyle(ancestor);
      if (style.backgroundImage !== "none" || Number(style.opacity) !== 1 || style.filter !== "none" || style.mixBlendMode !== "normal") {
        throw new Error(`Unsupported background composition on ${ancestor.tagName}`);
      }
      const color = parseColor(style.backgroundColor);
      if (color.alpha === 0) continue;
      if (color.alpha === 1) background = color.rgb;
      else {
        if (!background) throw new Error("Translucent background has no opaque ancestor");
        background = composite(color, background);
      }
    }
    if (!background) throw new Error("Text has no resolved opaque background");
    const foreground = composite(parseColor(getComputedStyle(element).color), background);
    const foregroundLuminance = luminance(foreground);
    const backgroundLuminance = luminance(background);
    return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
  });
}

const workedTools = [
  { title: "SCD Design Lab", slug: "scd-design-lab" },
  { title: "Pipeline Recovery Planner", slug: "pipeline-recovery-planner" },
] as const;

for (const theme of ["dark", "light"] as const) {
  test(`publication examples and actions remain readable in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    await page.goto("/");
    expect(await page.locator("html").evaluate((html) => html.classList.contains("light"))).toBe(theme === "light");
    for (const tool of workedTools) {
      const link = page.locator(".tool-copy h3").getByRole("link", { name: tool.title, exact: true });
      await expect(link).toHaveAttribute("href", `/tools/${tool.slug}`);
      expect(await compositedTextContrast(link), `${theme} ${tool.title} link contrast`).toBeGreaterThanOrEqual(4.5);
    }
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      // A rapid desktop resize can expose the previous flex intrinsic width until rendering commits.
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      const metrics = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      expect(metrics.content, `${theme} committed layout at ${width}px`).toBeLessThanOrEqual(metrics.viewport);
      await expect(page.locator(".tool-entry")).toHaveCount(2);
    }
    for (const result of await page.locator(".example-result strong").all()) {
      expect(await compositedTextContrast(result)).toBeGreaterThanOrEqual(4.5);
      expect(await result.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
    }
  });
}

test("publication actions preserve native keyboard anchors and legacy destinations", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const experience = page.getByRole("link", { name: "View experience" });
  await experience.focus();
  await expect(experience).toBeFocused();
  expect(await experience.evaluate((element) => element.matches(":focus-visible") && parseFloat(getComputedStyle(element).outlineWidth) >= 2)).toBe(true);
  await experience.press("Enter");
  await expect(page).toHaveURL(/#experience$/);
  await expect(page.locator("#experience")).toBeInViewport();
  for (const id of ["work", "tools", "work-architecture", "work-governance", "work-modeling", "work-operations", "proof"]) {
    await page.goto(`/#${id}`);
    const target = page.locator(`[id="${id}"]`);
    await expect(target).toHaveCount(1);
    expect(await target.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.top >= -1 && bounds.top < innerHeight;
    }), `${id} remains reachable`).toBe(true);
  }
});

test("contact email remains readable and operable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await page.evaluate(async () => { await document.fonts.ready; });
  const contact = page.locator("#contact");
  await contact.scrollIntoViewIfNeeded();
  const email = contact.getByRole("link", { name: /Email me.*contact@xhverse\.co/ });
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute("href", "mailto:contact@xhverse.co");
  await page.keyboard.press("Tab");
  await email.focus();
  await expect(email).toBeFocused();
  const readable = await contact.evaluate((section) => {
    const viewportWidth = window.innerWidth;
    const emailLink = section.querySelector<HTMLAnchorElement>('a[href="mailto:contact@xhverse.co"]');
    if (!emailLink) return false;
    const linkBounds = emailLink.getBoundingClientRect();
    return section.scrollWidth <= section.clientWidth + 1 && linkBounds.left >= -1 && linkBounds.right <= viewportWidth + 1 && emailLink.scrollWidth <= emailLink.clientWidth + 1;
  });
  expect(readable, "contact email must fit without clipping or horizontal scrolling").toBe(true);
});

test("article rail links remain reachable on short desktop screens", async ({ page }) => {
  await page.setViewportSize({ width: 1040, height: 720 });
  await page.goto("/blog/data-product-as-platform-contract/");
  const links = page.locator(".article-rail a");
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) {
    await link.focus();
    await expect(link).toBeInViewport();
  }
});

test("publication and reading navigation work on mobile without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await page.getByRole("link", { name: "Explore tools", exact: true }).click();
    await expect(page.locator("#tools")).toBeInViewport();
    await expect(page.locator(".tool-entry").getByRole("link", { name: "SCD Design Lab", exact: true })).toHaveAttribute("href", "/tools/scd-design-lab");
    await page.goto("/blog/data-product-as-platform-contract/");
    await page.locator(".mobile-contents summary").click();
    const contents = page.getByRole("navigation", { name: "Table of contents" });
    const first = contents.getByRole("link").first();
    const href = await first.getAttribute("href");
    expect(href).toMatch(/^#/);
    await first.click();
    await expect(page.locator(href!)).toBeInViewport();
    await expect(page.getByRole("link", { name: "Explore architecture tools" })).toHaveAttribute("href", "/tools#architecture");
  } finally {
    await context.close();
  }
});
