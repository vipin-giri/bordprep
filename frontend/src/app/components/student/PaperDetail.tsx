import { ArrowLeft, Bookmark, BookmarkCheck, Eye, Clock, Award, Calendar, FileText, ZoomIn, ZoomOut, Zap, Printer } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { PAPER_TYPE_CONFIG } from "../data/mockData";

export function PaperDetail() {
  const { selectedPaperId, setSelectedPaperId, setView, toggleBookmark, isBookmarked, studentPapers, studentContentLoading } = useApp();
  const [viewing, setViewing] = useState(false);
  const [zoom, setZoom] = useState(100);

  const paper = studentPapers.find(p => p.id === selectedPaperId);
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
  const typeCfg = PAPER_TYPE_CONFIG[paper.type] ?? PAPER_TYPE_CONFIG["practice"];

  const handlePrint = () => {
    setViewing(true);
    setTimeout(() => {
      window.print();
    }, 200);
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
              {paper.standard && <span className="bg-blue-50 text-[#1E3A8A] px-2.5 py-0.5 sm:py-1 rounded-full font-semibold">Class {paper.standard}</span>}
              {paper.session && <span className="bg-violet-50 text-violet-700 px-2.5 py-0.5 sm:py-1 rounded-full capitalize">{paper.session}</span>}
              {paper.shift && <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 sm:py-1 rounded-full capitalize">{paper.shift.replace("-", " ")}</span>}
              {paper.paperNumber && <span className="bg-green-50 text-green-700 px-2.5 py-0.5 sm:py-1 rounded-full capitalize">{paper.paperNumber.replace("-", " ")}</span>}
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 sm:py-1 rounded-full font-bold flex items-center gap-1">
                <Zap size={11} className="inline mr-0.5" /> Offline Sync Ready
              </span>
            </div>

            <h1 className="text-base sm:text-xl font-heading font-extrabold text-[#1E3A8A] mb-1.5 leading-snug tracking-tight">{paper.title}</h1>
            <p className="text-slate-500 font-display text-xs sm:text-sm font-medium">{paper.subject}</p>
          </div>

          <button
            onClick={() => toggleBookmark("paper", paper.id)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              bookmarked ? "border-[#F97316] bg-orange-50 text-[#F97316]" : "border-slate-200 text-slate-600 hover:border-[#F97316] hover:text-[#F97316]"
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
        </div>
      </div>

      {/* PDF Viewer */}
      {viewing && (
        <div className="rounded-2xl p-4 sm:p-5 transition-all duration-300" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(30,58,138,0.06)" }}>
          <div className="flex items-center justify-between mb-4 no-print flex-wrap gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#1E3A8A] font-heading">PDF Viewer</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(50, z - 10))}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} className="text-slate-500" />
              </button>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(200, z + 10))}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Scrollable Container around Scaled PDF View */}
          <div className="overflow-x-auto max-w-full pb-2">
            <div id="printable-paper-view" className="bg-slate-100 rounded-xl p-2 sm:p-4 min-h-80 flex flex-col items-center justify-center" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
              <div className="bg-white shadow-md rounded-xl w-full max-w-2xl p-4 sm:p-8">
                <div className="text-center mb-6 sm:mb-8 border-b border-slate-200 pb-5">
                  <div className="text-xs text-slate-500 mb-1">Maharashtra State Board of Secondary & Higher Secondary Education</div>
                  <h2 className="text-base sm:text-xl font-bold font-heading text-[#1E3A8A] mb-1">{paper.title}</h2>
                  <div className="flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 mt-2.5 font-medium flex-wrap">
                    <span>Time: {paper.durationMinutes} minutes</span>
                    <span>Total Marks: {paper.marks}</span>
                  </div>
                </div>
                <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-display">
                  <div className="font-bold text-slate-800">General Instructions:</div>
                  <ol className="list-decimal pl-4 sm:pl-5 space-y-1.5 text-slate-600">
                    <li>All questions are compulsory unless stated otherwise.</li>
                    <li>Write the question number correctly.</li>
                    <li>Draw neat diagrams wherever necessary.</li>
                    <li>Calculators are not allowed.</li>
                    <li>Use of blue/black ink pen is compulsory.</li>
                  </ol>
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="font-bold text-slate-800 mb-3 font-heading">Section A — Multiple Choice Questions (20 marks)</div>
                    <div className="space-y-3 text-slate-600">
                      <div>Q1. Choose the correct alternative: (All questions carry 1 mark each)</div>
                      <div className="pl-3 sm:pl-4">
                        <div className="font-medium text-slate-800">i. Which of the following is a rational number?</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-500 mt-1.5 pl-2 text-xs sm:text-sm">
                          <div>a) √2</div>
                          <div>b) √3</div>
                          <div className="font-semibold text-emerald-700">c) √4</div>
                          <div>d) √5</div>
                        </div>
                      </div>
                      <div className="pl-3 sm:pl-4">
                        <div className="font-medium text-slate-800">ii. The formula for sum of first n terms of an AP with first term a and common difference d is:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-500 mt-1.5 pl-2 text-xs">
                          <div>a) Sn = n/2[2a+(n-1)d]</div>
                          <div>b) Sn = n[a+(n-1)d]</div>
                          <div>c) Sn = n/2[a+l]</div>
                          <div className="font-semibold text-emerald-700">d) Both a and c</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-slate-400 text-[10px] sm:text-xs mt-6 border-t pt-4 font-mono">
                    *** This is a preview. Download the full PDF for complete question paper. ***
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Papers */}
      <div className="rounded-2xl p-4 sm:p-5 mt-5 bg-white/80 border border-slate-200/80 shadow-xs">
        <h3 className="mb-3 text-xs sm:text-sm font-bold font-heading text-[#1E3A8A]">Related Papers</h3>
        <div className="space-y-2">
          {studentPapers.filter(p => (p.goalCategory === paper.goalCategory) && p.id !== paper.id).slice(0, 3).map(rp => {
            const rpCfg = PAPER_TYPE_CONFIG[rp.type] ?? PAPER_TYPE_CONFIG["practice"];
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
    </div>
  );
}
