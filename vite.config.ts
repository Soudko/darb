import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The screens live in client/. In development, /api calls go to the server on port 3101.
export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    proxy: { '/api': 'http://127.0.0.1:3101' },
  },
});
