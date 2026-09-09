import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "\n[programa-5s] ERRO: a variável de ambiente JWT_SECRET não está definida.\n" +
    "Defina uma string longa e aleatória (ex.: gere com `openssl rand -hex 32`).\n" +
    "Veja backend/.env.example.\n"
  );
  process.exit(1);
}

const TOKEN_TTL = "30d";
const IMPERSONATION_TOKEN_TTL = "2h"; // sessão de suporte expira rápido, por segurança

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(user, options) {
  options = options || {};
  return jwt.sign(
    { userId: user.id, companyId: user.company_id, role: user.role, isOwner: !!user.is_owner, isSupport: !!user.is_support, impersonating: !!options.impersonating },
    JWT_SECRET,
    { expiresIn: options.impersonating ? IMPERSONATION_TOKEN_TTL : TOKEN_TTL }
  );
}

/**
 * Middleware: exige um token válido no header "Authorization: Bearer <token>".
 * Em caso de sucesso, popula req.auth = { userId, companyId, role, isOwner, isSupport, impersonating }.
 * Toda rota de dados (storage) deve usar isso — é o que garante que uma
 * empresa nunca consiga ler/gravar dado de outra.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "missing_token" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = {
      userId: payload.userId, companyId: payload.companyId, role: payload.role,
      isOwner: !!payload.isOwner, isSupport: !!payload.isSupport, impersonating: !!payload.impersonating,
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

/**
 * Middleware adicional (usar depois de requireAuth): só deixa passar quem
 * é "dono da plataforma" — a pessoa que vende/administra o produto pra
 * várias empresas, não um admin comum de uma empresa cliente.
 */
export function requireOwner(req, res, next) {
  if (!req.auth || !req.auth.isOwner) {
    return res.status(403).json({ error: "forbidden" });
  }
  next();
}
