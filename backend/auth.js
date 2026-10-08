import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { pool, toPublicUser } from "./db.js";
import { hashPassword, verifyPassword } from "./password.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX = 80;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;
const SPECIAL_RE = /[^A-Za-z0-9]/;

function validateEmail(email) {
  if (!email) return "Email is required.";
  if (email.length > EMAIL_MAX) return "Email must be at most 80 characters.";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
  return "";
}

function validatePassword(password) {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return "Password must be 8–16 characters.";
  }
  if (!/[a-z]/.test(password)) return "Password must include 1 lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must include 1 uppercase letter.";
  if (!SPECIAL_RE.test(password)) return "Password must include 1 special character.";
  return "";
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: Boolean(user.is_admin ?? user.isAdmin) },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );
}

function authPayload(user) {
  return { token: signToken(user), user: toPublicUser(user) };
}

export async function register(req, res) {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    const isAdmin = email === String(process.env.ADMIN_EMAIL ?? "").toLowerCase() ? 1 : 0;

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, is_admin, goals)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, email, passwordHash, isAdmin, JSON.stringify([])],
    );

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json(authPayload(rows[0]));
  } catch (err) {
    console.error("register failed:", err);
    return res.status(500).json({ error: "Could not create account. Please try again." });
  }
}

export async function login(req, res) {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const { ok, upgrade } = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        error: "Your account is blocked. Please contact the admin.",
        blocked: true,
      });
    }

    if (upgrade) {
      const nextHash = await hashPassword(password);
      await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [nextHash, user.id]);
    }

    return res.json(authPayload(user));
  } catch (err) {
    console.error("login failed:", err);
    return res.status(500).json({ error: "Could not log in. Please try again." });
  }
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "Sign in to continue." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      "SELECT id, email, is_admin, is_blocked FROM users WHERE id = ? LIMIT 1",
      [payload.id],
    );
    if (!rows[0]) {
      return res.status(401).json({ error: "Account not found." });
    }
    if (rows[0].is_blocked) {
      return res.status(403).json({
        error: "Your account is blocked. Please contact the admin.",
        blocked: true,
      });
    }
    req.auth = {
      id: rows[0].id,
      email: rows[0].email,
      isAdmin: Boolean(rows[0].is_admin),
    };
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

export async function me(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.auth.id]);
    if (!rows[0]) {
      return res.status(401).json({ error: "Account not found." });
    }
    return res.json({ user: toPublicUser(rows[0]) });
  } catch (err) {
    console.error("me failed:", err);
    return res.status(500).json({ error: "Could not load profile." });
  }
}

export async function updateMe(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.auth.id]);
    if (!rows[0]) {
      return res.status(401).json({ error: "Account not found." });
    }

    const current = rows[0];
    const name = req.body?.name != null ? String(req.body.name).trim() : current.name;
    const phone = req.body?.phone != null ? String(req.body.phone).trim() : current.phone;
    const medium = req.body?.medium != null ? String(req.body.medium) : current.medium;
    const streak = req.body?.streak != null ? Number(req.body.streak) : current.streak;
    const currentGoalId = req.body?.currentGoalId != null ? String(req.body.currentGoalId) : current.current_goal_id;
    const goals = req.body?.goals != null ? req.body.goals : current.goals;

    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }

    await pool.query(
      `UPDATE users
       SET name = ?, phone = ?, medium = ?, streak = ?, current_goal_id = ?, goals = ?
       WHERE id = ?`,
      [name, phone || null, medium, Number.isFinite(streak) ? streak : 0, currentGoalId || "", JSON.stringify(goals ?? []), current.id],
    );

    const [updated] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [current.id]);
    return res.json({ user: toPublicUser(updated[0]) });
  } catch (err) {
    console.error("updateMe failed:", err);
    return res.status(500).json({ error: "Could not update profile." });
  }
}

export async function seedAdmin() {
  const email = String(process.env.ADMIN_EMAIL ?? "admin@pariksha.in").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD ?? "admin123");
  const [rows] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if (rows.length > 0) return;

  const id = randomUUID();
  const passwordHash = await hashPassword(password);
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, is_admin, goals)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [id, "System Admin", email, passwordHash, JSON.stringify([])],
  );
  console.log(`Seeded admin account: ${email}`);
}
