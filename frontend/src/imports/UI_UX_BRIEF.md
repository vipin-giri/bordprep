# 🎨 UI/UX Brief — DETAILED
## ParikshaCrack v2.0 — Complete Design System, Visual Language & Interaction Patterns
**Version:** 2.0 | **Date:** June 2026 | **Status:** Final  
**Grounded in:** Actual codebase (v1.0) + Indian EdTech UX research + WCAG 2.1 AA

---

## 0. How to Read This Document

- **CSS variable** format: `--color-primary: #1E3A8A`
- **Tailwind class** format: `bg-[#1E3A8A] text-white rounded-xl`
- **Measurement** format: `44×44px` (width × height)
- **`[Mobile]`** = applies only at < 640px
- **`[Desktop]`** = applies only at ≥ 1024px
- **Research note**: Every non-obvious design decision cites its rationale

---

## 1. Design Philosophy & Research Foundation

### 1.1 User Psychology: Understanding the Indian Exam Student

ParikshaCrack users are students aged 13–20 preparing for some of the most competitive exams in the world. NEET has ~2 million applicants for ~100,000 seats (2% acceptance). JEE Advanced has ~250,000 applicants for ~17,000 seats (7%). This creates specific psychological pressures that must inform every design decision:

**Key emotional states users arrive in:**
- **Anxiety** — "Am I studying enough?"
- **Overwhelm** — "There's too much to cover"
- **Motivation dips** — Studying the same subject for 18 months causes fatigue
- **Comparison anxiety** — "Others are scoring higher than me"
- **Time pressure** — "Exams are in N days"

**Design responses to each:**

| Emotional State | Design Response |
|---|---|
| Anxiety | Clean, uncluttered layouts; progress bars that show what's done, not just what's left |
| Overwhelm | Goal-filtered content — never show NEET content to a Board student |
| Motivation dip | Streak counter, confetti on good scores, "You improved by +8 marks!" messages |
| Comparison anxiety | Percentile shown positively ("Better than 84% of students") not negatively |
| Time pressure | Exam countdown shown as "days remaining" not a countdown clock (less stressful) |

### 1.2 Cognitive Load Principles

Based on cognitive load theory (Sweller, 1988), UI design for learning apps must:

1. **Reduce extraneous load** — Remove all UI elements that don't help learning
   - No decorative animations in the quiz engine
   - No ads or promotional banners during quiz
   - Quiz attempt hides sidebar and bottom nav (full attention)

2. **Manage intrinsic load** — Help students handle difficult content
   - One question visible at a time (not all 30 scrollable)
   - Clear visual hierarchy: question text → options → feedback
   - Explanation shown immediately after Practice Mode answer (germane load)

3. **Chunking** — Break complex information into digestible pieces
   - Dashboard: stat cards in groups of 4
   - Quiz result: score → breakdown → review (progressive reveal)
   - Onboarding: 5-7 steps, not 1 overwhelming form

4. **Recognition over recall** — Users shouldn't memorize navigation
   - Persistent bottom nav (always visible, no hidden hamburgers)
   - Active state always clearly marked
   - Goal Switcher shows current goal at a glance

### 1.3 Gamification Psychology (Done Right)

**Streak counter design:**
- Research shows streaks work best when: (a) the goal feels achievable, (b) loss feels tangible
- Design: Show streak prominently on dashboard; use fire emoji 🔥 (universally understood)
- Loss aversion: "Your 22-day streak is at risk!" notification at 11:30 PM if no quiz taken
- Recovery: Allow 1 "streak shield" per week (future feature)

**Score display psychology:**
- Never show score in isolation — always show context
- "88/120 (73.3%)" alone is meaningless; "84th percentile" gives meaning
- Use grade labels that are encouraging: "Good" (60–75%), "Excellent" (75–90%), "Outstanding" (90%+)
- Never use "Fail" or "Poor" — use "Needs Practice" with specific guidance

**Negative marking UX:**
- NEET/JEE students deeply understand negative marking — don't hide it
- Show marking scheme BEFORE quiz starts (anxiety reduction)
- During quiz: warning before submitting unanswered questions
- After result: show the math (+88 from 22 correct − 4 from 4 wrong = 84)
- This builds mathematical intuition about when to attempt vs. skip

### 1.4 Core Design Principles

| Principle | What It Means | Example |
|---|---|---|
| **Clarity First** | One primary action per screen | Dashboard has one "Take Quiz" CTA, not five |
| **Exam-Aware Identity** | Each exam has a distinct color — NEET is always green | NEET badge is always `bg-green-100 text-green-800` |
| **Calm Confidence** | Design should feel capable, not flashy | White surfaces, soft shadows, no neon colors |
| **Earned Delight** | Animations celebrate achievement, not fill space | Confetti only on ≥80% score |
| **Mobile-Genuine** | Not "mobile-compatible" but "mobile-native" | Bottom nav, bottom sheets, thumb-zone CTAs |
| **Progressive Trust** | Show less to new users, more as they engage | Percentile only shown after 2+ quiz attempts |

### 1.5 Design Personality Words

If ParikshaCrack were a person, they would be:
- **A helpful senior student**, not a formal teacher
- **Organized and calm**, not frantic
- **Encouraging without being condescending**
- **Honest** — shows real scores, real percentiles, real weak areas

NOT:
- Not corporate and sterile (like government websites)
- Not childish and cartoon-like (this is serious exam prep)
- Not overwhelming with features (focus on the core loop)

---

## 2. Complete Color System

### 2.1 Brand Foundation Colors

```css
/* ── Core Brand ─────────────────────────────────────────────── */
--color-primary:          #1E3A8A;   /* Deep Navy Blue — main brand */
--color-primary-hover:    #1D4ED8;   /* Blue-700 — hover state */
--color-primary-light:    #EFF6FF;   /* Blue-50 — subtle tinted bg */
--color-primary-border:   #BFDBFE;   /* Blue-200 — border on light bg */

--color-accent:           #F97316;   /* Vibrant Orange — energy, action */
--color-accent-hover:     #EA6C09;   /* Darker orange for hover */
--color-accent-light:     #FFF7ED;   /* Orange-50 — streak bg */

/* ── Surfaces ────────────────────────────────────────────────── */
--color-bg:               #F8FAFC;   /* Off-white — all page backgrounds */
--color-surface:          #FFFFFF;   /* Pure white — cards, panels */
--color-surface-raised:   #F1F5F9;   /* Slate-100 — input bg, alt rows */
--color-surface-overlay:  rgba(0,0,0,0.40); /* Backdrops, overlays */

/* ── Borders ─────────────────────────────────────────────────── */
--color-border:           #E2E8F0;   /* Slate-200 — default borders */
--color-border-strong:    #CBD5E1;   /* Slate-300 — focus adjacent borders */
--color-border-focus:     #1E3A8A;   /* Primary — input focus ring */

/* ── Text ────────────────────────────────────────────────────── */
--color-text-primary:     #1E293B;   /* Slate-800 — headings, body */
--color-text-secondary:   #475569;   /* Slate-600 — subtitles, meta */
--color-text-muted:       #94A3B8;   /* Slate-400 — placeholders, captions */
--color-text-inverse:     #FFFFFF;   /* On dark backgrounds */
--color-text-brand:       #1E3A8A;   /* Brand-colored text links */

/* ── Semantic States ─────────────────────────────────────────── */
--color-success:          #16A34A;   /* Green-600 — correct, published */
--color-success-light:    #DCFCE7;   /* Green-100 — success bg */
--color-success-border:   #BBF7D0;   /* Green-200 — success border */

--color-warning:          #D97706;   /* Amber-600 — flagged, low progress */
--color-warning-light:    #FEF3C7;   /* Amber-100 — warning bg */
--color-warning-border:   #FDE68A;   /* Amber-200 — warning border */

--color-error:            #DC2626;   /* Red-600 — wrong, blocked, expired */
--color-error-light:      #FEE2E2;   /* Red-100 — error bg */
--color-error-border:     #FECACA;   /* Red-200 — error border */

--color-info:             #0284C7;   /* Sky-600 — informational */
--color-info-light:       #E0F2FE;   /* Sky-100 — info bg */
```

### 2.2 Exam Goal Color Palette (Complete)

Each of the 6 exam categories gets a complete 5-shade palette. These colors drive ALL goal-related visual identity throughout the app.

```css
/* ── Board Exams (Deep Blue) ────────────────────────────────── */
--goal-board-50:   #EFF6FF;   /* Lightest bg for goal cards */
--goal-board-100:  #DBEAFE;   /* Badge backgrounds */
--goal-board-200:  #BFDBFE;   /* Badge borders, dividers */
--goal-board-500:  #3B82F6;   /* Main accent (blue-500) */
--goal-board-600:  #2563EB;   /* Hover, stronger accent */
--goal-board-700:  #1D4ED8;   /* Text on light bg (4.5:1 contrast) */
--goal-board-800:  #1E3A8A;   /* Dark text, matches brand primary */

/* ── NEET UG (Forest Green) ────────────────────────────────── */
--goal-neet-50:    #F0FDF4;
--goal-neet-100:   #DCFCE7;
--goal-neet-200:   #BBF7D0;
--goal-neet-500:   #22C55E;
--goal-neet-600:   #16A34A;
--goal-neet-700:   #15803D;
--goal-neet-800:   #166534;

/* ── JEE Mains (Violet/Purple) ─────────────────────────────── */
--goal-jee-mains-50:   #F5F3FF;
--goal-jee-mains-100:  #EDE9FE;
--goal-jee-mains-200:  #DDD6FE;
--goal-jee-mains-500:  #8B5CF6;
--goal-jee-mains-600:  #7C3AED;
--goal-jee-mains-700:  #6D28D9;
--goal-jee-mains-800:  #5B21B6;

/* ── JEE Advanced (Deep Indigo) ─────────────────────────────── */
--goal-jee-adv-50:   #EEF2FF;
--goal-jee-adv-100:  #E0E7FF;
--goal-jee-adv-200:  #C7D2FE;
--goal-jee-adv-500:  #6366F1;
--goal-jee-adv-600:  #4F46E5;
--goal-jee-adv-700:  #4338CA;
--goal-jee-adv-800:  #3730A3;

/* ── MHT-CET PCB (Teal/Cyan) ────────────────────────────────── */
--goal-cet-pcb-50:   #ECFEFF;
--goal-cet-pcb-100:  #CFFAFE;
--goal-cet-pcb-200:  #A5F3FC;
--goal-cet-pcb-500:  #06B6D4;
--goal-cet-pcb-600:  #0891B2;
--goal-cet-pcb-700:  #0E7490;
--goal-cet-pcb-800:  #155E75;

/* ── MHT-CET PCM (Sky Blue) ─────────────────────────────────── */
--goal-cet-pcm-50:   #F0F9FF;
--goal-cet-pcm-100:  #E0F2FE;
--goal-cet-pcm-200:  #BAE6FD;
--goal-cet-pcm-500:  #0EA5E9;
--goal-cet-pcm-600:  #0284C7;
--goal-cet-pcm-700:  #0369A1;
--goal-cet-pcm-800:  #075985;
```

**Usage rule for goal colors:**

| Context | Shade Used | Example |
|---|---|---|
| Goal badge background | `-100` | `bg-[--goal-neet-100]` |
| Goal badge border | `-200` | `border-[--goal-neet-200]` |
| Goal badge text | `-700` | `text-[--goal-neet-700]` |
| Goal card background | `-50` | `bg-[--goal-neet-50]` |
| Goal left-border accent | `-500` | `border-l-4 border-[--goal-neet-500]` |
| Goal header/banner bg | gradient from `-600` to `-800` | Dashboard goal banner |
| Progress bar fill | `-500` | Dynamic, goal-matched |

### 2.3 Paper Type Badge Colors (All 12)

```css
/* Format: background / border / text */
--type-unit-test:    #FEF3C7 / #FDE68A / #92400E;  /* Amber */
--type-semester:     #DBEAFE / #BFDBFE / #1E40AF;  /* Blue */
--type-prelims:      #EDE9FE / #DDD6FE / #5B21B6;  /* Violet */
--type-board:        #FEE2E2 / #FECACA / #991B1B;  /* Red */
--type-model:        #D1FAE5 / #A7F3D0 / #065F46;  /* Emerald */
--type-practice:     #F3F4F6 / #E5E7EB / #374151;  /* Gray */
--type-pyq:          #FFF7ED / #FED7AA / #9A3412;  /* Orange */
--type-mock-test:    #E0E7FF / #C7D2FE / #3730A3;  /* Indigo */
--type-chapter-wise: #CCFBF1 / #99F6E4 / #134E4A;  /* Teal */
--type-subject-wise: #CFFAFE / #A5F3FC / #164E63;  /* Cyan */
--type-minor-test:   #FCE7F3 / #FBCFE8 / #831843;  /* Pink */
--type-major-test:   #FFE4E6 / #FECDD3 / #9F1239;  /* Rose */
```

### 2.4 Difficulty Colors

```css
--difficulty-easy:   #DCFCE7 / #16A34A;  /* Green */
--difficulty-medium: #FEF3C7 / #D97706;  /* Amber */
--difficulty-hard:   #FEE2E2 / #DC2626;  /* Red */
--difficulty-mixed:  #EDE9FE / #7C3AED;  /* Violet */
```

### 2.5 Admin Status Colors

```css
--status-published: #DCFCE7 / #166534;   /* Green: bg / text */
--status-draft:     #FEF3C7 / #92400E;   /* Amber */
--status-scheduled: #DBEAFE / #1E40AF;   /* Blue */
--status-archived:  #F3F4F6 / #374151;   /* Gray */
--status-blocked:   #FEE2E2 / #991B1B;   /* Red (user status) */
--status-active:    #DCFCE7 / #166534;   /* Green (user status) */
--status-unverified:#FEF3C7 / #92400E;   /* Amber */
```

### 2.6 Announcement Priority Colors

```css
/* Normal */
--announce-normal-bg:     #F8FAFC;
--announce-normal-border: #E2E8F0;
--announce-normal-accent: #94A3B8;   /* left border */

/* Important */
--announce-important-bg:     #FFFBEB;
--announce-important-border: #FDE68A;
--announce-important-accent: #F59E0B;
--announce-important-icon:   #D97706;

/* Urgent */
--announce-urgent-bg:     #FFF5F5;
--announce-urgent-border: #FECACA;
--announce-urgent-accent: #EF4444;
--announce-urgent-icon:   #DC2626;
/* + pulsing red dot on icon */
```

---

## 3. Typography System

### 3.1 Font Rationale

**Why Poppins for headings?**
- Geometric sans-serif with round terminals — feels friendly, not corporate
- Excellent at heavy weights (600, 700) — strong presence on mobile
- Widely used in Indian educational apps (students find it familiar)
- Great support for numerals (score display critical in this app)

**Why Inter for body text?**
- Designed specifically for screen readability at small sizes
- Neutral personality — doesn't compete with content
- Excellent Latin + Devanagari script support (future Marathi UI)
- Open-source Google Font with fast CDN delivery

**Why JetBrains Mono for scores?**
- Monospace ensures score numbers don't cause layout shift as they update
- "88/120" doesn't reflow if score changes to "120/120"
- Distinguishes technical/numerical content from prose

### 3.2 Complete Type Scale

```css
/* ── Display (Landing Page Only) ────────────────────────────── */
.text-display-xl {
  font-family: 'Poppins', sans-serif;
  font-size: 3rem;        /* 48px on desktop, 2rem/32px on mobile */
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.text-display-lg {
  font-family: 'Poppins', sans-serif;
  font-size: 2.25rem;     /* 36px, 1.75rem on mobile */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

/* ── Headings (App UI) ───────────────────────────────────────── */
.text-heading-xl {         /* Page titles, dashboard welcome */
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;       /* 24px desktop, 1.25rem/20px mobile */
  font-weight: 700;
  line-height: 1.3;
}

.text-heading-lg {         /* Card titles, section headings */
  font-family: 'Poppins', sans-serif;
  font-size: 1.125rem;     /* 18px */
  font-weight: 600;
  line-height: 1.35;
}

.text-heading-md {         /* Sub-sections, quiz question number */
  font-family: 'Poppins', sans-serif;
  font-size: 0.9375rem;    /* 15px */
  font-weight: 600;
  line-height: 1.4;
}

.text-heading-sm {         /* Card labels, nav items */
  font-family: 'Poppins', sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 600;
  line-height: 1.4;
}

/* ── Body (Content) ──────────────────────────────────────────── */
.text-body-lg {            /* Instructions, descriptions */
  font-family: 'Inter', sans-serif;
  font-size: 1rem;         /* 16px */
  font-weight: 400;
  line-height: 1.65;       /* Extra tall for reading comfort */
}

.text-body-md {            /* Default body, quiz question text */
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;    /* 15px — comfortable for question reading */
  font-weight: 400;
  line-height: 1.6;
}

.text-body-sm {            /* Meta, timestamps, captions */
  font-family: 'Inter', sans-serif;
  font-size: 0.8125rem;    /* 13px */
  font-weight: 400;
  line-height: 1.5;
}

/* ── Labels & UI Elements ────────────────────────────────────── */
.text-label {              /* Form labels, filter section headers */
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;      /* 12px */
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.text-badge {              /* All pill badges — type, goal, difficulty */
  font-family: 'Poppins', sans-serif;
  font-size: 0.6875rem;    /* 11px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* ── Mono (Scores, Numbers) ──────────────────────────────────── */
.text-score-xl {           /* Quiz result main score: "88 / 120" */
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;         /* 32px */
  font-weight: 600;
  line-height: 1.2;
}

.text-score-lg {           /* Dashboard stat cards: "67" */
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;       /* 24px */
  font-weight: 600;
  line-height: 1.2;
}

.text-score-md {           /* Inline scores in quiz navigator */
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;     /* 14px */
  font-weight: 500;
  line-height: 1.2;
}
```

### 3.3 Mobile Type Adjustments

```css
/* Reduce display sizes on mobile */
@media (max-width: 640px) {
  .text-display-xl { font-size: 2rem; }        /* 48 → 32px */
  .text-display-lg { font-size: 1.625rem; }    /* 36 → 26px */
  .text-heading-xl { font-size: 1.25rem; }     /* 24 → 20px */
  .text-heading-lg { font-size: 1rem; }        /* 18 → 16px */
  /* body sizes stay — never go below 13px */
}
```

### 3.4 Line Length Guidelines

| Context | Max Width | Why |
|---|---|---|
| Quiz question text | 60–70 chars | Optimal reading line length |
| Explanation text | 65–75 chars | Comfortable for paragraph reading |
| Card titles | 40–50 chars | Card width constraint |
| Badge labels | 15–20 chars | Truncate with `...` if longer |
| Mobile body text | full width | No max-width on mobile — use padding |

---

## 4. Spacing System

### 4.1 8px Grid System

All spacing values are multiples of 4px. The primary unit is 8px.

```
4px  = space-1   → micro gaps (icon to text, badge padding-x)
8px  = space-2   → tight gaps (between list items, input padding-y)
12px = space-3   → small gaps (between related elements in a card)
16px = space-4   → standard card padding-y, gap between cards
20px = space-5   → comfortable card padding (primary padding)
24px = space-6   → between different sections within a page
32px = space-8   → between major UI sections
40px = space-10  → page-level top margin, hero section padding
48px = space-12  → large section gaps
64px = space-16  → landing page section separators
```

### 4.2 Context-Specific Spacing

```css
/* Cards */
--card-padding:     20px;        /* Inner padding on mobile */
--card-padding-lg:  24px;        /* Inner padding on desktop */
--card-gap:         12px;        /* Gap between cards in a grid */
--card-gap-lg:      16px;        /* Gap on desktop */

/* Forms */
--input-padding-x:  14px;
--input-padding-y:  10px;
--form-field-gap:   16px;        /* Between form fields */
--form-section-gap: 24px;        /* Between form sections */

/* Navigation */
--nav-item-height:  44px;        /* Min tap target for nav items */
--bottom-nav-height: 64px;       /* Fixed bottom nav height */
--header-height:    56px;        /* Sticky header height */
--sidebar-width:    240px;       /* Desktop sidebar */

/* Content */
--page-padding-x-mobile:  16px;  /* Horizontal page padding on mobile */
--page-padding-x-tablet:  24px;
--page-padding-x-desktop: 32px;
--content-max-width:      1152px; /* Max content width on desktop */
```

### 4.3 Density Mode

The app uses "comfortable" density — not as dense as data tables (admin), not as spacious as marketing pages (landing).

| Mode | Context | Padding | Line Height |
|---|---|---|---|
| Compact | Admin tables, lists | 8–12px | 1.4 |
| Comfortable | All student views | 16–20px | 1.6 |
| Spacious | Landing page | 40–64px | 1.8 |

---

## 5. Border Radius System

```css
--radius-xs:   4px;    /* Tiny: status indicator dots */
--radius-sm:   6px;    /* Small: inline badge corners */
--radius-md:   8px;    /* Medium: smaller buttons, table rows */
--radius-lg:   12px;   /* Large: inputs, dropdown items */
--radius-xl:   16px;   /* Extra: primary cards ← most used */
--radius-2xl:  20px;   /* 2x: bottom sheets, large modals */
--radius-3xl:  24px;   /* 3x: hero cards, full-page overlays */
--radius-full: 9999px; /* Pill: badges, avatars, toggle switches */
```

**When to use which radius:**

| Element | Radius | Rationale |
|---|---|---|
| Paper card | `xl (16px)` | Friendly, modern feel |
| Quiz card | `xl (16px)` | Consistent with paper cards |
| Buttons | `lg (12px)` | Recognizable as buttons, not rounded |
| Input fields | `lg (12px)` | Matches buttons for visual harmony |
| Badges/pills | `full` | Maximum roundedness for small labels |
| Bottom sheet | `3xl top only` | Slides up from bottom — only top corners rounded |
| Modals/dialogs | `2xl (20px)` | Prominent but not extreme |
| Stat card icons | `xl (16px)` | Squared-ish but friendly |
| Quiz option | `xl (16px)` | Large tap area needs generous radius |
| Avatar | `full` | Always circular |
| Bottom nav | `0` | Full-width — no radius |
| Sidebar | `0` | Full-height — no radius |

---

## 6. Shadow System

### 6.1 Shadow Scale

```css
/* No shadow — flat elements (inline badges, table rows) */
--shadow-none: none;

/* Ultra-subtle — resting cards */
--shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);

/* Card default state */
--shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.06),
             0 1px 2px rgba(15, 23, 42, 0.04);

/* Card hover state */
--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08),
             0 2px 4px  rgba(15, 23, 42, 0.05);

/* Floating elements (dropdowns, goal switcher, tooltips) */
--shadow-lg: 0 8px 24px rgba(15, 23, 42, 0.12),
             0 4px 8px  rgba(15, 23, 42, 0.06);

/* Modals, confirmation dialogs */
--shadow-xl: 0 20px 60px rgba(15, 23, 42, 0.15),
             0 8px  24px rgba(15, 23, 42, 0.08);

/* Bottom sheet (strongest, comes from bottom) */
--shadow-bottom-sheet: 0 -4px 24px rgba(15, 23, 42, 0.12),
                       0 -2px 8px  rgba(15, 23, 42, 0.06);

/* Sidebar */
--shadow-sidebar: 2px 0 8px rgba(15, 23, 42, 0.08);

/* Bottom nav */
--shadow-bottom-nav: 0 -1px 0 rgba(15, 23, 42, 0.06),
                     0 -4px 12px rgba(15, 23, 42, 0.04);
```

### 6.2 Shadow Usage Rules

- Never add shadow to elements that are already on a dark background (sidebar, navy cards)
- Cards on `--color-bg` (#F8FAFC) background: use `--shadow-sm`
- Cards on `--color-surface` (white) background: use `--shadow-xs` (almost flat)
- Hover state: transition from `--shadow-sm` to `--shadow-md` over 150ms

---

## 7. Component Specifications

### 7.1 Buttons — Complete Spec

#### Primary Button (Main CTA)
```css
/* Tailwind: */
className="
  min-h-[44px] px-5 py-2.5
  bg-[#1E3A8A] hover:bg-[#1D4ED8] active:bg-[#1E40AF]
  text-white text-sm font-semibold font-['Poppins']
  rounded-xl
  border border-transparent
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  flex items-center justify-center gap-2
  w-full sm:w-auto  /* Full width on mobile by default */
"
```

#### Accent Button (Start Quiz, Strong CTA)
```css
className="
  min-h-[44px] px-5 py-2.5
  bg-[#F97316] hover:bg-[#EA6C09] active:bg-[#DC5D03]
  text-white text-sm font-semibold
  rounded-xl
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2
"
```

#### Ghost Button (Secondary Actions)
```css
className="
  min-h-[44px] px-5 py-2.5
  bg-transparent hover:bg-gray-50 active:bg-gray-100
  text-gray-700 text-sm font-medium
  rounded-xl
  border border-gray-200 hover:border-gray-300
  transition-all duration-150
"
```

#### Danger Button (Delete, Block)
```css
className="
  min-h-[44px] px-5 py-2.5
  bg-transparent hover:bg-red-50 active:bg-red-100
  text-red-600 text-sm font-medium
  rounded-xl
  border border-red-200 hover:border-red-300
  transition-all duration-150
"
```

#### Icon Button (Bell, Bookmark, Close)
```css
className="
  min-h-[44px] min-w-[44px] p-2
  rounded-xl
  bg-transparent hover:bg-gray-100 active:bg-gray-200
  text-gray-500 hover:text-gray-700
  transition-colors duration-150
  focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-1
  flex items-center justify-center
"
/* Icon size: 18–20px */
```

#### Loading State (any button)
```tsx
// When loading = true:
// 1. Replace text with spinner + loading text
// 2. Disable button (disabled attribute)
// 3. Keep button dimensions stable (prevent layout shift)
<button disabled className="...">
  <svg className="animate-spin w-4 h-4" .../>
  Logging in...
</button>
```

### 7.2 Form Inputs — Complete Spec

#### Text Input
```css
/* Base input */
className="
  w-full min-h-[44px] px-3.5 py-2.5
  bg-white
  border border-gray-200
  rounded-xl
  text-[15px] text-gray-900 font-['Inter']
  placeholder:text-gray-400
  transition-all duration-150
  focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10
  disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
  read-only:bg-gray-50
"

/* With left icon (e.g., search, email): */
/* Wrapper: relative */
/* Icon: absolute left-3 top-1/2 -translate-y-1/2, color gray-400, size 16px */
/* Input: pl-9 */

/* With right icon (password toggle, clear): */
/* Icon: absolute right-3 top-1/2 -translate-y-1/2 */
/* Input: pr-9 */
```

#### Error State Input
```css
/* Add to base input: */
"border-red-300 focus:border-red-400 focus:ring-red-100"

/* Error message below input: */
className="mt-1 text-xs text-red-600 flex items-center gap-1"
/* Icon: AlertCircle size={12} */
```

#### Select Dropdown
```css
className="
  w-full min-h-[44px] px-3.5 py-2.5
  bg-white
  border border-gray-200
  rounded-xl
  text-[15px] text-gray-900
  /* Custom arrow: */
  appearance-none
  bg-[url('chevron-down-icon')] bg-no-repeat bg-right-3-center
  pr-9
  focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10
"
```

#### Textarea
```css
className="
  w-full px-3.5 py-2.5
  min-h-[96px]
  bg-white border border-gray-200 rounded-xl
  text-[15px] text-gray-900 leading-relaxed
  resize-y
  focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10
"
```

#### OTP Input (6 boxes)
```css
/* Each box: */
className="
  w-11 h-13 sm:w-12 sm:h-14   /* 44px min width */
  text-center text-xl font-bold font-['JetBrains Mono']
  text-gray-900
  bg-white border-2 border-gray-200 rounded-xl
  focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10
  transition-all duration-100
  caret-transparent  /* Hide text cursor in OTP boxes */
"
type="tel"
inputMode="numeric"
maxLength={1}
```

### 7.3 Cards — Complete Spec

#### Standard Content Card
```css
className="
  bg-white
  border border-gray-100
  rounded-2xl         /* 16px */
  p-5                 /* 20px padding mobile */
  sm:p-6              /* 24px on larger screens */
  shadow-sm
  hover:shadow-md hover:-translate-y-0.5
  transition-all duration-150
  cursor-pointer      /* if clickable */
"
```

#### Goal Banner Card (Dashboard Hero)
```css
/* Goal-specific gradient background */
className="
  rounded-2xl p-5
  text-white
  bg-gradient-to-br from-[--goal-X-700] to-[--goal-X-900]
  relative overflow-hidden
"
/* Subtle decorative circle (pseudo-element): */
/* ::before { content:''; position:absolute; top:-40px; right:-40px;
   width:150px; height:150px; border-radius:full; 
   background: rgba(255,255,255,0.05) } */
```

#### Stat Card (Dashboard 4-up grid)
```css
className="
  bg-white border border-gray-100 rounded-2xl p-4 sm:p-5
  flex items-start gap-3
  shadow-xs
"

/* Icon container: */
"w-10 h-10 rounded-xl flex items-center justify-center"
/* Icon: Lucide, size 18, color = goal-specific or semantic color */

/* Number: text-score-lg (24px JetBrains Mono 600) */
/* Label: text-xs Inter 500 text-gray-500 mt-0.5 */
```

#### Paper Card
```css
/* Full spec: */
className="
  bg-white border border-gray-100 rounded-2xl p-4 sm:p-5
  shadow-xs hover:shadow-md hover:-translate-y-0.5
  transition-all duration-150
"

/* Layout inside paper card: */
/* Row 1: [type badge] [goal badge]       [bookmark icon] */
/* Row 2: Title (heading-lg, 2-line clamp)                */
/* Row 3: subject · year · marks · duration (body-sm gray) */
/* Row 4: analytics (downloads, views, bookmarks)         */
/* Row 5: [View Paper →] button (full-width on mobile)    */
```

#### Quiz Card
```css
/* Same base as paper card, plus: */
/* Row 1: [difficulty badge] [subject badge]     [bookmark] */
/* Row 2: Title                                             */
/* Row 3: chapter name                                      */
/* Row 4: question count · time · total marks              */
/* Row 5: marking scheme pill (+4/−1 NEET)                 */
/* Row 6: attempts · avg score                             */
/* Row 7: personal best (if attempted)                     */
/* Row 8: [Start Quiz →]                                   */
```

#### Announcement Banner Card
```css
className="
  bg-[--announce-X-bg]
  border border-[--announce-X-border]
  border-l-4 border-l-[--announce-X-accent]
  rounded-xl p-4
  flex items-start gap-3
"

/* Icon: size 16, color = announce accent, mt-0.5 */
/* Content: flex-1 */
/* Title: 14px Poppins 600 */
/* Body: 13px Inter line-clamp-2 text-gray-600 */
/* Footer: flex justify-between items-center mt-2 */
/*   Goal badges (tiny) | timestamp | [close X] */
```

### 7.4 Badges & Pills — Complete Spec

#### Goal Badge
```css
/* Example: NEET UG badge */
className="
  inline-flex items-center gap-1
  px-2.5 py-0.5
  bg-[--goal-neet-100]
  text-[--goal-neet-700]
  border border-[--goal-neet-200]
  rounded-full
  text-[11px] font-semibold font-['Poppins'] tracking-wide uppercase
"
/* Icon: goal emoji (🩺) at 12px */
```

#### Paper Type Badge
```css
className="
  inline-flex items-center
  px-2 py-0.5
  rounded-full
  text-[11px] font-semibold font-['Poppins'] tracking-wide uppercase
  bg-[type-specific] text-[type-specific] border border-[type-specific]
"
```

#### Difficulty Badge
```css
/* With dot indicator */
className="
  inline-flex items-center gap-1.5
  px-2.5 py-0.5
  rounded-full
  text-xs font-semibold
  bg-[diff-light] text-[diff-dark]
"
/* Dot: w-1.5 h-1.5 rounded-full bg-[diff-main] */
```

#### Filter Chip (Active filter, dismissible)
```css
className="
  inline-flex items-center gap-1
  px-3 py-1
  bg-[#1E3A8A]/10 text-[#1E3A8A]
  border border-[#1E3A8A]/20
  rounded-full
  text-xs font-medium
"
/* X button: ml-1 hover:bg-[#1E3A8A]/20 rounded-full p-0.5 */
```

### 7.5 Progress Elements

#### Linear Progress Bar (Subject Progress)
```css
/* Track: */
className="h-1.5 bg-gray-100 rounded-full overflow-hidden"

/* Fill — color based on value: */
/* ≥ 70%: bg-green-500 */
/* ≥ 40%: bg-[#1E3A8A] */
/* < 40%: bg-orange-400 */
className="h-full rounded-full transition-all duration-700 ease-out"
/* Width: style={{ width: `${progress}%` }} */
/* Initial: width: 0; then animate to actual % on mount */
```

#### Exam Countdown Progress Bar (Dashboard)
```css
/* Prep time progress: days elapsed / total prep days */
/* Track: h-2 bg-white/20 rounded-full (on dark gradient bg) */
/* Fill: bg-white/80 rounded-full */
/* Always shown on goal banner card */
```

#### Circular Score Ring (Quiz Result)
```css
/* SVG implementation: */
/* size: 120×120px on mobile, 140×140px on desktop */
/* Circle: stroke-width 8, stroke-linecap round */
/* Track color: rgba(255,255,255,0.2) or gray-100 */
/* Fill color: goal-specific or semantic (green if ≥80%) */
/* Animation: stroke-dashoffset from total → remaining over 800ms */
/* Center text: score in JetBrains Mono */
```

### 7.6 Question Navigator Grid

```css
/* Grid container: */
className="grid grid-cols-8 gap-1 sm:grid-cols-5 sm:gap-1.5"
/* Mobile: 8 cols (small buttons) */
/* Desktop sidebar: 5 cols (larger buttons) */

/* Each button: */
className="
  aspect-square rounded-lg
  text-xs font-semibold
  flex items-center justify-center
  min-h-[36px]          /* Mobile minimum */
  sm:min-h-[40px]       /* Desktop */
  transition-all duration-100
  focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]
"

/* State variants: */
/* Not visited:  bg-gray-50 text-gray-400 border border-gray-200 */
/* Answered:     bg-blue-50 text-blue-700 border border-blue-200 */
/* Flagged:      bg-amber-50 text-amber-600 border border-amber-200 */
/* Current:      bg-[#1E3A8A] text-white (no border) */
/* Correct (review): bg-green-50 text-green-700 border border-green-200 */
/* Wrong (review):   bg-red-50 text-red-600 border border-red-200 */
```

### 7.7 Bottom Sheet

```css
/* Overlay backdrop: */
className="
  fixed inset-0 bg-black/40 z-40 sm:hidden
  transition-opacity duration-300
"
/* Show: opacity-100; Hide: opacity-0 pointer-events-none */

/* Sheet itself: */
className="
  fixed bottom-0 left-0 right-0 z-50 sm:hidden
  bg-white
  rounded-t-3xl          /* Only top corners rounded */
  shadow-bottom-sheet
  transform transition-transform duration-300 ease-out
  max-h-[85vh]           /* Never cover full screen */
  overflow-hidden        /* Prevent sheet itself from scrolling */
"
/* Open: translate-y-0; Closed: translate-y-full */

/* Drag handle: */
className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4 flex-shrink-0"

/* Scrollable content inside sheet: */
className="overflow-y-auto overscroll-contain pb-safe"
/* pb-safe = padding-bottom: env(safe-area-inset-bottom, 16px) */
```

### 7.8 Bottom Navigation Bar

```css
/* Container: */
className="
  fixed bottom-0 left-0 right-0 z-50 sm:hidden
  h-16
  bg-white
  border-t border-gray-100
  shadow-bottom-nav
  flex items-center justify-around
  px-1
"
/* + pb-safe for iPhone notch */

/* Each nav item: */
className="
  flex flex-col items-center justify-center
  flex-1 h-full
  gap-0.5
  rounded-xl mx-0.5
  transition-colors duration-150
  min-w-[44px]
  focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:ring-inset
"
/* Active: text-[#1E3A8A] bg-[#1E3A8A]/5 */
/* Inactive: text-gray-400 */

/* Active indicator (top border): */
/* Active item gets: border-t-2 border-[#1E3A8A] -mt-0.5 */

/* Icon: 22px lucide icon */
/* Label: text-[10px] font-medium mt-0.5 */
```

### 7.9 Sidebar (Desktop)

```css
/* Student sidebar: */
className="
  hidden lg:flex flex-col
  fixed left-0 top-0 bottom-0 w-60
  bg-[#1E3A8A]
  shadow-sidebar
  z-30
"

/* Logo section: */
className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10"
/* Logo: 32×32px */
/* Brand name: Poppins 18px 700 text-white */

/* Nav items: */
className="flex flex-col gap-0.5 p-3 flex-1"
/* Each item: */
className="
  flex items-center gap-3 px-3 py-2.5
  rounded-xl
  text-sm font-medium transition-colors duration-150
  min-h-[44px]
"
/* Active:   bg-white/15 text-white font-semibold */
/* Inactive: text-blue-200 hover:bg-white/8 hover:text-white */
/* Icon: 18px */

/* User section at bottom: */
className="p-3 border-t border-white/10"
/* Avatar: 36×36px rounded-full bg-white/20 text-white */
/* Name: 13px Poppins 600 text-white */
/* Goal label: 11px text-blue-200 */
/* Logout: text-red-300 hover:text-red-200 */
```

### 7.10 Admin Sidebar

```css
/* Same structure as student sidebar but: */
className="bg-[#0F172A]"  /* Slate-900 instead of navy */
/* Active item: bg-white/10 */
/* Inactive item: text-slate-400 hover:bg-white/5 hover:text-white */
/* Breadcrumb in admin header: "Admin > Papers" */
```

### 7.11 Goal Switcher Component

```css
/* Trigger button: */
className="
  flex items-center gap-2
  px-3 py-1.5
  bg-white border border-gray-200
  rounded-xl
  text-sm font-medium text-gray-700
  hover:bg-gray-50 hover:border-gray-300
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20
  max-w-[180px]            /* Prevent excessive width */
"
/* Color dot: w-2.5 h-2.5 rounded-full (goal color -500) */
/* Label: truncate */
/* Arrow: ChevronDown size={14} text-gray-400 */

/* Dropdown (desktop): */
className="
  absolute top-full right-0 mt-1
  bg-white border border-gray-100
  rounded-2xl shadow-lg
  min-w-[220px]
  z-50
  py-1
"

/* Each goal item in dropdown: */
className="
  flex items-center gap-2.5 px-3 py-2.5
  hover:bg-gray-50
  cursor-pointer
  text-sm
  min-h-[44px]
"
/* Active item: bg-blue-50 text-[#1E3A8A] font-medium */
/* Inactive: text-gray-700 */
/* Color dot: w-2.5 h-2.5 */
/* Check icon (active): CheckCircle2 size={14} text-[#1E3A8A] ml-auto */
/* Countdown text: text-xs text-gray-400 */

/* Divider + Add Goal: */
className="border-t border-gray-100 mt-1 pt-1"
/* Button: text-[#1E3A8A] flex items-center gap-2 */
/* Icon: Plus size={14} */
```

### 7.12 Toast Notification

```css
/* Container (stacked): */
className="
  fixed top-4 right-4 z-[100]
  flex flex-col gap-2
  max-w-[320px] w-full
"

/* Individual toast: */
className="
  bg-white border border-gray-100
  rounded-xl shadow-lg
  p-4
  flex items-start gap-3
  border-l-4 border-l-[semantic-color]
  animate-slide-in-right
"

/* Types: */
/* Success: border-l-green-500, icon: CheckCircle (green) */
/* Error:   border-l-red-500, icon: XCircle (red) */
/* Info:    border-l-blue-500, icon: Info (blue) */
/* Warning: border-l-amber-500, icon: AlertTriangle (amber) */

/* Content: */
/* Title: 14px Poppins 600 */
/* Message: 13px Inter text-gray-600 */
/* Auto-dismiss: 3s with progress bar underneath */
/* Hover: pause auto-dismiss (user is reading) */
```

### 7.13 Empty State Component

```css
/* Container: */
className="
  flex flex-col items-center justify-center
  py-16 px-6
  text-center
"

/* Icon: */
className="w-16 h-16 text-gray-200 mb-4"
/* Use themed Lucide icon (FileText for papers, Brain for quizzes, etc.) */

/* Title: */
className="text-base font-semibold text-gray-500 mb-2"

/* Subtitle: */
className="text-sm text-gray-400 max-w-[280px] mb-6"

/* CTA (optional): */
/* Primary button or text link */
```

---

## 8. Screen-Specific Design Annotations

### 8.1 Landing Page

**Hero Section:**
```
Design intent: Create immediate visual impact that communicates 
               "serious exam prep platform" not "tutoring app"

Image carousel: 5 images, crossfade 800ms, 5s intervals
Overlay: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.65))
  → Ensures text is readable across all 5 images (minimum 4.5:1 contrast)

Hero text layout (mobile-first):
  Eyebrow badge: "Maharashtra Board's #1 Exam Prep Platform"
    → bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full
  H1: 2rem → 3rem (responsive)
    → "Crack Your Board, NEET, JEE & CET Exams"
    → White text, bold
    → After scramble animation: "Board Exams" → orange (#F97316) span
  Subtitle: 1rem text-white/90 max-w-md
  CTA buttons: stacked on mobile, side-by-side on sm:
    → Primary: "Start Preparing Free" (orange bg, full-width mobile)
    → Secondary: "Login to Dashboard" (white border, ghost)
```

**Stats Row:**
```
4 stats in 2×2 grid on mobile, 1×4 on desktop
Each stat: white/10 backdrop-blur, rounded-xl, p-3
Number: text-2xl font-bold font-['JetBrains Mono'] text-white
Label: text-xs text-white/70

Counter animation: useIntersectionObserver → 
  when visible: count from 0 to final over 1000ms (easeOutQuart curve)
```

**Features Section:**
```
4 cards in 1-col mobile, 2-col sm, 4-col lg
Each card: bg-white, rounded-2xl, p-6, shadow-sm
Icon container: 48×48px, rounded-xl, goal-colored bg
Icon: 24px Lucide, goal color
Title: heading-md
Description: body-sm text-gray-600

Hover: translateY(-4px) + shadow-md (150ms)
Stagger: each card animates in 100ms after previous (useIntersectionObserver)
```

**Subjects Section:**
```
Three groups: "10th SSC", "12th HSC", "Competitive Exams"
Subject pills: rounded-full, px-4 py-1.5, colored bg
  10th pills: blue-50/blue-700
  12th pills: indigo-50/indigo-700
  Competitive: goal-specific colors
Horizontal scrollable on mobile (overflow-x-auto, no-scrollbar)
```

**Testimonials:**
```
3 cards, horizontal scroll on mobile (snap-x snap-mandatory)
Card: bg-white rounded-2xl p-5 shadow-sm min-w-[280px] sm:min-w-auto
Quote icon: " (large, text-gray-100, positioned absolute top-left)
Quote text: body-md italic
Author: flex items-center gap-2 mt-4
  Avatar: w-8 h-8 rounded-full (initial letter, goal-colored bg)
  Name: text-sm font-semibold
  Score badge: green pill "89% in Physics"
```

### 8.2 Auth Pages

**AuthLayout card:**
```
Min-height: 100vh
Background: bg-gray-50 (off-white — matches app bg)
Card: bg-white max-w-md w-full mx-auto
  mt-[72px]  (below navbar height)
  px-6 py-8
  rounded-2xl shadow-sm border border-gray-100

Navbar: fixed top-0, white, shadow-sm, h-14
  [← Back arrow] logo [Brand name]
  Back arrow: hover:bg-gray-100 rounded-xl p-2
```

**Form validation visual:**
```
BEFORE submit: No validation shown (don't annoy user pre-attempt)
AFTER submit: 
  - Invalid field: red border + red ring + red label + error message below
  - Error banner: bg-red-50 border border-red-200 rounded-xl p-3
    flex items-center gap-2 text-red-700 text-sm
    Icon: AlertCircle size={16}
    role="alert" aria-live="polite"

Success state (e.g., forgot password sent):
  - Green envelope SVG illustration (not an icon, larger)
  - Large success heading
  - Muted description
  - Primary CTA
```

### 8.3 Onboarding Flow

**Step card design:**
```
Full viewport on mobile (no white card wrapper — full bg-white screen)
Narrow card on desktop: max-w-md

Progress bar section (top):
  Height: 4px track (thin) → 6px fill
  Color: [#1E3A8A]
  Step label: text-xs text-gray-500 mb-2

Step transition animation:
  New step: slides in from right (translateX(20px) → 0, opacity 0→1, 200ms)
  Previous step: slides out to left (translateX(-20px), opacity 1→0)
```

**Goal type selection (Step 0):**
```
Cards: full-width on mobile (not side-by-side)
  [Board Exams] — above
  [Competitive Exams] — middle
  [Both!] — below

Each card: h-[88px] rounded-2xl p-4
  flex items-center gap-4
  border-2 border-transparent
  Deselected: bg-gray-50 border-gray-200
  Selected:   bg-[#1E3A8A]/5 border-[#1E3A8A]
  Left: emoji (2rem)
  Center: title (Poppins 600 15px) + subtitle (Inter 13px gray-500)
  Right: CheckCircle icon (appears on selection, blue)
```

**Standard selection (Step 1):**
```
3×2 grid on mobile (3 cols, 2 rows = 5 buttons + 1 empty)
Each button: aspect-square, max-w-[80px] mx-auto
  Deselected: bg-gray-50 border border-gray-200 rounded-xl
  Selected: bg-[#1E3A8A] text-white rounded-xl
  Number: text-xl font-bold (centered)
  Label below: text-[10px] text-gray-500 (SSC, Board, HSC, etc.)
```

**Subject pills (Final step):**
```
Pill grid: flex flex-wrap gap-2
Each pill: h-[36px] px-3.5 py-1.5 rounded-full
  Icon: 16px emoji
  Label: text-sm Poppins 500
  Deselected: bg-gray-100 text-gray-600 border border-gray-200
  Selected: bg-[#1E3A8A]/10 text-[#1E3A8A] border border-[#1E3A8A]/30
            + CheckCircle icon appears on right (12px)
  Transition: all 100ms
```

### 8.4 Student Dashboard

**Welcome/Goal Banner:**
```
Full-width card with goal-specific gradient
Gradient: from-[goal-700] to-[goal-900] at 135deg
  → NEET: from-green-700 to-green-900
  → Board: from-blue-700 to-blue-900

Content layout (mobile):
  Top row: emoji icon (24px) · goal short label · [Switch ▼ if multi-goal]
  Greeting: "Welcome back, Priya! 👋" (heading-xl white)
  Subtext: goal description (text-sm text-white/80)
  Countdown: "📅 247 days to NEET 2027" (text-sm bg-white/15 rounded-lg px-3 py-1 inline-flex)
  Prep progress bar: thin, white-on-transparent
  CTAs: 2 buttons (white outline: "Browse Papers" | white bg: "Take Quiz")

Decorative element:
  Faded large emoji (exam-specific: 🩺 for NEET, 🔬 for JEE)
  Position: absolute right-4 top-1/2 -translate-y-1/2
  Size: 72px, opacity: 0.08
```

**Stats Row (4 cards):**
```
Grid: grid-cols-2 gap-3 sm:grid-cols-4

Each card: bg-white border border-gray-100 rounded-2xl p-4 shadow-xs
Icon container: w-10 h-10 rounded-xl (goal-specific tinted bg)
  Papers viewed: bg-blue-50, FileText blue icon
  Quiz attempts: bg-purple-50, Brain purple icon
  Streak:        bg-orange-50, Flame orange icon
  Avg score:     bg-green-50, TrendingUp green icon

Value: text-score-lg (JetBrains Mono 24px 600 text-gray-900)
Label: text-xs text-gray-500 mt-1 font-medium

countUp animation:
  From: 0 → To: value
  Duration: 600ms, delay: 50ms × card-index (stagger)
  Easing: easeOutQuart
```

**Subject Progress Section:**
```
Section header: flex justify-between items-center mb-3
  Title: "Subject Progress" (heading-sm text-gray-700)
  Link: "View all →" (text-xs text-[#1E3A8A] font-medium)

Per subject row:
  flex items-center gap-3 py-2 border-b border-gray-50 last:border-0

  Icon: subject emoji, 20px
  Name: text-sm font-medium flex-1
  Progress bar: flex-1 (track h-1.5 bg-gray-100 rounded-full)
  Count: text-xs text-gray-400 (4/12 quizzes)
  Percent: text-xs font-semibold text-gray-600 w-8 text-right

Color thresholds:
  ≥ 70%: fill bg-green-500
  ≥ 40%: fill bg-[#1E3A8A]
  < 40%: fill bg-orange-400

Animation: width 0 → actual% on mount, 600ms ease-out, 
           delay = row-index × 80ms
```

**Score Trend Chart:**
```
Container: bg-white border border-gray-100 rounded-2xl p-4 sm:p-5
Height: 160px on mobile, 200px on desktop

Recharts LineChart config:
  margin: { top:5, right:5, bottom:5, left:-20 }
  CartesianGrid: strokeDasharray="3 3" stroke="#F1F5F9"
  XAxis: tick fontSize=11 fill="#94A3B8" axisLine=false tickLine=false
  YAxis: tick fontSize=11 fill="#94A3B8" axisLine=false tickLine=false
         domain=[0, 100]
  Line: stroke="#1E3A8A" strokeWidth=2 type="monotone"
        dot={ r:3 fill="#1E3A8A" strokeWidth=0 }
        activeDot={ r:5 stroke="#1E3A8A" strokeWidth=2 fill="white" }
  Tooltip: Custom, white bg, border-gray-100, rounded-xl p-2 shadow-md text-xs

Responsive: use ResponsiveContainer width="100%" height={160 or 200}
```

### 8.5 Papers List

**Search bar:**
```
Full-width, min-h-[44px], pl-10 (space for search icon)
Magnifying glass: absolute left-3 top-1/2 -translate-y-1/2 text-gray-400
Clear button (×): appears when search not empty, absolute right-3

Debounce: 300ms (don't filter on every keystroke)
```

**Mobile filter UX flow:**
```
Desktop (≥ 640px):
  Inline filter panel below search
  2-column grid layout
  Collapsible (default: expanded)

Mobile (< 640px):
  Filter button: "Filter (3) ▼" floating above results
  Tapping → bottom sheet slides up
  Active filter count shown as badge on button
  Inside sheet: vertical list of filter sections
  [Apply Filters] sticky at bottom of sheet
  Backdrop: dismiss without applying
```

**Paper card information density:**
```
Mobile card (< 640px): 
  Compact layout — essentials only
  Type badge + goal badge (top row)
  Title (2-line clamp)
  Subject · Year · Marks (single line, truncate)
  Analytics row (small, gray icons)
  [View Paper →] button (full-width)

Desktop card: 
  Wider layout — can show more
  Same content but breathing room
  [🔖] and [View →] side-by-side
```

### 8.6 Quiz Engine (Exam Mode)

**Design intent:**
```
The quiz attempt UI must remove ALL distractions.
This is a simulated exam environment.
Design should feel like a focused exam room, not an app.
```

**Full-screen design decisions:**
```
- Bottom navigation: HIDDEN (sm:hidden + always hidden during quiz)
- Sidebar: HIDDEN
- Main header: REPLACED with minimal quiz header
- Background: #F8FAFC (same as app, no jarring change)
- Max content width: 720px (comfortable reading line length)
```

**Quiz header:**
```
Height: 56px
Background: white
Border-bottom: 1px solid #E2E8F0
Shadow: shadow-xs

Layout: [← exit | quiz title (truncated)] [spacer] [timer | submit button]
  
Exit button: text-gray-500, with confirmation dialog before exit
Timer: 
  Container: bg-[timer-color]/10 text-[timer-color] px-3 py-1 rounded-lg
  Font: JetBrains Mono 14px 600
  Normal: blue-50/blue-700
  Warning (<10min): amber-50/amber-700
  Urgent (<5min): red-50/red-700 + animate-pulse

Submit button: Always orange (accent color) → feels like a strong action
```

**Question card:**
```
Container: bg-white rounded-2xl p-5 sm:p-6 shadow-sm

Question number row:
  "Question 12 of 30" text-xs text-gray-400
  "4 marks" text-xs font-semibold text-gray-600 ml-auto
  [Flag ⚑] button: text-xs text-amber-600, bg-amber-50 rounded-lg px-2 py-1
    Active (flagged): bg-amber-400 text-white

Question text:
  font-family: Inter (body text for readability)
  font-size: 15px line-height: 1.65
  color: #1E293B
  max-w: 660px (optimal reading width)
  
  For math/formulas: render as plain text with Unicode symbols
  Future: KaTeX for LaTeX rendering

Options A/B/C/D:
  Each: full-width button (tap-optimized)
  Height: min 52px (44px + 8px padding = comfortable)
  Layout: flex items-start gap-3 p-4 rounded-xl border-2
  
  Option letter: w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
    Deselected letter container: bg-gray-100 text-gray-600 text-xs font-bold
    Selected letter container:   bg-[#1E3A8A] text-white
  
  Option text: text-sm Inter leading-relaxed flex-1

  States:
  → Unselected: bg-white border-gray-200 text-gray-700
  → Selected:   bg-[#1E3A8A]/5 border-[#1E3A8A] text-gray-900
  
  [PRACTICE MODE - after answering:]
  → Correct:  bg-green-50 border-green-400 (your correct answer)
  → Wrong:    bg-red-50 border-red-400 (your wrong answer)
  → Correct answer (others): bg-green-50 border-green-200 (light green)
  → Other options: bg-gray-50 border-gray-200 opacity-60

  Transition: border-color 100ms, background-color 100ms
  
  [PRACTICE MODE - explanation box:]
  bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4
  Icon: Lightbulb (16px, blue)
  Text: 14px Inter, text-blue-800, leading-relaxed
  
  Correct banner: "✅ Correct! +4 marks" (green, above explanation)
  Wrong banner:   "❌ Wrong! −1 mark · Correct answer: C" (red)
```

**Quiz navigation (mobile):**
```
Previous/Next buttons: 
  Fixed bottom bar (above where bottom-nav would be)
  Height: 60px
  Background: white border-t border-gray-100
  Layout: [← Prev (ghost)] [Q12/30] [Next → (primary)]
  Both buttons: min-h-[44px] flex-1
  Center text: JetBrains Mono 13px

Mobile navigator trigger (floating pill):
  position: fixed bottom-[80px] left-1/2 -translate-x-1/2
  bg-[#1E3A8A] text-white px-4 py-2 rounded-full shadow-lg
  z-40
  flex items-center gap-2 text-sm font-semibold
  [Grid icon] "Q12/30 · View All"
  Badge (if flagged): orange dot with count
```

### 8.7 Quiz Result

**Score ring animation:**
```
SVG circle: cx=70 cy=70 r=58 (for 140×140 viewBox)
Track circle: stroke="#F1F5F9" stroke-width=12
Score circle: stroke=[goal-color or success-color] stroke-width=12
  stroke-linecap="round"
  stroke-dasharray = 2πr = 364.4
  stroke-dashoffset = 364.4 - (percentage/100 × 364.4)
  Initial: stroke-dashoffset = 364.4 (empty)
  Animate: stroke-dashoffset → final value over 800ms ease-out-quart

Color by score:
  ≥ 90%: #16A34A (green — outstanding)
  ≥ 75%: #1E3A8A (blue — good)
  ≥ 50%: #D97706 (amber — average)
  < 50%: #DC2626 (red — needs work)

Center text (JetBrains Mono):
  Score: 24px font-bold (e.g., "88")
  Slash + max: 14px text-gray-400 (e.g., "/120")
  Percentage: 13px text-gray-500 (e.g., "73.3%")
```

**Grade label design:**
```
Position: below score ring
Icon: Trophy (green) / Star (blue) / CheckCircle (amber) / AlertTriangle (red)
Text: 16px Poppins 700

Grade thresholds + labels:
  ≥ 90%: 🏆 Outstanding! (green)
  ≥ 75%: ⭐ Excellent!   (blue)
  ≥ 60%: 👍 Good job!    (green-ish)
  ≥ 45%: 📖 Keep going!  (amber)
  < 45%: 💪 Needs work   (no negative framing)
```

**Score breakdown card:**
```
bg-gray-50 border border-gray-100 rounded-xl p-4
Font: Inter 14px for labels, JetBrains Mono for numbers

Row format (per answer type):
  [icon + label] [spacer] [count × mark = total]
  Correct: ✅ green-700 text + +88 green text
  Wrong:   ❌ red-600 text + -4 red text (only if negative marking)
  Skipped: ⬜ gray-500 text + 0 gray text
  ─────────────────────────────────────────
  Net: bold blue + JetBrains Mono 18px

Show negative marking calculation only if quiz.markingScheme.wrongMarks < 0
```

### 8.8 Admin Forms

**Form section headers:**
```
Section separator pattern:
  <div className="flex items-center gap-3 mb-4">
    <div className="h-px flex-1 bg-gray-100" />
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
      Categorization
    </span>
    <div className="h-px flex-1 bg-gray-100" />
  </div>
```

**Conditional field reveal:**
```
When "NEET" selected as exam type:
  → "Standard" field fades out (opacity 0, height 0, pointer-events none)
  → "Session" field fades in (opacity 1, height auto)
  Transition: 200ms ease

Implementation: className={`transition-all duration-200 ${show ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
```

**Marking scheme visual preset picker:**
```
Visual card buttons (NOT dropdown):
6 preset cards in 2-col grid:
  Each: border-2 rounded-xl p-3 text-center cursor-pointer
    Preset name: text-xs font-semibold
    Values: "+4 / −1" in JetBrains Mono 16px bold
  Selected: border-[#1E3A8A] bg-[#1E3A8A]/5
  Hover: border-gray-300 bg-gray-50

Custom option: "Custom" card at end
  When selected: 3 number inputs appear below for manual entry
```

---

## 9. Touch Gesture Design

### 9.1 Supported Gestures

| Gesture | Element | Action |
|---|---|---|
| **Tap** | Any interactive element | Primary action |
| **Long press** | Quiz option | Flag for review (alternative to flag button) |
| **Swipe left** | Quiz question area | Next question |
| **Swipe right** | Quiz question area | Previous question |
| **Swipe up** | Bottom sheet trigger area | Open navigator sheet |
| **Swipe down** | Open bottom sheet | Dismiss sheet |
| **Swipe horizontal** | Testimonials (landing) | Next/prev testimonial |
| **Swipe horizontal** | Tabs (admin subjects) | Scroll tabs |
| **Pull down** | Page main content | Pull-to-refresh (future) |
| **Pinch** | None | Never use pinch in app (accessibility) |

### 9.2 Swipe for Quiz Navigation

```typescript
// Touch gesture handler for quiz question swipe
// Min swipe distance: 50px horizontal
// Max vertical drift: 30px (prevent conflicts with scroll)
// Velocity threshold: 0.3 (fast enough to be intentional)

const MIN_SWIPE_DISTANCE = 50;

onTouchStart: store { startX, startY }
onTouchEnd: 
  deltaX = endX - startX
  deltaY = Math.abs(endY - startY)
  
  if deltaY > 30: return  // Was scrolling, not swiping
  
  if deltaX < -MIN_SWIPE_DISTANCE:  // Swipe left
    goToNextQuestion()
    ⚡ Question slides out left, new question slides in from right
  
  if deltaX > MIN_SWIPE_DISTANCE:   // Swipe right
    goToPreviousQuestion()
    ⚡ Question slides out right, new question slides in from left
```

### 9.3 Minimum Touch Target Reference

```
Every interactive element MUST be ≥ 44×44px.

If visual size is smaller (e.g., a small X icon):
  Add invisible padding to reach 44px:
  className="p-2.5"  → makes a 20px icon have a 45px tap area
  OR
  Use min-w-[44px] min-h-[44px] with centering

Specifically check:
  ✅ OTP input boxes: min-w-11 (44px)
  ✅ Quiz option buttons: min-h-[52px]
  ✅ Navigator grid buttons: min-h-[36px] (relaxed for quiz only — content area)
  ✅ Bottom nav items: flex-1 h-16 (64px height)
  ✅ Form inputs: min-h-[44px]
  ✅ Pagination buttons: min-w-[44px] min-h-[44px]
  ✅ Close buttons: p-2 (adds 8px each side to icon)
```

---

## 10. Animation & Transition Specifications

### 10.1 Animation Principles

1. **Purpose first** — Every animation must serve a UX purpose (feedback, context, direction)
2. **Subtlety** — Students are using this app to study. Don't distract them.
3. **Speed** — Interactive animations: 100–200ms. Content transitions: 200–400ms. Data animations: 500–800ms.
4. **Reduced motion** — Always respect `prefers-reduced-motion: reduce`

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 10.2 Complete Animation Catalog

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Page load | View changes | Fade in (opacity 0→1) | 200ms | ease-out |
| Card hover | Mouse/touch enter | translateY(-2px) + shadow | 150ms | ease-out |
| Card click feedback | Touch start | scale(0.98) → scale(1) | 100ms | ease-out |
| Button press | Active state | scale(0.96) | 80ms | ease-out |
| Progress bar | On mount | width 0→value% | 600ms | ease-out |
| Score ring | Result page mount | stroke-dashoffset fill | 800ms | cubic-bezier(0.33,1,0.68,1) |
| Stat countUp | Scroll into view | Number 0→value | 600ms | ease-out-quart |
| Feature cards | Scroll into view | translateY(20px)+opacity 0→1 | 300ms | ease-out (stagger 100ms) |
| Quiz option select | Tap | Background + border color | 100ms | ease |
| Practice mode feedback | After answer select | Slide down (height 0→auto, opacity 0→1) | 200ms | ease-out |
| Onboarding step | Next/Back | translateX(±20px)+opacity | 200ms | ease-out |
| Bottom sheet open | Trigger tap | translateY(100%)→0 | 300ms | cubic-bezier(0.16,1,0.3,1) |
| Bottom sheet close | Backdrop/swipe down | translateY(0)→100% | 250ms | ease-in |
| Toast appear | New toast | translateX(110%)→0 | 250ms | cubic-bezier(0.16,1,0.3,1) |
| Toast dismiss | Auto/close | opacity 1→0 | 200ms | ease-in |
| Goal badge switch | Goal change | Color cross-fade | 300ms | ease |
| Bookmark toggle | Tap | scale(1)→(1.4)→(1) | 200ms | spring |
| Timer pulse | < 5min remaining | opacity 1↔0.5 | 1000ms | ease-in-out infinite |
| Landing scramble | Mount + 300ms delay | Random chars → final text | 2000ms | custom per-char |
| Hero carousel | Auto advance | opacity crossfade | 800ms | ease-in-out |
| Confetti | Score ≥ 80% | Particle burst from center | 1200ms | physics |
| Filter sheet | Apply tap | Sheet closes | 250ms | ease-in |
| Skeleton loader | Loading state | Shimmer effect left→right | 1500ms | linear infinite |

### 10.3 Keyframe Definitions

```css
/* Shimmer skeleton */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #F1F5F9 25%, #E8ECF0 50%, #F1F5F9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

/* Slide in from right (toast) */
@keyframes slide-in-right {
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);   opacity: 1; }
}

/* Bounce (bookmark icon) */
@keyframes bounce-scale {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}

/* Pulse (urgent timer) */
@keyframes timer-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* Count up (JS implementation, not CSS) */
function countUp(from, to, duration, el) {
  const start = performance.now();
  requestAnimationFrame(function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.floor(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  });
}
```

---

## 11. Responsive Layout System

### 11.1 Breakpoints

```css
/* Mobile first — default styles apply to mobile */
/* sm:  640px+ — large phones in landscape, small tablets */
/* md:  768px+ — tablets */
/* lg: 1024px+ — laptops, desktops */
/* xl: 1280px+ — large screens */
/* 2xl:1536px+ — wide screens */
```

### 11.2 Grid Layouts by Screen

| Component | Mobile (default) | sm (640+) | lg (1024+) |
|---|---|---|---|
| Stat cards | grid-cols-2 | grid-cols-2 | grid-cols-4 |
| Paper cards | grid-cols-1 | grid-cols-2 | grid-cols-2 |
| Quiz cards | grid-cols-1 | grid-cols-2 | grid-cols-2 |
| Subject pills | flex-wrap | flex-wrap | flex-wrap |
| Onboarding card | full width (px-4) | max-w-md centered | max-w-md centered |
| Auth card | full width (px-4) | max-w-md centered | max-w-md centered |
| Feature cards | grid-cols-1 | grid-cols-2 | grid-cols-4 |
| Admin stats | grid-cols-2 | grid-cols-3 | grid-cols-6 |
| Admin table | horizontal scroll | horizontal scroll | full table |
| Quiz options | grid-cols-1 | grid-cols-1 | grid-cols-1 |
| Quiz navigator | 8-col grid (sheet) | 5-col grid (sidebar) | 5-col grid |
| Announcement cards | grid-cols-1 | grid-cols-1 | grid-cols-2 |

### 11.3 Layout Shift Prevention

```
Problems to prevent:
1. Font loading CLS — use font-display: swap + preconnect
2. Image CLS — always set width/height attributes
3. Dynamic content CLS — skeleton loaders match final content dimensions
4. Bottom nav causing content overlap — pb-20 on all student page main content
5. Stats countUp causes width change — use tabular-nums CSS + fixed-width containers

Solutions:
img { width: X; height: Y; } /* always explicit */
.stat-number { font-variant-numeric: tabular-nums; min-width: 48px; }
main { padding-bottom: calc(64px + 16px); } /* clearance for bottom nav */
```

---

## 12. Accessibility Requirements

### 12.1 Color Contrast Ratios

All text must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text/UI components).

| Element | Foreground | Background | Ratio | Status |
|---|---|---|---|---|
| Body text | #1E293B | #FFFFFF | 14.7:1 | ✅ AAA |
| Body text | #1E293B | #F8FAFC | 13.8:1 | ✅ AAA |
| Primary blue on white | #1E3A8A | #FFFFFF | 8.6:1 | ✅ AAA |
| Secondary text | #475569 | #FFFFFF | 5.9:1 | ✅ AA |
| Muted text | #94A3B8 | #FFFFFF | 2.8:1 | ⚠️ Use only for non-essential |
| White on navy | #FFFFFF | #1E3A8A | 8.6:1 | ✅ AAA |
| Green badge text | #15803D | #DCFCE7 | 5.4:1 | ✅ AA |
| Red badge text | #991B1B | #FEE2E2 | 5.8:1 | ✅ AA |
| Amber badge text | #92400E | #FEF3C7 | 5.2:1 | ✅ AA |
| NEET green on white | #16A34A | #FFFFFF | 4.6:1 | ✅ AA |
| JEE violet on white | #7C3AED | #FFFFFF | 4.5:1 | ✅ AA (borderline) |

### 12.2 Focus Management

```css
/* Universal focus ring (applies to all interactive elements) */
:focus-visible {
  outline: 2px solid #1E3A8A;
  outline-offset: 2px;
  border-radius: 4px;  /* Match element radius */
}

/* On dark backgrounds (sidebar) */
.sidebar :focus-visible {
  outline-color: #FFFFFF;
}

/* Never: */
:focus { outline: none; }  /* Don't remove focus without replacing */
```

### 12.3 ARIA Requirements

```tsx
/* Quiz Engine - full ARIA */
<main role="main" aria-label="Quiz: NEET Physics - Motion">
  <header role="banner">
    <div aria-live="polite" aria-label="Timer">
      {formatTime(timeLeft)}  {/* Updates every second */}
    </div>
    <span aria-label={`Question ${qIndex + 1} of ${total}`}>
      Q {qIndex + 1} / {total}
    </span>
  </header>

  <article aria-label={`Question ${qIndex + 1}`}>
    <p id={`q-text-${q.id}`}>{q.text}</p>
    <fieldset aria-labelledby={`q-text-${q.id}`}>
      <legend className="sr-only">Select your answer</legend>
      {options.map(opt => (
        <label key={opt}>
          <input 
            type="radio" 
            name={`q-${q.id}`}
            value={opt}
            aria-describedby={isPractice && answered ? `feedback-${q.id}` : undefined}
          />
          <span className="sr-only">Option {opt}:</span>
          {optionText}
        </label>
      ))}
    </fieldset>
    {isPractice && answered && (
      <div id={`feedback-${q.id}`} role="status" aria-live="polite">
        {isCorrect ? "Correct! +4 marks." : `Incorrect. Correct answer is ${q.correctOption}.`}
        Explanation: {q.explanation}
      </div>
    )}
  </article>
  
  {/* Navigator */}
  {quiz.questions.map((q, i) => (
    <button
      aria-label={`Question ${i + 1}, ${
        answers[q.id] ? 'answered' : flagged.has(q.id) ? 'flagged for review' : 'not answered'
      }${i === qIndex ? ', current question' : ''}`}
      aria-current={i === qIndex ? 'true' : undefined}
    >
      {i + 1}
    </button>
  ))}
</main>

/* Form error */
<div role="alert" aria-live="assertive" className="text-red-600 text-sm">
  {errorMessage}
</div>

/* Bottom nav */
<nav role="navigation" aria-label="Main navigation">
  {NAV_ITEMS.map(item => (
    <button
      aria-label={item.label}
      aria-current={view === item.view ? 'page' : undefined}
    >
      ...
    </button>
  ))}
</nav>

/* Skip link (add to top of HTML body) */
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] focus:bg-[#1E3A8A] focus:text-white focus:px-4 focus:py-2 focus:rounded-xl">
  Skip to main content
</a>
```

---

## 13. Skeleton Loading System

### 13.1 Skeleton Component Design

```css
/* Base skeleton: */
.skeleton-box {
  background: linear-gradient(
    90deg,
    #F1F5F9 0%,
    #E8ECF0 50%,   /* slightly darker at center */
    #F1F5F9 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
  border-radius: 6px;
}
```

### 13.2 Skeleton Shapes per Screen

**Dashboard skeleton:**
```
Goal banner:    full-width h-[120px] rounded-2xl
Stats row:      4× w-full h-[80px] rounded-2xl (2-col grid)
Progress:       5 rows, each: icon-circle + 2 bars + number (h-[48px])
Chart:          full-width h-[160px] rounded-2xl
```

**Paper card skeleton:**
```
Row 1: 2 pill badges (h-5 w-12 + h-5 w-16) + circle (h-8 w-8, bookmark)
Row 2: h-5 w-3/4 (title line 1)
Row 3: h-5 w-1/2 (title line 2)
Row 4: h-4 w-full (metadata)
Row 5: h-4 w-2/3 (analytics)
Row 6: h-10 w-full (button)
Gap: 12px between rows
```

**Quiz card skeleton:** Same as paper card but add marking scheme row

**Admin table skeleton:**
```
Per row: 6 cells of varying widths
  Cell 1: circle avatar + bar
  Cell 2-4: bars of varying widths
  Cell 5: pill badge shape
  Cell 6: 2 small icon squares
Rows: 8 rows
```

---

## 14. Iconography

### 14.1 Icon Library: Lucide React

All icons use Lucide React (already installed). Consistent with v1.0.

### 14.2 Icon Sizes by Context

```
12px = inside badges (very compact labels)
14px = inline with small text (meta, labels)
16px = inline with body text, compact buttons
18px = sidebar navigation items
20px = primary card header icons, larger inline
22px = bottom navigation bar (mobile)
24px = section header icons, large button icons
32px = feature section cards
48px = empty state illustrations
```

### 14.3 Icon-to-Goal Mapping

| Goal Category | Icon | Color | Usage |
|---|---|---|---|
| Board (8–10) | 📚 BookOpen | #3B82F6 | Goal badge, dashboard banner |
| Board (11–12) | 🎓 GraduationCap | #1D4ED8 | Goal badge, dashboard banner |
| NEET UG | 🩺 Stethoscope | #16A34A | Goal badge, green theme |
| JEE Mains | ⚛️ Atom | #7C3AED | Goal badge, violet theme |
| JEE Advanced | 🏆 Trophy | #4F46E5 | Goal badge, indigo theme |
| MHT-CET PCB | 🧬 Dna | #0891B2 | Goal badge, teal theme |
| MHT-CET PCM | 📐 Ruler | #0284C7 | Goal badge, sky theme |

### 14.4 Icon Usage Rules

```
✅ Always pair icons with text labels (not icon-only, except for well-known UI icons)
✅ Use aria-label on all icon-only buttons
✅ Icons inherit parent color (currentColor) — no inline fill colors
✅ Consistent icon sizes within a section
✅ Use filled variants for active/selected states (e.g., BookmarkCheck vs Bookmark)

❌ Don't mix icon libraries
❌ Don't use icons at < 12px
❌ Don't rotate icons arbitrarily (unless it's semantically correct, like ChevronRight for expand)
```

---

## 15. Data Visualization

### 15.1 Chart Library: Recharts

**Global chart theme:**
```javascript
const CHART_THEME = {
  gridColor: '#F1F5F9',
  axisColor: '#CBD5E1',
  axisTextColor: '#94A3B8',
  axisTextSize: 11,
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#E2E8F0',
  tooltipRadius: 8,
  tooltipFont: 14,
};
```

### 15.2 Chart-by-Chart Specifications

**Score Trend Line Chart (Dashboard):**
```
Type: LineChart (Recharts)
Data: [{date: "Jan 1", score: 60}, ...]
Line: stroke="#1E3A8A" strokeWidth=2 type="monotone"
Dot: r=3 fill="#1E3A8A" stroke="none"
ActiveDot: r=5 fill="white" stroke="#1E3A8A" strokeWidth=2
Area: Optional subtle fill (fillOpacity=0.06, fill="#1E3A8A")
X-axis: date labels, bottom
Y-axis: 0-100, with "%" suffix, left
Grid: horizontal lines only (no vertical)
Tooltip: Custom white card, shows "73.3% — Jan 10"
Height: 160px mobile, 200px desktop
ResponsiveContainer: width="100%"
```

**Admin: Daily Active Users Bar Chart:**
```
Type: BarChart
Bar: fill="#1E3A8A" radius=[6,6,0,0] (top corners rounded)
ActiveBar: fill="#1D4ED8"
Grid: horizontal only
Tooltip: custom
Height: 240px
```

**Admin: Exam Distribution Pie Chart:**
```
Type: PieChart > Pie (donut style)
innerRadius: "55%"
outerRadius: "85%"
Colors: [#3B82F6, #16A34A, #8B5CF6, #0891B2, #06B6D4]
       Board  NEET     JEE    CET-PCB  CET-PCM
Label: outside with percentage (custom label function)
Tooltip: show exam name + count + percentage
Legend: below chart on mobile, right on desktop
```

**Admin: Registration Trend:**
```
Type: AreaChart
Area: fill="#1E3A8A" fillOpacity=0.08
Line: stroke="#1E3A8A" strokeWidth=2
Same config as score trend but for monthly data
```

**Subject Progress (CSS, not Recharts):**
```
Not a chart component — uses CSS progress bars
Reason: More flexible, animatable, supports custom coloring per bar
Width: dynamic percentage via inline style
Color: based on progress % threshold (see section 7.5)
Animation: CSS transition on width (600ms ease-out)
```

---

## 16. Brand Identity System

### 16.1 Brand Mark

```
Name: ParikshaCrack
Tagline: "Crack Every Exam. Crack Your Future."
Font: Poppins 700
Primary colors: #1E3A8A (navy) + #F97316 (orange)

Logo: Image file (logo.png) — 32×32px minimum usage
  Light backgrounds: navy logo + navy text
  Dark backgrounds: white logo + white text
  Never: distort, rotate, change colors, add effects

Favicon: 32×32 version of logo
OG image: 1200×630px branded card with tagline + logo
```

### 16.2 Brand Voice in UI Copy

```
✅ Use: "Your 22-day streak 🔥 — keep it up!"
❌ Avoid: "You have a streak of 22 days."

✅ Use: "84th percentile — better than 84% of students!"
❌ Avoid: "You scored 84% percentile."

✅ Use: "Physics · 2024 · 180 marks"
❌ Avoid: "Physics paper from 2024, worth 180 marks."

✅ Use: "No papers yet. Filters too narrow? [Clear filters]"
❌ Avoid: "No results found."

✅ Use: "Wrong! −1 mark · Correct answer: C"
❌ Avoid: "Incorrect. The correct answer is option C."
(Be direct about negative marking — students need this info quickly)

Numbers: Always use numerals, not words ("3 quizzes", not "three quizzes")
Dates: Relative when < 7 days ("2 hours ago"), absolute after ("Jan 8, 2025")
Scores: Always "88/120" not "88 out of 120"
```

### 16.3 Exam-Specific Copy Conventions

| Exam | Correct Term | Wrong Term |
|---|---|---|
| NEET | "NEET UG" | "NEET", "NEET-UG" |
| JEE | "JEE Mains" / "JEE Advanced" | "JEE Main" (no S), "JEE Advance" |
| CET | "MHT-CET PCB" / "MHT-CET PCM" | "MHT CET", "CET PCB/PCM" |
| Board (10th) | "SSC" / "Class 10" | "10th Board", "Maharashtra 10" |
| Board (12th) | "HSC" / "Class 12" | "12th Board", "Maharashtra 12" |
| Negative marking | "+4 / −1" | "-1 marking", "negative" alone |

---

## 17. Dark Mode Token Scaffold (Future v2.5)

Not implemented in v2.0. All tokens use CSS variables to enable a one-file future switch.

```css
/* Light mode (default) */
:root {
  --color-bg:           #F8FAFC;
  --color-surface:      #FFFFFF;
  --color-text-primary: #1E293B;
  /* ... all tokens ... */
}

/* Dark mode (future) */
@media (prefers-color-scheme: dark) {
  /* OR: [data-theme="dark"] { */
  :root {
    --color-bg:           #0F172A;   /* Slate-900 */
    --color-surface:      #1E293B;   /* Slate-800 */
    --color-text-primary: #F1F5F9;   /* Slate-100 */
    --color-border:       #334155;   /* Slate-700 */
    /* Exam goal colors stay the same — they already pop on dark */
  }
}
```

---

## 18. Component Checklist for New Components

Before any new component is shipped, verify:

```
Layout:
  [ ] Mobile-first (default styles = mobile)
  [ ] Renders correctly at 320px (minimum viewport)
  [ ] Content not cut off at 375px
  [ ] Bottom nav not covering content (pb-20 on page main)
  [ ] No horizontal overflow on mobile

Touch:
  [ ] All interactive elements ≥ 44×44px
  [ ] Tap targets don't overlap
  [ ] Adequate spacing between interactive elements (≥ 8px)
  [ ] Touch feedback on tap (scale or bg-change)

Accessibility:
  [ ] All buttons have text or aria-label
  [ ] Focus ring visible on all interactive elements
  [ ] Error messages use role="alert"
  [ ] Images have alt text
  [ ] Color is never the only differentiator (use icon + color)

Performance:
  [ ] No inline functions in JSX causing unnecessary re-renders
  [ ] Lists use React.memo or useMemo if data rarely changes
  [ ] Images have explicit width/height (CLS prevention)
  [ ] No unguarded useEffects causing infinite loops

Design:
  [ ] Uses design tokens (not magic hex values)
  [ ] Consistent with existing components (same shadow, radius, padding)
  [ ] Skeleton loader implemented if data-dependent
  [ ] Empty state implemented if list can be empty
  [ ] Loading button state implemented if async action
```

---

## 19. Design Anti-Patterns — Extended Blacklist

```
COLORS:
  ❌ Pure black (#000000) — use #1E293B
  ❌ Pure white text on light backgrounds
  ❌ Light gray text (< #94A3B8) as the only text on a card
  ❌ Using color as ONLY differentiator (also use icon or label)
  ❌ Random colors not from the token system
  ❌ Gradient on body text (illegible at small sizes)

TYPOGRAPHY:
  ❌ Font weight < 400 for any readable text
  ❌ Font size < 12px anywhere
  ❌ ALL CAPS on body text (use for badges only, sparingly)
  ❌ Mixing more than 2 font families per page
  ❌ Tight letter-spacing on body text (only badges)

LAYOUT:
  ❌ Horizontal scrolling on main page content
  ❌ Content hidden behind bottom nav (always pb-20)
  ❌ Fixed heights that cut off text
  ❌ Desktop-first design (always start from mobile)
  ❌ Hamburger-only nav on mobile (use bottom nav)
  ❌ Modal on top of modal (max 1 layer)

INTERACTION:
  ❌ Touch targets < 44px
  ❌ No loading state on async actions (buttons must show loading)
  ❌ No error state on forms (every form field needs error handling)
  ❌ Animated content that can't be disabled (respect prefers-reduced-motion)
  ❌ Auto-playing video or sound
  ❌ Infinite scroll without "load more" option (use pagination)

QUIZ ENGINE:
  ❌ Showing correct answer in exam mode before submit
  ❌ Not showing marking scheme before quiz starts
  ❌ Auto-advancing to next question after answer in practice mode
     (student needs time to read explanation)
  ❌ No confirmation dialog before final submit
  ❌ Timer that counts up (always count down — creates urgency)
  ❌ No resume capability for exam mode on app exit

ADMIN:
  ❌ Destructive actions (delete, block) without confirmation
  ❌ Bulk delete without explicit confirmation + count
  ❌ Form that resets on navigation away (save draft state)
  ❌ Table with no empty state message
  ❌ Creating quiz with 0 questions (disable publish until ≥ 1 question)
```

---

*End of UI/UX Brief v2.0 — ParikshaCrack*
