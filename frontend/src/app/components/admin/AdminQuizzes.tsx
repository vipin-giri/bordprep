import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle, X, Loader2, ChevronLeft, ChevronRight, Globe, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  createAdminQuiz,
  deleteAdminQuiz,
  fetchAdminQuiz,
  fetchAdminQuizzes,
  fetchAdminSubjects,
  setAdminQuizStatus,
  updateAdminQuiz,
  type AdminQuiz,
  type AdminQuizQuestion,
  type AdminSubject,
} from "../../lib/api";

const EMPTY_FORM = {
  title: "",
  goalCategory: "board-10",
  subjectId: "",
  chapter: "",
  difficulty: "medium",
  timeLimitMinutes: 15,
  totalMarks: 10,
  bankSize: 10,
  questionsToShow: 10,
  instructions: "Read each question carefully before answering.",
  status: "draft",
  scheduledAt: "",
};

const EMPTY_QUESTION: AdminQuizQuestion = {
  text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  explanation: "",
  marks: 1,
};

const GOAL_OPTIONS = [
  { value: "board-10", label: "SSC (10th)" },
  { value: "board-12", label: "HSC (12th)" },
  { value: "board-8", label: "Class 8" },
  { value: "board-9", label: "Class 9" },
  { value: "board-11", label: "Class 11" },
  { value: "neet", label: "NEET UG" },
  { value: "jee-mains", label: "JEE Mains" },
  { value: "mht-cet-pcb", label: "MHT-CET PCB" },
  { value: "mht-cet-pcm", label: "MHT-CET PCM" },
];

const diffColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-orange-100 text-orange-700",
  hard: "bg-red-100 text-red-700",
};

function subjectName(subjectList: AdminSubject[], subjectId: string, fallback = "") {
  return subjectList.find((s) => s.id === subjectId)?.name || fallback;
}

function createBank(size: number, existing: AdminQuizQuestion[] = []) {
  return Array.from({ length: size }, (_, i) => ({ ...EMPTY_QUESTION, ...existing[i] }));
}

function isQuestionFilled(q: AdminQuizQuestion) {
  return Boolean(q.text?.trim() && q.optionA?.trim() && q.optionB?.trim() && q.optionC?.trim() && q.optionD?.trim());
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function minDatetimeLocal() {
  const d = new Date(Date.now() + 60_000);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatScheduleLabel(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function AdminQuizzes() {
  const { view } = useApp();

  const [quizList, setQuizList] = useState<AdminQuiz[]>([]);
  const [subjectList, setSubjectList] = useState<AdminSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [editing, setEditing] = useState<AdminQuiz | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [questions, setQuestions] = useState<AdminQuizQuestion[]>(createBank(10));
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [statusBusyId, setStatusBusyId] = useState("");

  const filledCount = useMemo(() => questions.filter(isQuestionFilled).length, [questions]);
  const goalSubjects = subjectList.filter((s) => s.goalCategory === formData.goalCategory);
  const selectedSubject = subjectList.find((s) => s.id === formData.subjectId);
  const subjectChapters = [...(selectedSubject?.chapters ?? [])].sort(
    (a, b) => a.chapterNumber - b.chapterNumber,
  );

  const loadQuizzes = async () => {
    setListError("");
    try {
      const data = await fetchAdminQuizzes();
      setQuizList(data.quizzes);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await fetchAdminSubjects();
      setSubjectList(data.subjects);
    } catch {
      setSubjectList([]);
    }
  };

  useEffect(() => {
    void loadQuizzes();
    void loadSubjects();
  }, []);

  useEffect(() => {
    if (view === "admin-quiz-create") openCreate();
  }, [view]);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving && !loadingQuiz) closeForm();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showForm, saving, loadingQuiz]);

  const filtered = quizList.filter((q) =>
    `${q.title} ${q.subject}`.toLowerCase().includes(search.toLowerCase()),
  );

  const closeForm = () => {
    setShowForm(false);
    setStep(1);
    setEditing(null);
    setActiveQuestionIndex(0);
    setError("");
    setSaved(false);
    setLoadingQuiz(false);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ ...EMPTY_FORM });
    setQuestions(createBank(EMPTY_FORM.bankSize));
    setStep(1);
    setActiveQuestionIndex(0);
    setError("");
    setSaved(false);
    setShowForm(true);
    void loadSubjects();
  };

  const handleEdit = async (quiz: AdminQuiz) => {
    setError("");
    setSaved(false);
    setShowForm(true);
    setStep(1);
    setLoadingQuiz(true);
    setEditing(quiz);
    void loadSubjects();
    try {
      const { quiz: full } = await fetchAdminQuiz(quiz.id);
      const bankSize = full.bankSize || full.questionsCount || 1;
      setFormData({
        title: full.title,
        goalCategory: full.goalCategory || "board-10",
        subjectId: full.subjectId,
        chapter: full.chapter,
        difficulty: full.difficulty || "medium",
        timeLimitMinutes: full.timeLimitMinutes,
        totalMarks: full.totalMarks,
        bankSize,
        questionsToShow: full.questionsToShow || bankSize,
        instructions: full.instructions,
        status: full.status || "draft",
        scheduledAt: toDatetimeLocalValue(full.scheduledAt),
      });
      setQuestions(createBank(bankSize, full.questions ?? []));
      setActiveQuestionIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load quiz.");
      closeForm();
    } finally {
      setLoadingQuiz(false);
    }
  };

  const validatePhase1 = () => {
    if (!formData.title.trim()) return "Quiz title is required.";
    if (!formData.subjectId) return "Please select a subject.";
    if (formData.bankSize < 1) return "Total question bank must be at least 1.";
    if (formData.questionsToShow < 1) return "Questions per attempt must be at least 1.";
    if (formData.questionsToShow > formData.bankSize) {
      return "Questions per attempt cannot exceed the total question bank.";
    }
    if (formData.status === "scheduled") {
      if (!formData.scheduledAt) return "Select a publish date and time.";
      const when = new Date(formData.scheduledAt);
      if (Number.isNaN(when.getTime())) return "Invalid schedule date and time.";
      if (when.getTime() <= Date.now()) return "Schedule date and time must be in the future.";
    }
    return "";
  };

  const goToQuestionsPhase = () => {
    const message = validatePhase1();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setQuestions((prev) => createBank(formData.bankSize, prev));
    setActiveQuestionIndex(0);
    setStep(2);
  };

  const updateQuestion = (index: number, key: keyof AdminQuizQuestion, value: string | number) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [key]: value } : q)));
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    goalCategory: formData.goalCategory,
    subjectId: formData.subjectId,
    subject: subjectName(subjectList, formData.subjectId, formData.title),
    chapter: formData.chapter.trim(),
    difficulty: formData.difficulty,
    timeLimitMinutes: formData.timeLimitMinutes,
    totalMarks: formData.totalMarks,
    bankSize: formData.bankSize,
    questionsToShow: formData.questionsToShow,
    instructions: formData.instructions.trim(),
    status: formData.status,
    scheduledAt: formData.status === "scheduled" ? formData.scheduledAt : null,
    markingScheme: { id: "board", label: "+1 / 0 (Board)" },
    questions: questions.map((q) => ({
      text: q.text.trim(),
      optionA: q.optionA.trim(),
      optionB: q.optionB.trim(),
      optionC: q.optionC.trim(),
      optionD: q.optionD.trim(),
      correctOption: q.correctOption,
      explanation: q.explanation.trim(),
      marks: Number(q.marks) || 1,
    })),
  });

  const handleSave = async () => {
    setError("");
    const phase1Error = validatePhase1();
    if (phase1Error) {
      setError(phase1Error);
      setStep(1);
      return;
    }
    if (filledCount !== formData.bankSize) {
      setError(`Complete all ${formData.bankSize} questions before saving (${filledCount}/${formData.bankSize} done).`);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing) {
        const { quiz } = await updateAdminQuiz(editing.id, payload);
        setQuizList((prev) => prev.map((q) => (q.id === quiz.id ? { ...quiz, questions: undefined } : q)));
      } else {
        const { quiz } = await createAdminQuiz(payload);
        setQuizList((prev) => [{ ...quiz, questions: undefined }, ...prev]);
      }
      setSaved(true);
      setTimeout(() => closeForm(), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (quiz: AdminQuiz) => {
    const nextStatus = quiz.status === "published" ? "draft" : "published";
    setStatusBusyId(quiz.id);
    setListError("");
    try {
      const { quiz: updated } = await setAdminQuizStatus(quiz.id, { status: nextStatus });
      setQuizList((prev) => prev.map((q) => (q.id === updated.id ? { ...updated, questions: undefined } : q)));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not update quiz status.");
    } finally {
      setStatusBusyId("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await deleteAdminQuiz(id);
      setQuizList((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not delete quiz.");
    }
  };

  const activeQuestion = questions[activeQuestionIndex] ?? EMPTY_QUESTION;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>MCQ Quizzes</h2>
          <p className="text-gray-500 text-sm">{quizList.length} quizzes in database</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1E3A8A] hover:bg-blue-900 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} /> Create Quiz
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A] bg-white"
        />
      </div>

      {listError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Title</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden sm:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Subject</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Pool</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Shown</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden lg:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Attempts</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading quizzes...</span>
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((quiz) => (
                    <tr key={quiz.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 max-w-[160px] sm:max-w-none">
                        <p className="text-sm font-medium text-gray-800 truncate">{quiz.title}</p>
                        <p className="text-xs text-gray-400 truncate sm:hidden">{quiz.subject}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">{quiz.subject}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{quiz.bankSize ?? quiz.questionsCount}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{quiz.questionsToShow ?? quiz.questionsCount}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${quiz.status === "published" ? "bg-green-100 text-green-700" : quiz.status === "scheduled" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{quiz.status}</span>
                          {quiz.status === "scheduled" && quiz.scheduledAt && (
                            <p className="text-[11px] text-blue-500 mt-1">{formatScheduleLabel(quiz.scheduledAt)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">{quiz.analytics.totalAttempts.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title={quiz.status === "published" ? "Unpublish" : "Publish"}
                            disabled={statusBusyId === quiz.id}
                            onClick={() => void handleTogglePublish(quiz)}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${quiz.status === "published" ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                          >
                            {statusBusyId === quiz.id ? <Loader2 size={13} className="animate-spin" /> : quiz.status === "published" ? <EyeOff size={13} /> : <Globe size={13} />}
                          </button>
                          <button onClick={() => void handleEdit(quiz)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => void handleDelete(quiz.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                        {quizList.length === 0 ? "No quizzes yet. Create your first quiz." : "No quizzes found."}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => { if (!saving && !loadingQuiz) closeForm(); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-indigo-600" />
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1E3A8A]" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {editing ? "Edit Quiz" : "Create New Quiz"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Step {step} of 2 · {step === 1 ? "Quiz details" : "Question bank"}
                  </p>
                </div>
                <button onClick={closeForm} disabled={saving || loadingQuiz} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1E3A8A] transition-all duration-300" style={{ width: step === 1 ? "50%" : "100%" }} />
              </div>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[calc(92vh-10rem)]">
              {loadingQuiz ? (
                <div className="py-16 flex items-center justify-center text-gray-400 gap-2">
                  <Loader2 size={18} className="animate-spin" /> Loading quiz...
                </div>
              ) : step === 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Quiz Title *</label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Mathematics — Quadratic Equations Quiz"
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                    />
                  </div>
                  {[
                    { label: "Exam Goal", key: "goalCategory", opts: GOAL_OPTIONS },
                    { label: "Difficulty", key: "difficulty", opts: [{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }] },
                    { label: "Time Limit (min)", key: "timeLimitMinutes", type: "number" },
                    { label: "Status", key: "status", opts: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "scheduled", label: "Scheduled" }] },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                      {f.opts ? (
                        <select
                          value={(formData as any)[f.key]}
                          onChange={(e) => setFormData((p) => ({
                            ...p,
                            [f.key]: e.target.value,
                            ...(f.key === "goalCategory" ? { subjectId: "", chapter: "" } : {}),
                            ...(f.key === "status" && e.target.value !== "scheduled" ? { scheduledAt: "" } : {}),
                          }))}
                          className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                        >
                          {f.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={(formData as any)[f.key]}
                          onChange={(e) => setFormData((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                          className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                        />
                      )}
                    </div>
                  ))}
                  {formData.status === "scheduled" && (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Publish date and time *</label>
                      <input
                        type="datetime-local"
                        min={minDatetimeLocal()}
                        value={formData.scheduledAt}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value && new Date(value).getTime() <= Date.now()) {
                            setError("Schedule date and time must be in the future.");
                            return;
                          }
                          setError("");
                          setFormData((p) => ({ ...p, scheduledAt: value }));
                        }}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                      />
                      <p className="text-xs text-gray-400 mt-1">The quiz stays hidden until this time, then it publishes automatically.</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Subject *</label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => setFormData((p) => ({ ...p, subjectId: e.target.value, chapter: "" }))}
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                    >
                      <option value="">{goalSubjects.length ? "Select Subject" : "No subjects — add in Subjects & Chapters"}</option>
                      {goalSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Chapter</label>
                    <select
                      value={formData.chapter}
                      disabled={!formData.subjectId}
                      onChange={(e) => setFormData((p) => ({ ...p, chapter: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {!formData.subjectId ? (
                        <option value="">Select a subject first</option>
                      ) : subjectChapters.length === 0 ? (
                        <option value="">No chapters — add them in Subjects & Chapters</option>
                      ) : (
                        <>
                          <option value="">Select chapter</option>
                          {subjectChapters.map((ch) => (
                            <option key={ch.id} value={ch.name}>
                              {ch.chapterNumber}. {ch.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                  <div className="sm:col-span-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                    <p className="text-sm font-semibold text-[#1E3A8A] mb-3">Question pool settings</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Questions shown per attempt *</label>
                        <input
                          type="number"
                          min={1}
                          value={formData.questionsToShow}
                          onChange={(e) => setFormData((p) => ({ ...p, questionsToShow: Number(e.target.value) }))}
                          className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-white"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Students see this many questions each time.</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Total questions in bank *</label>
                        <input
                          type="number"
                          min={1}
                          value={formData.bankSize}
                          onChange={(e) => setFormData((p) => ({ ...p, bankSize: Number(e.target.value) }))}
                          className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-white"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Upload this many MCQs in step 2.</p>
                      </div>
                    </div>
                    {formData.questionsToShow < formData.bankSize && (
                      <p className="text-xs text-[#1E3A8A] mt-3">
                        Each attempt will randomly pick {formData.questionsToShow} questions from the bank of {formData.bankSize}.
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Instructions</label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData((p) => ({ ...p, instructions: e.target.value }))}
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1E3A8A]">Question bank progress</p>
                      <p className="text-xs text-gray-500">{filledCount} / {formData.bankSize} questions completed</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={activeQuestionIndex === 0}
                        onClick={() => setActiveQuestionIndex((i) => Math.max(0, i - 1))}
                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <select
                        value={activeQuestionIndex}
                        onChange={(e) => setActiveQuestionIndex(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg py-1.5 px-2 text-sm bg-white"
                      >
                        {questions.map((q, i) => (
                          <option key={i} value={i}>
                            Q{i + 1} {isQuestionFilled(q) ? "✓" : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={activeQuestionIndex >= questions.length - 1}
                        onClick={() => setActiveQuestionIndex((i) => Math.min(questions.length - 1, i + 1))}
                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500">Question {activeQuestionIndex + 1} of {formData.bankSize}</span>
                      {isQuestionFilled(activeQuestion) && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Complete</span>
                      )}
                    </div>
                    <textarea
                      value={activeQuestion.text}
                      onChange={(e) => updateQuestion(activeQuestionIndex, "text", e.target.value)}
                      placeholder="Enter question text..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm mb-3 focus:outline-none focus:border-[#1E3A8A] bg-gray-50 resize-none"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {(["A", "B", "C", "D"] as const).map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs font-semibold">{opt}</span>
                          <input
                            value={activeQuestion[`option${opt}`]}
                            onChange={(e) => updateQuestion(activeQuestionIndex, `option${opt}` as keyof AdminQuizQuestion, e.target.value)}
                            placeholder={`Option ${opt}`}
                            className="flex-1 border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Correct Answer</label>
                        <select
                          value={activeQuestion.correctOption}
                          onChange={(e) => updateQuestion(activeQuestionIndex, "correctOption", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                        >
                          {["A", "B", "C", "D"].map((o) => <option key={o} value={o}>Option {o}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Marks</label>
                        <input
                          type="number"
                          value={activeQuestion.marks}
                          onChange={(e) => updateQuestion(activeQuestionIndex, "marks", Number(e.target.value))}
                          className="w-full border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-500 mb-1 block">Explanation (optional)</label>
                      <input
                        value={activeQuestion.explanation}
                        onChange={(e) => updateQuestion(activeQuestionIndex, "explanation", e.target.value)}
                        placeholder="Explanation for the correct answer..."
                        className="w-full border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              {step === 1 ? (
                <>
                  <button
                    onClick={goToQuestionsPhase}
                    className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm font-semibold"
                  >
                    Continue to Questions →
                  </button>
                  <button onClick={closeForm} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setStep(1); setError(""); }}
                    disabled={saving}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Details
                  </button>
                  <button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editing ? "Update Quiz" : "Create Quiz"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
