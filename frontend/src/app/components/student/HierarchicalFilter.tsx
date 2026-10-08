import {
  GraduationCap, School, Trophy, ChevronRight, X, RotateCcw, Check,
  Landmark, BookText, Globe, Building2, Pencil,
  type LucideIcon
} from "lucide-react";
import type { GoalCategory, Stream } from "../data/mockData";


// ── Types ─────────────────────────────────────────────────────────────────────

export type EduLevel = "" | "school" | "college" | "competitive";
export type BoardType = "" | "maharashtra" | "cbse" | "icse" | "other";

export interface HierarchicalFilterState {
  level:       EduLevel;
  board:       BoardType;
  grade:       string;   // "8" | "9" | "10"   (school)
  collegeYear: string;   // "11" | "12"          (college)
  stream:      Stream | "";  // "pcb" | "pcm" | "commerce" | "arts" (college)
  examType:    string;   // "neet" | "jee-mains" | "jee-advanced" | "mht-cet-pcm" | "mht-cet-pcb"
}

export const EMPTY_FILTER: HierarchicalFilterState = {
  level: "", board: "", grade: "", collegeYear: "", stream: "", examType: "",
};

export const EDUCATIONAL_BOARDS: { id: BoardType; label: string; badge: string; desc: string; icon: LucideIcon }[] = [
  { id: "maharashtra", label: "Maharashtra Board", badge: "MSBSHSE", desc: "State Board (SSC / HSC)", icon: Building2 },
  { id: "cbse",        label: "CBSE Board",        badge: "NCERT",   desc: "Central Board (CBSE)",  icon: Landmark },
  { id: "icse",        label: "ICSE / ISC Board",   badge: "CISCE",   desc: "Indian Certificate",    icon: BookText },
  { id: "other",       label: "Other State Board",  badge: "State",   desc: "Other State / NIOS",    icon: Globe },
];

/** Converts the hierarchical selection to a GoalCategory (or "" for all) */
export function resolveGoalCategory(f: HierarchicalFilterState): GoalCategory | "" {
  if (f.level === "school") {
    if (f.grade === "8")  return "board-8";
    if (f.grade === "9")  return "board-9";
    if (f.grade === "10") return "board-10";
    return "";
  }
  if (f.level === "college") {
    if (f.collegeYear === "11") return "board-11";
    if (f.collegeYear === "12") return "board-12";
    return "";
  }
  if (f.level === "competitive") {
    if (f.examType === "neet")         return "neet";
    if (f.examType === "jee-mains")    return "jee-mains";
    if (f.examType === "jee-advanced") return "jee-advanced";
    if (f.examType === "mht-cet-pcm")  return "mht-cet-pcm";
    if (f.examType === "mht-cet-pcb")  return "mht-cet-pcb";
    return "";
  }
  return "";
}

/** Human-readable label for active filter breadcrumb */
export function filterBreadcrumb(f: HierarchicalFilterState): string {
  if (!f.level) return "All Content";
  const boardLabel = EDUCATIONAL_BOARDS.find(b => b.id === f.board)?.badge;
  if (f.level === "school") {
    const gr = f.grade ? `Class ${f.grade}` : "School (All Grades)";
    return [gr, boardLabel].filter(Boolean).join(" · ");
  }
  if (f.level === "college") {
    const year  = f.collegeYear ? `Class ${f.collegeYear}` : "All Years";
    const st    = f.stream ? STREAM_LABELS[f.stream as Stream] ?? f.stream : "";
    return [year, st, boardLabel ?? "HSC Board"].filter(Boolean).join(" · ");
  }
  if (f.level === "competitive") {
    const exam = COMPETITIVE_OPTIONS.find(o => o.value === f.examType);
    return exam ? exam.label : "Competitive Exams";
  }
  return "All Content";
}


// ── Static Config ─────────────────────────────────────────────────────────────

const STREAM_LABELS: Record<Stream, string> = {
  pcb:      "Science (PCB)",
  pcm:      "Science (PCM)",
  pcbm:     "Science (PCB+M)",
  commerce: "Commerce",
  arts:     "Arts",
  general:  "General",
};

const COMPETITIVE_OPTIONS = [
  { value: "neet",         label: "NEET UG",       color: "#16A34A", bg: "#DCFCE7", desc: "Physics · Chemistry · Biology" },
  { value: "jee-mains",    label: "JEE Mains",     color: "#7C3AED", bg: "#EDE9FE", desc: "Physics · Chemistry · Maths" },
  { value: "jee-advanced", label: "JEE Advanced",  color: "#4F46E5", bg: "#E0E7FF", desc: "Physics · Chemistry · Maths" },
  { value: "mht-cet-pcm",  label: "MHT-CET PCM",  color: "#0284C7", bg: "#E0F2FE", desc: "Physics · Chemistry · Maths" },
  { value: "mht-cet-pcb",  label: "MHT-CET PCB",  color: "#0891B2", bg: "#CFFAFE", desc: "Physics · Chemistry · Biology" },
];

const COLLEGE_STREAMS_11: { value: Stream; label: string; desc: string }[] = [
  { value: "pcb",      label: "Science (PCB)", desc: "Physics · Chemistry · Biology" },
  { value: "pcm",      label: "Science (PCM)", desc: "Physics · Chemistry · Maths" },
  { value: "commerce", label: "Commerce",      desc: "Accountancy · Economics · Business" },
  { value: "arts",     label: "Arts",          desc: "History · Poly. Sci · Geography" },
];
const COLLEGE_STREAMS_12 = COLLEGE_STREAMS_11;

// ── Sub-components ────────────────────────────────────────────────────────────

function Pill({
  active, onClick, color, children,
}: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap border ${
        active
          ? "border-transparent text-white shadow-sm"
          : "border-[#E2E6EF] text-gray-600 hover:border-gray-300 bg-[#F8F9FC] hover:bg-[#F1F3F8]"
      }`}
      style={active ? { backgroundColor: color ?? "#1E3A8A" } : {}}
    >
      {children}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface HierarchicalFilterProps {
  value:    HierarchicalFilterState;
  onChange: (next: HierarchicalFilterState) => void;
}

/** Smoothly scrolls to a DOM element by data-step attribute */
function scrollToStep(stepId: string) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      const el = document.querySelector(`[data-step="${stepId}"]`) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        // Brief highlight pulse
        el.classList.add("ring-2", "ring-blue-400/50");
        setTimeout(() => el.classList.remove("ring-2", "ring-blue-400/50"), 1200);
      }
    }, 120); // small delay so the next step has time to mount
  });
}

export function HierarchicalFilter({ value, onChange }: HierarchicalFilterProps) {
  const set = (partial: Partial<HierarchicalFilterState>) =>
    onChange({ ...value, ...partial });

  const selectLevel = (level: EduLevel) => {
    if (value.level === level) {
      // toggle off — reset everything
      onChange(EMPTY_FILTER);
    } else {
      onChange({ ...EMPTY_FILTER, level });
      // Auto-scroll to Board (school/college) or Exam (competitive)
      if (level === "competitive") {
        scrollToStep("step-exam");
      } else {
        scrollToStep("step-board");
      }
    }
  };


  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(248,249,252,0.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(226,230,239,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>

      {/* ── Level 1: 3 main buttons with Single-Focus Sibling Hiding ── */}
      <div id="education-level-step" className="p-3 sm:p-4 transition-all duration-500 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Step 1: Education Level
            </p>
            {!value.level && (
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80 animate-pulse">
                Select below ↓
              </span>
            )}
          </div>
          {value.level && (
            <button
              onClick={() => onChange(EMPTY_FILTER)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={11} /> Change Level
            </button>
          )}
        </div>

        <div className={value.level ? "grid grid-cols-1" : "grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3"}>
          {/* School */}
          {(!value.level || value.level === "school") && (
            <button
              onClick={() => selectLevel("school")}
              className={`flex items-center sm:flex-col justify-between sm:justify-center gap-2.5 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 animate-apple-unveil w-full min-w-0 ${
                value.level === "school"
                  ? "border-[#2563EB] bg-[#EFF6FF] shadow-[0_4px_20px_rgba(37,99,235,0.18)] ring-2 ring-[#2563EB]/20"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center sm:flex-col gap-2.5 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  value.level === "school" ? "bg-[#2563EB] shadow-sm" : "bg-[#F8F9FC] border border-[#E2E6EF]"
                }`}>
                  <School size={18} className={value.level === "school" ? "text-white" : "text-gray-500"} />
                </div>
                <div className="text-left sm:text-center min-w-0">
                  <span className={`text-xs sm:text-sm font-bold font-['Poppins'] block truncate ${
                    value.level === "school" ? "text-[#1D4ED8]" : "text-gray-700"
                  }`}>School</span>
                  <span className="text-[10px] text-gray-400 block whitespace-nowrap">Class 8–10</span>
                </div>
              </div>
              {value.level === "school" && (
                <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">
                  <Check size={10} className="inline -mt-px" /> Selected
                </span>
              )}
            </button>
          )}

          {/* College */}
          {(!value.level || value.level === "college") && (
            <button
              onClick={() => selectLevel("college")}
              className={`flex items-center sm:flex-col justify-between sm:justify-center gap-2.5 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 animate-apple-unveil w-full min-w-0 ${
                value.level === "college"
                  ? "border-[#1E3A8A] bg-[#EFF6FF] shadow-[0_4px_20px_rgba(30,58,138,0.18)] ring-2 ring-[#1E3A8A]/20"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center sm:flex-col gap-2.5 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  value.level === "college" ? "bg-[#1E3A8A] shadow-sm" : "bg-[#F8F9FC] border border-[#E2E6EF]"
                }`}>
                  <GraduationCap size={18} className={value.level === "college" ? "text-white" : "text-gray-500"} />
                </div>
                <div className="text-left sm:text-center min-w-0">
                  <span className={`text-xs sm:text-sm font-bold font-['Poppins'] block truncate ${
                    value.level === "college" ? "text-[#1E3A8A]" : "text-gray-700"
                  }`}>College</span>
                  <span className="text-[10px] text-gray-400 block whitespace-nowrap">Class 11–12</span>
                </div>
              </div>
              {value.level === "college" && (
                <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-[#1E3A8A] px-2 py-0.5 rounded-full flex-shrink-0">
                  <Check size={10} className="inline -mt-px" /> Selected
                </span>
              )}
            </button>
          )}

          {/* Competitive */}
          {(!value.level || value.level === "competitive") && (
            <button
              onClick={() => selectLevel("competitive")}
              className={`flex items-center sm:flex-col justify-between sm:justify-center gap-2.5 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 animate-apple-unveil w-full min-w-0 ${
                value.level === "competitive"
                  ? "border-[#7C3AED] bg-[#F5F3FF] shadow-[0_4px_20px_rgba(124,58,237,0.18)] ring-2 ring-[#7C3AED]/20"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center sm:flex-col gap-2.5 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  value.level === "competitive" ? "bg-[#7C3AED] shadow-sm" : "bg-[#F8F9FC] border border-[#E2E6EF]"
                }`}>
                  <Trophy size={18} className={value.level === "competitive" ? "text-white" : "text-gray-500"} />
                </div>
                <div className="text-left sm:text-center min-w-0">
                  <span className={`text-xs sm:text-sm font-bold font-['Poppins'] block truncate ${
                    value.level === "competitive" ? "text-[#6D28D9]" : "text-gray-700"
                  }`}>Competitive</span>
                  <span className="text-[10px] text-gray-400 block whitespace-nowrap">NEET · JEE · CET</span>
                </div>
              </div>
              {value.level === "competitive" && (
                <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">
                  <Check size={10} className="inline -mt-px" /> Selected
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Step 2: Board Selection (Unveils for School & College only, not Competitive) ── */}
      {(value.level === "school" || value.level === "college") && (
        <div data-step="step-board" className="px-3 sm:px-4 pb-3 border-t border-gray-100/80 pt-3 animate-apple-unveil transition-all duration-300 rounded-xl">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-blue-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 2 · Select Board</p>
              {!value.board && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse ml-1">Select below ↓</span>}
            </div>
            {value.board && (
              <button
                onClick={() => set({ board: "" })}
                className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <Pencil size={10} className="inline -mt-px" /> Change Board
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {EDUCATIONAL_BOARDS
              .filter(b => !value.board || value.board === b.id)
              .map((b, idx) => (
                <button
                  key={b.id}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => {
                    set({ board: value.board === b.id ? "" : b.id });
                    if (value.board !== b.id) scrollToStep("step-grade");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-150 animate-apple-unveil w-full ${
                    value.board === b.id
                      ? "border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A] font-bold shadow-sm ring-2 ring-blue-500/20"
                      : "border-[#E2E6EF] bg-[#F8F9FC] text-gray-700 hover:border-gray-300 hover:bg-[#F1F3F8]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold font-['Poppins'] truncate flex items-center gap-1.5">
                      <b.icon size={14} className={value.board === b.id ? "text-[#1E3A8A]" : "text-gray-400"} />
                      {b.label}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      value.board === b.id ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {b.badge}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">{b.desc}</p>
                </button>
              ))}
          </div>
        </div>
      )}


      {/* ── Step 3: Drill-down (School grades — Unveiled after Board is selected) ── */}
      {value.level === "school" && value.board !== "" && (
        <div data-step="step-grade" className="px-3 sm:px-4 pb-3 border-t border-gray-50 pt-3 animate-apple-unveil transition-all duration-300 rounded-xl">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-blue-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 3 · Select Grade</p>
              {!value.grade && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse ml-1">Select below ↓</span>}
            </div>
            {value.grade && (
              <button
                onClick={() => set({ grade: "" })}
                className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <Pencil size={10} className="inline -mt-px" /> Change Grade
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["8", "9", "10"]
              .filter(g => !value.grade || value.grade === g)
              .map((g, idx) => (
                <div key={g} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-apple-unveil">
                  <Pill
                    active={value.grade === g}
                    onClick={() => {
                      set({ grade: value.grade === g ? "" : g });
                      if (value.grade !== g) scrollToStep("step-medium");
                    }}
                    color="#2563EB"
                  >
                    Class {g} {value.grade === g && <Check size={12} className="inline -mt-px ml-0.5" />}
                  </Pill>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Drill-down (College year & stream — Unveiled after Board is selected) ── */}
      {value.level === "college" && value.board !== "" && (
        <div data-step="step-grade" className="px-3 sm:px-4 pb-3 border-t border-gray-50 pt-3 space-y-3 animate-apple-unveil transition-all duration-300 rounded-xl">

          {/* Year */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <ChevronRight size={12} className="text-blue-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 3 · Select Year</p>
                {!value.collegeYear && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse ml-1">Select below ↓</span>}
              </div>
              {value.collegeYear && (
                <button
                  onClick={() => set({ collegeYear: "", stream: "" })}
                  className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  <Pencil size={10} className="inline -mt-px" /> Change Year
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {["11", "12"]
                .filter(y => !value.collegeYear || value.collegeYear === y)
                .map((y, idx) => (
                  <div key={y} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-apple-unveil">
                    <Pill
                      active={value.collegeYear === y}
                      onClick={() => {
                      set({ collegeYear: value.collegeYear === y ? "" : y, stream: "" });
                      if (value.collegeYear !== y) scrollToStep("step-stream");
                    }}
                    color="#1E3A8A"
                  >
                      Class {y} {value.collegeYear === y && <Check size={12} className="inline -mt-px ml-0.5" />}
                    </Pill>
                  </div>
                ))}
            </div>
          </div>

          {/* Stream — appears after year selected */}
          {value.collegeYear && (
            <div data-step="step-stream" className="animate-apple-unveil transition-all duration-300 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-blue-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 4 · Select Stream</p>
                  {!value.stream && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse ml-1">Select below ↓</span>}
                </div>
                {value.stream && (
                  <button
                    onClick={() => set({ stream: "" })}
                    className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Pencil size={10} className="inline -mt-px" /> Change Stream
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(value.collegeYear === "11" ? COLLEGE_STREAMS_11 : COLLEGE_STREAMS_12)
                  .filter(s => !value.stream || value.stream === s.value)
                  .map((s, idx) => (
                    <button
                      key={s.value}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      onClick={() => {
                        set({ stream: value.stream === s.value ? "" : s.value });
                        if (value.stream !== s.value) scrollToStep("step-medium");
                      }}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border text-left animate-apple-unveil ${
                        value.stream === s.value
                          ? "border-[#1E3A8A] bg-[#1E3A8A] text-white"
                          : "border-[#E2E6EF] text-gray-700 bg-[#F8F9FC] hover:border-gray-300 hover:bg-[#F1F3F8]"
                      }`}
                    >
                      <p className="font-semibold">{s.label} {value.stream === s.value && <Check size={12} className="inline -mt-px ml-0.5" />}</p>
                      <p className={`text-[10px] mt-0.5 ${value.stream === s.value ? "text-blue-200" : "text-gray-400"}`}>
                        {s.desc}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Drill-down (Competitive exams — Unveiled immediately, no Board needed) ── */}
      {value.level === "competitive" && (
        <div data-step="step-exam" className="px-3 sm:px-4 pb-3 border-t border-gray-50 pt-3 animate-apple-unveil transition-all duration-300 rounded-xl">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-purple-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 2 · Select Exam</p>
              {!value.examType && <span className="text-[9px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full animate-pulse ml-1">Select below ↓</span>}
            </div>

            {value.examType && (
              <button
                onClick={() => set({ examType: "" })}
                className="text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <Pencil size={10} className="inline -mt-px" /> Change Exam
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            {COMPETITIVE_OPTIONS
              .filter(opt => !value.examType || value.examType === opt.value)
              .map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    set({ examType: value.examType === opt.value ? "" : opt.value });
                    if (value.examType !== opt.value) scrollToStep("step-medium");
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-150 animate-apple-unveil ${
                    value.examType === opt.value
                      ? "border-transparent text-white shadow-sm"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                  style={value.examType === opt.value ? { backgroundColor: opt.color } : {}}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-black"
                    style={
                      value.examType === opt.value
                        ? { backgroundColor: "rgba(255,255,255,0.2)", color: "white" }
                        : { backgroundColor: opt.bg, color: opt.color }
                    }
                  >
                    {opt.label.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold font-['Poppins'] ${value.examType === opt.value ? "text-white" : "text-gray-800"}`}>
                      {opt.label} {value.examType === opt.value && <Check size={12} className="inline -mt-px ml-0.5" />}
                    </p>
                    <p className={`text-[10px] ${value.examType === opt.value ? "text-white/70" : "text-gray-400"}`}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}


      {/* ── Active breadcrumb + Clear ── */}
      {value.level && (
        <div className="px-3 sm:px-4 py-2 bg-[#F8FAFC] border-t border-gray-100 flex items-center justify-between gap-2">
          <p className="text-[11px] text-gray-500 flex-1 min-w-0 truncate">
            <span className="font-semibold text-[#1E3A8A]">{filterBreadcrumb(value)}</span>
          </p>
          <button
            onClick={() => onChange(EMPTY_FILTER)}
            className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
          >
            <X size={11} />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
