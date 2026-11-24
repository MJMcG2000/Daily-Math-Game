/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A relative base works for both GitHub Pages (served from /<repo>/) and Vercel (served from /).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Separate long-lived vendor chunks from the (frequently updated) problem bank.
        manualChunks(id) {
          if (id.includes('node_modules/mathjs') || id.includes('node_modules/decimal.js') || id.includes('node_modules/fraction.js') || id.includes('node_modules/complex.js')) return 'mathjs';
          if (id.includes('node_modules/katex')) return 'katex';
          if (id.includes('node_modules/react')) return 'react';
          if (id.includes('/data/problems/')) return 'problems';
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
