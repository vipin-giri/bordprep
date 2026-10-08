# 🗺️ App / Web Flow Document — DETAILED
## ParikshaCrack v2.0 — Complete Navigation, Screen & Interaction Flow
**Version:** 2.0 | **Date:** June 2026 | **Status:** Final Draft  
**Grounded in:** Actual codebase — View-string SPA, AppContext, mockData.ts

---

## 0. How to Read This Document

- **ASCII wireframes** = exact mobile-first screen layout (375px viewport)
- **`→`** = navigation/state transition (calls `setView()`)
- **`[btn]`** = a tappable button / interactive element
- **`{state}`** = React state variable or Context value
- **`⚡`** = micro-interaction / animation
- **`💾`** = localStorage write
- **`📱`** = mobile-specific behaviour
- **`🖥️`** = desktop-only behaviour
- **`❌`** = error/edge case
- **`⏳`** = loading state

---

## 1. Full Application Map

```
╔═══════════════════════════════════════════════════════════════════════╗
║                     PARIKSHA CRACK v2.0                              ║
╠═════════════════╦═════════════════════════╦═════════════════════════╣
║   PUBLIC ZONE   ║    STUDENT PORTAL       ║     ADMIN PANEL         ║
║─────────────────║─────────────────────────║─────────────────────────║
║ landing         ║ ┌── StudentLayout ──┐   ║ ┌── AdminLayout ───┐    ║
║ login           ║ │  (bottom nav mob) │   ║ │  (sidebar dark)  │    ║
║ register        ║ │  (sidebar desk)   │   ║ │                  │    ║
║ verify-otp      ║ │                   │   ║ │ admin-dashboard  │    ║
║ forgot-password ║ │ dashboard         │   ║ │ admin-papers     │    ║
║ reset-password  ║ │ papers            │   ║ │ admin-paper-     │    ║
║ onboarding      ║ │ paper-detail      │   ║ │   upload/edit    │    ║
║                 ║ │ quizzes           │   ║ │ admin-quizzes    │    ║
║ admin-login     ║ │ quiz-detail       │   ║ │ admin-quiz-      │    ║
║                 ║ │ quiz-attempt      │   ║ │   create/edit/   │    ║
║                 ║ │ quiz-result       │   ║ │   preview        │    ║
║                 ║ │ quiz-review       │   ║ │ admin-users      │    ║
║                 ║ │ bookmarks         │   ║ │ admin-user-      │    ║
║                 ║ │ profile           │   ║ │   detail         │    ║
║                 ║ └───────────────────┘   ║ │ admin-subjects   │    ║
║                 ║                         ║ │ admin-announce.  │    ║
║                 ║  All views filtered     ║ │ admin-analytics  │    ║
║                 ║  by {currentGoal}       ║ └──────────────────┘    ║
╚═════════════════╩═════════════════════════╩═════════════════════════╝
```

---

## 2. Global Navigation Rules & Guards

### 2.1 Auth Guard Logic

```typescript
// App.tsx — enforced before rendering any view
function AppContent() {
  const { view, user } = useApp();

  // Guard: student views require logged-in user
  if (STUDENT_VIEWS.includes(view) && !user) {
    // ⚡ Redirect immediately, no flicker
    return <LoginPage />;   // OR: setView("login") on mount
  }

  // Guard: admin views require admin flag
  if (ADMIN_VIEWS.includes(view) && !user?.isAdmin) {
    return <LandingPage />;
  }

  // Guard: onboarding required if user has no goals
  if (view === "dashboard" && user && user.goals.length === 0) {
    return <OnboardingFlow />;
  }

  // ... render views
}
```

### 2.2 Navigation System

| Rule | Detail |
|---|---|
| **Zero page reloads** | All nav = `setView(string)` — SPA with instant transitions |
| **No browser back/forward** | App does not use URL routing; back buttons are explicit UI elements |
| **View state survives goal switch** | Switching goal while on `papers` stays on `papers`, content re-filters |
| **Quiz attempt is modal-like** | `quiz-attempt` hides bottom nav and header on mobile to prevent accidental exit |
| **Admin views lazy loaded** | Admin JS chunk only downloads when `admin-login` is first opened |
| **Goal context drives all content** | `user.currentGoal` filters every data-displaying component |
| **Toast notifications** | Success/error toasts appear at top-center (mobile) or top-right (desktop) |

### 2.3 Mobile-Specific Global Rules

```
📱 Bottom Nav:    Fixed, 64px, visible on ALL student views EXCEPT quiz-attempt
📱 Header:        56px, sticky, visible on all student views
📱 Safe area:     Extra pb applied at bottom for iPhone notch models
📱 Tap feedback:  All buttons show pressed state (scale 0.97) on tap
📱 Swipe:         Quiz question cards support left/right swipe for prev/next
📱 Pull-to-refresh: Dashboard and lists support native-feel pull-to-refresh (future)
📱 Font scale:    App respects OS accessibility font size setting
```

---

## 3. Landing Page — Full Flow

### 3.1 Mobile Wireframe

```
┌──────────────────────────────────────┐  ← 375px wide
│ [🎯 ParikshaCrack Logo]   [Login] [Register] │  ← Navbar (sticky, 56px)
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │   HERO IMAGE (full bleed)     │  │  ← 280px tall on mobile
│  │   BG.jpg / STUDY.jpg etc.     │  │
│  │   (auto-carousel, 5s each)    │  │
│  │                               │  │
│  │   ┌───────────────────────┐  │  │
│  │   │ Maharashtra Board's   │  │  │
│  │   │ #1 Exam Prep Platform │  │  │  ← badge chip
│  │   └───────────────────────┘  │  │
│  │                               │  │
│  │   Crack Your Board, NEET,    │  │  ← h1 (scramble animation)
│  │   JEE & CET Exams            │  │
│  │   with Smart Preparation     │  │
│  │                               │  │
│  │   [Start Preparing — Free]   │  │  ← primary CTA
│  │   [Login to Dashboard    ]   │  │  ← secondary CTA
│  └────────────────────────────────┘  │
│   ● ○ ○ ○ ○  (carousel dots)         │
│                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │1,200+│ │ 400+ │ │ 500+ │ │ 95% ││  ← stats grid (2×2 on mobile)
│  │Stude.│ │Paper.│ │Quizz.│ │Uptime││
│  └──────┘ └──────┘ └──────┘ └──────┘│
├──────────────────────────────────────┤
│  WHY PARIKSHA CRACK?                 │
│  ┌────────────────────────────────┐  │
│  │ 📄 Past Question Papers        │  │  ← feature cards (1-col mobile)
│  │    Board PYQs, NEET, JEE, CET │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🧠 Smart MCQ Quiz Engine       │  │
│  │    +4/−1 NEET, Board, JEE     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 📊 Progress Analytics          │  │
│  │    Streaks, scores, weak areas │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🎯 Multi-Exam Platform         │  │
│  │    Classes 8-12, NEET, JEE,CET│  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  SUBJECTS COVERED                    │
│  10th SSC:                           │
│  [Math] [Science] [English] [Hindi]  │  ← scrollable pill rows
│  [Marathi] [History] [Geography]     │
│                                      │
│  12th HSC:                           │
│  [Physics] [Chemistry] [Biology]     │
│  [Maths] [Economics] [English]       │
│                                      │
│  Competitive Exams:                  │
│  [NEET] [JEE Mains] [JEE Adv]       │
│  [MHT-CET PCB] [MHT-CET PCM]        │
├──────────────────────────────────────┤
│  HOW IT WORKS                        │
│  1️⃣ Register & Set Goals             │
│  2️⃣ Practice Daily                   │
│  3️⃣ Track Your Progress              │
├──────────────────────────────────────┤
│  WHAT STUDENTS SAY                   │
│  [Testimonial card — swipeable]      │
├──────────────────────────────────────┤
│  [Create Free Account — Big CTA]     │
├──────────────────────────────────────┤
│  Footer: Logo + Links + © 2026       │
│  [Admin Panel] ← hidden grey link    │
└──────────────────────────────────────┘
```

### 3.2 Landing Interactions

| Element | Interaction | Result |
|---|---|---|
| Hero carousel | Auto-rotates every 5s | Next image fades in ⚡ |
| Hero carousel | Tap dot indicator | Jump to specific image ⚡ |
| h1 text | On mount (after 300ms) | Scramble animation runs for 2s ⚡ |
| `[Login]` navbar | Tap | → `setView("login")` |
| `[Register]` navbar | Tap | → `setView("register")` |
| `[Start Preparing Free]` CTA | Tap | → `setView("register")` |
| `[Login to Dashboard]` CTA | Tap | → `setView("login")` |
| Feature cards | Scroll into view | Fade-in-up animation ⚡ |
| Stats numbers | Scroll into view | Count-up animation ⚡ |
| Testimonials | Swipe left/right 📱 | Next/prev testimonial ⚡ |
| `[Admin Panel]` footer | Tap | → `setView("admin-login")` |

---

## 4. Auth Pages — Full Flow

### 4.1 Register Page

```
┌──────────────────────────────────────┐
│ [← Back]  ParikshaCrack Logo          │  ← AuthLayout navbar
├──────────────────────────────────────┤
│                                      │
│        Create your account           │  ← title (Poppins 20px bold)
│  Join thousands of board students    │  ← subtitle (gray, 14px)
│                                      │
│  Full Name                           │
│  ┌────────────────────────────────┐  │
│  │ 👤  Priya Sharma               │  │  ← InputField component
│  └────────────────────────────────┘  │
│                                      │
│  Email Address                       │
│  ┌────────────────────────────────┐  │
│  │ ✉️  you@email.com              │  │
│  └────────────────────────────────┘  │
│                                      │
│  Password                            │
│  ┌────────────────────────────────┐  │
│  │ 🔒  ••••••••          [👁️ show]│  │
│  └────────────────────────────────┘  │
│  Min. 8 characters                   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ❌ Please fill in all fields   │  │  ← error banner (red, role="alert")
│  └────────────────────────────────┘  │
│                                      │
│  ╔════════════════════════════════╗  │
│  ║    [Create Account]            ║  │  ← primary btn (navy)
│  ╚════════════════════════════════╝  │
│                                      │
│  By registering you agree to our     │
│  Terms of Service & Privacy Policy   │
│                                      │
│  Already have an account?  [Login]   │
└──────────────────────────────────────┘
```

**State machine:**
```
IDLE
  ↓ [Type in all fields]
FILLING
  ↓ [Create Account tapped]
VALIDATING (client-side, instant)
  ├── name empty → error: "Please fill in all fields"
  ├── email empty → error: "Please fill in all fields"
  └── password < 8 chars → error: "Password must be at least 8 characters"
  ↓ (all valid)
LOADING (800ms simulated delay, button → "Creating account...")
  ↓
SUCCESS
  → {authEmail} = email  💾 Store in context
  → setView("verify-otp")
  ⚡ Slide-out animation before transition
```

### 4.2 Verify OTP Page

```
┌──────────────────────────────────────┐
│ [← Back to Register]  Logo           │
├──────────────────────────────────────┤
│                                      │
│  ✉️  (large email icon, animated)    │
│                                      │
│       Verify your email              │
│  Enter OTP sent to priya@gmail.com   │
│          (shows {authEmail})         │
│                                      │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐│
│  │ 4 │  │ 8 │  │ _ │  │ _ │  │ _ │  │ _ ││  ← 6 individual inputs
│  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘│
│        ↑ focus auto-advances            │
│                                      │
│  ❌ Invalid OTP. Please try again.    │  ← only shown on wrong input
│                                      │
│  ╔════════════════════════════════╗  │
│  ║       [Verify Email]           ║  │
│  ╚════════════════════════════════╝  │
│                                      │
│  Didn't get the OTP?                 │
│  [Resend OTP] ← greyed out 60s      │
│  (countdown: "Resend in 45s...")     │
│                                      │
│  ℹ️ OTP valid for 10 min · Max 3/hr  │
└──────────────────────────────────────┘
```

**State machine:**
```
EMPTY (all 6 boxes empty)
  ↓ [Type digit in box 1]
  → digit stored, focus auto-moves to box 2 ⚡
  → Repeat until box 6 filled
FILLED (6 digits entered)
  ↓ [Verify Email tapped]
LOADING (800ms)
  ↓ [Any 6-digit OTP accepted — mock]
SUCCESS
  → setUser({ id: "u_new", name: "New Student", email: authEmail,
              goals: [], currentGoal: undefined!, ... })
  → setView("onboarding")

RESEND flow:
  → Timer counts down 60s (useEffect with setInterval)
  → After 60s: [Resend OTP] becomes active
  → Tap → {resent} = true for 5s → shows "✓ OTP resent!"
  → New 60s countdown starts
```

**Mobile-specific OTP input behaviour:**
```
📱 Each box: type="tel" inputMode="numeric" maxLength={1}
📱 Backspace on empty box → focus previous box
📱 Paste of 6-digit string → fills all boxes at once
📱 Each box: min-w-[44px] min-h-[52px] text-center text-xl
```

### 4.3 Login Page

```
┌──────────────────────────────────────┐
│ [← Back]  ParikshaCrack              │
├──────────────────────────────────────┤
│                                      │
│         Welcome back! 👋             │
│  Login to continue your preparation  │
│                                      │
│  Email Address                       │
│  ┌────────────────────────────────┐  │
│  │ ✉️  you@email.com              │  │
│  └────────────────────────────────┘  │
│                                      │
│  Password                    [Forgot?]│
│  ┌────────────────────────────────┐  │
│  │ 🔒  ••••••••          [👁️]    │  │
│  └────────────────────────────────┘  │
│                                      │
│  ❌ Invalid credentials. Try again.  │
│                                      │
│  ╔════════════════════════════════╗  │
│  ║        [Login]  ⏳             ║  │
│  ╚════════════════════════════════╝  │
│                                      │
│  Don't have an account?              │
│  [Register free →]                   │
└──────────────────────────────────────┘
```

**State machine:**
```
IDLE
  ↓ [Login tapped]
VALIDATING
  ├── either field empty → "Please fill in all fields."
  └── (both filled) → proceed
LOADING (1000ms)
  ↓
SUCCESS → setUser({
    id: "u_demo", name: "Priya Sharma", email,
    standard: "12", medium: "semi-english",
    subjects: ["Physics", "Chemistry", "Mathematics & Statistics"],
    goals: [{ category: "board", standard: "12", ... }],
    currentGoal: {...},
    streak: 15, isAdmin: false
  })
  → setView("dashboard")

ADMIN LOGIN PATH:
  → Hardcoded check: email === "admin@parikshacrack.in"
     AND password === "PARIKSHA_ADMIN_2026"
  → setUser({ isAdmin: true, ... })
  → setView("admin-dashboard")
```

### 4.4 Forgot Password → Reset Flow

```
FORGOT PASSWORD PAGE                    RESET PASSWORD PAGE
┌──────────────────────────┐           ┌──────────────────────────┐
│ [← Back to Login]        │           │ [← Back]                 │
├──────────────────────────┤           ├──────────────────────────┤
│                          │           │ Reset your password      │
│  Forgot password?        │           │ OTP sent to {authEmail}  │
│  Enter email to get OTP  │           │                          │
│                          │           │  6-digit OTP             │
│  Email                   │           │  [_][_][_][_][_][_]      │
│  ┌──────────────────────┐│           │                          │
│  │ ✉️ you@email.com     ││           │  New Password            │
│  └──────────────────────┘│           │  ┌────────────────────┐  │
│                          │           │  │ •••••••••   [👁️]  │  │
│  ╔════════════════════╗  │           │  └────────────────────┘  │
│  ║    [Send OTP]      ║  │           │                          │
│  ╚════════════════════╝  │           │  Confirm Password        │
│                          │           │  ┌────────────────────┐  │
│  ─── After sending: ───  │           │  │ •••••••••   [👁️]  │  │
│                          │           │  └────────────────────┘  │
│  ✅ OTP sent to          │           │                          │
│     priya@gmail.com!     │           │  ╔════════════════════╗  │
│                          │           │  ║ [Reset Password]   ║  │
│  [Enter OTP →]           │ ─────────►│  ╚════════════════════╝  │
│  → setView("reset-pwd")  │           │         │                │
└──────────────────────────┘           │         ▼                │
                                       │   → setView("login")     │
                                       │   + success toast        │
                                       └──────────────────────────┘
```

---

## 5. Onboarding Flow — Detailed 7-Step Wizard

### 5.1 Progress Bar (top of every step)

```
┌──────────────────────────────────────┐
│ ParikshaCrack                  [Skip?]│  ← no skip in onboarding (required)
├──────────────────────────────────────┤
│ Step 2 of 5 · Your Standard          │  ← step counter + step label
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░  │  ← progress bar (40% filled)
└──────────────────────────────────────┘
```

**Progress formula:**
- Board only (5 steps): Step % = (step + 1) / 5 × 100
- Competitive only (4 steps): Step % = (step + 1) / 4 × 100
- Both (7 steps): Step % = (step + 1) / 7 × 100

### 5.2 Step 0 — Goal Type Selection

```
┌──────────────────────────────────────┐
│ Step 1 of ? · Your Goal              │
│ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
├──────────────────────────────────────┤
│                                      │
│    What are you preparing for?       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📚  Board Exams               │  │  ← card (full-width on mobile)
│  │       Class 8th to 12th        │  │
│  │       Maharashtra State Board  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🎯  Competitive Exams         │  │
│  │       NEET / JEE / MHT-CET    │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🚀  Both!                     │  │
│  │       Board + Competitive      │  │
│  └────────────────────────────────┘  │
│                                      │
│  [Continue →]  (enabled on select)   │
└──────────────────────────────────────┘
```

**Interaction:** Tap card → highlighted with border + bg color + check icon
**State:** `{path}` = `"board"` | `"competitive"` | `"both"`
**Navigation:**
- `"board"` → Step 1 (Standard)
- `"competitive"` → Step 4 (Exam Selection)
- `"both"` → Step 1 (Standard)

### 5.3 Step 1 — Standard Selection (Board path only)

```
┌──────────────────────────────────────┐
│ Step 2 of 5 · Your Standard          │
│ ████████████████░░░░░░░░░░░░░░░░░░  │
├──────────────────────────────────────┤
│                                      │
│  Which class are you currently in?   │
│  (You can select multiple classes)   │
│                                      │
│  ┌──────────┐  ┌──────────┐          │
│  │    8     │  │    9     │          │  ← 3-col grid on mobile
│  │  Class 8 │  │  Class 9 │          │
│  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐          │
│  │   10 ✓   │  │   11     │          │  ← selected: blue border + check
│  │ SSC/SSCE │  │   Jr.    │          │
│  └──────────┘  └──────────┘          │
│            ┌──────────┐              │
│            │   12     │              │
│            │ HSC/HSSC │              │
│            └──────────┘              │
│                                      │
│  ℹ️ For classes 11 & 12, we'll       │
│     ask about your stream next       │
│                                      │
│  [← Back]         [Continue →]       │
└──────────────────────────────────────┘
```

**State:** `{standard}` = `"8"` | `"9"` | `"10"` | `"11"` | `"12"`
**Conditional navigation:**
- Standard = "8", "9", or "10" → Skip stream step → Go to Medium (Step 2)
- Standard = "11" or "12" → Go to Stream (Step 2)

### 5.4 Step 2 — Stream Selection (Only for Std 11, 12)

```
┌──────────────────────────────────────┐
│ Step 3 of 5 · Your Stream            │
│ ████████████████████████░░░░░░░░░░  │
├──────────────────────────────────────┤
│                                      │
│   Which stream are you in?           │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🔬 Science (PCB)              │  │  ← radio-style full-width cards
│  │     Physics · Chemistry ·      │  │
│  │     Biology                    │  │
│  │     → Best for: NEET, CET PCB  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📐 Science (PCM)              │  │
│  │     Physics · Chemistry ·      │  │
│  │     Mathematics                │  │
│  │     → Best for: JEE, CET PCM   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📊 Science (PCB + PCM)        │  │
│  │     Taking Biology AND Maths   │  │
│  │     → Best for: NEET + JEE     │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  💼 Commerce                   │  │
│  │     Accountancy · Economics    │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🎨 Arts / Humanities          │  │
│  │     History · Geography ·      │  │
│  │     Political Science          │  │
│  └────────────────────────────────┘  │
│                                      │
│  [← Back]         [Continue →]       │
└──────────────────────────────────────┘
```

**State:** `{stream}` = `"science-pcb"` | `"science-pcm"` | `"science-pcbm"` | `"commerce"` | `"arts"`

### 5.5 Step 3 — Medium Selection (Board path only)

```
┌──────────────────────────────────────┐
│ Step 4 of 5 · Medium of Instruction  │
│ ████████████████████████████████░░  │
├──────────────────────────────────────┤
│                                      │
│  Which medium do you study in?       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🇬🇧 English Medium             │  │
│  │     All subjects in English    │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📖 Semi-English               │  │
│  │     Science + Math in English  │  │
│  │     Languages in Marathi       │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🇮🇳 Marathi Medium             │  │
│  │     All subjects in Marathi    │  │
│  └────────────────────────────────┘  │
│                                      │
│  ℹ️ We'll show papers in your medium │
│                                      │
│  [← Back]         [Continue →]       │
└──────────────────────────────────────┘
```

**Navigation after this step:**
- If `path === "board"` → Go to Subject Selection (Step 6)
- If `path === "both"` → Go to Exam Selection (Step 4)

### 5.6 Step 4 — Competitive Exam Selection

```
┌──────────────────────────────────────┐
│ Step 5 of 7 · Which Exam(s)?         │
│ ████████████████████████████░░░░░░  │
├──────────────────────────────────────┤
│                                      │
│  Which competitive exam(s) are       │
│  you preparing for?                  │
│  (Select all that apply)             │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ☑️  🩺 NEET UG                  │  │  ← checkbox style (multi-select)
│  │      National medical entrance  │  │
│  │      720 marks · 180 MCQs       │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ☑️  🔬 JEE Mains               │  │
│  │      Engineering entrance      │  │
│  │      300 marks · 90 Qs         │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ☐   🏆 JEE Advanced            │  │
│  │      IIT entrance (post-Mains) │  │
│  │      360 marks · Complex MCQs  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ☑️  🧬 MHT-CET (PCB)           │  │
│  │      Maharashtra Medical CET   │  │
│  │      200 marks · 200 MCQs      │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ☐   📐 MHT-CET (PCM)           │  │
│  │      Maharashtra Engg. CET     │  │
│  │      200 marks · 150 MCQs      │  │
│  └────────────────────────────────┘  │
│                                      │
│  ⚠️ Select at least one exam         │
│                                      │
│  [← Back]         [Continue →]       │
└──────────────────────────────────────┘
```

**State:** `{selectedExams}` = `GoalCategory[]` (multi-select array)

### 5.7 Step 5 — Target Year

```
┌──────────────────────────────────────┐
│ Step 6 of 7 · Target Year            │
│ ██████████████████████████████████░  │
├──────────────────────────────────────┤
│                                      │
│  When are you planning to appear     │
│  for the exam?                       │
│                                      │
│  ┌──────────┐  ┌──────────┐          │
│  │   2025   │  │   2026   │          │  ← 2×2 grid on mobile
│  │  This yr │  │ Next yr  │          │
│  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐          │
│  │   2027 ✓ │  │   2028   │          │  ← selected
│  │          │  │          │          │
│  └──────────┘  └──────────┘          │
│                                      │
│  📅 Your exam: May 3, 2027           │  ← auto-shown from EXAM_DATES lookup
│     247 days to go!                  │  ← countdown auto-calculated
│                                      │
│  [← Back]         [Continue →]       │
└──────────────────────────────────────┘
```

### 5.8 Step 6 — Subject Selection

```
┌──────────────────────────────────────┐
│ Step 7 of 7 · Select Subjects        │
│ ████████████████████████████████████│
├──────────────────────────────────────┤
│                                      │
│  Which subjects are you focusing on? │
│  (All subjects selected by default)  │
│                                      │
│  NEET UG:                            │
│  [⚡Physics ✓] [🧪Chemistry ✓]       │  ← pill toggles
│  [🌿Botany ✓] [🦴Zoology ✓]         │
│                                      │
│  12th Board (English):               │
│  [⚡Physics ✓] [🧪Chemistry ✓]       │
│  [🧬Biology ✓] [📊Maths ✓]           │
│  [📚English ✓]                       │
│                                      │
│  ⚠️ Select at least 1 subject         │
│                                      │
│  [← Back]     [Go to Dashboard →]    │
└──────────────────────────────────────┘
```

**On "Go to Dashboard" tap:**
```typescript
// Build Goal objects from all onboarding state
const goals = buildGoalsFromOnboarding(state);
// Update user
setUser({ ...user!, goals, currentGoal: goals[0] });
// Persist to localStorage
localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({...user!, goals, currentGoal: goals[0]}));
// Navigate
setView("dashboard");
// ⚡ Confetti animation fires
```

### 5.9 Full Onboarding Branching Map

```
START
  │
  ▼ Step 0: Goal Type
  ├── "board" only ─────────────────────────────────────────────────────┐
  │     ↓ Step 1: Standard (8/9/10/11/12)                               │
  │     ↓ Step 2*: Stream (ONLY if 11 or 12 selected)                   │
  │     ↓ Step 3: Medium (English/Semi/Marathi)                         │
  │     └─────────────────────────────────────────────── ► Step 6: Subjects → Dashboard
  │
  ├── "competitive" only ──────────────────────────────────────────────┐
  │     ↓ Step 4: Exam Selection (multi-select NEET/JEE/CET)           │
  │     ↓ Step 5: Target Year                                          │
  │     └──────────────────────────────────────────────── ► Step 6: Subjects → Dashboard
  │
  └── "both" ──────────────────────────────────────────────────────────┐
        ↓ Step 1: Standard                                              │
        ↓ Step 2*: Stream (if 11/12)                                   │
        ↓ Step 3: Medium                                               │
        ↓ Step 4: Exam Selection                                        │
        ↓ Step 5: Target Year                                           │
        └──────────────────────────────────────────────── ► Step 6: Subjects → Dashboard

*Step 2 (Stream) dynamically appears:
  - Standard = 8/9/10 → stream = "general" auto-set, step skipped
  - Standard = 11/12  → stream selection shown
```

### 5.10 Onboarding Edge Cases

| Scenario | Handling |
|---|---|
| User selects "Both" then deselects competitive exams | Back button available; validation prevents empty exam list |
| User selects JEE Advanced without JEE Mains | Warning: "JEE Advanced requires JEE Mains qualification. We'll include both." |
| Target year = 2025 (exam already passed) | Warning: "This year's exam may have passed. Are you sure?" |
| Page refresh during onboarding | All state lost (no persistence mid-onboarding); restart from step 0 |
| User already has goals (revisiting onboarding) | Show "Add Goal" framing, not "Welcome" framing |

---

## 6. Student Layout — Complete Shell

### 6.1 Mobile Layout (< 640px)

```
┌──────────────────────────────────────┐ ─── 56px header (sticky, white)
│ [≡ Menu]  [NEET UG 2027 ▼]  [🔔][👤]│
├──────────────────────────────────────┤ ─── main content (fills remaining)
│                                      │
│         PAGE CONTENT AREA            │
│  (pb-20 to clear bottom nav)         │
│                                      │
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤ ─── 64px bottom nav (fixed)
│  [🏠]   [📄]   [🧠]   [🔖]   [👤]  │
│  Home  Papers Quizzes Saved Profile  │
└──────────────────────────────────────┘ ─── env(safe-area-inset-bottom)
```

### 6.2 Desktop Layout (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  ┌────────────────────────────────────────┐ │
│  │  SIDEBAR (240px)│  │  HEADER (sticky, white, rest of width) │ │
│  │  bg: #1E3A8A    │  │  [Page Title]    [Goal ▼] [🔔] [👤]  │ │
│  ├─────────────────┤  ├────────────────────────────────────────┤ │
│  │  [Logo]         │  │                                        │ │
│  │  ParikshaCrack  │  │           PAGE CONTENT                 │ │
│  ├─────────────────┤  │        (max-w-5xl mx-auto)             │ │
│  │  ▶ Dashboard    │  │                                        │ │
│  │    Papers       │  │                                        │ │
│  │    Quizzes      │  │                                        │ │
│  │    Bookmarks    │  │                                        │ │
│  │    Profile      │  │                                        │ │
│  ├─────────────────┤  │                                        │ │
│  │  [Avatar]       │  │                                        │ │
│  │  Priya Sharma   │  │                                        │ │
│  │  NEET 2027      │  └────────────────────────────────────────┘ │
│  │  [Logout]       │                                             │
│  └─────────────────┘                                             │
└──────────────────────────────────────────────────────────────────┘
```

### 6.3 Goal Switcher — Complete Interaction Flow

```
Scenario A: Student has 1 goal
─────────────────────────────
Header shows: "📚 12th HSC Board" (plain label, no dropdown arrow)
No interaction available — acts as informational badge

Scenario B: Student has 2+ goals
──────────────────────────────────

Header: [📚 12th HSC Board ▼]   ← tappable badge with dropdown arrow

ON TAP (mobile): ─────────────────────────────────────────────────────
  ⚡ Semi-transparent overlay covers screen
  ⚡ Bottom sheet slides up from bottom (300ms ease-out)

┌──────────────────────────────────────┐
│     ▬  (drag handle)                 │
│                                      │
│   Switch Goal                        │
│   ─────────────────────────          │
│                                      │
│  ✓  📚  12th HSC Board (English)     │  ← current (bold, blue bg)
│         Board · Class 12             │  ← sub-label
│                                      │
│     🩺  NEET UG 2027                 │  ← others (normal weight)
│         247 days to exam             │  ← countdown shown
│                                      │
│     🔬  JEE Mains 2027               │
│         183 days to exam             │
│                                      │
│  ─────────────────────────────────── │
│  [+ Add New Goal]                    │  ← opens mini-onboarding modal
│                                      │
└──────────────────────────────────────┘

ON TAP OF ANOTHER GOAL:
  → setCurrentGoal(newGoal)
  → 💾 localStorage.setItem(CURRENT_GOAL, JSON.stringify(newGoal))
  → ⚡ Bottom sheet closes (slides down)
  → ⚡ Header badge updates with new goal color + label
  → All page content re-renders with new goal filter
  → No view change — stay on current page

ON DESKTOP: ──────────────────────────────────────────────────────────
  → Standard dropdown menu appears below header badge
  → Same list of goals
  → Same behaviour on selection
```

### 6.4 Notification Bell Flow

```
[🔔] bell icon in header

State: {unreadCount} = count of active announcements for currentGoal
       that were added after user's last visit

Badge: if unreadCount > 0 → red dot with count on bell icon

ON TAP:
  ⚡ Dropdown panel opens (max-h-80 overflow-y-auto)

┌──────────────────────────────────────┐
│  🔔 Announcements                    │
│  ─────────────────────────────────── │
│  🔴 URGENT                           │  ← urgent priority
│  NEET 2027 Exam Date Confirmed       │
│  "NEET 2027 will be held on May 3..." │
│  2 hours ago · For: NEET             │
│  ─────────────────────────────────── │
│  🟡 IMPORTANT                        │
│  New PYQs Added — NEET Physics       │
│  "We've added NEET 2024 Physics..."  │
│  Yesterday · For: NEET, Board 12     │
│  ─────────────────────────────────── │
│  ⚪ Platform Maintenance Sunday       │
│  "Maintenance 2AM-4AM IST..."        │
│  Jan 5 · For: All students           │
└──────────────────────────────────────┘

  Announcements filtered by: currentGoal.category OR "all"
  Priority visual: urgent = red left border, important = amber, normal = gray
```

---

## 7. Student Dashboard — Full Flow

### 7.1 Mobile Wireframe

```
┌──────────────────────────────────────┐
│ [≡]  [NEET UG 2027 ▼]  [🔔 2][👤]  │  ← header
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🩺 NEET UG 2027               │  │  ← goal banner (goal color bg)
│  │  Welcome back, Priya! 👋        │  │
│  │  247 days to your exam         │  │  ← countdown
│  │  ████████░░░░░░░░ 65% ready    │  │  ← readiness bar
│  │  [Take Quiz] [Browse Papers]   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │  12  │ │  67  │ │  22🔥│ │  76% ││  ← 4 stat cards (2×2)
│  │Paper.│ │Quiz. │ │Streak│ │ Avg. ││
│  └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📖 Resume: NEET Physics Mock  │  │  ← resume banner (if active quiz)
│  │  Q 18/30 · 24 min remaining    │  │
│  │  [Continue Quiz →]              │  │
│  └────────────────────────────────┘  │
│                                      │
│  Subject Progress          [View all]│
│  ┌────────────────────────────────┐  │
│  │  ⚡Physics   ████████░░  78%   │  │
│  │  🧪Chemistry ██████░░░░  62%   │  │
│  │  🌿Botany    ████░░░░░░  45%   │  │
│  │  🦴Zoology   ██░░░░░░░░  23%   │  │
│  └────────────────────────────────┘  │
│                                      │
│  Score Trend (Last 7 Days)           │
│  ┌────────────────────────────────┐  │
│  │     📈 recharts LineChart      │  │
│  │  80%    ╭────╮                 │  │
│  │  60% ──╯    ╰──               │  │
│  │  Jan 1   Jan 5   Jan 10       │  │
│  └────────────────────────────────┘  │
│                                      │
│  📢 Announcements (goal-filtered)    │
│  ┌────────────────────────────────┐  │
│  │  🔴 NEET 2027 Date Announced   │  │
│  │  May 3, 2027 confirmed by NMC  │  │
│  │                  2 hours ago   │  │
│  └────────────────────────────────┘  │
│                                      │
│  Recent Quizzes              [All →] │
│  [Quiz card] [Quiz card] [Quiz card] │
│                                      │
│  Recent Papers               [All →] │
│  [Paper card] [Paper card]           │
│                                      │
│  ⚡ Weak Areas to Practice           │
│  ┌────────────────────────────────┐  │
│  │  Focus on:                     │  │
│  │  [Zoology] [Organic Chemistry] │  │  ← tap → quiz-list with filter
│  │  [Laws of Motion]              │  │
│  └────────────────────────────────┘  │
│                                      │
│ [🏠]  [📄]  [🧠]  [🔖]  [👤]       │
└──────────────────────────────────────┘
```

### 7.2 Dashboard Data Flow

```typescript
// On mount and every time {currentGoal} changes:
const goal = user!.currentGoal;

// 1. Filter announcements
const goalAnnouncements = announcements.filter(a =>
  a.isActive &&
  (a.targetGoals.includes("all") || a.targetGoals.includes(goal.category))
);

// 2. Filter recent quizzes (last 3, goal-matched)
const recentQuizzes = quizzes
  .filter(q => q.goalCategory === goal.category && q.status === "published")
  .slice(0, 3);

// 3. Filter recent papers (last 3, goal-matched)
const recentPapers = papers
  .filter(p => p.goalCategory === goal.category && p.status === "published")
  .slice(0, 3);

// 4. Compute subject progress from actual attempts
const progress = computeSubjectProgress(goal, subjects, quizzes, completedAttempts);

// 5. Calculate days to exam
const daysToExam = getDaysToExam(goal); // null if no examDate

// 6. Check for resume-able quiz
const hasActiveQuiz = currentAttempt !== null || savedQuizState !== null;
```

### 7.3 Dashboard Interactions

| Element | Action | Result |
|---|---|---|
| Goal banner [Take Quiz] | Tap | → `setView("quizzes")` |
| Goal banner [Browse Papers] | Tap | → `setView("papers")` |
| Resume quiz [Continue Quiz →] | Tap | → `setView("quiz-attempt")` (restores saved state) |
| Stat card (Quizzes) | Tap | → `setView("quizzes")` |
| Stat card (Papers) | Tap | → `setView("papers")` |
| Subject progress [View all] | Tap | → `setView("quizzes")` |
| Score trend chart | Hover/touch | ⚡ Tooltip shows date + score |
| Announcement card | Tap | Expands body text inline ⚡ |
| Recent quiz card | Tap | `setSelectedQuizId(id)` → `setView("quiz-detail")` |
| Recent paper card | Tap | `setSelectedPaperId(id)` → `setView("paper-detail")` |
| Weak area chip [Zoology] | Tap | → `setView("quizzes")` with subject pre-filtered |
| [View all →] (quizzes) | Tap | → `setView("quizzes")` |
| [View all →] (papers) | Tap | → `setView("papers")` |

---

## 8. Papers Section — Full Flow

### 8.1 Papers List — Mobile Wireframe

```
┌──────────────────────────────────────┐
│ [≡]  [NEET UG 2027 ▼]  [🔔][👤]    │
├──────────────────────────────────────┤
│                                      │
│  Question Papers                     │  ← h1 (20px bold)
│  NEET UG · 48 papers found           │  ← subtitle (gray, 14px)
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 🔍 Search papers, subject...  │  │  ← search bar (full width)
│  └────────────────────────────────┘  │
│                                      │
│  [Filter (3) ▼]  [Sort: Popular ▼]  │  ← filter + sort bar
│   Active chips: [NEET ×] [PYQ ×]    │  ← removable filter chips
│   [Physics ×]                        │
│                                      │
│  ← 📱 Tap "Filter" → Bottom Sheet   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  [PYQ] [NEET UG]              │  │  ← type + goal badges (colored)
│  │  NEET UG 2024 — Physics PYQ   │  │  ← title
│  │  Physics · 2024 · 180 marks   │  │  ← metadata
│  │  ⏱️ 180 min · 📥 2,450        │  │  ← duration + downloads
│  │  [🔖 Save]     [View Paper →] │  │  ← actions
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  [Mock Test] [NEET UG]        │  │
│  │  NEET 2024 Full Mock Test 1   │  │
│  │  All subjects · 2024 · 720 mk │  │
│  │  ⏱️ 200 min · 📥 1,890        │  │
│  │  [🔖]          [View Paper →] │  │
│  └────────────────────────────────┘  │
│                                      │
│  ... (more cards, 20 per page)        │
│                                      │
│  [< 1] [2] [3] [>]  ← pagination    │
│                                      │
│ [🏠]  [📄●]  [🧠]  [🔖]  [👤]      │  ← papers tab active
└──────────────────────────────────────┘
```

### 8.2 Filter Bottom Sheet (Mobile)

```
  ⚡ Slides up from bottom over 300ms

┌──────────────────────────────────────┐
│     ▬  (drag handle)                 │
│  Filter Papers       [Clear All]     │
│  ────────────────────────────────    │
│                                      │
│  Paper Type                          │
│  ┌──┐ ┌──────┐ ┌───────┐ ┌────────┐ │
│  │All│ │Unit  │ │Semest.│ │Prelims │ │  ← horizontal scroll chips
│  └──┘ └──────┘ └───────┘ └────────┘ │
│  ┌──────┐ ┌─────┐ ┌───────┐          │
│  │Board │ │ PYQ │ │ Mock  │          │
│  └──────┘ └─────┘ └───────┘          │
│  ┌─────────┐ ┌────────────┐          │
│  │Chapter  │ │ Subject-   │          │
│  │ -wise   │ │   wise     │          │
│  └─────────┘ └────────────┘          │
│                                      │
│  Subject                             │
│  [All] [Physics ✓] [Chemistry] [Bio] │
│                                      │
│  Year                                │
│  [All] [2024 ✓] [2023] [2022] [2021] │
│                                      │
│  Medium  (Board only)                │
│  [All] [English ✓] [Semi-Eng] [Mar.] │
│                                      │
│  ────────────────────────────────    │
│  ╔════════════════════════════════╗  │
│  ║    [Apply Filters]             ║  │
│  ╚════════════════════════════════╝  │
└──────────────────────────────────────┘
  ⚡ Backdrop tap → closes sheet without applying
```

### 8.3 Paper Detail Page — Mobile Wireframe

```
┌──────────────────────────────────────┐
│ [← Question Papers]                  │  ← back navigation
├──────────────────────────────────────┤
│                                      │
│  [PYQ] [NEET UG]  [🔖 Save]         │  ← badges + bookmark toggle
│                                      │
│  NEET UG 2024 — Physics              │  ← title (large, bold)
│  Official Previous Year Paper        │  ← subtitle
│                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │ 180  │ │ 180  │ │  👁️  │ │ 📥   ││  ← stats row
│  │Marks │ │ Min  │ │5,100 │ │2,450 ││
│  └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│  About This Paper                    │
│  ┌────────────────────────────────┐  │
│  │  Exam:    NEET UG              │  │
│  │  Year:    2024                 │  │
│  │  Subject: Physics              │  │
│  │  Marks:   180 (45 questions)   │  │
│  │  Duration: 3 hours (180 min)   │  │
│  │  Marking: +4 correct / −1 wrong│  │
│  └────────────────────────────────┘  │
│                                      │
│  Instructions                        │
│  ┌────────────────────────────────┐  │
│  │  Read instructions carefully.  │  │
│  │  All 45 questions are MCQ...   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ╔════════════════════════════════╗  │
│  ║    [📄 View PDF Online]        ║  │  ← primary (opens PDF viewer)
│  ╚════════════════════════════════╝  │
│  ╔════════════════════════════════╗  │
│  ║    [⬇️ Download PDF]           ║  │  ← secondary
│  ╚════════════════════════════════╝  │
│                                      │
│  Related Papers                      │
│  ┌────────────────────────────────┐  │
│  │  NEET 2023 — Physics PYQ       │  │  ← related paper card
│  │  [View →]                      │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  NEET 2022 — Physics PYQ       │  │
│  └────────────────────────────────┘  │
│                                      │
│ [🏠]  [📄●]  [🧠]  [🔖]  [👤]      │
└──────────────────────────────────────┘
```

**Paper Detail State Transitions:**
```
setView("paper-detail") called from:
  - Dashboard recent papers
  - PapersList card [View Paper]
  - Bookmarks page [View Paper]
  - Related papers section

On entry: analytics.views += 1 (mock update)
Bookmark toggle: toggleBookmark("paper", paper.id) 
  → ⚡ icon animates: empty → filled (bounce effect)
  → ⚡ toast: "Saved to bookmarks" or "Removed from bookmarks"
[View PDF]: → window.open(paper.pdfUrl, '_blank') — mock: shows "PDF not available" toast
[Download PDF]: → window.open(paper.pdfUrl, '_blank') — mock: same
[Back]: → setView("papers")
Related paper [View →]: → setSelectedPaperId(id) → setView("paper-detail") (re-renders same page)
```

---

## 9. Quizzes Section — Full Flow

### 9.1 Quiz List — Mobile Wireframe

```
┌──────────────────────────────────────┐
│ [≡]  [NEET UG 2027 ▼]  [🔔][👤]    │
├──────────────────────────────────────┤
│                                      │
│  MCQ Quizzes                         │
│  NEET UG · 18 quizzes available      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 🔍 Search quizzes...           │  │
│  └────────────────────────────────┘  │
│                                      │
│  [Filter ▼]                          │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  [Hard] [Physics]     [🔖]    │  ← difficulty + subject badges
│  │  NEET Physics — Motion in a   │  ← title
│  │  Straight Line                 │
│  │  Chapter 1 — Physical World   │  ← chapter
│  │                                │
│  │  🧠30 Qs  ⏱️60min  🎯120 marks│  ← quiz meta
│  │  Marking: +4 correct / −1 wrong│  ← ⭐ marking scheme visible
│  │  1,240 attempts · Avg: 67.4   │  ← community stats
│  │                                │
│  │  ✅ Your best: 88/120 (3rd try)│  ← personal record (if attempted)
│  │                                │
│  │  ╔══════════════════════════╗  │
│  │  ║  [Start Quiz →]          ║  │
│  │  ╚══════════════════════════╝  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  [Medium] [Chemistry]  [🔖]   │
│  │  NEET Chemistry — Organic Rxns│
│  │  Chapter 12 — Aldehydes/Ketons│
│  │  🧠25 Qs  ⏱️45min  🎯100 marks│
│  │  Marking: +4 / −1             │
│  │  890 attempts · Avg: 58.2     │
│  │  [Start Quiz →]               │
│  └────────────────────────────────┘  │
│                                      │
│ [🏠]  [📄]  [🧠●]  [🔖]  [👤]      │
└──────────────────────────────────────┘
```

### 9.2 Quiz Detail — Pre-Start Screen

```
┌──────────────────────────────────────┐
│ [← MCQ Quizzes]                      │
├──────────────────────────────────────┤
│                                      │
│  [Hard] [Physics] [NEET UG]          │  ← badges
│                                      │
│  NEET Physics —                      │
│  Motion in a Straight Line           │  ← title (xl, bold)
│  Chapter 1                           │  ← chapter (gray)
│                                      │
│  ┌──────────┐ ┌──────────┐ ┌───────┐│
│  │    30    │ │  60 min  │ │ 120   ││  ← 3 info stats
│  │Questions │ │Time Limit│ │ Marks ││
│  └──────────┘ └──────────┘ └───────┘│
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ⚠️ Marking Scheme             │  │  ← amber box (always visible)
│  │  ┌────────┐ ┌────────┐ ┌─────┐ │  │
│  │  │  +4    │ │  −1    │ │  0  │ │  │
│  │  │Correct │ │ Wrong  │ │Skip │ │  │
│  │  └────────┘ └────────┘ └─────┘ │  │
│  │  ⚠️ Wrong answers deduct marks! │  │
│  └────────────────────────────────┘  │
│                                      │
│  Instructions                        │
│  ┌────────────────────────────────┐  │
│  │  30 MCQs. 60 minute limit.     │  │
│  │  Negative marking applies.     │  │
│  │  Only attempt if confident.    │  │  ← expandable
│  └────────────────────────────────┘  │
│                                      │
│  Your Previous Attempts              │
│  ┌────────────────────────────────┐  │
│  │  Attempt 3:  88/120  Jan 9    │  │
│  │  Attempt 2:  76/120  Jan 5    │  │
│  │  Attempt 1:  62/120  Jan 1    │  │
│  └────────────────────────────────┘  │
│                                      │
│  Select Mode:                        │
│  ┌──────────────────────────────┐    │
│  │ 📖 Practice Mode  [Rec.]     │    │  ← cards (radio selection)
│  │ Instant feedback per question│    │
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │ ⏱️ Exam Mode                  │    │
│  │ Timed · Real exam simulation  │    │
│  └──────────────────────────────┘    │
│                                      │
│  ╔════════════════════════════════╗  │
│  ║  [Start Practice Mode →]       ║  │  ← updates on mode selection
│  ╚════════════════════════════════╝  │
└──────────────────────────────────────┘
```

**On Start:**
```typescript
setCurrentAttempt({
  quizId: quiz.id,
  mode: selectedMode,
  answers: {},
  numericalAnswers: {},
  flagged: new Set(),
  currentQuestion: 0,
  startedAt: new Date(),
});
setView("quiz-attempt");
// ⚡ Full-screen transition animation
```

### 9.3 Quiz Attempt — Full Mobile UI

```
┌──────────────────────────────────────┐  ← No header/sidebar on mobile (full screen)
│  📖 Practice Mode        NEET Physics│  ← mode + quiz title (truncated)
│  Q 12 / 30              [Submit All] │  ← progress + submit btn
│  ████████████████░░░░░░░░░░░░░░░░░  │  ← progress bar
├──────────────────────────────────────┤
│                                      │
│  Question 12 · 4 marks               │  ← question number + marks
│                                      │
│  A body is thrown vertically         │
│  upward with velocity u. The         │
│  greatest height h to which it       │
│  will rise is:                       │  ← question text (leading-relaxed)
│                                      │
│  [⚑ Flag for review]                 │  ← top right of question
│                                      │
│  ┌────────────────────────────────┐  │
│  │ A  u/2g                        │  │  ← option button (min-h-[52px])
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ B  u²/g                        │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │ ← selected: blue border
│  │ C  u²/2g ✓ (your answer)       │  │   correct: green bg (practice mode)
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ D  2u²/g                       │  │
│  └────────────────────────────────┘  │
│                                      │
│  [PRACTICE MODE — after answering:]  │
│  ┌────────────────────────────────┐  │
│  │ ✅ Correct! +4 marks            │  │
│  │ Using v² = u² − 2gh, at max   │  │
│  │ height v=0, so h = u²/2g      │  │
│  └────────────────────────────────┘  │
│                                      │
│  [← Previous]          [Next →]      │  ← navigation (min-h-[44px])
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ⏱️ 47:23  (exam mode only)    │  │  ← timer (amber <10min, red <5min)
│  └────────────────────────────────┘  │
│                                      │
│  ╔════════════════════════════════╗  │
│  ║  [📋 Q12/30 · View All Qs]    ║  │  ← floating navigator trigger (mobile)
│  ╚════════════════════════════════╝  │
└──────────────────────────────────────┘
```

### 9.4 Question Navigator Bottom Sheet (Mobile)

```
  ⚡ Slides up when [View All Qs] tapped

┌──────────────────────────────────────┐
│     ▬   Navigator                    │
│  ✅ 18 answered  ⚑ 3 flagged         │
│  ⬜ 9 remaining                       │
│  ─────────────────────────────────── │
│                                      │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐  │  ← 8-col grid
│  │1 ││2 ││3 ││4 ││5 ││6 ││7 ││8 │  │  (green=answered, orange=flagged,
│  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘  │   blue=current, gray=unvisited)
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐  │
│  │9 ││10││11││12││13││14││15││16│  │
│  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘  │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐  │
│  │17││18││19││20││21││22││23││24│  │
│  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘  │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐          │
│  │25││26││27││28││29││30│          │
│  └──┘└──┘└──┘└──┘└──┘└──┘          │
│                                      │
│  Legend: [🟢 Answered] [🔘 Not Visited]│
│          [🟠 Flagged ] [🔵 Current]  │
│                                      │
│  ╔════════════════════════════════╗  │
│  ║    [Submit Quiz (Exam Mode)]   ║  │  ← only in exam mode
│  ╚════════════════════════════════╝  │
└──────────────────────────────────────┘
  Touch any number → closes sheet → jumps to that question
```

### 9.5 Submit Confirmation Dialog

```
  ⚡ Modal appears on [Submit Quiz]

┌────────────────────────────┐
│                            │
│  ⚠️ Submit Quiz?            │
│                            │
│  You have:                 │
│  ✅ 18 answered            │
│  ⬜  9 unattempted          │
│  ⚑   3 flagged             │
│                            │
│  Unattempted questions     │
│  score 0. Wrong answers    │
│  deduct 1 mark (NEET).     │
│                            │
│  [Cancel]  [Submit Quiz]   │
│                            │
└────────────────────────────┘
```

### 9.6 Quiz Submit State Flow

```
[Submit Quiz] → Confirmation dialog
  ↓ [Submit Quiz] confirmed
SCORING:
  for each question q in quiz.questions:
    answer = answers[q.id] || null
    if answer === null:
      marksAwarded = scheme.unattemptedMarks * q.marks = 0
    elif answer === q.correctOption:
      marksAwarded = scheme.correctMarks * q.marks   (e.g., +4)
    else:
      marksAwarded = scheme.wrongMarks * q.marks      (e.g., -1)

  correctCount   = count of correct answers
  wrongCount     = count of wrong answers
  skippedCount   = count of null answers
  rawScore       = sum(marksAwarded)
  totalScore     = rawScore  (can be negative for NEET/JEE)
  displayScore   = Math.max(0, rawScore)  (floor at 0 for display)
  percentage     = (totalScore / quiz.totalMarks) * 100
  percentile     = calculatePercentile(totalScore, completedAttempts, quiz.id)
  negativeMarks  = wrongCount * Math.abs(scheme.wrongMarks) * q.marks

BUILD QuizAttempt object:
  { id, quizId, quizTitle, subject, goalCategory, mode,
    totalScore, maxScore, percentage, percentile,
    correctCount, wrongCount, skippedCount, negativeMarks,
    timeTakenSeconds, isCompleted: true, submittedAt: now,
    answers: [...] }

ACTIONS:
  addAttempt(attempt)            → prepend to completedAttempts[]
  setLastAttemptId(attempt.id)   → track for result page
  clearInterval(timerRef)        → stop timer
  localStorage.removeItem(ACTIVE_ATTEMPT) → 💾 clear saved state
  setCurrentAttempt(null)        → clear active attempt
  setView("quiz-result")         → navigate to result
  ⚡ Confetti animation (if percentage ≥ 80%)
```

### 9.7 Quiz Result — Mobile Wireframe

```
┌──────────────────────────────────────┐
│ [← Quizzes]                          │
├──────────────────────────────────────┤
│                                      │
│       NEET Physics — Motion          │  ← quiz title
│                                      │
│         ┌───────────────┐            │
│         │   ╭──────╮    │            │  ← circular score SVG
│         │  ╭╯        ╰╮  │           │
│         │  │  88/120  │  │           │
│         │  ╰╮        ╭╯  │           │
│         │   ╰──────╯    │            │
│         │     73.3%      │            │
│         └───────────────┘            │
│                                      │
│     🏆 Great Performance!            │  ← grade label
│                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │  22  │ │   4  │ │   4  │ │47:32 ││  ← stats row
│  │  ✅  │ │  ❌  │ │  ⬜  │ │ ⏱️  ││
│  │Corrct│ │Wrong │ │Skip  │ │ Time ││
│  └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│  Score Breakdown                     │
│  ┌────────────────────────────────┐  │
│  │ ✅ 22 Correct × +4 = +88      │  │
│  │ ❌  4 Wrong × −1  =  −4       │  │
│  │ ⬜  4 Skipped × 0 =   0       │  │
│  │ ─────────────────────────     │  │
│  │ 🎯 Net Score:     88 / 120    │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📊 Your Percentile: 84th      │  │
│  │  Better than 84% of students   │  │
│  │  who attempted this quiz       │  │
│  └────────────────────────────────┘  │
│                                      │
│  ╔════════════════════════════════╗  │
│  ║    [📖 Review All Answers]     ║  │  ← primary
│  ╚════════════════════════════════╝  │
│  ╔════════════════════════════════╗  │
│  ║    [🔁 Retry This Quiz]        ║  │  ← secondary
│  ╚════════════════════════════════╝  │
│  [← Back to Quizzes]                 │  ← text link
│                                      │
│  Try These Next:                     │
│  [Related quiz 1] [Related quiz 2]   │
│                                      │
│ [🏠]  [📄]  [🧠●]  [🔖]  [👤]      │
└──────────────────────────────────────┘
```

### 9.8 Quiz Review — Mobile Wireframe

```
┌──────────────────────────────────────┐
│ [← Back to Result]                   │
├──────────────────────────────────────┤
│                                      │
│  Review: NEET Physics — Motion       │
│  ✅ 22 correct  ❌ 4 wrong  ⬜ 4 skip│
│                                      │
│  Filter: [All ●] [✅ Correct] [❌ Wrong] [⬜ Skip]
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Q1   ✅ Correct  +4           │  │
│  │  A body is thrown vertically...│  │
│  │                                │  │
│  │  ○ A  u/2g                     │  │
│  │  ○ B  u²/g                     │  │
│  │  ● C  u²/2g (your answer ✓)    │  │  ← green bg
│  │  ○ D  2u²/g                    │  │
│  │                                │  │
│  │  💡 Using v² = u²−2gh, at h_max│  │
│  │     v=0, therefore h = u²/2g   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Q7   ❌ Wrong  −1             │  │  ← red border
│  │  The acceleration of a ...     │  │
│  │                                │  │
│  │  ○ A  g upward                 │  │
│  │  ● B  g downward (your ans ✗)  │  │  ← red bg
│  │  ○ C  zero                     │  │
│  │  ✓ D  g upward (correct)       │  │  ← green bg
│  │                                │  │
│  │  💡 At max height, only gravity│  │
│  │     acts, which is downward... │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Q15  ⬜ Unattempted  0        │  │  ← gray border
│  │  ...                           │  │
│  │  ✓ A  Correct answer shown     │  │
│  │  💡 Explanation                │  │
│  └────────────────────────────────┘  │
│                                      │
│ [🏠]  [📄]  [🧠●]  [🔖]  [👤]      │
└──────────────────────────────────────┘
```

---

## 10. Bookmarks — Full Flow

```
┌──────────────────────────────────────┐
│ [≡]  [NEET UG 2027 ▼]  [🔔][👤]    │
├──────────────────────────────────────┤
│                                      │
│  Bookmarks                           │
│  12 saved items                      │
│                                      │
│  [All (12)] [Papers (8)] [Quizzes (4)]│  ← filter tabs
│                                      │
│  [SEARCH bookmarks...]               │
│                                      │
│  PAPERS                              │
│  ┌────────────────────────────────┐  │
│  │ [PYQ][NEET UG]                 │  │
│  │ NEET UG 2024 — Physics PYQ     │  │
│  │ Physics · 2024 · 180 marks     │  │
│  │ [View Paper →]  [🗑️ Remove]    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ [Board][12th HSC]              │  │
│  │ HSC Physics March 2024         │  │
│  │ Physics · 2024 · 80 marks      │  │
│  │ [View Paper →]  [🗑️ Remove]    │  │
│  └────────────────────────────────┘  │
│                                      │
│  QUIZZES                             │
│  ┌────────────────────────────────┐  │
│  │ [Hard][Physics][NEET]          │  │
│  │ NEET Physics — Rotational Mtn  │  │
│  │ 30 Qs · 60 min · +4/−1        │  │
│  │ [Start Quiz →]  [🗑️ Remove]    │  │
│  └────────────────────────────────┘  │
│                                      │
│  [Empty state when no bookmarks:]    │
│  🔖 (icon)                           │
│  No bookmarks yet                    │
│  Save papers and quizzes to find     │
│  them here quickly.                  │
│  [Browse Papers]  [Browse Quizzes]   │
│                                      │
│ [🏠]  [📄]  [🧠]  [🔖●]  [👤]      │
└──────────────────────────────────────┘
```

**Bookmark interactions:**
```
[🔖] icon on any card:
  → toggleBookmark("paper"|"quiz", id)
  → ⚡ icon morphs: outline → filled (spring animation)
  → ⚡ micro-toast: "Saved" or "Removed" (bottom of screen, 2s)

[🗑️ Remove] on bookmarks page:
  → toggleBookmark (removes)
  → ⚡ card slides out with fade ⚡
```

---

## 11. Profile — Full Flow

### 11.1 Mobile Wireframe

```
┌──────────────────────────────────────┐
│ [≡]  [NEET UG 2027 ▼]  [🔔][👤]    │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │        👤 (avatar)            │    │
│  │      Priya Sharma             │    │  ← name
│  │      priya.sharma@gmail.com   │    │  ← email (read-only)
│  │      [✏️ Edit Name]           │    │
│  └──────────────────────────────┘    │
│                                      │
│  My Goals                   [+ Add]  │
│  ┌────────────────────────────────┐  │
│  │ ✓ 📚 12th HSC Board (English)  │  │  ← primary/current (blue bg)
│  │   Class 12 · English Medium    │  │
│  │   [Set as Active] [× Remove]   │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │   🩺 NEET UG 2027              │  │
│  │   247 days to exam             │  │
│  │   [Set as Active] [× Remove]   │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │   🔬 JEE Mains 2027            │  │
│  │   183 days to exam             │  │
│  │   [Set as Active] [× Remove]   │  │
│  └────────────────────────────────┘  │
│  [+ Add New Goal]                    │  ← opens mini-onboarding sheet
│                                      │
│  My Stats                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │  22🔥│ │  34  │ │  67  │ │ 76%  ││
│  │Streak│ │Paper.│ │Quiz. │ │ Avg  ││
│  └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│  Attempt History (last 10)           │
│  ┌────────────────────────────────┐  │
│  │ NEET Physics Quiz  88/120      │  │
│  │ Jan 10, 2025 · Exam mode       │  │
│  │ [Review →]                     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ NEET Chemistry Quiz  74/100    │  │
│  │ Jan 9, 2025 · Practice mode    │  │
│  └────────────────────────────────┘  │
│                                      │
│  Account                             │
│  ┌────────────────────────────────┐  │
│  │  🔑 Change Password             │  │
│  │  🔔 Notification Preferences   │  │
│  │  ─────────────────────────     │  │
│  │  🚪 Logout                     │  │  ← setUser(null) → setView("landing")
│  └────────────────────────────────┘  │
│                                      │
│ [🏠]  [📄]  [🧠]  [🔖]  [👤●]      │
└──────────────────────────────────────┘
```

### 11.2 Add Goal — Mini Onboarding Bottom Sheet

```
  ⚡ Opens as bottom sheet from [+ Add Goal]

┌──────────────────────────────────────┐
│     ▬   Add New Goal                 │
│  ────────────────────────────────── │
│                                      │
│  ○ Board Exams (Class 8–12)          │
│  ○ NEET UG                           │
│  ○ JEE Mains                         │
│  ○ JEE Advanced                      │
│  ○ MHT-CET PCB                       │
│  ○ MHT-CET PCM                       │
│                                      │
│  [If Board selected:]                │
│  Standard: [10 ▼]  Medium: [Eng ▼]  │
│                                      │
│  [If Competitive selected:]          │
│  Target Year: [2027 ▼]              │
│                                      │
│  ╔════════════════════════════════╗  │
│  ║    [Add This Goal]             ║  │
│  ╚════════════════════════════════╝  │
│                                      │
└──────────────────────────────────────┘

ON ADD:
  → Build new Goal object
  → setUser({ ...user, goals: [...user.goals, newGoal] })
  → 💾 Save updated user to localStorage
  → ⚡ Sheet closes + new goal card appears with slide-in animation
  → ⚡ Toast: "NEET UG 2027 added to your goals!"
```

### 11.3 Remove Goal Flow

```
[× Remove] on goal card:
  ↓
CONFIRMATION DIALOG:
  "Remove NEET UG 2027 from your goals?
   Your progress and attempts will not be deleted.
   [Cancel]  [Remove Goal]"
  ↓ [Remove Goal]
  → filter: user.goals = user.goals.filter(g => g.id !== goal.id)
  → if removed goal was currentGoal → setCurrentGoal(user.goals[0])
  → setUser(updated)
  → 💾 Save to localStorage
  → ⚡ Card slides out with fade animation
  → ⚡ Toast: "NEET UG 2027 removed"
```

---

## 12. Admin Login

```
┌──────────────────────────────────────┐
│  [🔒 ParikshaCrack Admin Panel]       │  ← dark header
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │  🔑  Admin Login               │  │
│  │                                │  │
│  │  Email                         │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │ admin@parikshacrack.in   │  │  │
│  │  └──────────────────────────┘  │  │
│  │                                │  │
│  │  Password                      │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │ ••••••••••••••••  [👁️]  │  │  │
│  │  └──────────────────────────┘  │  │
│  │                                │  │
│  │  ❌ Invalid credentials        │  │  ← error state
│  │                                │  │
│  │  ╔════════════════════════╗   │  │
│  │  ║    [Admin Login]       ║   │  │
│  │  ╚════════════════════════╝   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ← [Back to main site]               │  ← setView("landing")
└──────────────────────────────────────┘

CREDENTIALS CHECK:
  email === "admin@parikshacrack.in" 
  AND password === "PARIKSHA_ADMIN_2026"
  ✅ → setUser({isAdmin:true,...}) → setView("admin-dashboard")
  ❌ → error: "Invalid admin credentials"
```

---

## 13. Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (slate-900)        HEADER (white)                      │
│  [Logo] Admin Panel         Admin > Dashboard  [👤 Admin] [🚪] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STATS ROW (6 cards):                                          │
│  ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐ │
│  │ 5,247  ││  412   ││  286   ││ 84,320 ││  1,247 ││   8    │ │
│  │Students││ Papers ││Quizzes ││Attempts││  DAU   ││Drafts  │ │
│  └────────┘└────────┘└────────┘└────────┘└────────┘└────────┘ │
│                                                                 │
│  QUICK ACTIONS:                                                 │
│  [+ Upload Paper]  [+ Create Quiz]  [+ Announcement]           │
│                                                                 │
│  CHARTS ROW:                                                    │
│  ┌─────────────────────────┐  ┌───────────────────────────┐    │
│  │  Registration Trend     │  │  Exam Distribution        │    │
│  │  (Line chart, monthly)  │  │  (Pie chart)              │    │
│  │  ↗ Growth curve         │  │  Board 55% / NEET 22%     │    │
│  │                         │  │  JEE 15% / CET 8%         │    │
│  └─────────────────────────┘  └───────────────────────────┘    │
│                                                                 │
│  TOP CONTENT:                                                   │
│  ┌─────────────────────────┐  ┌───────────────────────────┐    │
│  │  📄 Top Papers           │  │  🧠 Top Quizzes            │    │
│  │  1. NEET 2024 Physics   │  │  1. NEET Phy - Motion     │    │
│  │     2,980 downloads     │  │     1,240 attempts        │    │
│  │  2. HSC Physics 2023    │  │  2. Math - AP Quiz        │    │
│  │     3,400 downloads     │  │     980 attempts          │    │
│  └─────────────────────────┘  └───────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. Admin Papers — Complete CRUD Flow

### 14.1 Papers List View

```
ADMIN PAPERS PAGE
│
├── Search bar + Filters row
│   ├── [🔍 Search...]
│   ├── Exam Goal: [All ▼] → Board/NEET/JEE/CET
│   ├── Paper Type: [All ▼] → 12 type options
│   ├── Standard: [All ▼] → 8/9/10/11/12
│   ├── Status: [All ▼] → Published/Draft
│   └── [+ Upload Paper] button (top-right)
│
└── Data Table (responsive):
    Columns: □ | Title | Exam | Type | Std | Status | Analytics | Actions
    Rows: each paper (filtered)
    Actions per row: [✏️ Edit] [👁️ Preview] [📋 Duplicate] [🗑️ Delete]
    Bulk: Select multiple → [Publish Selected] [Delete Selected]
```

### 14.2 Upload/Edit Paper Form — Step by Step

```
STEP 1 — CATEGORIZATION
  ┌─────────────────────────────────────────────────────────────┐
  │ Exam / Goal:                                                │
  │ ● Board  ○ NEET  ○ JEE Mains  ○ JEE Advanced               │
  │ ○ MHT-CET PCB  ○ MHT-CET PCM                               │
  │                                                             │
  │ [If Board selected:]                                        │
  │   Standard: [8 ▼] [9 ▼] [10 ▼] [11 ▼] [12 ▼]             │
  │   [If 11 or 12:]                                            │
  │     Stream: [PCB ▼] [PCM ▼] [Commerce ▼] [Arts ▼]          │
  │   Medium:  [English ▼] [Semi-English ▼] [Marathi ▼]        │
  │                                                             │
  │ [If Competitive selected:]                                  │
  │   Exam Name: [NEET UG 2024________________]  ← auto-suggest │
  │   [If JEE Mains:]                                           │
  │     Session: [January ▼] [April ▼]                         │
  │     Shift:   [Shift 1 ▼] [Shift 2 ▼]                       │
  └─────────────────────────────────────────────────────────────┘

STEP 2 — PAPER DETAILS
  ┌─────────────────────────────────────────────────────────────┐
  │ Paper Type: [PYQ ▼]                                         │
  │   Options: Unit Test | Semester | Prelims | Board Exam |    │
  │            Model Paper | PYQ | Practice Set | Mock Test |   │
  │            Chapter-wise | Subject-wise | Minor | Major      │
  │                                                             │
  │ Subject: [Physics ▼]  ← filtered by selected exam/goal     │
  │ Chapter: [Optional - for chapter-wise papers]               │
  │ Year:    [2024 ▼]                                           │
  │ Marks:   [180____]                                          │
  │ Duration:[180____] minutes                                  │
  └─────────────────────────────────────────────────────────────┘

STEP 3 — TITLE & DESCRIPTION
  ┌─────────────────────────────────────────────────────────────┐
  │ Paper Title *                                               │
  │ ┌─────────────────────────────────────────────────────────┐ │
  │ │ NEET UG 2024 — Physics PYQ                              │ │
  │ └─────────────────────────────────────────────────────────┘ │
  │ ← Auto-suggested from exam + year + subject + type         │
  │                                                             │
  │ Description (optional)                                      │
  │ ┌─────────────────────────────────────────────────────────┐ │
  │ │                                                         │ │
  │ └─────────────────────────────────────────────────────────┘ │
  └─────────────────────────────────────────────────────────────┘

STEP 4 — PDF UPLOAD
  ┌─────────────────────────────────────────────────────────────┐
  │  ┌─────────────────────────────────────────────────────┐   │
  │  │           📎 Click to upload PDF                    │   │
  │  │           or drag & drop here                       │   │
  │  │           Max size: 20 MB · PDF only                │   │
  │  └─────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────┘

STEP 5 — STATUS
  ○ Save as Draft
  ● Publish Immediately

ACTIONS: [Save as Draft]  [Publish Paper →]
  → setView("admin-papers")
  → ⚡ Toast: "Paper published successfully!"
```

---

## 15. Admin Quizzes — Complete CRUD Flow

### 15.1 Quiz List

```
ADMIN QUIZZES PAGE
│
├── Header: "Quizzes (286)"  [+ Create Quiz]
├── Filters: Exam Goal | Subject | Difficulty | Status
│
└── Quiz Cards Grid (or list toggle)
    ┌─────────────────────────────────────────────────────┐
    │  [Hard] [Physics] [NEET UG]            Status: Live  │
    │  NEET Physics — Motion in Straight Line              │
    │  30 Qs · 60 min · 120 marks · +4/−1                 │
    │  1,240 attempts · Avg: 67.4/120                      │
    │  [✏️ Edit]  [👁️ Preview]  [📋 Duplicate]  [🗑️ Del]  │
    └─────────────────────────────────────────────────────┘
```

### 15.2 Create/Edit Quiz — Full Form

```
SECTION 1: Classification
  Goal/Exam: [NEET UG ▼]
  [If Board]: Standard [▼] Stream [▼]
  Subject: [Physics ▼]  (filtered by goal)
  Chapter: [Motion in Straight Line ▼] OR [Full Syllabus]
  Difficulty: [Easy] [Medium] [Hard ●] [Mixed]
  Tags: [NEET, Motion, Kinematics] (free text)

SECTION 2: Quiz Settings
  Title: [NEET Physics — Motion in Straight Line]
  Time Limit: [60] minutes  (0 = untimed)
  Instructions: [textarea]

SECTION 3: Marking Scheme  ← new in v2.0
  Preset: [NEET (+4/−1) ▼]
    Options: Board/NEET/JEE MCQ/JEE Num/CET PCM/CET PCB/Custom
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Correct  │ │  Wrong   │ │ Skipped  │
  │   +4     │ │   −1     │ │    0     │
  └──────────┘ └──────────┘ └──────────┘
  Preview: "+4 correct / −1 wrong (NEET pattern)"
  ⚠️ Negative marking is active

SECTION 4: Questions
  ┌─────────────────────────────────────────────────────┐
  │  Q1  [Edit ✏️]  [Delete 🗑️]  [↑↓ Reorder]          │
  │  "A body is thrown vertically upward..."            │
  │  A: u/2g  B: u²/g  ✓C: u²/2g  D: 2u²/g           │
  │  Marks: 4  |  Explanation: "Using v²=u²-2gh..."    │
  └─────────────────────────────────────────────────────┘
  │
  [+ Add Question] ─→ INLINE QUESTION EDITOR:
  ┌─────────────────────────────────────────────────────┐
  │  Question Type: ● MCQ  ○ Numerical (JEE)           │
  │                                                     │
  │  Question Text:                                     │
  │  ┌─────────────────────────────────────────────┐   │
  │  │ Type question here... (supports LaTeX: $formula$)│   │
  │  └─────────────────────────────────────────────┘   │
  │                                                     │
  │  [If MCQ:]                                          │
  │  Option A: [________________]                       │
  │  Option B: [________________]                       │
  │  Option C: [________________]                       │
  │  Option D: [________________]                       │
  │  Correct Answer: ○A ○B ●C ○D                       │
  │                                                     │
  │  [If Numerical:]                                    │
  │  Numerical Answer: [3.14159]                        │
  │  Tolerance (±):   [0.01]                            │
  │                                                     │
  │  Explanation: [textarea]                            │
  │  Marks per question: [4]                            │
  │  Difficulty: [Easy][Medium ●][Hard]                 │
  │                                                     │
  │  [Cancel]  [Add Question]                           │
  └─────────────────────────────────────────────────────┘

SECTION 5: Status
  ○ Draft
  ● Publish
  ○ Schedule: [📅 Date picker]

ACTIONS:
  [Save Draft]  [Preview Quiz]  [Publish Quiz]
```

---

## 16. Admin Subjects — Full Flow

```
ADMIN SUBJECTS PAGE
│
├── 10 Horizontal Tabs (scrollable on mobile):
│   [Board 8th] [Board 9th] [Board 10th] [Board 11th] [Board 12th]
│   [NEET UG] [JEE Mains] [JEE Advanced] [MHT-CET PCB] [MHT-CET PCM]
│
└── Tab Content (example: NEET UG selected)
    ┌── [+ Add Subject]
    │
    ├── Subject: Physics 🔵
    │   14 chapters · #3B82F6 ⚡ icon
    │   [✏️ Edit Subject] [🗑️ Delete]
    │   [▼ Expand Chapters]
    │     ├── Ch 1: Physical World and Measurement
    │     ├── Ch 2: Kinematics
    │     ├── Ch 3: Laws of Motion
    │     ├── ... (14 total)
    │     ├── (drag handles for reordering)
    │     └── [+ Add Chapter]
    │
    ├── Subject: Chemistry 🟣
    ├── Subject: Botany 🟢
    └── Subject: Zoology 🟤

ADD/EDIT SUBJECT FORM (inline or modal):
  Name: [Physics________________]
  Icon: [⚡] (emoji picker)
  Color: [#3B82F6] (color picker)
  GoalCategory: NEET UG (inherited from active tab)
  Standard: — (N/A for NEET)
  Chapters Count: auto from added chapters
```

---

## 17. Admin Announcements — Full Flow

```
ADMIN ANNOUNCEMENTS PAGE
│
├── Header: "Announcements"  [+ Create Announcement]
│
├── Filter: [All] [Active] [Expired] [Urgent] [Important]
│
└── Announcement Cards
    ┌─────────────────────────────────────────────────────┐
    │  🔴 URGENT                    Active  [Toggle ●]    │
    │  NEET 2027 Exam Date Confirmed                      │
    │  Targets: [🩺NEET] [📐JEE Mains]  (goal badges)    │
    │  Created: Jan 5, 2025  Expires: Mar 1, 2025         │
    │  [✏️ Edit]  [🗑️ Delete]  [📊 View Reach]           │
    └─────────────────────────────────────────────────────┘

CREATE/EDIT FORM:
  Title: [____________________________]
  
  Body:
  ┌─────────────────────────────────────────────────────┐
  │  [B] [I] [• List] [Link]  ← basic formatting       │
  │                                                     │
  │  NEET 2027 will be held on May 3, 2027.             │
  │  Register at natboard.edu.in before Feb 28.         │
  │                                                     │
  └─────────────────────────────────────────────────────┘
  
  Priority:  ○ Normal  ● Important  ○ Urgent
  
  Target Audience (multi-select):
  ┌────────────────────────────────────────────────────┐
  │  ☑ All Students                                    │
  │  ☐ Board (All Classes)                             │
  │  ☑ NEET UG          ← checked for this example    │
  │  ☑ JEE Mains                                       │
  │  ☐ JEE Advanced                                    │
  │  ☐ MHT-CET PCB                                     │
  │  ☐ MHT-CET PCM                                     │
  └────────────────────────────────────────────────────┘
  
  Expiry Date: [📅 March 1, 2025]
  
  [Save Draft]  [Publish Now]
```

---

## 18. Admin Users — Full Flow

```
ADMIN USERS PAGE
│
├── Header: "Students (5,247)"  [📤 Export CSV]
│
├── Search + Filters:
│   [🔍 Search name/email]
│   [Goal: All ▼] [Status: All ▼] [Joined: All ▼]
│
└── Users Table
    ┌──────┬──────────────────┬──────────────────┬───────┬──────┬──────────┬────────┐
    │Avat. │ Name/Email       │ Goals            │Attemp.│Streak│ Status   │ Actions│
    ├──────┼──────────────────┼──────────────────┼───────┼──────┼──────────┼────────┤
    │  P   │ Priya Sharma     │ [12th HSC][NEET] │  67   │ 22🔥 │ ✅Active │[👁️][⛔]│
    │      │ priya@gmail.com  │                  │       │      │          │        │
    ├──────┼──────────────────┼──────────────────┼───────┼──────┼──────────┼────────┤
    │  R   │ Rohan Patil      │ [10th Board]     │  18   │  7🔥 │ ⛔Blocked│[👁️][✅]│
    └──────┴──────────────────┴──────────────────┴───────┴──────┴──────────┴────────┘

ADMIN USER DETAIL PAGE:
│
├── Back: [← Students]
├── Student Info Card:
│   Avatar | Name | Email
│   Goals: [12th HSC Board (English)] [NEET UG 2027]
│   Joined: Nov 15, 2024
│   Last Active: Jan 10, 2025 (2h ago)
│   Status: Active [Block User]
│
├── Performance Summary:
│   Total Attempts: 67
│   Avg Score: 78.5%
│   Best Subject: Chemistry (avg 85%)
│   Needs Work: Zoology (avg 42%)
│   Streak: 22 days 🔥
│
└── Attempt History Table:
    Quiz Title | Goal | Score | % | Date | Mode
    [+ Load More]
```

---

## 19. Admin Analytics — Full Flow

```
ADMIN ANALYTICS PAGE
│
├── Date Range Picker: [Last 7 days ▼]
│   Options: 7d / 30d / 90d / 6m / 1y / Custom
│
├── Overview Cards (6):
│   DAU: 1,247 (+12% ↑) | New Signups: 287 | Quiz Attempts: 4,320
│   Paper Downloads: 8,100 | Avg Session: 18 min | Retention: 68%
│
├── Charts (3):
│   Row 1: Registration Trend (LineChart, by month, 6-month span)
│   Row 2: Daily Active Users (BarChart, 7/30 days)
│   Row 3: Exam Distribution (PieChart)
│           Board 55% | NEET 22% | JEE Mains 15% | CET 8%
│
├── Top Content (2 tables):
│   Top 5 Papers (by downloads this week)
│   Top 5 Quizzes (by attempts this week)
│
└── Score Distribution:
    Histogram: 0-20% | 20-40% | 40-60% | 60-80% | 80-100%
    Shows bell curve of all student quiz scores
```

---

## 20. Error States — Every Screen

| Screen | Error | Display Method | User Action |
|---|---|---|---|
| Login | Wrong credentials | Red inline banner (role="alert") | Re-enter |
| Login | Empty fields | Inline banner | Fill fields |
| Register | Password < 8 chars | Inline banner | Fix password |
| Register | Email already exists | Inline banner | Login instead |
| Verify OTP | Wrong OTP | Inline banner | Re-enter |
| Verify OTP | OTP expired | Inline banner + Resend btn | Resend OTP |
| Onboarding | 0 exams selected | Button stays disabled + warning text | Select exam |
| Onboarding | 0 subjects selected | Button stays disabled | Select subject |
| Papers List | No results | Empty state with illustration | Clear filters |
| Paper Detail | PDF not available | Toast notification | Try later |
| Quiz List | No quizzes for goal | Empty state with goal label | Switch goal or wait |
| Quiz Attempt | Timer expired | Auto-submit (no dialog needed) | View results |
| Quiz Attempt | Lost connection mid-quiz | Answers saved to localStorage, resume on return | Resume quiz |
| Quiz Result | No attempt found | Error state: "Start a quiz first" | → Quizzes |
| Admin Login | Wrong credentials | Inline error | Re-enter |
| Admin Papers | Upload fails | Error toast | Retry |
| Admin Quiz | 0 questions added | [Publish] disabled | Add questions |
| Any page | Slow connection | Skeleton loading placeholders | Wait |

---

## 21. Loading States — Every Screen

| Screen | Loading State |
|---|---|
| Dashboard | Skeleton cards (4 stat cards + progress bars) |
| Papers List | Skeleton grid of 6 paper card outlines |
| Quiz List | Skeleton grid of 4 quiz card outlines |
| Quiz Attempt | Spinner, then full question UI (instant from local data) |
| Quiz Result | Circular score ring animates from 0% → final % over 1s ⚡ |
| Profile | Avatar skeleton + stats skeleton |
| Admin Tables | Table skeleton (rows with gray bars) |

---

## 22. Micro-Interactions Catalogue

| Element | Interaction | Animation |
|---|---|---|
| Landing h1 | Mount | Character scramble → reveal (2s) |
| Stat numbers | Scroll into view | Count up from 0 → final value (1s) |
| Goal banner | Mount | Slide down from top (300ms) |
| Quiz result circle | Mount | SVG stroke animates from 0 → score (1s, ease-out) |
| Bookmark icon | Toggle | Scale 1 → 1.3 → 1 (bounce, 200ms) |
| Quiz option select | Tap | Scale 0.97 → 1 (press feedback, 100ms) |
| Bottom sheet | Open | translateY(100%) → 0 (300ms, ease-out) |
| Bottom sheet | Close | translateY(0) → 100% (250ms, ease-in) |
| Bottom nav active | Change | Active icon bounces up 4px (150ms) |
| Card hover (desktop) | Hover | Shadow increase + translate(-2px) (150ms) |
| Quiz timer <5min | Continuous | Text pulses (opacity 1→0.7→1, 1s cycle) |
| Toast | Appear | Slide in from bottom + fade in (200ms) |
| Toast | Auto-dismiss | Fade out (300ms, after 2s) |
| Filter chips | Remove | Scale → 0 + fade (150ms) |
| Goal switch | Switch | Header badge color morphs (300ms) |
| Submit confetti | ≥80% score | Particle burst from center (1s) |
| Page transitions | setView() | Fade in (200ms, opacity 0→1) |

---

## 23. Complete View Transition Table

| From | Action/Trigger | To | Data Set |
|---|---|---|---|
| `landing` | [Login] navbar btn | `login` | — |
| `landing` | [Register] navbar btn | `register` | — |
| `landing` | [Start Preparing Free] | `register` | — |
| `landing` | [Login to Dashboard] | `login` | — |
| `landing` | [Admin Panel] footer | `admin-login` | — |
| `login` | Submit valid credentials | `dashboard` | setUser(hardcoded) |
| `login` | Submit admin creds | `admin-dashboard` | setUser({isAdmin:true}) |
| `login` | [Forgot Password?] | `forgot-password` | — |
| `login` | [Register free] link | `register` | — |
| `register` | Submit valid form | `verify-otp` | setAuthEmail(email) |
| `register` | [Login] link | `login` | — |
| `verify-otp` | Enter 6-digit OTP | `onboarding` | setUser(new user) |
| `verify-otp` | [← Back] | `register` | — |
| `forgot-password` | Submit email | `reset-password` | setAuthEmail(email) |
| `forgot-password` | [← Back to login] | `login` | — |
| `reset-password` | Submit valid reset | `login` | — (+ success toast) |
| `onboarding` | Complete all steps | `dashboard` | setUser(goals added) 💾 |
| `dashboard` | [Papers] nav | `papers` | — |
| `dashboard` | [Quizzes] nav | `quizzes` | — |
| `dashboard` | [Bookmarks] nav | `bookmarks` | — |
| `dashboard` | [Profile] nav | `profile` | — |
| `dashboard` | Recent paper card | `paper-detail` | setSelectedPaperId |
| `dashboard` | Recent quiz card | `quiz-detail` | setSelectedQuizId |
| `dashboard` | Resume quiz banner | `quiz-attempt` | (restore saved state) |
| `papers` | [View Paper] on card | `paper-detail` | setSelectedPaperId |
| `paper-detail` | [← Back] button | `papers` | — |
| `paper-detail` | Related paper [View] | `paper-detail` | setSelectedPaperId (re-render) |
| `quizzes` | Quiz card [Start] | `quiz-detail` | setSelectedQuizId |
| `quiz-detail` | [← Back] button | `quizzes` | — |
| `quiz-detail` | [Start Quiz] | `quiz-attempt` | setCurrentAttempt 💾 |
| `quiz-attempt` | Submit (manual or auto) | `quiz-result` | addAttempt, clearSaved 💾 |
| `quiz-result` | [Review Answers] | `quiz-review` | — |
| `quiz-result` | [Retry Quiz] | `quiz-attempt` | setCurrentAttempt (fresh) |
| `quiz-result` | [← Back to Quizzes] | `quizzes` | — |
| `quiz-result` | Related quiz card | `quiz-detail` | setSelectedQuizId |
| `quiz-review` | [← Back to Result] | `quiz-result` | — |
| `bookmarks` | Paper [View →] | `paper-detail` | setSelectedPaperId |
| `bookmarks` | Quiz [Start →] | `quiz-detail` | setSelectedQuizId |
| `profile` | [+ Add Goal] | `profile` (sheet) | mini-onboarding bottom sheet |
| `profile` | [Set as Active] | Same view | setCurrentGoal(goal) 💾 |
| `profile` | [Logout] | `landing` | setUser(null) + localStorage.clear() |
| `admin-login` | Submit valid admin | `admin-dashboard` | setUser({isAdmin:true}) |
| `admin-dashboard` | [+ Upload Paper] | `admin-paper-upload` | — |
| `admin-dashboard` | [+ Create Quiz] | `admin-quiz-create` | — |
| `admin-dashboard` | [+ Announcement] | `admin-announcements` | — |
| `admin-papers` | [✏️ Edit] | `admin-paper-edit` | set editing paper |
| `admin-paper-upload` | [Save Draft / Publish] | `admin-papers` | add to paperList + toast |
| `admin-paper-edit` | [Update Paper] | `admin-papers` | update in paperList + toast |
| `admin-quizzes` | [+ Create Quiz] | `admin-quiz-create` | — |
| `admin-quiz-create` | [Publish] | `admin-quizzes` | add to quizList + toast |
| `admin-quiz-create` | [Preview] | `admin-quiz-preview` | — |
| `admin-quiz-preview` | [← Back to Edit] | `admin-quiz-create` | — |
| `admin-quiz-edit` | [Update] | `admin-quizzes` | update in quizList + toast |
| `admin-users` | [👁️ View] | `admin-user-detail` | set selected user |
| `admin-user-detail` | [← Students] | `admin-users` | — |
| Any admin | Sidebar nav link | target admin view | — |
| Any admin | [Logout] | `landing` | setUser(null) |

---

## 24. LocalStorage Persistence Map

| Event | Key Written | Data |
|---|---|---|
| Login success | `pc_user` | Full User object |
| Onboarding complete | `pc_user` | Updated User with goals[] |
| Goal switched | `pc_current_goal` | Current Goal object |
| Bookmark toggle | `pc_bookmarks` | Bookmark[] array |
| Quiz started | `pc_active_attempt` | ActiveAttempt object |
| Quiz timer tick (every 10s) | `pc_active_attempt` | Updated with timeLeft |
| Quiz submitted | `pc_active_attempt` | REMOVED (localStorage.removeItem) |
| Logout | ALL pc_* keys | CLEARED (localStorage.clear()) |

---

*End of App/Web Flow Document v2.0 — ParikshaCrack*
