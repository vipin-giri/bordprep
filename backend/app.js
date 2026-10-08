import express from "express";
import cors from "cors";
import { initSchema } from "./db.js";
import { login, me, register, requireAuth, seedAdmin, updateMe } from "./auth.js";
import { deleteUser, getAnalytics, getDashboard, listUsers, requireAdmin, setUserBlocked, updateUser } from "./admin.js";
import {
  createPaper,
  deletePaper,
  downloadPaper,
  handleUploadError,
  listPapers,
  paperUpload,
  updatePaper,
} from "./papers.js";
import {
  createQuiz,
  deleteQuiz,
  getQuiz,
  listQuizzes,
  startQuizSession,
  submitQuizAttempt,
  listMyAttempts,
  updateQuiz,
  updateQuizStatus,
} from "./quizzes.js";
import {
  getPublicCatalog,
  getStudentPaper,
  getStudentQuiz,
  listStudentPapers,
  listStudentQuizzes,
  listStudentSubjects,
  viewStudentPaper,
} from "./content.js";
import {
  bulkCreateChapters,
  bulkCreateSubjects,
  createChapter,
  createSubject,
  deleteChapter,
  deleteSubject,
  listSubjects,
  updateChapter,
  updateSubject,
} from "./subjects.js";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  listStudentAnnouncements,
  updateAnnouncement,
} from "./announcements.js";

const app = express();

/** FRONTEND_ORIGIN = comma-separated allowlist. Empty = reflect request origin (dev-friendly). */
function corsOptions() {
  const raw = String(process.env.FRONTEND_ORIGIN || process.env.CORS_ORIGINS || "").trim();
  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!allowed.length) {
    return { origin: true, credentials: true };
  }
  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed.includes("*") || allowed.includes(origin)) return callback(null, true);
      // Allow any *.vercel.app preview if a vercel.app origin is listed
      const allowVercelPreviews = allowed.some((o) => o.includes("vercel.app"));
      if (allowVercelPreviews && /\.vercel\.app$/i.test(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  };
}

app.use(cors(corsOptions()));
app.use(express.json({ limit: "1mb" }));

let readyPromise = null;

async function ensureReady() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set.");
  }
  if (!process.env.PASSWORD_PEPPER) {
    throw new Error("PASSWORD_PEPPER is not set.");
  }
  if (!readyPromise) {
    readyPromise = (async () => {
      await initSchema();
      await seedAdmin();
    })();
  }
  return readyPromise;
}

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "parikshacrack-api", runtime: process.env.VERCEL ? "vercel" : "node" });
});

app.get("/api/health", async (_req, res) => {
  try {
    await ensureReady();
    res.json({ ok: true, service: "parikshacrack-api", runtime: process.env.VERCEL ? "vercel" : "node" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || "Health check failed." });
  }
});

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", requireAuth, me);
app.patch("/api/auth/me", requireAuth, updateMe);

app.get("/api/admin/dashboard", requireAdmin, getDashboard);
app.get("/api/admin/analytics", requireAdmin, getAnalytics);
app.get("/api/admin/users", requireAdmin, listUsers);
app.patch("/api/admin/users/:id", requireAdmin, updateUser);
app.patch("/api/admin/users/:id/block", requireAdmin, setUserBlocked);
app.delete("/api/admin/users/:id", requireAdmin, deleteUser);

app.get("/api/admin/papers", requireAdmin, listPapers);
app.post("/api/admin/papers", requireAdmin, paperUpload.single("pdf"), handleUploadError, createPaper);
app.patch("/api/admin/papers/:id", requireAdmin, paperUpload.single("pdf"), handleUploadError, updatePaper);
app.delete("/api/admin/papers/:id", requireAdmin, deletePaper);
app.get("/api/admin/papers/:id/file", requireAdmin, downloadPaper);

app.get("/api/admin/quizzes", requireAdmin, listQuizzes);
app.get("/api/admin/quizzes/:id", requireAdmin, getQuiz);
app.post("/api/admin/quizzes", requireAdmin, createQuiz);
app.patch("/api/admin/quizzes/:id/status", requireAdmin, updateQuizStatus);
app.patch("/api/admin/quizzes/:id", requireAdmin, updateQuiz);
app.delete("/api/admin/quizzes/:id", requireAdmin, deleteQuiz);

app.post("/api/quizzes/:id/start", requireAuth, startQuizSession);
app.post("/api/quizzes/:id/attempts", requireAuth, submitQuizAttempt);
app.get("/api/attempts", requireAuth, listMyAttempts);

app.get("/api/public/catalog", getPublicCatalog);

app.get("/api/subjects", requireAuth, listStudentSubjects);
app.get("/api/papers", requireAuth, listStudentPapers);
app.get("/api/papers/:id", requireAuth, getStudentPaper);
app.get("/api/papers/:id/file", requireAuth, viewStudentPaper);
app.get("/api/quizzes", requireAuth, listStudentQuizzes);
app.get("/api/quizzes/:id", requireAuth, getStudentQuiz);

app.get("/api/announcements", requireAuth, listStudentAnnouncements);

app.get("/api/admin/subjects", requireAdmin, listSubjects);
app.post("/api/admin/subjects", requireAdmin, createSubject);
app.post("/api/admin/subjects/bulk", requireAdmin, bulkCreateSubjects);
app.patch("/api/admin/subjects/:id", requireAdmin, updateSubject);
app.delete("/api/admin/subjects/:id", requireAdmin, deleteSubject);
app.post("/api/admin/subjects/:subjectId/chapters", requireAdmin, createChapter);
app.post("/api/admin/chapters/bulk", requireAdmin, bulkCreateChapters);
app.patch("/api/admin/chapters/:id", requireAdmin, updateChapter);
app.delete("/api/admin/chapters/:id", requireAdmin, deleteChapter);

app.get("/api/admin/announcements", requireAdmin, listAnnouncements);
app.post("/api/admin/announcements", requireAdmin, createAnnouncement);
app.patch("/api/admin/announcements/:id", requireAdmin, updateAnnouncement);
app.delete("/api/admin/announcements/:id", requireAdmin, deleteAnnouncement);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

export { app, ensureReady };
export default app;
