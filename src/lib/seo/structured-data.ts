import { profile } from "../../data/profile";
import { site } from "../../data/site";

export type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };
export type JsonLdObject = { [key: string]: JsonLdValue };

export function getRootUrl(baseUrl: string): string {
  return new URL("/", baseUrl).toString();
}

export function getPageUrl(path: string, baseUrl: string): string {
  return new URL(path, baseUrl).toString();
}

export function getWebsiteId(baseUrl: string): string {
  return `${getRootUrl(baseUrl)}#website`;
}

export function getPersonId(baseUrl: string): string {
  return `${getRootUrl(baseUrl)}#person`;
}

export function getProfilePageId(baseUrl: string): string {
  return `${getRootUrl(baseUrl)}#profile-page`;
}

export function buildWebsiteJsonLd(baseUrl: string): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": getWebsiteId(baseUrl),
    name: site.title,
    alternateName: ["xhverse", "xhverse.co", "XHVERSE by bossruji"],
    url: getRootUrl(baseUrl),
    inLanguage: "en",
    publisher: { "@id": getPersonId(baseUrl) },
  };
}

export function buildPersonJsonLd(baseUrl: string): JsonLdObject {
  return {
    "@type": "Person",
    "@id": getPersonId(baseUrl),
    name: profile.fullName,
    alternateName: profile.alternateNames,
    additionalName: ["XH", "bossruji"],
    url: getRootUrl(baseUrl),
    mainEntityOfPage: getRootUrl(baseUrl),
    jobTitle: profile.title,
    description: profile.longBio,
    image: getPageUrl(profile.avatar, baseUrl),
    email: profile.email,
    knowsAbout: profile.knowsAbout,
    sameAs: [site.github, site.medium, site.linkedin],
  };
}

export function buildHomeProfilePageJsonLd(baseUrl: string): JsonLdObject {
  return {
    "@type": "ProfilePage",
    "@id": getProfilePageId(baseUrl),
    name: `${profile.fullName} - ${site.title}`,
    alternateName: ["xhverse", "xhverse.co", "bossruji", "XH"],
    url: getRootUrl(baseUrl),
    description:
      "XHVERSE is the data architecture journal and portfolio of Rujikorn Ngoensaard, also known as XH or bossruji.",
    about: { "@id": getPersonId(baseUrl) },
    mainEntity: { "@id": getPersonId(baseUrl) },
    isPartOf: { "@id": getWebsiteId(baseUrl) },
    inLanguage: "en",
  };
}

export function buildHomeIdentityGraph(baseUrl: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebsiteJsonLd(baseUrl),
      buildPersonJsonLd(baseUrl),
      buildHomeProfilePageJsonLd(baseUrl),
    ],
  };
}

export function buildAboutPageJsonLd(baseUrl: string): JsonLdObject {
  const aboutUrl = getPageUrl("/about", baseUrl);

  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${aboutUrl}#about-page`,
    name: `About ${profile.fullName} (XH / bossruji)`,
    alternateName: ["About XH", "About bossruji", "About xhverse"],
    url: aboutUrl,
    mainEntity: buildPersonJsonLd(baseUrl),
    isPartOf: { "@id": getWebsiteId(baseUrl) },
  };
}

export function buildCvProfilePageJsonLd(baseUrl: string): JsonLdObject {
  const cvUrl = getPageUrl("/cv", baseUrl);

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${cvUrl}#cv-page`,
    name: `${profile.fullName} CV`,
    alternateName: ["Rujikorn Ngoensaard resume", "bossruji CV", "XH CV"],
    url: cvUrl,
    description:
      "Public CV and professional background for Rujikorn Ngoensaard, also known as XH and bossruji.",
    about: buildPersonJsonLd(baseUrl),
    mainEntity: { "@id": getPersonId(baseUrl) },
    isPartOf: { "@id": getWebsiteId(baseUrl) },
  };
}

export function buildAdvisoryServiceJsonLd(baseUrl: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${getPageUrl("/services", baseUrl)}#advisory-service`,
    name: "Data Platform Advisory",
    description:
      "Architecture review, governance design, and platform strategy advisory for enterprise data teams working with Azure, Databricks, and Microsoft Fabric.",
    provider: { "@id": getPersonId(baseUrl) },
    serviceType: "Consulting",
    areaServed: "Worldwide",
    url: getPageUrl("/services", baseUrl),
    isPartOf: { "@id": getWebsiteId(baseUrl) },
  };
}

export interface CollectionPageJsonLdInput {
  baseUrl: string;
  path: string;
  name: string;
  alternateName: string[];
  description: string;
  hasPart?: JsonLdObject[];
}

export function buildCollectionPageJsonLd(
  input: CollectionPageJsonLdInput,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${getPageUrl(input.path, input.baseUrl)}#collection`,
    name: input.name,
    alternateName: input.alternateName,
    url: getPageUrl(input.path, input.baseUrl),
    description: input.description,
    creator: { "@id": getPersonId(input.baseUrl) },
    publisher: { "@id": getPersonId(input.baseUrl) },
    isPartOf: { "@id": getWebsiteId(input.baseUrl) },
    ...(input.hasPart ? { hasPart: input.hasPart } : {}),
  };
}
