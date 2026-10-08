import { useState } from "react";
import { Bookmark, BookOpen, Brain, Trash2, Eye, ChevronRight, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PAPER_TYPE_CONFIG, DIFFICULTY_CONFIG } from "../data/mockData";

type Tab = "all" | "papers" | "quizzes";

export function Bookmarks() {
  const { bookmarks, toggleBookmark, setView, setSelectedPaperId, setSelectedQuizId, studentPapers, studentQuizzes } = useApp();
  const [tab, setTab] = useState<Tab>("all");

  const bookmarkedPapers = bookmarks
    .filter(b => b.type === "paper")
    .map(b => ({ bookmark: b, paper: studentPapers.find(p => p.id === b.refId) }))
    .filter((b): b is { bookmark: typeof b.bookmark; paper: NonNullable<typeof b.paper> } => !!b.paper);

  const bookmarkedQuizzes = bookmarks
    .filter(b => b.type === "quiz")
    .map(b => ({ bookmark: b, quiz: studentQuizzes.find(q => q.id === b.refId) }))
    .filter((b): b is { bookmark: typeof b.bookmark; quiz: NonNullable<typeof b.quiz> } => !!b.quiz);

  const totalCount = bookmarks.length;
  const papersCount = bookmarkedPapers.length;
  const quizzesCount = bookmarkedQuizzes.length;

  // Empty state
  if (totalCount === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-[#1E3A8A] font-['Poppins'] mb-6">Saved Items</h2>
        <div className="text-center py-20 rounded-2xl" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <Bookmark size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-600 font-semibold font-['Poppins'] mb-1">No saved items yet</p>
          <p className="text-gray-400 text-sm mb-6">Save papers and quizzes for quick access later</p>
          <div className="flex gap-3 justify-center flex-wrap px-4">
            <button
              onClick={() => setView("papers")}
              className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]"
            >
              Browse Papers
            </button>
            <button
              onClick={() => setView("quizzes")}
              className="border border-[#1E3A8A] text-[#1E3A8A] px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]"
            >
              Browse Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#1E3A8A] font-['Poppins']">Saved Items</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {totalCount} saved item{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-full sm:w-fit">
        {([
          { value: "all", label: "All", count: totalCount },
          { value: "papers", label: "Papers", count: papersCount },
          { value: "quizzes", label: "Quizzes", count: quizzesCount },
        ] as const).map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[40px] cursor-pointer select-none ${tab === t.value
                ? "bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-[0_4px_12px_rgba(30,58,138,0.35)]"
                : "text-gray-500 hover:text-[#1E3A8A] hover:bg-white/60 active:scale-95"
              }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.value ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Papers Section ── */}
      {(tab === "all" || tab === "papers") && bookmarkedPapers.length > 0 && (
        <div className="mb-6">
          {tab === "all" && (
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2 text-sm">
                <BookOpen size={16} className="text-blue-600" /> Question Papers
                <span className="text-xs text-gray-400 font-normal">({papersCount})</span>
              </h3>
              <button onClick={() => setTab("papers")} className="text-xs text-[#1E3A8A] hover:underline">
                View all
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarkedPapers.map(({ bookmark, paper }) => {
              const typeCfg = PAPER_TYPE_CONFIG[paper.type];
              return (
                <div
                  key={bookmark.id}
                  className="rounded-2xl p-4 flex items-start gap-3 transition-all duration-200" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={17} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                        style={{ background: typeCfg.bg, color: typeCfg.text, borderColor: typeCfg.border }}
                      >
                        {typeCfg.label}
                      </span>
                      <span className="text-[10px] text-gray-400">{paper.year}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 font-['Poppins'] leading-snug line-clamp-2">
                      {paper.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{paper.subject} · {paper.marks}M · {paper.durationMinutes}min</p>
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={() => { setSelectedPaperId(paper.id); setView("paper-detail"); }}
                        className="text-xs bg-[#1E3A8A] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium min-h-[30px]"
                      >
                        <Eye size={11} /> View
                      </button>
                      <button
                        onClick={() => toggleBookmark("paper", paper.id)}
                        className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors min-h-[30px]"
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quizzes Section ── */}
      {(tab === "all" || tab === "quizzes") && bookmarkedQuizzes.length > 0 && (
        <div>
          {tab === "all" && (
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2 text-sm">
                <Brain size={16} className="text-violet-600" /> Instant Rank Challenger
                <span className="text-xs text-gray-400 font-normal">({quizzesCount})</span>
              </h3>
              <button onClick={() => setTab("quizzes")} className="text-xs text-[#1E3A8A] hover:underline">
                View all
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarkedQuizzes.map(({ bookmark, quiz }) => {
              const diffCfg = DIFFICULTY_CONFIG[quiz.difficulty] ?? DIFFICULTY_CONFIG.medium;
              const ms = quiz.markingScheme;
              return (
                <div
                  key={bookmark.id}
                  className="rounded-2xl p-4 flex items-start gap-3 transition-all duration-200" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}
                >
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain size={17} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: diffCfg.bg, color: diffCfg.text }}
                      >
                        {diffCfg.label}
                      </span>
                      {ms.hasNegativeMarking && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">
                          +{ms.correctMarks}/{ms.wrongMarks}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 font-['Poppins'] leading-snug line-clamp-2">
                      {quiz.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {quiz.questionsCount}Q · {quiz.timeLimitMinutes}min · {quiz.totalMarks}M
                    </p>
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={() => { setSelectedQuizId(quiz.id); setView("quiz-detail"); }}
                        className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium min-h-[30px] transition-colors"
                      >
                        Start <ChevronRight size={11} />
                      </button>
                      <button
                        onClick={() => toggleBookmark("quiz", quiz.id)}
                        className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors min-h-[30px]"
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for tab with no content */}
      {tab === "papers" && papersCount === 0 && (
        <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <FileText size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium text-sm">No saved papers yet</p>
          <button onClick={() => setView("papers")} className="mt-3 text-[#1E3A8A] text-sm hover:underline">
            Browse Papers
          </button>
        </div>
      )}
      {tab === "quizzes" && quizzesCount === 0 && (
        <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <Brain size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium text-sm">No saved quizzes yet</p>
          <button onClick={() => setView("quizzes")} className="mt-3 text-[#1E3A8A] text-sm hover:underline">
            Browse Quizzes
          </button>
        </div>
      )}
    </div>
  );
}
