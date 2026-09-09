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

    // Se ninguém da empresa ainda tem conta (caso comum quando o dono da
    // plataforma cria a empresa e passa o código de convite pro cliente),
    // a primeira pessoa a entrar já vira admin dela automaticamente.
    const memberCountRes = await pool.query(`SELECT COUNT(*)::int AS n FROM users WHERE company_id = $1`, [companyId]);
    const role = memberCountRes.rows[0].n === 0 ? "admin" : "member";

    const passwordHash = await hashPassword(password);
    const user = await pool.query(
      `INSERT INTO users (company_id, email, password_hash, name, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, company_id, role`,
      [companyId, String(email).toLowerCase(), passwordHash, name, role]
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
    const userRes = await pool.query(`SELECT id, name, email, role, is_owner, is_support FROM users WHERE id = $1`, [req.auth.userId]);
    const userRow = userRes.rows[0];
    if (!userRow) return res.status(404).json({ error: "not_found" });
    const company = await companyPublicView(req.auth.companyId);
    // Em modo suporte, a sessão sempre tem privilégio de admin na empresa
    // visitada, independente do papel real do dono na própria empresa dele.
    const role = req.auth.impersonating ? "admin" : userRow.role;
    res.json({
      user: { id: userRow.id, name: userRow.name, email: userRow.email, role, isOwner: userRow.is_owner, isSupport: userRow.is_support },
      company,
      impersonating: !!req.auth.impersonating,
    });
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
app.get("/api/platform/companies", requireAuth, async (req, res) => {
  try {
    // Verifica direto no banco (não confia só no token) se este usuário é
    // dono OU da equipe de suporte — assim uma promoção/remoção feita no
    // banco vale na hora, mesmo que o token já emitido ainda não tenha sido
    // renovado.
    const check = await pool.query(`SELECT is_owner, is_support FROM users WHERE id = $1`, [req.auth.userId]);
    if (!check.rows[0] || (!check.rows[0].is_owner && !check.rows[0].is_support)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const result = await pool.query(`
      SELECT c.id, c.slug, c.name, c.invite_code, c.logo_url, c.primary_color, c.created_at,
        (SELECT COUNT(*)::int FROM users u WHERE u.company_id = c.id) AS user_count,
        (SELECT MAX(s.updated_at) FROM storage s WHERE s.company_id = c.id) AS last_activity_at
      FROM companies c
      ORDER BY c.created_at ASC
    `);
    res.json({ companies: result.rows, isOwner: check.rows[0].is_owner });
  } catch (e) {
    console.error("GET /api/platform/companies failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// Cria uma empresa nova SEM usuário ainda — o dono da plataforma passa o
// código de convite gerado pro cliente, que cria a própria conta (e vira
// admin automaticamente, por ser o primeiro usuário — ver /api/auth/join).
app.post("/api/platform/companies", requireAuth, async (req, res) => {
  try {
    const ownerCheck = await pool.query(`SELECT is_owner FROM users WHERE id = $1`, [req.auth.userId]);
    if (!ownerCheck.rows[0] || !ownerCheck.rows[0].is_owner) {
      return res.status(403).json({ error: "forbidden" });
    }
    const { name } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "missing_fields" });
    }
    let slug = slugify(name);
    const slugTaken = await pool.query(`SELECT id FROM companies WHERE slug = $1`, [slug]);
    if (slugTaken.rows.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const inserted = await pool.query(
      `INSERT INTO companies (slug, name, invite_code) VALUES ($1, $2, $3) RETURNING id`,
      [slug, String(name).trim(), generateInviteCode()]
    );
    res.json({ company: await companyPublicView(inserted.rows[0].id) });
  } catch (e) {
    console.error("POST /api/platform/companies failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// Exclui uma empresa (e tudo dela — usuários, dados operacionais — via
// ON DELETE CASCADE no banco). Nunca permite excluir a PRÓPRIA empresa do
// dono, pra evitar se trancar fora ou apagar a Serra Grande sem querer.
app.delete("/api/platform/companies/:id", requireAuth, async (req, res) => {
  try {
    const ownerRes = await pool.query(`SELECT id, company_id, is_owner FROM users WHERE id = $1`, [req.auth.userId]);
    const ownerRow = ownerRes.rows[0];
    if (!ownerRow || !ownerRow.is_owner) {
      return res.status(403).json({ error: "forbidden" });
    }
    const companyId = Number(req.params.id);
    if (companyId === ownerRow.company_id) {
      return res.status(400).json({ error: "cannot_delete_own_company" });
    }
    const result = await pool.query(`DELETE FROM companies WHERE id = $1 RETURNING id`, [companyId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/platform/companies/:id failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ---------------------------------------------------------------
// Donos da plataforma — "is_owner" é um atributo da CONTA, não da
// empresa, então transferir/conceder isso não move ninguém de empresa
// nem afeta o acesso dela. Só quem já é dono pode conceder ou remover
// esse atributo de outra conta (ou da própria).
// ---------------------------------------------------------------
async function assertOwner(req, res){
  const ownerCheck = await pool.query(`SELECT is_owner FROM users WHERE id = $1`, [req.auth.userId]);
  if (!ownerCheck.rows[0] || !ownerCheck.rows[0].is_owner) {
    res.status(403).json({ error: "forbidden" });
    return false;
  }
  return true;
}

app.get("/api/platform/owners", requireAuth, async (req, res) => {
  try {
    if (!(await assertOwner(req, res))) return;
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, c.name AS company_name
      FROM users u JOIN companies c ON c.id = u.company_id
      WHERE u.is_owner = true
      ORDER BY u.created_at ASC
    `);
    res.json({ owners: result.rows });
  } catch (e) {
    console.error("GET /api/platform/owners failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.post("/api/platform/owners", requireAuth, async (req, res) => {
  try {
    if (!(await assertOwner(req, res))) return;
    const { email } = req.body || {};
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "missing_fields" });
    }
    const target = await pool.query(`SELECT id FROM users WHERE email = $1`, [String(email).toLowerCase().trim()]);
    if (target.rows.length === 0) {
      return res.status(404).json({ error: "user_not_found" });
    }
    await pool.query(`UPDATE users SET is_owner = true WHERE id = $1`, [target.rows[0].id]);
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/platform/owners failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.delete("/api/platform/owners/:userId", requireAuth, async (req, res) => {
  try {
    if (!(await assertOwner(req, res))) return;
    await pool.query(`UPDATE users SET is_owner = false WHERE id = $1`, [req.params.userId]);
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/platform/owners/:userId failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ---------------------------------------------------------------
// Equipe de suporte — funcionários que conseguem entrar em modo suporte
// em qualquer empresa (ajudar/orientar/ajustar), mas SEM os poderes
// exclusivos do dono (criar/excluir empresa, conceder acesso de dono).
// Só o dono pode conceder ou remover esse acesso.
// ---------------------------------------------------------------
app.get("/api/platform/support", requireAuth, async (req, res) => {
  try {
    if (!(await assertOwner(req, res))) return;
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, c.name AS company_name
      FROM users u JOIN companies c ON c.id = u.company_id
      WHERE u.is_support = true
      ORDER BY u.created_at ASC
    `);
    res.json({ support: result.rows });
  } catch (e) {
    console.error("GET /api/platform/support failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.post("/api/platform/support", requireAuth, async (req, res) => {
  try {
    if (!(await assertOwner(req, res))) return;
    const { email } = req.body || {};
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "missing_fields" });
    }
    const target = await pool.query(`SELECT id FROM users WHERE email = $1`, [String(email).toLowerCase().trim()]);
    if (target.rows.length === 0) {
      return res.status(404).json({ error: "user_not_found" });
    }
    await pool.query(`UPDATE users SET is_support = true WHERE id = $1`, [target.rows[0].id]);
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/platform/support failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

app.delete("/api/platform/support/:userId", requireAuth, async (req, res) => {
  try {
    if (!(await assertOwner(req, res))) return;
    await pool.query(`UPDATE users SET is_support = false WHERE id = $1`, [req.params.userId]);
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/platform/support/:userId failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// Modo suporte: emite um token temporário (2h) com acesso de admin à
// empresa escolhida, pro dono da plataforma poder ajudar um cliente. Fica
// registrado em support_access_log — não é mostrado à empresa, mas existe
// pra auditoria caso precise justificar um acesso.
app.post("/api/platform/companies/:id/impersonate", requireAuth, async (req, res) => {
  try {
    const actorRes = await pool.query(`SELECT id, company_id, is_owner, is_support FROM users WHERE id = $1`, [req.auth.userId]);
    const actorRow = actorRes.rows[0];
    if (!actorRow || (!actorRow.is_owner && !actorRow.is_support)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const companyId = Number(req.params.id);
    const companyRow = await pool.query(`SELECT id FROM companies WHERE id = $1`, [companyId]);
    if (companyRow.rows.length === 0) {
      return res.status(404).json({ error: "not_found" });
    }

    await pool.query(
      `INSERT INTO support_access_log (owner_user_id, company_id) VALUES ($1, $2)`,
      [actorRow.id, companyId]
    );

    const token = signToken(
      { id: actorRow.id, company_id: companyId, role: "admin", is_owner: actorRow.is_owner, is_support: actorRow.is_support },
      { impersonating: true }
    );
    res.json({ token, company: await companyPublicView(companyId) });
  } catch (e) {
    console.error("POST /api/platform/companies/:id/impersonate failed:", e);
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
