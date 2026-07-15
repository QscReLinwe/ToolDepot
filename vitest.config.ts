import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tools/*/core/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['tools/*/core/**/*.ts'],
      exclude: ['**/*.test.ts'],
    },
  },
});
