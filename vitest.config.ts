import { defineConfig } from 'vitest/config';

// Tests du code pur (src/lib) : environnement Node, pas de navigateur.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
