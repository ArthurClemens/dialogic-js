import { defineConfig } from 'cypress';

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    specPattern: 'cypress/e2e/*.cy.ts',
    video: false,
  },
});
