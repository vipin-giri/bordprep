import { useEffect, useState } from "react";
import {
  Search, Shield, ShieldOff, Eye, X, Mail, BookOpen, Brain, Trophy, Calendar,
  Edit2, Trash2, Loader2, CheckCircle,
} from "lucide-react";
import {
  deleteAdminStudent,
  fetchAdminStudents,
  setAdminStudentBlocked,
  updateAdminStudent,
  type AdminStudent,
} from "../../lib/api";

const GOAL_OPTIONS = [
  { value: "all", label: "All Exam Goals" },
  { value: "neet", label: "NEET UG" },
  { value: "jee-mains", label: "JEE Mains" },
  { value: "jee-advanced", label: "JEE Advanced" },
  { value: "board-10", label: "SSC Class 10" },
  { value: "board-12", label: "HSC Class 12" },
  { value: "board-8", label: "Class 8" },
  { value: "board-9", label: "Class 9" },
  { value: "board-11", label: "Class 11" },
  { value: "mht-cet-pcb", label: "MHT-CET PCB" },
  { value: "mht-cet-pcm", label: "MHT-CET PCM" },
];

export function AdminUsers() {
  const [studentList, setStudentList] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGoal, setFilterGoal] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [editing, setEditing] = useState<AdminStudent | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", medium: "english" });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const loadStudents = async () => {
    setError("");
    try {
      const data = await fetchAdminStudents();
      setStudentList(data.students);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  const filtered = studentList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchGoal = filterGoal === "all" || s.goalCategories.includes(filterGoal);
    const matchStatus = filterStatus === "all" || (filterStatus === "blocked" ? s.isBlocked : !s.isBlocked);
    return matchSearch && matchGoal && matchStatus;
  });

  const patchStudent = (student: AdminStudent) => {
    setStudentList((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    if (selectedStudent?.id === student.id) setSelectedStudent(student);
    if (editing?.id === student.id) setEditing(student);
  };

  const handleBlock = async (student: AdminStudent) => {
    setActionId(student.id);
    setError("");
    try {
      const { student: next } = await setAdminStudentBlocked(student.id, !student.isBlocked);
      patchStudent(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update block status.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (student: AdminStudent) => {
    if (!window.confirm(`Delete ${student.name}? This cannot be undone.`)) return;
    setActionId(student.id);
    setError("");
    try {
      await deleteAdminStudent(student.id);
      setStudentList((prev) => prev.filter((s) => s.id !== student.id));
      if (selectedStudent?.id === student.id) setSelectedStudent(null);
      if (editing?.id === student.id) setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete student.");
    } finally {
      setActionId(null);
    }
  };

  const openEdit = (student: AdminStudent) => {
    setEditing(student);
    setEditForm({
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      medium: student.medium || "english",
    });
    setError("");
    setSaved(false);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { student } = await updateAdminStudent(editing.id, editForm);
      patchStudent(student);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setEditing(null);
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update student.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {selectedStudent && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1E3A8A" }}>Student Profile</h3>
                <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h4 className="text-gray-800" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{selectedStudent.name}</h4>
                  <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                    <Mail size={12} /> {selectedStudent.email}
                  </div>
                  {selectedStudent.phone && (
                    <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.phone}</p>
                  )}
                  <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${selectedStudent.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {selectedStudent.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: BookOpen, label: "Primary Goal", value: selectedStudent.goalLabels[0] ?? "—" },
                  { icon: Brain, label: "Medium", value: selectedStudent.medium },
                  { icon: Trophy, label: "Total Attempts", value: selectedStudent.totalAttempts },
                  { icon: Calendar, label: "Streak", value: `${selectedStudent.streak} days` },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                    <item.icon size={16} className="text-[#1E3A8A] flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm text-gray-700 capitalize">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <div className="text-xs text-gray-500 mb-2">Avg Score</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1E3A8A] rounded-full" style={{ width: `${selectedStudent.avgScore}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-[#1E3A8A]">{selectedStudent.avgScore}%</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="text-xs text-gray-500 mb-2">Exam Goals</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.goalLabels.length ? selectedStudent.goalLabels.map((label) => (
                    <span key={label} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{label}</span>
                  )) : (
                    <span className="text-xs text-gray-400">No goals selected yet</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setSelectedStudent(null); openEdit(selectedStudent); }}
                  className="w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 size={15} /> Edit Student
                </button>
                <button
                  onClick={() => void handleBlock(selectedStudent)}
                  disabled={actionId === selectedStudent.id}
                  className={`w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${selectedStudent.isBlocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                >
                  {selectedStudent.isBlocked ? <><Shield size={15} /> Unblock Student</> : <><ShieldOff size={15} /> Block Student</>}
                </button>
                <button
                  onClick={() => void handleDelete(selectedStudent)}
                  disabled={actionId === selectedStudent.id}
                  className="w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 size={15} /> Delete Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => { if (!saving) setEditing(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-indigo-600" />
            <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-[#1E3A8A]" style={{ fontFamily: "Poppins, sans-serif" }}>Edit Student</h3>
                <p className="text-xs text-gray-400 mt-0.5">Changes are saved to the database</p>
              </div>
              <button onClick={() => setEditing(null)} disabled={saving} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Medium</label>
                <select
                  value={editForm.medium}
                  onChange={(e) => setEditForm((p) => ({ ...p, medium: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                >
                  <option value="english">English</option>
                  <option value="semi-english">Semi-English</option>
                  <option value="marathi">Marathi</option>
                </select>
              </div>
              {error && editing && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => void handleSaveEdit()}
                  disabled={saving}
                  className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : saved ? <><CheckCircle size={15} /> Saved</> : "Save Changes"}
                </button>
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>Students</h2>
          <p className="text-gray-500 text-sm">{studentList.length} registered students in database</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">{studentList.filter((s) => !s.isBlocked).length} Active</span>
          <span className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-full font-medium">{studentList.filter((s) => s.isBlocked).length} Blocked</span>
        </div>
      </div>

      {error && !editing && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A] bg-white"
          />
        </div>
        <select
          value={filterGoal}
          onChange={(e) => setFilterGoal(e.target.value)}
          className="border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-white"
        >
          {GOAL_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Student</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden sm:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Goal</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Attempts</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Avg Score</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Status</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading students...</span>
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((student) => (
                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {student.name[0]}
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">{student.goalLabels[0] ?? "—"}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{student.totalAttempts}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1E3A8A] rounded-full" style={{ width: `${student.avgScore}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{student.avgScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${student.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                          {student.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedStudent(student)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View details">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEdit(student)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => void handleBlock(student)}
                            disabled={actionId === student.id}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${student.isBlocked ? "text-green-600 hover:bg-green-50" : "text-red-400 hover:bg-red-50"}`}
                            title={student.isBlocked ? "Unblock" : "Block"}
                          >
                            {student.isBlocked ? <Shield size={14} /> : <ShieldOff size={14} />}
                          </button>
                          <button
                            onClick={() => void handleDelete(student)}
                            disabled={actionId === student.id}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No students in the database yet.</td></tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
