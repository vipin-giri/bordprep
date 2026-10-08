import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Flag, Send, Brain, Target, Timer, BookOpen, Zap, TrendingUp, AlertTriangle, Lightbulb,
  Pause, Play, Plus, Grid, Bookmark, BookmarkCheck, Trophy, Star, ThumbsUp, Sparkles, Flame
} from "lucide-react";
import { useApp } from "../context/AppContext";
import type { QuizAttempt } from "../data/mockData";
import { startQuiz, submitQuizAttempt, type StudentQuiz, type StudentQuizQuestion } from "../../lib/api";

type SessionQuiz = StudentQuiz & { questions: StudentQuizQuestion[] };

function sessionQuizFromContext(
  activeQuizSession: { quiz: StudentQuiz; questions: StudentQuizQuestion[] } | null,
): SessionQuiz | null {
  if (!activeQuizSession) return null;
  return { ...activeQuizSession.quiz, questions: activeQuizSession.questions };
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Detail Page
// ─────────────────────────────────────────────────────────────────────────────

export function QuizDetail() {
  const { selectedQuizId, setView, setCurrentAttempt, setActiveQuizSession, studentQuizzes, studentContentLoading } = useApp();
  const [selectedMode, setSelectedMode] = useState<"practice" | "exam" | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const quiz = studentQuizzes.find(q => q.id === selectedQuizId);
  if (studentContentLoading && !quiz) {
    return <div className="text-center py-20 text-gray-400"><p>Loading quiz...</p></div>;
  }
  if (!quiz) return (
    <div className="text-center py-20">
      <Brain size={36} className="mx-auto mb-3 text-gray-200" />
      <p className="text-gray-400">Quiz not found.</p>
      <button onClick={() => setView("quizzes")} className="text-[#1E3A8A] mt-3 text-sm">← Back to Quizzes</button>
    </div>
  );

  const ms = quiz.markingScheme;

  const startQuizAttempt = async () => {
    if (!selectedMode || !quiz) return;
    setStartError("");
    setStarting(true);
    try {
      const { quiz: sessionQuiz, questions } = await startQuiz(quiz.id);
      setActiveQuizSession({
        quiz: { ...sessionQuiz, markingScheme: quiz.markingScheme },
        questions,
      });
      setCurrentAttempt({
        quizId: quiz.id,
        mode: selectedMode,
        answers: {},
        flagged: [],
        currentQuestionIndex: 0,
        startedAt: new Date().toISOString(),
      });
      setView("quiz-attempt");
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Could not start quiz.");
    } finally {
      setStarting(false);
    }
  };

  const diffColors: Record<string, string> = {
    easy:   "text-green-700 bg-green-50",
    medium: "text-amber-700 bg-amber-50",
    hard:   "text-red-700 bg-red-50",
    mixed:  "text-violet-700 bg-violet-50",
  };

  return (
    <div className="max-w-2xl mx-auto px-1 sm:px-0">
      <button onClick={() => setView("quizzes")} className="flex items-center gap-2 text-slate-500 hover:text-[#1E3A8A] mb-3 sm:mb-4 text-xs sm:text-sm font-medium min-h-[44px] cursor-pointer">
        <ArrowLeft size={16} /> Back to Quizzes
      </button>

      <div className="rounded-2xl p-4 sm:p-6 mb-5" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(30,58,138,0.06)" }}>
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 text-[10px] sm:text-xs font-medium">
          <span className={`px-2.5 py-0.5 sm:py-1 rounded-full capitalize font-semibold ${diffColors[quiz.difficulty] ?? diffColors.medium}`}>
            {quiz.difficulty}
          </span>
          <span className="bg-blue-50 text-[#1E3A8A] px-2.5 py-0.5 sm:py-1 rounded-full font-semibold">{quiz.subject}</span>
          {ms.hasNegativeMarking && (
            <span className="bg-red-50 text-red-600 px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 font-semibold border border-red-200/60">
              <Zap size={11} /> Negative Marking
            </span>
          )}
        </div>

        <h1 className="text-base sm:text-xl font-heading font-extrabold text-[#1E3A8A] mb-1 leading-snug tracking-tight">{quiz.title}</h1>
        <p className="text-slate-500 font-display text-xs sm:text-sm mb-4 sm:mb-5 font-medium">{quiz.chapter}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-5">
          {[
            { icon: Brain,  label: "Questions", value: quiz.questionsCount },
            { icon: Clock,  label: "Time Limit", value: `${quiz.timeLimitMinutes} min` },
            { icon: Target, label: "Max Marks",  value: quiz.totalMarks },
          ].map(s => (
            <div key={s.label} className="text-center bg-slate-50/80 border border-slate-100 rounded-xl p-2 sm:p-3 min-w-0">
              <s.icon size={16} className="mx-auto text-[#1E3A8A] mb-1 sm:mb-1.5" />
              <div className="font-extrabold text-xs sm:text-sm text-[#1E3A8A] font-heading truncate">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Marking scheme card */}
        <div className={`rounded-xl p-3.5 sm:p-4 mb-5 border ${ms.hasNegativeMarking ? "bg-red-50/80 border-red-200" : "bg-emerald-50/80 border-emerald-200"}`}>
          <p className={`text-xs font-extrabold mb-2 font-heading ${ms.hasNegativeMarking ? "text-red-800" : "text-emerald-800"}`}>
            {ms.label} — Marking Scheme
          </p>
          <div className="flex flex-wrap gap-2.5 sm:gap-4 items-center">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-emerald-600" />
              <span className="text-[11px] sm:text-xs text-emerald-700 font-bold">+{ms.correctMarks} correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle size={13} className="text-red-500" />
              <span className="text-[11px] sm:text-xs text-red-600 font-bold">{ms.wrongMarks} wrong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">0 skipped</span>
            </div>
          </div>
          {ms.hasNegativeMarking && (
            <p className="text-[10px] text-red-600 mt-2 flex items-center gap-1 font-medium">
              <AlertTriangle size={10} className="flex-shrink-0" /> Skip if unsure — wrong answer deducts {Math.abs(ms.wrongMarks)} mark{Math.abs(ms.wrongMarks) > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 sm:p-4 mb-5">
          <p className="text-xs font-bold text-[#1E3A8A] mb-1 font-heading">Instructions</p>
          <p className="text-xs text-blue-800 leading-relaxed font-display">{quiz.instructions}</p>
        </div>

        {/* Mode Selection Grid */}
        <h3 className="font-bold text-[#1E3A8A] font-heading text-xs sm:text-sm mb-3">Select Quiz Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-5">
          {([
            {
              mode: "practice" as const, icon: BookOpen,
              title: "Practice Mode",
              desc: "Instant feedback after each question. Best for learning concepts.",
              badge: "Recommended",
            },
            {
              mode: "exam" as const, icon: Timer,
              title: "Exam Mode",
              desc: "Timed. See results only after submitting. Real exam simulation.",
              badge: "",
            },
          ]).map(m => (
            <button
              key={m.mode}
              onClick={() => setSelectedMode(m.mode)}
              className={`border-2 rounded-xl p-3.5 sm:p-4 text-left transition-all cursor-pointer min-h-0 sm:min-h-[120px] ${
                selectedMode === m.mode ? "border-[#1E3A8A] bg-blue-50/70 shadow-xs" : "border-slate-200/80 hover:border-slate-300 bg-white/70"
              }`}
            >
              <m.icon size={20} className={`mb-2 ${selectedMode === m.mode ? "text-[#1E3A8A]" : "text-slate-400"}`} />
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={`text-xs sm:text-sm font-bold font-heading ${selectedMode === m.mode ? "text-[#1E3A8A]" : "text-slate-800"}`}>
                  {m.title}
                </span>
                {m.badge && <span className="text-[9px] sm:text-[10px] bg-[#F97316] text-white px-1.5 py-0.5 rounded-full font-bold">{m.badge}</span>}
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-display">{m.desc}</p>
            </button>
          ))}
        </div>

        {startError && <p className="text-red-500 text-sm mb-3">{startError}</p>}

        <button
          onClick={() => void startQuizAttempt()}
          disabled={!selectedMode || starting}
          className="w-full bg-[#1E3A8A] hover:bg-[#1D4ED8] disabled:bg-slate-200 disabled:text-slate-400 text-white py-3 sm:py-3.5 rounded-xl transition-all font-bold font-heading flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[48px] sm:min-h-[52px] cursor-pointer shadow-xs active:scale-95"
        >
          {starting ? "Starting..." : selectedMode ? `Start ${selectedMode === "practice" ? "Practice" : "Exam"} Mode` : "Select a mode to begin"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Attempt Page
// ─────────────────────────────────────────────────────────────────────────────

export function QuizAttempt() {
  const { currentAttempt, setCurrentAttempt, setView, addAttempt, activeQuizSession, setUser, user } = useApp();
  const quiz = sessionQuizFromContext(activeQuizSession);
  const [qIndex, setQIndex] = useState(currentAttempt?.currentQuestionIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D" | null>>(currentAttempt?.answers ?? {});
  const [flagged, setFlagged] = useState<string[]>(currentAttempt?.flagged ?? []);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuestionPalette, setShowQuestionPalette] = useState(false);
  const [timeLeft, setTimeLeft] = useState((quiz?.timeLimitMinutes ?? 15) * 60);
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const ms = quiz?.markingScheme;

  // Exam mode timer (pauses when isPaused === true)
  useEffect(() => {
    if (currentAttempt?.mode !== "exam" || isPaused || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentAttempt?.mode, isPaused, submitted]);

  // ── Score calculation with negative marking ──────────────────────────────

  const calculateScore = (ans: typeof answers) => {
    if (!quiz || !ms) return { totalScore: 0, correctCount: 0, wrongCount: 0, skippedCount: 0, negativeMarks: 0 };

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let negativeMarks = 0;

    quiz.questions.forEach(q => {
      const selected = ans[q.id];
      if (!selected || selected === null) {
        skippedCount++;
        // no marks for unattempted
      } else if (selected === q.correctOption) {
        correctCount++;
        totalScore += ms.correctMarks;
      } else {
        wrongCount++;
        const deduction = Math.abs(ms.wrongMarks);
        totalScore += ms.wrongMarks; // wrongMarks is already negative
        negativeMarks -= deduction;  // track total negative marks (as negative)
      }
    });

    // Score can't go below 0
    totalScore = Math.max(0, totalScore);

    return { totalScore, correctCount, wrongCount, skippedCount, negativeMarks };
  };

  // ── Real-time score display ──────────────────────────────────────────────

  const liveScore = calculateScore(answers);

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    if (submitted || !quiz || !currentAttempt || !ms) return;
    setSubmitted(true);
    setShowSubmitModal(false);

    const { totalScore, correctCount, wrongCount, skippedCount, negativeMarks } = calculateScore(answers);

    const attemptAnswers = quiz.questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? null,
      isCorrect: answers[q.id] === q.correctOption,
      marksAwarded: answers[q.id] === q.correctOption
        ? ms.correctMarks
        : answers[q.id]
        ? ms.wrongMarks
        : 0,
    }));

    const percentage = Math.round((totalScore / quiz.totalMarks) * 100);

    // Simple percentile estimate based on avgScore in mock data
    const avgPct = (quiz.analytics.avgScore / quiz.totalMarks) * 100;
    const percentile = percentage >= avgPct
      ? Math.round(50 + ((percentage - avgPct) / (100 - avgPct)) * 50)
      : Math.round((percentage / avgPct) * 50);

    const attempt: QuizAttempt = {
      id: `att_${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      subject: quiz.subject,
      goalCategory: quiz.goalCategory,
      mode: currentAttempt.mode,
      totalScore,
      maxScore: quiz.totalMarks,
      percentage,
      percentile: Math.min(99, Math.max(1, percentile)),
      correctCount,
      wrongCount,
      skippedCount,
      negativeMarks,
      timeTakenSeconds: (quiz.timeLimitMinutes * 60) - timeLeft,
      isCompleted: true,
      submittedAt: new Date().toISOString(),
      answers: attemptAnswers,
    };

    void (async () => {
      try {
        const saved = await submitQuizAttempt(quiz.id, {
          id: attempt.id,
          quizId: attempt.quizId,
          quizTitle: attempt.quizTitle,
          subject: attempt.subject,
          goalCategory: attempt.goalCategory,
          mode: attempt.mode,
          totalScore: attempt.totalScore,
          maxScore: attempt.maxScore,
          percentage: attempt.percentage,
          correctCount: attempt.correctCount,
          wrongCount: attempt.wrongCount,
          skippedCount: attempt.skippedCount,
          negativeMarks: attempt.negativeMarks,
          timeTakenSeconds: attempt.timeTakenSeconds,
        });
        addAttempt({ ...attempt, id: saved.attempt.id, submittedAt: saved.attempt.submittedAt });
        if (user) setUser({ ...user, streak: saved.streak });
      } catch {
        addAttempt(attempt);
      }
      setCurrentAttempt(null);
      setView("quiz-result");
    })();
  }, [answers, quiz, currentAttempt, timeLeft, submitted, ms, addAttempt, setCurrentAttempt, setView, setUser, user]);

  if (!quiz || !currentAttempt || !ms) return (
    <div className="text-center py-20">
      <Brain size={36} className="mx-auto mb-3 text-gray-200" />
      <p className="text-gray-400">No active quiz.</p>
      <button onClick={() => setView("quizzes")} className="text-[#1E3A8A] mt-3 text-sm">Back to Quizzes</button>
    </div>
  );

  const q = quiz.questions[qIndex];
  const isPractice = currentAttempt.mode === "practice";
  const hasAnswered = q.id in answers && answers[q.id] !== null;
  const selectedOpt = answers[q.id];
  const isCorrect = selectedOpt === q.correctOption;
  const isFlagged = flagged.includes(q.id);
  const isBookmarkedQuestion = bookmarkedQuestions.includes(q.id);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerWarning = timeLeft < 120;
  const answeredCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;

  const optionLabels = ["A", "B", "C", "D"] as const;
  const optionTexts = [q.optionA, q.optionB, q.optionC, q.optionD];

  const getOptionStyle = (opt: "A" | "B" | "C" | "D") => {
    if (!isPractice) {
      return selectedOpt === opt
        ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]"
        : "border-gray-200 hover:border-gray-300 text-gray-700";
    }
    if (!hasAnswered) return "border-gray-200 hover:border-[#1E3A8A] hover:bg-blue-50 text-gray-700 cursor-pointer";
    if (opt === q.correctOption) return "border-green-400 bg-green-50 text-green-700";
    if (opt === selectedOpt && !isCorrect) return "border-red-400 bg-red-50 text-red-600";
    return "border-gray-100 bg-gray-50 text-gray-400";
  };

  const selectAnswer = (opt: "A" | "B" | "C" | "D") => {
    if (isPractice && hasAnswered) return;
    setAnswers(prev => ({ ...prev, [q.id]: opt }));
  };

  const toggleFlag = () => {
    setFlagged(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]);
  };

  const toggleQuestionBookmark = () => {
    setBookmarkedQuestions(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]);
  };

  // Unanswered count for submit warning
  const unansweredCount = quiz.questions.length - answeredCount;

  return (
    <div className="max-w-2xl mx-auto relative">

      {/* ── Top Bar Controls ── */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{isPractice ? "Practice Mode" : "Exam Mode"}</p>
          <h3 className="text-sm font-semibold text-[#1E3A8A] font-['Poppins'] truncate">{quiz.title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Question Grid Jumper Toggle Button */}
          <button
            onClick={() => setShowQuestionPalette(p => !p)}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              showQuestionPalette ? "bg-blue-100 border-blue-300 text-[#1E3A8A]" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
            title="Toggle Question Palette"
          >
            <Grid size={15} />
            <span className="hidden sm:inline">Palette</span>
          </button>

          {/* Live score */}
          {ms.hasNegativeMarking && (
            <div className="text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono">
              <span className="text-green-600 font-bold">+{liveScore.correctCount * ms.correctMarks}</span>
              {liveScore.negativeMarks < 0 && <span className="text-red-500 font-bold ml-1">{liveScore.negativeMarks}</span>}
              <span className="text-gray-400"> / {quiz.totalMarks}</span>
            </div>
          )}

          {/* Timer Controls */}
          {!isPractice && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPaused(p => !p)}
                className="p-1.5 rounded-xl border border-blue-200 bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 transition-colors"
                title={isPaused ? "Resume Timer" : "Pause Timer"}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>

              <button
                onClick={() => setTimeLeft(t => t + 300)}
                className="px-2 py-1 rounded-xl border border-blue-200 bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 text-xs font-bold transition-colors flex items-center gap-0.5"
                title="Add +5 Minutes Extra Time"
              >
                <Plus size={12} />5m
              </button>

              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-bold font-mono ${timerWarning ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-[#1E3A8A]"}`}>
                <Clock size={14} />
                {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Question Palette Drawer (Collapsible) ── */}
      {showQuestionPalette && (
        <div className="rounded-2xl p-4 mb-4 bg-white/95 backdrop-blur-md border border-blue-100 shadow-md animate-apple-unveil">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Question Palette</span>
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] inline-block" /> Answered</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" /> Unanswered</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" /> Flagged</span>
            </div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {quiz.questions.map((qn, idx) => {
              const ansed = qn.id in answers && answers[qn.id] !== null;
              const isF = flagged.includes(qn.id);
              const isB = bookmarkedQuestions.includes(qn.id);
              const isCur = idx === qIndex;

              return (
                <button
                  key={qn.id}
                  onClick={() => { setQIndex(idx); setShowQuestionPalette(false); }}
                  className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center relative transition-all ${
                    isCur ? "ring-2 ring-blue-600 ring-offset-1" : ""
                  } ${
                    isF ? "bg-orange-100 text-orange-700 border border-orange-300" :
                    isB ? "bg-amber-100 text-amber-800 border border-amber-300" :
                    ansed ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                  {isF && <Flag size={8} className="absolute top-1 right-1 text-orange-600" />}
                  {isB && <Bookmark size={8} className="absolute bottom-1 right-1 text-amber-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Progress bar ── */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Q {qIndex + 1} of {quiz.questions.length}</span>
          <span className="text-xs text-gray-500">{answeredCount} answered · {unansweredCount} remaining</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E3A8A] rounded-full transition-all duration-300"
            style={{ width: `${((qIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Question Card (with Blur Overlay if Paused) ── */}
      <div className="rounded-2xl p-5 mb-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
        
        {/* Paused Screen Blur Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 animate-apple-unveil">
            <Pause size={36} className="text-[#1E3A8A] mb-2 animate-bounce" />
            <h4 className="font-bold text-[#1E3A8A] text-lg mb-1 font-['Poppins']">Quiz Paused</h4>
            <p className="text-xs text-gray-500 mb-4 max-w-xs">Your exam timer is frozen. Click Resume below to return to your questions.</p>
            <button
              onClick={() => setIsPaused(false)}
              className="bg-[#1E3A8A] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Play size={14} /> Resume Quiz
            </button>
          </div>
        )}

        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs text-gray-400">Question {qIndex + 1}</span>
              <span className="text-xs bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded-full font-medium">
                +{ms.correctMarks} / {ms.wrongMarks}
              </span>
              {isFlagged && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Flag size={11} /> Flagged</span>}
              {isBookmarkedQuestion && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Bookmark size={11} /> Saved</span>}
            </div>
            <p className="text-gray-800 leading-relaxed text-[15px]">{q.text}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={toggleQuestionBookmark}
              className={`p-2 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${isBookmarkedQuestion ? "bg-amber-50 text-amber-600" : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"}`}
              aria-label="Save question"
              title="Save for review"
            >
              {isBookmarkedQuestion ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <button
              onClick={toggleFlag}
              className={`p-2 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${isFlagged ? "bg-orange-50 text-orange-500" : "text-gray-300 hover:text-orange-400 hover:bg-orange-50"}`}
              aria-label={isFlagged ? "Unflag question" : "Flag for review"}
              title="Flag question"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {optionLabels.map((opt, i) => (
            <button
              key={opt}
              onClick={() => selectAnswer(opt)}
              disabled={isPractice && hasAnswered}
              className={`w-full text-left flex items-center gap-3 p-4 border-2 rounded-xl transition-all disabled:cursor-default ${getOptionStyle(opt)}`}
            >
              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0 font-bold font-['Poppins'] ${selectedOpt === opt || (isPractice && hasAnswered && opt === q.correctOption) ? "border-current" : "border-gray-300 text-gray-400"}`}>
                {opt}
              </span>
              <span className="text-sm leading-snug flex-1">{optionTexts[i]}</span>
              {isPractice && hasAnswered && opt === q.correctOption && <CheckCircle size={16} className="ml-auto text-green-500 flex-shrink-0" />}
              {isPractice && hasAnswered && opt === selectedOpt && !isCorrect && <XCircle size={16} className="ml-auto text-red-500 flex-shrink-0" />}
            </button>
          ))}
        </div>

        {/* Practice feedback */}
        {isPractice && hasAnswered && (
          <div className={`mt-4 p-4 rounded-xl border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? <CheckCircle size={15} className="text-green-600" /> : <XCircle size={15} className="text-red-600" />}
              <div>
                <span className={`font-semibold text-sm font-['Poppins'] ${isCorrect ? "text-green-800" : "text-red-700"}`}>
                  {isCorrect ? `Correct! +${ms.correctMarks} mark${ms.correctMarks > 1 ? "s" : ""}` : `Wrong! ${ms.wrongMarks} mark${Math.abs(ms.wrongMarks) > 1 ? "s" : ""}`}
                </span>
                {!isCorrect && <span className="text-xs text-red-600 ml-1">Correct: {q.correctOption}</span>}
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => { setQIndex(i => i - 1); }}
          disabled={qIndex === 0}
          className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors min-h-[48px]"
        >
          <ChevronLeft size={16} /> Prev
        </button>

        {qIndex < quiz.questions.length - 1 ? (
          <button
            onClick={() => { setQIndex(i => i + 1); }}
            className="flex-1 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[48px]"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => isPractice ? handleSubmit() : setShowSubmitModal(true)}
            className="flex-1 bg-[#F97316] hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[48px]"
          >
            <Send size={15} /> Finish Quiz
          </button>
        )}
      </div>

      {/* ── Question Navigator ── */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
        <p className="text-xs text-gray-500 mb-3 font-medium">Question Navigator</p>
        <div className="flex flex-wrap gap-1.5">
          {quiz.questions.map((question, i) => {
            const answered = answers[question.id] != null;
            const qFlagged = flagged.includes(question.id);
            return (
              <button
                key={question.id}
                onClick={() => setQIndex(i)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  i === qIndex
                    ? "bg-[#1E3A8A] text-white"
                    : answered
                    ? "bg-blue-100 text-[#1E3A8A] border border-blue-300"
                    : qFlagged
                    ? "bg-orange-50 text-orange-500 border border-orange-200"
                    : "bg-gray-50 text-gray-400 border border-gray-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block" /> Answered</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-50 border border-gray-200 inline-block" /> Not answered</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-50 border border-orange-200 inline-block" /> Flagged</span>
        </div>
      </div>

      {/* Exam mode submit button */}
      {!isPractice && (
        <button
          onClick={() => setShowSubmitModal(true)}
          className="w-full mt-4 bg-[#F97316] hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors min-h-[52px]"
        >
          <Send size={16} /> Submit All Answers
        </button>
      )}

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSubmitModal(false)} />
          <div className="relative rounded-2xl p-6 max-w-sm w-full" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
            <h3 className="font-bold text-gray-900 font-['Poppins'] text-lg mb-1">Submit Quiz?</h3>
            {unansweredCount > 0 ? (
              <p className="text-sm text-amber-700 mb-4 flex items-start gap-2">
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-amber-500" />
                You have <strong>{unansweredCount}</strong> unanswered question{unansweredCount > 1 ? "s" : ""}. Skipped questions score 0.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">All {quiz.questions.length} questions answered. Ready to submit?</p>
            )}
            {ms.hasNegativeMarking && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-700">
                <strong>Score so far:</strong> {liveScore.totalScore} / {quiz.totalMarks}
                {liveScore.negativeMarks < 0 && ` (${liveScore.negativeMarks} negative deductions)`}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Keep Going
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#F97316] hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Result Page  
// ─────────────────────────────────────────────────────────────────────────────

export function QuizResult() {
  const { completedAttempts, lastAttemptId, setView, setSelectedQuizId, setCurrentAttempt, studentQuizzes } = useApp();

  // Use lastAttemptId to find the correct attempt
  const attempt = lastAttemptId
    ? completedAttempts.find(a => a.id === lastAttemptId) ?? completedAttempts[0]
    : completedAttempts[0];
  const quiz = studentQuizzes.find(q => q.id === attempt?.quizId);

  if (!attempt || !quiz) return (
    <div className="text-center py-20">
      <p className="text-gray-400">No result available.</p>
      <button onClick={() => setView("quizzes")} className="text-[#1E3A8A] mt-3 text-sm">Back to Quizzes</button>
    </div>
  );

  const pct = attempt.percentage;
  const passed = pct >= 40; // lower threshold for competitive exams
  const mins = Math.floor(attempt.timeTakenSeconds / 60);
  const secs = attempt.timeTakenSeconds % 60;
  const ms = quiz.markingScheme;

  // Score breakdown
  const grossScore = attempt.correctCount * ms.correctMarks;
  const netScore = attempt.totalScore;

  const ResultIcon = pct >= 90 ? Trophy : pct >= 75 ? Star : pct >= 60 ? ThumbsUp : pct >= 40 ? BookOpen : Flame;

  return (
    <div className="max-w-lg mx-auto space-y-4">

      {/* ── Score Card ── */}
      <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? "bg-green-100" : "bg-red-100"}`}>
          {passed ? <CheckCircle size={36} className="text-green-600" /> : <XCircle size={36} className="text-red-500" />}
        </div>

        {/* Celebratory confetti animation banner */}
        {pct >= 80 && (
          <div className="mb-4 bg-gradient-to-r from-amber-500 via-orange-500 to-[#1E3A8A] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-lg animate-bounce flex items-center justify-center gap-2">
            <Sparkles size={14} /> <span>MASTERCLASS PERFORMANCE! You scored {pct}%!</span> <Sparkles size={14} />
          </div>
        )}

        <div className="flex justify-center mb-1 text-[#1E3A8A]"><ResultIcon size={36} /></div>

        <h1 className={`text-2xl font-bold font-['Poppins'] mb-1 ${passed ? "text-green-700" : "text-red-600"}`}>
          {pct >= 90 ? "Outstanding!" : pct >= 75 ? "Excellent!" : pct >= 60 ? "Good Job!" : pct >= 40 ? "Keep Practicing!" : "Don't Give Up!"}
        </h1>
        <p className="text-gray-500 text-sm mb-5">{quiz.title}</p>

        {/* Circular score gauge */}
        <div className="relative w-36 h-36 mx-auto mb-5">
          <svg className="w-36 h-36 -rotate-90">
            <circle cx="72" cy="72" r="62" fill="none" stroke="#F1F5F9" strokeWidth="10" />
            <circle
              cx="72" cy="72" r="62" fill="none"
              stroke={pct >= 60 ? "#16A34A" : pct >= 40 ? "#F59E0B" : "#DC2626"}
              strokeWidth="10"
              strokeDasharray={`${(pct / 100) * 389.56} 389.56`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-['Poppins'] ${pct >= 60 ? "text-green-700" : pct >= 40 ? "text-amber-600" : "text-red-600"}`}>
              {pct}%
            </span>
            <span className="text-xs text-gray-400">{attempt.totalScore}/{attempt.maxScore}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Correct",  value: attempt.correctCount,  color: "text-green-600 bg-green-50" },
            { label: "Wrong",    value: attempt.wrongCount,    color: "text-red-500   bg-red-50" },
            { label: "Skipped",  value: attempt.skippedCount,  color: "text-gray-500  bg-gray-50" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
              <div className="text-2xl font-bold font-['Poppins']">{s.value}</div>
              <div className="text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Score breakdown (negative marking) */}
        {ms.hasNegativeMarking && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left text-sm">
            <p className="font-semibold text-gray-800 font-['Poppins'] mb-2 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Score Breakdown
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Correct × +{ms.correctMarks}</span>
                <span className="font-semibold text-green-600">+{grossScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wrong × {ms.wrongMarks}</span>
                <span className="font-semibold text-red-500">{attempt.negativeMarks}</span>
              </div>
              <div className="border-t border-gray-200 pt-1 flex justify-between">
                <span className="font-semibold text-gray-700">Net Score</span>
                <span className="font-bold text-[#1E3A8A]">{netScore} / {quiz.totalMarks}</span>
              </div>
            </div>
          </div>
        )}

        {/* Percentile */}
        {attempt.percentile && (
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 mb-5 flex items-center gap-3">
            <TrendingUp size={18} className="text-violet-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-bold text-violet-800 font-['Poppins']">Percentile: {attempt.percentile}th</p>
              <p className="text-xs text-violet-600">You scored better than {attempt.percentile}% of students</p>
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-center gap-3 text-sm text-gray-400 mb-6 bg-gray-50 rounded-xl p-3">
          <Clock size={14} />
          <span>{mins}m {secs}s</span>
          <span>·</span>
          <span className="capitalize">{attempt.mode} mode</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setView("quiz-review")}
            className="w-full bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-semibold font-['Poppins'] transition-colors"
          >
            Review Answers
          </button>
          <button
            onClick={() => {
              setSelectedQuizId(quiz.id);
              setCurrentAttempt({
                quizId: quiz.id,
                mode: attempt.mode,
                answers: {},
                flagged: [],
                currentQuestionIndex: 0,
                startedAt: new Date().toISOString(),
              });
              setView("quiz-attempt");
            }}
            className="w-full border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 py-3 rounded-xl transition-colors"
          >
            Reattempt Quiz
          </button>
          <button onClick={() => setView("quizzes")} className="text-gray-400 hover:text-gray-600 text-sm py-2">
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Review Page
// ─────────────────────────────────────────────────────────────────────────────

export function QuizReview() {
  const { completedAttempts, lastAttemptId, setView, activeQuizSession, studentQuizzes } = useApp();

  const attempt = lastAttemptId
    ? completedAttempts.find(a => a.id === lastAttemptId) ?? completedAttempts[0]
    : completedAttempts[0];
  const sessionQuiz = sessionQuizFromContext(activeQuizSession);
  const quiz = sessionQuiz?.id === attempt?.quizId
    ? sessionQuiz
    : null;

  if (!attempt || !quiz) return (
    <div className="text-center py-20">
      <p className="text-gray-400">No review available.</p>
      <button onClick={() => setView("quizzes")} className="text-[#1E3A8A] mt-3 text-sm">Back</button>
    </div>
  );

  const ms = quiz.markingScheme;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => setView("quiz-result")} className="flex items-center gap-2 text-gray-500 hover:text-[#1E3A8A] mb-4 text-sm min-h-[44px]">
        <ArrowLeft size={16} /> Back to Result
      </button>
      <h2 className="text-xl font-bold text-[#1E3A8A] font-['Poppins'] mb-5">Answer Review</h2>

      <div className="space-y-4">
        {quiz.questions.map((q, i) => {
          const ans = attempt.answers.find(a => a.questionId === q.id);
          const selected = ans?.selectedOption ?? null;
          const correct = q.correctOption;
          const isRight = selected === correct;
          const skipped = !selected;
          const optionTexts = [q.optionA, q.optionB, q.optionC, q.optionD];
          const optLabels = ["A", "B", "C", "D"] as const;

          const marksAwarded = ans?.marksAwarded ?? 0;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${
                isRight ? "border-green-200" : skipped ? "border-gray-200" : "border-red-200"
              }`}
            >
              {/* Question header */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs text-gray-400 font-mono">Q{i + 1}</span>
                {skipped ? (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Skipped · 0 marks</span>
                ) : isRight ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Correct · +{marksAwarded}
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <XCircle size={10} /> Wrong · {marksAwarded}
                  </span>
                )}
              </div>

              <p className="text-gray-800 text-sm mb-3 leading-relaxed">{q.text}</p>

              {/* Options */}
              <div className="space-y-1.5 mb-3">
                {optLabels.map((opt, j) => (
                  <div
                    key={opt}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${
                      opt === correct
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : opt === selected && !isRight
                        ? "bg-red-50 border border-red-200 text-red-600"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 border font-bold font-['Poppins']" style={{ borderColor: "currentColor" }}>
                      {opt}
                    </span>
                    <span className="flex-1">{optionTexts[j]}</span>
                    {opt === correct && <CheckCircle size={13} className="ml-auto text-green-500 flex-shrink-0" />}
                    {opt === selected && !isRight && <XCircle size={13} className="ml-auto text-red-500 flex-shrink-0" />}
                  </div>
                ))}
              </div>

              {/* Explanation & ParikshaAI Doubt Assistant */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800 leading-relaxed space-y-2">
                <div className="flex items-center justify-between font-semibold text-[#1E3A8A] text-xs">
                  <span className="flex items-center gap-1.5 font-['Poppins']">
                    <Brain size={14} className="text-[#1E3A8A]" /> ParikshaAI Tutor Explanation
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">English & Marathi Step-by-Step</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{q.explanation}</p>
                <div className="pt-1.5 border-t border-blue-100/80 text-[11px] text-gray-500 italic">
                  <Lightbulb size={13} className="inline text-amber-500 mr-1" /> <span className="font-semibold text-gray-700">Exam Tip:</span> Standard Maharashtra board questions test formula application directly. Verify units before final calculation.
                </div>
              </div>
            </div>
          );
        })}
      </div>


      <div className="py-6 flex justify-center">
        <button
          onClick={() => setView("quiz-result")}
          className="bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-semibold font-['Poppins'] text-sm"
        >
          Back to Result
        </button>
      </div>
    </div>
  );
}
