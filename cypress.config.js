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
    // Add these configurations
    requestTimeout: 30000,
    responseTimeout: 30000,
    env: {
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
})