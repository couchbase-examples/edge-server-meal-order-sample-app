import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load all env variables from .env files
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/american234.AmericanAirlines.AA234': {
          target: env.EDGE_SERVER_BASE_URL, // use the loaded env here
          secure: false,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});