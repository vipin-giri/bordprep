import fs from "fs";
import path from "path";
import { pool } from "./db.js";
import { toPaper, UPLOADS_DIR } from "./papers.js";
import { publishDueQuizzes } from "./quizzes.js";

function toChapter(row) {
  return {
    id: row.id,
    name: row.name,
    chapterNumber: Number(row.chapter_number ?? 1),
  };
}

function toStudentSubject(row, chapters = []) {
  return {
    id: row.id,
    name: row.name,
    goalCategory: row.goal_category,
    icon: row.icon || "book",
    color: row.color || "#1E3A8A",
    chapters,
  };
}

function defaultMarkingScheme(raw) {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === "object") {
      const correctMarks = Number(parsed.correctMarks ?? 4);
      const wrongMarks = Number(parsed.wrongMarks ?? -1);
      return {
        correctMarks,
        wrongMarks,
        hasNegativeMarking: parsed.hasNegativeMarking ?? wrongMarks < 0,
        label: parsed.label ?? `${correctMarks >= 0 ? "+" : ""}${correctMarks} / ${wrongMarks}`,
      };
    }
  } catch {
    // use defaults below
  }
  return { correctMarks: 4, wrongMarks: -1, hasNegativeMarking: true, label: "+4 / -1" };
}

function toStudentQuiz(row, analytics) {
  const bankSize = Number(row.questions_count ?? 0);
  const questionsToShow = Number(row.questions_to_show ?? bankSize);
  return {
    id: row.id,
    title: row.title,
    subject: row.subject || "",
    subjectId: row.subject_id || "",
    chapter: row.chapter || "",
    goalCategory: row.goal_category || "",
    difficulty: row.difficulty || "medium",
    timeLimitMinutes: Number(row.time_limit_minutes ?? 15),
    totalMarks: Number(row.total_marks ?? 0),
    questionsCount: questionsToShow,
    questionsToShow,
    bankSize,
    instructions: row.instructions || "",
    markingScheme: defaultMarkingScheme(row.marking_scheme),
    status: row.status || "draft",
    analytics,
    createdAt: row.created_at,
  };
}

export async function listStudentSubjects(req, res) {
  try {
    const goalCategory = String(req.query.goalCategory || "").trim();
    const params = [];
    let sql = "SELECT * FROM subjects";
    if (goalCategory) {
      sql += " WHERE goal_category = ?";
      params.push(goalCategory);
    }
    sql += " ORDER BY name ASC";

    const [rows] = await pool.query(sql, params);
    const subjects = await Promise.all(rows.map(async (row) => {
      const [chapterRows] = await pool.query(
        "SELECT id, name, chapter_number FROM chapters WHERE subject_id = ? ORDER BY chapter_number ASC",
        [row.id],
      );
      return toStudentSubject(row, chapterRows.map(toChapter));
    }));

    return res.json({ subjects });
  } catch (err) {
    console.error("listStudentSubjects failed:", err);
    return res.status(500).json({ error: "Could not load subjects." });
  }
}

export async function listStudentPapers(_req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM papers WHERE status = 'published' ORDER BY created_at DESC",
    );
    return res.json({ papers: rows.map(toPaper) });
  } catch (err) {
    console.error("listStudentPapers failed:", err);
    return res.status(500).json({ error: "Could not load papers." });
  }
}

export async function getStudentPaper(req, res) {
  try {
    const id = String(req.params.id || "");
    const [rows] = await pool.query(
      "SELECT * FROM papers WHERE id = ? AND status = 'published' LIMIT 1",
      [id],
    );
    if (!rows[0]) return res.status(404).json({ error: "Paper not found." });
    return res.json({ paper: toPaper(rows[0]) });
  } catch (err) {
    console.error("getStudentPaper failed:", err);
    return res.status(500).json({ error: "Could not load paper." });
  }
}

export async function viewStudentPaper(req, res) {
  try {
    const id = String(req.params.id || "");
    const [rows] = await pool.query(
      "SELECT * FROM papers WHERE id = ? AND status = 'published' LIMIT 1",
      [id],
    );
    if (!rows[0] || !rows[0].file_path) {
      return res.status(404).json({ error: "PDF not found for this paper." });
    }

    const abs = path.join(UPLOADS_DIR, path.basename(rows[0].file_path));
    if (!fs.existsSync(abs)) {
      return res.status(404).json({ error: "PDF file is missing." });
    }

    await pool.query("UPDATE papers SET views = views + 1 WHERE id = ?", [id]);
    res.setHeader("Content-Type", "application/pdf");
    return res.sendFile(abs);
  } catch (err) {
    console.error("viewStudentPaper failed:", err);
    return res.status(500).json({ error: "Could not open paper." });
  }
}

export async function listStudentQuizzes(_req, res) {
  try {
    await publishDueQuizzes();
    const [rows] = await pool.query(
      "SELECT * FROM quizzes WHERE status = 'published' ORDER BY created_at DESC",
    );
    const quizzes = await Promise.all(rows.map(async (row) => {
      const analytics = await (async () => {
        const [[stats]] = await pool.query(
          `SELECT COUNT(*) AS totalAttempts, AVG(score) AS avgScore
           FROM quiz_attempts WHERE quiz_id = ?`,
          [row.id],
        );
        return {
          totalAttempts: Number(stats?.totalAttempts ?? 0),
          avgScore: stats?.avgScore != null ? Math.round(Number(stats.avgScore) * 10) / 10 : 0,
        };
      })();
      return toStudentQuiz(row, analytics);
    }));
    return res.json({ quizzes });
  } catch (err) {
    console.error("listStudentQuizzes failed:", err);
    return res.status(500).json({ error: "Could not load quizzes." });
  }
}

export async function getPublicCatalog(_req, res) {
  try {
    await publishDueQuizzes();
    const [paperRows] = await pool.query(
      "SELECT * FROM papers WHERE status = 'published' ORDER BY year DESC, created_at DESC",
    );
    const [quizRows] = await pool.query(
      "SELECT * FROM quizzes WHERE status = 'published' ORDER BY created_at DESC",
    );
    const [subjectRows] = await pool.query("SELECT * FROM subjects ORDER BY name ASC");
    const [[studentCount]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE is_admin = 0");
    const [[attemptCount]] = await pool.query("SELECT COUNT(*) AS count FROM quiz_attempts");

    const quizzes = await Promise.all(quizRows.map(async (row) => {
      const [[stats]] = await pool.query(
        `SELECT COUNT(*) AS totalAttempts, AVG(score) AS avgScore
         FROM quiz_attempts WHERE quiz_id = ?`,
        [row.id],
      );
      return toStudentQuiz(row, {
        totalAttempts: Number(stats?.totalAttempts ?? 0),
        avgScore: stats?.avgScore != null ? Math.round(Number(stats.avgScore) * 10) / 10 : 0,
      });
    }));

    return res.json({
      papers: paperRows.map(toPaper),
      quizzes,
      subjects: subjectRows.map((row) => toStudentSubject(row, [])),
      stats: {
        students: Number(studentCount?.count ?? 0),
        papers: paperRows.length,
        quizzes: quizRows.length,
        attempts: Number(attemptCount?.count ?? 0),
      },
    });
  } catch (err) {
    console.error("getPublicCatalog failed:", err);
    return res.status(500).json({ error: "Could not load catalog." });
  }
}

export async function getStudentQuiz(req, res) {
  try {
    await publishDueQuizzes();
    const id = String(req.params.id || "");
    const [rows] = await pool.query(
      "SELECT * FROM quizzes WHERE id = ? AND status = 'published' LIMIT 1",
      [id],
    );
    if (!rows[0]) return res.status(404).json({ error: "Quiz not found." });

    const analytics = await (async () => {
      const [[row]] = await pool.query(
        `SELECT COUNT(*) AS totalAttempts, AVG(score) AS avgScore
         FROM quiz_attempts WHERE quiz_id = ?`,
        [id],
      );
      return {
        totalAttempts: Number(row?.totalAttempts ?? 0),
        avgScore: row?.avgScore != null ? Math.round(Number(row.avgScore) * 10) / 10 : 0,
      };
    })();

    const quiz = toStudentQuiz(rows[0], analytics);
    return res.json({ quiz });
  } catch (err) {
    console.error("getStudentQuiz failed:", err);
    return res.status(500).json({ error: "Could not load quiz." });
  }
}
