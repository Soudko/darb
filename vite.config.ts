import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The screens live in client/. In development, /api calls go to the server on port 3101.
export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
  server: { host: 'localhost', port: 5173, proxy: { '/api': 'http://localhost:3101' } },
});
