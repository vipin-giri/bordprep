import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import multer from "multer";
import { pool } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Vercel serverless FS is read-only except /tmp (files are ephemeral).
export const UPLOADS_DIR = process.env.VERCEL
  ? path.join("/tmp", "uploads", "papers")
  : path.join(__dirname, "uploads", "papers");

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_TYPES = new Set([
  "board", "model", "practice", "prelims", "unit-test", "pyq", "mock-test",
]);
const ALLOWED_MEDIUMS = new Set(["english", "semi-english", "marathi"]);
const ALLOWED_STATUS = new Set(["draft", "published"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".pdf";
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const paperUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "application/pdf" ||
      (file.originalname || "").toLowerCase().endsWith(".pdf");
    if (!ok) {
      cb(new Error("Only PDF files are allowed."));
      return;
    }
    cb(null, true);
  },
});

export function toPaper(row) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    subjectId: row.subject_id || "",
    year: Number(row.year),
    type: row.type || "board",
    medium: row.medium || "english",
    marks: Number(row.marks ?? 80),
    durationMinutes: Number(row.duration_minutes ?? 180),
    status: row.status || "draft",
    goalCategory: row.goal_category || "",
    fileName: row.file_name || null,
    hasFile: Boolean(row.file_path),
    analytics: {
      views: Number(row.views ?? 0),
      downloads: Number(row.downloads ?? 0),
      bookmarks: Number(row.bookmarks ?? 0),
    },
    createdAt: row.created_at,
  };
}

function parsePaperBody(body) {
  const title = String(body?.title ?? "").trim();
  const subject = String(body?.subject ?? "").trim();
  const subjectId = String(body?.subjectId ?? "").trim();
  const year = Number(body?.year);
  const type = String(body?.type ?? "board").trim();
  const medium = String(body?.medium ?? "english").trim();
  const marks = Number(body?.marks);
  const durationMinutes = Number(body?.durationMinutes);
  const status = String(body?.status ?? "draft").trim();
  const goalCategory = String(body?.goalCategory ?? "").trim();

  if (!title) return { error: "Paper title is required." };
  if (!subject) return { error: "Subject is required." };
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { error: "Enter a valid year." };
  }
  if (!ALLOWED_TYPES.has(type)) return { error: "Invalid paper type." };
  if (!ALLOWED_MEDIUMS.has(medium)) return { error: "Invalid medium." };
  if (!ALLOWED_STATUS.has(status)) return { error: "Invalid status." };
  if (!Number.isFinite(marks) || marks < 1) return { error: "Marks must be at least 1." };
  if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
    return { error: "Duration must be at least 1 minute." };
  }

  return {
    title,
    subject,
    subjectId,
    year,
    type,
    medium,
    marks,
    durationMinutes,
    status,
    goalCategory,
  };
}

function removeFile(filePath) {
  if (!filePath) return;
  const abs = path.isAbsolute(filePath) ? filePath : path.join(UPLOADS_DIR, path.basename(filePath));
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {
    // ignore missing files
  }
}

export async function listPapers(_req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM papers ORDER BY created_at DESC");
    return res.json({ papers: rows.map(toPaper) });
  } catch (err) {
    console.error("listPapers failed:", err);
    return res.status(500).json({ error: "Could not load papers." });
  }
}

export async function createPaper(req, res) {
  try {
    const parsed = parsePaperBody(req.body);
    if (parsed.error) {
      if (req.file) removeFile(req.file.path);
      return res.status(400).json({ error: parsed.error });
    }

    const id = randomUUID();
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF file." });
    }

    await pool.query(
      `INSERT INTO papers
        (id, title, subject, subject_id, year, type, medium, marks, duration_minutes, status, goal_category, file_name, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        parsed.title,
        parsed.subject,
        parsed.subjectId || null,
        parsed.year,
        parsed.type,
        parsed.medium,
        parsed.marks,
        parsed.durationMinutes,
        parsed.status,
        parsed.goalCategory || null,
        req.file?.originalname || null,
        req.file ? path.basename(req.file.path) : null,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM papers WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json({ paper: toPaper(rows[0]) });
  } catch (err) {
    if (req.file) removeFile(req.file.path);
    console.error("createPaper failed:", err);
    return res.status(500).json({ error: "Could not save paper." });
  }
}

export async function updatePaper(req, res) {
  try {
    const id = String(req.params.id || "");
    const [existingRows] = await pool.query("SELECT * FROM papers WHERE id = ? LIMIT 1", [id]);
    if (!existingRows[0]) {
      if (req.file) removeFile(req.file.path);
      return res.status(404).json({ error: "Paper not found." });
    }

    const parsed = parsePaperBody(req.body);
    if (parsed.error) {
      if (req.file) removeFile(req.file.path);
      return res.status(400).json({ error: parsed.error });
    }

    const current = existingRows[0];
    let fileName = current.file_name;
    let filePath = current.file_path;
    if (req.file) {
      removeFile(current.file_path);
      fileName = req.file.originalname;
      filePath = path.basename(req.file.path);
    }

    await pool.query(
      `UPDATE papers
       SET title = ?, subject = ?, subject_id = ?, year = ?, type = ?, medium = ?,
           marks = ?, duration_minutes = ?, status = ?, goal_category = ?, file_name = ?, file_path = ?
       WHERE id = ?`,
      [
        parsed.title,
        parsed.subject,
        parsed.subjectId || null,
        parsed.year,
        parsed.type,
        parsed.medium,
        parsed.marks,
        parsed.durationMinutes,
        parsed.status,
        parsed.goalCategory || null,
        fileName,
        filePath,
        id,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM papers WHERE id = ? LIMIT 1", [id]);
    return res.json({ paper: toPaper(rows[0]) });
  } catch (err) {
    if (req.file) removeFile(req.file.path);
    console.error("updatePaper failed:", err);
    return res.status(500).json({ error: "Could not update paper." });
  }
}

export async function deletePaper(req, res) {
  try {
    const id = String(req.params.id || "");
    const [rows] = await pool.query("SELECT * FROM papers WHERE id = ? LIMIT 1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Paper not found." });

    removeFile(rows[0].file_path);
    await pool.query("DELETE FROM papers WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("deletePaper failed:", err);
    return res.status(500).json({ error: "Could not delete paper." });
  }
}

export async function downloadPaper(req, res) {
  try {
    const id = String(req.params.id || "");
    const [rows] = await pool.query("SELECT * FROM papers WHERE id = ? LIMIT 1", [id]);
    if (!rows[0] || !rows[0].file_path) {
      return res.status(404).json({ error: "PDF not found for this paper." });
    }

    const abs = path.join(UPLOADS_DIR, path.basename(rows[0].file_path));
    if (!fs.existsSync(abs)) {
      return res.status(404).json({ error: "PDF file is missing." });
    }

    await pool.query("UPDATE papers SET downloads = downloads + 1 WHERE id = ?", [id]);
    return res.download(abs, rows[0].file_name || "paper.pdf");
  } catch (err) {
    console.error("downloadPaper failed:", err);
    return res.status(500).json({ error: "Could not download paper." });
  }
}

export function handleUploadError(err, _req, res, next) {
  if (!err) return next();
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "PDF must be 20MB or smaller." });
  }
  if (err.message === "Only PDF files are allowed.") {
    return res.status(400).json({ error: err.message });
  }
  return next(err);
}
