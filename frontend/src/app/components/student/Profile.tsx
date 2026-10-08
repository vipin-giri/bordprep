import { useState } from "react";
import {
  User, Mail, Phone, Save, LogOut, Flame, Brain,
  FileText, CheckCircle, Trash2, Target, Calendar, BookOpen,
  Bookmark, Clock, Award, GraduationCap, Layers, AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { updateMe } from "../../lib/api";
import type { Medium, Goal } from "../data/mockData";
import { GoalIcon } from "../shared/GoalIcons";

const MEDIUMS: { value: Medium; label: string }[] = [
  { value: "english", label: "English" },
  { value: "semi-english", label: "Semi-English" },
  { value: "marathi", label: "Marathi" },
];

const cardStyle = {
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 2px 12px rgba(30,58,138,0.06)",
} as const;

function mediumLabel(value?: string) {
  return MEDIUMS.find((m) => m.value === value)?.label ?? value ?? "—";
}

function streamLabel(value?: string) {
  if (!value || value === "general") return "";
  return value.toUpperCase();
}

function formatExamDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
}

export function Profile() {
  const {
    user, setUser, setView, currentGoal, setCurrentGoal, removeGoal,
    completedAttempts, bookmarks, studentPapers, studentQuizzes,
  } = useApp();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [medium, setMedium] = useState<Medium>((user?.medium as Medium) || "english");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cat = currentGoal?.category;
  const goalAttempts = completedAttempts.filter((a) => !cat || a.goalCategory === cat);
  const avgScore = goalAttempts.length > 0
    ? Math.round(goalAttempts.reduce((s, a) => s + a.percentage, 0) / goalAttempts.length)
    : 0;
  const bestScore = goalAttempts.length > 0
    ? Math.round(Math.max(...goalAttempts.map((a) => a.percentage)))
    : 0;
  const totalNegMarks = goalAttempts.reduce((s, a) => s + a.negativeMarks, 0);
  const examDays = daysUntil(currentGoal?.examDate);
  const initials = (name || user?.name || "S").trim().charAt(0).toUpperCase();
  const dirty =
    name.trim() !== (user?.name ?? "") ||
    phone.trim() !== (user?.phone ?? "") ||
    medium !== (user?.medium || "english");

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }
    if (phone.trim() && !/^[0-9+\-\s]{8,15}$/.test(phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }
    setError("");
    setSaving(true);
    const next = { ...user, name: trimmedName, phone: phone.trim(), medium };
    setUser(next);
    try {
      await updateMe({ name: trimmedName, phone: phone.trim(), medium });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchGoal = (goal: Goal) => {
    if (!user || goal.id === user.currentGoalId) return;
    setCurrentGoal(goal);
    void updateMe({ currentGoalId: goal.id }).catch((err) => console.warn("Could not switch goal", err));
  };

  const handleRemoveGoal = (goalId: string) => {
    if (!user || (user.goals?.length ?? 0) < 2) return;
    if (!window.confirm("Remove this exam goal from your profile?")) return;
    const remaining = user.goals.filter((g) => g.id !== goalId);
    const currentGoalId = user.currentGoalId === goalId ? remaining[0].id : user.currentGoalId;
    removeGoal(goalId);
    void updateMe({ goals: remaining, currentGoalId }).catch((err) => console.warn("Could not update goals", err));
  };

  const logout = () => {
    setUser(null);
    setView("landing");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-4">
      {/* ── Hero ── */}
      <div className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)" }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute right-16 -bottom-12 w-28 h-28 bg-white/5 rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl sm:text-3xl font-bold font-['Poppins'] flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold font-['Poppins'] truncate">{name || "Student"}</h2>
            <p className="text-white/75 text-sm truncate mt-0.5">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                <Flame size={12} className="text-orange-300" /> {user?.streak ?? 0} day streak
              </span>
              {currentGoal && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                  <GoalIcon category={currentGoal.category} size={12} />
                  {currentGoal.shortLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                <BookOpen size={12} /> {mediumLabel(medium)} medium
              </span>
            </div>
          </div>
          {examDays !== null && (
            <div className="sm:text-right bg-white/10 border border-white/15 rounded-2xl px-4 py-3 flex-shrink-0">
              <p className="text-white/70 text-[11px] uppercase tracking-wide">Exam countdown</p>
              <p className="text-2xl font-bold font-['Poppins'] leading-tight">{examDays}</p>
              <p className="text-white/70 text-xs">days left</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── Personal details ── */}
        <div className="lg:col-span-3 rounded-2xl p-5 sm:p-6" style={cardStyle}>
          <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] mb-4 flex items-center gap-2">
            <User size={16} /> Personal details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Mail size={12} /> Email
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="w-full border border-gray-100 rounded-xl py-2.5 px-4 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Phone size={12} /> Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Study medium</label>
              <div className="grid grid-cols-3 gap-2">
                {MEDIUMS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMedium(item.value)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                      medium === item.value
                        ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1E3A8A]/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <button
            onClick={() => void handleSave()}
            disabled={saving || !dirty}
            className="mt-4 w-full bg-[#1E3A8A] hover:bg-[#1D4ED8] disabled:opacity-50 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold font-['Poppins'] min-h-[46px]"
          >
            {saved ? <><CheckCircle size={16} /> Saved</> : <><Save size={16} /> {saving ? "Saving..." : "Save changes"}</>}
          </button>
        </div>

        {/* ── Snapshot stats ── */}
        <div className="lg:col-span-2 rounded-2xl p-5 sm:p-6" style={cardStyle}>
          <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] mb-4 flex items-center gap-2">
            <Award size={16} /> Study snapshot
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Brain, label: "Quizzes taken", value: goalAttempts.length, color: "text-violet-600", bg: "bg-violet-50" },
              { icon: CheckCircle, label: "Average score", value: avgScore > 0 ? `${avgScore}%` : "—", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Target, label: "Best score", value: bestScore > 0 ? `${bestScore}%` : "—", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Flame, label: "Day streak", value: user?.streak ?? 0, color: "text-orange-600", bg: "bg-orange-50" },
              { icon: FileText, label: "Papers available", value: studentPapers.length, color: "text-sky-600", bg: "bg-sky-50" },
              { icon: Bookmark, label: "Saved items", value: bookmarks.length, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                  <s.icon size={15} className={s.color} />
                </div>
                <p className="text-lg font-bold text-[#1E3A8A] font-['Poppins'] leading-none">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
          {totalNegMarks < 0 && (
            <p className="mt-3 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              Negative marks so far: <strong>{totalNegMarks}</strong>. Focus on accuracy.
            </p>
          )}
        </div>
      </div>

      {/* ── Exam goals ── */}
      <div className="rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] flex items-center gap-2">
              <GraduationCap size={16} /> Exam goals
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Active goal decides which papers and quizzes you see first.</p>
          </div>
          <button
            onClick={() => setView("onboarding")}
            className="text-xs font-semibold text-[#1E3A8A] border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl"
          >
            Update goals
          </button>
        </div>

        {(user?.goals?.length ?? 0) === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Layers size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No exam goal selected yet.</p>
            <button onClick={() => setView("onboarding")} className="mt-3 text-[#1E3A8A] text-sm font-semibold hover:underline">
              Set up your exam goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {user?.goals.map((goal) => {
              const active = goal.id === (user.currentGoalId || currentGoal?.id);
              const days = daysUntil(goal.examDate);
              return (
                <div
                  key={goal.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    active ? "border-[#1E3A8A]/30 bg-blue-50/60" : "border-gray-100 bg-gray-50/70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: goal.bgColor, color: goal.textColor }}
                    >
                      <GoalIcon category={goal.category} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900 font-['Poppins'] text-sm">{goal.label}</p>
                        {active && (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                        {goal.standard && <span>Class {goal.standard}</span>}
                        {streamLabel(goal.stream) && <span>{streamLabel(goal.stream)}</span>}
                        {goal.medium && <span>{mediumLabel(goal.medium)}</span>}
                        {goal.targetYear && <span>Target {goal.targetYear}</span>}
                        {formatExamDate(goal.examDate) && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} /> {formatExamDate(goal.examDate)}
                            {days !== null && ` · ${days} days left`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!active && (
                        <button
                          onClick={() => handleSwitchGoal(goal)}
                          className="text-[11px] font-semibold text-[#1E3A8A] bg-white border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50"
                        >
                          Set active
                        </button>
                      )}
                      {(user.goals.length > 1) && (
                        <button
                          onClick={() => handleRemoveGoal(goal.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remove goal"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent attempts ── */}
      <div className="rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1E3A8A] font-['Poppins'] flex items-center gap-2">
            <Clock size={16} /> Recent quiz attempts
          </h3>
          <span className="text-xs text-gray-400">{currentGoal?.shortLabel ?? "All goals"}</span>
        </div>
        {goalAttempts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Brain size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No quizzes attempted yet.</p>
            <button onClick={() => setView("quizzes")} className="mt-3 text-[#1E3A8A] text-sm font-semibold hover:underline">
              Browse quizzes
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {goalAttempts.slice(0, 8).map((attempt) => {
              const pct = Math.round(attempt.percentage);
              const color = pct >= 75 ? "text-green-700 bg-green-100" : pct >= 50 ? "text-amber-700 bg-amber-100" : "text-red-600 bg-red-100";
              return (
                <div key={attempt.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <Brain size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 font-['Poppins'] truncate">{attempt.quizTitle}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      <span className="capitalize">{attempt.mode}</span>
                      {attempt.negativeMarks < 0 ? ` · ${attempt.negativeMarks} neg` : ""}
                      {" · "}
                      {new Date(attempt.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${color}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Account ── */}
      <div className="rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <h3 className="font-semibold text-gray-800 font-['Poppins'] mb-1">Account</h3>
        <p className="text-xs text-gray-400 mb-4">
          {studentQuizzes.length} quizzes and {studentPapers.length} papers are available for your current preparation.
        </p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium min-h-[44px]"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );
}
