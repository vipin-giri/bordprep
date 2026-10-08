# 📋 Product Requirements Document (PRD)
## ParikshaCrack v2.0 — Multi-Exam Preparation Platform
**Version:** 2.0 | **Date:** June 2026 | **Status:** Approved for Implementation

---

## 1. Executive Summary

**ParikshaCrack** is a mobile-first, multi-exam academic preparation platform built for Maharashtra students — from Class 8 through competitive entrance exams. It provides curated question papers, MCQ quizzes, performance analytics, and admin-driven content management — all designed around the real patterns and rhythms of the Indian education system.

**The Problem We Solve:**
Students in Maharashtra face a fragmented, inconsistent preparation ecosystem. Board exam students hunt for past papers across multiple sites. Competitive aspirants use 3–4 different apps, none of which understand the dual-goal reality of a student preparing for both their HSC board exam in March and NEET in May. Admins (teachers/coordinators) have no unified tool to create and distribute content across exam types.

**The v1.0 Gap:**
The existing app supports only 10th and 12th Maharashtra board. It has 3 paper types, no competitive exams, no negative marking, and a single-goal model. Everything needs to expand to match where students actually are.

**The v2.0 Promise:**
One app. Every exam. One clear dashboard per goal. Smart enough to know you're a 12th HSC student preparing for NEET, and organized enough to keep both worlds separate but accessible.

---

## 2. Indian Education System Context

> This section documents the real education system our platform is built for. Every feature decision must be traceable back to this system.

### 2.1 Maharashtra State Board (MSBSHSE) Structure

**Governing Body:** Maharashtra State Board of Secondary and Higher Secondary Education (MSBSHSE), Pune

**Board Type:** State Board (not CBSE or ICSE)

| Class | Board Exam Name | Conducting Level | Passing % |
|---|---|---|---|
| Class 8 | Annual School Exam | School-Level | 35% per subject |
| Class 9 | Annual School Exam | School-Level | 35% per subject |
| Class 10 | SSC (Secondary School Certificate) | MSBSHSE Board | 35% per subject |
| Class 11 | Annual College Exam | College-Level | 35% per subject |
| Class 12 | HSC (Higher Secondary Certificate) | MSBSHSE Board | 35% per subject |

**Marks Structure (Board Exams — Class 10 & 12):**
- Most subjects: **80 marks Theory + 20 marks Internal/Oral/Practical = 100 marks**
- Science subjects (Physics, Chemistry, Biology): **70 marks Theory + 30 marks Practical**
- Exam duration: **3 hours** for all major theory papers

**Internal Exam Calendar (School-Level — Class 8–12):**

| Assessment | Timing | Marks | Notes |
|---|---|---|---|
| Unit Test 1 | July | 20–25 marks | Chapter 1–2 typically |
| Unit Test 2 | September | 20–25 marks | Chapter 3–5 typically |
| Semester Exam (Mid-term) | October | 40–80 marks | Half-year syllabus |
| Unit Test 3 | November | 20–25 marks | Chapters post-mid |
| Preliminary Exam (Prelims) | January | 80–100 marks | Full syllabus, board pattern |
| Board Exam / Final Exam | February–March | 80 marks | Official boards (Cls 10, 12) |

> **Key insight:** Students in Class 8–9 don't have board exams — their school runs these internal cycles. The platform must support this internal exam calendar as first-class content.

### 2.2 Maharashtra Board Stream Structure (Class 11–12)

| Stream | Core Subjects | PCB/PCM Relevance |
|---|---|---|
| **Science (PCB)** | Physics, Chemistry, Biology, English | NEET / MHT-CET PCB |
| **Science (PCM)** | Physics, Chemistry, Mathematics & Statistics, English | JEE / MHT-CET PCM |
| **Science (PCB+M)** | Physics, Chemistry, Biology, Mathematics & Statistics, English | Both PCB and PCM exams |
| **Commerce** | Accountancy (Book-Keeping), Organisation of Commerce (OCM), Economics, Secretarial Practice / Math & Stats, English | — |
| **Arts (Humanities)** | History, Geography, Political Science, Sociology, Psychology / Philosophy, English, 1–2 languages | — |

> **Important:** Many Science students take both Biology AND Mathematics (PCB+M combo). The platform must handle this without forcing them into one stream box.

### 2.3 Medium of Instruction

| Medium | Description | Usage |
|---|---|---|
| **English Medium** | All subjects taught entirely in English | Urban / Semi-urban students |
| **Semi-English** | Science, Math, Technology in English; Languages, Social Sciences in Marathi | Suburban / transitional students |
| **Marathi Medium** | All subjects taught entirely in Marathi | Rural / traditional households |

> **Platform implication:** Papers must be tagged by medium. Students in Marathi medium cannot use English-medium papers effectively. This is a hard filter, not a soft preference.

---

## 3. Supported Exam Categories — Deep Detail

### 3.1 Maharashtra State Board (Class 8–12)

**Platform coverage:** Unit Tests, Semester Exams, Preliminary Exams, Board Exams, Model Papers, Practice Papers, PYQs

**Subjects by Class:**

| Class | Core Subjects |
|---|---|
| **8** | Mathematics, Science & Technology, English, Marathi/Hindi, History & Political Science, Geography |
| **9** | Mathematics, Science & Technology, English, Marathi/Hindi, History & Political Science, Geography |
| **10 (SSC)** | Mathematics, Science & Technology Pt.1, Science & Technology Pt.2, English, Marathi, Hindi, History & Political Science, Geography |
| **11 (Science PCB)** | Physics, Chemistry, Biology, English, Mathematics (optional) |
| **11 (Science PCM)** | Physics, Chemistry, Mathematics & Statistics, English, Biology (optional) |
| **11 (Commerce)** | Book-Keeping & Accountancy, OCM, Economics, Secretarial Practice, English, Math & Stats (optional) |
| **11 (Arts)** | History, Geography, Political Science, Sociology/Psychology, English, Language subjects |
| **12 (HSC)** | Same as respective 11th stream with advanced syllabus |

---

### 3.2 NEET UG (National Eligibility cum Entrance Test)

**Conducting Body:** National Testing Agency (NTA)
**Eligibility:** Class 12 pass/appearing (PCB stream)
**Exam Frequency:** Once a year (typically May)
**Seats:** ~1.08 lakh MBBS seats across India

**Official Exam Pattern (2024):**

| Subject | Section A | Section B | Total Questions | Total Marks |
|---|---|---|---|---|
| **Physics** | 35 MCQs (compulsory) | 15 MCQs (attempt any 10) | 50 | 180 |
| **Chemistry** | 35 MCQs (compulsory) | 15 MCQs (attempt any 10) | 50 | 180 |
| **Botany** | 35 MCQs (compulsory) | 15 MCQs (attempt any 10) | 50 | 180 |
| **Zoology** | 35 MCQs (compulsory) | 15 MCQs (attempt any 10) | 50 | 180 |
| **TOTAL** | 140 compulsory | 60 (attempt 40) | 200 questions | **720 marks** |

**Marking Scheme:** ✅ Correct: **+4** | ❌ Wrong: **−1** | ⬜ Unattempted: **0**

**Duration:** 3 hours 20 minutes (200 minutes)
**Mode:** Pen and paper (OMR sheet)
**Language:** 13 languages including English, Hindi, Marathi

**Key Facts for Platform:**
- Section B allows choice — platform must support "attempt any N of M" logic
- Syllabus covers Class 11 + Class 12 equally (~50/50 split)
- Biology (Botany + Zoology) carries 360 of 720 marks (50%) — most critical subject

---

### 3.3 JEE Mains (Joint Entrance Examination – Main)

**Conducting Body:** National Testing Agency (NTA)
**Eligibility:** Class 12 pass/appearing (PCM stream)
**Exam Frequency:** Twice a year (January & April sessions)
**Seats:** Gateway to NITs, IIITs, and GFTIs (~23,000+ seats)

**Official Exam Pattern (2024) — Paper 1 (B.E./B.Tech):**

| Subject | Section A (MCQ) | Section B (Numerical) | Attempt | Total Marks |
|---|---|---|---|---|
| **Physics** | 20 MCQs | 10 Numerical | 20 MCQ + any 5 Numerical | 100 |
| **Chemistry** | 20 MCQs | 10 Numerical | 20 MCQ + any 5 Numerical | 100 |
| **Mathematics** | 20 MCQs | 10 Numerical | 20 MCQ + any 5 Numerical | 100 |
| **TOTAL** | 60 MCQs | 30 Numerical | 75 questions attempted | **300 marks** |

**Marking Scheme:**
- Section A MCQ: ✅ **+4** | ❌ **−1** | ⬜ **0**
- Section B Numerical: ✅ **+4** | ❌ **−1** | ⬜ **0**

**Duration:** 3 hours (180 minutes)
**Mode:** Computer-Based Test (CBT)
**Attempts:** Maximum 3 years, 2 sessions per year (6 total attempts)

> **Platform implication:** JEE Mains has numerical answer-type questions. The platform must flag these questions differently and handle non-MCQ input. For the MVP, numerical questions can be presented as MCQ with closest answer options.

---

### 3.4 JEE Advanced (Joint Entrance Examination – Advanced)

**Conducting Body:** IITs (rotates yearly)
**Eligibility:** Top ~2.5 lakh JEE Mains qualifiers per year
**Seats:** ~17,000 seats across all IITs
**Structure:** Paper 1 + Paper 2 (both mandatory, same day)

**Official Exam Pattern (2024):**

| Paper | Duration | Subjects | Total Marks |
|---|---|---|---|
| **Paper 1** | 3 hours | Physics, Chemistry, Mathematics | 180 |
| **Paper 2** | 3 hours | Physics, Chemistry, Mathematics | 180 |
| **COMBINED** | 6 hours total | — | **360 marks** |

**Question Types per Paper:**
1. **Single correct MCQ** — +3/−1
2. **Multiple correct MCQ** — +4 full, +1 per correct (partial), −2 if any wrong marked
3. **Numerical Value** — +4/0 (no negative on numerical)
4. **Matching type** — varies by paper

**Key Facts for Platform:**
- Marking scheme changes EVERY year (IITs have full flexibility)
- No fixed total marks — varies by year's specific paper
- Platform should clearly label JEE Advanced quizzes as "Approximate pattern" with year reference
- Must show partial marking explanation before quiz starts

---

### 3.5 MHT-CET (Maharashtra Common Entrance Test)

**Conducting Body:** State CET Cell, Maharashtra
**Eligibility:** Class 12 Maharashtra state students
**Purpose:** Admission to engineering (PCM) and pharmacy/agriculture (PCB) courses in Maharashtra

**Official Exam Pattern (2024):**

**PCM Group (Engineering):**

| Subject | Questions | Marks/Question | Total Marks |
|---|---|---|---|
| **Physics** | 50 | 1 | 50 |
| **Chemistry** | 50 | 1 | 50 |
| **Mathematics** | 50 | **2** | 100 |
| **TOTAL** | **150 questions** | — | **200 marks** |

**PCB Group (Pharmacy/Agriculture):**

| Subject | Questions | Marks/Question | Total Marks |
|---|---|---|---|
| **Physics** | 50 | 1 | 50 |
| **Chemistry** | 50 | 1 | 50 |
| **Biology** | 100 | 1 | 100 |
| **TOTAL** | **200 questions** | — | **200 marks** |

**Marking Scheme:** ✅ Correct: **+1 (or +2 for Maths)** | ❌ Wrong: **0** | ⬜ Unattempted: **0**
**No negative marking** for MHT-CET.

**Duration:** 3 hours (split: 90 min per section)
**Mode:** Computer-Based Test (CBT)
**Syllabus:** 20% Class 11 syllabus + 80% Class 12 syllabus
**Difficulty:** Physics & Chemistry at JEE Main level; Biology at NEET level

> **Key competitive insight:** MHT-CET PCM students often also prepare for JEE Mains. MHT-CET PCB students often also prepare for NEET. The platform's multi-goal system directly addresses this reality.

---

## 4. Target Users — Deep Personas

### 4.1 Student Personas

---

**Persona 1: Priya (Class 10 SSC Student, Pune)**
- Age: 15 | Medium: Semi-English | Device: Shared family Android phone (2018 model)
- Uses phone for 3–4 hours daily, mostly Instagram and YouTube Shorts
- Studies 4–6 hours daily; board exams in March
- Needs: SSC Mathematics and Science papers (English medium), chapter-wise MCQ quizzes, Marathi medium content for Social Science
- Pain: Can't find well-organized SSC PYQs online; PDFs are scattered across WhatsApp groups
- Goal: Score 85%+ in SSC boards

**Behavior on platform:**
- Uses during evening study hours (7–10 PM)
- Shares good quizzes to school WhatsApp group
- Motivated by streak counter and subject progress %

---

**Persona 2: Rohan (Class 12 HSC + NEET aspirant, Nashik)**
- Age: 17 | Stream: Science PCB | Medium: English
- Personal smartphone (budget Android, 4G connection sometimes unstable)
- Studies 8–10 hours daily; attends coaching institute 3 days/week
- Dual goal: HSC board exams (March) + NEET UG (May)
- Needs: HSC Physics/Chemistry/Biology papers AND NEET-pattern MCQs with +4/−1 marking; must switch between both goals seamlessly
- Pain: Different apps for board vs NEET, cannot track both; NEET quizzes on existing platforms don't feel real (no proper timing, no negative marking)
- Goal: 85%+ in HSC, NEET score 600+/720

**Behavior on platform:**
- Practices NEET quizzes in exam mode on phone during commute
- Uses the question navigator to skip and come back
- Checks percentile score to know AIR estimate
- Browses HSC Prelims papers before prelim season

---

**Persona 3: Sneha (Class 12 HSC + JEE Mains + MHT-CET, Mumbai)**
- Age: 17 | Stream: Science PCM | Medium: English
- Personal iPhone (premium user, stable WiFi at home)
- Studies 10–12 hours; coaching for JEE since Class 11
- Triple goal: HSC Board + JEE Mains + MHT-CET PCM
- Needs: HSC papers, JEE Mains full mock tests with +4/−1 and numerical questions, MHT-CET Mathematics papers (+2 per question)
- Pain: Juggling three separate timelines, three different exam patterns — wants a single dashboard
- Goal: JEE Mains 150+/300, MHT-CET 170+/200, HSC 90%+

---

**Persona 4: Arjun (Class 8 student, Nagpur)**
- Age: 13 | Medium: Marathi | Device: School tablet + shared home phone
- School uses state board curriculum, internal exams only (no board exams yet)
- Needs: Unit test papers for Mathematics, Science; chapter-wise quizzes
- Pain: No preparation materials exist for Class 8 — platforms only focus on 10th and 12th
- Goal: Understand chapters, score well in unit tests

---

**Persona 5: Mrs. Desai (Admin / Teacher, High School, Aurangabad)**
- Age: 38 | Role: Science Teacher + Exam Coordinator
- Manages content for 200+ students across Classes 9, 10, 12
- Needs: Upload unit test papers quickly, tag them properly, create chapter-wise quizzes for students, send announcements for different classes
- Pain: Manual paper distribution via WhatsApp is disorganized; can't track which students accessed which papers
- Goal: Centralize all question papers for her school; see which chapters students are struggling with

---

### 4.2 User Roles Summary

| Role | Capabilities | Access Level |
|---|---|---|
| **Student (Guest)** | View landing page, register | Public |
| **Student (Verified)** | Full student portal, quizzes, papers, bookmarks | Authenticated |
| **Admin** | Full content management + analytics | Admin |

---

## 5. Mobile-First Strategy (Critical Section)

> **Data context:** 90% of Maharashtra households own at least one smartphone. Among students aged 14–18, smartphone access is near-universal. However, many students use **shared devices**, **budget Android phones** (2–4 GB RAM), and **unstable 4G connections** — especially in Tier 2/3 cities like Nashik, Aurangabad, Kolhapur, Amravati.

### 5.1 Why Mobile-First is Non-Negotiable

| Fact | Platform Implication |
|---|---|
| 90%+ students have smartphone access | Mobile is the primary device, not a secondary screen |
| Many use budget Android phones (2–4 GB RAM) | App must be lightweight, no heavy animations |
| 4G data is often capped (1–1.5 GB/day plans) | No auto-loading of large assets; lazy loading everywhere |
| Many share devices with siblings/parents | Fast login/logout; clear session management |
| Students study in noisy environments | No sound dependencies; all feedback must be visual |
| Short study sessions (30–45 min bursts) | Quick-start quizzes, resume-from-where-you-left-off |
| Poor lighting conditions (study at night with dim lights) | High contrast mode, legible font sizes minimum 14px body |

### 5.2 Mobile-First Design Rules

**Rule 1: Touch Targets**
- Every tappable element ≥ 44×44px (Apple/Google standard)
- Buttons must have at least 8px spacing between them
- No hover-only interactions on any core feature

**Rule 2: Typography for Small Screens**
- Body text: minimum 14px (never smaller on mobile)
- Headings: 18–22px on mobile (scale up on tablet/desktop)
- Line height: 1.5–1.6 for readability
- Poppins and Inter are optimized for Devanagari-adjacent rendering

**Rule 3: Thumb Zone Optimization**
```
Phone screen thumb zones (right-handed user):
┌──────────────────────┐
│  ❌ Hard to reach    │  ← top navigation here is BAD
│  ❌ Hard to reach    │
│  ✅ Natural zone     │
│  ✅ Natural zone     │
│  ✅ Easy reach       │  ← bottom nav here is GREAT
│  ✅ Easy reach       │  ← primary actions at the bottom
└──────────────────────┘
```
- Primary actions (Start Quiz, View Paper, Submit) → bottom of screen on mobile
- Navigation → Bottom tab bar (not hamburger-only)
- Filter panel → Bottom sheet on mobile (not top bar)
- Quiz navigator → Bottom drawer (swipe up)

**Rule 4: Data Efficiency**
- No auto-playing videos or audio
- Images: WebP format, lazy-loaded
- PDF preview: link to external viewer (don't embed heavy PDF renderer)
- First Contentful Paint (FCP) target: < 1.5 seconds on 4G
- Total page weight target: < 300KB per view (excluding PDFs)

**Rule 5: Offline Awareness**
- Show cached content when offline (papers browsed, quiz history)
- Graceful error state: "You're offline. Cached content shown below."
- In-progress quiz: save state locally every 10 seconds; resume on reconnect
- Do NOT lose quiz answers on page refresh or connectivity loss

**Rule 6: Interruption Handling**
- Students regularly get phone calls, switch apps mid-quiz
- Quiz timer must pause on app backgrounding (best effort)
- Show "You have an unfinished quiz" banner on return
- Confirm dialog before leaving quiz page accidentally

**Rule 7: One-Thumb Navigation**
- Bottom navigation bar always visible (Student: Dashboard, Papers, Quizzes, Bookmarks, Profile)
- All main sections reachable in 1 tap from any screen
- Back button always available on detail pages
- No dead ends — every page has a clear exit path

**Rule 8: Form Usability on Mobile**
- Inputs stack vertically (never 2-column on mobile)
- Label above every input (never placeholder-only)
- Numeric inputs use numeric keyboard (`type="number"`)
- Date pickers use native mobile date picker
- Dropdowns use native `<select>` on mobile for performance

**Rule 9: Content Cards on Mobile**
- Paper cards: full-width on mobile, 2-col on tablet+
- Quiz cards: full-width on mobile, 2-col on tablet+
- Card minimum height: 120px (not too squished to read)
- Truncate long titles at 2 lines (ellipsis), show full on detail page

**Rule 10: Reading Mode for Papers**
- Paper detail page on mobile: clean reading mode
- Large download button (full-width, 48px height)
- No sidebar cluttering the view
- Sticky bottom bar with "Download PDF" always visible while scrolling

### 5.3 Mobile-Specific Features (NEW)

**Feature: Resume Banner**
When student returns to app after abandoning a quiz:
```
┌──────────────────────────────────────────┐
│ 🔔  You have an unfinished quiz          │
│  "NEET Physics — Motion" · Q12/30 left  │
│  [Resume Quiz]           [Discard]      │
└──────────────────────────────────────────┘
```

**Feature: Quick Quiz (from Dashboard)**
One-tap quiz start for daily practice — no filters needed:
- "Practice 5 random questions from your weak chapters"
- Timer: optional (toggle before starting)
- Great for 10-minute commute practice

**Feature: Study Streak Notification (Future)**
Daily push notification at user's preferred study time:
- "🔥 Day 14! Keep your streak alive. 5 quick questions?"
- Deep links directly to a quick quiz

**Feature: Swipe Gestures in Quiz**
- Swipe left on question → Next question
- Swipe right → Previous question
- Long press on option → Flag for review
- (Must have visible button alternatives — swipe is progressive enhancement only)

**Feature: Download for Later (Future)**
- Download quiz question sets as offline JSON
- Practice offline, sync results when back online

### 5.4 Mobile Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5s on 4G |
| Largest Contentful Paint (LCP) | < 2.5s on 4G |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to Interactive (TTI) | < 3.5s on 4G |
| Total JS Bundle | < 400KB gzipped |
| Image sizes | < 100KB per image (WebP) |
| Lighthouse Mobile Score | ≥ 85 |

---

## 6. Paper Type Taxonomy — Complete Definition

### 6.1 Board Exam Paper Types (Class 8–12)

| Paper Type | Description | Marks Range | Duration | Available For |
|---|---|---|---|---|
| **Unit Test** | Short tests covering 1–2 chapters. Conducted by school monthly. | 20–25 marks | 45–60 min | Class 8–12 |
| **Semester Exam** | Mid-year exam covering half the annual syllabus. Also called "Mid-term". | 40–80 marks | 2–3 hours | Class 9–12 |
| **Prelims (Preliminary)** | Full-syllabus pre-board mock exam. Conducted January–February. Same pattern as board exams. | 80–100 marks | 3 hours | Class 10, 12 (primarily) |
| **Board / Final Exam** | Official MSBSHSE board exam paper (March). The real thing. | 80 marks | 3 hours | Class 10, 12 |
| **Model Paper** | Official sample paper released by MSBSHSE at start of academic year. Shows expected question pattern and difficulty. | 80 marks | 3 hours | Class 8–12 |
| **Practice Paper** | Platform-generated papers for extra practice. Not from any official source. | Variable | Variable | Class 8–12 |
| **PYQ (Previous Year Question Paper)** | Official past years' board exam papers (year-specific). | 80 marks | 3 hours | Class 10, 12 |

### 6.2 Competitive Exam Paper Types

| Paper Type | Description | Marks | Duration |
|---|---|---|---|
| **PYQ** | Official past exam papers from NEET/JEE/CET, organized by year & session (shift) | 720/300/200 | 3–3.5 hrs |
| **Mock Test / Full Test** | Full-length platform-created exam exactly matching official pattern | Same as official | Same as official |
| **Chapter-wise Test** | Questions from one specific chapter only | 20–60 marks | 20–40 min |
| **Subject-wise Test** | All chapters of one subject (e.g., full NEET Physics) | 180/100/50 | 1–1.5 hrs |
| **Minor Test** | Short periodic tests (coaching style) covering 2–4 chapters | 60–120 marks | 1 hour |
| **Major Test** | Comprehensive periodic test covering multiple units | 180–300 marks | 2–3 hours |
| **Section A Only** | Only the compulsory section (for NEET/JEE pattern practice) | Variable | Variable |

### 6.3 Paper Display Logic

For each paper, the platform shows the appropriate subset of filters:

```
If goalCategory === "board":
  Show: Standard, Stream, Medium, PaperType (board types), Subject, Year

If goalCategory === "neet":
  Show: PaperType (competitive types), Subject (Physics/Chem/Botany/Zoology), Year

If goalCategory === "jee-mains":
  Show: PaperType, Subject (Physics/Chem/Math), Year, Session (Jan/Apr), Shift (Shift 1/2)

If goalCategory === "jee-advanced":
  Show: PaperType, Subject, Year, Paper Number (Paper 1/Paper 2)

If goalCategory === "mht-cet-pcb" or "mht-cet-pcm":
  Show: PaperType, Subject, Year
```

---

## 7. Quiz Engine — Detailed Requirements

### 7.1 Verified Marking Schemes by Exam

| Exam | Correct | Wrong (MCQ) | Numerical Wrong | Unattempted | Total |
|---|---|---|---|---|---|
| **Board (Class 8–12)** | +1 | 0 | — | 0 | Per question basis |
| **NEET UG** | **+4** | **−1** | — | 0 | Max 720 |
| **JEE Mains MCQ** | **+4** | **−1** | — | 0 | Max 300 |
| **JEE Mains Numerical** | **+4** | **−1** | **−1** | 0 | (within 300) |
| **JEE Advanced (varies)** | +3 to +4 | −1 to −2 | 0 | 0 | ~360 (varies) |
| **MHT-CET (Physics/Chem)** | **+1** | 0 | — | 0 | (within 200) |
| **MHT-CET (Mathematics)** | **+2** | 0 | — | 0 | (within 200) |
| **MHT-CET (Biology)** | **+1** | 0 | — | 0 | (within 200) |

> **Critical note:** MHT-CET has NO negative marking — a deliberate choice to make it more accessible vs NEET/JEE.

### 7.2 Quiz Modes

**Practice Mode:**
- No time pressure (timer is optional, can be toggled)
- After each question: immediate feedback (✅ / ❌ + explanation)
- Can change answer after seeing explanation
- No final score — but shows running accuracy
- Best for: Learning new chapters, reviewing weak areas

**Exam Mode:**
- Strict timer (auto-submit at 0:00)
- No feedback during quiz
- Question navigator available (jump to any question)
- Flag questions for review
- Submit with confirmation dialog
- Results shown after submission
- Best for: Simulating real exam conditions before important tests

**Review Mode (post-attempt):**
- Read-only view of all questions
- Shows: your answer, correct answer, explanation
- Color-coded: ✅ Correct (green), ❌ Wrong (red), ⬜ Unattempted (gray)
- Shows marks breakdown per question
- Access from result page

### 7.3 Quiz Timer Details

```
Timer behavior:
- Starts when [Start Quiz] is tapped in Exam Mode
- Display: MM:SS format (e.g., 58:42)
- Color changes:
  > 10 min left: blue (#1E3A8A)
  5–10 min left: amber (#D97706) + subtle background pulse
  < 5 min left: red (#DC2626) + animation pulse every second
- On phone call / app background: timer pauses (best effort)
- Timer state saved in localStorage every 5 seconds
- On return: resume with actual elapsed time (real clock check)
- At 0:00: auto-submit with current answers
```

### 7.4 Question Navigator (Mobile UX)

**Mobile:** Bottom sheet (tap "View All Questions" pill at bottom)
```
┌─────────────────────────────────┐
│  Question Navigator    [Close]  │
│  Answered: 22  Flagged: 3      │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┐   │
│  │1✓│2✓│3✓│4⚑│5✓│6✓│7✓│8 │   │
│  ├──┼──┼──┼──┼──┼──┼──┼──┤   │
│  │9✓│10│11│12│13│14│15│16│   │
│  └──┴──┴──┴──┴──┴──┴──┴──┘   │
│  Legend: ✓=Done ⚑=Flagged □=Skip│
│  [Submit Quiz]                  │
└─────────────────────────────────┘
```

**Desktop:** Right side panel (always visible, sticky)

### 7.5 Quiz Result — Score Calculation Display

```
NEET Quiz Example:
────────────────────────────
✅ Correct:    22 × (+4) = +88 marks
❌ Wrong:       4 × (−1) = −4 marks
⬜ Unattempted: 4 × (0)  =  0 marks
────────────────────────────
Net Score:          = 84 / 120
Percentage:         = 70.0%
Percentile:         = 78th
"You scored better than 78% of students who attempted this quiz"
────────────────────────────
```

### 7.6 Percentile Calculation

```
percentile = (number of attempts with score < your score) / (total attempts) × 100

Example:
- 500 past attempts for this quiz
- 390 attempts scored less than your 84 marks
- Your percentile = (390/500) × 100 = 78th percentile
```

> This is meaningful for NEET aspirants who track their rank. For board exams, percentile is less relevant but still shown.

### 7.7 Section-Based Quiz (NEET/JEE Pattern)

For full mock tests matching official exam patterns:

```
Quiz structure for NEET Full Mock:
├── Section A (Physics): 35 questions — all compulsory
├── Section B (Physics): 15 questions — attempt any 10
├── Section A (Chemistry): 35 questions
├── Section B (Chemistry): 15 questions — attempt any 10
├── Section A (Botany): 35 questions
├── Section B (Botany): 15 questions — attempt any 10
├── Section A (Zoology): 35 questions
└── Section B (Zoology): 15 questions — attempt any 10

UI rule: If student attempts >10 in Section B, warn them.
Only count first 10 answered (in order) for scoring.
```

---

## 8. Student Portal — Feature Requirements (Detailed)

### 8.1 Goal System

**Goal Definition:**
A Goal represents one specific exam a student is preparing for. It contains:
- Exam category (board / neet / jee-mains / jee-advanced / mht-cet-pcb / mht-cet-pcm)
- For board goals: standard, stream, medium
- For competitive goals: target year
- Display label, color, icon

**Goal Switcher behavior:**
- Shown in header on all student pages
- Changes the context of ALL data displayed (papers, quizzes, announcements, dashboard stats, progress)
- Switching goals is instant — no page reload
- Last selected goal persisted to localStorage (remembered on next login)

**Multi-goal student example (Rohan from Persona 2):**
```
Goals:
1. "12th HSC Board — English" [active]  ← blue badge
2. "NEET UG 2027"                        ← green badge

Goal Switcher in header:
[🎓 12th HSC Board ▼]

On click:
┌─────────────────────┐
│ Switch Exam Goal    │
├─────────────────────┤
│ ✓ 12th HSC Board   │ ← active
│   NEET UG 2027     │
│ + Add New Goal      │
└─────────────────────┘
```

### 8.2 Onboarding Wizard (7 Steps)

**Step-by-step flow with validation:**

| Step | Screen | Validation | Skip? |
|---|---|---|---|
| 1 | Select Goal Type(s) | At least 1 selected | No |
| 2 | Select Standard (if Board) | At least 1 standard | No (if board) |
| 3 | Select Stream (if Std 11/12) | Must choose 1 stream | No (if 11/12) |
| 4 | Select Medium (if Board) | Must choose 1 medium | No (if board) |
| 5 | Select Exam(s) (if Competitive) | At least 1 exam | No (if competitive) |
| 6 | Select Target Year (if Competitive) | Must choose 1 year | No (if competitive) |
| 7 | Select Subjects | At least 1 subject | No |

**Stream PCB+M handling:**
- If student selects both Science PCB and Science PCM → create separate goals
- OR show "Science (PCB+M)" as a combined option → creates one goal with all subjects

### 8.3 Dashboard — Complete Section List

1. **Goal Banner** — active goal, exam countdown, quick switch link
2. **Resume Quiz** — if there's an unfinished quiz (resume/discard)
3. **Stats Row** — Papers Viewed, Quizzes Taken, Avg Score, Current Streak
4. **Exam Countdown** — days to next major exam for active goal
5. **Announcements** — goal-filtered, priority-ordered
6. **Subject Progress** — per-subject progress bars (filtered by current goal subjects)
7. **Score Trend** — line chart of last 7 days' quiz scores
8. **Recommended: Weak Chapters** — 3–5 chapter pills to practice
9. **Quick Access: Recent Papers** — last 3 papers viewed
10. **Quick Access: Recent Quizzes** — last 3 quizzes attempted
11. **Quick Quiz (mobile CTA)** — "Practice 5 random questions" shortcut

### 8.4 Papers Page — Full Filter Specification

**Filter Hierarchy (conditional rendering):**

```
ALWAYS SHOWN:
├── Search (text)
├── Paper Type (all 12 types, filtered by goal category)
└── Sort (Popular / Newest / Year ↓ / Year ↑)

IF goalCategory === "board":
├── Standard (8/9/10/11/12)
├── Stream (if 11 or 12 selected — PCB/PCM/Commerce/Arts)
├── Medium (English/Semi-English/Marathi)
└── Subject (filtered by standard + stream)

IF goalCategory === "neet":
├── Subject (Physics/Chemistry/Botany/Zoology)
└── Year (2020–2024)

IF goalCategory === "jee-mains":
├── Subject (Physics/Chemistry/Mathematics)
├── Year (2020–2024)
└── Session (January/April)

IF goalCategory === "jee-advanced":
├── Subject (Physics/Chemistry/Mathematics)
├── Year (2015–2024)
└── Paper (Paper 1/Paper 2)

IF goalCategory === "mht-cet-pcb" or "mht-cet-pcm":
├── Subject (filtered by stream)
└── Year (2019–2024)
```

**Paper Card (Mobile-optimized):**
```
┌──────────────────────────────────────────────┐
│ [PYQ] [NEET UG]                        [🔖] │
│ NEET UG 2024 — Physics & Chemistry          │
│ 2024 · 720 marks · 3h 20min                 │
│ 👁️ 12,450    ⬇️ 4,200                       │
│ ──────────────────────────────────────────── │
│              [View Paper →]                  │
└──────────────────────────────────────────────┘
```

### 8.5 Quiz Detail Page — Pre-Start Screen

Before starting any quiz, show:
1. Quiz title, subject, chapter
2. Total questions, marks, time limit
3. **Marking scheme highlighted prominently** (e.g., "+4 correct, −1 wrong" in red)
4. Mode selector (Practice / Exam) — required selection
5. Instructions (expandable)
6. Your past attempts (if any) — best score, last attempted
7. [Start Quiz] button (full-width, orange on mobile)

### 8.6 Profile Page — Complete Sections

1. **Profile Header** — Avatar, Name (editable), Email, Phone
2. **My Goals** — Card for each goal with edit/remove; [+ Add New Goal] button
3. **My Subjects** — Per-active-goal subject management
4. **Performance Summary** — Total attempts, avg score, best subject, most improved
5. **Study Streak Calendar** — GitHub-style heat map of daily activity
6. **Attempt History** — Paginated list of all quiz attempts (most recent first)
7. **Account Settings** — Password change, notification preferences, language preference
8. **Data** — Download my data (future); Delete account (future)

---

## 9. Admin Portal — Feature Requirements (Detailed)

### 9.1 Admin Dashboard

**Stats Panel (6 KPI cards):**
- Total Students, Total Papers, Total Quizzes, Total Attempts, Today's Active Users, Pending Drafts

**Quick Action Bar:**
- [+ Upload Paper] [+ Create Quiz] [+ Post Announcement] [+ Add Subject]

**Alert Section:**
- Papers with 0 downloads (possibly broken PDFs)
- Quizzes with 0 attempts (check if published)
- Announcements expiring in next 7 days

**Content Snapshot:**
- Pie chart: exam category distribution of all papers
- Bar chart: weekly new papers uploaded
- Top 5 most viewed papers this week

### 9.2 Paper Upload Form — Complete Field Specification

```
Section 1: Exam Category
├── Goal / Exam:  [Board | NEET | JEE Mains | JEE Advanced | MHT-CET PCB | MHT-CET PCM]
├── [IF Board]: Standard:  [8 | 9 | 10 | 11 | 12]
├── [IF Board + 11/12]: Stream:  [PCB | PCM | PCB+M | Commerce | Arts]
├── [IF Board]: Medium:  [English | Semi-English | Marathi]
└── [IF JEE Mains]: Session:  [January | April]
    [IF JEE Advanced]: Paper:  [Paper 1 | Paper 2 | Both]

Section 2: Paper Classification
├── Paper Type:  [Unit Test | Semester | Prelims | Board | Model | Practice | PYQ | 
│                 Mock Test | Chapter-wise | Subject-wise | Minor Test | Major Test]
├── Subject:  [filtered dropdown based on exam + standard + stream]
├── Chapter:  [optional — only for Unit Test / Chapter-wise papers]
└── Year:  [2010–2026 dropdown]

Section 3: Paper Details
├── Title:  [text input — auto-suggested based on other fields]
├── Total Marks:  [number input]
├── Duration (minutes):  [number input]
└── Description / Instructions:  [optional textarea]

Section 4: PDF Upload
└── [Drag & drop / Browse] — accepts PDF only, max 20MB
    Preview thumbnail shown after upload

Section 5: Status
├── ○ Save as Draft (only admins can see)
└── ● Publish Immediately (visible to students)

[Cancel]  [Save Draft]  [Publish Paper]
```

### 9.3 Quiz Creation Form — Complete Field Specification

```
Section 1: Classification
├── Goal / Exam:  [dropdown]
├── Standard + Stream:  [conditional, if Board]
├── Subject:  [filtered dropdown]
├── Chapter / Scope:  [Chapter-wise | Full Syllabus]
│   └── If Chapter-wise: Chapter selector (multi-select if spanning chapters)
├── Difficulty:  [Easy | Medium | Hard | Mixed]
└── Tags:  [optional free-text tags for search]

Section 2: Quiz Settings
├── Title:  [text input]
├── Time Limit (minutes):  [number — 0 = untimed]
└── Instructions:  [textarea — shown to students before start]

Section 3: Marking Scheme
├── Preset:  [Board (+1/0) | NEET (+4/−1) | JEE MCQ (+4/−1) | 
│             JEE Numerical (+4/0) | MHT-CET PCM (+2/0) | MHT-CET PCB (+1/0) | Custom]
├── Correct Marks:   [+N — number input]
├── Wrong Marks:     [−N — number input, red if negative]
└── Unattempted:     [0 — usually locked to 0]

Section 4: Question Bank
├── [+ Add Question] button
│   └── Question editor (inline):
│       ├── Question Type:  [MCQ | Numerical]
│       ├── Question Text:  [textarea — supports LaTeX for equations]
│       ├── Option A / B / C / D:  [text inputs]
│       ├── Correct Answer:  [○A ○B ○C ○D]
│       ├── Explanation:  [textarea — shown after answer in Practice Mode]
│       ├── Marks:  [number — default 1, can be 2 for MHT-CET Maths]
│       └── Difficulty:  [Easy | Medium | Hard]
│
├── Question list (sortable drag-and-drop)
│   └── Each item: Q# | truncated text | marks | [✏️ Edit] [🗑️ Delete]
│
└── Total: X questions, Y marks (auto-calculated)

Section 5: Status
├── ○ Draft
├── ● Publish Now
└── ○ Schedule:  [date-time picker]

[Cancel]  [Save Draft]  [Preview]  [Publish]
```

### 9.4 Announcement Form — Complete Field Specification

```
├── Title:  [text input — 5–100 chars]
├── Body:  [rich textarea — supports bold, lists, links]
├── Priority:  [○ Normal  ○ Important ●  ○ Urgent]
│   Visual badges: Normal=gray, Important=amber, Urgent=red
│
├── Target Audience (multi-select checkboxes):
│   [☐ All Students]
│   ─── Board Exams ───
│   [☐ Class 8 Board]
│   [☐ Class 9 Board]
│   [☐ Class 10 SSC]
│   [☐ Class 11 Board]
│   [☐ Class 12 HSC]
│   ─── Competitive ───
│   [☐ NEET UG Students]
│   [☐ JEE Mains Students]
│   [☐ JEE Advanced Students]
│   [☐ MHT-CET PCB Students]
│   [☐ MHT-CET PCM Students]
│
├── Expiry Date:  [date picker]
└── [Save Draft]  [Publish Now]
```

---

## 10. Gamification & Motivation Features

### 10.1 Daily Streak System

```
Streak rules:
- Increment streak by 1 each day student completes at least:
  * 1 quiz attempt (any mode), OR
  * Views 1 paper (opens paper detail page)
- Reset to 0 if no activity for 24+ hours
- Streak displayed: 🔥 22 days

Streak milestones (badges):
- 7 days: "Week Warrior" 🏆
- 30 days: "Month Master" 🥇  
- 100 days: "Centurion" 💎
```

### 10.2 Subject Progress Rings

- Each enrolled subject has a completion ring (0–100%)
- Progress = quizzes attempted / total quizzes available for that subject × 100
- Color: orange (<40%), blue (40–69%), green (70%+)

### 10.3 Score Achievement Cards (Post-Quiz)

After scoring above thresholds, show achievement overlay:
- 90%+: "🌟 Excellent! Top 10% performance"
- 75–89%: "👏 Great Job! Above average"
- 60–74%: "💪 Keep Going! Getting better"
- <60%: "📖 Review this chapter and retry"

### 10.4 Recommended Practice Engine (Simple Rule-Based)

Based on quiz performance, recommend:
```
Rule 1: If subject accuracy < 50% → recommend 3 chapter-wise quizzes for that subject
Rule 2: If student hasn't practiced a subject in 7 days → surface it in recommendations
Rule 3: Prioritize chapters nearest to exam date (unit test schedule awareness)
Rule 4: New content first (papers/quizzes added in last 7 days)
```

---

## 11. Content Strategy & Minimum Viable Content

### 11.1 Papers — Minimum at Launch

| Category | Paper Types | Minimum Count |
|---|---|---|
| Class 8 Board | Unit Test × 2, Semester × 2 | 4 papers |
| Class 9 Board | Unit Test × 2, Semester × 2 | 4 papers |
| Class 10 SSC | Board × 3 (2022/23/24), Model × 2, Prelims × 2, PYQ × 2, Practice × 2 | 11 papers |
| Class 11 Board | Semester × 2, Model × 2, Unit Test × 2 | 6 papers |
| Class 12 HSC | Board × 3 (2022/23/24), Prelims × 2, PYQ × 3, Model × 2 | 10 papers |
| NEET UG | PYQ × 3 (2022/23/24), Mock Test × 3 | 6 papers |
| JEE Mains | PYQ × 4 (2 sessions × 2 years), Mock Test × 3 | 7 papers |
| JEE Advanced | PYQ × 3 (P1+P2 counted as 1), Mock Test × 2 | 5 papers |
| MHT-CET PCB | PYQ × 3, Mock Test × 2 | 5 papers |
| MHT-CET PCM | PYQ × 3, Mock Test × 2 | 5 papers |
| **TOTAL** | | **~63 papers** |

### 11.2 Quizzes — Minimum at Launch

| Category | Subjects | Quizzes Each | Total |
|---|---|---|---|
| Class 10 SSC | Math, Science Pt1, Science Pt2 | 3 | 9 |
| Class 12 HSC PCB | Physics, Chemistry, Biology | 3 | 9 |
| Class 12 HSC PCM | Physics, Chemistry, Math & Stats | 3 | 9 |
| NEET UG | Physics, Chemistry, Botany, Zoology | 3 | 12 |
| JEE Mains | Physics, Chemistry, Mathematics | 3 | 9 |
| MHT-CET PCB | Physics, Chemistry, Biology | 2 | 6 |
| MHT-CET PCM | Physics, Chemistry, Mathematics | 2 | 6 |
| Class 8–9 Board | Math, Science | 2 | 4 |
| **TOTAL** | | | **~64 quizzes** |

---

## 12. Non-Functional Requirements

| Requirement | Specification | Reason |
|---|---|---|
| **Mobile Performance** | Lighthouse mobile score ≥ 85 | Budget Android phones, 4G limits |
| **First Paint** | FCP < 1.5s on simulated 4G | Students on limited data |
| **JS Bundle Size** | < 400KB gzipped | Low-RAM devices struggle with heavy apps |
| **Accessibility** | WCAG 2.1 AA | Inclusive design, diverse users |
| **Touch Targets** | ≥ 44×44px | Standard for mobile usability |
| **Minimum Font Size** | 14px body on mobile | Readability in all conditions |
| **Browser Support** | Chrome 90+, Firefox 88+, Safari 14+, Samsung Internet 14+ | Samsung is common in India |
| **Network Resilience** | Graceful offline state | Rural 4G is often patchy |
| **Quiz State Persistence** | Save to localStorage every 10s | Prevent loss on interruption |
| **Session Management** | Auto-logout after 30 days | Shared device households |
| **Color Contrast** | ≥ 4.5:1 ratio all text | WCAG AA, low-light reading |

---

## 13. Out of Scope for v2.0

| Feature | Reason | Future Version |
|---|---|---|
| Live video classes | Infrastructure + cost | v3.0 |
| Doubt forum / chat | Moderation complexity | v3.0 |
| Payment / premium tier | Keep free-first | v3.0 |
| Native mobile apps (iOS/Android) | Build web first, PWA next | v3.0/4.0 |
| AI-generated questions | Quality risk for exam prep | v4.0 |
| Teacher/school separate login | Scope limit | v3.0 |
| Real PDF viewer (in-app) | Heavy, use native viewer | v3.0 |
| Offline download of quizzes | Complex sync | v3.0 |
| Leaderboard (public) | Privacy concerns | v3.0 |
| JEE Advanced partial marking | Too complex for MVP | v2.5 |

---

## 14. Success Metrics & KPIs

| Metric | Target (3 months post-launch) | Measurement |
|---|---|---|
| Student registrations | 2,000+ | User count |
| Daily active users | 30% of registered | Sessions/day |
| Papers accessed per active student/week | ≥ 3 | Paper detail views |
| Quizzes attempted per active student/week | ≥ 5 | Quiz completions |
| Average session duration | ≥ 12 minutes | Analytics |
| Quiz completion rate | ≥ 75% | Completed/Started |
| 7-day streak retention | ≥ 40% maintain a streak | Streak data |
| Competitive exam students | ≥ 35% of user base | Goal distribution |
| Mobile traffic percentage | ≥ 70% | Device analytics |
| App crash / error rate | < 1% of sessions | Error logging |

---

## 15. Open Questions (Requiring Stakeholder Input)

> [!IMPORTANT]
> **Q1 — PCB+M Students:** Should students who take both Biology and Mathematics in Class 11/12 have one combined goal ("Science PCB+M") or two separate goals? Separate goals give cleaner content filtering but more complexity in onboarding.

> [!IMPORTANT]
> **Q2 — JEE Advanced Partial Marking:** Should the platform implement partial marking for JEE Advanced "multiple correct" questions in v2.0? Or simplify to +4/−2 for wrong? This affects quiz engine complexity significantly.

> [!IMPORTANT]
> **Q3 — Class 8 & 9 Content:** Since Class 8 & 9 exams are school-internal (not MSBSHSE board), paper content will be generic/platform-created only. Should these standards be included from day one, or added in v2.5 when more content is available?

> [!NOTE]
> **Q4 — Marathi UI Language:** Should the platform UI be available in Marathi (interface language, not just paper content)? Marathi medium students may find English UI intimidating.

> [!NOTE]
> **Q5 — Guest Preview:** Should unregistered students be able to preview a quiz (e.g., see first 2 questions) before being asked to register? This could reduce registration friction.

> [!CAUTION]
> **Q6 — Numerical Questions in JEE:** For JEE Mains numerical answer type questions, should we (a) convert them to MCQ with nearest answer option, (b) show a numeric input field, or (c) skip numerical questions entirely in v2.0?

---

*Next Documents: TRD → App/Web Flow → UI/UX Brief → Implementation Plan*
