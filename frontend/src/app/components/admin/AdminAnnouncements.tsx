import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, CheckCircle, Megaphone, Pin, Target, Loader2 } from "lucide-react";
import { GoalIcon } from "../shared/GoalIcons";
import type { AnnouncementPriority, GoalCategory } from "../data/mockData";
import { GOAL_METADATA } from "../data/mockData";
import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  fetchAdminAnnouncements,
  updateAdminAnnouncement,
  type AppAnnouncement,
} from "../../lib/api";

const PRIORITY_CONFIG: Record<AnnouncementPriority, { label: string; bg: string; text: string; border: string }> = {
  normal:    { label: "Normal",    bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200" },
  important: { label: "Important", bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-200" },
  urgent:    { label: "Urgent",    bg: "bg-red-50",    text: "text-red-700",   border: "border-red-200" },
};

const ALL_GOALS: (GoalCategory | "all")[] = [
  "all", "board-8", "board-9", "board-10", "board-11", "board-12",
  "neet", "jee-mains", "jee-advanced", "mht-cet-pcb", "mht-cet-pcm",
];

const EMPTY_FORM = {
  title: "",
  body: "",
  priority: "normal" as AnnouncementPriority,
  targetGoals: ["all"] as (GoalCategory | "all")[],
  expiresAt: "",
  isActive: true,
};

function goalLabel(g: GoalCategory | "all") {
  if (g === "all") return "All Students";
  return GOAL_METADATA[g]?.label ?? g;
}

export function AdminAnnouncements() {
  const [list, setList] = useState<AppAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AppAnnouncement | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [filterPriority, setFilterPriority] = useState<AnnouncementPriority | "all">("all");
  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadAnnouncements = async () => {
    setListError("");
    try {
      const data = await fetchAdminAnnouncements();
      setList(data.announcements);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnnouncements();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setError("");
    setSaved(false);
    setShowForm(true);
  };

  const openEdit = (ann: AppAnnouncement) => {
    setEditing(ann);
    setFormData({
      title: ann.title,
      body: ann.body,
      priority: ann.priority,
      targetGoals: (ann.targetGoals.length ? ann.targetGoals : ["all"]) as (GoalCategory | "all")[],
      expiresAt: ann.expiresAt || "",
      isActive: ann.isActive,
    });
    setError("");
    setSaved(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditing(null);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    if (!formData.title.trim() || !formData.body.trim()) {
      setError("Title and message are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { announcement } = await updateAdminAnnouncement(editing.id, formData);
        setList((prev) => prev.map((a) => (a.id === announcement.id ? announcement : a)));
      } else {
        const { announcement } = await createAdminAnnouncement(formData);
        setList((prev) => [announcement, ...prev]);
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setShowForm(false);
        setEditing(null);
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAdminAnnouncement(id);
      setList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not delete announcement.");
    }
  };

  const toggleActive = async (ann: AppAnnouncement) => {
    try {
      const { announcement } = await updateAdminAnnouncement(ann.id, {
        title: ann.title,
        body: ann.body,
        priority: ann.priority,
        targetGoals: ann.targetGoals,
        expiresAt: ann.expiresAt,
        isActive: !ann.isActive,
      });
      setList((prev) => prev.map((a) => (a.id === announcement.id ? announcement : a)));
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Could not update announcement.");
    }
  };

  const toggleGoal = (g: GoalCategory | "all") => {
    setFormData((prev) => {
      if (g === "all") return { ...prev, targetGoals: ["all"] };
      const without = prev.targetGoals.filter((x) => x !== "all" && x !== g);
      const hasIt = prev.targetGoals.includes(g);
      const next = hasIt ? without : [...without, g];
      return { ...prev, targetGoals: next.length === 0 ? ["all"] : next };
    });
  };

  const filtered = list.filter((a) => filterPriority === "all" || a.priority === filterPriority);
  const sorted = [...filtered].sort((a, b) => {
    const po = { urgent: 3, important: 2, normal: 1 };
    return (po[b.priority] ?? 0) - (po[a.priority] ?? 0);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A8A] font-['Poppins']">Announcements</h2>
          <p className="text-gray-500 text-sm">{list.length} total · {list.filter((a) => a.isActive).length} active</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1E3A8A] hover:bg-blue-900 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {listError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "urgent", "important", "normal"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer select-none
              ${filterPriority === p
                ? "bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white border-transparent shadow-[0_4px_14px_rgba(30,58,138,0.4)] scale-105"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:shadow-md hover:scale-105 active:scale-95"
              }`}
          >
            {p === "all" ? "All" : PRIORITY_CONFIG[p as AnnouncementPriority].label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeForm} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-[#1E3A8A] font-['Poppins']">
                {editing ? "Edit Announcement" : "New Announcement"}
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Announcement title"
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Message *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData((p) => ({ ...p, body: e.target.value }))}
                  placeholder="Write the full announcement message..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value as AnnouncementPriority }))}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Expires On</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData((p) => ({ ...p, expiresAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block flex items-center gap-1">
                  <Target size={11} /> Target Exam Goals
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_GOALS.map((g) => {
                    const selected = formData.targetGoals.includes(g);
                    const meta = g !== "all" ? GOAL_METADATA[g] : null;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGoal(g)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${selected ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-gray-500 border-gray-200"}`}
                      >
                        {meta && <GoalIcon category={g as GoalCategory} size={11} />}
                        {goalLabel(g)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#1E3A8A]"
                />
                <span className="text-sm text-gray-600">Mark as active (visible to students)</span>
              </label>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : saved ? <><CheckCircle size={15} /> Saved!</> : editing ? "Update" : "Publish"}
              </button>
              <button onClick={closeForm} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading announcements...
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ann) => {
            const cfg = PRIORITY_CONFIG[ann.priority] ?? PRIORITY_CONFIG.normal;
            const isUrgent = ann.priority === "urgent";
            return (
              <div
                key={ann.id}
                className={`rounded-2xl p-5 transition-opacity ${!ann.isActive ? "opacity-60" : ""} ${isUrgent ? "border-red-200" : "border-gray-100"}`}
                style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Megaphone size={16} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-gray-800 text-sm font-semibold font-['Poppins']">{ann.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        {!ann.isActive && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {ann.targetGoals.slice(0, 4).map((g) => (
                          <span key={g} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                            {goalLabel(g as GoalCategory | "all")}
                          </span>
                        ))}
                        {ann.targetGoals.length > 4 && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                            +{ann.targetGoals.length - 4} more
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">{ann.body}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>Created: {ann.createdAt || "—"}</span>
                        <span>·</span>
                        <span>Expires: {ann.expiresAt || "No expiry"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-start sm:mt-0.5 pl-12 sm:pl-0 flex-shrink-0">
                    <button
                      onClick={() => void toggleActive(ann)}
                      className={`p-1.5 rounded-lg transition-colors text-xs ${ann.isActive ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-gray-400 hover:bg-gray-50"}`}
                      title={ann.isActive ? "Deactivate" : "Activate"}
                    >
                      <Pin size={14} />
                    </button>
                    <button onClick={() => openEdit(ann)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => void handleDelete(ann.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="rounded-2xl p-12 text-center" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
              <Megaphone size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No announcements yet. Create one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
