/* eslint-disable @typescript-eslint/no-unused-vars */
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/american234.AmericanAirlines.AA234': {
          target: env.EDGE_SERVER_BASE_URL || 'http://localhost:60000',
          secure: false,
          changeOrigin: true,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, res) => {
              console.warn('Proxy error:', err);
              // Send a mock response instead of failing
              res.writeHead(200, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({
                status: 'mock',
                message: 'Mock response due to proxy error',
                data: {} // Add mock data structure here
              }));
            });
          },
          // Add fallback data
          bypass: (req: { url?: string }, _res) => {
            if (!req?.url?.startsWith('/american234.AmericanAirlines.AA234')) {
              return req?.url;
            }
          }
        },
      },
    },
  };
});