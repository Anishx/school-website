import { defineConfig } from 'vitest/config'

const databaseTestsEnabled = process.env.RUN_DATABASE_TESTS === 'true'

export default defineConfig({
  test: {
    environment: 'node',
    watch: false,
    passWithNoTests: true,
    include: [
      'tests/unit/**/*.test.ts',
      'tests/property/**/*.property.test.ts',
      ...(databaseTestsEnabled ? ['tests/integration/**/*.test.ts'] : []),
    ],
  },
})
