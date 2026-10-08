import React, { useState } from "react";
import { useApp } from "./context/AppContext";
import type { User } from "./context/AppContext";
import { updateMe } from "../lib/api";
import type { GoalCategory, Standard, Stream, Medium, Goal } from "./data/mockData";
import { GOAL_METADATA, subjects } from "./data/mockData";
import {
  ChevronLeft, ChevronRight, Check, BookOpen, School, BookMarked,
  Stethoscope, Atom, Trophy, Microscope, Calculator, Dna, FlaskConical,
  TrendingUp, Globe, BookText, Layers, type LucideIcon,
} from "lucide-react";
import { GoalIcon, SubjectIcon } from "./shared/GoalIcons";

// ─────────────────────────────────────────────────────────────────────────────
// Step types
// ─────────────────────────────────────────────────────────────────────────────

type GoalType = "board" | "competitive" | "both";

interface OnboardingState {
  // Step 0 — Goal Type
  goalType: GoalType | null;

  // Board path
  boardStandards: Standard[];
  boardStream: Stream | null;
  boardMedium: Medium | null;

  // Competitive path
  competitiveExams: GoalCategory[];
  targetYear: number | null;

  // Step — Subjects
  selectedSubjectIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Config helpers
// ─────────────────────────────────────────────────────────────────────────────

const STANDARDS: { value: Standard; label: string; sub: string }[] = [
  { value: "8",  label: "Class 8",  sub: "School Level" },
  { value: "9",  label: "Class 9",  sub: "School Level" },
  { value: "10", label: "Class 10", sub: "SSC Board" },
  { value: "11", label: "Class 11", sub: "Junior College" },
  { value: "12", label: "Class 12", sub: "HSC Board" },
];

const STREAMS: { value: Stream; label: string; icon: LucideIcon; sub: string }[] = [
  { value: "pcb",      label: "Science (PCB)",     icon: Dna,         sub: "Physics, Chemistry, Biology" },
  { value: "pcm",      label: "Science (PCM)",     icon: Calculator,  sub: "Physics, Chemistry, Maths" },
  { value: "pcbm",     label: "Science (PCB+M)",   icon: FlaskConical,sub: "All Science subjects" },
  { value: "commerce", label: "Commerce",          icon: TrendingUp,  sub: "Accountancy, OCM, Economics" },
  { value: "arts",     label: "Arts / Humanities", icon: BookMarked,  sub: "History, Geography, Pol. Science" },
];

const MEDIUMS: { value: Medium; label: string; icon: LucideIcon; sub: string }[] = [
  { value: "english",      label: "English Medium",  icon: Globe,     sub: "All subjects in English" },
  { value: "semi-english", label: "Semi-English",    icon: BookOpen,  sub: "Science in English, others Marathi" },
  { value: "marathi",      label: "Marathi Medium",  icon: BookText,  sub: "All subjects in Marathi" },
];

const COMPETITIVE_EXAMS: { value: GoalCategory; label: string; icon: LucideIcon; sub: string; color: string; comingSoon?: boolean }[] = [
  { value: "jee-mains",    label: "JEE Mains",    icon: Atom,        sub: "Engineering entrance (PCM)",            color: "#7C3AED", comingSoon: true },
  { value: "jee-advanced", label: "JEE Advanced", icon: Trophy,      sub: "IIT entrance (after JEE Mains)",        color: "#4F46E5", comingSoon: true },
  { value: "neet",         label: "NEET UG",      icon: Stethoscope, sub: "Medical entrance (PCB)",               color: "#16A34A", comingSoon: true },
  { value: "mht-cet-pcb",  label: "MHT-CET PCB",  icon: Microscope,  sub: "Maharashtra CET — Medical",            color: "#0891B2" },
  { value: "mht-cet-pcm",  label: "MHT-CET PCM",  icon: Calculator,  sub: "Maharashtra CET — Engineering",        color: "#0284C7" },
];

const TARGET_YEARS = [2025, 2026, 2027, 2028];

// ─────────────────────────────────────────────────────────────────────────────
// Step counter helper
// ─────────────────────────────────────────────────────────────────────────────

function getSteps(state: OnboardingState): string[] {
  const steps = ["Choose Goal Type"];
  if (state.goalType === "board" || state.goalType === "both") {
    steps.push("Select Standard");
    if (state.boardStandards.some(s => s === "11" || s === "12")) steps.push("Select Stream");
    steps.push("Select Medium");
  }
  if (state.goalType === "competitive" || state.goalType === "both") {
    steps.push("Select Exam(s)");
    steps.push("Target Year");
  }
  steps.push("Select Subjects");
  return steps;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const { setView, user, setUser, selectedPaperId, selectedQuizId } = useApp();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<OnboardingState>({
    goalType: null,
    boardStandards: [],
    boardStream: null,
    boardMedium: null,
    competitiveExams: [],
    targetYear: new Date().getFullYear() + 1,
    selectedSubjectIds: [],
  });

  const steps = getSteps(state);
  const totalSteps = steps.length;
  const progress = ((step) / (totalSteps - 1)) * 100;

  // ── Navigation ────────────────────────────────────────────────────────────

  const canGoNext = (): boolean => {
    const label = steps[step];
    switch (label) {
      case "Choose Goal Type":    return state.goalType !== null;
      case "Select Standard":     return state.boardStandards.length > 0;
      case "Select Stream":       return state.boardStream !== null;
      case "Select Medium":       return state.boardMedium !== null;
      case "Select Exam(s)":      return state.competitiveExams.length > 0;
      case "Target Year":         return state.targetYear !== null;
      case "Select Subjects":     return state.selectedSubjectIds.length > 0;
      default:                    return true;
    }
  };

  const goNext = () => {
    if (step < totalSteps - 1) setStep(s => s + 1);
    else finishOnboarding();
  };

  const goBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  // ── Build goals from state ────────────────────────────────────────────────

  const buildGoals = (): Goal[] => {
    const goals: Goal[] = [];

    // Board goals
    if ((state.goalType === "board" || state.goalType === "both") && state.boardMedium) {
      state.boardStandards.forEach(std => {
        const meta = GOAL_METADATA[`board-${std}` as GoalCategory];
        const needsStream = std === "11" || std === "12";
        const stream = needsStream ? (state.boardStream ?? "general") : "general";
        const mediumLabel = state.boardMedium === "english" ? "English" : state.boardMedium === "marathi" ? "Marathi" : "Semi-English";
        const streamLabel = needsStream && stream !== "general" ? ` (${stream.toUpperCase()})` : "";
        const stdLabel = std === "10" ? "SSC" : std === "12" ? "HSC" : `Class ${std}`;

        const subjectIds = state.selectedSubjectIds.filter(sid => {
          const sub = subjects.find(s => s.id === sid);
          return sub && sub.goalCategory === (`board-${std}` as GoalCategory);
        });

        goals.push({
          id: `goal-board-${std}-${Date.now()}`,
          category: `board-${std}` as GoalCategory,
          label: `${stdLabel} Board${streamLabel} (${mediumLabel})`,
          shortLabel: `${stdLabel}${streamLabel}`,
          icon: meta.icon,
          color: meta.color,
          bgColor: meta.bgColor,
          textColor: meta.textColor,
          standard: std,
          stream: stream as Stream,
          medium: state.boardMedium!,
          subjects: subjectIds.length > 0 ? subjectIds : [],
        });
      });
    }

    // Competitive goals
    if ((state.goalType === "competitive" || state.goalType === "both") && state.targetYear) {
      state.competitiveExams.forEach(cat => {
        const meta = GOAL_METADATA[cat];
        const subjectIds = state.selectedSubjectIds.filter(sid => {
          const sub = subjects.find(s => s.id === sid);
          return sub && sub.goalCategory === cat;
        });

        goals.push({
          id: `goal-${cat}-${Date.now()}`,
          category: cat,
          label: `${meta.label} ${state.targetYear}`,
          shortLabel: `${meta.label} ${state.targetYear}`,
          icon: meta.icon,
          color: meta.color,
          bgColor: meta.bgColor,
          textColor: meta.textColor,
          targetYear: state.targetYear!,
          subjects: subjectIds,
        });
      });
    }

    return goals;
  };

  // ── Finish Onboarding ─────────────────────────────────────────────────────

  const finishOnboarding = () => {
    const goals = buildGoals();
    if (goals.length === 0) return;

    const updatedUser: User = {
      ...(user ?? {
        id: `user-${Date.now()}`,
        name: "Student",
        email: "",
        streak: 0,
        isAdmin: false,
      }),
      goals,
      currentGoalId: goals[0].id,
      medium: state.boardMedium ?? "english",
    } as User;

    setUser(updatedUser);
    void updateMe({
      goals: updatedUser.goals,
      currentGoalId: updatedUser.currentGoalId,
      medium: updatedUser.medium,
    }).catch((err) => console.warn("Could not save onboarding to server", err));
    if (selectedPaperId) {
      setView("paper-detail");
    } else if (selectedQuizId) {
      setView("quiz-detail");
    } else {
      setView("dashboard");
    }
  };

  // ── Step content resolver ────────────────────────────────────────────────

  const currentStepLabel = steps[step];

  const renderStep = () => {
    switch (currentStepLabel) {
      case "Choose Goal Type":   return <StepGoalType state={state} setState={setState} />;
      case "Select Standard":    return <StepStandard state={state} setState={setState} />;
      case "Select Stream":      return <StepStream state={state} setState={setState} />;
      case "Select Medium":      return <StepMedium state={state} setState={setState} />;
      case "Select Exam(s)":     return <StepExams state={state} setState={setState} />;
      case "Target Year":        return <StepYear state={state} setState={setState} />;
      case "Select Subjects":    return <StepSubjects state={state} setState={setState} />;
      default:                   return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1E3A8A] rounded-xl flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-[#1E3A8A] font-['Poppins']">ParikshaCrack</span>
        </div>
        <button
          onClick={() => { setView("landing"); setShowLoginModal(true); }}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] px-2"
          aria-label="Skip onboarding"
        >
          Skip
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Progress ── */}
      <div className="px-4 pt-5 pb-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="text-xs font-semibold text-[#1E3A8A]">{currentStepLabel}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E3A8A] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < step ? "w-5 h-1.5 bg-[#1E3A8A]" :
                i === step ? "w-6 h-1.5 bg-[#1E3A8A]" :
                "w-1.5 h-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto w-full">
        <div
          key={step}
          className="animate-fade-in"
          style={{ animation: "fadeSlideIn 0.2s ease-out" }}
        >
          {renderStep()}
        </div>
      </div>

      {/* ── Footer Nav ── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 flex gap-3 max-w-md mx-auto w-full">
        {step > 0 && (
          <button
            onClick={goBack}
            className="flex items-center justify-center gap-2 min-h-[48px] px-5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition-all duration-150 flex-shrink-0"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!canGoNext()}
          className="flex items-center justify-center gap-2 min-h-[48px] px-5 flex-1 bg-[#1E3A8A] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-150"
        >
          {step === totalSteps - 1 ? (
            <>
              <Check size={16} />
              Get Started!
            </>
          ) : (
            <>
              Continue
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 0 — Goal Type
// ─────────────────────────────────────────────────────────────────────────────

function StepGoalType({ state, setState }: { state: OnboardingState; setState: React.Dispatch<React.SetStateAction<OnboardingState>> }) {
  const options: { value: GoalType; label: string; icon: LucideIcon; sub: string }[] = [
    { value: "board",       label: "Board Exams",        icon: School, sub: "Classes 8–12, SSC, HSC" },
    { value: "competitive", label: "Competitive Exams",  icon: Trophy, sub: "NEET, JEE Mains/Advanced, MHT-CET" },
    { value: "both",        label: "Both!",              icon: Layers, sub: "Board + competitive prep together" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-1">What are you preparing for?</h1>
      <p className="text-sm text-gray-500 mb-6">We'll personalise your dashboard, papers, and quizzes based on your goal.</p>
      <div className="flex flex-col gap-3">
        {options.map(opt => {
          const isSelected = state.goalType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setState(prev => ({ ...prev, goalType: opt.value }))}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 min-h-[80px] ${
                isSelected
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <opt.icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-base font-semibold font-['Poppins'] ${isSelected ? "text-[#1E3A8A]" : "text-gray-900"}`}>{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 bg-[#1E3A8A] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step — Select Standard
// ─────────────────────────────────────────────────────────────────────────────

function StepStandard({ state, setState }: { state: OnboardingState; setState: React.Dispatch<React.SetStateAction<OnboardingState>> }) {
  const toggle = (std: Standard) => {
    setState(prev => {
      const already = prev.boardStandards.includes(std);
      const updated = already ? prev.boardStandards.filter(s => s !== std) : [...prev.boardStandards, std];
      return { ...prev, boardStandards: updated };
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-1">Which class(es) are you in?</h2>
      <p className="text-sm text-gray-500 mb-6">Select all that apply. You can prepare for multiple classes.</p>
      <div className="flex flex-col gap-3">
        {STANDARDS.map(std => {
          const isSelected = state.boardStandards.includes(std.value);
          return (
            <button
              key={std.value}
              onClick={() => toggle(std.value)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 min-h-[68px] ${
                isSelected
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold font-['JetBrains_Mono'] flex-shrink-0 ${
                isSelected ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {std.value}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold font-['Poppins'] ${isSelected ? "text-[#1E3A8A]" : "text-gray-900"}`}>{std.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{std.sub}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 bg-[#1E3A8A] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step — Select Stream (Class 11 / 12 only)
// ─────────────────────────────────────────────────────────────────────────────

function StepStream({ state, setState }: { state: OnboardingState; setState: React.Dispatch<React.SetStateAction<OnboardingState>> }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-1">Which stream are you in?</h2>
      <p className="text-sm text-gray-500 mb-6">This determines which subjects and papers we show you.</p>
      <div className="flex flex-col gap-3">
        {STREAMS.map(str => {
          const isSelected = state.boardStream === str.value;
          return (
            <button
              key={str.value}
              onClick={() => setState(prev => ({ ...prev, boardStream: str.value }))}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 min-h-[68px] ${
                isSelected
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <str.icon size={20} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold font-['Poppins'] ${isSelected ? "text-[#1E3A8A]" : "text-gray-900"}`}>{str.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{str.sub}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 bg-[#1E3A8A] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step — Select Medium
// ─────────────────────────────────────────────────────────────────────────────

function StepMedium({ state, setState }: { state: OnboardingState; setState: React.Dispatch<React.SetStateAction<OnboardingState>> }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-1">What's your medium of instruction?</h2>
      <p className="text-sm text-gray-500 mb-6">We'll show papers in your preferred language medium.</p>
      <div className="flex flex-col gap-3">
        {MEDIUMS.map(med => {
          const isSelected = state.boardMedium === med.value;
          return (
            <button
              key={med.value}
              onClick={() => setState(prev => ({ ...prev, boardMedium: med.value }))}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 min-h-[68px] ${
                isSelected
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <med.icon size={20} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold font-['Poppins'] ${isSelected ? "text-[#1E3A8A]" : "text-gray-900"}`}>{med.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{med.sub}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 bg-[#1E3A8A] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step — Select Competitive Exams
// ─────────────────────────────────────────────────────────────────────────────

function StepExams({ state, setState }: { state: OnboardingState; setState: React.Dispatch<React.SetStateAction<OnboardingState>> }) {
  const toggle = (cat: GoalCategory) => {
    setState(prev => {
      const already = prev.competitiveExams.includes(cat);
      return {
        ...prev,
        competitiveExams: already
          ? prev.competitiveExams.filter(c => c !== cat)
          : [...prev.competitiveExams, cat],
      };
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-1">Which competitive exam(s)?</h2>
      <p className="text-sm text-gray-500 mb-6">Select all exams you're preparing for. Most students pick 1–2.</p>
      <div className="flex flex-col gap-3">
        {COMPETITIVE_EXAMS.map(exam => {
          const isSelected = state.competitiveExams.includes(exam.value);
          return (
            <button
              key={exam.value}
              onClick={() => !exam.comingSoon && toggle(exam.value)}
              disabled={exam.comingSoon}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 min-h-[72px] relative overflow-hidden ${
                exam.comingSoon
                  ? "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
                  : isSelected ? "border-2 bg-opacity-5" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              style={!exam.comingSoon && isSelected ? { borderColor: exam.color, backgroundColor: `${exam.color}0D` } : {}}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                style={!exam.comingSoon && isSelected ? { backgroundColor: exam.color } : { backgroundColor: "#F1F5F9" }}
              >
                <exam.icon size={20} className={!exam.comingSoon && isSelected ? "text-white" : "text-gray-400"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className="text-sm font-semibold font-['Poppins']"
                    style={!exam.comingSoon && isSelected ? { color: exam.color } : { color: "#1E293B" }}
                  >
                    {exam.label}
                  </p>
                  {exam.comingSoon && (
                    <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-amber-900/40 animate-pulse" />
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{exam.sub}</p>
              </div>
              {!exam.comingSoon && isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: exam.color }}>
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step — Target Year
// ─────────────────────────────────────────────────────────────────────────────

function StepYear({ state, setState }: { state: OnboardingState; setState: React.Dispatch<React.SetStateAction<OnboardingState>> }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-1">Which year are you targeting?</h2>
      <p className="text-sm text-gray-500 mb-6">We'll set up your exam countdown and study plan accordingly.</p>
      <div className="grid grid-cols-2 gap-3">
        {TARGET_YEARS.map(yr => {
          const isSelected = state.targetYear === yr;
          const isCurrent = yr === new Date().getFullYear();
          const isNext = yr === new Date().getFullYear() + 1;
          return (
            <button
              key={yr}
              onClick={() => setState(prev => ({ ...prev, targetYear: yr }))}
              className={`p-4 rounded-2xl border-2 text-center transition-all duration-150 min-h-[80px] flex flex-col items-center justify-center ${
                isSelected
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className={`text-2xl font-bold font-['JetBrains_Mono'] ${isSelected ? "text-[#1E3A8A]" : "text-gray-900"}`}>{yr}</span>
              {(isCurrent || isNext) && (
                <span className={`text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                  isSelected ? "bg-[#1E3A8A]/15 text-[#1E3A8A]" : "bg-gray-100 text-gray-500"
                }`}>
                  {isCurrent ? "This year" : "Next year"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step — Select Subjects
// ─────────────────────────────────────────────────────────────────────────────

function StepSubjects({ state, setState }: { state: OnboardingState; setState: React.Dispatch<React.SetStateAction<OnboardingState>> }) {
  // Determine relevant goal categories
  const relevantCategories: GoalCategory[] = [];
  if (state.goalType === "board" || state.goalType === "both") {
    state.boardStandards.forEach(std => relevantCategories.push(`board-${std}` as GoalCategory));
  }
  if (state.goalType === "competitive" || state.goalType === "both") {
    state.competitiveExams.forEach(cat => relevantCategories.push(cat));
  }

  const relevantSubjects = subjects.filter(s => relevantCategories.includes(s.goalCategory));

  // Group by goalCategory
  const grouped: Record<string, typeof relevantSubjects> = {};
  relevantSubjects.forEach(s => {
    if (!grouped[s.goalCategory]) grouped[s.goalCategory] = [];
    grouped[s.goalCategory].push(s);
  });

  const toggle = (id: string) => {
    setState(prev => {
      const already = prev.selectedSubjectIds.includes(id);
      return {
        ...prev,
        selectedSubjectIds: already
          ? prev.selectedSubjectIds.filter(s => s !== id)
          : [...prev.selectedSubjectIds, id],
      };
    });
  };

  const selectAll = (ids: string[]) => {
    setState(prev => {
      const merged = Array.from(new Set([...prev.selectedSubjectIds, ...ids]));
      return { ...prev, selectedSubjectIds: merged };
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-1">Select your subjects</h2>
      <p className="text-sm text-gray-500 mb-5">Choose the subjects you're studying. We'll track your progress for each.</p>

      {Object.entries(grouped).map(([cat, subs]) => {
        const meta = GOAL_METADATA[cat as GoalCategory];
        const allSelected = subs.every(s => state.selectedSubjectIds.includes(s.id));
        return (
          <div key={cat} className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <GoalIcon category={cat as GoalCategory} size={13} className="text-gray-400" /> {meta.label}
              </span>
              <button
                onClick={() => selectAll(subs.map(s => s.id))}
                className="text-xs text-[#1E3A8A] font-medium hover:underline flex items-center gap-1"
              >
                {allSelected ? <><Check size={11} />All selected</> : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subs.map(sub => {
                const isSelected = state.selectedSubjectIds.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    onClick={() => toggle(sub.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-150 border ${
                      isSelected
                        ? "bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/30"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <SubjectIcon name={sub.name} size={14} className={isSelected ? "text-[#1E3A8A]" : "text-gray-400"} />
                    {sub.name}
                    {isSelected && <Check size={12} className="text-[#1E3A8A]" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {state.selectedSubjectIds.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          {state.selectedSubjectIds.length} subject{state.selectedSubjectIds.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
