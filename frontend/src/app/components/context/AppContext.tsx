import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Medium, QuizAttempt, Goal, GoalCategory, PaperType } from "../data/mockData";
import { GOAL_METADATA } from "../data/mockData";
import { fetchMe, getToken, setToken, ApiError, fetchStudentPapers, fetchStudentQuizzes, fetchStudentSubjects, fetchStudentAnnouncements, fetchMyAttempts, type StudentPaper, type StudentQuiz, type StudentQuizQuestion, type StudentSubject, type AppAnnouncement } from "../../lib/api";

// ── Global Search Filter (shared between StudentLayout modal → PapersList) ────

export interface GlobalSearchFilter {
  search: string;
  goalCategory: GoalCategory | "";
  stream: string;
  subject: string;
  paperType: PaperType | "";
  year: number | "";
}

export const EMPTY_GLOBAL_FILTER: GlobalSearchFilter = {
  search: "", goalCategory: "", stream: "", subject: "", paperType: "", year: "",
};

// ── View state machine ────────────────────────────────────────────────────────

export type View =
  | "landing" | "login" | "register" | "verify-otp" | "forgot-password" | "reset-password"
  | "onboarding"
  | "dashboard" | "papers" | "paper-detail" | "quizzes" | "quiz-detail"
  | "quiz-attempt" | "quiz-result" | "quiz-review" | "bookmarks" | "profile"
  | "admin-login" | "admin-dashboard" | "admin-papers" | "admin-paper-upload"
  | "admin-quizzes" | "admin-quiz-create" | "admin-quiz-edit" | "admin-quiz-preview"
  | "admin-users" | "admin-user-detail" | "admin-subjects" | "admin-announcements" | "admin-analytics";

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  goals: Goal[];
  currentGoalId: string;
  medium: Medium;
  streak: number;
  isAdmin: boolean;
  avatar?: string;
}

// ── Active Attempt ────────────────────────────────────────────────────────────

export interface ActiveAttempt {
  quizId: string;
  mode: "practice" | "exam";
  answers: Record<string, "A" | "B" | "C" | "D" | null>;
  flagged: string[];           // question IDs flagged for review (array for serialization)
  currentQuestionIndex: number;
  startedAt: string;           // ISO string for serialization
  timeRemainingSeconds?: number;
}

// ── Bookmark ──────────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  type: "paper" | "quiz";
  refId: string;
  createdAt: string;
}

// ── Context type ──────────────────────────────────────────────────────────────

interface AppContextType {
  view: View;
  setView: (v: View) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  currentGoal: Goal | null;
  setCurrentGoal: (goal: Goal) => void;
  addGoal: (goal: Goal) => void;
  removeGoal: (goalId: string) => void;
  bookmarks: Bookmark[];
  toggleBookmark: (type: "paper" | "quiz", refId: string) => void;
  isBookmarked: (type: "paper" | "quiz", refId: string) => boolean;
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
  selectedQuizId: string | null;
  setSelectedQuizId: (id: string | null) => void;
  currentAttempt: ActiveAttempt | null;
  setCurrentAttempt: (a: ActiveAttempt | null) => void;
  completedAttempts: QuizAttempt[];
  addAttempt: (a: QuizAttempt) => void;
  lastAttemptId: string | null;
  setLastAttemptId: (id: string | null) => void;
  authEmail: string;
  setAuthEmail: (e: string) => void;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  loginModalTab: "student" | "admin";
  setLoginModalTab: (t: "student" | "admin") => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  globalSearchFilter: GlobalSearchFilter;
  setGlobalSearchFilter: (f: GlobalSearchFilter) => void;
  studentSubjects: StudentSubject[];
  studentPapers: StudentPaper[];
  studentQuizzes: StudentQuiz[];
  studentAnnouncements: AppAnnouncement[];
  studentContentLoading: boolean;
  refreshStudentContent: () => Promise<void>;
  activeQuizSession: { quiz: StudentQuiz; questions: StudentQuizQuestion[] } | null;
  setActiveQuizSession: (session: { quiz: StudentQuiz; questions: StudentQuizQuestion[] } | null) => void;
}


// ── Seed goals for demo ───────────────────────────────────────────────────────

const seedGoal1: Goal = {
  id: "goal-demo-1",
  category: "board-12" as GoalCategory,
  label: "HSC Class 12 Board (English)",
  shortLabel: "HSC 12th",
  icon: "",
  color: GOAL_METADATA["board-12"].color,
  bgColor: GOAL_METADATA["board-12"].bgColor,
  textColor: GOAL_METADATA["board-12"].textColor,
  standard: "12",
  stream: "pcb",
  medium: "english",
  examDate: "2027-03-05",
  subjects: ["s9", "s10", "s11", "s14"],
};

const seedGoal2: Goal = {
  id: "goal-demo-2",
  category: "neet" as GoalCategory,
  label: "NEET UG 2027",
  shortLabel: "NEET 2027",
  icon: "",
  color: GOAL_METADATA["neet"].color,
  bgColor: GOAL_METADATA["neet"].bgColor,
  textColor: GOAL_METADATA["neet"].textColor,
  targetYear: 2027,
  examDate: "2027-05-03",
  subjects: ["sn1", "sn2", "sn3", "sn4"],
};

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<User | null>(null);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId]   = useState<string | null>(null);
  const [currentAttempt, setCurrentAttempt]   = useState<ActiveAttempt | null>(null);
  const [lastAttemptId, setLastAttemptId]     = useState<string | null>(null);
  const [authEmail, setAuthEmail]             = useState("");

  const [completedAttempts, setCompletedAttempts] = useState<QuizAttempt[]>([]);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<"student" | "admin">("student");
  const [globalSearchFilter, setGlobalSearchFilter] = useState<GlobalSearchFilter>(EMPTY_GLOBAL_FILTER);
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([]);
  const [studentPapers, setStudentPapers] = useState<StudentPaper[]>([]);
  const [studentQuizzes, setStudentQuizzes] = useState<StudentQuiz[]>([]);
  const [studentAnnouncements, setStudentAnnouncements] = useState<AppAnnouncement[]>([]);
  const [studentContentLoading, setStudentContentLoading] = useState(false);
  const [activeQuizSession, setActiveQuizSession] = useState<{ quiz: StudentQuiz; questions: StudentQuizQuestion[] } | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("parikshacrack_darkmode") === "true";
  });

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("parikshacrack_darkmode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // ── URL Hash Navigation Sync ─────────────────────────────────────────────


  const handleSetView = (v: View) => {
    setView(v);
    if (typeof window !== "undefined") {
      window.location.hash = v;
    }
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const initialHash = window.location.hash.replace("#", "") as View;
    if (initialHash) {
      setView(initialHash);
    }

    const onHashChange = () => {
      const h = window.location.hash.replace("#", "") as View;
      if (h) setView(h);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // ── LocalStorage Persistence ─────────────────────────────────────────────

  const [storageReady, setStorageReady] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    try {
      const savedBookmarks = localStorage.getItem("parikshacrack_bookmarks");
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    } catch (err) {
      console.warn("Could not parse saved storage context", err);
    }

    const token = getToken();
    if (!token) {
      try { localStorage.removeItem("parikshacrack_user"); } catch { /* ignore */ }
      setUser(null);
      setStorageReady(true);
      return;
    }

    try {
      const savedUser = localStorage.getItem("parikshacrack_user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (err) {
      console.warn("Could not parse saved user", err);
    }

    fetchMe()
      .then(({ user: next }) => {
        if (!cancelled) setUser(next as User);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err instanceof ApiError ? err.status : 0;
        // Only clear the session for real auth failures, not API restarts / offline.
        if (status === 401 || status === 403) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setStorageReady(true);
      });

    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!storageReady) return;
    try {
      if (user) localStorage.setItem("parikshacrack_user", JSON.stringify(user));
      else {
        localStorage.removeItem("parikshacrack_user");
        setToken(null);
      }
      localStorage.setItem("parikshacrack_bookmarks", JSON.stringify(bookmarks));
    } catch (err) {
      console.warn("Could not save context to storage", err);
    }
  }, [user, bookmarks, storageReady]);

  const refreshStudentContent = React.useCallback(async () => {
    if (!user || user.isAdmin) {
      setStudentSubjects([]);
      setStudentPapers([]);
      setStudentQuizzes([]);
      setStudentAnnouncements([]);
      setCompletedAttempts([]);
      return;
    }
    setStudentContentLoading(true);
    try {
      const [subjectsRes, papersRes, quizzesRes, announcementsRes, attemptsRes] = await Promise.all([
        fetchStudentSubjects(),
        fetchStudentPapers(),
        fetchStudentQuizzes(),
        fetchStudentAnnouncements(),
        fetchMyAttempts(),
      ]);
      setStudentSubjects(subjectsRes.subjects);
      setStudentPapers(papersRes.papers);
      setStudentQuizzes(quizzesRes.quizzes);
      setStudentAnnouncements(announcementsRes.announcements);
      setCompletedAttempts(attemptsRes.attempts.map((a) => ({
        ...a,
        goalCategory: a.goalCategory as GoalCategory,
        answers: a.answers ?? [],
      })));
    } catch (err) {
      console.warn("Could not load student content", err);
      setStudentSubjects([]);
      setStudentPapers([]);
      setStudentQuizzes([]);
      setCompletedAttempts([]);
      setStudentAnnouncements([]);
    } finally {
      setStudentContentLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (!storageReady || !user || user.isAdmin) return;
    void refreshStudentContent();
  }, [storageReady, user, refreshStudentContent]);

  // ── Derived current goal ─────────────────────────────────────────────────


  const currentGoal: Goal | null = user
    ? (user.goals?.find(g => g.id === user.currentGoalId) ?? user.goals?.[0] ?? null)
    : null;

  // ── Goal actions ─────────────────────────────────────────────────────────

  const setCurrentGoal = (goal: Goal) => {
    setUser(prev => prev ? { ...prev, currentGoalId: goal.id } : prev);
  };

  const addGoal = (goal: Goal) => {
    setUser(prev => {
      if (!prev) return prev;
      if (prev.goals.find(g => g.id === goal.id)) return prev;
      return { ...prev, goals: [...prev.goals, goal], currentGoalId: goal.id };
    });
  };

  const removeGoal = (goalId: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const remaining = prev.goals.filter(g => g.id !== goalId);
      if (remaining.length === 0) return prev;
      const newCurrentId = prev.currentGoalId === goalId ? remaining[0].id : prev.currentGoalId;
      return { ...prev, goals: remaining, currentGoalId: newCurrentId };
    });
  };

  // ── Bookmarks ────────────────────────────────────────────────────────────

  const toggleBookmark = (type: "paper" | "quiz", refId: string) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.type === type && b.refId === refId);
      if (exists) return prev.filter(b => !(b.type === type && b.refId === refId));
      return [...prev, { id: `bm${Date.now()}`, type, refId, createdAt: new Date().toISOString().split("T")[0] }];
    });
  };

  const isBookmarked = (type: "paper" | "quiz", refId: string) =>
    bookmarks.some(b => b.type === type && b.refId === refId);

  // ── Attempts ─────────────────────────────────────────────────────────────

  const addAttempt = (a: QuizAttempt) => {
    setCompletedAttempts(prev => [a, ...prev]);
    setLastAttemptId(a.id);
  };

  return (
    <AppContext.Provider value={{
      view, setView: handleSetView,
      user, setUser,
      currentGoal, setCurrentGoal, addGoal, removeGoal,

      bookmarks, toggleBookmark, isBookmarked,
      selectedPaperId, setSelectedPaperId,
      selectedQuizId, setSelectedQuizId,
      currentAttempt, setCurrentAttempt,
      completedAttempts, addAttempt,
      lastAttemptId, setLastAttemptId,
      authEmail, setAuthEmail,
      showLoginModal, setShowLoginModal,
      loginModalTab, setLoginModalTab,
      darkMode, toggleDarkMode,
      globalSearchFilter, setGlobalSearchFilter,
      studentSubjects, studentPapers, studentQuizzes, studentAnnouncements, studentContentLoading, refreshStudentContent,
      activeQuizSession, setActiveQuizSession,
    }}>
      {children}
    </AppContext.Provider>

  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

// ── Exported seed goals (used by OnboardingFlow + AuthPages) ─────────────────
export { seedGoal1, seedGoal2 };
