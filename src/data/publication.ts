import type { BlogPost } from "./blog";
import { profile } from "./profile";
import { site } from "./site";
import { toolCatalog } from "./tools";

/** Receives only the collection resolved by the existing build-time loader. */
export function createPublicationSnapshot(publishedPosts: readonly BlogPost[]) {
  const latest = [...publishedPosts].sort((a, b) => b.date.localeCompare(a.date));
  const articles = latest.filter(
    (post, index, all) => all.findIndex((item) => item.slug === post.slug) === index,
  ).slice(0, 3);
  return {
    name: profile.fullName,
    title: profile.title,
    intro: "I lead enterprise data platform delivery across Azure, Databricks, and Microsoft Fabric, with a focus on lakehouse architecture, reporting migration, and governance.",
    portrait: profile.avatar,
    alias: "XH / bossruji",
    experience: {
      company: "Central Pattana",
      period: "Oct 2024–Present",
      role: "Senior Data Engineer",
      description: "I lead platform delivery, reporting migration, and governance standards, alongside managing engineers and coordinating vendors.",
      platforms: ["Azure", "Databricks", "Microsoft Fabric", "Spark", "Power BI"],
    },
    tools: [
      {
        slug: "scd-design-lab", title: "SCD Design Lab",
        purpose: "See how dimension changes affect historical reporting.",
        example: {
          label: "Example · Loyalty tier change · Type 2 history",
          lines: ["C001: Bronze → Gold on 1 March 2026", "Bronze revenue: 1,000", "Gold revenue: 1,500", "Revenue stays with the tier at transaction time."],
        },
      },
      {
        slug: "pipeline-recovery-planner", title: "Pipeline Recovery Planner",
        purpose: "Review replay, checkpoint state, and recovery evidence before an incident.",
        example: {
          label: "Example runbook brief · Illustrative assessment",
          lines: ["54/100 · Needs design work", "Document checkpoint and state locations before production release.", "Add idempotency checks for common replay paths."],
        },
      },
    ],
    additionalTools: [
      { slug: "workload-placement-simulator", title: "Workload Placement Simulator" },
      { slug: "access-model-simulator", title: "Access Model Simulator" },
    ],
    discoveryTools: toolCatalog,
    articles,
    email: site.email,
    linkedin: site.linkedin,
    contactContext: "For architecture, governance, or reporting challenges, send me a note.",
  };
}
export type PublicationSnapshot = ReturnType<typeof createPublicationSnapshot>;
