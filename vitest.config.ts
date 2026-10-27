import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      // `server-only` existe para rebentar fora do servidor; nos testes, que
      // correm em node, só impediria importar os módulos que o usam.
      'server-only': fileURLToPath(new URL('./tests/stubs/vazio.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
