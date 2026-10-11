import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { resolveSiteUrl } from "./src/data/seo.js";

const site = resolveSiteUrl(process.env);

export default defineConfig({
  site,
  // Preserve Astro 6's inline whitespace instead of Astro 7's new JSX default.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/admin/"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
