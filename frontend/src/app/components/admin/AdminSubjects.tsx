import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Plus, Edit2, Trash2, X, ChevronDown, ChevronRight, BookOpen, Loader2, Upload,
  Calculator, FlaskConical, Atom, Dna, Microscope, Map, Landmark, TrendingUp,
  BarChart2, BookText, Globe, BookMarked, Sigma, type LucideIcon,
} from "lucide-react";
import { SubjectIcon } from "../shared/GoalIcons";
import {
  bulkCreateAdminChapters,
  bulkCreateAdminSubjects,
  createAdminChapter,
  createAdminSubject,
  deleteAdminChapter,
  deleteAdminSubject,
  fetchAdminSubjects,
  updateAdminChapter,
  updateAdminSubject,
  type AdminChapter,
  type AdminSubject,
} from "../../lib/api";

const GOAL_OPTIONS = [
  { id: "board-10", label: "SSC (10th)" },
  { id: "board-12", label: "HSC (12th)" },
  { id: "board-8", label: "Class 8" },
  { id: "board-9", label: "Class 9" },
  { id: "board-11", label: "Class 11" },
  { id: "neet", label: "NEET UG" },
  { id: "jee-mains", label: "JEE Mains" },
  { id: "mht-cet-pcb", label: "MHT-CET PCB" },
  { id: "mht-cet-pcm", label: "MHT-CET PCM" },
];

const ICON_OPTIONS: { key: string; Icon: LucideIcon }[] = [
  { key: "calculator", Icon: Calculator },
  { key: "flask", Icon: FlaskConical },
  { key: "atom", Icon: Atom },
  { key: "dna", Icon: Dna },
  { key: "microscope", Icon: Microscope },
  { key: "book", Icon: BookOpen },
  { key: "booktext", Icon: BookText },
  { key: "bookmarked", Icon: BookMarked },
  { key: "map", Icon: Map },
  { key: "landmark", Icon: Landmark },
  { key: "trending", Icon: TrendingUp },
  { key: "barchart", Icon: BarChart2 },
  { key: "globe", Icon: Globe },
  { key: "sigma", Icon: Sigma },
];

const COLORS = ["#1E3A8A", "#7C3AED", "#059669", "#DC2626", "#D97706", "#0284C7", "#DB2777", "#65A30D"];

function parseCsvLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitCsvRow(line: string) {
  return line.split(",").map((part) => part.trim().replace(/^"|"$/g, ""));
}

function parseSubjectRows(text: string, defaultGoal: string) {
  const lines = parseCsvLines(text);
  if (!lines.length) return [];
  const first = splitCsvRow(lines[0]).map((c) => c.toLowerCase());
  const hasHeader = first.includes("name") || first.includes("subject");
  const start = hasHeader ? 1 : 0;
  const nameIdx = hasHeader ? first.findIndex((c) => c === "name" || c === "subject") : 0;
  const goalIdx = hasHeader ? first.findIndex((c) => c === "goal" || c === "goalcategory" || c === "exam") : 1;
  const iconIdx = hasHeader ? first.findIndex((c) => c === "icon") : 2;
  const colorIdx = hasHeader ? first.findIndex((c) => c === "color") : 3;

  return lines.slice(start).map((line) => {
    const cols = splitCsvRow(line);
    if (cols.length === 1) return { name: cols[0], goalCategory: defaultGoal };
    return {
      name: cols[nameIdx >= 0 ? nameIdx : 0] || "",
      goalCategory: (goalIdx >= 0 ? cols[goalIdx] : "") || defaultGoal,
      icon: iconIdx >= 0 ? cols[iconIdx] : undefined,
      color: colorIdx >= 0 ? cols[colorIdx] : undefined,
    };
  }).filter((row) => row.name);
}

function parseChapterRows(text: string) {
  const lines = parseCsvLines(text);
  if (!lines.length) return [];
  const first = splitCsvRow(lines[0]).map((c) => c.toLowerCase());
  const hasHeader = first.includes("name") || first.includes("chapter");
  const start = hasHeader ? 1 : 0;
  const numIdx = hasHeader ? first.findIndex((c) => c === "number" || c === "chapternumber" || c === "no") : 0;
  const nameIdx = hasHeader ? first.findIndex((c) => c === "name" || c === "chapter") : (first.length > 1 ? 1 : 0);

  return lines.slice(start).map((line, i) => {
    const cols = splitCsvRow(line);
    if (cols.length === 1) return { name: cols[0], chapterNumber: i + 1 };
    const maybeNum = Number(cols[numIdx >= 0 ? numIdx : 0]);
    const name = cols[nameIdx >= 0 ? nameIdx : cols.length - 1] || "";
    return {
      name,
      chapterNumber: Number.isFinite(maybeNum) && maybeNum >= 1 ? maybeNum : i + 1,
    };
  }).filter((row) => row.name);
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-hidden`}>
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-indigo-600" />
        <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-[#1E3A8A]" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-5rem)]">{children}</div>
      </div>
    </div>
  );
}

export function AdminSubjects() {
  const [subjectList, setSubjectList] = useState<AdminSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [activeGoalCategory, setActiveGoalCategory] = useState("board-10");
  const [listError, setListError] = useState("");

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<AdminSubject | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: "", goalCategory: "board-10", color: "#1E3A8A", icon: "book" });
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [subjectError, setSubjectError] = useState("");

  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<AdminChapter | null>(null);
  const [chapterForm, setChapterForm] = useState({ name: "", chapterNumber: 1, subjectId: "" });
  const [chapterSaving, setChapterSaving] = useState(false);
  const [chapterError, setChapterError] = useState("");

  const [bulkTab, setBulkTab] = useState<"subjects" | "chapters" | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkGoal, setBulkGoal] = useState("board-10");
  const [bulkSubjectId, setBulkSubjectId] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkError, setBulkError] = useState("");

  const chapterCount = useMemo(
    () => subjectList.reduce((sum, s) => sum + (s.chapters?.length ?? s.totalChapters ?? 0), 0),
    [subjectList],
  );

  const loadSubjects = async () => {
    setListError("");
    try {
      const data = await fetchAdminSubjects();
      setSubjectList(data.subjects);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubjects();
  }, []);

  useEffect(() => {
    if (!showSubjectForm && !showChapterForm && !bulkTab) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [showSubjectForm, showChapterForm, bulkTab]);

  const filteredSubjects = subjectList.filter((s) => s.goalCategory === activeGoalCategory);
  const activeGoalLabel = GOAL_OPTIONS.find((g) => g.id === activeGoalCategory)?.label ?? activeGoalCategory;
  const chapterSubject = subjectList.find((s) => s.id === chapterForm.subjectId);
  const bulkSubjectOptions = subjectList.filter((s) => s.goalCategory === bulkGoal);

  const openAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ name: "", goalCategory: activeGoalCategory, color: "#1E3A8A", icon: "book" });
    setSubjectError("");
    setShowSubjectForm(true);
  };

  const openEditSubject = (sub: AdminSubject) => {
    setEditingSubject(sub);
    setSubjectForm({ name: sub.name, goalCategory: sub.goalCategory, color: sub.color || "#1E3A8A", icon: sub.icon || "book" });
    setSubjectError("");
    setShowSubjectForm(true);
  };

  const openAddChapter = (subjectId: string) => {
    const sub = subjectList.find((s) => s.id === subjectId);
    const existing = sub?.chapters ?? [];
    setEditingChapter(null);
    setChapterForm({ name: "", chapterNumber: existing.length + 1, subjectId });
    setChapterError("");
    setShowChapterForm(true);
  };

  const openEditChapter = (ch: AdminChapter) => {
    setEditingChapter(ch);
    setChapterForm({ name: ch.name, chapterNumber: ch.chapterNumber, subjectId: ch.subjectId });
    setChapterError("");
    setShowChapterForm(true);
  };

  const handleSaveSubject = async () => {
    setSubjectError("");
    if (!subjectForm.name.trim()) {
      setSubjectError("Subject name is required.");
      return;
    }
    setSubjectSaving(true);
    try {
      if (editingSubject) {
        const { subject } = await updateAdminSubject(editingSubject.id, subjectForm);
        setSubjectList((prev) => prev.map((s) => (s.id === subject.id ? subject : s)));
      } else {
        const { subject } = await createAdminSubject(subjectForm);
        setSubjectList((prev) => [...prev, subject]);
      }
      setShowSubjectForm(false);
      setEditingSubject(null);
    } catch (err) {
      setSubjectError(err instanceof Error ? err.message : "Could not save subject.");
    } finally {
      setSubjectSaving(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm("Delete this subject and all its chapters?")) return;
    try {
      await deleteAdminSubject(id);
      setSubjectList((prev) => prev.filter((s) => s.id !== id));
      if (expandedSubject === id) setExpandedSubject(null);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not delete subject.");
    }
  };

  const handleSaveChapter = async () => {
    setChapterError("");
    if (!chapterForm.name.trim() || !chapterForm.subjectId) {
      setChapterError("Chapter name is required.");
      return;
    }
    setChapterSaving(true);
    try {
      if (editingChapter) {
        const { chapter } = await updateAdminChapter(editingChapter.id, {
          name: chapterForm.name,
          chapterNumber: chapterForm.chapterNumber,
        });
        setSubjectList((prev) => prev.map((s) => {
          if (s.id !== chapterForm.subjectId) return s;
          const chapters = (s.chapters ?? []).map((c) => (c.id === chapter.id ? chapter : c));
          return { ...s, chapters, totalChapters: chapters.length };
        }));
      } else {
        const { chapter } = await createAdminChapter(chapterForm.subjectId, {
          name: chapterForm.name,
          chapterNumber: chapterForm.chapterNumber,
        });
        setSubjectList((prev) => prev.map((s) => {
          if (s.id !== chapterForm.subjectId) return s;
          const chapters = [...(s.chapters ?? []), chapter].sort((a, b) => a.chapterNumber - b.chapterNumber);
          return { ...s, chapters, totalChapters: chapters.length };
        }));
        setExpandedSubject(chapterForm.subjectId);
      }
      setShowChapterForm(false);
      setEditingChapter(null);
    } catch (err) {
      setChapterError(err instanceof Error ? err.message : "Could not save chapter.");
    } finally {
      setChapterSaving(false);
    }
  };

  const handleDeleteChapter = async (subjectId: string, chapterId: string) => {
    try {
      await deleteAdminChapter(chapterId);
      setSubjectList((prev) => prev.map((s) => {
        if (s.id !== subjectId) return s;
        const chapters = (s.chapters ?? []).filter((c) => c.id !== chapterId);
        return { ...s, chapters, totalChapters: chapters.length };
      }));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not delete chapter.");
    }
  };

  const openBulk = (tab: "subjects" | "chapters") => {
    setBulkTab(tab);
    setBulkText("");
    setBulkGoal(activeGoalCategory);
    setBulkSubjectId("");
    setBulkMessage("");
    setBulkError("");
  };

  const handleBulkFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setBulkText(text);
  };

  const handleBulkSubjects = async () => {
    setBulkError("");
    setBulkMessage("");
    const subjects = parseSubjectRows(bulkText, bulkGoal);
    if (!subjects.length) {
      setBulkError("Paste subject names (one per line) or upload a CSV.");
      return;
    }
    setBulkSaving(true);
    try {
      const result = await bulkCreateAdminSubjects({ goalCategory: bulkGoal, subjects });
      setSubjectList((prev) => [...prev, ...result.created]);
      const parts = [`${result.created.length} added`];
      if (result.skipped.length) parts.push(`${result.skipped.length} skipped (already exist)`);
      if (result.errors.length) parts.push(`${result.errors.length} failed`);
      setBulkMessage(parts.join(" · "));
      setBulkText("");
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : "Could not import subjects.");
    } finally {
      setBulkSaving(false);
    }
  };

  const handleBulkChapters = async () => {
    setBulkError("");
    setBulkMessage("");
    if (!bulkSubjectId) {
      setBulkError("Select a subject first.");
      return;
    }
    const chapters = parseChapterRows(bulkText);
    if (!chapters.length) {
      setBulkError("Paste chapter names (one per line) or upload a CSV.");
      return;
    }
    setBulkSaving(true);
    try {
      const result = await bulkCreateAdminChapters({ subjectId: bulkSubjectId, chapters });
      setSubjectList((prev) => prev.map((s) => {
        if (s.id !== bulkSubjectId) return s;
        const next = [...(s.chapters ?? []), ...result.created].sort((a, b) => a.chapterNumber - b.chapterNumber);
        return { ...s, chapters: next, totalChapters: next.length };
      }));
      setExpandedSubject(bulkSubjectId);
      const parts = [`${result.created.length} added`];
      if (result.skipped.length) parts.push(`${result.skipped.length} skipped (already exist)`);
      if (result.errors.length) parts.push(`${result.errors.length} failed`);
      setBulkMessage(parts.join(" · "));
      setBulkText("");
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : "Could not import chapters.");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>Subjects & Chapters</h2>
          <p className="text-gray-500 text-sm">{subjectList.length} subjects · {chapterCount} chapters in database</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openBulk("subjects")}
            className="border border-gray-200 hover:border-[#1E3A8A] text-gray-600 hover:text-[#1E3A8A] px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors bg-white"
          >
            <Upload size={15} /> Bulk Subjects
          </button>
          <button
            onClick={() => openBulk("chapters")}
            className="border border-gray-200 hover:border-[#1E3A8A] text-gray-600 hover:text-[#1E3A8A] px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors bg-white"
          >
            <Upload size={15} /> Bulk Chapters
          </button>
          <button
            onClick={openAddSubject}
            className="bg-[#1E3A8A] hover:bg-blue-900 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </div>

      {listError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</div>
      )}

      {showSubjectForm && (
        <Modal
          title={editingSubject ? "Edit Subject" : "Add New Subject"}
          subtitle="Saved to the database"
          onClose={() => { if (!subjectSaving) setShowSubjectForm(false); }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Subject Name *</label>
              <input
                value={subjectForm.name}
                onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Mathematics"
                className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Exam Goal</label>
              <select
                value={subjectForm.goalCategory}
                onChange={(e) => setSubjectForm((p) => ({ ...p, goalCategory: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
              >
                {GOAL_OPTIONS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(({ key, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSubjectForm((p) => ({ ...p, icon: key }))}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      subjectForm.icon === key ? "ring-2 ring-[#1E3A8A] bg-blue-50 text-[#1E3A8A]" : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSubjectForm((p) => ({ ...p, color: c }))}
                    className={`w-8 h-8 rounded-full transition-all ${subjectForm.color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          {subjectError && <p className="text-red-500 text-sm mt-3">{subjectError}</p>}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => void handleSaveSubject()}
              disabled={subjectSaving}
              className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {subjectSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editingSubject ? "Update Subject" : "Add Subject"}
            </button>
            <button onClick={() => setShowSubjectForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          </div>
        </Modal>
      )}

      {showChapterForm && (
        <Modal
          title={editingChapter ? "Edit Chapter" : "Add Chapter"}
          subtitle={chapterSubject ? `For ${chapterSubject.name}` : "Choose a subject"}
          onClose={() => { if (!chapterSaving) setShowChapterForm(false); }}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Subject *</label>
              <select
                value={chapterForm.subjectId}
                disabled={Boolean(editingChapter)}
                onChange={(e) => {
                  const subjectId = e.target.value;
                  const sub = subjectList.find((s) => s.id === subjectId);
                  setChapterForm((p) => ({
                    ...p,
                    subjectId,
                    chapterNumber: (sub?.chapters?.length ?? 0) + 1,
                  }));
                }}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50 disabled:text-gray-400"
              >
                <option value="">Select subject</option>
                {subjectList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({GOAL_OPTIONS.find((g) => g.id === s.goalCategory)?.label ?? s.goalCategory})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Chapter number</label>
              <input
                type="number"
                min={1}
                value={chapterForm.chapterNumber}
                onChange={(e) => setChapterForm((p) => ({ ...p, chapterNumber: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Chapter name *</label>
              <input
                value={chapterForm.name}
                onChange={(e) => setChapterForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Quadratic Equations"
                className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
              />
            </div>
            {chapterError && <p className="text-red-500 text-sm">{chapterError}</p>}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => void handleSaveChapter()}
                disabled={chapterSaving}
                className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {chapterSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editingChapter ? "Update Chapter" : "Add Chapter"}
              </button>
              <button onClick={() => setShowChapterForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {bulkTab && (
        <Modal
          title={bulkTab === "subjects" ? "Bulk Upload Subjects" : "Bulk Upload Chapters"}
          subtitle="Paste a list or upload a CSV file"
          onClose={() => { if (!bulkSaving) setBulkTab(null); }}
          wide
        >
          <div className="space-y-4">
            {bulkTab === "subjects" ? (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Default exam goal</label>
                  <select
                    value={bulkGoal}
                    onChange={(e) => setBulkGoal(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                  >
                    {GOAL_OPTIONS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  One subject per line, or CSV with headers: <code className="bg-gray-100 px-1 rounded">name,goalCategory</code>
                </p>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Exam goal</label>
                    <select
                      value={bulkGoal}
                      onChange={(e) => { setBulkGoal(e.target.value); setBulkSubjectId(""); }}
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                    >
                      {GOAL_OPTIONS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Subject *</label>
                    <select
                      value={bulkSubjectId}
                      onChange={(e) => setBulkSubjectId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                    >
                      <option value="">{bulkSubjectOptions.length ? "Select subject" : "No subjects for this goal"}</option>
                      {bulkSubjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  One chapter per line, or CSV: <code className="bg-gray-100 px-1 rounded">chapterNumber,name</code>
                </p>
              </>
            )}

            <label className="flex items-center justify-center gap-2 border border-dashed border-gray-200 hover:border-[#1E3A8A] rounded-xl py-3 text-sm text-gray-500 hover:text-[#1E3A8A] cursor-pointer">
              <Upload size={15} /> Upload CSV / TXT
              <input
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="hidden"
                onChange={(e) => void handleBulkFile(e.target.files?.[0])}
              />
            </label>

            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              placeholder={bulkTab === "subjects" ? "Mathematics\nScience\nEnglish" : "1, Real Numbers\n2, Polynomials\nQuadratic Equations"}
              className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50 resize-y min-h-40"
            />

            {bulkError && <p className="text-red-500 text-sm">{bulkError}</p>}
            {bulkMessage && <p className="text-green-600 text-sm">{bulkMessage}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => void (bulkTab === "subjects" ? handleBulkSubjects() : handleBulkChapters())}
                disabled={bulkSaving}
                className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {bulkSaving ? <><Loader2 size={15} className="animate-spin" /> Importing...</> : "Import"}
              </button>
              <button onClick={() => setBulkTab(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {GOAL_OPTIONS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveGoalCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeGoalCategory === cat.id
                ? "bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-[0_4px_14px_rgba(30,58,138,0.4)]"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
            }`}
          >
            {cat.label} ({subjectList.filter((s) => s.goalCategory === cat.id).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading subjects...
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubjects.map((sub) => {
            const subChapters = [...(sub.chapters ?? [])].sort((a, b) => a.chapterNumber - b.chapterNumber);
            const isExpanded = expandedSubject === sub.id;
            return (
              <div key={sub.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => setExpandedSubject(isExpanded ? null : sub.id)} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${sub.color}20` }}>
                      <SubjectIcon name={sub.name} size={18} style={{ color: sub.color }} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{sub.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{subChapters.length} chapters</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span>{sub.totalPapers} papers</span>
                        <span>·</span>
                        <span>{sub.totalQuizzes} quizzes</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEditSubject(sub)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => void handleDeleteSubject(sub.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                    {subChapters.length > 0 ? (
                      <div className="space-y-1.5">
                        {subChapters.map((ch) => (
                          <div key={ch.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                              <span className="w-6 h-6 rounded-lg bg-gray-100 text-xs text-gray-500 flex items-center justify-center flex-shrink-0">{ch.chapterNumber}</span>
                              <span className="text-sm text-gray-700 truncate min-w-0">{ch.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditChapter(ch)} className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={12} /></button>
                              <button onClick={() => void handleDeleteChapter(sub.id, ch.id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-3">No chapters added yet</p>
                    )}

                    <button
                      onClick={() => openAddChapter(sub.id)}
                      className="mt-3 w-full border border-dashed border-gray-200 text-gray-400 hover:border-[#1E3A8A] hover:text-[#1E3A8A] py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus size={13} /> Add Chapter
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filteredSubjects.length === 0 && (
            <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
              <BookOpen size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No subjects for {activeGoalLabel}. Add one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
