import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Foco na superfície da API: rotas + a lógica de domínio/HTTP que elas usam.
      // (lib/utils.ts é helper de UI, fora do escopo destes testes.)
      include: ["app/api/**/*.ts", "lib/store.ts", "lib/http.ts"],
      reporter: ["text", "html"],
      thresholds: {
        // Piso global. Fica abaixo de 90 por causa do código (morto) de
        // localStorage no store.ts, que nunca executa no servidor.
        statements: 85,
        branches: 78,
        functions: 90,
        lines: 85,
        // A superfície da API em si deve ficar perto de 100%.
        "app/api/**/*.ts": {
          statements: 95,
          branches: 85,
          functions: 95,
          lines: 95,
        },
      },
    },
  },
})
