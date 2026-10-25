import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "4p68u8",
  viewportWidth: 1600,
  viewportHeight: 900,
  allowCypressEnv: false,
  e2e: {
    baseUrl: "http://localhost:3004/information-system-learning-app",
    specPattern: "tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false,
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
  downloadsFolder: "tests/cypress/downloads",
  fixturesFolder: "tests/cypress/fixtures",
  screenshotsFolder: "tests/cypress/screenshots",
  videosFolder: "tests/cypress/videos",
});
