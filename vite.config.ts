import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/  |  https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Vitest stubs CSS imports to an empty string by default, which would make
    // the computed contrast checks in src/styles/contrast.test.ts silently
    // vacuous. Processing CSS keeps `?raw` imports real.
    css: true,
  },
});
