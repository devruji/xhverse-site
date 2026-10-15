import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { resolveSiteUrl } from "./src/data/seo.js";

const site = resolveSiteUrl(process.env);
const designReview = process.env.DESIGN_REVIEW === "1";

export default defineConfig({
  site,
  // Keep the existing homepage preview intact during local design comparison.
  ...(designReview ? { outDir: "./.tmp/design-review-dist" } : {}),
  // Preserve Astro 6's inline whitespace instead of Astro 7's new JSX default.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/admin/") && !page.includes("/design-review/"),
    }),
    ...(designReview ? [{
      name: "local-design-review",
      hooks: {
        "astro:config:setup": ({ injectRoute }) => {
          injectRoute({ pattern: "/design-review/motion", entrypoint: "./src/design-review/motion.astro" });
          injectRoute({ pattern: "/design-review/[direction]", entrypoint: "./src/design-review/page.astro" });
        },
      },
    }] : []),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
