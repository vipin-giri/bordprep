import { randomUUID } from "crypto";
import { pool } from "./db.js";

function toChapter(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    chapterNumber: Number(row.chapter_number ?? 1),
  };
}

async function subjectCounts(subjectId) {
  const [[papers]] = await pool.query(
    "SELECT COUNT(*) AS count FROM papers WHERE subject_id = ?",
    [subjectId],
  );
  const [[quizzes]] = await pool.query(
    "SELECT COUNT(*) AS count FROM quizzes WHERE subject_id = ?",
    [subjectId],
  );
  const [[chapters]] = await pool.query(
    "SELECT COUNT(*) AS count FROM chapters WHERE subject_id = ?",
    [subjectId],
  );
  return {
    totalPapers: Number(papers?.count ?? 0),
    totalQuizzes: Number(quizzes?.count ?? 0),
    totalChapters: Number(chapters?.count ?? 0),
  };
}

async function toSubject(row, { includeChapters = false } = {}) {
  const counts = await subjectCounts(row.id);
  const subject = {
    id: row.id,
    name: row.name,
    goalCategory: row.goal_category,
    icon: row.icon || "book",
    color: row.color || "#1E3A8A",
    totalPapers: counts.totalPapers,
    totalQuizzes: counts.totalQuizzes,
    totalChapters: counts.totalChapters,
    createdAt: row.created_at,
  };

  if (includeChapters) {
    const [chapterRows] = await pool.query(
      "SELECT * FROM chapters WHERE subject_id = ? ORDER BY chapter_number ASC",
      [row.id],
    );
    subject.chapters = chapterRows.map(toChapter);
  }

  return subject;
}

function parseSubjectBody(body) {
  const name = String(body?.name ?? "").trim();
  const goalCategory = String(body?.goalCategory ?? "").trim();
  const icon = String(body?.icon ?? "book").trim();
  const color = String(body?.color ?? "#1E3A8A").trim();

  if (!name) return { error: "Subject name is required." };
  if (!goalCategory) return { error: "Exam goal is required." };

  return { name, goalCategory, icon, color };
}

function parseChapterBody(body) {
  const name = String(body?.name ?? "").trim();
  const chapterNumber = Number(body?.chapterNumber ?? 1);
  if (!name) return { error: "Chapter name is required." };
  if (!Number.isFinite(chapterNumber) || chapterNumber < 1) {
    return { error: "Chapter number must be at least 1." };
  }
  return { name, chapterNumber };
}

export async function listSubjects(_req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM subjects ORDER BY name ASC");
    const subjects = await Promise.all(rows.map((row) => toSubject(row, { includeChapters: true })));
    return res.json({ subjects });
  } catch (err) {
    console.error("listSubjects failed:", err);
    return res.status(500).json({ error: "Could not load subjects." });
  }
}

export async function createSubject(req, res) {
  try {
    const parsed = parseSubjectBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const id = randomUUID();
    await pool.query(
      `INSERT INTO subjects (id, name, goal_category, icon, color)
       VALUES (?, ?, ?, ?, ?)`,
      [id, parsed.name, parsed.goalCategory, parsed.icon, parsed.color],
    );

    const [rows] = await pool.query("SELECT * FROM subjects WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json({ subject: await toSubject(rows[0], { includeChapters: true }) });
  } catch (err) {
    console.error("createSubject failed:", err);
    return res.status(500).json({ error: "Could not create subject." });
  }
}

export async function updateSubject(req, res) {
  try {
    const id = String(req.params.id || "");
    const [existing] = await pool.query("SELECT id FROM subjects WHERE id = ? LIMIT 1", [id]);
    if (!existing[0]) return res.status(404).json({ error: "Subject not found." });

    const parsed = parseSubjectBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    await pool.query(
      `UPDATE subjects SET name = ?, goal_category = ?, icon = ?, color = ? WHERE id = ?`,
      [parsed.name, parsed.goalCategory, parsed.icon, parsed.color, id],
    );

    const [rows] = await pool.query("SELECT * FROM subjects WHERE id = ? LIMIT 1", [id]);
    return res.json({ subject: await toSubject(rows[0], { includeChapters: true }) });
  } catch (err) {
    console.error("updateSubject failed:", err);
    return res.status(500).json({ error: "Could not update subject." });
  }
}

export async function deleteSubject(req, res) {
  try {
    const id = String(req.params.id || "");
    const [rows] = await pool.query("SELECT id FROM subjects WHERE id = ? LIMIT 1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Subject not found." });

    const counts = await subjectCounts(id);
    if (counts.totalPapers > 0 || counts.totalQuizzes > 0) {
      return res.status(409).json({ error: "Remove papers and quizzes using this subject before deleting." });
    }

    await pool.query("DELETE FROM chapters WHERE subject_id = ?", [id]);
    await pool.query("DELETE FROM subjects WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteSubject failed:", err);
    return res.status(500).json({ error: "Could not delete subject." });
  }
}

export async function createChapter(req, res) {
  try {
    const subjectId = String(req.params.subjectId || "");
    const [subjectRows] = await pool.query("SELECT id FROM subjects WHERE id = ? LIMIT 1", [subjectId]);
    if (!subjectRows[0]) return res.status(404).json({ error: "Subject not found." });

    const parsed = parseChapterBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const id = randomUUID();
    await pool.query(
      `INSERT INTO chapters (id, subject_id, name, chapter_number)
       VALUES (?, ?, ?, ?)`,
      [id, subjectId, parsed.name, parsed.chapterNumber],
    );

    const [rows] = await pool.query("SELECT * FROM chapters WHERE id = ? LIMIT 1", [id]);
    return res.status(201).json({ chapter: toChapter(rows[0]) });
  } catch (err) {
    console.error("createChapter failed:", err);
    return res.status(500).json({ error: "Could not create chapter." });
  }
}

export async function updateChapter(req, res) {
  try {
    const id = String(req.params.id || "");
    const [existing] = await pool.query("SELECT * FROM chapters WHERE id = ? LIMIT 1", [id]);
    if (!existing[0]) return res.status(404).json({ error: "Chapter not found." });

    const parsed = parseChapterBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    await pool.query(
      `UPDATE chapters SET name = ?, chapter_number = ? WHERE id = ?`,
      [parsed.name, parsed.chapterNumber, id],
    );

    const [rows] = await pool.query("SELECT * FROM chapters WHERE id = ? LIMIT 1", [id]);
    return res.json({ chapter: toChapter(rows[0]) });
  } catch (err) {
    console.error("updateChapter failed:", err);
    return res.status(500).json({ error: "Could not update chapter." });
  }
}

export async function deleteChapter(req, res) {
  try {
    const id = String(req.params.id || "");
    const [rows] = await pool.query("SELECT id FROM chapters WHERE id = ? LIMIT 1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Chapter not found." });

    await pool.query("DELETE FROM chapters WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteChapter failed:", err);
    return res.status(500).json({ error: "Could not delete chapter." });
  }
}

const GOAL_IDS = new Set([
  "board-8", "board-9", "board-10", "board-11", "board-12",
  "neet", "jee-mains", "jee-advanced", "mht-cet-pcb", "mht-cet-pcm",
]);

const GOAL_ALIASES = {
  "ssc": "board-10",
  "ssc (10th)": "board-10",
  "class 10": "board-10",
  "10th": "board-10",
  "hsc": "board-12",
  "hsc (12th)": "board-12",
  "class 12": "board-12",
  "12th": "board-12",
  "class 8": "board-8",
  "class 9": "board-9",
  "class 11": "board-11",
  "neet ug": "neet",
  "jee": "jee-mains",
};

function resolveGoal(raw, fallback) {
  const value = String(raw ?? "").trim();
  if (!value) return fallback;
  if (GOAL_IDS.has(value)) return value;
  const alias = GOAL_ALIASES[value.toLowerCase()];
  return alias || (GOAL_IDS.has(value.toLowerCase()) ? value.toLowerCase() : fallback);
}

export async function bulkCreateSubjects(req, res) {
  try {
    const rows = Array.isArray(req.body?.subjects) ? req.body.subjects : [];
    if (!rows.length) return res.status(400).json({ error: "Add at least one subject." });

    const defaultGoal = String(req.body?.goalCategory ?? "").trim();
    const created = [];
    const skipped = [];
    const errors = [];

    for (let i = 0; i < rows.length; i += 1) {
      const name = String(rows[i]?.name ?? "").trim();
      const goalCategory = resolveGoal(rows[i]?.goalCategory, defaultGoal);
      const icon = String(rows[i]?.icon ?? "book").trim() || "book";
      const color = String(rows[i]?.color ?? "#1E3A8A").trim() || "#1E3A8A";
      if (!name) {
        errors.push({ row: i + 1, error: "Subject name is required." });
        continue;
      }
      if (!goalCategory || !GOAL_IDS.has(goalCategory)) {
        errors.push({ row: i + 1, error: `Unknown exam goal for "${name}".` });
        continue;
      }

      const [dup] = await pool.query(
        "SELECT id FROM subjects WHERE name = ? AND goal_category = ? LIMIT 1",
        [name, goalCategory],
      );
      if (dup[0]) {
        skipped.push(name);
        continue;
      }

      const id = randomUUID();
      await pool.query(
        `INSERT INTO subjects (id, name, goal_category, icon, color) VALUES (?, ?, ?, ?, ?)`,
        [id, name, goalCategory, icon, color],
      );
      const [saved] = await pool.query("SELECT * FROM subjects WHERE id = ? LIMIT 1", [id]);
      created.push(await toSubject(saved[0], { includeChapters: true }));
    }

    return res.status(201).json({ created, skipped, errors });
  } catch (err) {
    console.error("bulkCreateSubjects failed:", err);
    return res.status(500).json({ error: "Could not import subjects." });
  }
}

export async function bulkCreateChapters(req, res) {
  try {
    const subjectId = String(req.body?.subjectId ?? "").trim();
    const rows = Array.isArray(req.body?.chapters) ? req.body.chapters : [];
    if (!subjectId) return res.status(400).json({ error: "Select a subject first." });
    if (!rows.length) return res.status(400).json({ error: "Add at least one chapter." });

    const [subjectRows] = await pool.query("SELECT id FROM subjects WHERE id = ? LIMIT 1", [subjectId]);
    if (!subjectRows[0]) return res.status(404).json({ error: "Subject not found." });

    const [[maxRow]] = await pool.query(
      "SELECT COALESCE(MAX(chapter_number), 0) AS maxNum FROM chapters WHERE subject_id = ?",
      [subjectId],
    );
    let nextNumber = Number(maxRow?.maxNum ?? 0) + 1;
    const created = [];
    const skipped = [];
    const errors = [];

    for (let i = 0; i < rows.length; i += 1) {
      const name = String(rows[i]?.name ?? "").trim();
      let chapterNumber = Number(rows[i]?.chapterNumber);
      if (!name) {
        errors.push({ row: i + 1, error: "Chapter name is required." });
        continue;
      }
      if (!Number.isFinite(chapterNumber) || chapterNumber < 1) {
        chapterNumber = nextNumber;
        nextNumber += 1;
      } else {
        nextNumber = Math.max(nextNumber, chapterNumber + 1);
      }

      const [dup] = await pool.query(
        "SELECT id FROM chapters WHERE subject_id = ? AND name = ? LIMIT 1",
        [subjectId, name],
      );
      if (dup[0]) {
        skipped.push(name);
        continue;
      }

      const id = randomUUID();
      await pool.query(
        `INSERT INTO chapters (id, subject_id, name, chapter_number) VALUES (?, ?, ?, ?)`,
        [id, subjectId, name, chapterNumber],
      );
      const [saved] = await pool.query("SELECT * FROM chapters WHERE id = ? LIMIT 1", [id]);
      created.push(toChapter(saved[0]));
    }

    return res.status(201).json({ created, skipped, errors });
  } catch (err) {
    console.error("bulkCreateChapters failed:", err);
    return res.status(500).json({ error: "Could not import chapters." });
  }
}
