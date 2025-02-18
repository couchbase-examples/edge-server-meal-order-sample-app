export default {
  testEnvironment: "jsdom",
  setupFiles: ['./jest.setup.ts'],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.app.json",
        useESM: true,
        isolatedModules: true
      }
    ]
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^.+\\.svg$": "jest-transformer-svg"
  },
  setupFiles: ["<rootDir>/jest.setup.polyfills.ts"],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  moduleDirectories: ["node_modules", "src"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"]
};