import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { pool, initDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Limite generoso: cada "coleção" é um blob JSON único (áreas, plano
// mestre, etc.) que pode incluir fotos em base64 anexadas aos itens do
// plano de ação. 20mb cobre uma quantidade razoável de fotos comprimidas.
app.use(express.json({ limit: "20mb" }));
app.use(cors());

// ---------------------------------------------------------------
// API — mesma forma da interface window.storage que o app usava
// dentro do Claude: GET devolve {key, value} ou 404; PUT grava e
// devolve {key, value}. Sempre "compartilhado" (não existe conceito
// de usuário/login nesta versão autônoma).
// ---------------------------------------------------------------
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

app.get("/api/storage/:key", async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM storage WHERE key = $1", [req.params.key]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "not_found", key: req.params.key });
    }
    res.json({ key: req.params.key, value: result.rows[0].value });
  } catch (e) {
    console.error("GET /api/storage/:key failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.put("/api/storage/:key", async (req, res) => {
  try {
    const value = req.body ? req.body.value : undefined;
    if (value === undefined) {
      return res.status(400).json({ error: "missing_value" });
    }
    // IMPORTANTE: convertemos o valor para uma string JSON (JSON.stringify)
    // e forçamos o cast ::jsonb na query. Sem isso, quando "value" é um
    // array (ex.: lista do Comitê, Áreas, Cronograma), a lib "pg" o
    // converte para o formato de array nativo do Postgres em vez de JSON,
    // o que quebra a coluna JSONB e gera erro 500 — fazendo a gravação
    // falhar silenciosamente e as alterações "voltarem" após recarregar.
    await pool.query(
      `INSERT INTO storage (key, value, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [req.params.key, JSON.stringify(value)]
    );
    res.json({ key: req.params.key, value });
  } catch (e) {
    console.error("PUT /api/storage/:key failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.delete("/api/storage/:key", async (req, res) => {
  try {
    await pool.query("DELETE FROM storage WHERE key = $1", [req.params.key]);
    res.json({ key: req.params.key, deleted: true });
  } catch (e) {
    console.error("DELETE /api/storage/:key failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ---------------------------------------------------------------
// Frontend estático (build do Vite) — serve tudo que não for /api/*.
// Em desenvolvimento o frontend roda separado (vite dev + proxy), então
// isso só entra em ação quando frontend/dist realmente existe (produção).
// ---------------------------------------------------------------
const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send(
      "Backend do Programa 5S rodando. O build do frontend (frontend/dist) ainda não existe — " +
      "rode 'npm run build' na pasta frontend, ou use 'npm run dev' no frontend durante o desenvolvimento."
    );
  });
}

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[programa-5s] servidor rodando na porta ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("[programa-5s] falha ao inicializar o banco de dados:", e);
    process.exit(1);
  });