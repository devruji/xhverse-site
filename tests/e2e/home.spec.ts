import { test, expect } from "@playwright/test";

test("homepage introduces the engineer and professional role", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/xhverse/i);
  await expect(page.getByRole("heading", { level: 1, name: "Rujikorn Ngoensaard" })).toBeVisible();
  await expect(page.locator("main").getByText("Rujikorn Ngoensaard", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Senior Data Engineer | Platform Architecture", { exact: true })).toBeVisible();
  await expect(page.locator("main").getByText(/XH \/ bossruji/).first()).toBeVisible();
});

test("homepage prioritizes work and writing while retaining CV and advisory paths", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "View experience" })).toHaveAttribute("href", "#experience");
  await expect(page.getByRole("link", { name: "Explore tools" })).toHaveAttribute("href", "#tools");
  await expect(page.locator("main").getByRole("link", { name: "View my CV" })).toHaveAttribute("href", "/cv");
  await expect(page.locator("#contact").getByRole("link", { name: "explore advisory", exact: true })).toHaveAttribute("href", "/services");
  await expect(page.locator('main img[src*="ai-stack"], main img[src*="platform-stack"]')).toHaveCount(0);
  const sectionIds = await page.locator("main section[id]").evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionIds).toEqual(["profile", "experience", "tools", "writing", "contact"]);
});

test("homepage exposes contact destinations", async ({ page }) => {
  await page.goto("/");
  const contact = page.locator("#contact");
  await expect(contact.getByRole("heading", { name: "Let’s talk data platforms.", exact: true })).toBeVisible();
  await expect(contact.getByText("For architecture, governance, or reporting challenges, send me a note.", { exact: true })).toBeVisible();
  const email = contact.getByRole("link", { name: /Email me.*contact@xhverse\.co/ });
  await expect(email).toHaveCount(1);
  await expect(email).toHaveAttribute("href", "mailto:contact@xhverse.co");
  await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1);
  const linkedIn = contact.getByRole("link", { name: "LinkedIn", exact: true });
  await expect(linkedIn).toHaveAttribute("href", "https://www.linkedin.com/in/rujikorn/");
  await expect(linkedIn).toHaveAttribute("target", "_blank");
  await expect(linkedIn).toHaveAttribute("rel", "noopener noreferrer");
  await expect(contact.getByRole("link", { name: "explore advisory", exact: true })).toHaveAttribute("href", "/services");
  await expect(page.locator("footer").getByRole("link", { name: /GitHub/i })).toHaveAttribute("href", /github\.com/);
});

test("homepage pairs two authored tools with concrete illustrative examples", async ({ page }) => {
  await page.goto("/");
  const tools = page.locator("#tools");
  await expect(tools.getByRole("heading", { level: 2, name: "Tools I’ve built.", exact: true })).toBeVisible();
  await expect(tools.locator(".tool-entry")).toHaveCount(2);
  for (const tool of [{ title: "SCD Design Lab", slug: "scd-design-lab" }, { title: "Pipeline Recovery Planner", slug: "pipeline-recovery-planner" }]) {
    const entry = tools.locator(".tool-entry").filter({ has: page.getByRole("heading", { level: 3, name: tool.title, exact: true }) });
    await expect(entry.getByRole("link", { name: tool.title, exact: true })).toHaveAttribute("href", `/tools/${tool.slug}`);
    await expect(entry.getByRole("link", { name: "Open tool" })).toHaveAttribute("href", `/tools/${tool.slug}`);
  }
  await expect(tools.getByText("Example · Loyalty tier change · Type 2 history", { exact: true })).toBeVisible();
  await expect(tools.getByText("Example runbook brief · Illustrative assessment", { exact: true })).toBeVisible();
  await expect(tools.locator(".example-result strong")).toHaveText(["Bronze revenue: 1,000", "Gold revenue: 1,500", "54/100 · Needs design work"]);
});

test("writing cards stay synced with the authoritative blog index", async ({ page }) => {
  await page.goto("/blog");
  const newestPosts = await page.locator("main article").getByRole("link", { name: /^Read article:/ }).evaluateAll((links) => links.slice(0, 3).map((link) => ({ href: link.getAttribute("href"), label: link.getAttribute("aria-label") })));
  expect(newestPosts.length).toBeGreaterThan(0);
  await page.goto("/");
  const writingSection = page.locator("#writing");
  await expect(writingSection.getByRole("link", { name: /^Read article:/ })).toHaveCount(newestPosts.length);
  for (const post of newestPosts) {
    expect(post.label).toBeTruthy();
    expect(post.href).toBeTruthy();
    const articleLink = writingSection.getByRole("link", { name: post.label ?? "" });
    await expect(articleLink).toBeVisible();
    await expect(articleLink).toHaveAttribute("href", post.href ?? "");
  }
});

test("discovery draws from the catalog, avoids the previous pair and initializes after public navigation", async ({ page, context }) => {
  await context.addInitScript(() => { Math.random = () => 0; });
  await page.goto("/");
  const links = page.locator("#tool-discovery a");
  await expect(links).toHaveCount(2);
  const first = await links.evaluateAll((items) => items.map((link) => link.getAttribute("href")));
  expect(first).toEqual(["/tools/egress-pricing-calculator", "/tools/workload-placement-simulator"]);
  await page.reload();
  const second = await links.evaluateAll((items) => items.map((link) => link.getAttribute("href")));
  expect(second).toEqual(["/tools/data-product-contract-builder", "/tools/access-model-simulator"]);
  await page.getByRole("link", { name: "More about me" }).click();
  await page.waitForURL(/\/about\/?$/);
  await page.getByRole("link", { name: "xhverse home", exact: true }).click();
  await page.waitForURL(/\/$/);
  await expect(links).toHaveCount(2);
  const revisited = await links.evaluateAll((items) => items.map((link) => link.getAttribute("href")));
  expect(revisited).toEqual(first);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("xhverse:tool-discovery")!))).toEqual(["egress-pricing-calculator", "workload-placement-simulator"]);
  await expect(page.locator(".tool-entry")).toHaveCount(2);
});

test("public discovery survives unavailable storage and keeps its no-JavaScript links", async ({ page, browser, baseURL }) => {
  await page.addInitScript(() => {
    const read = Storage.prototype.getItem;
    const write = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) { if (key === "xhverse:tool-discovery") throw new DOMException("blocked", "SecurityError"); return read.call(this, key); };
    Storage.prototype.setItem = function (key, value) { if (key === "xhverse:tool-discovery") throw new DOMException("blocked", "QuotaExceededError"); return write.call(this, key, value); };
  });
  await page.goto("/");
  await expect(page.locator("#tool-discovery a")).toHaveCount(2);
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  try {
    const fallback = await context.newPage();
    await fallback.goto("/");
    await expect(fallback.locator("#tool-discovery a")).toHaveText(["Cloud Egress Pricing Calculator ↗", "Workload Placement Simulator ↗"]);
    expect(await fallback.locator("#tool-discovery").evaluate((list) => getComputedStyle(list).display)).toBe("grid");
    expect(await fallback.locator("#tool-discovery").evaluate((list) => getComputedStyle(list).gridTemplateColumns.split(" ").length)).toBe(2);
    await fallback.locator("#tool-discovery a").first().click();
    await expect(fallback).toHaveURL(/\/tools\/egress-pricing-calculator\/?$/);
  } finally { await context.close(); }
});


test("desktop contact occupies the same full row as the professional record", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const widths = await page.locator(".publication-home").evaluate((main) => {
    const record = main.querySelector("#experience")!.getBoundingClientRect();
    const contact = main.querySelector("#contact")!.getBoundingClientRect();
    return { record: record.width, contact: contact.width, left: contact.left, recordLeft: record.left };
  });
  expect(widths.contact).toBeCloseTo(widths.record, 1);
  expect(widths.contact).toBeGreaterThan(1000);
  expect(widths.left).toBeCloseTo(widths.recordLeft, 1);
});


test("discovery uses two equal desktop columns and one mobile column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const list = page.locator("#tool-discovery");
  const desktop = await list.evaluate((element) => ({ display: getComputedStyle(element).display, items: [...element.children].map((item) => ({ left: item.getBoundingClientRect().left, top: item.getBoundingClientRect().top, width: item.getBoundingClientRect().width })) }));
  expect(desktop.display).toBe("grid");
  expect(desktop.items[0].width).toBeCloseTo(desktop.items[1].width, 1);
  expect(desktop.items[0].width).toBeGreaterThan(500);
  expect(desktop.items[1].left).toBeGreaterThan(desktop.items[0].left + desktop.items[0].width);
  expect(desktop.items[1].top).toBeCloseTo(desktop.items[0].top, 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => list.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(1);
  const mobile = await list.evaluate((element) => [...element.children].map((item) => ({ left: item.getBoundingClientRect().left, top: item.getBoundingClientRect().top, width: item.getBoundingClientRect().width })));
  expect(mobile[1].left).toBeCloseTo(mobile[0].left, 1);
  expect(mobile[1].top).toBeGreaterThan(mobile[0].top);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
