import { test, expect, type Page } from "@playwright/test";
import { toolCatalog } from "../../src/data/tools";

async function mockCvVerification(page: Page) {
  await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
  await page.goto("/cv");
  await page.evaluate(() => {
    Object.assign(window, { turnstile: {
      render(container: HTMLElement) {
        const token = document.createElement("input");
        token.type = "hidden";
        token.name = "cf-turnstile-response";
        token.value = "local-test-token";
        container.appendChild(token);
        return "test-widget";
      },
      reset() {},
      remove() {},
    } });
  });
}

const publicRoutes = ["/", "/about", "/blog", "/tools", "/services", "/cv", "/gallery", ...toolCatalog.map((tool) => `/tools/${tool.slug}`)];

for (const theme of ["dark", "light"] as const) {
  test(`every public route keeps the shared shell and readable layout in ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    await page.goto("/blog");
    const articles = await page.locator("main article").getByRole("link", { name: /^Read article:/ }).evaluateAll((links) => links
      .map((link) => link.getAttribute("href"))
      .filter((href): href is string => Boolean(href?.startsWith("/blog/"))));
    for (const path of [...publicRoutes, ...articles, "/404.html"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-public-site", "");
      await expect(page.locator("main")).toHaveAttribute("id", "main-content");
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("#theme-toggle")).toBeVisible();
      const nav = page.locator("header.public-header");
      await expect(nav.locator('a[href="/#contact"]')).toHaveCount(2);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        family: getComputedStyle(document.body).fontFamily,
        light: document.documentElement.classList.contains("light"),
      }));
      expect(metrics.overflow, `horizontal overflow on ${path}`).toBe(false);
      expect(metrics.family).toContain("Geist Sans");
      expect(metrics.light).toBe(theme === "light");
    }
    await page.goto("/");
    const button = await page.locator(".cta-primary").first().evaluate((el) => ({ background: getComputedStyle(el).backgroundColor, shadow: getComputedStyle(el).boxShadow }));
    expect(button.background).toBe(theme === "light" ? "rgb(52, 86, 142)" : "rgb(168, 191, 242)");
    expect(button.shadow).toBe("none");
  });
}

test("theme choice survives public navigation and remains operable", async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem("theme")) localStorage.setItem("theme", "dark"); });
  await page.goto("/");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.locator("#writing").getByRole("link", { name: "All writing" }).click();
  await expect(page).toHaveURL(/\/blog\/?$/);
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).not.toHaveClass(/light/);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
});

test("mobile disclosure supports Escape and contact navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/about");
  const menu = page.locator("#public-menu");
  const summary = menu.locator("summary");
  await summary.click();
  await expect(menu).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(summary).toBeFocused();
  await summary.click();
  await menu.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator("#contact")).toBeInViewport();
});

test("mobile navigation and public content work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator("#public-menu summary").click();
  await page.locator("#public-menu").getByRole("link", { name: "Writing" }).click();
  await expect(page).toHaveURL(/\/blog\/?$/);
  await expect(page.getByRole("heading", { name: "Writing", exact: true, level: 1 })).toBeVisible();
  await context.close();
});

test("public layouts reflow at 320px and respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 800 });
  for (const path of ["/", "/about", "/tools", "/blog/data-product-as-platform-contract", "/cv", "/tools/workload-placement-simulator"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `horizontal overflow on ${path} at 320px`).toBe(false);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  const duration = await page.locator("#theme-toggle").evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(duration).toBe("0s");
});

test("public styles leave the admin shell unchanged", async ({ page }) => {
  await page.goto("/admin/blog/");
  await expect(page.locator("html")).not.toHaveAttribute("data-public-site", "");
  await expect(page.locator("header.public-header")).toHaveCount(0);
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).not.toContain("Geist");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("CV modal contains focus and only reports a received request after a submission", async ({ page }) => {
  let submitted = 0;
  await page.route("**/functions/v1/submit-cv-request", async (route) => {
    submitted++;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ kind: "saved" }) });
  });
  await mockCvVerification(page);
  const opener = page.locator(".cv-request-open").first();
  await opener.click();
  await expect(page.locator("#cv-email")).toBeFocused();
  await page.locator("#cv-modal-close").focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#cv-submit-btn")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#cv-modal-close")).toBeFocused();
  await page.locator("#cv-email").fill("local-test@example.com");
  await page.locator("#cv-submit-btn").click();
  await expect.poll(async () => await page.locator("#cv-form-error").isVisible() || await page.locator("#cv-modal-success-view").isVisible()).toBe(true);
  if (submitted === 0) {
    await expect(page.locator("#cv-form-error")).toHaveText("CV requests are unavailable in this local preview. Email contact@xhverse.co to request a copy.");
    await expect(page.locator("#cv-modal-success-view")).toBeHidden();
  } else {
    expect(submitted).toBe(1);
    await expect(page.locator("#cv-modal-success-view")).toBeVisible();
    await expect(page.locator("#cv-success-message")).toContainText("awaiting review");
  }
  await page.keyboard.press("Escape");
  await expect(page.locator("#cv-request-modal")).toBeHidden();
  await expect(opener).toBeFocused();
});

for (const kind of ["saved", "duplicate_pending"] as const) {
  test(`configured CV ${kind} confirms review and moves focus to completion`, async ({ page }) => {
    test.skip(process.env.CV_MOCK_SERVICE !== "1", "Run against the isolated mocked-service build.");
    let submitted = 0;
    await page.route("**/functions/v1/submit-cv-request", async (route) => {
      submitted++;
      expect(route.request().method()).toBe("POST");
      const payload = route.request().postDataJSON() as Record<string, unknown>;
      expect(payload.email).toBe("local-test@example.com");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ kind }) });
    });
    await mockCvVerification(page);
    const opener = page.locator(".cv-request-open").first();
    await opener.click();
    await page.locator("#cv-email").fill("local-test@example.com");
    await page.locator("#cv-submit-btn").click();
    await expect(page.locator("#cv-modal-success-view")).toBeVisible();
    expect(submitted).toBe(1);
    await expect(page.locator("#cv-success-message")).toContainText("awaiting review");
    await expect(page.locator("#cv-success-close")).toBeFocused();
    await expect(page.locator("#cv-request-modal")).toHaveAttribute("aria-labelledby", "cv-success-title");
    await page.locator("#cv-success-close").click();
    await expect(opener).toBeFocused();
    await opener.click();
    await expect(page.locator("#cv-request-modal")).toHaveAttribute("aria-labelledby", "cv-modal-title");
    await expect(page.locator("#cv-email")).toBeFocused();
  });
}

test("public text reflows when text size is doubled", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  for (const path of ["/", "/tools", "/blog/data-product-as-platform-contract", "/blog", "/cv", "/tools/lakehouse-cost-calculator"]) {
    await page.goto(path);
    await page.evaluate(() => {
      const elements = Array.from(document.body.querySelectorAll<HTMLElement>("*"));
      const sizes = elements.map((el) => {
        const css = getComputedStyle(el);
        return { el, size: parseFloat(css.fontSize), height: parseFloat(css.lineHeight) };
      });
      sizes.forEach(({ el, size, height }) => {
        el.style.fontSize = `${size * 2}px`;
        if (Number.isFinite(height)) el.style.lineHeight = `${height * 2}px`;
      });
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), `overflow with doubled text on ${path}`).toBe(false);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (path === "/") {
      await expect(page.locator(".publication-home .identity h1")).toHaveText("Rujikorn Ngoensaard");
      const fits = await page.locator(".identity-actions").evaluate((actions) => actions.scrollWidth <= actions.clientWidth + 1);
      expect(fits, "homepage actions remain inside the reading column with doubled text").toBe(true);
    }
  }
});

async function renderedTextContrast(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((elements) => elements.map((element) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Contrast check requires a canvas color resolver.");
    const ancestors: Element[] = [];
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) ancestors.unshift(ancestor);
    for (const ancestor of ancestors) {
      const style = getComputedStyle(ancestor);
      if (style.backgroundImage !== "none" || Number(style.opacity) !== 1 || style.filter !== "none") throw new Error("Contrast check encountered an unsupported image, opacity, or filter layer.");
      // Canvas resolves modern CSS colors and composites translucent ancestors in display order.
      context.fillStyle = style.backgroundColor;
      context.fillRect(0, 0, 1, 1);
    }
    const background = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    context.fillStyle = getComputedStyle(element).color;
    context.fillRect(0, 0, 1, 1);
    const foreground = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    const luminance = (rgb: number[]) => {
      const linear = rgb.map((channel) => { const value = channel / 255; return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    const a = luminance(background);
    const b = luminance(foreground);
    return { text: element.textContent?.trim(), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), fontSize: parseFloat(getComputedStyle(element).fontSize) };
  }));
}

for (const theme of ["dark", "light"] as const) {
  test(`calculated placement signal remains readable in ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    await page.goto("/tools/workload-placement-simulator");
    await page.getByRole("button", { name: "Simulate placement" }).click();
    await expect(page.getByTestId("placement-result")).toBeVisible();
    await expect(page.locator("#top-score")).toHaveText("100/100");
    await expect(page.locator("#top-fit")).toHaveText("Strong fit");
    const text = await renderedTextContrast(page, "div:has(> #top-score) > p");
    expect(text).toHaveLength(3);
    for (const item of text) expect(item.ratio, `${theme} placement ${item.text}`).toBeGreaterThanOrEqual(item.fontSize >= 24 ? 3 : 4.5);
  });

  test(`SQL query reading stays contained and readable on mobile in ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/tools/sql-deathmatch");
      await page.getByRole("button", { name: "Start Deathmatch" }).click();
      await expect(page.locator("#game-panel")).toBeVisible();
      await expect(page.locator("#query-a-sql")).not.toHaveText("");
      const dimensions = await page.locator("#queries-container pre").evaluateAll((blocks) => blocks.map((block) => ({ left: block.getBoundingClientRect().left, right: block.getBoundingClientRect().right, width: block.clientWidth, scroll: block.scrollWidth, overflow: getComputedStyle(block).overflowX })));
      for (const block of dimensions) {
        expect(block.left).toBeGreaterThanOrEqual(0);
        expect(block.right).toBeLessThanOrEqual(width);
        expect(block.overflow).toBe("auto");
      }
      expect(dimensions.some((block) => block.scroll > block.width)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const item of await renderedTextContrast(page, "#queries-container code")) expect(item.ratio, `${theme} SQL at ${width}px`).toBeGreaterThanOrEqual(4.5);
      await page.locator("#query-a-btn").click();
      await expect(page.locator("#reveal-panel")).toBeVisible();
      await expect(page.getByRole("button", { name: "Next Round" })).toBeVisible();
    }
  });
}
