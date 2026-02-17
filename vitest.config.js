import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/experiments/**/*.test.js'],
    exclude: ['node_modules', 'tests/'],
  },
});
