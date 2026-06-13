import { describe, expect, it } from "vitest";
import { profile } from "../../data/profile";
import { site } from "../../data/site";
import {
  buildAboutPageJsonLd,
  buildAdvisoryServiceJsonLd,
  buildCollectionPageJsonLd,
  buildCvProfilePageJsonLd,
  buildHomeIdentityGraph,
  buildPersonJsonLd,
  buildWebsiteJsonLd,
  getPageUrl,
  getPersonId,
  getProfilePageId,
  getRootUrl,
  getWebsiteId,
} from "./structured-data";

const baseUrl = "https://xhverse.co";

describe("structured data URL helpers", () => {
  it("keeps root and entity IDs stable", () => {
    expect(getRootUrl(baseUrl)).toBe("https://xhverse.co/");
    expect(getPageUrl("/blog", baseUrl)).toBe("https://xhverse.co/blog");
    expect(getWebsiteId(baseUrl)).toBe("https://xhverse.co/#website");
    expect(getPersonId(baseUrl)).toBe("https://xhverse.co/#person");
    expect(getProfilePageId(baseUrl)).toBe("https://xhverse.co/#profile-page");
  });
});

describe("buildWebsiteJsonLd", () => {
  it("describes the public XHVERSE website and publisher", () => {
    expect(buildWebsiteJsonLd(baseUrl)).toEqual({
      "@type": "WebSite",
      "@id": "https://xhverse.co/#website",
      name: "XHVERSE",
      alternateName: ["xhverse", "xhverse.co", "XHVERSE by bossruji"],
      url: "https://xhverse.co/",
      inLanguage: "en",
      publisher: { "@id": "https://xhverse.co/#person" },
    });
  });
});

describe("buildPersonJsonLd", () => {
  it("keeps owner identity aliases and controlled profiles together", () => {
    const person = buildPersonJsonLd(baseUrl);

    expect(person["@id"]).toBe("https://xhverse.co/#person");
    expect(person.name).toBe(profile.fullName);
    expect(person.alternateName).toEqual(
      expect.arrayContaining(["XH", "XHVERSE", "xhverse.co", "bossruji"]),
    );
    expect(person.sameAs).toEqual([site.github, site.medium, site.linkedin]);
    expect(person.image).toBe("https://xhverse.co/images/xh-profile-960.png");
  });
});

describe("buildHomeIdentityGraph", () => {
  it("links WebSite, Person, and ProfilePage nodes with shared IDs", () => {
    const graph = buildHomeIdentityGraph(baseUrl);

    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"]).toEqual([
      buildWebsiteJsonLd(baseUrl),
      buildPersonJsonLd(baseUrl),
      {
        "@type": "ProfilePage",
        "@id": "https://xhverse.co/#profile-page",
        name: "Rujikorn Ngoensaard - XHVERSE",
        alternateName: ["xhverse", "xhverse.co", "bossruji", "XH"],
        url: "https://xhverse.co/",
        description:
          "XHVERSE is the data architecture journal and portfolio of Rujikorn Ngoensaard, also known as XH or bossruji.",
        about: { "@id": "https://xhverse.co/#person" },
        mainEntity: { "@id": "https://xhverse.co/#person" },
        isPartOf: { "@id": "https://xhverse.co/#website" },
        inLanguage: "en",
      },
    ]);
  });
});

describe("profile page builders", () => {
  it("builds AboutPage schema around the shared Person node", () => {
    const aboutPage = buildAboutPageJsonLd(baseUrl);

    expect(aboutPage["@type"]).toBe("AboutPage");
    expect(aboutPage["@id"]).toBe("https://xhverse.co/about#about-page");
    expect(aboutPage.name).toBe("About Rujikorn Ngoensaard (XH / bossruji)");
    expect(aboutPage.mainEntity).toEqual(buildPersonJsonLd(baseUrl));
    expect(aboutPage.isPartOf).toEqual({ "@id": "https://xhverse.co/#website" });
  });

  it("builds CV ProfilePage schema around the shared Person node", () => {
    const cvPage = buildCvProfilePageJsonLd(baseUrl);

    expect(cvPage["@type"]).toBe("ProfilePage");
    expect(cvPage["@id"]).toBe("https://xhverse.co/cv#cv-page");
    expect(cvPage.name).toBe("Rujikorn Ngoensaard CV");
    expect(cvPage.about).toEqual(buildPersonJsonLd(baseUrl));
    expect(cvPage.mainEntity).toEqual({ "@id": "https://xhverse.co/#person" });
  });
});

describe("buildAdvisoryServiceJsonLd", () => {
  it("builds service schema tied to the shared Person and WebSite IDs", () => {
    expect(buildAdvisoryServiceJsonLd(baseUrl)).toEqual({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://xhverse.co/services#advisory-service",
      name: "Data Platform Advisory",
      description:
        "Architecture review, governance design, and platform strategy advisory for enterprise data teams working with Azure, Databricks, and Microsoft Fabric.",
      provider: { "@id": "https://xhverse.co/#person" },
      serviceType: "Consulting",
      areaServed: "Worldwide",
      url: "https://xhverse.co/services",
      isPartOf: { "@id": "https://xhverse.co/#website" },
    });
  });
});

describe("buildCollectionPageJsonLd", () => {
  it("builds branded collection schema without optional parts", () => {
    const collection = buildCollectionPageJsonLd({
      baseUrl,
      path: "/tools",
      name: "XHVERSE tools by Rujikorn Ngoensaard",
      alternateName: ["xhverse tools"],
      description: "Free data platform tools by Rujikorn Ngoensaard.",
    });

    expect(collection).toEqual({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://xhverse.co/tools#collection",
      name: "XHVERSE tools by Rujikorn Ngoensaard",
      alternateName: ["xhverse tools"],
      url: "https://xhverse.co/tools",
      description: "Free data platform tools by Rujikorn Ngoensaard.",
      creator: { "@id": "https://xhverse.co/#person" },
      publisher: { "@id": "https://xhverse.co/#person" },
      isPartOf: { "@id": "https://xhverse.co/#website" },
    });
  });

  it("preserves collection parts when supplied", () => {
    const hasPart = [{ "@type": "BlogPosting", headline: "Data contracts" }];
    const collection = buildCollectionPageJsonLd({
      baseUrl,
      path: "/blog",
      name: "XHVERSE writing by Rujikorn Ngoensaard",
      alternateName: ["bossruji writing"],
      description: "Essays from Rujikorn Ngoensaard.",
      hasPart,
    });

    expect(collection.hasPart).toEqual(hasPart);
  });
});
