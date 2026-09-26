import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3107",
    channel: "chrome",
    viewport: { width: 1440, height: 1100 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3107",
    url: "http://127.0.0.1:3107",
    reuseExistingServer: true,

    timeout: 120_000,
    env: {
      FAMILY_DATA_DIR: `/var/folders/rj/x2v5yhks577gkz6xcbrwvjrr0000gn/T/opencode/pasos-test-${Date.now()}`,
      COOKIE_SECURE: "false",
    },
  },
});
