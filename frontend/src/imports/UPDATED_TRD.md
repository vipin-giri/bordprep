# ⚙️ Technical Requirements Document (TRD)
## ParikshaCrack v2.0 — Multi-Exam Preparation Platform
**Version:** 2.0 | **Date:** June 2026 | **Status:** Draft — Pending Approval  
**Replaces:** v1.0 (MahaBoard Prep, Maharashtra Board only, Class 10 & 12)

---

## 0. Document Purpose & Scope

This TRD translates the [ParikshaCrack PRD v2.0] into concrete technical specifications. It defines:
- **What to build** at the code level (interfaces, components, state)
- **How to build it** (architecture patterns, mobile-first patterns)
- **What NOT to build** (explicit scope guards)
- **How to verify** that the implementation is correct

**Primary audience:** Frontend engineers, code reviewers, and the AI agent implementing changes.

**Grounded in reality:** This TRD reflects the actual current codebase (v1.0, 292-line mockData.ts, single `user.standard`, 3 paper types) and specifies the exact delta to reach v2.0.

---

## 1. Technology Stack

### 1.1 Core Stack (Unchanged from v1.0)

| Layer | Technology | Version | Notes |
|---|---|---|---|
| **Framework** | React | 18.3.1 | Already in package.json |
| **Build Tool** | Vite | 6.3.5 | Already in package.json |
| **Language** | TypeScript | 5.x | `strict: true` mode enforced |
| **Styling** | Tailwind CSS | 4.1.12 | Already configured |
| **Icons** | Lucide React | 0.487.0 | Already installed |
| **Charts** | Recharts | 2.15.2 | Already installed |
| **State** | React Context API | — | No external state library |
| **Navigation** | View-based SPA (string state) | — | No React Router |
| **Package Manager** | pnpm | — | pnpm-workspace.yaml present |

### 1.2 No New Dependencies Required
> **Rule:** v2.0 adds zero new npm dependencies. All new features must be built with what's already installed. This keeps the bundle small and avoids breaking changes.

### 1.3 What Exists vs What Needs Changes

| File | Lines (v1.0) | Change Type | Priority |
|---|---|---|---|
| `mockData.ts` | 292 | **Major Rewrite** | P0 — everything depends on this |
| `AppContext.tsx` | 113 | **Major Rewrite** | P0 — everything depends on this |
| `OnboardingFlow.tsx` | 157 | **Full Rebuild** | P1 |
| `StudentLayout.tsx` | ~120 | **Modify** | P1 |
| `Dashboard.tsx` | 203 | **Modify** | P2 |
| `PapersList.tsx` | 216 | **Modify** | P2 |
| `QuizList.tsx` | ~180 | **Modify** | P2 |
| `QuizEngine.tsx` | 480 | **Modify** | P2 |
| `Profile.tsx` | ~200 | **Modify** | P3 |
| `AdminPapers.tsx` | 238 | **Modify** | P3 |
| `AdminQuizzes.tsx` | ~280 | **Modify** | P3 |
| `AdminSubjects.tsx` | ~200 | **Modify** | P3 |
| `AdminAnnouncements.tsx` | ~150 | **Modify** | P3 |
| `AdminUsers.tsx` | ~180 | **Modify** | P3 |
| `LandingPage.tsx` | 347 | **Minor Modify** | P4 |
| `AuthPages.tsx` | 315 | **Minor Modify** | P4 |

---

## 2. Mobile-First Architecture (Critical Section)

> **Design principle:** Every component is designed for mobile (320px–430px viewport) first. Desktop is an enhancement, not the baseline.

### 2.1 Why Mobile-First Matters for This Project

The target users (Maharashtra students aged 13–18) primarily access the platform on:
- Budget Android phones (2–4 GB RAM, Snapdragon 400/600 class)
- Screen sizes: 5.0"–6.7" (360px–430px viewport width)
- Connections: 4G with frequent drops (1–1.5 GB/day plans)
- Shared devices: siblings, parents may interrupt usage

These constraints are not hypothetical — they define every technical decision in this document.

### 2.2 Responsive Breakpoint System

```css
/* Breakpoints used throughout — Mobile First */
/* Default (no prefix) = mobile, 320px+ */
/* sm: = small tablet, 640px+ */  
/* md: = tablet/laptop, 768px+ */
/* lg: = desktop, 1024px+ */
/* xl: = wide desktop, 1280px+ */
```

**Tailwind classes pattern for this project:**
```
Mobile first:   grid-cols-1      flex-col      p-4       text-sm
Small tablet:   sm:grid-cols-2   sm:flex-row   sm:p-6    sm:text-base
Desktop:        lg:grid-cols-4   lg:flex-row   lg:p-8    lg:text-base
```

**Never use:**
```
❌ hidden md:block (hides mobile content)
❌ flex-row sm:flex-col (desktop first)
❌ Fixed pixel widths like w-[600px] on mobile
```

### 2.3 Touch Target Requirements

**Minimum touch target:** 44×44px (Apple HIG + Google Material standard)

Implementation pattern:
```tsx
// ✅ Correct — 44px minimum tap area
<button className="min-h-[44px] min-w-[44px] px-4 py-2.5">
  Action
</button>

// ❌ Wrong — too small
<button className="px-2 py-1 text-xs">
  Action
</button>
```

**Spacing between interactive elements:** ≥ 8px

### 2.4 Thumb Zone Architecture

Student phones are held one-handed. Primary actions must be in the bottom 60% of the screen.

```
┌─────────────────────┐  ← Phone top
│  ❌ DEAD ZONE       │  ← Status bar + app header
│  (Header: 56px)     │  
│─────────────────────│
│  ⚠️  AWKWARD ZONE  │  ← Tabs, titles, secondary info
│  (upper content)    │  
│─────────────────────│
│  ✅ NATURAL ZONE    │  ← Primary content, cards
│  ✅ NATURAL ZONE    │  ← Best for primary CTA
│─────────────────────│
│  ✅ EASY REACH      │  ← Bottom nav bar (always here)
│  (Bottom Nav: 64px) │
└─────────────────────┘  ← Phone bottom
```

**Rules derived from this:**
1. Bottom navigation bar is always fixed at bottom (never hamburger-only menu)
2. Primary CTAs ("Start Quiz", "Download PDF", "Submit") → sticky bottom bar
3. Filter panels → bottom sheet (slides up from bottom) not top dropdown
4. Question navigator in quiz → collapsible bottom sheet on mobile

### 2.5 Bottom Navigation Bar Specification

The student portal bottom nav is the primary navigation on mobile.

```tsx
// StudentLayout.tsx — Bottom nav structure
const NAV_ITEMS = [
  { view: "dashboard", icon: LayoutDashboard, label: "Home" },
  { view: "papers",    icon: FileText,        label: "Papers" },
  { view: "quizzes",   icon: Brain,           label: "Quizzes" },
  { view: "bookmarks", icon: Bookmark,        label: "Saved" },
  { view: "profile",   icon: User,            label: "Profile" },
] as const;

// CSS: Fixed at bottom, 64px height, safe-area-inset for iPhone notch
// className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100
//            flex items-center justify-around px-2 z-50
//            pb-safe"  ← handles iPhone safe area inset
```

**Safe area inset for iPhone:**
```css
/* In index.css */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

**Compensation in main content:**
```tsx
// All student page content needs bottom padding to avoid being hidden by nav
<main className="pb-20 sm:pb-0">  {/* 64px nav + 16px breathing room */}
  {children}
</main>
```

### 2.6 Bottom Sheet Pattern (Mobile Filter Panel)

Filters on mobile should slide up as a sheet, not expand inline (saves screen space).

```tsx
// Pattern for PapersList.tsx filter panel on mobile
function FilterBottomSheet({ isOpen, onClose, children }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={onClose}
        />
      )}
      {/* Sheet */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 sm:hidden
        bg-white rounded-t-2xl shadow-xl
        transform transition-transform duration-300
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        max-h-[75vh] overflow-y-auto pb-safe
      `}>
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
        {children}
      </div>
      
      {/* Desktop: inline panel (sm:block hidden) */}
      <div className="hidden sm:block">
        {children}
      </div>
    </>
  );
}
```

### 2.7 Mobile-First Typography System

```css
/* Font scale for mobile — all sizes in rem, mobile first */
/* Never go below 14px (0.875rem) on mobile for body text */

Body text:      text-sm     = 14px  (mobile default)
Small label:    text-xs     = 12px  (badges, metadata only)
Card title:     text-base   = 16px  on mobile, text-lg (18px) on sm:
Section heading:text-lg     = 18px  on mobile, text-xl (20px) on sm:  
Page heading:   text-xl     = 20px  on mobile, text-2xl (24px) on sm:

Line height:    leading-relaxed = 1.625 (body)
                leading-snug    = 1.375 (headings)

Font weight:    font-normal  = 400 (body)
                font-medium  = 500 (labels, secondary headings)
                font-semibold= 600 (card titles, UI labels)
                font-bold    = 700 (page headings)
                font-extrabold=800 (hero, result numbers)
```

### 2.8 Mobile Performance Budget

| Metric | Target | Why |
|---|---|---|
| First Contentful Paint (FCP) | < 1.5s on simulated 4G | Students on capped data |
| Largest Contentful Paint (LCP) | < 2.5s on simulated 4G | Core web vital |
| Cumulative Layout Shift (CLS) | < 0.1 | Content shouldn't jump |
| Time to Interactive (TTI) | < 3.5s on simulated 4G | Must be usable quickly |
| Total JS Bundle (gzipped) | < 400 KB | Budget Android has 2GB RAM |
| Per-page JS chunk | < 100 KB gzipped | Via code splitting |
| Images | WebP, max 100 KB per image | Data efficiency |
| CSS | < 50 KB gzipped | Critical path optimization |
| Lighthouse Mobile Score | ≥ 85 | Measurable target |

**Current v1.0 bundle:** `index-COKZXWGt.js = 788 KB (205 KB gzipped)` — this is OVER budget.

**v2.0 bundle optimization strategy:**
```typescript
// vite.config.ts — Add manual chunks to split vendor code
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-radix': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-select',
            '@radix-ui/react-tabs'
          ],
          'vendor-motion': ['motion'],
          'admin': [
            './src/app/components/admin/AdminPapers',
            './src/app/components/admin/AdminQuizzes',
            './src/app/components/admin/AdminUsers',
            './src/app/components/admin/AdminSubjects',
            './src/app/components/admin/AdminAnnouncements',
            './src/app/components/admin/AdminAnalytics',
          ],
        }
      }
    }
  }
});
```

**Lazy loading admin panel** (students never download admin code):
```typescript
// App.tsx — Lazy load admin components
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminPapers = lazy(() => import('./components/admin/AdminPapers'));
// etc.

// Wrap admin views in Suspense
if (ADMIN_VIEWS.includes(view)) {
  return (
    <AdminLayout>
      <Suspense fallback={<AdminLoadingSpinner />}>
        {view === 'admin-dashboard' && <AdminDashboard />}
        {/* ... */}
      </Suspense>
    </AdminLayout>
  );
}
```

### 2.9 Image Optimization

All images imported via `new URL(..., import.meta.url).href` in LandingPage should be:
- Format: WebP (already .jpg in current codebase — no change needed for v2.0, defer to future)
- Lazy loading: `loading="lazy"` on all images below the fold
- Explicit dimensions: Always set `width` and `height` to prevent CLS

```tsx
// ✅ Correct pattern
<img 
  src={heroImage} 
  alt="Students studying" 
  width={800} 
  height={600}
  loading="lazy"
  className="w-full h-auto object-cover"
/>
```

### 2.10 LocalStorage Strategy for Mobile Resilience

Students frequently get phone calls, switch apps, or lose connectivity mid-quiz. The app must handle all of these gracefully.

**localStorage key schema:**
```typescript
const STORAGE_KEYS = {
  // Quiz state persistence (most critical)
  ACTIVE_ATTEMPT: 'pc_active_attempt',       // CurrentAttempt object
  QUIZ_TIMER: 'pc_quiz_timer',              // { quizId, timeLeft, savedAt }
  
  // User preferences
  CURRENT_GOAL: 'pc_current_goal',          // Goal object (last selected)
  THEME: 'pc_theme',                        // 'light' | 'dark' (future)
  
  // Session data  
  USER: 'pc_user',                          // User object on login
  BOOKMARKS: 'pc_bookmarks',               // Bookmark[] array
} as const;
```

**Quiz state auto-save (every 10 seconds):**
```typescript
// Inside QuizAttempt component
useEffect(() => {
  if (!currentAttempt || !isPractice === false) return; // exam mode only
  
  const saveInterval = setInterval(() => {
    const timerState = {
      quizId: currentAttempt.quizId,
      timeLeft,
      answers: currentAttempt.answers,
      flagged: Array.from(flagged), // Set → Array for JSON serialization
      currentQuestion: qIndex,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ATTEMPT, JSON.stringify(timerState));
    } catch (e) {
      // localStorage might be full on low-storage devices — fail silently
      console.warn('Failed to save quiz state:', e);
    }
  }, 10000); // 10 seconds
  
  return () => clearInterval(saveInterval);
}, [currentAttempt, timeLeft, flagged, qIndex]);
```

**Resume on return:**
```typescript
// AppContext — Check for saved quiz on app load
function checkForSavedQuiz(): SavedQuizState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ATTEMPT);
    if (!saved) return null;
    const state = JSON.parse(saved) as SavedQuizState;
    // Discard if saved more than 24 hours ago
    if (Date.now() - state.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ATTEMPT);
      return null;
    }
    return state;
  } catch {
    return null;
  }
}
```

**Timer correction on resume** (actual elapsed time, not trust the saved value):
```typescript
// When resuming a saved quiz, recalculate actual time remaining
const resumeQuiz = (savedState: SavedQuizState) => {
  const elapsedSinceLastSave = Math.floor((Date.now() - savedState.savedAt) / 1000);
  const actualTimeLeft = Math.max(0, savedState.timeLeft - elapsedSinceLastSave);
  setTimeLeft(actualTimeLeft);
  // If time ran out while user was away → auto-submit immediately
  if (actualTimeLeft === 0) handleSubmit();
};
```

---

## 3. Complete Type System (`mockData.ts` Redesign)

### 3.1 Current State (v1.0) vs Required (v2.0)

```typescript
// v1.0 — CURRENT (keep for reference, will be removed)
type Standard = "10" | "12";
type PaperType = "board" | "model" | "practice";

// v2.0 — REQUIRED (full expansion)
```

### 3.2 New Core Enumerations

```typescript
// ─────────────────────────────────────────────
// STANDARDS (Maharashtra Board classes)
// ─────────────────────────────────────────────
export type Standard = "8" | "9" | "10" | "11" | "12";

// ─────────────────────────────────────────────
// STREAMS (applies to Standard 11 and 12 only)
// ─────────────────────────────────────────────
export type Stream =
  | "science-pcb"    // Physics, Chemistry, Biology → NEET, CET PCB
  | "science-pcm"    // Physics, Chemistry, Math & Stats → JEE, CET PCM
  | "science-pcbm"   // Both Biology AND Math (combo students)
  | "commerce"       // Accountancy, OCM, Economics
  | "arts"           // History, Geography, Political Science, etc.
  | "general";       // For classes 8–10 (no stream yet)

// ─────────────────────────────────────────────
// MEDIUM OF INSTRUCTION (Board exams only)
// ─────────────────────────────────────────────
export type Medium = "english" | "semi-english" | "marathi";

// ─────────────────────────────────────────────
// GOAL CATEGORY (Top-level exam type)
// This is the fundamental new concept in v2.0.
// Every piece of content is tagged to a GoalCategory.
// ─────────────────────────────────────────────
export type GoalCategory =
  | "board"           // Maharashtra State Board (Class 8–12, any standard/stream)
  | "neet"            // NEET UG (National — Physics, Chemistry, Botany, Zoology)
  | "jee-mains"       // JEE Mains (National — Physics, Chemistry, Mathematics)
  | "jee-advanced"    // JEE Advanced (National — Physics, Chemistry, Mathematics)
  | "mht-cet-pcb"     // MHT-CET Biology group (Maharashtra state)
  | "mht-cet-pcm";    // MHT-CET Engineering group (Maharashtra state)

// ─────────────────────────────────────────────
// PAPER TYPES — Full taxonomy
// ─────────────────────────────────────────────
export type PaperType =
  // Board exam paper types (Class 8–12)
  | "unit-test"       // Monthly school test: 1–2 chapters, 20–25 marks, 45–60 min
  | "semester"        // Mid-year: half-syllabus, 40–80 marks, 2–3 hours
  | "prelims"         // Pre-board full-syllabus mock: 80 marks, 3 hours
  | "board"           // Official MSBSHSE board exam: 80 marks, 3 hours
  | "model"           // Official MSBSHSE sample paper
  | "practice"        // Platform-generated extra practice
  | "pyq"             // Previous Year Question Paper (official, year-specific)
  // Competitive exam paper types (NEET, JEE, CET)
  | "mock-test"       // Full-length mock matching official exam pattern
  | "chapter-wise"    // Single chapter/topic deep-dive
  | "subject-wise"    // All chapters of one subject
  | "minor-test"      // Coaching-style: 2–4 chapters, 1 hour
  | "major-test";     // Coaching-style: multi-unit, 2–3 hours

// ─────────────────────────────────────────────
// DIFFICULTY (for quizzes)
// ─────────────────────────────────────────────
export type Difficulty = "easy" | "medium" | "hard" | "mixed";

// ─────────────────────────────────────────────
// QUIZ STATUS
// ─────────────────────────────────────────────
export type QuizStatus = "draft" | "published" | "scheduled";

// ─────────────────────────────────────────────
// QUESTION TYPE (supports JEE Numerical)
// ─────────────────────────────────────────────
export type QuestionType = "mcq" | "numerical";

// ─────────────────────────────────────────────
// ANNOUNCEMENT PRIORITY
// ─────────────────────────────────────────────
export type AnnouncementPriority = "normal" | "important" | "urgent";
```

### 3.3 Goal Interface

The `Goal` is the central new concept. Every student has 1+ Goals.

```typescript
export interface Goal {
  id: string;                    // Unique: "g_board_12_pcb_english", "g_neet_2027"
  category: GoalCategory;        // The exam type
  
  // Board-specific fields (only when category === "board")
  standard?: Standard;           // "8" | "9" | "10" | "11" | "12"
  stream?: Stream;               // For std 11, 12 only
  medium?: Medium;               // Language of instruction
  
  // Competitive-specific fields (only when category !== "board")
  targetYear?: number;           // e.g., 2027 (year of exam attempt)
  session?: "jan" | "apr";       // For JEE Mains (January or April session)
  
  // Display
  label: string;                 // "12th HSC Board (English)" or "NEET UG 2027"
  shortLabel: string;            // "12th HSC" or "NEET 2027" (for chips/badges)
  icon: string;                  // Emoji icon: "📚" for board, "🩺" for NEET, etc.
  color: string;                 // Hex color for badge: "#1E3A8A", "#16A34A", etc.
  bgColor: string;               // Light background: "#EFF6FF", "#F0FDF4", etc.
  
  // Tracking
  enrolledAt: string;            // ISO date string
  examDate?: string;             // Target exam date for countdown: "2027-05-02"
}
```

**Goal label generation helper:**
```typescript
export function buildGoalLabel(category: GoalCategory, standard?: Standard, stream?: Stream, medium?: Medium, targetYear?: number): string {
  if (category === "board") {
    const stdLabel = standard ? `${standard}th` : "";
    const boardName = standard === "10" ? "SSC" : standard === "12" ? "HSC" : "Board";
    const medLabel = medium === "marathi" ? " (Marathi)" : medium === "semi-english" ? " (Semi-Eng)" : " (English)";
    return `Class ${stdLabel} ${boardName}${medLabel}`;
  }
  const labels: Record<GoalCategory, string> = {
    "board": "",
    "neet": `NEET UG ${targetYear || ""}`,
    "jee-mains": `JEE Mains ${targetYear || ""}`,
    "jee-advanced": `JEE Advanced ${targetYear || ""}`,
    "mht-cet-pcb": `MHT-CET PCB ${targetYear || ""}`,
    "mht-cet-pcm": `MHT-CET PCM ${targetYear || ""}`,
  };
  return labels[category].trim();
}
```

### 3.4 Marking Scheme System

```typescript
// ─────────────────────────────────────────────
// MARKING SCHEME — Core to NEET/JEE negative marking
// ─────────────────────────────────────────────
export interface MarkingScheme {
  correctMarks: number;        // Points for correct answer (positive)
  wrongMarks: number;          // Points for wrong answer (negative = deduction, 0 = no penalty)
  unattemptedMarks: number;    // Points for skipped (always 0 in Indian exams)
  partialMarks?: number;       // For JEE Advanced multiple-correct (partial credit)
  label: string;               // Display: "+4 / −1 (NEET)" or "+1 / 0 (Board)"
  examStandard: GoalCategory;  // Which exam this is for
}

// ─────────────────────────────────────────────
// PRESET MARKING SCHEMES (use these, don't hardcode)
// ─────────────────────────────────────────────
export const MARKING_SCHEMES: Record<string, MarkingScheme> = {
  board: {
    correctMarks: 1, wrongMarks: 0, unattemptedMarks: 0,
    label: "+1 / 0 (Board)", examStandard: "board",
  },
  neet: {
    correctMarks: 4, wrongMarks: -1, unattemptedMarks: 0,
    label: "+4 / −1 (NEET)", examStandard: "neet",
  },
  jee_mains_mcq: {
    correctMarks: 4, wrongMarks: -1, unattemptedMarks: 0,
    label: "+4 / −1 (JEE MCQ)", examStandard: "jee-mains",
  },
  jee_mains_numerical: {
    correctMarks: 4, wrongMarks: 0, unattemptedMarks: 0,   // No negative on numerical
    label: "+4 / 0 (JEE Numerical)", examStandard: "jee-mains",
  },
  jee_advanced_single: {
    correctMarks: 3, wrongMarks: -1, unattemptedMarks: 0,
    label: "+3 / −1 (JEE Adv. Single)", examStandard: "jee-advanced",
  },
  jee_advanced_multiple: {
    correctMarks: 4, wrongMarks: -2, unattemptedMarks: 0, partialMarks: 1,
    label: "+4 / −2 (JEE Adv. Multi)", examStandard: "jee-advanced",
  },
  mht_cet_pcm: {
    correctMarks: 2, wrongMarks: 0, unattemptedMarks: 0,
    label: "+2 / 0 (MHT-CET Math)", examStandard: "mht-cet-pcm",
  },
  mht_cet_pcb: {
    correctMarks: 1, wrongMarks: 0, unattemptedMarks: 0,
    label: "+1 / 0 (MHT-CET PCB)", examStandard: "mht-cet-pcb",
  },
} as const;

// ─────────────────────────────────────────────
// GOAL CATEGORY → DEFAULT MARKING SCHEME mapping
// Used in AdminQuizzes when admin picks a category
// ─────────────────────────────────────────────
export const DEFAULT_MARKING_SCHEME: Record<GoalCategory, MarkingScheme> = {
  "board":        MARKING_SCHEMES.board,
  "neet":         MARKING_SCHEMES.neet,
  "jee-mains":    MARKING_SCHEMES.jee_mains_mcq,
  "jee-advanced": MARKING_SCHEMES.jee_advanced_single,
  "mht-cet-pcb":  MARKING_SCHEMES.mht_cet_pcb,
  "mht-cet-pcm":  MARKING_SCHEMES.mht_cet_pcm,
};
```

### 3.5 Updated Subject Interface

```typescript
export interface Subject {
  id: string;
  name: string;
  goalCategory: GoalCategory;   // Which exam this subject belongs to (REPLACES standard)
  standard?: Standard;          // Only for board subjects (null for NEET Physics, etc.)
  stream?: Stream;              // Only for 11th/12th board subjects
  icon: string;                 // Emoji icon
  color: string;                // Hex color for progress ring
  bgColor: string;              // Light background color
  chaptersCount: number;        // Total chapters count
}
```

### 3.6 Updated Chapter Interface

```typescript
export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  number: number;
  description?: string;          // Optional brief description
  isImportant?: boolean;         // Mark high-weightage chapters (e.g., JEE important topics)
}
```

### 3.7 Updated Paper Interface

```typescript
export interface Paper {
  id: string;
  title: string;
  goalCategory: GoalCategory;    // REPLACES standard — which exam this paper is for
  
  // Board-specific metadata (only when goalCategory === "board")
  standard?: Standard;
  stream?: Stream;
  medium?: Medium;
  
  // Competitive-specific metadata
  examName?: string;             // "NEET UG 2024", "JEE Mains Jan 2024 Shift 1"
  shift?: string;                // "Shift 1" | "Shift 2" | "Paper 1" | "Paper 2"
  session?: string;              // "January" | "April" (JEE Mains)
  
  // Common fields
  subject: string;               // Subject display name
  subjectId: string;             // Subject foreign key
  chapter?: string;              // Only for unit-test/chapter-wise papers
  chapterId?: string;            // Chapter foreign key for above
  year: number;                  // Year of exam: 2024
  type: PaperType;               // Full 12-type taxonomy
  marks: number;                 // Total marks (80 for board, 720 for NEET, etc.)
  durationMinutes: number;       // Exam duration
  status: "draft" | "published";
  analytics: {
    views: number;
    downloads: number;
    bookmarks: number;
  };
  pdfUrl?: string;               // URL to PDF (mock: undefined for now)
  createdAt: string;             // ISO date string
  updatedAt?: string;            // Last updated ISO date string
}
```

### 3.8 Updated Question Interface

```typescript
export interface Question {
  id: string;
  text: string;                  // Question text (plain text or LaTeX)
  
  // For MCQ questions (type === "mcq" or undefined)
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: "A" | "B" | "C" | "D";
  
  // For JEE Numerical questions (type === "numerical")
  questionType?: QuestionType;   // "mcq" (default) or "numerical"
  numericalAnswer?: number;      // Exact answer for numerical type
  numericalTolerance?: number;   // Acceptable range: e.g., 0.01 for 3.14±0.01
  
  // Common
  explanation: string;           // Shown in practice mode and review mode
  marks: number;                 // Per-question marks (usually 1, but 2 for MHT-CET Math)
  difficulty?: Difficulty;       // Per-question difficulty tag
  chapter?: string;              // Chapter this question belongs to
  subjectTag?: string;           // For tagging in mixed quizzes
  
  // JEE Advanced multi-correct support
  correctOptions?: ("A" | "B" | "C" | "D")[];  // For multiple-correct MCQ type
  isMultiCorrect?: boolean;      // Flags JEE Advanced multi-correct questions
}
```

### 3.9 Updated Quiz Interface

```typescript
export interface Quiz {
  id: string;
  title: string;
  goalCategory: GoalCategory;    // REPLACES standard
  
  // Board-specific (only when goalCategory === "board")
  standard?: Standard;
  stream?: Stream;
  
  // Content
  subject: string;
  subjectId: string;
  chapter: string;               // "Full Syllabus" if not chapter-specific
  chapterId?: string;
  
  // Quiz settings
  difficulty: Difficulty;
  timeLimitMinutes: number;      // 0 = untimed
  totalMarks: number;            // Auto-calculated from questions
  questionsCount: number;        // Informational (should match questions.length)
  markingScheme: MarkingScheme;  // ← NEW: required for all quizzes
  instructions: string;          // Shown before quiz starts
  tags?: string[];               // Free-text search tags
  
  // Status
  status: QuizStatus;
  publishedAt?: string;          // When it went live
  scheduledFor?: string;         // If status === "scheduled"
  
  // Analytics
  analytics: {
    totalAttempts: number;
    avgScore: number;
    avgPercentile?: number;
    avgTimeSeconds?: number;     // Average time to complete
  };
  
  createdAt: string;
  questions: Question[];
}
```

### 3.10 Updated Announcement Interface

```typescript
export interface Announcement {
  id: string;
  title: string;
  body: string;
  targetGoals: GoalCategory[] | ["all"];  // REPLACES targetAudience: "all"|"10"|"12"
  priority: AnnouncementPriority;         // "normal" | "important" | "urgent"
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  
  // Visual differentiation
  // priority === "normal"    → gray badge, no highlight border
  // priority === "important" → amber badge, amber left border
  // priority === "urgent"    → red badge + pulsing dot, red left border
}
```

### 3.11 Updated Student Interface (Admin view)

```typescript
export interface Student {
  id: string;
  name: string;
  email: string;
  goals: Goal[];                 // REPLACES single standard — full goal array
  streak: number;
  isBlocked: boolean;
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt: string;
  totalAttempts: number;
  avgScore: number;
}
```

### 3.12 Updated QuizAttempt Interface

```typescript
export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  goalCategory: GoalCategory;   // NEW: for filtering attempts by exam type
  mode: "practice" | "exam";
  
  // Scores (now using markingScheme, not just raw count)
  totalScore: number;           // Net score after negative marking
  maxScore: number;             // Maximum possible score
  percentage: number;           // (totalScore / maxScore) * 100
  percentile?: number;          // NEW: compared to all past attempts for same quiz
  
  // Breakdown for display
  correctCount: number;         // NEW: Number of correct answers
  wrongCount: number;           // NEW: Number of wrong answers
  skippedCount: number;         // NEW: Number of unattempted
  negativeMarks: number;        // NEW: Total marks deducted
  
  // Timing
  timeTakenSeconds: number;
  isCompleted: boolean;
  submittedAt: string;
  
  answers: {
    questionId: string;
    selectedOption: "A" | "B" | "C" | "D" | null;
    numericalInput?: number;     // For JEE numerical questions
    isCorrect: boolean;
    marksAwarded: number;        // Can be negative for wrong answers
    timeSpentSeconds?: number;   // Per-question timing (optional)
  }[];
}
```

### 3.13 Mock Data Requirements

**New data to add to mockData.ts:**

**Subjects — New entries needed:**
```
Board 8th (goalCategory: "board", standard: "8", stream: "general"):
  Mathematics, Science & Technology, English, Marathi, History & Political Science, Geography

Board 9th (goalCategory: "board", standard: "9", stream: "general"):
  Mathematics, Science & Technology, English, Marathi, History & Political Science, Geography

Board 11th PCB (goalCategory: "board", standard: "11", stream: "science-pcb"):
  Physics, Chemistry, Biology, English

Board 11th PCM (goalCategory: "board", standard: "11", stream: "science-pcm"):
  Physics, Chemistry, Mathematics & Statistics, English

NEET (goalCategory: "neet"):
  Physics, Chemistry, Botany, Zoology

JEE Mains (goalCategory: "jee-mains"):
  Physics, Chemistry, Mathematics

JEE Advanced (goalCategory: "jee-advanced"):
  Physics, Chemistry, Mathematics

MHT-CET PCB (goalCategory: "mht-cet-pcb"):
  Physics, Chemistry, Biology

MHT-CET PCM (goalCategory: "mht-cet-pcm"):
  Physics, Chemistry, Mathematics
```

**Question banks to add:**
```typescript
// NEET-pattern questions (+4/-1, biology emphasis)
const neetPhysicsQuestions: Question[]  // 15 questions
const neetChemistryQuestions: Question[] // 15 questions
const neetBotanyQuestions: Question[]    // 15 questions
const neetZoologyQuestions: Question[]   // 15 questions

// JEE-pattern questions (+4/-1, includes numerical type)
const jeeMathQuestions: Question[]       // 10 questions (8 MCQ + 2 numerical)
const jeePhysicsQuestions: Question[]    // 10 questions
const jeeChemQuestions: Question[]       // 10 questions
```

---

## 4. AppContext Redesign (`AppContext.tsx`)

### 4.1 Updated User Interface

```typescript
// AppContext.tsx
export interface User {
  id: string;
  name: string;
  email: string;
  
  // REMOVED: standard: Standard   ← Single standard no longer valid
  // REMOVED: medium: Medium        ← Captured per-goal now
  // REMOVED: subjects: string[]    ← Captured per-goal now
  
  // ADDED: Multi-goal system
  goals: Goal[];                 // All goals the student has enrolled in (min 1)
  currentGoal: Goal;             // The currently active goal (drives content filtering)
  
  // Profile
  streak: number;
  isAdmin: boolean;
  avatar?: string;               // Future: profile picture URL
  
  // Preferences
  preferredLanguage?: "en" | "mr";  // UI language preference (future)
}
```

### 4.2 Updated ActiveAttempt Interface

```typescript
export interface ActiveAttempt {
  quizId: string;
  mode: "practice" | "exam";
  answers: Record<string, "A" | "B" | "C" | "D" | null>;
  numericalAnswers?: Record<string, number>;    // NEW: for JEE numerical
  flagged: Set<string>;                         // NEW: question IDs flagged for review
  currentQuestion: number;                      // NEW: persist navigation position
  startedAt: Date;
  
  // Resume state
  savedAt?: number;                             // Timestamp of last localStorage save
}
```

### 4.3 Updated AppContextType

```typescript
interface AppContextType {
  // ── Navigation ──────────────────────────────
  view: View;
  setView: (v: View) => void;
  
  // ── Authentication ───────────────────────────
  user: User | null;
  setUser: (u: User | null) => void;
  authEmail: string;
  setAuthEmail: (e: string) => void;
  
  // ── Goal Management ──────────────────────────
  setCurrentGoal: (goal: Goal) => void;   // Switches active goal; updates localStorage
  
  // ── Content Selection ────────────────────────
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
  selectedQuizId: string | null;
  setSelectedQuizId: (id: string | null) => void;
  
  // ── Quiz Attempt State ───────────────────────
  currentAttempt: ActiveAttempt | null;
  setCurrentAttempt: (a: ActiveAttempt | null) => void;
  completedAttempts: QuizAttempt[];
  addAttempt: (a: QuizAttempt) => void;
  lastAttemptId: string | null;             // ID of most recently completed attempt
  setLastAttemptId: (id: string | null) => void;
  
  // ── Bookmarks ────────────────────────────────
  bookmarks: Bookmark[];
  toggleBookmark: (type: "paper" | "quiz", refId: string) => void;
  isBookmarked: (type: "paper" | "quiz", refId: string) => boolean;
  
  // ── Saved Quiz State (for resume banner) ─────
  savedQuizState: SavedQuizState | null;
  clearSavedQuiz: () => void;
}
```

### 4.4 setCurrentGoal Implementation

```typescript
const setCurrentGoal = (goal: Goal) => {
  // Update user object with new currentGoal
  setUser(prev => prev ? { ...prev, currentGoal: goal } : null);
  // Persist to localStorage so it survives page refresh
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_GOAL, JSON.stringify(goal));
  } catch { /* silent fail */ }
};
```

### 4.5 Updated View Type

```typescript
export type View =
  // ── Public ───────────────────────────────────────────────────────────
  | "landing" | "login" | "register" | "verify-otp"
  | "forgot-password" | "reset-password" | "onboarding"
  // ── Student ──────────────────────────────────────────────────────────
  | "dashboard"
  | "papers" | "paper-detail"
  | "quizzes" | "quiz-detail" | "quiz-attempt" | "quiz-result" | "quiz-review"
  | "bookmarks"
  | "profile"
  // ── Admin ────────────────────────────────────────────────────────────
  | "admin-login" | "admin-dashboard"
  | "admin-papers" | "admin-paper-upload" | "admin-paper-edit"
  | "admin-quizzes" | "admin-quiz-create" | "admin-quiz-edit" | "admin-quiz-preview"
  | "admin-users" | "admin-user-detail"
  | "admin-subjects"
  | "admin-announcements"
  | "admin-analytics";
```

---

## 5. Component-Level Technical Specifications

### 5.1 OnboardingFlow.tsx — Full Rebuild (7 Steps)

**Architecture:**
- State machine pattern — each step has clear in/out conditions
- Path branching: Board path, Competitive path, Both path
- Output: `user.goals[]` array (not single standard)

```typescript
// Onboarding state types
type OnboardingPath = "board" | "competitive" | "both";

interface OnboardingState {
  path: OnboardingPath | null;
  // Board choices
  standard: Standard | null;
  stream: Stream | null;
  medium: Medium | null;
  // Competitive choices
  selectedExams: GoalCategory[];     // Multi-select: NEET, JEE, CET PCB, etc.
  targetYear: number | null;         // 2025–2028
  // Common
  selectedSubjectIds: string[];      // For subject selection step
  step: number;
}
```

**Step routing logic:**
```typescript
function getNextStep(state: OnboardingState): number {
  const { step, path, standard } = state;
  
  if (step === 0) return 1;   // Always go to Step 1
  
  if (path === "board" || path === "both") {
    if (step === 1) return 2; // standard selection → stream (if 11/12) or skip to medium
    if (step === 2) {
      return (standard === "11" || standard === "12") ? 3 : 4; // stream if 11/12, else skip
    }
    if (step === 3) return 4; // stream → medium
    if (step === 4) {
      return path === "both" ? 5 : 6; // if both, go to competitive; else subjects
    }
  }
  
  if (path === "competitive" || (path === "both" && step >= 5)) {
    if (step === 5) return 5; // show competitive exam selector
    if (step === 5 && state.selectedExams.length > 0) return 6; // → target year
    if (step === 6) return 7; // → subjects
  }
  
  return step + 1;
}
```

**Step 0 — Goal Type Selection (Mobile-optimized):**
```tsx
// 3 large tappable cards (full-width on mobile, 3-col on sm:)
// Each card: 120px min-height, colored icon, title, description
// Cards: "Board Exams 📚", "Competitive Exams 🎯", "Both! 🚀"
```

**Step 2 — Standard Selection:**
```tsx
// 5 options: 8th / 9th / 10th / 11th / 12th
// Grid: grid-cols-3 on mobile, grid-cols-5 on sm:
// Each: large number + class name + MSBSHSE label
// Selecting 11 or 12: shows stream selection on SAME step below
```

**Step Output — Goal Construction:**
```typescript
function buildGoalsFromOnboarding(state: OnboardingState): Goal[] {
  const goals: Goal[] = [];
  
  if (state.path === "board" || state.path === "both") {
    goals.push({
      id: `g_board_${state.standard}_${state.stream}_${state.medium}_${Date.now()}`,
      category: "board",
      standard: state.standard!,
      stream: state.stream || "general",
      medium: state.medium!,
      label: buildGoalLabel("board", state.standard!, state.stream || undefined, state.medium!),
      shortLabel: `${state.standard}th ${state.standard === "10" ? "SSC" : state.standard === "12" ? "HSC" : "Board"}`,
      icon: "📚",
      color: "#1E3A8A",
      bgColor: "#EFF6FF",
      enrolledAt: new Date().toISOString(),
    });
  }
  
  if (state.path === "competitive" || state.path === "both") {
    for (const exam of state.selectedExams) {
      const config = GOAL_CONFIGS[exam]; // Lookup table for icon/color
      goals.push({
        id: `g_${exam}_${state.targetYear}_${Date.now()}`,
        category: exam,
        targetYear: state.targetYear!,
        label: buildGoalLabel(exam, undefined, undefined, undefined, state.targetYear!),
        shortLabel: GOAL_SHORT_LABELS[exam],
        ...config,
        enrolledAt: new Date().toISOString(),
        examDate: EXAM_DATES[exam]?.[state.targetYear!],
      });
    }
  }
  
  return goals;
}
```

---

### 5.2 StudentLayout.tsx — Goal Switcher

**Header layout (Mobile):**
```
┌─────────────────────────────────────────┐
│ [☰ Menu]  [12th HSC Board ▼]  [🔔] [👤] │  ← 56px header
└─────────────────────────────────────────┘
```

**Goal Switcher Dropdown Component:**
```typescript
interface GoalSwitcherProps {
  goals: Goal[];
  currentGoal: Goal;
  onSwitch: (goal: Goal) => void;
}

// Dropdown renders:
// 1. Current goal badge (color-coded, truncated to 20 chars on mobile)
// 2. On click: Opens bottom sheet on mobile (covers screen safely)
// 3. Lists all goals with radio-style selection
// 4. "Add New Goal" option at bottom
// 5. On desktop: standard dropdown menu (Radix UI Dropdown)
```

**Goal badge color system:**
```typescript
const GOAL_COLORS: Record<GoalCategory, { color: string; bg: string; badge: string }> = {
  "board":        { color: "#1E3A8A", bg: "#EFF6FF", badge: "bg-blue-100 text-blue-800" },
  "neet":         { color: "#16A34A", bg: "#F0FDF4", badge: "bg-green-100 text-green-800" },
  "jee-mains":    { color: "#7C3AED", bg: "#F5F3FF", badge: "bg-purple-100 text-purple-800" },
  "jee-advanced": { color: "#DC2626", bg: "#FEF2F2", badge: "bg-red-100 text-red-800" },
  "mht-cet-pcb":  { color: "#D97706", bg: "#FFFBEB", badge: "bg-amber-100 text-amber-800" },
  "mht-cet-pcm":  { color: "#0891B2", bg: "#ECFEFF", badge: "bg-cyan-100 text-cyan-800" },
};
```

---

### 5.3 Dashboard.tsx — Goal-Aware Redesign

**Data filtering (replaces current `user.standard` filtering):**
```typescript
const { user, completedAttempts } = useApp();
const goal = user!.currentGoal;

// Filter all data to current goal
const goalPapers = useMemo(() => 
  papers.filter(p => 
    p.goalCategory === goal.category &&
    p.status === "published" &&
    (goal.standard ? p.standard === goal.standard : true) &&
    (goal.medium ? p.medium === goal.medium : true)
  ), [goal]);

const goalQuizzes = useMemo(() =>
  quizzes.filter(q =>
    q.goalCategory === goal.category &&
    q.status === "published" &&
    (goal.standard ? q.standard === goal.standard : true)
  ), [goal]);

const goalAnnouncements = useMemo(() =>
  announcements.filter(a =>
    a.isActive &&
    (a.targetGoals.includes("all") || a.targetGoals.includes(goal.category))
  ), [goal]);
```

**Exam countdown calculation:**
```typescript
function getDaysToExam(goal: Goal): number | null {
  if (!goal.examDate) return null;
  const examDate = new Date(goal.examDate);
  const today = new Date();
  const diff = examDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Predefined exam dates (update yearly)
const EXAM_DATES: Partial<Record<GoalCategory, Record<number, string>>> = {
  "neet":         { 2026: "2026-05-03", 2027: "2027-05-02" },
  "jee-mains":    { 2026: "2026-01-22", 2027: "2027-01-21" },
  "jee-advanced": { 2026: "2026-05-18", 2027: "2027-05-17" },
  "mht-cet-pcm":  { 2026: "2026-04-20", 2027: "2027-04-19" },
  "mht-cet-pcb":  { 2026: "2026-04-25", 2027: "2027-04-24" },
};
```

**Dynamic subject progress (derived from attempts, not hardcoded):**
```typescript
const subjectProgressData = useMemo(() => {
  const goalSubjects = subjects.filter(s => 
    s.goalCategory === goal.category &&
    (goal.standard ? s.standard === goal.standard : true)
  );
  
  return goalSubjects.map(subject => {
    const subjectQuizzes = goalQuizzes.filter(q => q.subjectId === subject.id);
    const attempted = completedAttempts.filter(a => 
      subjectQuizzes.some(q => q.id === a.quizId)
    );
    const totalQuizzes = subjectQuizzes.length;
    const attempted_count = new Set(attempted.map(a => a.quizId)).size; // unique quizzes
    const avgScore = attempted.length > 0
      ? attempted.reduce((sum, a) => sum + a.percentage, 0) / attempted.length
      : 0;
    
    return {
      subject: subject.name,
      icon: subject.icon,
      progress: totalQuizzes > 0 ? Math.round((attempted_count / totalQuizzes) * 100) : 0,
      quizzesAttempted: attempted_count,
      totalQuizzes,
      avgScore: Math.round(avgScore),
      color: subject.color,
    };
  });
}, [goal, goalQuizzes, completedAttempts, subjects]);
```

**Resume quiz banner (mobile-prominent):**
```typescript
// Check if there's an active attempt saved
const { currentAttempt, savedQuizState } = useApp();

// Show banner if either is present
const resumeBannerQuiz = currentAttempt 
  ? quizzes.find(q => q.id === currentAttempt.quizId)
  : savedQuizState 
    ? quizzes.find(q => q.id === savedQuizState.quizId)
    : null;
```

---

### 5.4 PapersList.tsx — Extended Filters

**Filter state:**
```typescript
// All filter state
const [search, setSearch] = useState("");
const [filterPaperType, setFilterPaperType] = useState<PaperType | "">("");
const [filterSubject, setFilterSubject] = useState("");
const [filterYear, setFilterYear] = useState<number | "">("");
const [filterMedium, setFilterMedium] = useState<Medium | "">("");
const [filterStream, setFilterStream] = useState<Stream | "">("");  // NEW
const [filterSession, setFilterSession] = useState("");             // NEW (JEE)
const [showFilterSheet, setShowFilterSheet] = useState(false);      // Mobile bottom sheet
const [sortBy, setSortBy] = useState<"popular" | "newest" | "year-desc" | "year-asc">("popular");
const [page, setPage] = useState(1);
```

**Filter logic (goal-aware):**
```typescript
const filtered = useMemo(() => {
  const goal = user!.currentGoal;
  
  return papers.filter(p => {
    // Must match current goal category
    if (p.goalCategory !== goal.category) return false;
    if (p.status !== "published") return false;
    
    // Board-specific filters
    if (goal.category === "board") {
      if (goal.standard && p.standard !== goal.standard) return false;
      if (filterMedium && p.medium !== filterMedium) return false;
      if (filterStream && p.stream !== filterStream) return false;
    }
    
    // Common filters
    if (filterPaperType && p.type !== filterPaperType) return false;
    if (filterSubject && p.subjectId !== filterSubject) return false;
    if (filterYear && p.year !== filterYear) return false;
    
    // JEE-specific
    if (filterSession && p.session !== filterSession) return false;
    
    // Text search
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) &&
          !p.subject.toLowerCase().includes(q) &&
          !(p.examName?.toLowerCase().includes(q))) return false;
    }
    
    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "year-desc") return b.year - a.year;
    if (sortBy === "year-asc") return a.year - b.year;
    return b.analytics.views - a.analytics.views; // popular (default)
  });
}, [papers, user, filterPaperType, filterSubject, filterYear, filterMedium, filterStream, filterSession, search, sortBy]);
```

**Paper type badge colors (all 12 types):**
```typescript
const PAPER_TYPE_STYLES: Record<PaperType, { label: string; className: string }> = {
  "unit-test":    { label: "Unit Test",     className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  "semester":     { label: "Semester",      className: "bg-blue-100 text-blue-800 border-blue-200" },
  "prelims":      { label: "Prelims",       className: "bg-purple-100 text-purple-800 border-purple-200" },
  "board":        { label: "Board Exam",    className: "bg-red-100 text-red-800 border-red-200" },
  "model":        { label: "Model Paper",   className: "bg-green-100 text-green-800 border-green-200" },
  "practice":     { label: "Practice",      className: "bg-gray-100 text-gray-700 border-gray-200" },
  "pyq":          { label: "PYQ",           className: "bg-orange-100 text-orange-800 border-orange-200" },
  "mock-test":    { label: "Mock Test",     className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  "chapter-wise": { label: "Chapter-wise",  className: "bg-teal-100 text-teal-800 border-teal-200" },
  "subject-wise": { label: "Subject-wise",  className: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  "minor-test":   { label: "Minor Test",    className: "bg-pink-100 text-pink-800 border-pink-200" },
  "major-test":   { label: "Major Test",    className: "bg-rose-100 text-rose-800 border-rose-200" },
};
```

**Mobile filter UI (bottom sheet pattern — see section 2.6):**
```
On mobile (< 640px):
  → Floating "Filter + Sort" button at bottom-left
  → Tapping opens FilterBottomSheet
  → Active filter count shown as badge: "Filter (3)"

On desktop (≥ 640px):
  → Inline collapsible filter panel above results
```

---

### 5.5 QuizEngine.tsx — Marking Scheme + Navigator

#### 5.5.1 Score Calculation with Negative Marking

**Replace current (v1.0) calculation:**
```typescript
// ❌ v1.0 — No negative marking
marksAwarded: answers[q.id] === q.correctOption ? q.marks : 0

// ✅ v2.0 — Uses marking scheme
function calculateMarksForQuestion(
  answer: "A" | "B" | "C" | "D" | null,
  correctOption: "A" | "B" | "C" | "D",
  scheme: MarkingScheme,
  questionMarks: number
): number {
  if (answer === null) return scheme.unattemptedMarks * questionMarks;
  if (answer === correctOption) return scheme.correctMarks * questionMarks;
  return scheme.wrongMarks * questionMarks;  // Negative value for NEET/JEE
}

// Total score clamping: For board exams, score can't go below 0
// For NEET/JEE, score CAN be negative (show as 0 for display but store actual)
const rawScore = attemptAnswers.reduce((sum, a) => sum + a.marksAwarded, 0);
const displayScore = Math.max(0, rawScore);    // For display
const netScore = rawScore;                      // Store actual (can be negative)
```

#### 5.5.2 Pre-Quiz Screen — Marking Scheme Display

**Marking scheme must be prominently displayed BEFORE quiz starts:**
```tsx
// QuizDetail.tsx — Marking scheme info box
<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
  <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
    <AlertCircle size={13} /> Marking Scheme
  </p>
  <div className="grid grid-cols-3 gap-2 text-center text-xs">
    <div className="bg-green-100 rounded-lg p-2">
      <div className="font-bold text-green-700 text-base">+{quiz.markingScheme.correctMarks}</div>
      <div className="text-green-600">Correct</div>
    </div>
    <div className={`rounded-lg p-2 ${quiz.markingScheme.wrongMarks < 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
      <div className={`font-bold text-base ${quiz.markingScheme.wrongMarks < 0 ? 'text-red-700' : 'text-gray-600'}`}>
        {quiz.markingScheme.wrongMarks > 0 ? '+' : ''}{quiz.markingScheme.wrongMarks}
      </div>
      <div className={quiz.markingScheme.wrongMarks < 0 ? 'text-red-600' : 'text-gray-500'}>Wrong</div>
    </div>
    <div className="bg-gray-100 rounded-lg p-2">
      <div className="font-bold text-gray-600 text-base">0</div>
      <div className="text-gray-500">Skipped</div>
    </div>
  </div>
  {quiz.markingScheme.wrongMarks < 0 && (
    <p className="text-xs text-amber-700 mt-2 font-medium">
      ⚠️ Negative marking applies — wrong answers deduct marks!
    </p>
  )}
</div>
```

#### 5.5.3 Quiz Timer — Mobile-Specific Behavior

```typescript
// Timer state (use useRef to avoid triggering re-renders on every second)
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
const timeLeftRef = useRef(initialTimeSeconds);
const [displayTime, setDisplayTime] = useState(initialTimeSeconds); // Only for UI update

// Save timer state every 10 seconds (not every second — reduces localStorage writes)
const lastSaveRef = useRef(Date.now());

useEffect(() => {
  if (mode !== "exam") return;
  
  timerRef.current = setInterval(() => {
    timeLeftRef.current -= 1;
    setDisplayTime(timeLeftRef.current);
    
    // Auto-submit at 0
    if (timeLeftRef.current <= 0) {
      clearInterval(timerRef.current!);
      handleSubmit();
      return;
    }
    
    // Save to localStorage every 10 seconds
    const now = Date.now();
    if (now - lastSaveRef.current >= 10000) {
      saveQuizState();
      lastSaveRef.current = now;
    }
  }, 1000);
  
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [mode]);

// Timer color thresholds
const timerColorClass = displayTime > 600 
  ? "bg-blue-50 text-blue-700"           // > 10 min: calm blue
  : displayTime > 300
  ? "bg-amber-50 text-amber-700"         // 5–10 min: warning amber
  : "bg-red-50 text-red-700 animate-pulse"; // < 5 min: urgent red + pulse
```

#### 5.5.4 Question Navigator — Mobile Bottom Sheet

```tsx
// On mobile: Floating pill button that opens navigator as bottom sheet
// On desktop: Always-visible side panel

// Mobile trigger (always visible at bottom of screen during quiz)
<div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:hidden z-30">
  <button 
    onClick={() => setShowNavigator(true)}
    className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-lg min-h-[44px]"
  >
    <Grid size={14} />
    Q {qIndex + 1}/{quiz.questions.length} · View All
    {flagged.size > 0 && (
      <span className="bg-orange-400 text-white text-xs px-1.5 py-0.5 rounded-full">
        {flagged.size}⚑
      </span>
    )}
  </button>
</div>

// Navigator bottom sheet (mobile)
<div className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white rounded-t-3xl 
  shadow-2xl transform transition-transform duration-300
  ${showNavigator ? 'translate-y-0' : 'translate-y-full'}`}
>
  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
  <div className="px-4 pb-6 max-h-[60vh] overflow-y-auto">
    {/* Status bar */}
    <div className="flex justify-between text-sm mb-4 text-gray-600">
      <span>✅ Answered: {Object.values(answers).filter(Boolean).length}</span>
      <span>⚑ Flagged: {flagged.size}</span>
      <span>⬜ Remaining: {quiz.questions.length - Object.values(answers).filter(Boolean).length}</span>
    </div>
    
    {/* Question grid — 8 columns on mobile */}
    <div className="grid grid-cols-8 gap-1.5 mb-4">
      {quiz.questions.map((q, i) => {
        const isAnswered = q.id in answers && answers[q.id] !== null;
        const isFlagged = flagged.has(q.id);
        const isCurrent = i === qIndex;
        return (
          <button
            key={q.id}
            onClick={() => { setQIndex(i); setShowNavigator(false); }}
            className={`
              aspect-square rounded-lg text-xs font-semibold min-h-[36px]
              transition-all
              ${isCurrent ? 'bg-[#1E3A8A] text-white' :
                isAnswered ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                isFlagged ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                'bg-gray-50 text-gray-500 border border-gray-200'}
            `}
          >
            {isFlagged ? '⚑' : i + 1}
          </button>
        );
      })}
    </div>
    
    {/* Legend */}
    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-50 border border-blue-200 rounded inline-block" /> Answered</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-50 border border-gray-200 rounded inline-block" /> Not visited</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-50 border border-orange-200 rounded inline-block" /> Flagged</span>
    </div>
    
    {/* Submit from navigator */}
    {mode === "exam" && (
      <button onClick={handleSubmit} className="w-full bg-[#F97316] text-white py-3 rounded-xl font-semibold text-sm min-h-[44px]">
        Submit Quiz
      </button>
    )}
  </div>
</div>
```

#### 5.5.5 Result Page — Score Breakdown (NEET/JEE pattern)

```tsx
// QuizResult.tsx — Detailed score breakdown
// Always show this breakdown (not just % circle)
<div className="bg-gray-50 rounded-xl p-4 mb-5">
  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Score Breakdown</p>
  <div className="space-y-2 text-sm">
    <div className="flex justify-between items-center">
      <span className="text-green-700 flex items-center gap-1.5">
        <CheckCircle size={14} /> Correct × +{quiz.markingScheme.correctMarks}
      </span>
      <span className="font-semibold text-green-700">
        {attempt.correctCount} × {quiz.markingScheme.correctMarks} = +{attempt.correctCount * quiz.markingScheme.correctMarks}
      </span>
    </div>
    {quiz.markingScheme.wrongMarks < 0 && (
      <div className="flex justify-between items-center">
        <span className="text-red-600 flex items-center gap-1.5">
          <XCircle size={14} /> Wrong × {quiz.markingScheme.wrongMarks}
        </span>
        <span className="font-semibold text-red-600">
          {attempt.wrongCount} × ({quiz.markingScheme.wrongMarks}) = {attempt.negativeMarks}
        </span>
      </div>
    )}
    <div className="flex justify-between items-center text-gray-500">
      <span>Skipped</span>
      <span>{attempt.skippedCount} × 0 = 0</span>
    </div>
    <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-semibold">
      <span className="text-[#1E3A8A]">Net Score</span>
      <span className="text-[#1E3A8A] text-lg">{attempt.totalScore} / {attempt.maxScore}</span>
    </div>
  </div>
</div>

{/* Percentile (if available) */}
{attempt.percentile !== undefined && (
  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-center">
    <p className="text-xs text-blue-600 mb-1">Your Percentile</p>
    <p className="text-3xl font-bold text-[#1E3A8A]">{attempt.percentile}th</p>
    <p className="text-xs text-blue-600 mt-1">
      You scored better than {attempt.percentile}% of students who attempted this quiz
    </p>
  </div>
)}
```

#### 5.5.6 Percentile Calculation

```typescript
function calculatePercentile(score: number, allAttempts: QuizAttempt[], quizId: string): number {
  const quizAttempts = allAttempts.filter(a => a.quizId === quizId && a.isCompleted);
  if (quizAttempts.length === 0) return 100; // First attempt = 100th percentile
  const below = quizAttempts.filter(a => a.totalScore < score).length;
  const percentile = Math.round((below / quizAttempts.length) * 100);
  return Math.max(1, percentile); // Floor at 1st percentile
}
```

---

### 5.6 AdminPapers.tsx — Extended Form

**Extended form state:**
```typescript
interface PaperFormState {
  title: string;
  goalCategory: GoalCategory | "";       // NEW: replaces standard only
  standard: Standard | "";               // Conditional: only shown for board
  stream: Stream | "";                   // Conditional: only shown for board 11/12
  medium: Medium | "";                   // Conditional: only shown for board
  session: string;                       // Conditional: only shown for jee-mains
  paperNumber: string;                   // Conditional: only shown for jee-advanced
  subjectId: string;
  year: number;
  type: PaperType | "";                  // Now 12 options instead of 3
  marks: number;
  durationMinutes: number;
  examName: string;                      // Auto-suggested from other fields
  status: "draft" | "published";
}
```

**Auto-suggest examName:**
```typescript
useEffect(() => {
  if (!formData.goalCategory || formData.goalCategory === "board") return;
  const year = formData.year;
  const session = formData.session ? ` ${formData.session}` : "";
  const suggestions: Partial<Record<GoalCategory, string>> = {
    "neet": `NEET UG ${year}`,
    "jee-mains": `JEE Mains${session} ${year}`,
    "jee-advanced": `JEE Advanced ${year}`,
    "mht-cet-pcm": `MHT-CET PCM ${year}`,
    "mht-cet-pcb": `MHT-CET PCB ${year}`,
  };
  if (!formData.examName) {
    setFormData(p => ({ ...p, examName: suggestions[formData.goalCategory as GoalCategory] || "" }));
  }
}, [formData.goalCategory, formData.year, formData.session]);
```

---

### 5.7 AdminQuizzes.tsx — Marking Scheme Builder

```tsx
// Marking scheme section in quiz form
<section className="border border-gray-100 rounded-xl p-4 mb-4">
  <h4 className="font-semibold text-sm text-[#1E3A8A] mb-3 flex items-center gap-2">
    <Scale size={15} /> Marking Scheme
  </h4>
  
  {/* Preset selector */}
  <div className="mb-3">
    <label className="text-xs text-gray-500 mb-1 block">Preset</label>
    <select
      onChange={e => applyMarkingSchemePreset(e.target.value)}
      className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm"
    >
      <option value="">Custom</option>
      <option value="board">Board (+1 / 0)</option>
      <option value="neet">NEET (+4 / −1)</option>
      <option value="jee_mains_mcq">JEE Mains MCQ (+4 / −1)</option>
      <option value="jee_mains_numerical">JEE Mains Numerical (+4 / 0)</option>
      <option value="mht_cet_pcm">MHT-CET PCM (+2 / 0)</option>
      <option value="mht_cet_pcb">MHT-CET PCB (+1 / 0)</option>
    </select>
  </div>
  
  {/* Custom values */}
  <div className="grid grid-cols-3 gap-3">
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Correct (+)</label>
      <input type="number" step="0.5" min="0"
        value={formData.markingScheme.correctMarks}
        onChange={e => updateMarkingScheme('correctMarks', Number(e.target.value))}
        className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-green-700 font-semibold"
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Wrong (−)</label>
      <input type="number" step="0.5"
        value={formData.markingScheme.wrongMarks}
        onChange={e => updateMarkingScheme('wrongMarks', Number(e.target.value))}
        className="w-full border border-red-100 rounded-xl py-2.5 px-3 text-sm text-red-600 font-semibold"
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Skipped</label>
      <input type="number" value={0} disabled
        className="w-full border border-gray-100 rounded-xl py-2.5 px-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
      />
    </div>
  </div>
  
  {/* Live preview */}
  <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 text-center">
    Preview: {formData.markingScheme.label}
  </div>
</section>
```

---

### 5.8 AdminSubjects.tsx — 10-Tab Layout

```typescript
// Tab configuration
const SUBJECT_TABS = [
  { key: "board_8",      label: "8th Board",       category: "board" as GoalCategory, standard: "8" as Standard },
  { key: "board_9",      label: "9th Board",       category: "board" as GoalCategory, standard: "9" as Standard },
  { key: "board_10",     label: "10th SSC",        category: "board" as GoalCategory, standard: "10" as Standard },
  { key: "board_11",     label: "11th Board",      category: "board" as GoalCategory, standard: "11" as Standard },
  { key: "board_12",     label: "12th HSC",        category: "board" as GoalCategory, standard: "12" as Standard },
  { key: "neet",         label: "NEET UG",         category: "neet" as GoalCategory, standard: undefined },
  { key: "jee_mains",    label: "JEE Mains",       category: "jee-mains" as GoalCategory, standard: undefined },
  { key: "jee_adv",      label: "JEE Advanced",    category: "jee-advanced" as GoalCategory, standard: undefined },
  { key: "cet_pcb",      label: "CET PCB",         category: "mht-cet-pcb" as GoalCategory, standard: undefined },
  { key: "cet_pcm",      label: "CET PCM",         category: "mht-cet-pcm" as GoalCategory, standard: undefined },
] as const;

// Mobile: Horizontal scrollable tabs (overflow-x-auto)
// Desktop: All tabs visible side-by-side
```

---

### 5.9 AdminAnnouncements.tsx — Multi-Goal Targeting

```typescript
// Replace: targetAudience: "all" | "10" | "12"  (single dropdown)
// With:    targetGoals: GoalCategory[] | ["all"]  (multi-select checkboxes)

const TARGET_OPTIONS: { value: GoalCategory | "all"; label: string; icon: string }[] = [
  { value: "all",          label: "All Students",    icon: "👥" },
  { value: "board",        label: "Board (All Classes)", icon: "📚" },
  { value: "neet",         label: "NEET UG",         icon: "🩺" },
  { value: "jee-mains",    label: "JEE Mains",       icon: "🔬" },
  { value: "jee-advanced", label: "JEE Advanced",    icon: "🏆" },
  { value: "mht-cet-pcb",  label: "MHT-CET PCB",    icon: "🧬" },
  { value: "mht-cet-pcm",  label: "MHT-CET PCM",    icon: "📐" },
];

// Priority visual treatment
const PRIORITY_STYLES: Record<AnnouncementPriority, string> = {
  normal:    "border-l-4 border-gray-200 bg-gray-50",
  important: "border-l-4 border-amber-400 bg-amber-50",
  urgent:    "border-l-4 border-red-500 bg-red-50",
};
```

---

## 6. State Flow Diagrams

### 6.1 Complete Navigation State Machine

```
Public
  "landing" ─[Login btn]──────────────────────────────► "login"
  "landing" ─[Register btn]──────────────────────────► "register"
  "landing" ─[Admin Panel (footer)]──────────────────► "admin-login"
  
  "login" ─[any email/pass]───────────────────────────► "dashboard"
  "login" ─[Forgot pwd]───────────────────────────────► "forgot-password"
  "register" ─[submit]────────────────────────────────► "verify-otp"
  "verify-otp" ─[any 6-digit OTP]─────────────────────► "onboarding"
  "forgot-password" ─[submit email]───────────────────► "reset-password"
  "reset-password" ─[submit]──────────────────────────► "login"
  
  "onboarding" ─[complete 7 steps]────────────────────► "dashboard"

Student (inside StudentLayout)
  ★ All views driven by: user.currentGoal ← setCurrentGoal()
  
  "dashboard" ─[Paper card]───────────────────────────► "paper-detail"
  "dashboard" ─[Quiz card]────────────────────────────► "quiz-detail"
  "dashboard" ─[Resume quiz banner]───────────────────► "quiz-attempt"
  "papers" ─[Paper card View btn]─────────────────────► "paper-detail"
  "quizzes" ─[Quiz card]──────────────────────────────► "quiz-detail"
  "quiz-detail" ─[Start Quiz btn]─────────────────────► "quiz-attempt"
  "quiz-attempt" ─[Submit]────────────────────────────► "quiz-result"
  "quiz-result" ─[Review Answers]─────────────────────► "quiz-review"
  "quiz-result" ─[Reattempt]──────────────────────────► "quiz-attempt"
  "quiz-result" ─[Back to Quizzes]────────────────────► "quizzes"
  All views ─[Goal Switcher]──────────────────────────► (same view, new goal context)
  
Admin (inside AdminLayout)
  "admin-dashboard" ─[nav]────────────────────────────► all admin-* views
  "admin-papers" ─[Upload btn]────────────────────────► "admin-paper-upload"
  "admin-papers" ─[Edit btn]──────────────────────────► "admin-paper-edit"
  "admin-quizzes" ─[Create btn]───────────────────────► "admin-quiz-create"
  "admin-quizzes" ─[Preview]──────────────────────────► "admin-quiz-preview"
```

### 6.2 Goal-Switching Data Flow

```
User taps Goal Switcher in header
  → Dropdown opens (bottom sheet on mobile)
  → User selects Goal B (was on Goal A)
  → setCurrentGoal(goalB) called
  → AppContext updates: user.currentGoal = goalB
  → localStorage.setItem(CURRENT_GOAL, JSON.stringify(goalB))
  → React re-renders all consumers (Dashboard, PapersList, QuizList, etc.)
  → All content automatically re-filters for goalB.category
  → URL stays the same (no navigation, no page reload)
  → Goal badge in header updates to goalB color + label
```

### 6.3 Quiz Submit Data Flow

```
Student taps "Submit All Answers"
  → Confirmation dialog appears (prevent accidental submit)
  → Student confirms
  → handleSubmit() called:
      1. Calculate scores using quiz.markingScheme
         → For each question: calculateMarksForQuestion(answer, correct, scheme, marks)
      2. Build QuizAttempt object:
         → correctCount, wrongCount, skippedCount
         → negativeMarks = |wrongCount × scheme.wrongMarks|
         → totalScore = sum of all marksAwarded
         → percentage = (totalScore / quiz.totalMarks) * 100
         → percentile = calculatePercentile(totalScore, completedAttempts, quiz.id)
         → goalCategory = user.currentGoal.category
      3. addAttempt(attempt) → prepended to completedAttempts[]
      4. setLastAttemptId(attempt.id)
      5. clearInterval(timerRef.current) → stop timer
      6. localStorage.removeItem(ACTIVE_ATTEMPT) → clear saved state
      7. setCurrentAttempt(null) → clear active attempt
      8. setView("quiz-result")
  → QuizResult reads completedAttempts[0] (most recent)
  → Displays score breakdown + percentile
```

---

## 7. TypeScript Strict Compliance

### 7.1 Rules

- `strict: true` in `tsconfig.json` — already configured, must remain
- Zero `any` types (current code uses `any` in AdminPapers — must be replaced)
- All union type switches must be exhaustive (use discriminated unions)
- All optional fields explicitly typed with `?`

### 7.2 Type Guards

```typescript
// Type guard: Is this a board paper?
export function isBoardPaper(paper: Paper): paper is Paper & { standard: Standard } {
  return paper.goalCategory === "board";
}

// Type guard: Does this goal have a standard?
export function isBoardGoal(goal: Goal): goal is Goal & { standard: Standard } {
  return goal.category === "board" && goal.standard !== undefined;
}

// Type guard: Is marking scheme negative?
export function hasNegativeMarking(scheme: MarkingScheme): boolean {
  return scheme.wrongMarks < 0;
}
```

### 7.3 Exhaustive Switch Pattern

```typescript
// Use this pattern for GoalCategory switches — TypeScript will catch missing cases
function getGoalIcon(category: GoalCategory): string {
  switch (category) {
    case "board":        return "📚";
    case "neet":         return "🩺";
    case "jee-mains":    return "🔬";
    case "jee-advanced": return "🏆";
    case "mht-cet-pcb":  return "🧬";
    case "mht-cet-pcm":  return "📐";
    default: {
      // This will cause TypeScript compile error if a new GoalCategory is added without updating this switch
      const _exhaustiveCheck: never = category;
      return "📖";
    }
  }
}
```

---

## 8. Performance Optimization Details

### 8.1 useMemo Strategy

```typescript
// ✅ Memoize filtered arrays in list components (expensive re-computation)
const filteredPapers = useMemo(() => papers.filter(filterFn), [papers, filterFn]);

// ✅ Memoize computed analytics
const subjectProgress = useMemo(() => computeProgress(subjects, quizzes, attempts), 
  [subjects, quizzes, attempts]);

// ❌ Don't memoize simple string operations or JSX
const greetingText = `Welcome, ${user.name}!`; // No useMemo needed
```

### 8.2 React.memo for Heavy Components

```typescript
// Question Navigator grid can cause excessive re-renders (renders 180 buttons for NEET)
export const QuestionNavigatorGrid = React.memo(function QuestionNavigatorGrid({
  questions, answers, flagged, currentIndex, onJump
}: NavigatorGridProps) {
  // ...
}, (prevProps, nextProps) => {
  // Custom comparison — only re-render if answers or flagged changed
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    JSON.stringify(prevProps.answers) === JSON.stringify(nextProps.answers) &&
    prevProps.flagged.size === nextProps.flagged.size
  );
});
```

### 8.3 Data File Splitting

Current `mockData.ts` (292 lines) will grow to ~1500+ lines. Split into:

```
src/app/components/data/
├── mockData.ts          ← Types + interfaces + re-exports (keep as entry point)
├── subjects.ts          ← subjects[] + chapters[] arrays
├── papers.ts            ← papers[] array
├── quizzes.ts           ← quizzes[] + question banks
├── students.ts          ← students[] + announcements[]
└── analytics.ts         ← adminAnalyticsData + scoreTrendData + subjectProgress
```

```typescript
// mockData.ts — Export everything from sub-files
export * from './subjects';
export * from './papers';
export * from './quizzes';
export * from './students';
export * from './analytics';
// All type definitions remain in mockData.ts
```

---

## 9. Accessibility Requirements

### 9.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|---|---|
| Color contrast ≥ 4.5:1 | All text on white/light bg — verify `#1E3A8A` on white = 8.6:1 ✅ |
| Focus indicators | All interactive elements: `focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]` |
| Touch target ≥ 44×44px | All buttons: `min-h-[44px]` |
| Alt text on images | Logo: `alt="ParikshaCrack Logo"`, hero images: descriptive alt |
| Skip navigation | Add `<a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>` |
| Form labels | All inputs have explicit `<label>` (never placeholder-only) |
| Error messages | Use `role="alert"` on error messages |
| Loading states | Use `aria-busy="true"` and `aria-label="Loading..."` |

### 9.2 Screen Reader Support (for visually impaired students)

```tsx
// Quiz question — accessible markup
<article aria-label={`Question ${qIndex + 1} of ${quiz.questions.length}`}>
  <p id={`question-text-${q.id}`}>{q.text}</p>
  <fieldset aria-labelledby={`question-text-${q.id}`}>
    <legend className="sr-only">Select your answer</legend>
    {options.map(opt => (
      <label key={opt} className="block">
        <input 
          type="radio" 
          name={`q-${q.id}`} 
          value={opt}
          checked={answers[q.id] === opt}
          onChange={() => selectAnswer(opt)}
          aria-describedby={isPractice && hasAnswered ? `feedback-${q.id}` : undefined}
        />
        {optionText}
      </label>
    ))}
  </fieldset>
  {isPractice && hasAnswered && (
    <div id={`feedback-${q.id}`} role="status">
      {isCorrect ? "Correct!" : `Wrong. Correct answer: ${q.correctOption}.`}
      {q.explanation}
    </div>
  )}
</article>
```

---

## 10. Testing Checklist

After implementation, each item below must pass before considering v2.0 complete.

### 10.1 TypeScript Compilation
- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] No `any` types in any new code
- [ ] All new GoalCategory switches are exhaustive

### 10.2 Data Integrity
- [ ] All subjects have `goalCategory` field
- [ ] All papers have `goalCategory` field
- [ ] All quizzes have `goalCategory` AND `markingScheme` field
- [ ] All announcements have `targetGoals: GoalCategory[]` (not old `targetAudience`)
- [ ] NEET quizzes have `markingScheme = MARKING_SCHEMES.neet`
- [ ] Board quizzes have `markingScheme = MARKING_SCHEMES.board`

### 10.3 Onboarding Flow
- [ ] Student can select "Competitive" → NEET → 2027 → Subjects → reach Dashboard
- [ ] Student can select "Board" → 12th → PCB → English → Subjects → reach Dashboard
- [ ] Student can select "Both" → goes through both paths → has 2 goals
- [ ] `user.goals[]` has at least 1 Goal after onboarding
- [ ] `user.currentGoal` is set to `user.goals[0]`

### 10.4 Goal Switching
- [ ] Goal Switcher visible in StudentLayout header
- [ ] Switching goal on Dashboard immediately changes announcements
- [ ] Switching goal on PapersList immediately changes paper list
- [ ] Switching goal on QuizList immediately changes quiz list
- [ ] Selected goal persisted to localStorage
- [ ] On next login, last selected goal is restored

### 10.5 Papers Page
- [ ] Only NEET papers show when currentGoal = NEET
- [ ] Only Board papers (correct standard) show when currentGoal = Board
- [ ] All 12 paper type filters work
- [ ] Filter bottom sheet opens on mobile tapping the filter button
- [ ] Clear filters resets all filter state

### 10.6 Quiz Engine
- [ ] NEET quiz: wrong answer deducts marks (wrongMarks = -1)
- [ ] Board quiz: wrong answer = 0 marks (no deduction)
- [ ] MHT-CET Math quiz: correct answer = +2 marks
- [ ] Marking scheme shown on QuizDetail pre-start screen
- [ ] Score breakdown (Correct × +4, Wrong × -1) shown on result
- [ ] Percentile shown on result page
- [ ] Question navigator: mobile bottom sheet opens on floating button tap
- [ ] Flagged questions shown in navigator with ⚑ indicator
- [ ] Timer pauses after submission (no countdown after quiz ends)
- [ ] Timer auto-submits at 0:00

### 10.7 Admin Portal
- [ ] Admin can create Unit Test paper for Class 8
- [ ] Admin can create NEET PYQ paper (GoalCategory=NEET, Type=PYQ)
- [ ] Admin can create JEE Mains quiz with +4/−1 marking scheme
- [ ] Marking scheme preset selector auto-fills correct/wrong marks
- [ ] Subject dropdown filters based on selected GoalCategory
- [ ] AdminSubjects shows 10 tabs (Board 8–12, NEET, JEE M, JEE A, CET PCB, CET PCM)
- [ ] Announcement can target "NEET UG" students only

### 10.8 Mobile UX
- [ ] All touch targets ≥ 44px height on mobile (verify with browser dev tools)
- [ ] Bottom nav visible on all student pages
- [ ] Content not hidden behind bottom nav (pb-20 on main content)
- [ ] Filter panel opens as bottom sheet on < 640px
- [ ] Quiz navigator opens as bottom sheet on < 640px
- [ ] Goal switcher opens as bottom sheet on < 640px
- [ ] No horizontal scroll on any page at 375px viewport width

### 10.9 Performance
- [ ] Lighthouse Mobile score ≥ 85
- [ ] `npm run build` bundle: main chunk < 400 KB gzipped
- [ ] Admin code in separate lazy chunk (not loaded for students)

---

## 11. Out of Scope (v2.0)

| Feature | Reason | Version |
|---|---|---|
| Backend/database | No backend exists — mock data only | v3.0 |
| PWA offline mode | Complex service worker + sync | v3.0 |
| URL-based routing | No React Router installed | v3.0 |
| Native Android/iOS app | Web-first | v4.0 |
| AI-generated questions | Quality risk | v4.0 |
| JEE Advanced partial marking (per-correct-option) | Too complex | v2.5 |
| Real PDF upload | No backend | v3.0 |
| Leaderboard | Privacy | v3.0 |
| Live classes | Infrastructure | v3.0 |
| Dark mode | Out of scope | v2.5 |
| Marathi UI language | Out of scope | v2.5 |
| Push notifications | No backend | v3.0 |
| Payment/premium | Free-first | v3.0 |

---

## 12. Implementation Order (Developer Guide)

### Phase 0 — Prerequisite
Before touching any component:
1. Update `vite.config.ts` with manual chunks (section 2.8)
2. Add safe area CSS to `index.css` (section 2.5)

### Phase 1 — Data Foundation (P0, ~2–3 days)
1. Rewrite `mockData.ts` — add all new types, interfaces, and data
2. Split into sub-files (section 8.3)
3. Rewrite `AppContext.tsx` — User interface, setCurrentGoal, localStorage

### Phase 2 — Core User Entry (P1, ~1–2 days)
4. Rebuild `OnboardingFlow.tsx` — 7-step branching wizard
5. Modify `StudentLayout.tsx` — Goal Switcher

### Phase 3 — Student Content (P2, ~2–3 days)
6. Modify `Dashboard.tsx` — goal-aware, dynamic data
7. Modify `PapersList.tsx` — extended filters, mobile bottom sheet
8. Modify `QuizList.tsx` — goalCategory filtering

### Phase 4 — Quiz Engine (P2, ~1–2 days)
9. Modify `QuizEngine.tsx` — negative marking, percentile, result breakdown, navigator bottom sheet

### Phase 5 — Profile (P3, ~1 day)
10. Modify `Profile.tsx` — goals management

### Phase 6 — Admin Portal (P3, ~2 days)
11. Modify `AdminPapers.tsx` — extended form
12. Modify `AdminQuizzes.tsx` — marking scheme builder
13. Modify `AdminSubjects.tsx` — 10-tab layout
14. Modify `AdminAnnouncements.tsx` — multi-select targeting
15. Modify `AdminUsers.tsx` — goals[] display

### Phase 7 — Polish & Verify (P4, ~1 day)
16. Update `LandingPage.tsx` — NEET/JEE mentions, updated stats
17. TypeScript strict pass — eliminate all `any`
18. `npm run build` — verify no errors
19. Mobile audit — DevTools responsive mode at 375px
20. Lighthouse run — target ≥ 85 mobile score

---

*End of TRD v2.0 — ParikshaCrack*
