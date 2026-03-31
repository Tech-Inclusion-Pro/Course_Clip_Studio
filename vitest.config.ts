import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/renderer/__tests__/**/*.test.ts', 'src/renderer/__tests__/**/*.test.tsx']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer')
    }
  }
})
