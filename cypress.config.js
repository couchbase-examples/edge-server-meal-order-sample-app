// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    supportFile: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
    requestTimeout: 30000,
    responseTimeout: 30000,
    env: {
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
    },
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        // Force Chrome to ignore certificate errors
        if (browser.name === 'chrome') {
          launchOptions.args.push('--ignore-certificate-errors');
          launchOptions.args.push('--disable-network-error-logging');
        }
        return launchOptions;
      });
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
})