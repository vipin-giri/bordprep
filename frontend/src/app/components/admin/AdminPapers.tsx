import { useEffect, useRef, useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, Download, Upload, CheckCircle, X, Loader2, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  adminPaperFileUrl,
  createAdminPaper,
  deleteAdminPaper,
  fetchAdminPapers,
  fetchAdminSubjects,
  getToken,
  updateAdminPaper,
  type AdminPaper,
  type AdminSubject,
} from "../../lib/api";

const EMPTY_FORM = {
  title: "",
  goalCategory: "board-10",
  subjectId: "",
  year: new Date().getFullYear(),
  type: "board",
  medium: "english",
  marks: 80,
  durationMinutes: 180,
  status: "draft",
};

const YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);

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

const TYPE_OPTIONS = [
  { value: "board", label: "Board Exam" },
  { value: "model", label: "Model Paper" },
  { value: "practice", label: "Practice Set" },
  { value: "prelims", label: "Prelims" },
  { value: "unit-test", label: "Unit Test" },
  { value: "pyq", label: "Previous Year" },
];

const typeColors: Record<string, string> = {
  board: "bg-blue-100 text-blue-700",
  model: "bg-purple-100 text-purple-700",
  practice: "bg-green-100 text-green-700",
  prelims: "bg-amber-100 text-amber-700",
  "unit-test": "bg-cyan-100 text-cyan-700",
  pyq: "bg-rose-100 text-rose-700",
  "mock-test": "bg-indigo-100 text-indigo-700",
};

function subjectName(subjectList: AdminSubject[], subjectId: string, fallback = "") {
  return subjectList.find((s) => s.id === subjectId)?.name || fallback;
}

async function downloadPaperFile(id: string, fileName?: string | null) {
  const token = getToken();
  const res = await fetch(adminPaperFileUrl(id), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Could not download the PDF.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "paper.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AdminPapers() {
  const { view } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paperList, setPaperList] = useState<AdminPaper[]>([]);
  const [subjectList, setSubjectList] = useState<AdminSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminPaper | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  const loadPapers = async () => {
    setListError("");
    try {
      const data = await fetchAdminPapers();
      setPaperList(data.papers);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not load papers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPapers();
    void fetchAdminSubjects()
      .then((data) => setSubjectList(data.subjects))
      .catch(() => setSubjectList([]));
  }, []);

  useEffect(() => {
    if (view === "admin-paper-upload") openCreate();
  }, [view]);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) closeForm();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showForm, saving]);

  const filtered = paperList.filter((p) =>
    `${p.title} ${p.subject}`.toLowerCase().includes(search.toLowerCase()),
  );

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setPdfFile(null);
    setError("");
    setSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ ...EMPTY_FORM, year: new Date().getFullYear() });
    setPdfFile(null);
    setError("");
    setSaved(false);
    setShowForm(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (paper: AdminPaper) => {
    setEditing(paper);
    setFormData({
      title: paper.title,
      goalCategory: paper.goalCategory || "board-10",
      subjectId: paper.subjectId,
      year: paper.year,
      type: paper.type,
      medium: paper.medium || "english",
      marks: paper.marks,
      durationMinutes: paper.durationMinutes,
      status: paper.status || "draft",
    });
    setPdfFile(null);
    setError("");
    setSaved(false);
    setShowForm(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setError("");
    if (!formData.title.trim() || !formData.subjectId) {
      setError("Please fill in title and subject.");
      return;
    }
    if (!editing && !pdfFile) {
      setError("Please upload a PDF file.");
      return;
    }

    const payload = new FormData();
    payload.set("title", formData.title.trim());
    payload.set("goalCategory", formData.goalCategory);
    payload.set("subjectId", formData.subjectId);
    payload.set("subject", subjectName(subjectList, formData.subjectId, formData.title));
    payload.set("year", String(formData.year));
    payload.set("type", formData.type);
    payload.set("medium", formData.medium);
    payload.set("marks", String(formData.marks));
    payload.set("durationMinutes", String(formData.durationMinutes));
    payload.set("status", formData.status);
    if (pdfFile) payload.set("pdf", pdfFile);

    setSaving(true);
    try {
      if (editing) {
        const { paper } = await updateAdminPaper(editing.id, payload);
        setPaperList((prev) => prev.map((p) => (p.id === paper.id ? paper : p)));
      } else {
        const { paper } = await createAdminPaper(payload);
        setPaperList((prev) => [paper, ...prev]);
      }
      setSaved(true);
      setTimeout(() => closeForm(), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save paper.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this paper? This cannot be undone.")) return;
    try {
      await deleteAdminPaper(id);
      setPaperList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not delete paper.");
    }
  };

  const goalSubjects = subjectList.filter((s) => s.goalCategory === formData.goalCategory);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>Question Papers</h2>
          <p className="text-gray-500 text-sm">{paperList.length} papers in database</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1E3A8A] hover:bg-blue-900 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} /> Upload Paper
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search papers..."
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
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Type</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Year</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Analytics</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading papers...</span>
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((paper) => (
                    <tr key={paper.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{paper.title}</p>
                        <p className="text-xs text-gray-400 sm:hidden">{paper.subject}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{paper.subject}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeColors[paper.type] ?? "bg-gray-100 text-gray-600"}`}>{paper.type}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{paper.year}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${paper.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {paper.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <Eye size={11} /> {paper.analytics.views}
                          <Download size={11} className="ml-1" /> {paper.analytics.downloads}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {paper.hasFile && (
                            <button
                              onClick={() => void downloadPaperFile(paper.id, paper.fileName).catch((e) => setListError(e.message))}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download size={14} />
                            </button>
                          )}
                          <button onClick={() => handleEdit(paper)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => void handleDelete(paper.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                        {paperList.length === 0 ? "No papers yet. Upload your first paper." : "No papers found."}
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit paper" : "Upload paper"}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => { if (!saving) closeForm(); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-indigo-600" />
            <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-[#1E3A8A]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {editing ? "Edit Paper" : "Upload New Paper"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Saved to the database with the uploaded PDF</p>
              </div>
              <button
                onClick={closeForm}
                disabled={saving}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Paper Title *</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. SSC Mathematics March 2024 Board Paper"
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                  />
                </div>
                {[
                  { label: "Exam Goal", key: "goalCategory", type: "select", opts: GOAL_OPTIONS },
                  { label: "Year", key: "year", type: "select", opts: YEARS.map((y) => ({ value: y, label: String(y) })) },
                  { label: "Paper Type", key: "type", type: "select", opts: TYPE_OPTIONS },
                  { label: "Medium", key: "medium", type: "select", opts: [{ value: "english", label: "English" }, { value: "semi-english", label: "Semi-English" }, { value: "marathi", label: "Marathi" }] },
                  { label: "Marks", key: "marks", type: "number" },
                  { label: "Duration (min)", key: "durationMinutes", type: "number" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                    {f.type === "select" ? (
                      <select
                        value={(formData as any)[f.key]}
                        onChange={(e) => setFormData((p) => ({
                          ...p,
                          [f.key]: f.key === "year" ? Number(e.target.value) : e.target.value,
                          ...(f.key === "goalCategory" ? { subjectId: "" } : {}),
                        }))}
                        className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                      >
                        {f.opts?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData((p) => ({ ...p, subjectId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                  >
                    <option value="">{goalSubjects.length ? "Select Subject" : "No subjects — add in Subjects & Chapters"}</option>
                    {goalSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                    setError("Only PDF files are allowed.");
                    setPdfFile(null);
                    return;
                  }
                  setError("");
                  setPdfFile(file);
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#1E3A8A] transition-colors"
              >
                {pdfFile ? (
                  <>
                    <FileText size={24} className="mx-auto text-[#1E3A8A] mb-2" />
                    <p className="text-sm text-gray-700 font-medium">{pdfFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB · Click to replace</p>
                  </>
                ) : editing?.hasFile ? (
                  <>
                    <FileText size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">{editing.fileName || "Current PDF on file"}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to replace PDF (optional)</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload PDF (max 20MB)</p>
                    <p className="text-xs text-gray-400 mt-1">PDF format only</p>
                  </>
                )}
              </button>

              {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editing ? "Update Paper" : "Upload Paper"}
                </button>
                <button
                  onClick={closeForm}
                  disabled={saving}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
