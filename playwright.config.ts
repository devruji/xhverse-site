import { defineConfig, devices } from "@playwright/test";

// The comparison build must not take over the existing homepage preview.
const port = process.env.DESIGN_REVIEW === "1" ? 4323 : 4321;

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: [["list"], ["html"]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `bun run preview --host 127.0.0.1 --port ${port}${process.env.DESIGN_REVIEW === "1" ? " --ignore-lock" : ""}`,
    // Astro 7 detaches previews when an AI agent is detected; Playwright must own this process.
    env: { ASTRO_PREVIEW_BACKGROUND: "0" },
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"], browserName: "chromium" } },
  ],
});
