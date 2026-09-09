import pg from "pg";
import crypto from "node:crypto";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "\n[programa-5s] ERRO: a variável de ambiente DATABASE_URL não está definida.\n" +
    "Configure-a com a connection string do seu banco Postgres antes de iniciar o servidor.\n" +
    "Veja backend/.env.example.\n"
  );
  process.exit(1);
}

const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

export const pool = new Pool({
  connectionString,
  // Bancos gerenciados (Render, Supabase, etc.) normalmente exigem SSL,
  // mas usam certificados que a lib "pg" não valida por padrão como
  // autoridade raiz conhecida — por isso relaxamos a verificação em vez
  // de desligar o SSL. Em Postgres local isso não é necessário.
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

export function generateInviteCode() {
  // Código curto e fácil de ditar/digitar (sem caracteres ambíguos como 0/O, 1/I).
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[crypto.randomInt(alphabet.length)];
  return out;
}

/**
 * initDb cria as tabelas na primeira vez (deploy novo) e, se o banco já
 * tinha dados do formato antigo (versão de empresa única, sem login),
 * migra automaticamente:
 *   1. cria uma empresa "Usina Serra Grande" (ou usa a primeira já existente),
 *   2. move todas as linhas antigas de "storage" (sem company_id) pra essa empresa,
 *   3. transforma a chave primária de "key" para (company_id, key).
 * Isso deixa o app pronto pra várias empresas sem precisar mexer no banco
 * manualmente, mesmo em bancos que já estavam em produção.
 */
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      primary_color TEXT NOT NULL DEFAULT '#5D7A34',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      is_owner BOOLEAN NOT NULL DEFAULT false,
      is_support BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Migração: se a tabela "users" já existia de uma versão anterior sem
  // "is_owner" (dono da plataforma, que enxerga todas as empresas).
  const ownerCol = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_owner'
  `);
  if (ownerCol.rows.length === 0) {
    await pool.query(`ALTER TABLE users ADD COLUMN is_owner BOOLEAN NOT NULL DEFAULT false;`);
  }
  // Migração: "is_support" — funcionário de suporte, que consegue entrar em
  // modo suporte em qualquer empresa (ajudar/ajustar), mas sem os poderes
  // exclusivos do dono (criar/excluir empresa, conceder acesso de dono).
  const supportCol = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_support'
  `);
  if (supportCol.rows.length === 0) {
    await pool.query(`ALTER TABLE users ADD COLUMN is_support BOOLEAN NOT NULL DEFAULT false;`);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS storage (
      company_id INTEGER,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // --- migração: adiciona company_id se a tabela já existia sem ele ---
  const col = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'storage' AND column_name = 'company_id'
  `);
  if (col.rows.length === 0) {
    await pool.query(`ALTER TABLE storage ADD COLUMN company_id INTEGER;`);
  }

  const hasOrphanRows = await pool.query(`SELECT 1 FROM storage WHERE company_id IS NULL LIMIT 1;`);
  if (hasOrphanRows.rows.length > 0) {
    let defaultCompanyId;
    const existing = await pool.query(`SELECT id FROM companies ORDER BY id ASC LIMIT 1;`);
    if (existing.rows.length > 0) {
      defaultCompanyId = existing.rows[0].id;
    } else {
      const inserted = await pool.query(
        `INSERT INTO companies (slug, name, invite_code, primary_color) VALUES ($1,$2,$3,$4) RETURNING id`,
        ["usina-serra-grande", "Usina Serra Grande", generateInviteCode(), "#5D7A34"]
      );
      defaultCompanyId = inserted.rows[0].id;
      console.log(`[programa-5s] Empresa padrão "Usina Serra Grande" criada (id ${defaultCompanyId}) para migrar dados existentes.`);
    }
    await pool.query(`UPDATE storage SET company_id = $1 WHERE company_id IS NULL;`, [defaultCompanyId]);
  }

  await pool.query(`ALTER TABLE storage ALTER COLUMN company_id SET NOT NULL;`);
  await pool.query(`ALTER TABLE storage DROP CONSTRAINT IF EXISTS storage_pkey;`);
  await pool.query(`ALTER TABLE storage ADD CONSTRAINT storage_pkey PRIMARY KEY (company_id, key);`);
  await pool.query(`ALTER TABLE storage DROP CONSTRAINT IF EXISTS storage_company_id_fkey;`);
  await pool.query(`
    ALTER TABLE storage ADD CONSTRAINT storage_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  `);

  // Registro (auditoria) de toda vez que o dono da plataforma entra em modo
  // suporte nos dados de alguma empresa — não é mostrado à empresa, mas
  // fica guardado caso um dia seja preciso justificar um acesso.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_access_log (
      id SERIAL PRIMARY KEY,
      owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
