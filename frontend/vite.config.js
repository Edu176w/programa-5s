import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Durante "npm run dev" o Vite roda num servidor próprio (porta 5173).
// O proxy abaixo encaminha qualquer chamada a /api para o backend Express
// rodando localmente na porta 3001, então o front nunca precisa saber
// o endereço do backend — em produção os dois vivem no mesmo servidor
// e /api já funciona direto, sem proxy nenhum.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
