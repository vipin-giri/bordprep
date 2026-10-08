// ─────────────────────────────────────────────────────────────────────────────
// ParikshaCrack v2.0 — mockData.ts
// Single source of truth for all types, interfaces, and mock data
// ─────────────────────────────────────────────────────────────────────────────

// ── Primitive Types ───────────────────────────────────────────────────────────

export type Standard = "8" | "9" | "10" | "11" | "12";
export type Medium = "english" | "semi-english" | "marathi";
export type Stream = "pcb" | "pcm" | "pcbm" | "commerce" | "arts" | "general";
export type Difficulty = "easy" | "medium" | "hard" | "mixed";
export type QuizStatus = "draft" | "published" | "scheduled";
export type QuestionType = "mcq" | "numerical";

export type GoalCategory =
  | "board-8"
  | "board-9"
  | "board-10"
  | "board-11"
  | "board-12"
  | "neet"
  | "jee-mains"
  | "jee-advanced"
  | "mht-cet-pcb"
  | "mht-cet-pcm";

export type PaperType =
  | "unit-test"
  | "semester"
  | "prelims"
  | "board"
  | "model"
  | "practice"
  | "pyq"
  | "mock-test"
  | "chapter-wise"
  | "subject-wise"
  | "minor-test"
  | "major-test";

export type AnnouncementPriority = "normal" | "important" | "urgent";

// ── Marking Scheme ────────────────────────────────────────────────────────────

export interface MarkingScheme {
  id: string;
  label: string;
  correctMarks: number;
  wrongMarks: number;        // negative value for negative marking (e.g. -1)
  unattemptedMarks: number;  // always 0
  hasNegativeMarking: boolean;
}

export const MARKING_SCHEMES: Record<string, MarkingScheme> = {
  BOARD:         { id: "board",       label: "+1 / 0 (Board)",          correctMarks: 1,  wrongMarks: 0,  unattemptedMarks: 0, hasNegativeMarking: false },
  NEET:          { id: "neet",        label: "+4 / −1 (NEET)",          correctMarks: 4,  wrongMarks: -1, unattemptedMarks: 0, hasNegativeMarking: true  },
  JEE_MCQ:       { id: "jee-mcq",     label: "+4 / −1 (JEE MCQ)",       correctMarks: 4,  wrongMarks: -1, unattemptedMarks: 0, hasNegativeMarking: true  },
  JEE_NUMERICAL: { id: "jee-num",     label: "+4 / −1 (JEE Numerical)", correctMarks: 4,  wrongMarks: -1, unattemptedMarks: 0, hasNegativeMarking: true  },
  JEE_ADV_MCQ:   { id: "jee-adv-mcq",label: "+3 / −1 (JEE Adv MCQ)",   correctMarks: 3,  wrongMarks: -1, unattemptedMarks: 0, hasNegativeMarking: true  },
  CET_PCM_MATH:  { id: "cet-pcm-m",  label: "+2 / 0 (CET PCM Maths)",  correctMarks: 2,  wrongMarks: 0,  unattemptedMarks: 0, hasNegativeMarking: false },
  CET_PCB:       { id: "cet-pcb",    label: "+1 / 0 (CET PCB)",         correctMarks: 1,  wrongMarks: 0,  unattemptedMarks: 0, hasNegativeMarking: false },
  CET_PCM:       { id: "cet-pcm",    label: "+1 / 0 (CET PCM)",         correctMarks: 1,  wrongMarks: 0,  unattemptedMarks: 0, hasNegativeMarking: false },
};

/** Evaluates quiz score safely accounting for positive/negative marking rules */
export function evaluateQuizScore(
  correctCount: number,
  wrongCount: number,
  unattemptedCount: number,
  scheme: MarkingScheme
) {
  const penaltyPerWrong = Math.abs(scheme.wrongMarks);
  const positiveScore = correctCount * scheme.correctMarks;
  const negativePenalty = scheme.hasNegativeMarking ? wrongCount * penaltyPerWrong : 0;
  const totalScore = Math.max(0, positiveScore - negativePenalty);
  const maxPossible = (correctCount + wrongCount + unattemptedCount) * scheme.correctMarks;
  const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  return {
    positiveScore,
    negativePenalty,
    totalScore,
    maxPossible,
    percentage,
  };
}


// ── Goal ─────────────────────────────────────────────────────────────────────

export interface Goal {
  id: string;
  category: GoalCategory;
  label: string;           // "NEET UG 2027" or "12th HSC Board (English)"
  shortLabel: string;      // "NEET 2027" or "HSC 12th"
  icon: string;            // emoji
  color: string;           // hex — primary accent color
  bgColor: string;         // light bg for cards
  textColor: string;       // text on light bg
  // Board-specific
  standard?: Standard;
  stream?: Stream;
  medium?: Medium;
  // Competitive-specific
  targetYear?: number;
  examDate?: string;       // ISO date string
  // Subjects this goal tracks
  subjects: string[];
}

// ── Pre-built Goal templates students can select ───────────────────────────

export const GOAL_METADATA: Record<GoalCategory, { label: string; icon: string; color: string; bgColor: string; textColor: string }> = {
  "board-8":       { label: "Class 8 Board",       icon: "", color: "#3B82F6", bgColor: "#DBEAFE", textColor: "#1D4ED8" },
  "board-9":       { label: "Class 9 Board",       icon: "", color: "#3B82F6", bgColor: "#DBEAFE", textColor: "#1D4ED8" },
  "board-10":      { label: "SSC Class 10",        icon: "", color: "#2563EB", bgColor: "#DBEAFE", textColor: "#1E40AF" },
  "board-11":      { label: "Class 11 Board",      icon: "", color: "#1D4ED8", bgColor: "#EFF6FF", textColor: "#1E3A8A" },
  "board-12":      { label: "HSC Class 12",        icon: "", color: "#1E3A8A", bgColor: "#EFF6FF", textColor: "#1E3A8A" },
  "neet":          { label: "NEET UG",             icon: "", color: "#16A34A", bgColor: "#DCFCE7", textColor: "#15803D" },
  "jee-mains":     { label: "JEE Mains",           icon: "", color: "#7C3AED", bgColor: "#EDE9FE", textColor: "#6D28D9" },
  "jee-advanced":  { label: "JEE Advanced",        icon: "", color: "#4F46E5", bgColor: "#E0E7FF", textColor: "#4338CA" },
  "mht-cet-pcb":   { label: "MHT-CET PCB",        icon: "", color: "#0891B2", bgColor: "#CFFAFE", textColor: "#0E7490" },
  "mht-cet-pcm":   { label: "MHT-CET PCM",        icon: "", color: "#0284C7", bgColor: "#E0F2FE", textColor: "#0369A1" },
};

// ── Subject ──────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
  goalCategory: GoalCategory;
  standard?: Standard;
  stream?: Stream;
  icon: string;
  color: string;
  chaptersCount: number;
}

// ── Chapter ──────────────────────────────────────────────────────────────────

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  number: number;
}

// ── Paper ─────────────────────────────────────────────────────────────────────

export interface Paper {
  id: string;
  title: string;
  goalCategory: GoalCategory;
  standard?: Standard;
  stream?: Stream;
  subject: string;
  subjectId: string;
  chapter?: string;
  year: number;
  type: PaperType;
  medium?: Medium;
  marks: number;
  durationMinutes: number;
  status: "draft" | "published";
  // Competitive exam specific
  examName?: string;
  session?: "january" | "april";
  shift?: "shift-1" | "shift-2";
  paperNumber?: "paper-1" | "paper-2" | "both";
  // PDF link (mock)
  pdfUrl?: string;
  analytics: { views: number; downloads: number; bookmarks: number };
  createdAt: string;
}

// ── Question ──────────────────────────────────────────────────────────────────

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: "A" | "B" | "C" | "D";
  numericalAnswer?: number;
  numericalTolerance?: number;
  explanation: string;
  marks: number;
  difficulty?: Difficulty;
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export interface Quiz {
  id: string;
  title: string;
  goalCategory: GoalCategory;
  standard?: Standard;
  stream?: Stream;
  subject: string;
  subjectId: string;
  chapter: string;
  difficulty: Difficulty;
  timeLimitMinutes: number;
  totalMarks: number;
  questionsCount: number;
  markingScheme: MarkingScheme;
  instructions: string;
  status: QuizStatus;
  analytics: { totalAttempts: number; avgScore: number };
  createdAt: string;
  questions: Question[];
}

// ── Announcement ──────────────────────────────────────────────────────────────

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  targetGoals: (GoalCategory | "all")[];
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

// ── Quiz Attempt ──────────────────────────────────────────────────────────────

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  goalCategory: GoalCategory;
  mode: "practice" | "exam";
  totalScore: number;
  maxScore: number;
  percentage: number;
  percentile?: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  negativeMarks: number;
  timeTakenSeconds: number;
  isCompleted: boolean;
  submittedAt: string;
  answers: {
    questionId: string;
    selectedOption: "A" | "B" | "C" | "D" | null;
    isCorrect: boolean;
    marksAwarded: number;
  }[];
}

// ── Student (Admin view) ──────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  email: string;
  goalCategories: GoalCategory[];
  goalLabels: string[];
  medium: Medium;
  streak: number;
  isBlocked: boolean;
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt: string;
  totalAttempts: number;
  avgScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

// ── Subjects ──────────────────────────────────────────────────────────────────

export const subjects: Subject[] = [
  // Class 8
  { id: "s8-1",  name: "Mathematics",               goalCategory: "board-8",  standard: "8",  stream: "general", icon: "calculator", color: "#3B82F6", chaptersCount: 8 },
  { id: "s8-2",  name: "Science & Technology",      goalCategory: "board-8",  standard: "8",  stream: "general", icon: "flask", color: "#8B5CF6", chaptersCount: 9 },
  { id: "s8-3",  name: "English",                   goalCategory: "board-8",  standard: "8",  stream: "general", icon: "book", color: "#F59E0B", chaptersCount: 10 },
  { id: "s8-4",  name: "Marathi",                   goalCategory: "board-8",  standard: "8",  stream: "general", icon: "booktext", color: "#EF4444", chaptersCount: 9 },
  { id: "s8-5",  name: "History & Political Science",goalCategory: "board-8",  standard: "8",  stream: "general", icon: "landmark", color: "#6366F1", chaptersCount: 7 },
  { id: "s8-6",  name: "Geography",                 goalCategory: "board-8",  standard: "8",  stream: "general", icon: "map", color: "#14B8A6", chaptersCount: 6 },

  // Class 9
  { id: "s9-1",  name: "Mathematics",               goalCategory: "board-9",  standard: "9",  stream: "general", icon: "calculator", color: "#3B82F6", chaptersCount: 9 },
  { id: "s9-2",  name: "Science & Technology",      goalCategory: "board-9",  standard: "9",  stream: "general", icon: "flask", color: "#8B5CF6", chaptersCount: 10 },
  { id: "s9-3",  name: "English",                   goalCategory: "board-9",  standard: "9",  stream: "general", icon: "book", color: "#F59E0B", chaptersCount: 11 },
  { id: "s9-4",  name: "Marathi",                   goalCategory: "board-9",  standard: "9",  stream: "general", icon: "booktext", color: "#EF4444", chaptersCount: 10 },
  { id: "s9-5",  name: "History & Political Science",goalCategory: "board-9",  standard: "9",  stream: "general", icon: "landmark", color: "#6366F1", chaptersCount: 9 },
  { id: "s9-6",  name: "Geography",                 goalCategory: "board-9",  standard: "9",  stream: "general", icon: "map", color: "#14B8A6", chaptersCount: 7 },

  // Class 10 (SSC)
  { id: "s1",   name: "Mathematics",                goalCategory: "board-10", standard: "10", stream: "general", icon: "calculator", color: "#3B82F6", chaptersCount: 10 },
  { id: "s2",   name: "Science & Technology Pt.1",  goalCategory: "board-10", standard: "10", stream: "general", icon: "flask", color: "#8B5CF6", chaptersCount: 9 },
  { id: "s3",   name: "Science & Technology Pt.2",  goalCategory: "board-10", standard: "10", stream: "general", icon: "flask", color: "#10B981", chaptersCount: 8 },
  { id: "s4",   name: "English",                    goalCategory: "board-10", standard: "10", stream: "general", icon: "book", color: "#F59E0B", chaptersCount: 12 },
  { id: "s5",   name: "Marathi",                    goalCategory: "board-10", standard: "10", stream: "general", icon: "booktext", color: "#EF4444", chaptersCount: 11 },
  { id: "s6",   name: "History & Political Science", goalCategory: "board-10", standard: "10", stream: "general", icon: "landmark", color: "#6366F1", chaptersCount: 9 },
  { id: "s7",   name: "Geography",                  goalCategory: "board-10", standard: "10", stream: "general", icon: "map", color: "#14B8A6", chaptersCount: 7 },
  { id: "s10b", name: "Hindi",                      goalCategory: "board-10", standard: "10", stream: "general", icon: "booktext", color: "#F97316", chaptersCount: 10 },

  // Class 11 — Science PCB
  { id: "s11-phy", name: "Physics",                 goalCategory: "board-11", standard: "11", stream: "pcb", icon: "atom", color: "#3B82F6", chaptersCount: 14 },
  { id: "s11-che", name: "Chemistry",               goalCategory: "board-11", standard: "11", stream: "pcb", icon: "flask", color: "#8B5CF6", chaptersCount: 16 },
  { id: "s11-bio", name: "Biology",                 goalCategory: "board-11", standard: "11", stream: "pcb", icon: "dna", color: "#10B981", chaptersCount: 16 },
  { id: "s11-eng", name: "English",                 goalCategory: "board-11", standard: "11", stream: "pcb", icon: "book", color: "#EF4444", chaptersCount: 8 },

  // Class 11 — Science PCM
  { id: "s11-mat", name: "Mathematics & Statistics", goalCategory: "board-11", standard: "11", stream: "pcm", icon: "sigma", color: "#6366F1", chaptersCount: 12 },

  // Class 12 (HSC)
  { id: "s11",  name: "Biology",                    goalCategory: "board-12", standard: "12", stream: "pcb", icon: "dna", color: "#10B981", chaptersCount: 16 },
  { id: "s12",  name: "Mathematics & Statistics",   goalCategory: "board-12", standard: "12", stream: "pcm", icon: "sigma", color: "#6366F1", chaptersCount: 12 },
  { id: "s13",  name: "Economics",                  goalCategory: "board-12", standard: "12", stream: "commerce", icon: "chart", color: "#F59E0B", chaptersCount: 10 },
  { id: "s14",  name: "English",                    goalCategory: "board-12", standard: "12", stream: "pcb", icon: "book", color: "#EF4444", chaptersCount: 8 },

  // NEET UG
  { id: "sn1",  name: "Physics",                    goalCategory: "neet", icon: "atom", color: "#3B82F6", chaptersCount: 30 },
  { id: "sn2",  name: "Chemistry",                  goalCategory: "neet", icon: "flask", color: "#8B5CF6", chaptersCount: 30 },
  { id: "sn3",  name: "Botany",                     goalCategory: "neet", icon: "dna", color: "#16A34A", chaptersCount: 20 },
  { id: "sn4",  name: "Zoology",                    goalCategory: "neet", icon: "microscope", color: "#22C55E", chaptersCount: 16 },

  // JEE Mains
  { id: "sj1",  name: "Physics",                    goalCategory: "jee-mains", icon: "atom", color: "#7C3AED", chaptersCount: 28 },
  { id: "sj2",  name: "Chemistry",                  goalCategory: "jee-mains", icon: "flask", color: "#8B5CF6", chaptersCount: 30 },
  { id: "sj3",  name: "Mathematics",                goalCategory: "jee-mains", icon: "calculator", color: "#6366F1", chaptersCount: 26 },

  // JEE Advanced
  { id: "sja1", name: "Physics",                    goalCategory: "jee-advanced", icon: "atom", color: "#4F46E5", chaptersCount: 28 },
  { id: "sja2", name: "Chemistry",                  goalCategory: "jee-advanced", icon: "flask", color: "#4338CA", chaptersCount: 30 },
  { id: "sja3", name: "Mathematics",                goalCategory: "jee-advanced", icon: "calculator", color: "#3730A3", chaptersCount: 26 },

  // MHT-CET PCB
  { id: "scb1", name: "Physics",                    goalCategory: "mht-cet-pcb", icon: "atom", color: "#0891B2", chaptersCount: 20 },
  { id: "scb2", name: "Chemistry",                  goalCategory: "mht-cet-pcb", icon: "flask", color: "#0E7490", chaptersCount: 20 },
  { id: "scb3", name: "Biology",                    goalCategory: "mht-cet-pcb", icon: "dna", color: "#0891B2", chaptersCount: 30 },

  // MHT-CET PCM
  { id: "scm1", name: "Physics",                    goalCategory: "mht-cet-pcm", icon: "atom", color: "#0284C7", chaptersCount: 20 },
  { id: "scm2", name: "Chemistry",                  goalCategory: "mht-cet-pcm", icon: "flask", color: "#0369A1", chaptersCount: 20 },
  { id: "scm3", name: "Mathematics",                goalCategory: "mht-cet-pcm", icon: "calculator", color: "#0284C7", chaptersCount: 20 },
];

// ── Chapters ──────────────────────────────────────────────────────────────────

export const chapters: Chapter[] = [
  // Class 10 Math
  { id: "c1",  name: "Real Numbers",           subjectId: "s1",  number: 1 },
  { id: "c2",  name: "Polynomials",            subjectId: "s1",  number: 2 },
  { id: "c3",  name: "Arithmetic Progression", subjectId: "s1",  number: 3 },
  { id: "c4",  name: "Linear Equations",       subjectId: "s1",  number: 4 },
  { id: "c5",  name: "Quadratic Equations",    subjectId: "s1",  number: 5 },
  { id: "c6",  name: "Trigonometry",           subjectId: "s1",  number: 6 },
  { id: "c7",  name: "Statistics",             subjectId: "s1",  number: 7 },
  // Class 10 Science Pt.1
  { id: "c8",  name: "Chemical Reactions",     subjectId: "s2",  number: 1 },
  { id: "c9",  name: "Acids, Bases and Salts", subjectId: "s2",  number: 2 },
  { id: "c10", name: "Metals and Non-Metals",  subjectId: "s2",  number: 3 },
  // Class 12 Physics
  { id: "c13", name: "Rotational Motion",      subjectId: "s9",  number: 1 },
  { id: "c14", name: "Mechanical Properties",  subjectId: "s9",  number: 2 },
  { id: "c15", name: "Kinetic Theory",         subjectId: "s9",  number: 3 },
  { id: "c16", name: "Thermodynamics",         subjectId: "s9",  number: 4 },
  { id: "c17", name: "Electrostatics",         subjectId: "s9",  number: 5 },
  // NEET Physics
  { id: "cn1", name: "Physical World",              subjectId: "sn1", number: 1 },
  { id: "cn2", name: "Units and Measurements",      subjectId: "sn1", number: 2 },
  { id: "cn3", name: "Motion in a Straight Line",   subjectId: "sn1", number: 3 },
  { id: "cn4", name: "Motion in a Plane",           subjectId: "sn1", number: 4 },
  { id: "cn5", name: "Laws of Motion",              subjectId: "sn1", number: 5 },
  { id: "cn6", name: "Work, Energy and Power",      subjectId: "sn1", number: 6 },
  { id: "cn7", name: "System of Particles",         subjectId: "sn1", number: 7 },
  // NEET Chemistry
  { id: "cn8", name: "Some Basic Concepts",         subjectId: "sn2", number: 1 },
  { id: "cn9", name: "Atomic Structure",            subjectId: "sn2", number: 2 },
  { id: "cn10","name": "Chemical Bonding",          subjectId: "sn2", number: 3 },
  { id: "cn11","name": "Equilibrium",               subjectId: "sn2", number: 4 },
  // NEET Botany
  { id: "cn12","name": "Biological Classification", subjectId: "sn3", number: 1 },
  { id: "cn13","name": "Plant Kingdom",             subjectId: "sn3", number: 2 },
  { id: "cn14","name": "Photosynthesis",            subjectId: "sn3", number: 3 },
  // NEET Zoology
  { id: "cn15","name": "Animal Kingdom",            subjectId: "sn4", number: 1 },
  { id: "cn16","name": "Human Physiology",          subjectId: "sn4", number: 2 },
  // JEE Mains Math
  { id: "cj1", name: "Sets and Relations",          subjectId: "sj3", number: 1 },
  { id: "cj2", name: "Complex Numbers",             subjectId: "sj3", number: 2 },
  { id: "cj3", name: "Matrices and Determinants",   subjectId: "sj3", number: 3 },
  { id: "cj4", name: "Limits and Continuity",       subjectId: "sj3", number: 4 },
  { id: "cj5", name: "Integral Calculus",           subjectId: "sj3", number: 5 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Papers
// ─────────────────────────────────────────────────────────────────────────────

export const papers: Paper[] = [
  // ── Class 10 SSC ────────────────────────────────────────────────────────────
  { id: "p1",  title: "SSC Mathematics March 2024 Board Paper",     goalCategory: "board-10", standard: "10", subject: "Mathematics",              subjectId: "s1",  year: 2024, type: "board",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 3240, downloads: 1820, bookmarks: 456 }, createdAt: "2024-05-01" },
  { id: "p2",  title: "SSC Mathematics March 2023 Board Paper",     goalCategory: "board-10", standard: "10", subject: "Mathematics",              subjectId: "s1",  year: 2023, type: "board",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 4100, downloads: 2300, bookmarks: 612 }, createdAt: "2023-05-01" },
  { id: "p3",  title: "SSC Science Pt.1 March 2024",                goalCategory: "board-10", standard: "10", subject: "Science & Technology Pt.1",subjectId: "s2",  year: 2024, type: "board",     medium: "semi-english", marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 2890, downloads: 1560, bookmarks: 398 }, createdAt: "2024-05-02" },
  { id: "p4",  title: "SSC Science Pt.1 Model Paper 2024",          goalCategory: "board-10", standard: "10", subject: "Science & Technology Pt.1",subjectId: "s2",  year: 2024, type: "model",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 1560, downloads: 890,  bookmarks: 210 }, createdAt: "2024-01-15" },
  { id: "p5",  title: "SSC Mathematics Practice Set 1",             goalCategory: "board-10", standard: "10", subject: "Mathematics",              subjectId: "s1",  year: 2024, type: "practice",  medium: "english",      marks: 40,  durationMinutes: 90,  status: "published", analytics: { views: 987,  downloads: 540,  bookmarks: 132 }, createdAt: "2024-02-10" },
  { id: "p6",  title: "SSC English March 2024",                     goalCategory: "board-10", standard: "10", subject: "English",                  subjectId: "s4",  year: 2024, type: "board",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 2100, downloads: 1200, bookmarks: 320 }, createdAt: "2024-05-03" },
  { id: "p7",  title: "SSC History March 2023",                     goalCategory: "board-10", standard: "10", subject: "History & Political Science",subjectId: "s6",  year: 2023, type: "board",     medium: "semi-english", marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 1800, downloads: 980,  bookmarks: 245 }, createdAt: "2023-05-05" },
  { id: "p8",  title: "SSC Mathematics — Unit Test Ch. 1–2",        goalCategory: "board-10", standard: "10", subject: "Mathematics",              subjectId: "s1",  year: 2024, type: "unit-test", medium: "english",      marks: 20,  durationMinutes: 45,  status: "published", analytics: { views: 780,  downloads: 420,  bookmarks: 98  }, createdAt: "2024-07-15" },
  { id: "p8b", title: "SSC Mathematics Prelims Paper 2024",         goalCategory: "board-10", standard: "10", subject: "Mathematics",              subjectId: "s1",  year: 2024, type: "prelims",   medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 2200, downloads: 1100, bookmarks: 310 }, createdAt: "2024-01-20" },

  // ── Class 12 HSC ────────────────────────────────────────────────────────────
  { id: "p9",  title: "HSC Physics March 2024 Board Paper",         goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Physics",                subjectId: "s9",  year: 2024, type: "board",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 5100, downloads: 2980, bookmarks: 720 }, createdAt: "2024-05-10" },
  { id: "p10", title: "HSC Chemistry March 2024 Board Paper",       goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Chemistry",              subjectId: "s10", year: 2024, type: "board",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 4800, downloads: 2750, bookmarks: 680 }, createdAt: "2024-05-10" },
  { id: "p11", title: "HSC Physics March 2023",                     goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Physics",                subjectId: "s9",  year: 2023, type: "board",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 5800, downloads: 3400, bookmarks: 890 }, createdAt: "2023-05-10" },
  { id: "p12", title: "HSC Biology March 2024",                     goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Biology",                subjectId: "s11", year: 2024, type: "board",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 3900, downloads: 2100, bookmarks: 510 }, createdAt: "2024-05-11" },
  { id: "p13", title: "HSC Mathematics March 2024",                 goalCategory: "board-12", standard: "12", stream: "pcm", subject: "Mathematics & Statistics",subjectId: "s12", year: 2024, type: "board",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 4200, downloads: 2400, bookmarks: 590 }, createdAt: "2024-05-12" },
  { id: "p14", title: "HSC Chemistry Model Paper 2024",             goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Chemistry",              subjectId: "s10", year: 2024, type: "model",     medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 2100, downloads: 1100, bookmarks: 280 }, createdAt: "2024-01-20" },
  { id: "p14b",title: "HSC Physics Prelims Paper 2024",             goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Physics",                subjectId: "s9",  year: 2024, type: "prelims",   medium: "english",      marks: 80,  durationMinutes: 180, status: "published", analytics: { views: 3100, downloads: 1600, bookmarks: 410 }, createdAt: "2024-01-25" },
  { id: "p14c",title: "HSC Physics — Unit Test Electrostatics",     goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Physics",                subjectId: "s9",  year: 2024, type: "unit-test", medium: "english",      marks: 25,  durationMinutes: 60,  status: "published", analytics: { views: 890,  downloads: 450,  bookmarks: 120 }, createdAt: "2024-09-10" },

  // ── NEET UG ─────────────────────────────────────────────────────────────────
  { id: "pn1", title: "NEET UG 2024 — Official PYQ (All Subjects)", goalCategory: "neet", subject: "All Subjects",  subjectId: "sn1", year: 2024, type: "pyq",       marks: 720, durationMinutes: 200, status: "published", examName: "NEET UG 2024",       analytics: { views: 12450, downloads: 6800, bookmarks: 1820 }, createdAt: "2024-06-01" },
  { id: "pn2", title: "NEET UG 2023 — Official PYQ (All Subjects)", goalCategory: "neet", subject: "All Subjects",  subjectId: "sn1", year: 2023, type: "pyq",       marks: 720, durationMinutes: 200, status: "published", examName: "NEET UG 2023",       analytics: { views: 15200, downloads: 8900, bookmarks: 2400 }, createdAt: "2023-06-01" },
  { id: "pn3", title: "NEET UG 2022 — Official PYQ (All Subjects)", goalCategory: "neet", subject: "All Subjects",  subjectId: "sn1", year: 2022, type: "pyq",       marks: 720, durationMinutes: 200, status: "published", examName: "NEET UG 2022",       analytics: { views: 13800, downloads: 7600, bookmarks: 2100 }, createdAt: "2022-06-01" },
  { id: "pn4", title: "NEET 2024 — Physics PYQ",                    goalCategory: "neet", subject: "Physics",       subjectId: "sn1", year: 2024, type: "subject-wise",marks: 180, durationMinutes: 60,  status: "published",              analytics: { views: 5400,  downloads: 2980, bookmarks: 780  }, createdAt: "2024-06-05" },
  { id: "pn5", title: "NEET 2024 — Chemistry PYQ",                  goalCategory: "neet", subject: "Chemistry",     subjectId: "sn2", year: 2024, type: "subject-wise",marks: 180, durationMinutes: 60,  status: "published",              analytics: { views: 4900,  downloads: 2600, bookmarks: 650  }, createdAt: "2024-06-05" },
  { id: "pn6", title: "NEET 2024 — Biology PYQ (Botany + Zoology)", goalCategory: "neet", subject: "Biology",       subjectId: "sn3", year: 2024, type: "subject-wise",marks: 360, durationMinutes: 90,  status: "published",              analytics: { views: 7200,  downloads: 4100, bookmarks: 1100 }, createdAt: "2024-06-05" },
  { id: "pn7", title: "NEET Full Mock Test 1 — 2025 Pattern",       goalCategory: "neet", subject: "All Subjects",  subjectId: "sn1", year: 2025, type: "mock-test",  marks: 720, durationMinutes: 200, status: "published",              analytics: { views: 6800,  downloads: 3900, bookmarks: 1050 }, createdAt: "2025-01-10" },

  // ── JEE Mains ────────────────────────────────────────────────────────────────
  { id: "pj1", title: "JEE Mains Jan 2024 — Shift 1 (All Subjects)",goalCategory: "jee-mains", subject: "All Subjects", subjectId: "sj1", year: 2024, type: "pyq", marks: 300, durationMinutes: 180, status: "published", examName: "JEE Mains 2024", session: "january", shift: "shift-1", analytics: { views: 9800,  downloads: 5200, bookmarks: 1400 }, createdAt: "2024-01-30" },
  { id: "pj2", title: "JEE Mains Apr 2024 — Shift 2 (All Subjects)",goalCategory: "jee-mains", subject: "All Subjects", subjectId: "sj1", year: 2024, type: "pyq", marks: 300, durationMinutes: 180, status: "published", examName: "JEE Mains 2024", session: "april",   shift: "shift-2", analytics: { views: 8600,  downloads: 4700, bookmarks: 1250 }, createdAt: "2024-04-10" },
  { id: "pj3", title: "JEE Mains Jan 2023 — Shift 1",               goalCategory: "jee-mains", subject: "All Subjects", subjectId: "sj1", year: 2023, type: "pyq", marks: 300, durationMinutes: 180, status: "published", examName: "JEE Mains 2023", session: "january", shift: "shift-1", analytics: { views: 11200, downloads: 6400, bookmarks: 1700 }, createdAt: "2023-01-30" },
  { id: "pj4", title: "JEE Mains Full Mock Test 1 — 2025 Pattern",  goalCategory: "jee-mains", subject: "All Subjects", subjectId: "sj1", year: 2025, type: "mock-test", marks: 300, durationMinutes: 180, status: "published", analytics: { views: 5600, downloads: 3100, bookmarks: 820 }, createdAt: "2025-01-15" },

  // ── JEE Advanced ─────────────────────────────────────────────────────────────
  { id: "pja1",title: "JEE Advanced 2024 — Paper 1",                goalCategory: "jee-advanced", subject: "All Subjects", subjectId: "sja1", year: 2024, type: "pyq",       marks: 180, durationMinutes: 180, status: "published", examName: "JEE Advanced 2024", paperNumber: "paper-1", analytics: { views: 7200, downloads: 4200, bookmarks: 1100 }, createdAt: "2024-05-30" },
  { id: "pja2",title: "JEE Advanced 2024 — Paper 2",                goalCategory: "jee-advanced", subject: "All Subjects", subjectId: "sja1", year: 2024, type: "pyq",       marks: 180, durationMinutes: 180, status: "published", examName: "JEE Advanced 2024", paperNumber: "paper-2", analytics: { views: 6900, downloads: 3900, bookmarks: 1050 }, createdAt: "2024-05-30" },

  // ── MHT-CET PCB ─────────────────────────────────────────────────────────────
  { id: "pcb1",title: "MHT-CET 2024 — PCB Group PYQ",               goalCategory: "mht-cet-pcb", subject: "All Subjects", subjectId: "scb1", year: 2024, type: "pyq",      marks: 200, durationMinutes: 180, status: "published", examName: "MHT-CET 2024", analytics: { views: 6400, downloads: 3600, bookmarks: 980 }, createdAt: "2024-05-20" },
  { id: "pcb2",title: "MHT-CET 2023 — PCB Group PYQ",               goalCategory: "mht-cet-pcb", subject: "All Subjects", subjectId: "scb1", year: 2023, type: "pyq",      marks: 200, durationMinutes: 180, status: "published", examName: "MHT-CET 2023", analytics: { views: 7200, downloads: 4100, bookmarks: 1100 }, createdAt: "2023-05-20" },

  // ── MHT-CET PCM ─────────────────────────────────────────────────────────────
  { id: "pcm1",title: "MHT-CET 2024 — PCM Group PYQ",               goalCategory: "mht-cet-pcm", subject: "All Subjects", subjectId: "scm1", year: 2024, type: "pyq",      marks: 200, durationMinutes: 180, status: "published", examName: "MHT-CET 2024", analytics: { views: 5800, downloads: 3200, bookmarks: 860 }, createdAt: "2024-05-20" },
  { id: "pcm2",title: "MHT-CET 2023 — PCM Group PYQ",               goalCategory: "mht-cet-pcm", subject: "All Subjects", subjectId: "scm1", year: 2023, type: "pyq",      marks: 200, durationMinutes: 180, status: "published", examName: "MHT-CET 2023", analytics: { views: 6600, downloads: 3700, bookmarks: 1000 }, createdAt: "2023-05-20" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Question Banks
// ─────────────────────────────────────────────────────────────────────────────

const mathQuestions: Question[] = [
  { id: "q1",  type: "mcq", text: "The sum of first n natural numbers is:", optionA: "n(n+1)/2", optionB: "n(n-1)/2", optionC: "n²/2", optionD: "n(n+1)", correctOption: "A", explanation: "Sum of first n natural numbers = n(n+1)/2. This is a standard arithmetic series formula.", marks: 1, difficulty: "easy" },
  { id: "q2",  type: "mcq", text: "Which of the following is an irrational number?", optionA: "√4", optionB: "√9", optionC: "√7", optionD: "√16", correctOption: "C", explanation: "√7 ≈ 2.6457... is non-terminating and non-repeating, hence irrational. Others are perfect squares.", marks: 1, difficulty: "easy" },
  { id: "q3",  type: "mcq", text: "The discriminant of quadratic equation 2x² - 5x + 3 = 0 is:", optionA: "25", optionB: "1", optionC: "49", optionD: "-1", correctOption: "B", explanation: "D = b² - 4ac = (-5)² - 4(2)(3) = 25 - 24 = 1", marks: 1, difficulty: "medium" },
  { id: "q4",  type: "mcq", text: "If HCF(a, b) = 4 and LCM(a, b) = 36, then a × b = ?", optionA: "40", optionB: "144", optionC: "9", optionD: "32", correctOption: "B", explanation: "HCF × LCM = a × b ⟹ 4 × 36 = 144", marks: 1, difficulty: "medium" },
  { id: "q5",  type: "mcq", text: "nth term of AP: aₙ = 5 + 3(n-1). The common difference is:", optionA: "5", optionB: "8", optionC: "3", optionD: "2", correctOption: "C", explanation: "General term aₙ = a + (n-1)d. Comparing with 5 + 3(n-1), d = 3.", marks: 1, difficulty: "easy" },
  { id: "q6",  type: "mcq", text: "The value of sin²θ + cos²θ is always:", optionA: "0", optionB: "2", optionC: "1", optionD: "Depends on θ", correctOption: "C", explanation: "Pythagorean identity: sin²θ + cos²θ = 1 for all θ.", marks: 1, difficulty: "easy" },
  { id: "q7",  type: "mcq", text: "The roots of x² - 5x + 6 = 0 are:", optionA: "2 and 3", optionB: "1 and 6", optionC: "-2 and -3", optionD: "2 and -3", correctOption: "A", explanation: "Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3.", marks: 1, difficulty: "medium" },
  { id: "q8",  type: "mcq", text: "Mean of 5, 10, 15, 20, 25 is:", optionA: "10", optionB: "12.5", optionC: "15", optionD: "17.5", correctOption: "C", explanation: "Mean = 75/5 = 15", marks: 1, difficulty: "easy" },
  { id: "q9",  type: "mcq", text: "tan 45° is equal to:", optionA: "0", optionB: "1", optionC: "√3", optionD: "1/√3", correctOption: "B", explanation: "tan 45° = sin 45°/cos 45° = 1", marks: 1, difficulty: "easy" },
  { id: "q10", type: "mcq", text: "A polynomial of degree 3 is called:", optionA: "Linear", optionB: "Quadratic", optionC: "Cubic", optionD: "Biquadratic", correctOption: "C", explanation: "Highest degree 3 → cubic polynomial.", marks: 1, difficulty: "easy" },
];

// Board Physics (Class 12 HSC)
const hscPhysicsQuestions: Question[] = [
  { id: "pq1",  type: "mcq", text: "The SI unit of electric charge is:", optionA: "Ampere", optionB: "Coulomb", optionC: "Volt", optionD: "Ohm", correctOption: "B", explanation: "The SI unit of electric charge is Coulomb (C).", marks: 1, difficulty: "easy" },
  { id: "pq2",  type: "mcq", text: "Which law states that V = IR?", optionA: "Faraday's Law", optionB: "Coulomb's Law", optionC: "Ohm's Law", optionD: "Kirchhoff's Law", correctOption: "C", explanation: "Ohm's Law states V = IR.", marks: 1, difficulty: "easy" },
  { id: "pq3",  type: "mcq", text: "The moment of inertia depends on:", optionA: "Mass only", optionB: "Distribution of mass about axis", optionC: "Velocity of rotation", optionD: "Temperature", correctOption: "B", explanation: "MI depends on mass distribution about rotation axis.", marks: 1, difficulty: "medium" },
  { id: "pq4",  type: "mcq", text: "Speed of light in vacuum is approximately:", optionA: "3×10⁶ m/s", optionB: "3×10⁸ m/s", optionC: "3×10¹⁰ m/s", optionD: "3×10⁴ m/s", correctOption: "B", explanation: "c ≈ 3×10⁸ m/s", marks: 1, difficulty: "easy" },
  { id: "pq5",  type: "mcq", text: "Which type of wave requires a medium?", optionA: "EM waves", optionB: "Light waves", optionC: "Mechanical waves", optionD: "Radio waves", correctOption: "C", explanation: "Mechanical waves need a medium.", marks: 1, difficulty: "easy" },
  { id: "pq6",  type: "mcq", text: "Dimension of Planck's constant:", optionA: "ML²T⁻¹", optionB: "ML²T⁻²", optionC: "MLT⁻¹", optionD: "ML³T⁻²", correctOption: "A", explanation: "E = hν ⟹ h = E/ν = ML²T⁻²/T⁻¹ = ML²T⁻¹", marks: 1, difficulty: "hard" },
  { id: "pq7",  type: "mcq", text: "Bernoulli's principle is based on:", optionA: "Conservation of momentum", optionB: "Conservation of mass", optionC: "Conservation of energy", optionD: "Conservation of charge", correctOption: "C", explanation: "Bernoulli's principle is based on energy conservation.", marks: 1, difficulty: "medium" },
  { id: "pq8",  type: "mcq", text: "Work done by conservative force in closed path:", optionA: "Maximum", optionB: "Minimum", optionC: "Zero", optionD: "Infinite", correctOption: "C", explanation: "Conservative force: work in closed path = 0.", marks: 1, difficulty: "medium" },
  { id: "pq9",  type: "mcq", text: "Angular momentum conserved when:", optionA: "Linear velocity constant", optionB: "Net external torque is zero", optionC: "Kinetic energy constant", optionD: "Net force is zero", correctOption: "B", explanation: "Angular momentum conserved ⟺ net torque = 0.", marks: 1, difficulty: "medium" },
  { id: "pq10", type: "mcq", text: "Unit of magnetic flux:", optionA: "Tesla", optionB: "Gauss", optionC: "Weber", optionD: "Henry", correctOption: "C", explanation: "Φ = B·A, unit = Weber (Wb).", marks: 1, difficulty: "easy" },
];

// NEET Physics Questions (+4/-1 marking)
const neetPhysicsQuestions: Question[] = [
  { id: "np1",  type: "mcq", text: "A body is thrown vertically upward with velocity u. The greatest height h it will rise to is:", optionA: "u/2g", optionB: "u²/g", optionC: "u²/2g", optionD: "2u²/g", correctOption: "C", explanation: "Using v² = u² - 2gh, at max height v=0: 0 = u² - 2gh, so h = u²/2g.", marks: 4, difficulty: "medium" },
  { id: "np2",  type: "mcq", text: "A particle moves in a circle of radius r. The displacement after half a revolution:", optionA: "πr", optionB: "2r", optionC: "r", optionD: "2πr", correctOption: "B", explanation: "After half revolution, particle moves from one end of diameter to other = 2r (displacement, not distance).", marks: 4, difficulty: "easy" },
  { id: "np3",  type: "mcq", text: "Which of the following has the same unit as energy?", optionA: "Power × time", optionB: "Force × velocity", optionC: "Force × acceleration", optionD: "Mass × velocity", correctOption: "A", explanation: "Power × time = Watt × second = Joule = energy.", marks: 4, difficulty: "easy" },
  { id: "np4",  type: "mcq", text: "The time period of a simple pendulum depends on:", optionA: "Mass of bob", optionB: "Amplitude of oscillation", optionC: "Length of pendulum", optionD: "Both length and mass", correctOption: "C", explanation: "T = 2π√(L/g). Only depends on L (length) and g (gravity), not mass or amplitude.", marks: 4, difficulty: "medium" },
  { id: "np5",  type: "mcq", text: "When a body moves with uniform velocity, its acceleration is:", optionA: "Variable", optionB: "Positive", optionC: "Negative", optionD: "Zero", correctOption: "D", explanation: "Uniform velocity means no change in speed or direction, so a = Δv/Δt = 0.", marks: 4, difficulty: "easy" },
  { id: "np6",  type: "mcq", text: "The unit of electric field intensity is:", optionA: "NC", optionB: "N/C", optionC: "C/N", optionD: "C·N", correctOption: "B", explanation: "E = F/q, unit = Newton per Coulomb (N/C) = V/m.", marks: 4, difficulty: "medium" },
  { id: "np7",  type: "mcq", text: "In photoelectric effect, if frequency is doubled (keeping intensity same):", optionA: "Photoelectric current doubles", optionB: "Max KE of electrons doubles", optionC: "Stopping potential doubles but current unchanged", optionD: "Stopping potential increases, number of electrons same", correctOption: "D", explanation: "KE = hν - φ. Doubling ν increases KE/stopping potential. Current depends on intensity (number of photons), which is unchanged.", marks: 4, difficulty: "hard" },
  { id: "np8",  type: "mcq", text: "de Broglie wavelength of a particle is inversely proportional to its:", optionA: "Velocity", optionB: "Frequency", optionC: "Momentum", optionD: "Kinetic energy", correctOption: "C", explanation: "λ = h/p, so λ ∝ 1/p (momentum).", marks: 4, difficulty: "medium" },
];

// NEET Chemistry Questions
const neetChemistryQuestions: Question[] = [
  { id: "nc1",  type: "mcq", text: "Which of the following has the highest electronegativity?", optionA: "Oxygen", optionB: "Nitrogen", optionC: "Fluorine", optionD: "Chlorine", correctOption: "C", explanation: "Fluorine has the highest electronegativity (3.98) on the Pauling scale.", marks: 4, difficulty: "easy" },
  { id: "nc2",  type: "mcq", text: "The shape of NH₃ molecule is:", optionA: "Trigonal planar", optionB: "Tetrahedral", optionC: "Trigonal pyramidal", optionD: "Linear", correctOption: "C", explanation: "NH₃: N has 1 lone pair + 3 bond pairs = tetrahedral electron geometry, but trigonal pyramidal molecular shape.", marks: 4, difficulty: "medium" },
  { id: "nc3",  type: "mcq", text: "Which type of isomerism is shown by [Co(NH₃)₆]Cl₃ and [Co(NH₃)₅Cl]Cl₂?", optionA: "Linkage isomerism", optionB: "Ionization isomerism", optionC: "Geometrical isomerism", optionD: "Optical isomerism", correctOption: "B", explanation: "These compounds differ in the ions inside and outside the coordination sphere — ionization isomerism.", marks: 4, difficulty: "hard" },
  { id: "nc4",  type: "mcq", text: "The rate of reaction doubles when temperature increases from 10°C to 20°C. The temperature coefficient is:", optionA: "1", optionB: "2", optionC: "0.5", optionD: "4", correctOption: "B", explanation: "Temperature coefficient = rate at (T+10)/rate at T = 2.", marks: 4, difficulty: "medium" },
  { id: "nc5",  type: "mcq", text: "Hybridization of carbon in CO₂:", optionA: "sp³", optionB: "sp²", optionC: "sp", optionD: "sp³d", correctOption: "C", explanation: "CO₂ is linear (O=C=O), so carbon is sp hybridized.", marks: 4, difficulty: "easy" },
];

// NEET Biology / Botany Questions
const neetBotanyQuestions: Question[] = [
  { id: "nb1",  type: "mcq", text: "Which organelle is called the 'powerhouse of the cell'?", optionA: "Nucleus", optionB: "Ribosome", optionC: "Golgi body", optionD: "Mitochondria", correctOption: "D", explanation: "Mitochondria produce ATP via cellular respiration — the cell's energy currency.", marks: 4, difficulty: "easy" },
  { id: "nb2",  type: "mcq", text: "The process of photosynthesis occurs in:", optionA: "Mitochondria", optionB: "Nucleus", optionC: "Chloroplast", optionD: "Ribosome", correctOption: "C", explanation: "Photosynthesis (light + dark reactions) occurs in chloroplasts.", marks: 4, difficulty: "easy" },
  { id: "nb3",  type: "mcq", text: "Which pigment absorbs most light during photosynthesis?", optionA: "Carotenoids", optionB: "Xanthophyll", optionC: "Chlorophyll a", optionD: "Phycoerythrin", correctOption: "C", explanation: "Chlorophyll a is the primary photosynthetic pigment, absorbing red and blue-violet light.", marks: 4, difficulty: "medium" },
  { id: "nb4",  type: "mcq", text: "The double fertilization in angiosperms results in:", optionA: "Seed and fruit", optionB: "Embryo and endosperm", optionC: "Zygote and embryo", optionD: "Ovule and seed", correctOption: "B", explanation: "One sperm fuses with egg → zygote (embryo); another fuses with polar nuclei → endosperm (triploid).", marks: 4, difficulty: "hard" },
  { id: "nb5",  type: "mcq", text: "Which of the following is NOT a characteristic of gymnosperms?", optionA: "Naked seeds", optionB: "Vascular tissue present", optionC: "Fruit formation", optionD: "Perennial plants", correctOption: "C", explanation: "Gymnosperms have naked seeds (no fruit). Fruit formation occurs only in angiosperms.", marks: 4, difficulty: "medium" },
];

// JEE Mains Math Questions (+4/-1)
const jeeMathQuestions: Question[] = [
  { id: "jm1",  type: "mcq", text: "If z = x + iy and |z - 1| = |z + 1|, then z lies on:", optionA: "x-axis", optionB: "y-axis", optionC: "Circle |z|=1", optionD: "Ellipse", correctOption: "B", explanation: "|z-1|² = |z+1|² ⟹ (x-1)²+y² = (x+1)²+y² ⟹ -2x = 2x ⟹ x=0, which is the y-axis.", marks: 4, difficulty: "medium" },
  { id: "jm2",  type: "mcq", text: "The value of lim(x→0) (sin x)/x is:", optionA: "0", optionB: "∞", optionC: "1", optionD: "undefined", correctOption: "C", explanation: "Standard limit: lim(x→0) (sin x)/x = 1.", marks: 4, difficulty: "easy" },
  { id: "jm3",  type: "mcq", text: "∫eˣ(sin x + cos x)dx = ?", optionA: "eˣ sin x + C", optionB: "eˣ cos x + C", optionC: "eˣ(sin x + cos x) + C", optionD: "eˣ tan x + C", correctOption: "A", explanation: "Using ∫eˣ[f(x)+f'(x)]dx = eˣf(x)+C, here f(x)=sin x, f'(x)=cos x, so answer = eˣ sin x + C.", marks: 4, difficulty: "medium" },
  { id: "jm4",  type: "mcq", text: "The determinant of identity matrix of order 3 is:", optionA: "0", optionB: "1", optionC: "3", optionD: "9", correctOption: "B", explanation: "det(I₃) = 1. The determinant of any identity matrix is 1.", marks: 4, difficulty: "easy" },
  { id: "jm5",  type: "mcq", text: "How many ways can 5 people be arranged in a row?", optionA: "25", optionB: "120", optionC: "60", optionD: "15", correctOption: "B", explanation: "5! = 5×4×3×2×1 = 120.", marks: 4, difficulty: "easy" },
  { id: "jm6",  type: "mcq", text: "If A and B are independent events with P(A)=0.3, P(B)=0.4, then P(A∩B):", optionA: "0.7", optionB: "0.12", optionC: "0.58", optionD: "0.28", correctOption: "B", explanation: "Independent: P(A∩B) = P(A)·P(B) = 0.3×0.4 = 0.12.", marks: 4, difficulty: "medium" },
];

// Class 8 Science Questions (Board, +1/0)
const class8ScienceQuestions: Question[] = [
  { id: "8s1", type: "mcq", text: "Which of the following is a natural fibre?", optionA: "Nylon", optionB: "Polyester", optionC: "Cotton", optionD: "Acrylic", correctOption: "C", explanation: "Cotton is a natural fibre obtained from cotton plants. Nylon, polyester, acrylic are synthetic fibres.", marks: 1, difficulty: "easy" },
  { id: "8s2", type: "mcq", text: "Microorganisms that cause diseases are called:", optionA: "Pathogens", optionB: "Vaccines", optionC: "Antibiotics", optionD: "Fungi", correctOption: "A", explanation: "Disease-causing microorganisms are called pathogens.", marks: 1, difficulty: "easy" },
  { id: "8s3", type: "mcq", text: "The force of attraction between earth and an object is called:", optionA: "Friction", optionB: "Gravity", optionC: "Magnetic force", optionD: "Electrostatic force", correctOption: "B", explanation: "Earth exerts gravitational force on all objects, pulling them towards its centre.", marks: 1, difficulty: "easy" },
  { id: "8s4", type: "mcq", text: "The loudness of sound is measured in:", optionA: "Hertz", optionB: "Metre/sec", optionC: "Decibels", optionD: "Newton", correctOption: "C", explanation: "Loudness of sound is measured in decibels (dB).", marks: 1, difficulty: "easy" },
  { id: "8s5", type: "mcq", text: "Which gas is produced when acids react with metals?", optionA: "Oxygen", optionB: "Carbon dioxide", optionC: "Hydrogen", optionD: "Nitrogen", correctOption: "C", explanation: "Acid + Metal → Salt + Hydrogen gas (e.g., Zn + H₂SO₄ → ZnSO₄ + H₂)", marks: 1, difficulty: "medium" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quizzes
// ─────────────────────────────────────────────────────────────────────────────

export const quizzes: Quiz[] = [
  // Class 10 Board Quizzes (+1/0)
  {
    id: "qz1", title: "Mathematics — Arithmetic Progression Quiz",
    goalCategory: "board-10", standard: "10", subject: "Mathematics", subjectId: "s1",
    chapter: "Arithmetic Progression", difficulty: "medium", timeLimitMinutes: 15,
    totalMarks: 10, questionsCount: 10, markingScheme: MARKING_SCHEMES.BOARD,
    instructions: "10 MCQ questions. Each carries 1 mark. No negative marking.",
    status: "published", analytics: { totalAttempts: 1240, avgScore: 7.2 },
    createdAt: "2024-01-15", questions: mathQuestions,
  },
  {
    id: "qz2", title: "Mathematics — Trigonometry Basics",
    goalCategory: "board-10", standard: "10", subject: "Mathematics", subjectId: "s1",
    chapter: "Trigonometry", difficulty: "easy", timeLimitMinutes: 10,
    totalMarks: 10, questionsCount: 10, markingScheme: MARKING_SCHEMES.BOARD,
    instructions: "Basic trigonometry: sin, cos, tan identities. 10 questions, 1 mark each.",
    status: "published", analytics: { totalAttempts: 980, avgScore: 8.1 },
    createdAt: "2024-01-20", questions: mathQuestions,
  },
  {
    id: "qz7", title: "Mathematics — Quadratic Equations",
    goalCategory: "board-10", standard: "10", subject: "Mathematics", subjectId: "s1",
    chapter: "Quadratic Equations", difficulty: "easy", timeLimitMinutes: 10,
    totalMarks: 10, questionsCount: 10, markingScheme: MARKING_SCHEMES.BOARD,
    instructions: "Practice quadratic equations. 10 questions, 1 mark each.",
    status: "published", analytics: { totalAttempts: 1450, avgScore: 7.8 },
    createdAt: "2024-03-01", questions: mathQuestions,
  },

  // Class 12 Board Quizzes (+1/0)
  {
    id: "qz4", title: "Physics — Rotational Motion",
    goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Physics", subjectId: "s9",
    chapter: "Rotational Motion", difficulty: "hard", timeLimitMinutes: 20,
    totalMarks: 10, questionsCount: 10, markingScheme: MARKING_SCHEMES.BOARD,
    instructions: "Advanced physics on rotational motion. Requires knowledge of MI, torque, angular momentum.",
    status: "published", analytics: { totalAttempts: 890, avgScore: 5.9 },
    createdAt: "2024-02-10", questions: hscPhysicsQuestions,
  },
  {
    id: "qz5", title: "Physics — Electrostatics",
    goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Physics", subjectId: "s9",
    chapter: "Electrostatics", difficulty: "medium", timeLimitMinutes: 15,
    totalMarks: 10, questionsCount: 10, markingScheme: MARKING_SCHEMES.BOARD,
    instructions: "10 MCQs on electrostatics fundamentals. 1 mark per question.",
    status: "published", analytics: { totalAttempts: 1100, avgScore: 6.5 },
    createdAt: "2024-02-15", questions: hscPhysicsQuestions,
  },
  {
    id: "qz8", title: "Physics — Thermodynamics",
    goalCategory: "board-12", standard: "12", stream: "pcb", subject: "Physics", subjectId: "s9",
    chapter: "Thermodynamics", difficulty: "medium", timeLimitMinutes: 15,
    totalMarks: 10, questionsCount: 10, markingScheme: MARKING_SCHEMES.BOARD,
    instructions: "Thermodynamics: laws, heat engines, entropy. 10 questions.",
    status: "published", analytics: { totalAttempts: 720, avgScore: 6.2 },
    createdAt: "2024-03-05", questions: hscPhysicsQuestions,
  },

  // NEET Quizzes (+4/-1)
  {
    id: "qzn1", title: "NEET Physics — Laws of Motion",
    goalCategory: "neet", subject: "Physics", subjectId: "sn1",
    chapter: "Laws of Motion", difficulty: "medium", timeLimitMinutes: 30,
    totalMarks: 32, questionsCount: 8, markingScheme: MARKING_SCHEMES.NEET,
    instructions: "8 NEET-pattern MCQs. Marking: +4 correct, -1 wrong. Time your practice!",
    status: "published", analytics: { totalAttempts: 2140, avgScore: 18.4 },
    createdAt: "2024-05-01", questions: neetPhysicsQuestions,
  },
  {
    id: "qzn2", title: "NEET Physics — Motion in a Straight Line",
    goalCategory: "neet", subject: "Physics", subjectId: "sn1",
    chapter: "Motion in a Straight Line", difficulty: "easy", timeLimitMinutes: 20,
    totalMarks: 32, questionsCount: 8, markingScheme: MARKING_SCHEMES.NEET,
    instructions: "NEET pattern. +4 per correct, -1 per wrong.",
    status: "published", analytics: { totalAttempts: 1890, avgScore: 22.4 },
    createdAt: "2024-05-10", questions: neetPhysicsQuestions,
  },
  {
    id: "qzn3", title: "NEET Chemistry — Chemical Bonding",
    goalCategory: "neet", subject: "Chemistry", subjectId: "sn2",
    chapter: "Chemical Bonding", difficulty: "medium", timeLimitMinutes: 20,
    totalMarks: 20, questionsCount: 5, markingScheme: MARKING_SCHEMES.NEET,
    instructions: "5 NEET chemistry MCQs. +4 correct, -1 wrong.",
    status: "published", analytics: { totalAttempts: 1560, avgScore: 11.2 },
    createdAt: "2024-05-15", questions: neetChemistryQuestions,
  },
  {
    id: "qzn4", title: "NEET Botany — Photosynthesis & Plant Kingdom",
    goalCategory: "neet", subject: "Botany", subjectId: "sn3",
    chapter: "Photosynthesis", difficulty: "medium", timeLimitMinutes: 20,
    totalMarks: 20, questionsCount: 5, markingScheme: MARKING_SCHEMES.NEET,
    instructions: "5 NEET botany MCQs. +4 correct, -1 wrong.",
    status: "published", analytics: { totalAttempts: 1340, avgScore: 13.6 },
    createdAt: "2024-05-20", questions: neetBotanyQuestions,
  },

  // JEE Mains Quizzes (+4/-1)
  {
    id: "qzj1", title: "JEE Mains Mathematics — Calculus Quiz",
    goalCategory: "jee-mains", subject: "Mathematics", subjectId: "sj3",
    chapter: "Limits and Continuity", difficulty: "hard", timeLimitMinutes: 30,
    totalMarks: 24, questionsCount: 6, markingScheme: MARKING_SCHEMES.JEE_MCQ,
    instructions: "6 JEE Mains pattern MCQs. +4 correct, -1 wrong. Numerical questions carry same marking.",
    status: "published", analytics: { totalAttempts: 980, avgScore: 12.8 },
    createdAt: "2024-06-01", questions: jeeMathQuestions,
  },
  {
    id: "qzj2", title: "JEE Mains Mathematics — Probability & Statistics",
    goalCategory: "jee-mains", subject: "Mathematics", subjectId: "sj3",
    chapter: "Probability", difficulty: "medium", timeLimitMinutes: 20,
    totalMarks: 24, questionsCount: 6, markingScheme: MARKING_SCHEMES.JEE_MCQ,
    instructions: "JEE Mains pattern. +4 correct, -1 wrong.",
    status: "published", analytics: { totalAttempts: 870, avgScore: 14.4 },
    createdAt: "2024-06-10", questions: jeeMathQuestions,
  },

  // Class 8 Quiz (+1/0)
  {
    id: "qz8s1", title: "Class 8 Science — Microorganisms & Materials",
    goalCategory: "board-8", standard: "8", subject: "Science & Technology", subjectId: "s8-2",
    chapter: "Microorganisms", difficulty: "easy", timeLimitMinutes: 10,
    totalMarks: 5, questionsCount: 5, markingScheme: MARKING_SCHEMES.BOARD,
    instructions: "5 questions on Class 8 science. 1 mark each, no negative marking.",
    status: "published", analytics: { totalAttempts: 340, avgScore: 3.8 },
    createdAt: "2024-08-01", questions: class8ScienceQuestions,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Announcements
// ─────────────────────────────────────────────────────────────────────────────

export const announcements: Announcement[] = [
  {
    id: "a1", title: "NEET 2027 Exam Date Confirmed — May 3, 2027",
    body: "NTA has officially confirmed NEET UG 2027 will be held on May 3, 2027. Registration begins February 1, 2027 at nta.ac.in. We have updated all NEET mock test timers to reflect the new deadline. 247 days to go — stay consistent!",
    priority: "urgent", targetGoals: ["neet", "mht-cet-pcb"], expiresAt: "2027-05-03", isActive: true, createdAt: "2026-05-15",
  },
  {
    id: "a2", title: "HSC Board Exams 2027 — Timetable Released",
    body: "MSBSHSE has released the timetable for HSC March 2027 board examinations. Exams begin March 5, 2027. Physics on March 5, Chemistry March 7, Biology March 9. Download the full timetable from the official MSBSHSE website.",
    priority: "important", targetGoals: ["board-12", "board-11"], expiresAt: "2027-03-01", isActive: true, createdAt: "2026-12-10",
  },
  {
    id: "a3", title: "JEE Mains 2027 — Session 1 Registration Open",
    body: "JEE Mains 2027 Session 1 registration is now open at jeemain.nta.nic.in. Last date to apply: December 31, 2026. Exam scheduled for January 20–30, 2027. Ensure your Class 12 marksheet is ready for verification.",
    priority: "important", targetGoals: ["jee-mains", "jee-advanced", "mht-cet-pcm"], expiresAt: "2027-01-20", isActive: true, createdAt: "2026-11-20",
  },
  {
    id: "a4", title: "New NEET PYQ Papers Added — 2024 & 2023",
    body: "We have added official NEET UG 2024 and 2023 PYQ papers with detailed solutions and explanations. NEET students can now access 5 years of PYQs. These are the most important study materials — start with the most recent year.",
    priority: "normal", targetGoals: ["neet"], expiresAt: "2027-12-31", isActive: true, createdAt: "2026-06-01",
  },
  {
    id: "a5", title: "SSC Board Exams 2027 — Important Dates",
    body: "SSC (Class 10) March 2027 exams begin March 1, 2027. Mathematics on March 1, Science on March 3. Prelims (pre-boards) will be held in January 2027. Check your school for exact prelim dates.",
    priority: "important", targetGoals: ["board-10"], expiresAt: "2027-03-01", isActive: true, createdAt: "2026-12-05",
  },
  {
    id: "a6", title: "Platform Update — New Quiz Engine Features",
    body: "ParikshaCrack has updated the quiz engine with: (1) Real negative marking for NEET/JEE, (2) Percentile ranking after each quiz, (3) Score breakdown showing correct × +4 and wrong × -1. Start any NEET quiz to try the new engine!",
    priority: "normal", targetGoals: ["all"], expiresAt: "2027-12-31", isActive: true, createdAt: "2026-06-02",
  },
  {
    id: "a7", title: "MHT-CET 2027 — Exam Pattern Unchanged",
    body: "State CET Cell has confirmed the MHT-CET 2027 pattern remains: PCM 150 questions (300 marks), PCB 200 questions (200 marks). No negative marking. Biology section carries 100 questions at 1 mark each. Mathematics carries double marks (+2 per question).",
    priority: "normal", targetGoals: ["mht-cet-pcb", "mht-cet-pcm"], expiresAt: "2027-06-01", isActive: true, createdAt: "2026-10-01",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Students (Admin view)
// ─────────────────────────────────────────────────────────────────────────────

export const students: Student[] = [
  { id: "u1", name: "Priya Sharma",   email: "priya.sharma@gmail.com",   goalCategories: ["board-12", "neet"],      goalLabels: ["HSC Class 12 (English)", "NEET UG 2027"],    medium: "semi-english", streak: 22, isBlocked: false, isVerified: true,  joinedAt: "2024-11-15", lastActiveAt: "2025-01-10", totalAttempts: 67, avgScore: 78.5 },
  { id: "u2", name: "Rohan Patil",    email: "rohan.patil@gmail.com",    goalCategories: ["board-10"],              goalLabels: ["SSC Class 10 (Marathi)"],                      medium: "marathi",      streak: 7,  isBlocked: true,  isVerified: true,  joinedAt: "2024-12-01", lastActiveAt: "2025-01-09", totalAttempts: 18, avgScore: 65.2 },
  { id: "u3", name: "Sneha Kulkarni", email: "sneha.kulkarni@gmail.com", goalCategories: ["board-12", "jee-mains", "mht-cet-pcm"], goalLabels: ["HSC Class 12", "JEE Mains 2027", "MHT-CET PCM 2027"], medium: "english", streak: 34, isBlocked: false, isVerified: true,  joinedAt: "2024-11-20", lastActiveAt: "2025-01-10", totalAttempts: 112, avgScore: 85.1 },
  { id: "u4", name: "Arjun Desai",    email: "arjun.desai@gmail.com",    goalCategories: ["board-8"],               goalLabels: ["Class 8 Board (English)"],                     medium: "english",      streak: 3,  isBlocked: false, isVerified: true,  joinedAt: "2025-01-05", lastActiveAt: "2025-01-08", totalAttempts: 8,   avgScore: 72.3 },
  { id: "u5", name: "Pooja Joshi",    email: "pooja.joshi@gmail.com",    goalCategories: ["board-12", "neet"],      goalLabels: ["HSC Class 12", "NEET UG 2027"],               medium: "semi-english", streak: 0,  isBlocked: false, isVerified: true,  joinedAt: "2024-11-10", lastActiveAt: "2024-12-20", totalAttempts: 31, avgScore: 60.8 },
  { id: "u6", name: "Akash Nair",     email: "akash.nair@gmail.com",     goalCategories: ["board-10"],              goalLabels: ["SSC Class 10 (English)"],                      medium: "english",      streak: 10, isBlocked: false, isVerified: true,  joinedAt: "2024-12-10", lastActiveAt: "2025-01-10", totalAttempts: 25, avgScore: 80.4 },
  { id: "u7", name: "Meera Bhosale",  email: "meera.bhosale@gmail.com",  goalCategories: ["board-12"],              goalLabels: ["HSC Class 12 (Marathi)"],                      medium: "marathi",      streak: 5,  isBlocked: false, isVerified: false, joinedAt: "2025-01-08", lastActiveAt: "2025-01-10", totalAttempts: 4,   avgScore: 70.0 },
  { id: "u8", name: "Rahul Jadhav",   email: "rahul.jadhav@gmail.com",   goalCategories: ["board-10", "mht-cet-pcm"], goalLabels: ["SSC Class 10", "MHT-CET PCM 2027"],         medium: "semi-english", streak: 18, isBlocked: false, isVerified: true,  joinedAt: "2024-11-25", lastActiveAt: "2025-01-10", totalAttempts: 55, avgScore: 88.2 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard chart data (static defaults — dashboard derives real values from attempts)
// ─────────────────────────────────────────────────────────────────────────────

export const scoreTrendData = [
  { date: "Jan 1",  score: 60 },
  { date: "Jan 3",  score: 72 },
  { date: "Jan 5",  score: 68 },
  { date: "Jan 7",  score: 75 },
  { date: "Jan 9",  score: 80 },
  { date: "Jan 10", score: 78 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Admin Analytics Data
// ─────────────────────────────────────────────────────────────────────────────

export const adminAnalyticsData = {
  totalStudents: 5247,
  totalPapers: 412,
  totalQuizzes: 286,
  totalAttempts: 84320,
  dailyActiveUsers: 1247,
  pendingDrafts: 8,
  weeklyRegistrations: [45, 62, 38, 71, 55, 80, 64],
  registrationTrend: [
    { month: "Aug",  count: 420 },
    { month: "Sep",  count: 810 },
    { month: "Oct",  count: 1380 },
    { month: "Nov",  count: 2520 },
    { month: "Dec",  count: 4010 },
    { month: "Jan",  count: 5247 },
  ],
  examDistribution: [
    { name: "Board (All)",   value: 55, color: "#3B82F6" },
    { name: "NEET UG",       value: 22, color: "#16A34A" },
    { name: "JEE Mains",     value: 15, color: "#7C3AED" },
    { name: "MHT-CET",       value: 6,  color: "#0891B2" },
    { name: "JEE Advanced",  value: 2,  color: "#4F46E5" },
  ],
  topQuizzes: [
    { title: "NEET Physics — Laws of Motion",        attempts: 2140, goal: "neet" },
    { title: "Math — Quadratic Equations (SSC)",     attempts: 1450, goal: "board-10" },
    { title: "NEET Physics — Motion",                attempts: 1890, goal: "neet" },
    { title: "Math — Arithmetic Progression (SSC)",  attempts: 1240, goal: "board-10" },
    { title: "NEET Chemistry — Bonding",             attempts: 1560, goal: "neet" },
  ],
  topPapers: [
    { title: "NEET UG 2023 — Full PYQ",      downloads: 8900, goal: "neet" },
    { title: "NEET UG 2024 — Full PYQ",      downloads: 6800, goal: "neet" },
    { title: "JEE Mains Jan 2023 — Shift 1", downloads: 6400, goal: "jee-mains" },
    { title: "HSC Physics March 2023",        downloads: 3400, goal: "board-12" },
    { title: "HSC Chemistry March 2024",      downloads: 2750, goal: "board-12" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Paper type display labels and badge colors
// ─────────────────────────────────────────────────────────────────────────────

export const PAPER_TYPE_CONFIG: Record<PaperType, { label: string; bg: string; text: string; border: string }> = {
  "unit-test":    { label: "Unit Test",    bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "semester":     { label: "Semester",     bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
  "prelims":      { label: "Prelims",      bg: "#EDE9FE", text: "#5B21B6", border: "#DDD6FE" },
  "board":        { label: "Board Exam",   bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
  "model":        { label: "Model",        bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
  "practice":     { label: "Practice",     bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" },
  "pyq":          { label: "PYQ",          bg: "#FFF7ED", text: "#9A3412", border: "#FED7AA" },
  "mock-test":    { label: "Mock Test",    bg: "#E0E7FF", text: "#3730A3", border: "#C7D2FE" },
  "chapter-wise": { label: "Chapter",      bg: "#CCFBF1", text: "#134E4A", border: "#99F6E4" },
  "subject-wise": { label: "Subject",      bg: "#CFFAFE", text: "#164E63", border: "#A5F3FC" },
  "minor-test":   { label: "Minor Test",   bg: "#FCE7F3", text: "#831843", border: "#FBCFE8" },
  "major-test":   { label: "Major Test",   bg: "#FFE4E6", text: "#9F1239", border: "#FECDD3" },
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; bg: string; text: string; dot: string }> = {
  easy:   { label: "Easy",   bg: "#DCFCE7", text: "#15803D", dot: "#16A34A" },
  medium: { label: "Medium", bg: "#FEF3C7", text: "#92400E", dot: "#D97706" },
  hard:   { label: "Hard",   bg: "#FEE2E2", text: "#991B1B", dot: "#DC2626" },
  mixed:  { label: "Mixed",  bg: "#EDE9FE", text: "#5B21B6", dot: "#7C3AED" },
};
