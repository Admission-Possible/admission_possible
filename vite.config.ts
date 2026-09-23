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
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      // Source only: config, entrypoints and type-only files would otherwise
      // dilute the numbers the thresholds are meant to protect.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts', 'src/types.ts'],
      // Ratchet upward as coverage improves; these are a floor, not a target.
      thresholds: { statements: 85, branches: 82, functions: 85, lines: 88 },
    },
  },
});
