export const TOKEN_KEY = "parikshacrack_token";

/** Fallback only if neither API_URL nor VITE_API_URL is set in the build. */
const DEFAULT_PROD_API = "https://bordprep-server.vercel.app";

function resolveApiBase() {
  // Prefer API_URL (set directly in Vercel). VITE_API_URL still supported.
  const fromEnv = String(
    import.meta.env.API_URL ?? import.meta.env.VITE_API_URL ?? "",
  ).trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  // Local Vite uses proxy → relative "/api". Production must hit the API project.
  if (import.meta.env.PROD) return DEFAULT_PROD_API;
  return "";
}

const API_BASE = resolveApiBase();

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  goals: unknown[];
  currentGoalId: string;
  medium: string;
  streak: number;
  isAdmin: boolean;
  avatar?: string;
};

type ApiErrorBody = { error?: string };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("Cannot reach the server. Make sure the API is running.", 0);
  }

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!res.ok) {
    throw new ApiError((data as ApiErrorBody).error || "Request failed.", res.status);
  }
  return data as T;
}

export function registerAccount(body: { name: string; email: string; password: string }) {
  return api<{ token: string; user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function loginAccount(body: { email: string; password: string }) {
  return api<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchMe() {
  return api<{ user: AuthUser }>("/api/auth/me");
}

export function updateMe(body: Partial<AuthUser>) {
  return api<{ user: AuthUser }>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function forgotPassword(body: { email: string }) {
  return api<{ message: string; devOtp?: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function verifyOtp(body: { email: string; otp: string }) {
  return api<{ message: string }>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function resetPassword(body: { email: string; otp: string; password: string }) {
  return api<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type AdminDashboardStats = {
  totalStudents: number;
  totalPapers: number;
  totalQuizzes: number;
  totalAttempts: number;
  newStudentsThisWeek: number;
  attemptsToday: number;
  dailyActiveUsers: number;
  blockedAccounts: number;
  neetStudents: number;
  boardStudents: number;
  registrationTrend: { month: string; count: number }[];
  topQuizzes: { title: string; attempts: number }[];
  recentPapers: { id: string; title: string; subject: string; year: number; status: string }[];
  recentStudents: {
    id: string;
    name: string;
    email: string;
    goalLabels: string[];
    streak: number;
    isBlocked: boolean;
    totalAttempts: number;
    joinedAt: string;
  }[];
};

export function fetchAdminDashboard() {
  return api<AdminDashboardStats>("/api/admin/dashboard");
}

export type AdminAnalytics = {
  totalStudents: number;
  totalAttempts: number;
  totalPapers: number;
  totalQuizzes: number;
  newStudentsThisWeek: number;
  attemptsToday: number;
  dailyActiveUsers: number;
  avgScore: number;
  paperViews: number;
  paperDownloads: number;
  registrationTrend: { month: string; count: number }[];
  dailyAttempts: { day: string; attempts: number }[];
  subjectEngagement: { subject: string; views: number; downloads: number; attempts: number }[];
  mediumDistribution: { name: string; count: number; value: number }[];
  goalDistribution: { name: string; value: number }[];
  topPapers: { id: string; title: string; views: number; downloads: number }[];
  topQuizzes: { id: string; title: string; attempts: number; avgScore: number }[];
};

export function fetchAdminAnalytics() {
  return api<AdminAnalytics>("/api/admin/analytics");
}

export type AdminStudent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  medium: string;
  streak: number;
  isBlocked: boolean;
  goalCategories: string[];
  goalLabels: string[];
  totalAttempts: number;
  avgScore: number;
  joinedAt?: string;
};

export function fetchAdminStudents() {
  return api<{ students: AdminStudent[] }>("/api/admin/users");
}

export function updateAdminStudent(id: string, body: { name: string; email: string; phone?: string; medium?: string }) {
  return api<{ student: AdminStudent }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function setAdminStudentBlocked(id: string, blocked: boolean) {
  return api<{ student: AdminStudent }>(`/api/admin/users/${id}/block`, {
    method: "PATCH",
    body: JSON.stringify({ blocked }),
  });
}

export function deleteAdminStudent(id: string) {
  return api<{ ok: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" });
}

export type AdminPaper = {
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  year: number;
  type: string;
  medium: string;
  marks: number;
  durationMinutes: number;
  status: "draft" | "published" | string;
  goalCategory: string;
  fileName: string | null;
  hasFile: boolean;
  solutionPriceOverride?: number | null;
  analytics: { views: number; downloads: number; bookmarks: number };
  createdAt: string;
};

export function fetchAdminPapers() {
  return api<{ papers: AdminPaper[] }>("/api/admin/papers");
}

export function createAdminPaper(form: FormData) {
  return api<{ paper: AdminPaper }>("/api/admin/papers", {
    method: "POST",
    body: form,
  });
}

export function updateAdminPaper(id: string, form: FormData) {
  return api<{ paper: AdminPaper }>(`/api/admin/papers/${id}`, {
    method: "PATCH",
    body: form,
  });
}

export function deleteAdminPaper(id: string) {
  return api<{ ok: boolean }>(`/api/admin/papers/${id}`, { method: "DELETE" });
}

export function adminPaperFileUrl(id: string) {
  return `/api/admin/papers/${id}/file`;
}

export type AdminQuizQuestion = {
  id?: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D" | string;
  explanation: string;
  marks: number;
};

export type AdminQuiz = {
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  chapter: string;
  goalCategory: string;
  difficulty: "easy" | "medium" | "hard" | string;
  timeLimitMinutes: number;
  totalMarks: number;
  questionsCount: number;
  bankSize: number;
  questionsToShow: number;
  instructions: string;
  markingScheme: { id?: string; label?: string } | null;
  status: "draft" | "published" | "scheduled" | string;
  scheduledAt?: string | null;
  analytics: { totalAttempts: number; avgScore: number };
  createdAt: string;
  questions?: AdminQuizQuestion[];
};

export function fetchAdminQuizzes() {
  return api<{ quizzes: AdminQuiz[] }>("/api/admin/quizzes");
}

export function fetchAdminQuiz(id: string) {
  return api<{ quiz: AdminQuiz }>(`/api/admin/quizzes/${id}`);
}

export function createAdminQuiz(body: Omit<AdminQuiz, "id" | "analytics" | "createdAt" | "questionsCount"> & { questions: AdminQuizQuestion[] }) {
  return api<{ quiz: AdminQuiz }>("/api/admin/quizzes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminQuiz(id: string, body: Omit<AdminQuiz, "id" | "analytics" | "createdAt" | "questionsCount"> & { questions: AdminQuizQuestion[] }) {
  return api<{ quiz: AdminQuiz }>(`/api/admin/quizzes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminQuiz(id: string) {
  return api<{ ok: boolean }>(`/api/admin/quizzes/${id}`, { method: "DELETE" });
}

export function setAdminQuizStatus(id: string, body: { status: "draft" | "published" | "scheduled"; scheduledAt?: string | null }) {
  return api<{ quiz: AdminQuiz }>(`/api/admin/quizzes/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function startQuizSession(id: string) {
  return api<{ quiz: AdminQuiz; questions: AdminQuizQuestion[] }>(`/api/quizzes/${id}/start`, {
    method: "POST",
  });
}

export type AdminChapter = {
  id: string;
  subjectId: string;
  name: string;
  chapterNumber: number;
};

export type AdminSubject = {
  id: string;
  name: string;
  goalCategory: string;
  icon: string;
  color: string;
  totalPapers: number;
  totalQuizzes: number;
  totalChapters: number;
  chapters?: AdminChapter[];
  createdAt?: string;
};

export function fetchAdminSubjects() {
  return api<{ subjects: AdminSubject[] }>("/api/admin/subjects");
}

export function createAdminSubject(body: Pick<AdminSubject, "name" | "goalCategory" | "icon" | "color">) {
  return api<{ subject: AdminSubject }>("/api/admin/subjects", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminSubject(id: string, body: Pick<AdminSubject, "name" | "goalCategory" | "icon" | "color">) {
  return api<{ subject: AdminSubject }>(`/api/admin/subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminSubject(id: string) {
  return api<{ ok: boolean }>(`/api/admin/subjects/${id}`, { method: "DELETE" });
}

export function createAdminChapter(subjectId: string, body: { name: string; chapterNumber: number }) {
  return api<{ chapter: AdminChapter }>(`/api/admin/subjects/${subjectId}/chapters`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminChapter(id: string, body: { name: string; chapterNumber: number }) {
  return api<{ chapter: AdminChapter }>(`/api/admin/chapters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminChapter(id: string) {
  return api<{ ok: boolean }>(`/api/admin/chapters/${id}`, { method: "DELETE" });
}

export function bulkCreateAdminSubjects(body: {
  goalCategory?: string;
  subjects: { name: string; goalCategory?: string; icon?: string; color?: string }[];
}) {
  return api<{ created: AdminSubject[]; skipped: string[]; errors: { row: number; error: string }[] }>(
    "/api/admin/subjects/bulk",
    { method: "POST", body: JSON.stringify(body) },
  );
}

export function bulkCreateAdminChapters(body: {
  subjectId: string;
  chapters: { name: string; chapterNumber?: number }[];
}) {
  return api<{ created: AdminChapter[]; skipped: string[]; errors: { row: number; error: string }[] }>(
    "/api/admin/chapters/bulk",
    { method: "POST", body: JSON.stringify(body) },
  );
}

// ── Student content (published only, from DB) ─────────────────────────────────

export type StudentChapter = {
  id: string;
  name: string;
  chapterNumber: number;
};

export type StudentSubject = {
  id: string;
  name: string;
  goalCategory: string;
  icon: string;
  color: string;
  chapters?: StudentChapter[];
};

export type StudentPaper = {
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  year: number;
  type: string;
  medium: string;
  marks: number;
  durationMinutes: number;
  status: string;
  goalCategory: string;
  hasFile: boolean;
  fileName?: string | null;
  analytics: { views: number; downloads: number; bookmarks: number };
  createdAt?: string;
};

export type MarkingScheme = {
  correctMarks: number;
  wrongMarks: number;
  hasNegativeMarking: boolean;
  label: string;
};

export type StudentQuiz = {
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  chapter: string;
  goalCategory: string;
  difficulty: string;
  timeLimitMinutes: number;
  totalMarks: number;
  questionsCount: number;
  questionsToShow: number;
  bankSize: number;
  instructions: string;
  markingScheme: MarkingScheme;
  status: string;
  analytics: { totalAttempts: number; avgScore: number };
  createdAt?: string;
};

export type StudentQuizQuestion = {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
  marks: number;
};

export function fetchStudentSubjects(goalCategory?: string) {
  const qs = goalCategory ? `?goalCategory=${encodeURIComponent(goalCategory)}` : "";
  return api<{ subjects: StudentSubject[] }>(`/api/subjects${qs}`);
}

export type PublicCatalogStats = {
  students: number;
  papers: number;
  quizzes: number;
  attempts: number;
};

export function fetchPublicCatalog() {
  return api<{
    papers: StudentPaper[];
    quizzes: StudentQuiz[];
    subjects: StudentSubject[];
    stats: PublicCatalogStats;
  }>("/api/public/catalog");
}

export function fetchStudentPapers() {
  return api<{ papers: StudentPaper[] }>("/api/papers");
}

export function fetchStudentQuizzes() {
  return api<{ quizzes: StudentQuiz[] }>("/api/quizzes");
}

export function studentPaperFileUrl(id: string) {
  return `${API_BASE}/api/papers/${id}/file`;
}

export function startQuiz(id: string) {
  return api<{ quiz: StudentQuiz; questions: StudentQuizQuestion[] }>(`/api/quizzes/${id}/start`, {
    method: "POST",
  });
}

export type StudentQuizAttempt = {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  goalCategory: string;
  mode: "practice" | "exam";
  totalScore: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  negativeMarks: number;
  timeTakenSeconds: number;
  isCompleted: boolean;
  submittedAt: string;
  answers: [];
};

export function fetchMyAttempts() {
  return api<{ attempts: StudentQuizAttempt[] }>("/api/attempts");
}

export function submitQuizAttempt(quizId: string, body: Omit<StudentQuizAttempt, "answers" | "isCompleted" | "submittedAt"> & { submittedAt?: string }) {
  return api<{ attempt: StudentQuizAttempt; streak: number }>(`/api/quizzes/${quizId}/attempts`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type AppAnnouncement = {
  id: string;
  title: string;
  body: string;
  priority: "normal" | "important" | "urgent";
  targetGoals: string[];
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
};

export function fetchAdminAnnouncements() {
  return api<{ announcements: AppAnnouncement[] }>("/api/admin/announcements");
}

export function createAdminAnnouncement(body: {
  title: string;
  body: string;
  priority: AppAnnouncement["priority"];
  targetGoals: string[];
  expiresAt: string;
  isActive: boolean;
}) {
  return api<{ announcement: AppAnnouncement }>("/api/admin/announcements", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminAnnouncement(id: string, body: {
  title: string;
  body: string;
  priority: AppAnnouncement["priority"];
  targetGoals: string[];
  expiresAt: string;
  isActive: boolean;
}) {
  return api<{ announcement: AppAnnouncement }>(`/api/admin/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminAnnouncement(id: string) {
  return api<{ ok: boolean }>(`/api/admin/announcements/${id}`, { method: "DELETE" });
}

export function fetchStudentAnnouncements() {
  return api<{ announcements: AppAnnouncement[] }>("/api/announcements");
}


// ── Solution API ──────────────────────────────────────────────────────────────

export type SolutionMeta = {
  hasSolution: boolean;
  solutionId?: string;
  pricePaise?: number;
  priceRupees?: number;
  purchased?: boolean;
  razorpayKeyId?: string | null;
  demoMode?: boolean;
};

export type SolutionOrder = {
  orderId: string;
  pricePaise: number;
  priceRupees: number;
  purchaseId: string;
  demoMode: boolean;
};

export function fetchSolutionMeta(paperId: string) {
  return api<SolutionMeta>(`/api/papers/${paperId}/solution/meta`);
}

export function createSolutionOrder(paperId: string) {
  return api<SolutionOrder>(`/api/papers/${paperId}/solution/order`, { method: "POST" });
}

export function verifySolutionPayment(paperId: string, body: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  demo?: boolean;
}) {
  return api<{ success: boolean; message?: string }>(`/api/papers/${paperId}/solution/verify`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function studentSolutionFileUrl(paperId: string) {
  return `${API_BASE}/api/papers/${paperId}/solution/file`;
}

export function uploadAdminSolution(paperId: string, form: FormData) {
  return api<{ solution: any }>("/api/admin/papers/" + paperId + "/solution", {
    method: "POST",
    body: form,
  });
}

export function deleteAdminSolution(paperId: string) {
  return api<{ ok: boolean }>("/api/admin/papers/" + paperId + "/solution", {
    method: "DELETE",
  });
}
