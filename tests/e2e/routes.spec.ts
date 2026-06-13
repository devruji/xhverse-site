import { test, expect, type Page } from "@playwright/test";

type JsonLdRecord = Record<string, unknown>;

async function readJsonLd(page: Page): Promise<JsonLdRecord[]> {
  const payloads = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ""));

  return payloads.map((payload) => JSON.parse(payload) as JsonLdRecord);
}

function getJsonLdByType(items: JsonLdRecord[], type: string) {
  return items.find((item) => item["@type"] === type);
}

function flattenJsonLd(items: JsonLdRecord[]): JsonLdRecord[] {
  return items.flatMap((item) => {
    const graph = item["@graph"];
    return Array.isArray(graph) ? (graph as JsonLdRecord[]) : [item];
  });
}

test("about page loads expected sections", async ({ page }) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: /Senior Data Engineer/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Platform direction" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Architecture statement" }),
  ).toBeVisible();
});

test("blog page loads posts", async ({ page }) => {
  await page.goto("/blog");
  await expect(
    page.getByRole("heading", { name: "Writing by Rujikorn Ngoensaard" }),
  ).toBeVisible();
  await expect(page.locator("article").first()).toBeVisible();
  await expect(page.getByText("Read article").first()).toBeVisible();
});

test("blog article page renders markdown body", async ({ page }) => {
  await page.goto("/blog");
  await page.locator("article a").first().click();
  await expect(page).toHaveURL(/\/blog\/[^/]+\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".article-body")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Table of contents" })).toBeVisible();
  await expect(page.locator(".article-body :is(h2, h3)[id]").first()).toBeVisible();
  await expect(page.locator("[data-blog-view-count]").first()).toHaveAttribute(
    "aria-live",
    "polite",
  );
});

test("blog article uses its cover image for social metadata", async ({ page }) => {
  await page.goto("/blog/data-product-as-platform-contract");
  const coverUrl =
    "https://jxfpnfliioqbhzznaphd.supabase.co/storage/v1/object/public/blog-covers/posts/data-product-as-platform-contract/00000000-0000-4000-8000-000000000005.jpg";
  await expect(
    page.locator(`meta[property="og:image"][content="${coverUrl}"]`),
  ).toHaveCount(1);
  await expect(
    page.locator(`meta[name="twitter:image"][content="${coverUrl}"]`),
  ).toHaveCount(1);
});

test("data product article exposes canonical article structured data", async ({ page }) => {
  await page.goto("/blog/data-product-as-platform-contract");
  const canonicalUrl = "https://xhverse.co/blog/data-product-as-platform-contract";

  await expect(page).toHaveTitle("Data Product as a Platform Contract | XHVERSE");
  await expect(page.locator(`link[rel="canonical"][href="${canonicalUrl}"]`)).toHaveCount(1);
  await expect(page.locator(`meta[property="og:url"][content="${canonicalUrl}"]`)).toHaveCount(1);

  const jsonLd = getJsonLdByType(await readJsonLd(page), "BlogPosting");
  expect(jsonLd?.["@id"]).toBe(canonicalUrl);
  expect(jsonLd?.headline).toBe("Data product as a platform contract");
  expect(jsonLd?.url).toBe(canonicalUrl);
  expect(jsonLd?.datePublished).toBe("2026-06-03");
  expect(jsonLd?.dateModified).toBe("2026-06-03");
  expect(jsonLd?.image).toBe(
    "https://jxfpnfliioqbhzznaphd.supabase.co/storage/v1/object/public/blog-covers/posts/data-product-as-platform-contract/00000000-0000-4000-8000-000000000005.jpg",
  );
  expect(jsonLd?.author).toEqual(
    expect.objectContaining({
      "@id": "https://xhverse.co/#person",
      name: "Rujikorn Ngoensaard",
    }),
  );
  expect(jsonLd?.publisher).toEqual(
    expect.objectContaining({
      "@id": "https://xhverse.co/#person",
      name: "Rujikorn Ngoensaard",
    }),
  );
});

test("materialized views article exposes canonical metadata and content", async ({ page }) => {
  await page.goto("/blog/most-teams-use-materialized-views-too-early");
  const canonicalUrl =
    "https://xhverse.co/blog/most-teams-use-materialized-views-too-early";
  const coverUrl =
    "https://jxfpnfliioqbhzznaphd.supabase.co/storage/v1/object/public/blog-covers/posts/most-teams-use-materialized-views-too-early/00000000-0000-4000-8000-000000000001.jpg";

  await expect(page).toHaveTitle(
    "Most Teams Use Materialized Views Too Early | Data Architecture | XHVERSE",
  );
  await expect(
    page.locator(`link[rel="canonical"][href="${canonicalUrl}"]`),
  ).toHaveCount(1);
  await expect(
    page.locator(`meta[property="og:image"][content="${coverUrl}"]`),
  ).toHaveCount(1);
  await expect(
    page.locator(`meta[name="twitter:image"][content="${coverUrl}"]`),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      name: "Most Teams Use Materialized Views Too Early",
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Platform behavior is not portable",
      level: 2,
    }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/tools/lakehouse-cost-calculator"]'),
  ).toHaveCount(2);

  const jsonLd = getJsonLdByType(await readJsonLd(page), "BlogPosting");
  expect(jsonLd?.["@id"]).toBe(canonicalUrl);
  expect(jsonLd?.headline).toBe("Most Teams Use Materialized Views Too Early");
  expect(jsonLd?.datePublished).toBe("2026-06-13");
  expect(jsonLd?.dateModified).toBe("2026-06-13");
  expect(jsonLd?.image).toBe(coverUrl);
});

test("blog article mobile layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/blog");
  await page.locator("article a").first().click();
  await expect(page.locator(".article-body")).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("admin blog routes load the protected shell", async ({ page }) => {
  await page.goto("/admin/blog/");
  await expect(page).toHaveTitle(/Blog Writer \| Admin \| XHVERSE/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.goto("/admin/blog/new/");
  await expect(page).toHaveTitle(/New Post \| Admin \| XHVERSE/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.goto("/admin/blog/analytics/");
  await expect(page).toHaveTitle(/Blog Analytics \| Admin \| XHVERSE/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("gallery page renders images", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
  await expect(page.locator("img").first()).toBeVisible();
});

test("cv page gates CV access via email capture modal", async ({ page }) => {
  await page.goto("/cv");
  await expect(page).toHaveTitle(/Rujikorn Ngoensaard CV/i);
  await expect(
    page.getByRole("heading", { name: "Rujikorn Ngoensaard" }),
  ).toBeVisible();
  const getCopyBtn = page.getByRole("button", { name: /Request CV/i }).first();
  await expect(getCopyBtn).toBeVisible();
  await getCopyBtn.click();
  const modal = page.locator("#cv-request-modal");
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("heading", { name: "Get the CV in your inbox" })).toBeVisible();
  await modal.locator("#cv-email").fill("requester@example.com");
  await modal.getByRole("button", { name: "Request CV" }).click();
  await expect(modal.locator("#cv-form-error")).toHaveText(
    "Please complete the verification challenge.",
  );
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
});

test("homepage sets SEO and referrer metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="referrer"][content="strict-origin-when-cross-origin"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"][href="https://xhverse.co/"]')).toHaveCount(1);
  await expect(page.locator('meta[name="author"][content="Rujikorn Ngoensaard"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:site_name"][content="XHVERSE"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"][content="https://xhverse.co/images/og-cover.jpg"]')).toHaveCount(1);
  await expect(page.locator('meta[name="twitter:image"][content="https://xhverse.co/images/og-cover.jpg"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"][href="/favicon.svg"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][sizes="192x192"][href="/icon-192.png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][sizes="32x32"][href="/favicon-32x32.png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"][href="/apple-touch-icon.png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="manifest"][href="/site.webmanifest"]')).toHaveCount(1);
});

test("homepage exposes a branded Person and WebSite identity graph", async ({ page }) => {
  await page.goto("/");
  const graphScript = await readJsonLd(page);
  const graph = graphScript[0]["@graph"];

  expect(Array.isArray(graph)).toBe(true);
  const graphItems = graph as JsonLdRecord[];
  const website = getJsonLdByType(graphItems, "WebSite");
  const person = getJsonLdByType(graphItems, "Person");
  const profilePage = getJsonLdByType(graphItems, "ProfilePage");

  expect(website?.name).toBe("XHVERSE");
  expect(website?.alternateName).toEqual(
    expect.arrayContaining(["xhverse", "xhverse.co", "XHVERSE by bossruji"]),
  );
  expect(person?.name).toBe("Rujikorn Ngoensaard");
  expect(person?.alternateName).toEqual(
    expect.arrayContaining(["XH", "XHVERSE", "xhverse.co", "bossruji"]),
  );
  expect(profilePage?.name).toBe("Rujikorn Ngoensaard - XHVERSE");
});

test("about and cv pages point profile schema at the shared person identity", async ({ page }) => {
  const cases = [
    {
      path: "/about",
      canonical: "https://xhverse.co/about",
      type: "AboutPage",
      heading: /Senior Data Engineer/i,
    },
    {
      path: "/cv",
      canonical: "https://xhverse.co/cv",
      type: "ProfilePage",
      heading: "Rujikorn Ngoensaard",
    },
  ] as const;

  for (const item of cases) {
    await page.goto(item.path);
    await expect(page.getByRole("heading", { name: item.heading, level: 1 })).toBeVisible();
    await expect(page.locator(`link[rel="canonical"][href="${item.canonical}"]`)).toHaveCount(1);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);

    const nodes = flattenJsonLd(await readJsonLd(page));
    const pageNode = getJsonLdByType(nodes, item.type);
    expect(pageNode?.url).toBe(item.canonical);

    const mainEntity =
      pageNode?.mainEntity && typeof pageNode.mainEntity === "object"
        ? (pageNode.mainEntity as JsonLdRecord)
        : {};
    const about =
      pageNode?.about && typeof pageNode.about === "object"
        ? (pageNode.about as JsonLdRecord)
        : {};
    const embeddedPerson = mainEntity.alternateName ? mainEntity : about;
    const personReference =
      embeddedPerson["@id"] ?? mainEntity["@id"] ?? about["@id"];

    expect(personReference).toBe("https://xhverse.co/#person");
    expect(embeddedPerson.alternateName).toEqual(
      expect.arrayContaining(["XH", "XHVERSE", "xhverse.co", "bossruji"]),
    );
  }
});

test("blog and tools pages reinforce branded search identity", async ({ page }) => {
  await page.goto("/blog");
  await expect(page).toHaveTitle("Writing by Rujikorn Ngoensaard | XHVERSE");
  await expect(page.locator('link[rel="canonical"][href="https://xhverse.co/blog"]')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Rujikorn Ngoensaard.*XH.*bossruji/,
  );
  await expect(page.getByRole("heading", { name: "Writing by Rujikorn Ngoensaard" })).toBeVisible();
  await expect(page.getByText(/Practical notes from XH \/ bossruji/i)).toBeVisible();
  const blogJsonLd = getJsonLdByType(await readJsonLd(page), "CollectionPage");
  expect(blogJsonLd?.["@id"]).toBe("https://xhverse.co/blog#collection");
  expect(blogJsonLd?.name).toBe("XHVERSE writing by Rujikorn Ngoensaard");
  expect(blogJsonLd?.alternateName).toEqual(
    expect.arrayContaining(["xhverse writing", "bossruji writing", "XH data architecture notes"]),
  );

  await page.goto("/tools");
  await expect(page).toHaveTitle("Data Platform Tools by Rujikorn Ngoensaard | XHVERSE");
  await expect(page.locator('link[rel="canonical"][href="https://xhverse.co/tools"]')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Rujikorn Ngoensaard.*XH.*bossruji/,
  );
  await expect(page.getByRole("heading", { name: "Data platform tools by Rujikorn Ngoensaard" })).toBeVisible();
  await expect(page.getByText(/free tools from XH \/ bossruji/i)).toBeVisible();
  const toolsJsonLd = getJsonLdByType(await readJsonLd(page), "CollectionPage");
  expect(toolsJsonLd?.["@id"]).toBe("https://xhverse.co/tools#collection");
  expect(toolsJsonLd?.name).toBe("XHVERSE tools by Rujikorn Ngoensaard");
  expect(toolsJsonLd?.alternateName).toEqual(
    expect.arrayContaining(["xhverse tools", "bossruji data tools", "XH data platform tools"]),
  );
});

test("crawl surfaces expose public URLs and keep admin routes out", async ({ page }) => {
  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsText = await robots.text();
  expect(robotsText).toContain("Allow: /");
  expect(robotsText).toContain("Sitemap: https://xhverse.co/sitemap-index.xml");

  const sitemapIndex = await page.request.get("/sitemap-index.xml");
  expect(sitemapIndex.ok()).toBe(true);
  const sitemapIndexXml = await sitemapIndex.text();
  expect(sitemapIndexXml).toContain("https://xhverse.co/sitemap-0.xml");

  const sitemap = await page.request.get("/sitemap-0.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapXml = await sitemap.text();
  expect(sitemapXml).toContain("https://xhverse.co/");
  expect(sitemapXml).toContain("https://xhverse.co/about/");
  expect(sitemapXml).toContain("https://xhverse.co/services/");
  expect(sitemapXml).toContain("https://xhverse.co/tools/");
  expect(sitemapXml).not.toContain("/admin/");
});
