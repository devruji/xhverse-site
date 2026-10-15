import { test, expect } from "@playwright/test";
import { toolCatalog } from "../../src/data/tools";

test.describe("isolated homepage comparison", () => {
  test.skip(process.env.DESIGN_REVIEW !== "1", "Only generated in the explicit local review build");

  for (const direction of ["dossier", "publication", "publication-refined", "studio"]) {
    test(`${direction}: identity, destinations, theme and reflow`, async ({ page }) => {
      await page.goto(`/design-review/${direction}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Rujikorn Ngoensaard");
      for (const theme of ["light", "dark"]) {
        await page.evaluate((value) => { localStorage.setItem("theme", value); }, theme);
        await page.reload();
        expect(await page.locator("html").evaluate((el) => el.classList.contains("light"))).toBe(theme === "light");
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          if (width !== 320) await expect(page.getByRole("link", { name: "View experience" })).toBeInViewport();
        }
        await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
      }
      await page.getByRole("button", { name: "Switch to light theme" }).click();
      await page.reload();
      await expect(page.locator("html")).toHaveClass("light");
      await page.emulateMedia({ reducedMotion: "reduce" });
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
      await page.getByRole("link", { name: "View experience" }).click();
      await expect(page.locator("#experience")).toBeInViewport();
      await expect(page.locator('#contact a[href="mailto:contact@xhverse.co"]')).toBeVisible();
      for (const slug of direction === "publication-refined" ? ["scd-design-lab", "pipeline-recovery-planner"] : ["scd-design-lab", "pipeline-recovery-planner", "workload-placement-simulator", "access-model-simulator"]) {
        await expect(page.locator(`a[href="/tools/${slug}"]`).first()).toBeVisible();
      }
      const articles = page.locator("#writing article h3 a");
      const destinations = await articles.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      expect(destinations.length).toBeLessThanOrEqual(3);
      expect(new Set(destinations).size).toBe(destinations.length);
      if (destinations.length === 0) await expect(page.getByText("No published articles are available in this preview.")).toBeVisible();
      await expect(page.getByText("54/100 · Needs design work", { exact: true })).toBeVisible();
      const images = await page.evaluate(async () => {
        const elements = Array.from(document.images);
        elements.forEach((img) => { img.loading = "eager"; });
        await Promise.all(elements.map((img) => img.decode()));
        return elements.every((img) => img.naturalWidth > 0);
      });
      expect(images).toBe(true);
    });
  }

  test("refined Publication shares content and keeps original presentations", async ({ page }) => {
    await page.goto("/design-review/compare");
    await expect(page.locator(".review-options h2")).toHaveText(["Refined Publication", "Original Publication"]);
    await expect(page.locator(".review-notes")).toContainText("palette and complete-page styling are approved in both themes");
    await page.getByRole("link", { name: /Refined Publication/ }).click();
    await expect(page).toHaveURL(/\/publication-refined\/?$/);
    await expect(page.locator("#experience-heading")).toHaveText("Experience");
    await expect(page.locator("#writing-heading")).toHaveText("Writing");
    await expect(page.locator(".example-result strong")).toHaveText(["Bronze revenue: 1,000", "Gold revenue: 1,500", "54/100 · Needs design work"]);
    const content = () => page.evaluate(() => {
      // Compare rendered copy, independent of component-source indentation.
      const text = (selector: string) => document.querySelector<HTMLElement>(selector)!.innerText.replace(/\s+/g, " ").trim();
      return {
        intro: text(".intro-text"),
        experience: text(".experience-record"),
        tools: text(".tool-list"),
        writing: text(".writing-grid, .empty-writing"),
        contact: text("#contact"),
        destinations: Array.from(document.querySelectorAll("main a")).filter((link) => !link.closest(".additional-tools")).map((link) => link.getAttribute("href")),
      };
    });
    const refined = await content();
    await page.goto("/design-review/publication");
    expect(await content()).toEqual(refined);
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => localStorage.setItem("theme", value), theme);
      for (const [direction, pageColor] of [
        ["publication", theme === "dark" ? "rgb(33, 31, 28)" : "rgb(245, 240, 231)"],
        ["dossier", theme === "dark" ? "rgb(21, 24, 30)" : "rgb(244, 246, 249)"],
        ["studio", theme === "dark" ? "rgb(16, 29, 36)" : "rgb(239, 245, 243)"],
      ]) {
        await page.goto(`/design-review/${direction}`);
        expect(await page.locator("html").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(pageColor);
        expect(await page.locator("html").evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe("smooth");
        expect(await page.locator(".button-primary").evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
        if (direction === "publication") {
          await expect(page.locator("#experience-heading")).toHaveText("Enterprise platforms. Everyday practice.");
          expect(await page.locator("#contact").evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("4px");
        }
      }
    }
  });

  test("refined covers contain complete artwork in a stable landscape frame", async ({ page }) => {
    for (const theme of ["dark", "light"]) {
      await page.goto("/design-review/publication-refined");
      await page.evaluate((value) => localStorage.setItem("theme", value), theme);
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await page.reload();
        const image = page.locator(".article-cover img");
        if (await image.count() === 0) continue; // Empty/coverless authoritative collections are valid.
        await image.scrollIntoViewIfNeeded();
        const check = async () => {
          const dimensions = await image.evaluate(async (el: HTMLImageElement) => {
            await el.decode();
            const bounds = el.getBoundingClientRect();
            const css = getComputedStyle(el);
            return { displayed: bounds.width / bounds.height, intrinsic: el.naturalWidth / el.naturalHeight, fit: css.objectFit, transform: css.transform, animation: css.animationName };
          });
          expect(dimensions.displayed).toBeCloseTo(16 / 9, 2);
          expect(dimensions.fit).toBe("contain");
          expect(dimensions.transform).toBe("none");
          expect(dimensions.animation).toBe("none");
        };
        await check();
        await image.hover();
        await check();
        const frame = await image.boundingBox();
        // Mixed proportions stay complete inside the same frame rather than cropping or shifting text.
        await image.evaluate((el: HTMLImageElement) => { el.src = "/images/xh-profile-256.png"; });
        await check();
        expect((await image.boundingBox())!.height).toBeCloseTo(frame!.height, 2);
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/design-review/publication");
    const originalImage = page.locator(".article-cover img");
    if (await originalImage.count() > 0) expect(await originalImage.evaluate((el) => getComputedStyle(el).aspectRatio)).toBe("3 / 4");
  });

  test("refined lazy cover reserves space while the image response is pending", async ({ page }) => {
    await page.goto("/design-review/publication-refined");
    const image = page.locator(".article-cover img");
    if (await image.count() === 0) return; // Empty/coverless collections need no image reservation.
    const source = await image.getAttribute("src");
    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => { release = resolve; });
    await page.route((url) => url.href === new URL(source!, page.url()).href, async (route) => {
      await pending;
      await route.continue();
    });
    try {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("#writing").scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(0);
      const before = await image.boundingBox();
      const textBefore = await page.locator(".article-copy").boundingBox();
      expect(before!.height).toBeGreaterThan(0);
      expect(before!.width / before!.height).toBeCloseTo(16 / 9, 2);
      release();
      await image.evaluate(async (el: HTMLImageElement) => { await el.decode(); });
      expect((await image.boundingBox())!.height).toBeCloseTo(before!.height, 2);
      expect((await page.locator(".article-copy").boundingBox())!.y).toBeCloseTo(textBefore!.y, 2);
    } finally { release(); }
  });

  test("discovery rotates on sequential refreshes and a new tab, without changing worked examples", async ({ page, context }) => {
    const key = "xhverse:review:tool-discovery";
    await page.goto("/design-review/publication-refined");
    await page.evaluate((value) => { localStorage.setItem(value, "[]"); Math.random = () => 0; }, key);
    await context.addInitScript(() => { Math.random = () => 0; });
    const links = page.locator("#review-tool-discovery a");
    const eligible = toolCatalog.filter((tool) => !["scd-design-lab", "pipeline-recovery-planner"].includes(tool.slug)).map((tool) => `/tools/${tool.slug}`);
    const sample = async () => {
      const hrefs = await links.evaluateAll((items) => items.map((link) => link.getAttribute("href")!));
      expect(hrefs).toHaveLength(2);
      expect(new Set(hrefs).size).toBe(2);
      for (const href of hrefs) expect(eligible).toContain(href);
      return hrefs;
    };
    await page.reload();
    const initial = await sample();
    expect(initial).toEqual(["/tools/egress-pricing-calculator", "/tools/workload-placement-simulator"]);
    await page.reload();
    const refreshed = await sample();
    expect(refreshed).toEqual(["/tools/data-product-contract-builder", "/tools/access-model-simulator"]);
    expect(refreshed.some((href) => initial.includes(href))).toBe(false);
    const second = await context.newPage();
    await second.goto("/design-review/publication-refined");
    const tab = await second.locator("#review-tool-discovery a").evaluateAll((items) => items.map((link) => link.getAttribute("href")));
    expect(tab.some((href) => refreshed.includes(href!))).toBe(false);
    await second.close();
    await page.waitForTimeout(200);
    expect(await sample()).toEqual(refreshed); // Another tab never replaces visible or focused links.
    await expect(page.locator(".example-result strong")).toHaveText(["Bronze revenue: 1,000", "Gold revenue: 1,500", "54/100 · Needs design work"]);
    await page.getByRole("button", { name: /Switch to .* theme/ }).click();
    expect(await sample()).toEqual(refreshed);
    await links.first().focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${refreshed[0]}/?$`));
  });

  test("malformed or blocked optional history keeps discovery links usable", async ({ page, context }) => {
    await page.goto("/design-review/publication-refined");
    await page.evaluate(() => localStorage.setItem("xhverse:review:tool-discovery", "broken JSON"));
    await page.reload();
    await expect(page.locator("#review-tool-discovery a")).toHaveCount(2);
    await context.addInitScript(() => {
      const read = Storage.prototype.getItem;
      const write = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) {
        if (key === "xhverse:review:tool-discovery") throw new DOMException("Blocked in test", "SecurityError");
        return read.call(this, key);
      };
      Storage.prototype.setItem = function(key, value) {
        if (key === "xhverse:review:tool-discovery") throw new DOMException("Blocked in test", "QuotaExceededError");
        return write.call(this, key, value);
      };
    });
    const warnings: string[] = [];
    page.on("console", (message) => { if (message.type() === "warning") warnings.push(message.text()); });
    await page.reload();
    await expect(page.locator("#review-tool-discovery a")).toHaveCount(2);
    expect(warnings.some((message) => message.includes("history is unavailable"))).toBe(true);
    expect(warnings.some((message) => message.includes("could not be saved"))).toBe(true);
    const first = page.locator("#review-tool-discovery a").first();
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/tools\/[a-z-]+\/?$/);
  });

  for (const theme of ["dark", "light"]) {
    test(`refined ${theme}: contrast, focus, feedback and immediate navigation`, async ({ page }, testInfo) => {
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await page.goto("/design-review/publication-refined");
      await page.evaluate(async () => { await document.fonts.ready; });
      const primary = page.locator(".button-primary");
      const secondary = page.locator(".button-secondary");
      const toggle = page.getByRole("button", { name: /Switch to .* theme/ });
      expect(await page.locator("html").evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe("auto");
      expect(await page.locator("html").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(theme === "dark" ? "rgb(23, 25, 28)" : "rgb(248, 249, 251)");
      expect(await page.locator(".tool-example").first().evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(theme === "dark" ? "rgb(32, 35, 40)" : "rgb(255, 255, 255)");
      for (const link of [primary, secondary, toggle, page.locator(".text-link").first()]) {
        const feedback = await link.evaluate((el) => {
          const s = getComputedStyle(el);
          return { duration: s.transitionDuration, easing: s.transitionTimingFunction, properties: s.transitionProperty };
        });
        expect(feedback.duration.split(", ")).toEqual(["0.11s", "0.11s", "0.11s", "0.11s"]);
        expect(feedback.easing.split(", ")).toEqual(["ease-out", "ease-out", "ease-out", "ease-out"]);
        expect(feedback.properties).toBe("color, background-color, border-color, text-decoration-color");
      }
      expect(await primary.evaluate((el) => getComputedStyle(el).filter)).toBe("none");
      expect(await page.locator("#contact").evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("1px");
      const headings = await page.locator("#contact h2, #experience h2").evaluateAll((elements) => elements.map((el) => getComputedStyle(el).fontSize));
      expect(headings[0]).toBe(headings[1]);

      // Measure computed text against opaque/composited ancestors, and controls/focus against their surrounding surface.
      const measure = () => page.evaluate(() => {
        type Rgb = [number, number, number];
        const parse = (value: string) => {
          const values = value.match(/[\d.]+/g)!.map(Number);
          return { rgb: values.slice(0, 3) as Rgb, alpha: values[3] ?? 1 };
        };
        const blend = (front: ReturnType<typeof parse>, back: Rgb): Rgb => front.rgb.map((c, i) => c * front.alpha + back[i] * (1 - front.alpha)) as Rgb;
        const background = (element: Element): Rgb => {
          const chain: Element[] = [];
          for (let node: Element | null = element; node; node = node.parentElement) chain.unshift(node);
          let rgb: Rgb = [255, 255, 255];
          for (const node of chain) rgb = blend(parse(getComputedStyle(node).backgroundColor), rgb);
          return rgb;
        };
        const luminance = (rgb: Rgb) => {
          const c = rgb.map((v) => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; });
          return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
        };
        const ratio = (a: Rgb, b: Rgb) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
        const text = Array.from(document.querySelectorAll("body *")).filter((el) =>
          el.getClientRects().length > 0 && Array.from(el.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim()),
        ).map((el) => ({ text: el.textContent!.trim().slice(0, 90), contrast: ratio(blend(parse(getComputedStyle(el).color), background(el)), background(el)) }));
        const controls = Array.from(document.querySelectorAll(".button-secondary, .public-theme-toggle")).map((el) => ({
          control: el.className, contrast: ratio(parse(getComputedStyle(el).borderTopColor).rgb, background(el.parentElement!)),
        }));
        const focused = document.activeElement!;
        const s = getComputedStyle(focused);
        const focus = focused.matches(":focus-visible") ? { width: s.outlineWidth, offset: s.outlineOffset, contrast: ratio(parse(s.outlineColor).rgb, background(focused.parentElement!)) } : null;
        return { text, controls, focus };
      });
      const evidence: { state: string; values: Awaited<ReturnType<typeof measure>> }[] = [];
      const assertContrast = async (state: string) => {
        const values = await measure();
        evidence.push({ state, values });
        for (const item of values.text) expect(item.contrast, `${state}: ${item.text}`).toBeGreaterThanOrEqual(4.5);
        for (const item of values.controls) expect(item.contrast, `${state}: ${item.control}`).toBeGreaterThanOrEqual(3);
        if (values.focus) {
          expect(values.focus.width).toBe("3px");
          expect(parseFloat(values.focus.offset)).toBeGreaterThanOrEqual(5);
          expect(values.focus.contrast).toBeGreaterThanOrEqual(3);
        }
      };
      await page.mouse.move(1, 1);
      await assertContrast("normal");
      await page.keyboard.press("Tab");
      for (const control of [primary, secondary, toggle, page.locator(".tool-copy h3 a").first(), page.locator(".email-link")]) {
        await control.focus();
        expect(await control.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
        await assertContrast("keyboard focus");
        await control.hover();
        await assertContrast("hover transition");
        await page.waitForTimeout(55);
        await assertContrast("hover midpoint sample");
        await page.waitForTimeout(120);
        await assertContrast("hover settled");
        await page.mouse.move(1, 1);
        await page.waitForTimeout(120);
      }
      await primary.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#experience$/);
      await expect(page.locator("#experience")).toBeInViewport();
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const control of [primary, secondary, toggle]) expect(await control.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
      await expect(page.locator(".intro-text")).toBeVisible();
      await expect(page.locator(".example-result").first()).toBeVisible();
      await testInfo.attach(`refined-${theme}-contrast`, { body: JSON.stringify(evidence, null, 2), contentType: "application/json" });
    });
  }

  test("refined content and native links remain usable without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    try {
      const page = await context.newPage();
      for (const light of [false, true]) {
        await page.goto("/design-review/publication-refined");
        // Also inspect the light CSS without running any application script.
        await page.evaluate((value) => document.documentElement.classList.toggle("light", value), light);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Rujikorn Ngoensaard");
        await expect(page.locator(".intro-text")).toBeVisible();
        await expect(page.locator("#review-tool-discovery a")).toHaveText(["Cloud Egress Pricing Calculator ↗", "Workload Placement Simulator ↗"]);
        await page.getByRole("link", { name: "Explore tools", exact: true }).click();
        await expect(page.locator("#tools")).toBeInViewport();
        await expect(page.locator(".example-result").first()).toBeVisible();
        await page.getByRole("link", { name: "All writing", exact: true }).click();
        await expect(page).toHaveURL(/\/blog\/?$/);
      }
      await page.goto("/design-review/publication-refined");
      await page.getByRole("link", { name: "More about me", exact: true }).click();
      await expect(page).toHaveURL(/\/about\/?$/);
    } finally { await context.close(); }
  });

  test("refined text doubles without clipping at desktop, mobile and 320px", async ({ page }) => {
    for (const theme of ["dark", "light"]) {
      await page.goto("/design-review/publication-refined");
      await page.evaluate((value) => localStorage.setItem("theme", value), theme);
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await page.reload();
        await page.evaluate(async () => {
          await document.fonts.ready;
          // Include fixed-pixel navigation and viewport-based type, not only rem sizes.
          const sizes = Array.from(document.body.querySelectorAll<HTMLElement>("*")).map((el) => {
            const css = getComputedStyle(el);
            return { el, size: parseFloat(css.fontSize), height: parseFloat(css.lineHeight) };
          });
          for (const { el, size, height } of sizes) {
            el.style.fontSize = `${size * 2}px`;
            if (Number.isFinite(height)) el.style.lineHeight = `${height * 2}px`;
          }
        });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${theme} doubled text at ${width}px`).toBe(true);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        for (const link of await page.locator('a:not([tabindex="-1"])').all()) {
          await link.focus();
          await expect(link).toBeInViewport();
          const fits = await link.evaluate((el) => el.scrollWidth <= el.clientWidth + 1 || getComputedStyle(el).display === "inline");
          expect(fits).toBe(true);
        }
      }
    }
  });

  test("comparison links and native navigation work without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    try {
      const page = await context.newPage();
      await page.goto("/design-review/compare");
      await page.getByRole("link", { name: /Professional dossier/ }).click();
      await page.getByRole("link", { name: "View experience" }).click();
      await expect(page.locator("#experience")).toBeInViewport();
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => {
        const active = document.activeElement!;
        return { tag: active.tagName, outline: getComputedStyle(active).outlineStyle };
      });
      expect(focus.tag).toBe("A");
      expect(focus.outline).toBe("solid");
      await page.getByRole("link", { name: "View my CV", exact: true }).click();
      await expect(page).toHaveURL(/\/cv\/?$/);
    } finally { await context.close(); }
  });
});
