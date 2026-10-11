import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: [["list"], ["html"]],
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  webServer: {
    command: "bun run preview --host 127.0.0.1 --port 4321",
    // Astro 7 detaches previews when an AI agent is detected; Playwright must own this process.
    env: { ASTRO_PREVIEW_BACKGROUND: "0" },
    url: "http://127.0.0.1:4321",
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"], browserName: "chromium" } },
  ],
});
