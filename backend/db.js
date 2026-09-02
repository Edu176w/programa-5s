import pg from "pg";

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

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS storage (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
