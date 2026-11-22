import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api calls are proxied to the Express server
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, proxy: { '/api': 'http://127.0.0.1:5001' } },
});