import { pool } from "./db.js";
import { requireAuth } from "./auth.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseGoals(raw) {
  if (!raw) return [];
  try {
    const goals = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(goals) ? goals : [];
  } catch {
    return [];
  }
}

function goalCategories(goals) {
  return parseGoals(goals).map((g) => g.category).filter(Boolean);
}

function goalLabels(goals) {
  return parseGoals(goals).map((g) => g.label || g.shortLabel || g.category).filter(Boolean);
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.auth?.isAdmin) {
      return res.status(403).json({ error: "Admin access required." });
    }
    next();
  }).catch((err) => {
    console.error("requireAdmin failed:", err);
    return res.status(500).json({ error: "Could not verify admin access." });
  });
}

export async function getDashboard(req, res) {
  try {
    const [[studentCountRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE is_admin = 0",
    );
    const [[paperCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM papers");
    const [[quizCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM quizzes");
    const [[attemptCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM quiz_attempts");
    const [[weekRegRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE is_admin = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
    );
    const [[todayAttemptsRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM quiz_attempts WHERE created_at >= CURDATE()",
    );
    const [[dailyActiveRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE is_admin = 0 AND updated_at >= CURDATE()",
    );
    const [[blockedRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE is_admin = 0 AND is_blocked = 1",
    );

    const [trendRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS monthKey, COUNT(*) AS count
      FROM users
      WHERE is_admin = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY monthKey ASC
    `);

    const registrationTrend = trendRows.map((row) => {
      const monthIndex = Number(row.monthKey.split("-")[1]) - 1;
      return { month: MONTHS[monthIndex] ?? row.monthKey, count: Number(row.count) };
    });

    const [topQuizRows] = await pool.query(`
      SELECT q.title, COUNT(a.id) AS attempts
      FROM quiz_attempts a
      JOIN quizzes q ON q.id = a.quiz_id
      GROUP BY q.id, q.title
      ORDER BY attempts DESC
      LIMIT 5
    `);

    const [recentPaperRows] = await pool.query(`
      SELECT id, title, subject, year, status
      FROM papers
      ORDER BY created_at DESC
      LIMIT 4
    `);

    const [recentStudentRows] = await pool.query(`
      SELECT
        u.id, u.name, u.email, u.goals, u.streak, u.is_blocked, u.created_at,
        (SELECT COUNT(*) FROM quiz_attempts a WHERE a.user_id = u.id) AS totalAttempts
      FROM users u
      WHERE u.is_admin = 0
      ORDER BY u.created_at DESC
      LIMIT 4
    `);

    const [allStudents] = await pool.query(
      "SELECT goals FROM users WHERE is_admin = 0",
    );

    let neetStudents = 0;
    let boardStudents = 0;
    for (const row of allStudents) {
      const categories = goalCategories(row.goals);
      if (categories.includes("neet")) neetStudents += 1;
      if (categories.some((c) => String(c).startsWith("board"))) boardStudents += 1;
    }

    const recentStudents = recentStudentRows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      goalLabels: goalLabels(row.goals),
      streak: row.streak ?? 0,
      isBlocked: Boolean(row.is_blocked),
      totalAttempts: Number(row.totalAttempts ?? 0),
      joinedAt: row.created_at,
    }));

    return res.json({
      totalStudents: Number(studentCountRow.count),
      totalPapers: Number(paperCountRow.count),
      totalQuizzes: Number(quizCountRow.count),
      totalAttempts: Number(attemptCountRow.count),
      newStudentsThisWeek: Number(weekRegRow.count),
      attemptsToday: Number(todayAttemptsRow.count),
      dailyActiveUsers: Number(dailyActiveRow.count),
      blockedAccounts: Number(blockedRow.count),
      neetStudents,
      boardStudents,
      registrationTrend,
      topQuizzes: topQuizRows.map((row) => ({
        title: row.title,
        attempts: Number(row.attempts),
      })),
      recentPapers: recentPaperRows.map((row) => ({
        id: row.id,
        title: row.title,
        subject: row.subject,
        year: row.year,
        status: row.status,
      })),
      recentStudents,
    });
  } catch (err) {
    console.error("admin dashboard failed:", err);
    return res.status(500).json({ error: "Could not load dashboard stats." });
  }
}

const GOAL_DIST_LABELS = {
  "board-8": "Class 8",
  "board-9": "Class 9",
  "board-10": "Board 10th",
  "board-11": "Class 11",
  "board-12": "Board 12th",
  neet: "NEET UG",
  "jee-mains": "JEE Mains",
  "jee-advanced": "JEE Advanced",
  "mht-cet-pcb": "MHT-CET PCB",
  "mht-cet-pcm": "MHT-CET PCM",
};

const MEDIUM_LABELS = {
  english: "English",
  "semi-english": "Semi-English",
  marathi: "Marathi",
};

function monthKeys(count) {
  const keys = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    keys.push({ monthKey, month: MONTHS[d.getMonth()] });
  }
  return keys;
}

function lastSevenDays() {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push({ dateKey: `${y}-${m}-${day}`, day: names[d.getDay()] });
  }
  return days;
}

export async function getAnalytics(_req, res) {
  try {
    const [[studentCountRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE is_admin = 0",
    );
    const [[attemptCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM quiz_attempts");
    const [[weekRegRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE is_admin = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
    );
    const [[todayAttemptsRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM quiz_attempts WHERE created_at >= CURDATE()",
    );
    const [[avgScoreRow]] = await pool.query(
      "SELECT AVG(percentage) AS avgScore FROM quiz_attempts",
    );
    const [[dailyActiveRow]] = await pool.query(`
      SELECT COUNT(*) AS count FROM (
        SELECT id FROM users WHERE is_admin = 0 AND updated_at >= CURDATE()
        UNION
        SELECT user_id FROM quiz_attempts WHERE created_at >= CURDATE()
      ) active_users
    `);
    const [[paperCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM papers");
    const [[quizCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM quizzes");
    const [[viewRow]] = await pool.query("SELECT COALESCE(SUM(views), 0) AS views, COALESCE(SUM(downloads), 0) AS downloads FROM papers");

    const [trendRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS monthKey, COUNT(*) AS count
      FROM users
      WHERE is_admin = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    `);
    const trendMap = Object.fromEntries(trendRows.map((row) => [row.monthKey, Number(row.count)]));
    const registrationTrend = monthKeys(6).map((m) => ({
      month: m.month,
      count: trendMap[m.monthKey] ?? 0,
    }));

    const [dailyRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS dateKey, COUNT(*) AS count
      FROM quiz_attempts
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
    `);
    const dailyMap = Object.fromEntries(dailyRows.map((row) => [row.dateKey, Number(row.count)]));
    const dailyAttempts = lastSevenDays().map((d) => ({
      day: d.day,
      attempts: dailyMap[d.dateKey] ?? 0,
    }));

    const [paperSubjectRows] = await pool.query(`
      SELECT subject, COALESCE(SUM(views), 0) AS views, COALESCE(SUM(downloads), 0) AS downloads
      FROM papers
      WHERE subject IS NOT NULL AND subject != ''
      GROUP BY subject
    `);
    const [quizSubjectRows] = await pool.query(`
      SELECT q.subject AS subject, COUNT(a.id) AS attempts
      FROM quiz_attempts a
      JOIN quizzes q ON q.id = a.quiz_id
      WHERE q.subject IS NOT NULL AND q.subject != ''
      GROUP BY q.subject
    `);
    const subjectMap = new Map();
    for (const row of paperSubjectRows) {
      subjectMap.set(row.subject, {
        subject: row.subject,
        views: Number(row.views ?? 0),
        downloads: Number(row.downloads ?? 0),
        attempts: 0,
      });
    }
    for (const row of quizSubjectRows) {
      const existing = subjectMap.get(row.subject) || {
        subject: row.subject,
        views: 0,
        downloads: 0,
        attempts: 0,
      };
      existing.attempts = Number(row.attempts ?? 0);
      subjectMap.set(row.subject, existing);
    }
    const subjectEngagement = [...subjectMap.values()]
      .sort((a, b) => (b.views + b.attempts) - (a.views + a.attempts))
      .slice(0, 8);

    const [mediumRows] = await pool.query(`
      SELECT medium, COUNT(*) AS count
      FROM users
      WHERE is_admin = 0
      GROUP BY medium
    `);
    const totalStudents = Number(studentCountRow.count);
    const mediumDistribution = mediumRows.map((row) => {
      const key = String(row.medium || "english");
      const count = Number(row.count);
      return {
        name: MEDIUM_LABELS[key] || key,
        count,
        value: totalStudents ? Math.round((count / totalStudents) * 100) : 0,
      };
    }).sort((a, b) => b.count - a.count);

    const [goalRows] = await pool.query("SELECT goals FROM users WHERE is_admin = 0");
    const goalCounts = {};
    for (const row of goalRows) {
      const unique = [...new Set(goalCategories(row.goals))];
      for (const cat of unique) {
        goalCounts[cat] = (goalCounts[cat] || 0) + 1;
      }
    }
    const goalDistribution = Object.entries(goalCounts)
      .map(([id, count]) => ({
        name: GOAL_DIST_LABELS[id] || id,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);

    const [topPaperRows] = await pool.query(`
      SELECT id, title, views, downloads
      FROM papers
      ORDER BY downloads DESC, views DESC
      LIMIT 5
    `);
    const [topQuizRows] = await pool.query(`
      SELECT q.id, q.title, COUNT(a.id) AS attempts, AVG(a.percentage) AS avgScore
      FROM quizzes q
      LEFT JOIN quiz_attempts a ON a.quiz_id = q.id
      GROUP BY q.id, q.title
      ORDER BY attempts DESC, q.created_at DESC
      LIMIT 5
    `);

    return res.json({
      totalStudents,
      totalAttempts: Number(attemptCountRow.count),
      totalPapers: Number(paperCountRow.count),
      totalQuizzes: Number(quizCountRow.count),
      newStudentsThisWeek: Number(weekRegRow.count),
      attemptsToday: Number(todayAttemptsRow.count),
      dailyActiveUsers: Number(dailyActiveRow.count),
      avgScore: avgScoreRow?.avgScore != null ? Math.round(Number(avgScoreRow.avgScore)) : 0,
      paperViews: Number(viewRow?.views ?? 0),
      paperDownloads: Number(viewRow?.downloads ?? 0),
      registrationTrend,
      dailyAttempts,
      subjectEngagement,
      mediumDistribution,
      goalDistribution,
      topPapers: topPaperRows.map((row) => ({
        id: row.id,
        title: row.title,
        views: Number(row.views ?? 0),
        downloads: Number(row.downloads ?? 0),
      })),
      topQuizzes: topQuizRows.map((row) => ({
        id: row.id,
        title: row.title,
        attempts: Number(row.attempts ?? 0),
        avgScore: row.avgScore != null ? Math.round(Number(row.avgScore)) : 0,
      })),
    });
  } catch (err) {
    console.error("admin analytics failed:", err);
    return res.status(500).json({ error: "Could not load analytics." });
  }
}

function toAdminStudent(row) {
  const goals = parseGoals(row.goals);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    medium: row.medium || "english",
    streak: Number(row.streak ?? 0),
    isBlocked: Boolean(row.is_blocked),
    goalCategories: goalCategories(goals),
    goalLabels: goalLabels(goals),
    totalAttempts: Number(row.totalAttempts ?? 0),
    avgScore: row.avgScore != null ? Math.round(Number(row.avgScore)) : 0,
    joinedAt: row.created_at,
  };
}

const STUDENT_SELECT = `
  SELECT
    u.id, u.name, u.email, u.phone, u.medium, u.streak, u.is_blocked, u.goals, u.created_at,
    (SELECT COUNT(*) FROM quiz_attempts a WHERE a.user_id = u.id) AS totalAttempts,
    (SELECT AVG(percentage) FROM quiz_attempts a WHERE a.user_id = u.id) AS avgScore
  FROM users u
`;

export async function listUsers(_req, res) {
  try {
    const [rows] = await pool.query(
      `${STUDENT_SELECT} WHERE u.is_admin = 0 ORDER BY u.created_at DESC`,
    );
    return res.json({ students: rows.map(toAdminStudent) });
  } catch (err) {
    console.error("listUsers failed:", err);
    return res.status(500).json({ error: "Could not load students." });
  }
}

export async function updateUser(req, res) {
  try {
    const id = String(req.params.id || "");
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE id = ? AND is_admin = 0 LIMIT 1",
      [id],
    );
    if (!existing[0]) return res.status(404).json({ error: "Student not found." });

    const name = String(req.body?.name ?? existing[0].name).trim();
    const email = String(req.body?.email ?? existing[0].email).trim().toLowerCase();
    const phone = req.body?.phone != null ? String(req.body.phone).trim() : existing[0].phone;
    const medium = String(req.body?.medium ?? existing[0].medium).trim() || "english";

    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    const [dup] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
      [email, id],
    );
    if (dup[0]) return res.status(409).json({ error: "Another account already uses this email." });

    await pool.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, medium = ? WHERE id = ?",
      [name, email, phone || null, medium, id],
    );

    const [rows] = await pool.query(`${STUDENT_SELECT} WHERE u.id = ? LIMIT 1`, [id]);
    return res.json({ student: toAdminStudent(rows[0]) });
  } catch (err) {
    console.error("updateUser failed:", err);
    return res.status(500).json({ error: "Could not update student." });
  }
}

export async function setUserBlocked(req, res) {
  try {
    const id = String(req.params.id || "");
    if (id === req.auth?.id) {
      return res.status(400).json({ error: "You cannot block your own account." });
    }

    const [existing] = await pool.query(
      "SELECT id, is_admin FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    if (!existing[0]) return res.status(404).json({ error: "Student not found." });
    if (existing[0].is_admin) {
      return res.status(400).json({ error: "Admin accounts cannot be blocked." });
    }

    const blocked = Boolean(req.body?.blocked);
    await pool.query("UPDATE users SET is_blocked = ? WHERE id = ?", [blocked ? 1 : 0, id]);

    const [rows] = await pool.query(`${STUDENT_SELECT} WHERE u.id = ? LIMIT 1`, [id]);
    return res.json({ student: toAdminStudent(rows[0]) });
  } catch (err) {
    console.error("setUserBlocked failed:", err);
    return res.status(500).json({ error: "Could not update block status." });
  }
}

export async function deleteUser(req, res) {
  try {
    const id = String(req.params.id || "");
    if (id === req.auth?.id) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    const [existing] = await pool.query(
      "SELECT id, is_admin FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    if (!existing[0]) return res.status(404).json({ error: "Student not found." });
    if (existing[0].is_admin) {
      return res.status(400).json({ error: "Admin accounts cannot be deleted." });
    }

    await pool.query("DELETE FROM quiz_attempts WHERE user_id = ?", [id]);
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteUser failed:", err);
    return res.status(500).json({ error: "Could not delete student." });
  }
}
