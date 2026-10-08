import { ReactNode, useState, useRef, useEffect, useCallback } from "react";
import {
  LayoutDashboard, FileText, Brain, Bookmark, User,
  LogOut, Bell, X, Moon, Sun, Search,
  BookOpen, Layers, CalendarDays, Award, Clock, Eye, Command,
  GraduationCap, Calendar, Target,
} from "lucide-react";
import { useApp } from "../context/AppContext";

import type { View } from "../context/AppContext";
import type { PaperType } from "../data/mockData";
import { PAPER_TYPE_CONFIG } from "../data/mockData";
import { HierarchicalFilter, EMPTY_FILTER, resolveGoalCategory, filterBreadcrumb } from "./HierarchicalFilter";
import type { HierarchicalFilterState } from "./HierarchicalFilter";

const RECENT_SEARCH_KEY = "pariksha_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function addRecentSearch(term: string) {
  if (!term.trim()) return;
  const prev = getRecentSearches().filter(s => s !== term);
  const next = [term, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
}

const LogoImage = new URL("../../../imports/logo.png", import.meta.url).href;

const navItems: { icon: any; label: string; view: View | "explore" }[] = [
  { icon: LayoutDashboard, label: "Dashboard",       view: "dashboard" },
  { icon: Search,          label: "Search & Filter", view: "explore"   },
  { icon: FileText,        label: "Papers",           view: "papers"    },
  { icon: Brain,           label: "Quizzes",          view: "quizzes"   },
  { icon: Bookmark,        label: "Saved",            view: "bookmarks" },
  { icon: User,            label: "Profile",          view: "profile"   },
];

// ── Notification Bell ─────────────────────────────────────────────────────────

function NotifBell() {
  const { studentAnnouncements } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Show all active announcements — no goal filtering
  const activeAnnouncements = studentAnnouncements;

  const urgentCount = activeAnnouncements.filter(a => a.priority === "urgent").length;
  const badgeCount  = activeAnnouncements.length;

  const priorityStyle = (priority: string) => {
    if (priority === "urgent")    return "border-l-4 border-l-red-400 bg-red-50";
    if (priority === "important") return "border-l-4 border-l-amber-400 bg-amber-50";
    return "border-l-4 border-l-gray-200 bg-white";
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        aria-label="View announcements"
      >
        <Bell size={18} />
        {badgeCount > 0 && (
          <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${urgentCount > 0 ? "bg-red-500" : "bg-[#F97316]"}`} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[calc(100vw-1rem)] max-w-[340px] rounded-2xl z-50 overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-sm font-['Poppins'] text-gray-900">Announcements</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
              <X size={15} />
            </button>
          </div>
          {activeAnnouncements.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              <Bell size={24} className="mx-auto mb-2 text-gray-200" />
              No announcements right now
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto">
              {activeAnnouncements.slice(0, 5).map(a => (
                <div key={a.id} className={`px-4 py-3 border-b border-gray-50 ${priorityStyle(a.priority)}`}>
                  <p className="text-sm font-semibold text-gray-800 font-['Poppins'] leading-tight">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{a.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main StudentLayout ────────────────────────────────────────────────────────

export function StudentLayout({ children }: { children: ReactNode }) {
  const { view, setView, user, setUser, darkMode, toggleDarkMode, setSelectedPaperId, setGlobalSearchFilter, studentSubjects, studentPapers } = useApp();
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [hierFilter, setHierFilter] = useState<HierarchicalFilterState>(EMPTY_FILTER);
  const [modalSearch, setModalSearch] = useState("");
  const [modalSubject, setModalSubject] = useState("");
  const [modalType, setModalType] = useState("");
  const [modalYear, setModalYear] = useState<number | "">("");
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const logout = () => { setUser(null); setView("landing"); };

  // ── Ctrl+K / ⌘K keyboard shortcut ──────────────────────────────────────────
  const openSearch = useCallback(() => setSearchDrawerOpen(true), []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch]);

  // ── Reset & Close Search Drawer ─────────────────────────────────────────────
  const handleCloseDrawer = useCallback(() => {
    setHierFilter(EMPTY_FILTER);
    setModalSearch("");
    setModalSubject("");
    setModalType("");
    setModalYear("");
    setSearchDrawerOpen(false);
  }, []);

  // Escape key closes drawer and resets all filters
  useEffect(() => {
    if (!searchDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseDrawer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchDrawerOpen, handleCloseDrawer]);

  // ── Auto-focus search input when drawer opens ──────────────────────────────
  useEffect(() => {
    if (searchDrawerOpen) {
      requestAnimationFrame(() => {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      });
    }
  }, [searchDrawerOpen]);

  // Stream-aware deduplicated subjects
  const cat = resolveGoalCategory(hierFilter) || undefined;
  const stream = hierFilter.stream || undefined;

  const availableSubjects = Array.from(
    new Map(
      studentSubjects
        .filter((s) => {
          if (cat && s.goalCategory !== cat) return false;
          return true;
        })
        .map((s) => [s.name, s])
    ).values()
  );

  const availableYears = Array.from(
    new Set(studentPapers.map((p) => p.year))
  ).sort((a, b) => b - a);

  const isBoard = cat?.startsWith("board");
  const relevantTypes: PaperType[] = !cat
    ? ["board", "prelims", "model", "practice", "unit-test", "semester", "chapter-wise", "pyq", "mock-test", "subject-wise", "minor-test", "major-test"]
    : isBoard
      ? ["board", "prelims", "model", "practice", "unit-test", "semester", "chapter-wise"]
      : ["pyq", "mock-test", "subject-wise", "chapter-wise", "minor-test", "major-test", "practice"];

  const matchingPapers = studentPapers.filter(p => {
    if (cat && p.goalCategory !== cat) return false;
    if (modalSearch && !p.title.toLowerCase().includes(modalSearch.toLowerCase()) && !p.subject.toLowerCase().includes(modalSearch.toLowerCase())) return false;
    if (modalSubject) {
      const selectedSub = availableSubjects.find(s => s.id === modalSubject || s.name === modalSubject);
      if (selectedSub && p.subject !== selectedSub.name && p.subjectId !== modalSubject) return false;
    }
    if (modalYear && p.year !== modalYear) return false;
    if (modalType && p.type !== modalType) return false;
    return true;
  });

  return (
    <div className="min-h-screen texture-paper flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0 h-screen z-30 overflow-hidden" style={{ background: "linear-gradient(180deg, #0A1F4E 0%, #1E3A8A 55%, #1E40AF 100%)" }}>

        {/* Film grain overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")", backgroundSize: "300px 300px", mixBlendMode: "overlay", zIndex: 0 }} />
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10 relative z-10">
          <img src={LogoImage} alt="ParikshaCrack Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
          <span className="text-white font-extrabold text-[17px] font-heading tracking-tight">ParikshaCrack</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 relative z-10">
          {navItems.map(item => {
            const isActive = item.view === "explore" ? searchDrawerOpen : view === item.view;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.view === "explore") {
                    setSearchDrawerOpen(true);
                  } else {
                    setView(item.view as View);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-1 transition-all duration-150 text-xs sm:text-sm min-h-[44px] cursor-pointer ${
                  isActive
                    ? "bg-white/15 text-white font-bold shadow-xs border border-white/15"
                    : "text-blue-100/90 hover:bg-white/8 hover:text-white font-medium"
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.75} />
                <span className="font-display tracking-tight flex-1 text-left">{item.label}</span>
                {item.view === "explore" && (
                  <span className="text-[9px] font-mono font-bold bg-white/15 text-blue-100 px-1.5 py-0.5 rounded-md border border-white/15 flex items-center gap-0.5 flex-shrink-0">
                    <Command size={9} />K
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-xs border border-white/20">
              {user?.name?.[0] ?? "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-bold font-display truncate leading-tight">{user?.name}</p>
              <p className="text-blue-200/80 text-[11px] font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-red-300 hover:text-red-100 text-xs font-semibold px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <LogOut size={15} strokeWidth={1.75} />
            <span className="font-display">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen min-w-0 overflow-x-hidden">

        {/* ── Top Header ── */}
        <header className="px-4 py-3 flex items-center gap-3 sticky top-0 z-20 h-14" style={{ backgroundColor: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(30,58,138,0.08)", boxShadow: "0 1px 16px rgba(30,58,138,0.07)" }}>

          {/* Mobile: Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <img src={LogoImage} alt="ParikshaCrack" className="w-7 h-7 object-contain" />
            <span className="text-[#1E3A8A] font-extrabold text-[15px] font-heading tracking-tight">ParikshaCrack</span>
          </div>

          {/* Desktop: Page title */}
          <div className="hidden lg:block flex-1">
            <h2 className="text-gray-900 dark:text-white font-bold text-[15px] font-display tracking-tight">
              {navItems.find(n => n.view === view)?.label ?? "ParikshaCrack"}
            </h2>
          </div>

          {/* Spacer on mobile */}
          <div className="flex-1 lg:hidden" />

          {/* Right: Notifications + Dark Mode + Avatar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Midnight OLED Dark Mode"}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <NotifBell />
            <button
              onClick={() => setView("profile")}
              className="w-9 h-9 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-sm font-bold font-['Poppins'] hover:bg-[#1D4ED8] transition-colors"
              aria-label="Profile"
            >
              {user?.name?.[0] ?? "S"}
            </button>
          </div>

        </header>

        {/* ── Page Content ── */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 pb-24 lg:pb-8 animate-view-fade" role="main">
          {children}
        </main>


        {/* ── Mobile Bottom Navigation ── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1"
          style={{ height: "64px", paddingBottom: "env(safe-area-inset-bottom, 0px)", backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid rgba(30,58,138,0.08)", boxShadow: "0 -1px 16px rgba(30,58,138,0.07)" }}
          role="navigation"
          aria-label="Main navigation"
        >
          {navItems.map(item => {
            const isActive = item.view === "explore" ? searchDrawerOpen : view === item.view;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.view === "explore") {
                    setSearchDrawerOpen(true);
                  } else {
                    setView(item.view as View);
                  }
                }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 rounded-xl mx-0.5 transition-all duration-150 min-w-[44px] cursor-pointer ${
                  isActive
                    ? "text-[#1E3A8A] bg-[#1E3A8A]/5 border-t-2 border-t-[#1E3A8A]"
                    : "text-gray-400 hover:text-gray-600"
                } -mt-px`}
              >
                <item.icon size={20} />
                <span className={`text-[10px] mt-0.5 font-medium font-['Poppins'] ${isActive ? "font-semibold text-[#1E3A8A]" : ""}`}>
                  {item.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Global Search & Filter Drawer Modal ── */}
      {searchDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseDrawer} />
          <div className="relative bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl z-10 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">

            {/* Modal Header + Floating Match Counter */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                  <Search size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base font-['Poppins']">Search & Filter Explorer</h3>
                  <p className="text-xs text-gray-500">Filter by Education Level, Subject, Paper Type, and Year</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Live Match Counter Badge */}
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-apple-unveil">
                  <Target size={12} /> {matchingPapers.length} papers
                </span>
                <button
                  onClick={handleCloseDrawer}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Clear filters & close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search papers or quizzes by name, subject, or chapter..."
                value={modalSearch}
                onChange={e => setModalSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && modalSearch.trim()) {
                    addRecentSearch(modalSearch.trim());
                    setRecentSearches(getRecentSearches());
                  }
                }}
                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#1E3A8A] placeholder:text-gray-400 font-medium transition-all"
              />
              {modalSearch ? (
                <button onClick={() => setModalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                  Ctrl+K
                </span>
              )}
            </div>

            {/* Recent Searches */}
            {!modalSearch && recentSearches.length > 0 && (
              <div className="animate-apple-unveil">
                <label className="text-[9px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5">Recent Searches</label>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setModalSearch(s)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Clock size={10} className="text-gray-400" /> {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filter Tags Bar */}
            {(hierFilter.level || modalSubject || modalType || modalYear || modalSearch) && (
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 animate-apple-unveil">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mr-1">Active:</span>
                {hierFilter.level && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <GraduationCap size={10} /> {filterBreadcrumb(hierFilter)}
                    <button onClick={() => { setHierFilter(EMPTY_FILTER); setModalSubject(""); setModalType(""); setModalYear(""); }} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                  </span>
                )}
                {modalSubject && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    <BookOpen size={10} /> {availableSubjects.find(s => s.id === modalSubject)?.name ?? modalSubject}
                    <button onClick={() => setModalSubject("")} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                  </span>
                )}
                {modalType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <FileText size={10} /> {PAPER_TYPE_CONFIG[modalType as PaperType]?.label ?? modalType}
                    <button onClick={() => setModalType("")} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                  </span>
                )}
                {modalYear && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Calendar size={10} /> {modalYear}
                    <button onClick={() => setModalYear("")} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                  </span>
                )}
                {modalSearch && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    <Search size={10} /> {modalSearch}
                    <button onClick={() => setModalSearch("")} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                  </span>
                )}
                {/* Mobile Match Counter */}
                <span className="sm:hidden ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <Target size={10} /> {matchingPapers.length}
                </span>
              </div>
            )}

            {/* Hierarchical Level Filter */}
            <HierarchicalFilter
              value={hierFilter}
              onChange={next => { setHierFilter(next); setModalSubject(""); setModalType(""); setModalYear(""); }}
            />

            {/* Subject Chips */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 font-['Poppins'] flex items-center gap-1.5">
                <BookOpen size={11} className="text-violet-500" /> Subject
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                <button
                  onClick={() => setModalSubject("")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    !modalSubject ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  All
                </button>
                {availableSubjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setModalSubject(prev => prev === s.id || prev === s.name ? "" : s.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      modalSubject === s.id || modalSubject === s.name
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Type Chips */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 font-['Poppins'] flex items-center gap-1.5">
                <Layers size={11} className="text-amber-500" /> Paper Type
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                <button
                  onClick={() => setModalType("")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    !modalType ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  All Types
                </button>
                {relevantTypes.map(t => {
                  const cfg = PAPER_TYPE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setModalType(prev => prev === t ? "" : t)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        modalType === t
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      {cfg?.label ?? t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year Chips */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5 font-['Poppins'] flex items-center gap-1.5">
                <CalendarDays size={11} className="text-emerald-500" /> Year
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setModalYear("")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    !modalYear ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  All
                </button>
                {availableYears.map(y => (
                  <button
                    key={y}
                    onClick={() => setModalYear(prev => prev === y ? "" : y)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      modalYear === y
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Results Preview */}
            {matchingPapers.length > 0 && (hierFilter.level || modalSubject || modalType || modalYear || modalSearch) && (
              <div className="border-t border-gray-100 pt-3 animate-apple-unveil">
                <label className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <Eye size={10} className="text-blue-500" /> Live Preview · Top {Math.min(5, matchingPapers.length)} of {matchingPapers.length}
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {matchingPapers.slice(0, 5).map(p => {
                    const typeCfg = PAPER_TYPE_CONFIG[p.type];
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group/preview"
                        onClick={() => {
                          if (modalSearch.trim()) { addRecentSearch(modalSearch.trim()); setRecentSearches(getRecentSearches()); }
                          setSelectedPaperId(p.id);
                          setSearchDrawerOpen(false);
                          setView("paper-detail");
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-600/15 text-[#1E3A8A] flex flex-col items-center justify-center flex-shrink-0 border border-blue-500/20">
                          <FileText size={12} />
                          <span className="text-[6px] font-black uppercase mt-0.5">PDF</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-gray-800 truncate group-hover/preview:text-[#1E3A8A] transition-colors">{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: typeCfg.bg, color: typeCfg.text }}>{typeCfg.label}</span>
                            <span className="text-[9px] text-gray-400">{p.subject} · {p.year}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 flex-shrink-0">
                          <span className="flex items-center gap-0.5"><Award size={10} className="text-amber-500" />{p.marks}M</span>
                          <span className="flex items-center gap-0.5"><Clock size={10} />{p.durationMinutes}m</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setHierFilter(EMPTY_FILTER);
                  setModalSearch("");
                  setModalSubject("");
                  setModalType("");
                  setModalYear("");
                }}
                className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
              >
                Clear All Filters
              </button>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (modalSearch.trim()) { addRecentSearch(modalSearch.trim()); setRecentSearches(getRecentSearches()); }
                    // Push filters to global context so PapersList can pick them up
                    const selectedSubName = modalSubject ? (availableSubjects.find(s => s.id === modalSubject)?.name ?? modalSubject) : "";
                    setGlobalSearchFilter({
                      search: modalSearch,
                      goalCategory: cat ?? "",
                      stream: stream ?? "",
                      subject: selectedSubName,
                      paperType: (modalType as any) || "",
                      year: modalYear,
                    });
                    setSearchDrawerOpen(false);
                    setView("papers");
                  }}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#1D4ED8] shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <FileText size={15} /> Find Question Papers ({matchingPapers.length})
                </button>
                <button
                  onClick={() => {
                    if (modalSearch.trim()) { addRecentSearch(modalSearch.trim()); setRecentSearches(getRecentSearches()); }
                    setSearchDrawerOpen(false);
                    setView("quizzes");
                  }}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF7A00] text-white hover:bg-[#E66E00] shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Brain size={15} /> Find Rank Challenges
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
