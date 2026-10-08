import React, { useState, useRef, useEffect } from "react";
import {
  Brain, Clock, Target, ChevronRight, Bookmark, BookmarkCheck, Zap,
  Folder, FolderOpen, ArrowLeft, List, FolderTree, Award, Info, Search,
  GraduationCap, School, Stethoscope, Cog, BookOpen, Layers, Calendar, CalendarDays, FileText, X
} from "lucide-react";
import { useApp, EMPTY_GLOBAL_FILTER } from "../context/AppContext";
import { DIFFICULTY_CONFIG, PAPER_TYPE_CONFIG } from "../data/mockData";
import type { StudentQuiz } from "../../lib/api";
import type { FolderNode, FolderIconType } from "./FolderExplorer";
import { buildQuizFolders } from "./contentFolders";

// ── Contextual Icon Helper ────────────────────────────────────────────────────
function FolderIcon({ iconType, size = 20, className = "" }: { iconType?: FolderIconType; size?: number; className?: string }) {
  switch (iconType) {
    case "school": return <GraduationCap size={size} className={className} />;
    case "college": return <School size={size} className={className} />;
    case "engineering": return <Cog size={size} className={className} />;
    case "medical": return <Stethoscope size={size} className={className} />;
    case "by-subject": return <BookOpen size={size} className={className} />;
    case "by-type": return <Layers size={size} className={className} />;
    case "by-year": return <CalendarDays size={size} className={className} />;
    case "subject": return <BookOpen size={size} className={className} />;
    case "year": return <Calendar size={size} className={className} />;
    case "paper-type": return <FileText size={size} className={className} />;
    default: return <Folder size={size} className={className} />;
  }
}

// ── Category badge color helper ───────────────────────────────────────────────
function getOrganizerBadge(iconType?: FolderIconType): { label: string; bg: string; text: string; border: string } | null {
  switch (iconType) {
    case "by-subject": return { label: "Subjects", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "by-type": return { label: "Paper Types", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" };
    case "by-year": return { label: "Years", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    default: return null;
  }
}

function MarkingSchemePill({ correct, wrong }: { correct: number; wrong: number }) {
  const hasNeg = wrong < 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${hasNeg ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
      <Zap size={8} />
      +{correct}{hasNeg ? ` / ${wrong}` : " / 0"}
    </span>
  );
}

// ── Mobile Responsive Quiz Row Component ──────────────────────────────────────
function QuizRow({
  quiz,
  bookmarked,
  bestScore,
  onStart,
  onBookmark,
}: {
  quiz: StudentQuiz;
  bookmarked: boolean;
  bestScore?: number;
  onStart: () => void;
  onBookmark: () => void;
}) {
  const diffCfg = DIFFICULTY_CONFIG[quiz.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const hasAttempted = bestScore !== undefined;
  const { markingScheme: ms } = quiz;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 border border-white/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Icon + Title & Badges */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-600/15 text-[#1E3A8A] dark:text-violet-400 flex flex-col items-center justify-center font-bold flex-shrink-0 mt-0.5 border border-violet-500/20 shadow-2xs">
            <Brain size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[7px] sm:text-[8px] font-black tracking-wider uppercase text-violet-700 dark:text-violet-300 mt-0.5">QUIZ</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffCfg.bg} ${diffCfg.text}`}>
                {diffCfg.label}
              </span>
              <MarkingSchemePill correct={ms.correctMarks} wrong={ms.wrongMarks} />
              {hasAttempted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] border border-[#1E3A8A]/20">
                  Best {bestScore}%
                </span>
              )}
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-display tracking-tight group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors leading-snug">
              {quiz.title}
            </h3>
            {quiz.chapter && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{quiz.chapter}</p>
            )}
          </div>
        </div>

        {/* Middle & Right Footer Group on Mobile */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Metadata Specs */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 md:border-x border-slate-100 dark:border-slate-800 md:px-4">
            <span className="flex items-center gap-1">
              <Target size={13} className="text-slate-400" /> {quiz.questionsCount}Q
            </span>
            <span className="flex items-center gap-1 text-violet-700 dark:text-violet-400">
              <Clock size={13} /> {quiz.timeLimitMinutes}m
            </span>
            <span className="flex items-center gap-1 text-[#F97316]">
              <Award size={13} /> {quiz.totalMarks}M
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(e => !e)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border cursor-pointer ${
                expanded
                  ? "bg-blue-50 text-[#1E3A8A] border-blue-200"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100"
              }`}
              title="Toggle details"
            >
              <Info size={14} />
            </button>
            <button
              onClick={onBookmark}
              className="text-slate-400 hover:text-[#F97316] transition-colors p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              title={bookmarked ? "Remove from Saved" : "Save Quiz"}
            >
              {bookmarked ? (
                <BookmarkCheck size={15} className="text-[#F97316] fill-[#F97316]" />
              ) : (
                <Bookmark size={15} />
              )}
            </button>
            <button
              onClick={onStart}
              className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white px-3.5 py-2 rounded-xl text-xs font-bold font-['Poppins'] flex items-center gap-1 transition-colors shadow-xs active:scale-95 cursor-pointer min-h-[38px]"
            >
              {hasAttempted ? "Retake" : "Start"}
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Spec Drawer */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/60 p-2.5 rounded-xl animate-fade-in">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Marking Rule</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{ms.label}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Total Attempts</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{quiz.analytics.totalAttempts.toLocaleString()} Students</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Average Score</span>
            <span className="font-semibold text-blue-700 dark:text-blue-400">{quiz.analytics.avgScore} / {quiz.totalMarks} Marks</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root-Level Premium Hero Card ──────────────────────────────────────────────
function RootCategoryCard({
  folder,
  quizCount,
  subFolderCount,
  onClick,
}: {
  folder: FolderNode;
  quizCount: number;
  subFolderCount: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.01] active:scale-[0.985] cursor-pointer overflow-hidden"
    >
      {/* Gradient Top Accent Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${folder.color ?? "from-purple-600 to-indigo-700"}`} />

      <div className="p-4 sm:p-5">
        {/* Icon + Title Row */}
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${folder.color ?? "from-purple-600 to-indigo-700"} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
            <FolderIcon iconType={folder.iconType} size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-heading tracking-tight group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors leading-snug">
                {folder.name}
              </h3>
              {folder.badge && (
                <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${folder.color ?? "from-purple-600 to-indigo-700"} text-white shadow-xs flex-shrink-0 tracking-micro-caps`}>
                  {folder.badge}
                </span>
              )}
            </div>
            {folder.description && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{folder.description}</p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <Brain size={12} className="text-[#1E3A8A] dark:text-blue-400" />
            {quizCount} Quizzes
          </span>
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <Folder size={12} className="text-violet-600 dark:text-violet-400" />
            {subFolderCount} Folders
          </span>
          <div className="ml-auto flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#1E3A8A] dark:text-blue-400 group-hover:gap-2 transition-all">
            Open <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function QuizList() {
  const {
    setView, setSelectedQuizId, toggleBookmark, isBookmarked, completedAttempts,
    globalSearchFilter, setGlobalSearchFilter, studentQuizzes, studentContentLoading,
    user, currentGoal, refreshStudentContent,
  } = useApp();
  const [pathStack, setPathStack] = useState<FolderNode[]>([]);
  const [viewMode, setViewMode] = useState<"folders" | "flat">("flat");
  const [folderSearch, setFolderSearch] = useState("");

  const breadcrumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void refreshStudentContent();
  }, [refreshStudentContent]);

  const studentGoalCats = new Set(
    (user?.goals ?? []).map((g) => g.category).filter(Boolean),
  );
  if (currentGoal?.category) studentGoalCats.add(currentGoal.category);

  const matchingQuizzes = studentQuizzes.filter((q) => {
    if (studentGoalCats.size === 0) return true;
    if (!q.goalCategory) return true;
    return studentGoalCats.has(q.goalCategory);
  });
  const scopedQuizzes = matchingQuizzes.length > 0 ? matchingQuizzes : studentQuizzes;

  const contentFolders = buildQuizFolders(scopedQuizzes);

  // Check if globalSearchFilter has any active filters
  const hasGlobalFilter = Boolean(globalSearchFilter.search || globalSearchFilter.goalCategory || globalSearchFilter.subject || globalSearchFilter.paperType || globalSearchFilter.year);

  // Auto-switch to flat mode when global search filter is active
  useEffect(() => {
    if (hasGlobalFilter) {
      setViewMode("flat");
      setPathStack([]);
    }
  }, [hasGlobalFilter]);

  // Auto scroll breadcrumbs track rightward when navigating deeper
  useEffect(() => {
    if (breadcrumbRef.current) {
      breadcrumbRef.current.scrollLeft = breadcrumbRef.current.scrollWidth;
    }
  }, [pathStack]);

  // Reset folder search when path changes
  useEffect(() => {
    setFolderSearch("");
  }, [pathStack]);

  // Active folder level
  const currentFolder = pathStack.length > 0 ? pathStack[pathStack.length - 1] : null;
  const isRootLevel = pathStack.length === 0;
  const childFolders = currentFolder ? currentFolder.children ?? [] : contentFolders;

  // Filter conditions (from folder navigation OR global search)
  const activeGoal = hasGlobalFilter ? (globalSearchFilter.goalCategory || undefined) : pathStack.find(f => f.goalCategory)?.goalCategory;
  const activeStream = hasGlobalFilter ? (globalSearchFilter.stream || undefined) : pathStack.find(f => f.stream)?.stream;
  const activeSubject = hasGlobalFilter ? (globalSearchFilter.subject || undefined) : pathStack.find(f => f.subject)?.subject;
  const activeSearch = hasGlobalFilter ? globalSearchFilter.search : "";

  // Filter matching quizzes
  const filtered = scopedQuizzes.filter(q => {
    if (activeGoal && q.goalCategory !== activeGoal) return false;
    if (activeSubject && q.subject !== activeSubject) return false;
    if (activeSearch && !q.title.toLowerCase().includes(activeSearch.toLowerCase()) && !q.subject.toLowerCase().includes(activeSearch.toLowerCase()) && !(q.chapter && q.chapter.toLowerCase().includes(activeSearch.toLowerCase()))) return false;
    return true;
  });

  // Helper count
  const countQuizzesInFolder = (fNode: FolderNode): number => {
    const targetGoal = fNode.goalCategory ?? activeGoal;
    const targetSubject = fNode.subject ?? activeSubject;

    return scopedQuizzes.filter(q => {
      if (targetGoal && q.goalCategory !== targetGoal) return false;
      if (targetSubject && q.subject !== targetSubject) return false;
      return true;
    }).length;
  };

  // Count sub-folders recursively
  const countSubFolders = (fNode: FolderNode): number => {
    if (!fNode.children) return 0;
    return fNode.children.length + fNode.children.reduce((acc, c) => acc + countSubFolders(c), 0);
  };

  // Filter child folders by search + suppress empty leaf folders
  const visibleFolders = childFolders.filter(f => {
    if (folderSearch && !f.name.toLowerCase().includes(folderSearch.toLowerCase())) return false;
    return countQuizzesInFolder(f) > 0;
  });

  // Map quizId → best attempt percentage
  const bestScoreMap: Record<string, number> = {};
  completedAttempts.filter(a => !activeGoal || a.goalCategory === activeGoal).forEach(a => {
    if (!bestScoreMap[a.quizId] || a.percentage > bestScoreMap[a.quizId]) {
      bestScoreMap[a.quizId] = a.percentage;
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-3.5 min-w-0">

      {/* ── Active Global Search Filter Banner ── */}
      {hasGlobalFilter && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-purple-200/70 dark:border-purple-800 shadow-xs animate-apple-unveil">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center flex-shrink-0">
                <Brain size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white font-['Poppins']">
                  Search Results — {filtered.length} rank challenges found
                </p>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {globalSearchFilter.search && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1"><Search size={9} /> {globalSearchFilter.search}</span>
                  )}
                  {globalSearchFilter.goalCategory && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 inline-flex items-center gap-1"><GraduationCap size={9} /> {globalSearchFilter.goalCategory}</span>
                  )}
                  {globalSearchFilter.subject && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 inline-flex items-center gap-1"><BookOpen size={9} /> {globalSearchFilter.subject}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setGlobalSearchFilter(EMPTY_GLOBAL_FILTER); setViewMode("folders"); }}
              className="text-[11px] font-bold text-red-500 hover:text-red-600 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95 flex-shrink-0"
            >
              <X size={12} /> Clear Search
            </button>
          </div>
        </div>
      )}

      {/* ── Top Header & Single-Line Scrollable Breadcrumbs Control Bar ── */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-white/80 dark:border-slate-800 shadow-xs space-y-3 min-w-0">
        {/* Single-Line Scrollable Path Track */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div
            ref={breadcrumbRef}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 font-display tracking-tight overflow-x-auto whitespace-nowrap py-1 scroll-smooth flex-1 min-w-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => { setPathStack([]); setViewMode("folders"); }}
              className={`hover:underline flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg transition-colors flex-shrink-0 ${
                pathStack.length === 0
                  ? "text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  : "bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-100 dark:border-purple-800"
              }`}
            >
              <FolderTree size={13} /> Root Directory
            </button>
            {pathStack.map((node, idx) => (
              <React.Fragment key={node.id}>
                <ChevronRight size={11} className="text-slate-400 flex-shrink-0" />
                <button
                  onClick={() => setPathStack(prev => prev.slice(0, idx + 1))}
                  className={`hover:underline cursor-pointer px-2 py-1 rounded-lg transition-colors flex-shrink-0 ${
                    idx === pathStack.length - 1
                      ? "text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {node.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {pathStack.length > 0 && (
            <button
              onClick={() => setPathStack(prev => prev.slice(0, -1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 transition-all flex-shrink-0"
            >
              <ArrowLeft size={12} /> Back
            </button>
          )}
        </div>

        {/* Title & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2 leading-tight min-w-0">
            <Brain size={18} className="text-[#1E3A8A] dark:text-blue-400 flex-shrink-0" />
            <span className="whitespace-nowrap sm:whitespace-normal font-extrabold text-xs sm:text-lg tracking-tight">
              {currentFolder ? currentFolder.name : "Instant Rank Challenger Explorer"}
            </span>
          </h2>

          {/* Segmented Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => setViewMode("folders")}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "folders"
                  ? "bg-white dark:bg-slate-900 text-[#1E3A8A] dark:text-blue-400 shadow-xs font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <List size={13} /> Directory List
            </button>
            <button
              onClick={() => setViewMode("flat")}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "flat"
                  ? "bg-white dark:bg-slate-900 text-[#1E3A8A] dark:text-blue-400 shadow-xs font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Brain size={13} /> All Quizzes ({filtered.length})
            </button>
          </div>
        </div>

        {/* Quick Search for Folders (only when in folder mode & have children > 3) */}
        {viewMode === "folders" && childFolders.length > 3 && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={folderSearch}
              onChange={e => setFolderSearch(e.target.value)}
              placeholder="Search quiz categories & folders..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
            />
          </div>
        )}
      </div>

      {studentContentLoading && scopedQuizzes.length === 0 && (
        <div className="text-center py-14 text-slate-400 rounded-2xl bg-white/80 border border-slate-200">
          <p className="text-sm">Loading quizzes...</p>
        </div>
      )}

      {/* ── Root-Level Premium Hero Cards (2×2 Grid) ── */}
      {viewMode === "folders" && isRootLevel && visibleFolders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleFolders.map(folder => {
            const quizCount = countQuizzesInFolder(folder);
            const subFolderCount = countSubFolders(folder);
            return (
              <RootCategoryCard
                key={folder.id}
                folder={folder}
                quizCount={quizCount}
                subFolderCount={subFolderCount}
                onClick={() => setPathStack(prev => [...prev, folder])}
              />
            );
          })}
        </div>
      ) : null}

      {/* ── Non-Root Directory List Rows ── */}
      {viewMode === "folders" && !isRootLevel && visibleFolders.length > 0 ? (
        <div className="space-y-2">
          {visibleFolders.map(folder => {
            const quizCount = countQuizzesInFolder(folder);
            const orgBadge = getOrganizerBadge(folder.iconType);
            return (
              <div
                key={folder.id}
                onClick={() => setPathStack(prev => [...prev, folder])}
                className="group bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 border border-white/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.004] active:scale-[0.985] cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden"
              >
                {/* Main Folder Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br ${folder.color ?? "from-purple-600 to-indigo-700"} text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform flex-shrink-0`}>
                    <>
                      <FolderIcon iconType={folder.iconType} size={20} className="group-hover:hidden" />
                      <FolderOpen size={20} className="hidden group-hover:block" />
                    </>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-['Poppins'] group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {folder.name}
                      </h3>
                      {folder.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800 flex-shrink-0">
                          {folder.badge}
                        </span>
                      )}
                      {orgBadge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${orgBadge.bg} ${orgBadge.text} border ${orgBadge.border} flex-shrink-0`}>
                          {orgBadge.label}
                        </span>
                      )}
                    </div>
                    {folder.description && (
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{folder.description}</p>
                    )}
                  </div>
                </div>

                {/* Right Side: Quiz Count Badge & Arrow */}
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700 flex items-center gap-1.5">
                    <Brain size={12} className="text-[#1E3A8A] dark:text-blue-400" />
                    <span>{quizCount} Quizzes</span>
                  </span>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── Mode 2 / Leaf View: Detailed Quiz Rows ── */}
      {(viewMode === "flat" || (viewMode === "folders" && visibleFolders.length === 0)) && (
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-14 text-slate-400 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-sm p-4">
              <Brain size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-slate-500 font-medium text-xs sm:text-sm">
                {studentContentLoading ? "Loading quizzes..." : "No published quizzes for your exam goal yet."}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Ask your admin to publish quizzes for this goal.</p>
              <button onClick={() => setPathStack([])} className="mt-2 text-[#1E3A8A] dark:text-blue-400 text-xs font-semibold hover:underline">
                Back to Root Directory
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map(quiz => {
                const bookmarked = isBookmarked("quiz", quiz.id);
                const bestScore = bestScoreMap[quiz.id];

                return (
                  <QuizRow
                    key={quiz.id}
                    quiz={quiz}
                    bookmarked={bookmarked}
                    bestScore={bestScore}
                    onStart={() => {
                      setSelectedQuizId(quiz.id);
                      setView("quiz-detail");
                    }}
                    onBookmark={() => toggleBookmark("quiz", quiz.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
