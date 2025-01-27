import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/american234.AmericanAirlines.AA234': {
        target: 'https://localhost:60000',
        secure: false, // Bypass SSL certificate validation
        changeOrigin: true,
        ws: true,
      },
    },
  },
});