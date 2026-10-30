import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

let _pool = null;

export function getPool() {
  if (_pool) return _pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it in Vercel Environment Variables.");
  }

  _pool = mysql.createPool({
    uri: databaseUrl,
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
  });
  return _pool;
}

/** @type {import('mysql2/promise').Pool} */
export const pool = new Proxy(
  {},
  {
    get(_target, prop) {
      const real = getPool();
      const value = real[prop];
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
);

export async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(32) NULL,
      is_admin TINYINT(1) NOT NULL DEFAULT 0,
      is_blocked TINYINT(1) NOT NULL DEFAULT 0,
      medium VARCHAR(32) NOT NULL DEFAULT 'english',
      streak INT NOT NULL DEFAULT 0,
      goals JSON NULL,
      current_goal_id VARCHAR(255) NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_users_email (email)
    )
  `);

  try {
    await pool.query("ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0");
  } catch {
    // column already exists
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS papers (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      subject_id VARCHAR(64) NULL,
      year INT NOT NULL,
      type VARCHAR(64) NOT NULL DEFAULT 'board',
      medium VARCHAR(32) NOT NULL DEFAULT 'english',
      marks INT NOT NULL DEFAULT 80,
      duration_minutes INT NOT NULL DEFAULT 180,
      status VARCHAR(32) NOT NULL DEFAULT 'draft',
      goal_category VARCHAR(64) NULL,
      file_name VARCHAR(255) NULL,
      file_path VARCHAR(500) NULL,
      views INT NOT NULL DEFAULT 0,
      downloads INT NOT NULL DEFAULT 0,
      bookmarks INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const paperColumns = [
    ["subject_id", "VARCHAR(64) NULL"],
    ["type", "VARCHAR(64) NOT NULL DEFAULT 'board'"],
    ["medium", "VARCHAR(32) NOT NULL DEFAULT 'english'"],
    ["marks", "INT NOT NULL DEFAULT 80"],
    ["duration_minutes", "INT NOT NULL DEFAULT 180"],
    ["file_name", "VARCHAR(255) NULL"],
    ["file_path", "VARCHAR(500) NULL"],
    ["views", "INT NOT NULL DEFAULT 0"],
    ["downloads", "INT NOT NULL DEFAULT 0"],
    ["bookmarks", "INT NOT NULL DEFAULT 0"],
    ["updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
  ];
  for (const [name, def] of paperColumns) {
    try {
      await pool.query(`ALTER TABLE papers ADD COLUMN ${name} ${def}`);
    } catch {
      // column already exists
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      subject VARCHAR(255) NULL,
      subject_id VARCHAR(64) NULL,
      chapter VARCHAR(255) NULL,
      difficulty VARCHAR(16) NOT NULL DEFAULT 'medium',
      time_limit_minutes INT NOT NULL DEFAULT 15,
      total_marks INT NOT NULL DEFAULT 10,
      questions_count INT NOT NULL DEFAULT 0,
      instructions TEXT NULL,
      marking_scheme JSON NULL,
      goal_category VARCHAR(64) NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const quizColumns = [
    ["subject_id", "VARCHAR(64) NULL"],
    ["chapter", "VARCHAR(255) NULL"],
    ["difficulty", "VARCHAR(16) NOT NULL DEFAULT 'medium'"],
    ["time_limit_minutes", "INT NOT NULL DEFAULT 15"],
    ["total_marks", "INT NOT NULL DEFAULT 10"],
    ["questions_count", "INT NOT NULL DEFAULT 0"],
    ["instructions", "TEXT NULL"],
    ["marking_scheme", "JSON NULL"],
    ["questions_to_show", "INT NOT NULL DEFAULT 10"],
    ["scheduled_at", "DATETIME NULL"],
    ["updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
  ];
  for (const [name, def] of quizColumns) {
    try {
      await pool.query(`ALTER TABLE quizzes ADD COLUMN ${name} ${def}`);
    } catch {
      // column already exists
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id VARCHAR(36) PRIMARY KEY,
      quiz_id VARCHAR(36) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      text TEXT NOT NULL,
      option_a VARCHAR(500) NULL,
      option_b VARCHAR(500) NULL,
      option_c VARCHAR(500) NULL,
      option_d VARCHAR(500) NULL,
      correct_option CHAR(1) NOT NULL DEFAULT 'A',
      explanation TEXT NULL,
      marks INT NOT NULL DEFAULT 1,
      INDEX idx_quiz_questions_quiz (quiz_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      quiz_id VARCHAR(36) NOT NULL,
      score DECIMAL(6,2) NULL,
      percentage DECIMAL(6,2) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_quiz_attempts_user (user_id),
      INDEX idx_quiz_attempts_quiz (quiz_id)
    )
  `);

  const attemptColumns = [
    ["max_score", "DECIMAL(6,2) NULL"],
    ["correct_count", "INT NULL"],
    ["wrong_count", "INT NULL"],
    ["skipped_count", "INT NULL"],
    ["negative_marks", "DECIMAL(6,2) NULL"],
    ["time_taken_seconds", "INT NULL"],
    ["mode", "VARCHAR(16) NULL"],
    ["quiz_title", "VARCHAR(500) NULL"],
    ["subject", "VARCHAR(255) NULL"],
    ["goal_category", "VARCHAR(64) NULL"],
  ];
  for (const [name, def] of attemptColumns) {
    try {
      await pool.query(`ALTER TABLE quiz_attempts ADD COLUMN ${name} ${def}`);
    } catch {
      // column already exists
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      goal_category VARCHAR(64) NOT NULL,
      icon VARCHAR(64) NOT NULL DEFAULT 'book',
      color VARCHAR(16) NOT NULL DEFAULT '#1E3A8A',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_subjects_goal (goal_category)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chapters (
      id VARCHAR(36) PRIMARY KEY,
      subject_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      chapter_number INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_chapters_subject (subject_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      body TEXT NOT NULL,
      priority VARCHAR(32) NOT NULL DEFAULT 'normal',
      target_goals JSON NULL,
      expires_at DATE NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_announcements_active (is_active)
    )
  `);

  // Data normalization: Fix 'Mathmetics' typo in database (BUG-015)
  try {
    await pool.query("UPDATE subjects SET name = 'Mathematics' WHERE name = 'Mathmetics'");
    await pool.query("UPDATE papers SET subject = 'Mathematics' WHERE subject = 'Mathmetics'");
    await pool.query("UPDATE quizzes SET subject = 'Mathematics' WHERE subject = 'Mathmetics'");
  } catch (err) {
    console.warn("Subject name cleanup skipped:", err.message);
  }
}

export function toPublicUser(row) {
  let goals = [];
  if (row.goals) {
    try {
      goals = typeof row.goals === "string" ? JSON.parse(row.goals) : row.goals;
    } catch {
      goals = [];
    }
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    goals: Array.isArray(goals) ? goals : [],
    currentGoalId: row.current_goal_id || "",
    medium: row.medium || "english",
    streak: row.streak ?? 0,
    isAdmin: Boolean(row.is_admin),
  };
}
