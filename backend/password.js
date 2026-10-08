import { createHmac } from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

function getPepper() {
  const pepper = process.env.PASSWORD_PEPPER;
  if (!pepper) {
    throw new Error("PASSWORD_PEPPER is not set. Add it to .env.");
  }
  return pepper;
}

/** Mix the server-only pepper into the password before bcrypt. */
function withPepper(password) {
  return createHmac("sha256", getPepper()).update(password, "utf8").digest("hex");
}

/** bcrypt generates a unique salt for every hash; pepper never leaves the server. */
export async function hashPassword(password) {
  return bcrypt.hash(withPepper(password), BCRYPT_ROUNDS);
}

export async function verifyPassword(password, storedHash) {
  const pepperedOk = await bcrypt.compare(withPepper(password), storedHash);
  if (pepperedOk) return { ok: true, upgrade: false };

  // Older accounts were hashed with bcrypt salt only (no pepper).
  const legacyOk = await bcrypt.compare(password, storedHash);
  if (legacyOk) return { ok: true, upgrade: true };

  return { ok: false, upgrade: false };
}
