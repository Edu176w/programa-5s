import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { pool, initDb, generateInviteCode } from "./db.js";
import { hashPassword, verifyPassword, signToken, requireAuth, requireOwner } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Limite generoso: cada "coleção" é um blob JSON único (áreas, plano
// mestre, etc.) que pode incluir fotos em base64 anexadas aos itens do
// plano de ação, e agora também o logo da empresa em base64. 20mb cobre
// uma quantidade razoável de fotos comprimidas.
app.use(express.json({ limit: "20mb" }));
app.use(cors());

function slugify(name) {
  return String(name)
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "empresa";
}

async function companyPublicView(companyId) {
  const r = await pool.query(
    `SELECT id, slug, name, logo_url, primary_color, invite_code FROM companies WHERE id = $1`,
    [companyId]
  );
  return r.rows[0] || null;
}

// ---------------------------------------------------------------
// Autenticação e empresas
// ---------------------------------------------------------------
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// Cria uma nova empresa (cliente) + o primeiro usuário, que vira admin dela.
app.post("/api/auth/register-company", async (req, res) => {
  try {
    const { companyName, name, email, password } = req.body || {};
    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ error: "missing_fields" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "weak_password" });
    }
    const existingUser = await pool.query(`SELECT id FROM users WHERE email = $1`, [String(email).toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "email_in_use" });
    }

    let slug = slugify(companyName);
    const slugTaken = await pool.query(`SELECT id FROM companies WHERE slug = $1`, [slug]);
    if (slugTaken.rows.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const company = await pool.query(
      `INSERT INTO companies (slug, name, invite_code) VALUES ($1, $2, $3) RETURNING id`,
      [slug, companyName, generateInviteCode()]
    );
    const companyId = company.rows[0].id;

    const passwordHash = await hashPassword(password);
    const user = await pool.query(
      `INSERT INTO users (company_id, email, password_hash, name, role) VALUES ($1,$2,$3,$4,'admin') RETURNING id, company_id, role`,
      [companyId, String(email).toLowerCase(), passwordHash, name]
    );

    const token = signToken(user.rows[0]);
    res.json({ token, company: await companyPublicView(companyId) });
  } catch (e) {
    console.error("POST /api/auth/register-company failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// Entra numa empresa já existente usando o código de convite dela.
app.post("/api/auth/join", async (req, res) => {
  try {
    const { inviteCode, name, email, password } = req.body || {};
    if (!inviteCode || !name || !email || !password) {
      return res.status(400).json({ error: "missing_fields" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "weak_password" });
    }
    const companyRes = await pool.query(`SELECT id FROM companies WHERE invite_code = $1`, [String(inviteCode).toUpperCase()]);
    if (companyRes.rows.length === 0) {
      return res.status(404).json({ error: "invalid_invite_code" });
    }
    const companyId = companyRes.rows[0].id;

    const existingUser = await pool.query(`SELECT id FROM users WHERE email = $1`, [String(email).toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "email_in_use" });
    }

    const passwordHash = await hashPassword(password);
    const user = await pool.query(
      `INSERT INTO users (company_id, email, password_hash, name, role) VALUES ($1,$2,$3,$4,'member') RETURNING id, company_id, role`,
      [companyId, String(email).toLowerCase(), passwordHash, name]
    );

    const token = signToken(user.rows[0]);
    res.json({ token, company: await companyPublicView(companyId) });
  } catch (e) {
    console.error("POST /api/auth/join failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "missing_fields" });

    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [String(email).toLowerCase()]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    const token = signToken(user);
    res.json({ token, company: await companyPublicView(user.company_id) });
  } catch (e) {
    console.error("POST /api/auth/login failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const userRes = await pool.query(`SELECT id, name, email, role, is_owner FROM users WHERE id = $1`, [req.auth.userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: "not_found" });
    const company = await companyPublicView(req.auth.companyId);
    res.json({ user: { id:user.id, name:user.name, email:user.email, role:user.role, isOwner: user.is_owner }, company });
  } catch (e) {
    console.error("GET /api/auth/me failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ---------------------------------------------------------------
// Painel do dono da plataforma — visão de todas as empresas
// cadastradas (quem vende o produto, não um admin de uma empresa
// cliente). Nunca expõe dados operacionais de nenhuma empresa, só
// metadados de cadastro (nome, quantos usuários, quando foi criada).
// ---------------------------------------------------------------
app.get("/api/platform/companies", requireAuth, requireOwner, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.slug, c.name, c.invite_code, c.logo_url, c.primary_color, c.created_at,
        (SELECT COUNT(*) FROM users u WHERE u.company_id = c.id) AS user_count,
        (SELECT MAX(s.updated_at) FROM storage s WHERE s.company_id = c.id) AS last_activity_at
      FROM companies c
      ORDER BY c.created_at ASC
    `);
    res.json({ companies: result.rows });
  } catch (e) {
    console.error("GET /api/platform/companies failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// Atualiza a identidade visual da empresa (nome, logo, cor). Só admin.
app.put("/api/company", requireAuth, async (req, res) => {
  try {
    if (req.auth.role !== "admin") return res.status(403).json({ error: "forbidden" });
    const { name, logoUrl, primaryColor } = req.body || {};
    const result = await pool.query(
      `UPDATE companies SET
         name = COALESCE($2, name),
         logo_url = COALESCE($3, logo_url),
         primary_color = COALESCE($4, primary_color)
       WHERE id = $1
       RETURNING id`,
      [req.auth.companyId, name ?? null, logoUrl ?? null, primaryColor ?? null]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "not_found" });
    res.json({ company: await companyPublicView(req.auth.companyId) });
  } catch (e) {
    console.error("PUT /api/company failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ---------------------------------------------------------------
// Armazenamento de dados — sempre isolado por empresa (req.auth.companyId).
// GET devolve {key, value} ou 404; PUT grava e devolve {key, value}.
// ---------------------------------------------------------------
app.get("/api/storage/:key", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT value FROM storage WHERE company_id = $1 AND key = $2",
      [req.auth.companyId, req.params.key]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "not_found", key: req.params.key });
    }
    res.json({ key: req.params.key, value: result.rows[0].value });
  } catch (e) {
    console.error("GET /api/storage/:key failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.put("/api/storage/:key", requireAuth, async (req, res) => {
  try {
    const value = req.body ? req.body.value : undefined;
    if (value === undefined) {
      return res.status(400).json({ error: "missing_value" });
    }
    // O valor é serializado explicitamente (JSON.stringify) e a query usa
    // cast ::jsonb: sem isso, quando "value" é um array, a lib "pg" o
    // converte para o formato de array nativo do Postgres em vez de JSON,
    // o que quebra a coluna JSONB.
    await pool.query(
      `INSERT INTO storage (company_id, key, value, updated_at) VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [req.auth.companyId, req.params.key, JSON.stringify(value)]
    );
    res.json({ key: req.params.key, value });
  } catch (e) {
    console.error("PUT /api/storage/:key failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.delete("/api/storage/:key", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM storage WHERE company_id = $1 AND key = $2",
      [req.auth.companyId, req.params.key]
    );
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
