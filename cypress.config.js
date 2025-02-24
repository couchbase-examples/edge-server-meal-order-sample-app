import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    // Additional configuration options
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Disable video recording for faster tests
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    supportFile: false,
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  // Component testing configuration if needed
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
})