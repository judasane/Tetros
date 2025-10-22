/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

// Common exclusion patterns for tests and coverage
const commonExcludes = [
  'src/**/*.d.ts',
  'src/test-setup.ts',
];

export default defineConfig({
  plugins: [
    angular({
      tsconfig: 'tsconfig.json',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: [...commonExcludes],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        ...commonExcludes,
        'src/**/*.spec.ts',
      ],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    reporters: ['default', 'html'],
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.json',
    },
  },
});
