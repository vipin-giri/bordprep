import { Flame, BookOpen, Brain, Star, TrendingUp, ChevronRight, Bell, Zap, Target, Trophy, CheckCircle, Play, MessageCircle } from "lucide-react";
import { GoalIcon } from "../shared/GoalIcons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DIFFICULTY_CONFIG } from "../data/mockData";
import type { GoalCategory } from "../data/mockData";
import { useApp } from "../context/AppContext";
import { useEffect, useMemo } from "react";

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06), 0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon size={18} className={color} />
      </div>
      <div className="text-2xl font-bold font-['Poppins'] text-[#1E3A8A]">{value}</div>
      <div className="text-gray-500 text-xs leading-tight">{label}</div>
    </div>
  );
}

function CountdownBanner({ days, label, category }: { days: number; label: string; color?: string; category: GoalCategory }) {
  const urgency = days <= 30 ? "red" : days <= 90 ? "orange" : "blue";
  const bg = urgency === "red" ? "from-red-600 to-red-500" : urgency === "orange" ? "from-orange-500 to-amber-500" : "from-[#1E3A8A] to-blue-600";
  return (
    <div className={`bg-gradient-to-r ${bg} rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden`}>
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10">
        <GoalIcon category={category} size={22} className="text-white" />
      </div>
      <div className="flex-1 relative z-10">
        <p className="text-white/80 text-xs font-medium">{label}</p>
        <p className="text-white text-2xl font-bold font-['Poppins']">{days} <span className="text-base font-medium">days left</span></p>
      </div>
      <div className="text-right hidden sm:block relative z-10">
        <p className="text-white/70 text-xs">Stay consistent</p>
        <p className="text-white text-xs font-semibold flex items-center gap-1 justify-end"><Flame size={12} className="text-orange-300" /> Keep going!</p>
      </div>
    </div>
  );
}

function dayKey(date: string | Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function computeStudyStreak(dates: string[]) {
  const days = new Set(dates.map(dayKey));
  if (!days.size) return 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function Dashboard() {
  const {
    user, currentGoal, setView, setSelectedQuizId, setSelectedPaperId,
    completedAttempts, studentPapers, studentQuizzes, studentAnnouncements,
    studentContentLoading, refreshStudentContent,
  } = useApp();

  useEffect(() => {
    void refreshStudentContent();
  }, [refreshStudentContent]);

  const cat = currentGoal?.category;

  const visibleQuizzes = useMemo(() => {
    const matched = studentQuizzes.filter(q => !cat || q.goalCategory === cat);
    return matched.length ? matched : studentQuizzes;
  }, [studentQuizzes, cat]);

  const visiblePapers = useMemo(() => {
    const matched = studentPapers.filter(p => !cat || p.goalCategory === cat);
    return matched.length ? matched : studentPapers;
  }, [studentPapers, cat]);

  const activeAnnouncements = studentAnnouncements.filter(a => {
    if (a.targetGoals.includes("all")) return true;
    if (!cat) return true;
    return a.targetGoals.includes(cat);
  });

  const recentQuizzes = visibleQuizzes.slice(0, 3);
  const recentPapers = visiblePapers.slice(0, 3);

  const goalAttempts = completedAttempts.filter(a => !cat || a.goalCategory === cat);
  const avgScore = goalAttempts.length > 0
    ? Math.round(goalAttempts.reduce((sum, a) => sum + a.percentage, 0) / goalAttempts.length)
    : 0;

  const studyStreak = computeStudyStreak(completedAttempts.map(a => a.submittedAt));
  const attemptedQuizIds = new Set(goalAttempts.map(a => a.quizId));
  const quizzesAttempted = visibleQuizzes.filter(q => attemptedQuizIds.has(q.id)).length;
  const coveragePct = visibleQuizzes.length > 0
    ? Math.round((quizzesAttempted / visibleQuizzes.length) * 100)
    : 0;

  const daysLeft = currentGoal?.examDate
    ? Math.max(0, Math.ceil((new Date(currentGoal.examDate).getTime() - Date.now()) / 86400000))
    : null;

  const trendData = goalAttempts.length >= 2
    ? [...goalAttempts].slice(0, 6).reverse().map(a => ({
        date: new Date(a.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        score: Math.round(a.percentage),
      }))
    : [];

  const lastAttempt = goalAttempts[0] ?? null;
  const isNEETorJEE = cat === "neet" || cat === "jee-mains" || cat === "jee-advanced";

  const nextQuiz = visibleQuizzes.find(q => !attemptedQuizIds.has(q.id)) ?? visibleQuizzes[0] ?? null;
  const nextPaper = visiblePapers[0] ?? null;

  const subjectCoverage = useMemo(() => {
    const bySubject = new Map<string, { attempts: number; best: number }>();
    for (const quiz of visibleQuizzes) {
      const key = quiz.subject || "General";
      if (!bySubject.has(key)) bySubject.set(key, { attempts: 0, best: 0 });
    }
    for (const attempt of goalAttempts) {
      const key = attempt.subject || "General";
      const current = bySubject.get(key) ?? { attempts: 0, best: 0 };
      current.attempts += 1;
      current.best = Math.max(current.best, Math.round(attempt.percentage));
      bySubject.set(key, current);
    }
    return [...bySubject.entries()].slice(0, 6).map(([subject, stats]) => ({ subject, ...stats }));
  }, [visibleQuizzes, goalAttempts]);

  const practiceTopics = useMemo(() => {
    const topics = [
      ...visibleQuizzes.map(q => q.chapter || q.subject),
      ...visiblePapers.map(p => p.subject),
    ].map(t => String(t || "").trim()).filter(Boolean);
    return [...new Set(topics)].slice(0, 8);
  }, [visibleQuizzes, visiblePapers]);

  const shareMessage = studyStreak > 0
    ? `I am on a ${studyStreak}-day study streak preparing for ${currentGoal?.shortLabel ?? "my exams"} on ParikshaCrack!`
    : `I am preparing for ${currentGoal?.shortLabel ?? "my exams"} on ParikshaCrack!`;

  const todayTasks = [
    {
      id: "quiz",
      title: nextQuiz ? (attemptedQuizIds.has(nextQuiz.id) ? "Retake a live quiz" : "Take a live quiz") : "No quizzes yet",
      desc: nextQuiz ? nextQuiz.title : "Published quizzes will appear here.",
      actionText: nextQuiz ? "Start quiz" : "Browse quizzes",
      done: Boolean(nextQuiz && attemptedQuizIds.has(nextQuiz.id) && lastAttempt),
      action: () => {
        if (nextQuiz) {
          setSelectedQuizId(nextQuiz.id);
          setView("quiz-detail");
        } else {
          setView("quizzes");
        }
      },
    },
    {
      id: "paper",
      title: nextPaper ? "Open a published paper" : "No papers yet",
      desc: nextPaper ? `${nextPaper.title}${nextPaper.year ? ` · ${nextPaper.year}` : ""}` : "Admin-uploaded papers will appear here.",
      actionText: nextPaper ? "Open paper" : "Browse papers",
      done: false,
      action: () => {
        if (nextPaper) {
          setSelectedPaperId(nextPaper.id);
          setView("paper-detail");
        } else {
          setView("papers");
        }
      },
    },
    {
      id: "review",
      title: lastAttempt ? "Review your last attempt" : "Track your first score",
      desc: lastAttempt
        ? `${lastAttempt.quizTitle} · ${Math.round(lastAttempt.percentage)}%`
        : "Complete a quiz to see your real score here.",
      actionText: lastAttempt ? "View quizzes" : "Take a quiz",
      done: Boolean(lastAttempt),
      action: () => setView("quizzes"),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${currentGoal?.color ?? "#1E3A8A"} 0%, #1D4ED8 100%)` }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -right-2 top-8 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold font-['Poppins'] truncate">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-white/80 text-sm flex items-center gap-1.5">
                {currentGoal ? <GoalIcon category={currentGoal.category} size={14} className="text-white/80" /> : null}
                {currentGoal?.shortLabel ?? "Complete onboarding to personalise your dashboard"}
              </span>
              {currentGoal?.examDate && (
                <span className="text-white/60 text-xs">· {daysLeft} days left</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-2 flex-shrink-0">
            <Flame size={16} className="text-orange-300" />
            <span className="font-bold text-sm">{studyStreak}</span>
            <span className="text-white/70 text-xs hidden sm:block">streak</span>
          </div>
        </div>

        <div className="relative mt-4 flex gap-2 flex-wrap items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setView("quizzes")}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm transition-all font-medium min-h-[40px] cursor-pointer"
            >
              <Brain size={15} /> Take a Quiz
            </button>
            <button
              onClick={() => setView("papers")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-all min-h-[40px] cursor-pointer"
            >
              <BookOpen size={15} /> Browse Papers
            </button>
          </div>
          <button
            onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, "_blank")}
            className="flex items-center gap-1.5 bg-green-500/80 hover:bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <MessageCircle size={13} /> Share on WhatsApp
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(30,58,138,0.06)" }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today’s study plan</p>
            <h3 className="font-extrabold text-[#1E3A8A] text-sm sm:text-base font-heading mt-1">
              {currentGoal?.shortLabel ?? "Your live content"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {studentContentLoading
                ? "Loading your papers and quizzes…"
                : `${visiblePapers.length} papers · ${visibleQuizzes.length} quizzes · ${goalAttempts.length} attempts`}
            </p>
          </div>
          <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={12} className="text-emerald-600" />
            {coveragePct}% quizzes attempted
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 p-0.5 border border-slate-200/50">
          <div
            className="h-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${coveragePct}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {todayTasks.map((t, idx) => (
            <div
              key={t.id}
              className={`group p-3.5 rounded-2xl border flex flex-col justify-between ${
                t.done ? "bg-emerald-50/80 border-emerald-200/90" : "bg-white/90 border-slate-200/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">Task {idx + 1}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    t.done ? "bg-emerald-600 text-white" : "bg-amber-50 text-amber-700 border border-amber-200/80"
                  }`}>
                    {t.done ? "Done" : "Open"}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{t.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">{t.desc}</p>
              </div>
              <button
                onClick={t.action}
                className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-[#1E3A8A] text-white hover:bg-[#1D4ED8] cursor-pointer w-fit"
              >
                <Play size={10} className="fill-current" />
                {t.actionText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {daysLeft !== null && daysLeft <= 180 && currentGoal && (
        <CountdownBanner days={daysLeft} label={currentGoal.label} category={currentGoal.category} />
      )}

      {lastAttempt && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 font-['Poppins'] truncate">Last attempt: {lastAttempt.quizTitle}</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Score: {lastAttempt.totalScore}/{lastAttempt.maxScore} ({Math.round(lastAttempt.percentage)}%)
              {lastAttempt.negativeMarks < 0 && ` · -${Math.abs(lastAttempt.negativeMarks)} negative`}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedQuizId(lastAttempt.quizId);
              setView("quiz-detail");
            }}
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors min-h-[36px]"
          >
            Practice Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Papers Available" value={visiblePapers.length} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Brain} label="Live Quizzes" value={visibleQuizzes.length} color="text-violet-600" bg="bg-violet-50" />
        <StatCard icon={Star} label="Avg. Score" value={avgScore > 0 ? `${avgScore}%` : "—"} color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={Flame} label="Study Streak" value={studyStreak} color="text-red-500" bg="bg-red-50" />
      </div>

      {isNEETorJEE && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <Target size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 font-['Poppins']">Negative Marking Active</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {cat === "neet" ? "NEET: +4 correct, −1 wrong. Skip if unsure." :
               cat === "jee-advanced" ? "JEE Advanced: +3 correct, −1 wrong." :
               "JEE Mains: +4 correct, −1 wrong. Numericals carry no negative."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] mb-4 flex items-center gap-2 text-sm">
            <TrendingUp size={16} /> Score Trend
          </h3>
          {trendData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12, padding: "4px 10px" }}
                  formatter={(v: any) => [`${v}%`, "Score"]}
                />
                <Line
                  type="monotone" dataKey="score"
                  stroke={currentGoal?.color ?? "#1E3A8A"} strokeWidth={2.5}
                  dot={{ fill: currentGoal?.color ?? "#1E3A8A", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
              <TrendingUp size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Take at least two quizzes to see your trend</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] mb-4 flex items-center gap-2 text-sm">
            <Target size={16} /> Subject Coverage
          </h3>
          {subjectCoverage.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
              <Brain size={32} className="mb-2 opacity-30" />
              <p className="text-sm text-center">No published quizzes{currentGoal ? ` for ${currentGoal.shortLabel}` : ""} yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjectCoverage.map(item => (
                <div key={item.subject}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium truncate max-w-[60%]">{item.subject}</span>
                    <span className="text-gray-500 flex-shrink-0">{item.attempts} attempt{item.attempts !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.best}%`,
                        background: item.best >= 70 ? "#16A34A" : item.best >= 40 ? (currentGoal?.color ?? "#1E3A8A") : "#F97316",
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{item.best > 0 ? `${item.best}% best score` : "Not attempted"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {goalAttempts.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] mb-4 flex items-center gap-2 text-sm">
            <Trophy size={16} /> Recent Attempts
          </h3>
          <div className="space-y-2">
            {goalAttempts.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain size={15} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{a.quizTitle}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(a.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {a.correctCount} correct · {a.wrongCount} wrong
                  </p>
                </div>
                <span className="text-sm font-bold text-[#1E3A8A]">{Math.round(a.percentage)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAnnouncements.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] mb-4 flex items-center gap-2 text-sm">
            <Bell size={16} /> Announcements
          </h3>
          <div className="space-y-3">
            {activeAnnouncements.slice(0, 3).map(a => (
              <div
                key={a.id}
                className={`rounded-xl p-4 border-l-4 ${
                  a.priority === "urgent" ? "bg-red-50 border-l-red-400" :
                  a.priority === "important" ? "bg-amber-50 border-l-amber-400" :
                  "bg-blue-50 border-l-[#1E3A8A]/40"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 font-['Poppins'] leading-snug">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{a.body}</p>
                  </div>
                  {a.priority !== "normal" && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      a.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {a.priority.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] text-sm">Live Quizzes</h3>
            <button onClick={() => setView("quizzes")} className="text-[#1E3A8A] text-xs flex items-center gap-1 hover:underline">
              View all <ChevronRight size={12} />
            </button>
          </div>
          {recentQuizzes.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Brain size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No published quizzes{currentGoal ? ` for ${currentGoal.shortLabel}` : ""} yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentQuizzes.map(q => {
                const diffCfg = DIFFICULTY_CONFIG[q.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.medium;
                return (
                  <button
                    key={q.id}
                    onClick={() => { setSelectedQuizId(q.id); setView("quiz-detail"); }}
                    className="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl p-3 transition-all flex items-center gap-3 min-h-[56px]"
                  >
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain size={15} className="text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate font-['Poppins']">{q.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{q.questionsCount}Q · {q.timeLimitMinutes}min</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: diffCfg.bg, color: diffCfg.text }}
                        >
                          {diffCfg.label}
                        </span>
                        {q.markingScheme?.hasNegativeMarking && (
                          <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">−marking</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] text-sm">Published Papers</h3>
            <button onClick={() => setView("papers")} className="text-[#1E3A8A] text-xs flex items-center gap-1 hover:underline">
              View all <ChevronRight size={12} />
            </button>
          </div>
          {recentPapers.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No published papers{currentGoal ? ` for ${currentGoal.shortLabel}` : ""} yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPapers.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPaperId(p.id); setView("paper-detail"); }}
                  className="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl p-3 transition-all flex items-center gap-3 min-h-[56px]"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={15} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate font-['Poppins']">{p.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {[p.subject, p.year, p.marks ? `${p.marks}M` : null].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {practiceTopics.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={17} className="text-[#F97316]" />
            <h3 className="font-semibold text-orange-800 font-['Poppins'] text-sm">From your library</h3>
          </div>
          <p className="text-xs text-orange-700 mb-3">Subjects and chapters from published papers and quizzes:</p>
          <div className="flex flex-wrap gap-2">
            {practiceTopics.map(t => (
              <span key={t} className="bg-white text-orange-700 border border-orange-200 text-xs px-3 py-1.5 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
