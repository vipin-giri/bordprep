import { randomUUID } from "crypto";
import { pool } from "./db.js";

const ALLOWED_PRIORITY = new Set(["normal", "important", "urgent"]);

function parseTargetGoals(raw) {
  if (!raw) return ["all"];
  try {
    const goals = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(goals) && goals.length ? goals.map(String) : ["all"];
  } catch {
    return ["all"];
  }
}

function formatDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function toAnnouncement(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    priority: row.priority || "normal",
    targetGoals: parseTargetGoals(row.target_goals),
    expiresAt: formatDate(row.expires_at),
    isActive: Boolean(row.is_active),
    createdAt: formatDate(row.created_at),
  };
}

function parseBody(body) {
  const title = String(body?.title ?? "").trim();
  const message = String(body?.body ?? "").trim();
  const priority = String(body?.priority ?? "normal").trim();
  const isActive = body?.isActive !== false && body?.isActive !== 0 && body?.isActive !== "false";
  const expiresAt = String(body?.expiresAt ?? "").trim();
  let targetGoals = Array.isArray(body?.targetGoals) ? body.targetGoals.map(String) : ["all"];

  if (!title) return { error: "Title is required." };
  if (!message) return { error: "Message is required." };
  if (!ALLOWED_PRIORITY.has(priority)) return { error: "Invalid priority." };

  if (targetGoals.includes("all") || targetGoals.length === 0) {
    targetGoals = ["all"];
  }

  return {
    title,
    body: message,
    priority,
    targetGoals,
    expiresAt: expiresAt || null,
    isActive,
  };
}

export async function listAnnouncements(_req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM announcements ORDER BY created_at DESC",
    );
    return res.json({ announcements: rows.map(toAnnouncement) });
  } catch (err) {
    console.error("listAnnouncements failed:", err);
    return res.status(500).json({ error: "Could not load announcements." });
  }
}

export async function listStudentAnnouncements(_req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM announcements
       WHERE is_active = 1
         AND (expires_at IS NULL OR expires_at >= CURDATE())
       ORDER BY
         FIELD(priority, 'urgent', 'important', 'normal'),
         created_at DESC`,
    );
    return res.json({ announcements: rows.map(toAnnouncement) });
  } catch (err) {
    console.error("listStudentAnnouncements failed:", err);
    return res.status(500).json({ error: "Could not load announcements." });
  }
}

export async function createAnnouncement(req, res) {
  try {
    const parsed = parseBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const id = randomUUID();
    await pool.query(
      `INSERT INTO announcements (id, title, body, priority, target_goals, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        parsed.title,
        parsed.body,
        parsed.priority,
        JSON.stringify(parsed.targetGoals),
        parsed.expiresAt,
        parsed.isActive ? 1 : 0,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM announcements WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json({ announcement: toAnnouncement(rows[0]) });
  } catch (err) {
    console.error("createAnnouncement failed:", err);
    return res.status(500).json({ error: "Could not create announcement." });
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const id = String(req.params.id || "");
    const [existing] = await pool.query("SELECT id FROM announcements WHERE id = ? LIMIT 1", [id]);
    if (!existing[0]) return res.status(404).json({ error: "Announcement not found." });

    const parsed = parseBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    await pool.query(
      `UPDATE announcements
       SET title = ?, body = ?, priority = ?, target_goals = ?, expires_at = ?, is_active = ?
       WHERE id = ?`,
      [
        parsed.title,
        parsed.body,
        parsed.priority,
        JSON.stringify(parsed.targetGoals),
        parsed.expiresAt,
        parsed.isActive ? 1 : 0,
        id,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM announcements WHERE id = ? LIMIT 1", [id]);
    return res.json({ announcement: toAnnouncement(rows[0]) });
  } catch (err) {
    console.error("updateAnnouncement failed:", err);
    return res.status(500).json({ error: "Could not update announcement." });
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const id = String(req.params.id || "");
    const [rows] = await pool.query("SELECT id FROM announcements WHERE id = ? LIMIT 1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Announcement not found." });

    await pool.query("DELETE FROM announcements WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteAnnouncement failed:", err);
    return res.status(500).json({ error: "Could not delete announcement." });
  }
}
