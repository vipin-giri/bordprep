import { ArrowLeft, Bookmark, BookmarkCheck, Eye, Clock, Award, Calendar, FileText, ZoomIn, ZoomOut, Zap, Printer, Download, Lock, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { PAPER_TYPE_CONFIG } from "../data/mockData";
import { studentPaperFileUrl, fetchSolutionMeta, studentSolutionFileUrl, type SolutionMeta } from "../../lib/api";
import { SolutionPaymentModal } from "./SolutionPaymentModal";

export function PaperDetail() {
  const { selectedPaperId, setSelectedPaperId, setView, toggleBookmark, isBookmarked, studentPapers, studentContentLoading, user } = useApp();
  const [viewing, setViewing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [solutionMeta, setSolutionMeta] = useState<SolutionMeta | null>(null);
  const [solutionMetaLoading, setSolutionMetaLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [solutionViewing, setSolutionViewing] = useState(false);
  const [activeTab, setActiveTab] = useState<"question" | "solution">("question");

  const paper = studentPapers.find(p => p.id === selectedPaperId);

  useEffect(() => {
    if (!paper?.id) return;
    setSolutionMetaLoading(true);
    fetchSolutionMeta(paper.id)
      .then(setSolutionMeta)
      .catch(() => setSolutionMeta(null))
      .finally(() => setSolutionMetaLoading(false));
  }, [paper?.id]);

  if (studentContentLoading && !paper) {
    return <div className="text-center py-20 text-gray-400"><p>Loading paper...</p></div>;
  }
  if (!paper) return (
    <div className="text-center py-20 text-gray-400">
      <p>Paper not found.</p>
      <button onClick={() => setView("papers")} className="mt-3 text-[#1E3A8A]">Back to Papers</button>
    </div>
  );

  const bookmarked = isBookmarked("paper", paper.id);
  const typeCfg = (PAPER_TYPE_CONFIG as any)[paper.type] ?? PAPER_TYPE_CONFIG["practice"];
  const pdfUrl = studentPaperFileUrl(paper.id);
  const solutionPdfUrl = studentSolutionFileUrl(paper.id);

  const handlePrint = () => {
    if (!paper.hasFile) return;
    window.open(pdfUrl, "_blank");
  };

  const handleDownload = () => {
    if (!paper.hasFile) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = (paper.fileName ?? paper.title) + ".pdf";
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-1 sm:px-0">
      {/* Back */}
      <button onClick={() => setView("papers")} className="flex items-center gap-2 text-slate-500 hover:text-[#1E3A8A] mb-3 sm:mb-4 transition-colors text-xs sm:text-sm font-medium no-print cursor-pointer">
        <ArrowLeft size={16} /> Back to Papers
      </button>

      <div className="rounded-2xl p-4 sm:p-6 mb-5 no-print" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(30,58,138,0.06)" }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Responsive Metadata Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 text-[10px] sm:text-xs font-medium">
              <span
                className="px-2.5 py-0.5 sm:py-1 rounded-full border"
                style={{ background: typeCfg.bg, color: typeCfg.text, borderColor: typeCfg.border }}
              >
                {typeCfg.label}
              </span>
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 sm:py-1 rounded-full font-semibold">{paper.year}</span>
              {paper.medium && <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 sm:py-1 rounded-full capitalize">{paper.medium}</span>}
              {(paper as any).standard && <span className="bg-blue-50 text-[#1E3A8A] px-2.5 py-0.5 sm:py-1 rounded-full font-semibold">Class {(paper as any).standard}</span>}
              {(paper as any).session && <span className="bg-violet-50 text-violet-700 px-2.5 py-0.5 sm:py-1 rounded-full capitalize">{(paper as any).session}</span>}
              {(paper as any).shift && <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 sm:py-1 rounded-full capitalize">{(paper as any).shift.replace("-", " ")}</span>}
              {(paper as any).paperNumber && <span className="bg-green-50 text-green-700 px-2.5 py-0.5 sm:py-1 rounded-full capitalize">{(paper as any).paperNumber.replace("-", " ")}</span>}
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 sm:py-1 rounded-full font-bold flex items-center gap-1">
                <Zap size={11} className="inline mr-0.5" /> Offline Sync Ready
              </span>
            </div>

            <h1 className="text-base sm:text-xl font-heading font-extrabold text-[#1E3A8A] mb-1.5 leading-snug tracking-tight">{paper.title}</h1>
            <p className="text-slate-500 font-display text-xs sm:text-sm font-medium">{paper.subject}</p>
          </div>

          <button
            onClick={() => toggleBookmark("paper", paper.id)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${bookmarked ? "border-[#F97316] bg-orange-50 text-[#F97316]" : "border-slate-200 text-slate-600 hover:border-[#F97316] hover:text-[#F97316]"
              }`}
          >
            {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span>{bookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-5 pt-4 border-t border-slate-100">
          {[
            { icon: Award, label: "Total Marks", value: `${paper.marks} marks` },
            { icon: Clock, label: "Duration", value: `${paper.durationMinutes} min` },
            { icon: Calendar, label: "Year", value: paper.year.toString() },
            { icon: Eye, label: "Total Views", value: paper.analytics.views.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="text-center p-2.5 sm:p-3 bg-slate-50/80 rounded-xl border border-slate-100 min-w-0">
              <s.icon size={16} className="mx-auto text-slate-400 mb-1" />
              <div className="font-bold text-slate-800 text-xs sm:text-sm truncate font-heading">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5">
          {paper.hasFile ? (
            <>
              <button
                onClick={() => setViewing(!viewing)}
                className="w-full sm:flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer shadow-xs active:scale-95"
              >
                <Eye size={16} /> {viewing ? "Close Viewer" : "View PDF Online"}
              </button>
              <button
                onClick={handlePrint}
                className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer shadow-xs active:scale-95"
              >
                <Printer size={16} /> Print / Save as PDF
              </button>
              <button
                onClick={handleDownload}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer shadow-xs active:scale-95"
              >
                <Download size={16} /> Download PDF
              </button>
              {/* Solution unlock button */}
              {!solutionMetaLoading && solutionMeta?.hasSolution && (
                solutionMeta.purchased ? (
                  <button
                    onClick={() => { setSolutionViewing(!solutionViewing); setActiveTab("solution"); }}
                    className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer shadow-xs active:scale-95"
                  >
                    <BookOpen size={16} /> {solutionViewing ? "Close Solution" : "View Solution PDF"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="w-full sm:flex-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer shadow-xs active:scale-95"
                  >
                    <Lock size={16} /> Unlock Solution · ₹{solutionMeta.priceRupees}
                  </button>
                )
              )}
            </>
          ) : (
            <div className="w-full text-center py-3 rounded-xl bg-slate-100 text-slate-400 text-xs sm:text-sm font-medium border border-slate-200">
              <FileText size={16} className="inline mr-1.5 opacity-50" />
              No PDF uploaded for this paper yet.
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer — supports side-by-side (desktop) / tabs (mobile) */}
      {viewing && paper.hasFile && (
        <>
          {/* Tab bar — mobile only when solution is also viewing */}
          {solutionViewing && (
            <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-3 sm:hidden">
              <button
                onClick={() => setActiveTab("question")}
                className={`flex-1 py-2 text-xs font-bold transition-colors ${activeTab === "question" ? "bg-[#1E3A8A] text-white" : "bg-white text-slate-500"}`}
              >
                📄 Question Paper
              </button>
              <button
                onClick={() => setActiveTab("solution")}
                className={`flex-1 py-2 text-xs font-bold transition-colors ${activeTab === "solution" ? "bg-amber-500 text-white" : "bg-white text-slate-500"}`}
              >
                📖 Solution
              </button>
            </div>
          )}

          {/* Viewer area — split on desktop, tabs on mobile */}
          <div className={`rounded-2xl overflow-hidden mb-5 ${solutionViewing ? "sm:grid sm:grid-cols-2 sm:gap-3" : ""}`} style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(30,58,138,0.06)" }}>
            {/* Question paper panel */}
            <div className={solutionViewing && activeTab === "solution" ? "hidden sm:block" : ""}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-[#1E3A8A] font-heading">📄 Question Paper</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"><ZoomOut size={12} className="text-slate-500" /></button>
                  <span className="text-xs font-semibold text-slate-600 w-8 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"><ZoomIn size={12} className="text-slate-500" /></button>
                </div>
              </div>
              <div style={{ height: solutionViewing ? "70vh" : "80vh" }}>
                <iframe src={`${pdfUrl}#zoom=${zoom}`} title={paper.title} style={{ width: "100%", height: "100%", border: "none", display: "block" }} allow="fullscreen" />
              </div>
            </div>

            {/* Solution panel — only shown if purchased + solutionViewing */}
            {solutionViewing && (
              <div className={activeTab === "question" ? "hidden sm:block" : ""}>
                <div className="flex items-center px-4 py-3 border-b border-amber-100 bg-amber-50/50">
                  <h3 className="text-xs sm:text-sm font-bold text-amber-700 font-heading">📖 Solution PDF</h3>
                </div>
                <div style={{ height: "70vh" }}>
                  <iframe src={`${solutionPdfUrl}`} title="Solution" style={{ width: "100%", height: "100%", border: "none", display: "block" }} allow="fullscreen" />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Related Papers */}
      <div className="rounded-2xl p-4 sm:p-5 mt-5 bg-white/80 border border-slate-200/80 shadow-xs">
        <h3 className="mb-3 text-xs sm:text-sm font-bold font-heading text-[#1E3A8A]">Related Papers</h3>
        <div className="space-y-2">
          {studentPapers.filter(p => (p.goalCategory === paper.goalCategory) && p.id !== paper.id).slice(0, 3).map(rp => {
            const rpCfg = (PAPER_TYPE_CONFIG as any)[rp.type] ?? PAPER_TYPE_CONFIG["practice"];
            return (
              <button
                key={rp.id}
                onClick={() => { setSelectedPaperId(rp.id); }}
                className="w-full text-left flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200/60"
              >
                <FileText size={15} className="text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate font-heading">{rp.title}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{rp.year} · {rp.marks} marks</p>
                </div>
                <span
                  className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0"
                  style={{ background: rpCfg.bg, color: rpCfg.text, borderColor: rpCfg.border }}
                >
                  {rpCfg.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Solution Payment Modal */}
      {showPayModal && solutionMeta && (
        <SolutionPaymentModal
          paperId={paper.id}
          paperTitle={paper.title}
          priceRupees={solutionMeta.priceRupees ?? 0}
          razorpayKeyId={solutionMeta.razorpayKeyId}
          userEmail={user?.email}
          userName={user?.name}
          onSuccess={() => {
            setShowPayModal(false);
            setSolutionMeta(prev => prev ? { ...prev, purchased: true } : prev);
            setSolutionViewing(true);
            setActiveTab("solution");
            setViewing(true);
          }}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </div>
  );
}
