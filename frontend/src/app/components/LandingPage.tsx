import {
  BookOpen, Brain, BarChart3, Users, ChevronRight, Star, CheckCircle, Zap, Trophy,
  FlaskConical, Stethoscope, Atom, GraduationCap, School, BookMarked, Calculator, Microscope,
  Gift, Heart, Search, Eye, Download, X, Clock, Award, ChevronDown,
  LayoutGrid, List, RotateCcw, Sparkles, ArrowDownCircle,
  Languages, Pencil, Check, TrendingUp, Lightbulb, UserPlus,
  type LucideIcon
} from "lucide-react";


import { useApp } from "./context/AppContext";
import { useState, useEffect } from "react";
import { HierarchicalFilter, EMPTY_FILTER, resolveGoalCategory } from "./student/HierarchicalFilter";
import type { HierarchicalFilterState } from "./student/HierarchicalFilter";
import { SubjectIcon } from "./shared/GoalIcons";
import { PAPER_TYPE_CONFIG, DIFFICULTY_CONFIG } from "./data/mockData";
import type { PaperType } from "./data/mockData";
import { fetchPublicCatalog, type PublicCatalogStats, type StudentPaper, type StudentQuiz, type StudentSubject } from "../lib/api";

const EMPTY_STATS: PublicCatalogStats = { students: 0, papers: 0, quizzes: 0, attempts: 0 };

function formatCount(n: number) {
  return n.toLocaleString("en-IN");
}


const BGImage = new URL("../../imports/BG.jpg", import.meta.url).href;
const DIGIImage = new URL("../../imports/DIGI.jpg", import.meta.url).href;
const STDImage = new URL("../../imports/STD.jpg", import.meta.url).href;
const STUPREPImage = new URL("../../imports/STUDY_PREP.jpg", import.meta.url).href;
const STUDYImage = new URL("../../imports/STUDY.jpg", import.meta.url).href;
const LogoImage = new URL("../../imports/logo.png", import.meta.url).href;

const features = [
  {
    icon: BookOpen, title: "PYQ Papers", desc: "NEET, JEE, HSC & SSC past papers organised by year, subject, and paper type — downloadable & viewable online.",
    accent: "#2563EB", accentShadow: "rgba(37,99,235,0.18)", iconGradient: "linear-gradient(135deg, #DBEAFE, #93C5FD)", iconShadow: "rgba(37,99,235,0.25)", iconClass: "text-blue-700"
  },
  {
    icon: Brain, title: "Instant Rank Challenger", desc: "Fast-paced objective speed tests under real exam pressure with live negative marking (+4/−1 for NEET/JEE, +1/0 for boards). Practice or Exam mode.",
    accent: "#7C3AED", accentShadow: "rgba(124,58,237,0.18)", iconGradient: "linear-gradient(135deg, #EDE9FE, #C4B5FD)", iconShadow: "rgba(124,58,237,0.25)", iconClass: "text-purple-700"
  },
  {
    icon: BarChart3, title: "Analytics & Percentile", desc: "Track score trends, subject weak-spots, negative-mark patterns, and your percentile vs peers.",
    accent: "#059669", accentShadow: "rgba(5,150,105,0.18)", iconGradient: "linear-gradient(135deg, #D1FAE5, #6EE7B7)", iconShadow: "rgba(5,150,105,0.25)", iconClass: "text-green-700"
  },
  {
    icon: Zap, title: "Smart Filtering", desc: "Browse by School · College · Competitive. Narrow by grade, stream, year, subject — search-engine style discovery.",
    accent: "#EA580C", accentShadow: "rgba(234,88,12,0.18)", iconGradient: "linear-gradient(135deg, #FFEDD5, #FDBA74)", iconShadow: "rgba(234,88,12,0.25)", iconClass: "text-orange-700"
  },
];

const examGoals: {
  icon: LucideIcon; label: string; iconColor: string; text: string; tags: string[]; comingSoon?: boolean; goalCategory: string;
  goalBg: string; goalBorder: string; goalBorderHover: string; goalShadow: string; goalAccentGradient: string;
  ringColor: string; chipBorder: string; chipBorderHover: string; chipShadow: string; chipBgHover: string; chipText: string;
}[] = [
    {
      icon: School, label: "SSC Class 10", iconColor: "text-orange-600", text: "text-orange-700",
      goalCategory: "board-10",
      goalBg: "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 60%, #FEF3C7 100%)", goalBorder: "rgba(251,146,60,0.25)", goalBorderHover: "rgba(251,146,60,0.45)", goalShadow: "rgba(251,146,60,0.12)", goalAccentGradient: "linear-gradient(90deg, #F97316, #FDBA74)",
      ringColor: "rgba(251,146,60,0.15)", chipBorder: "rgba(251,146,60,0.2)", chipBorderHover: "rgba(251,146,60,0.4)", chipShadow: "rgba(251,146,60,0.15)", chipBgHover: "#FFF7ED", chipText: "#9A3412",
      tags: []
    },
    {
      icon: GraduationCap, label: "HSC Class 12", iconColor: "text-blue-600", text: "text-blue-700",
      goalCategory: "board-12",
      goalBg: "linear-gradient(135deg, #EFF6FF 0%, #F8FAFF 60%, #E0E7FF 100%)", goalBorder: "rgba(59,130,246,0.25)", goalBorderHover: "rgba(59,130,246,0.45)", goalShadow: "rgba(59,130,246,0.12)", goalAccentGradient: "linear-gradient(90deg, #3B82F6, #93C5FD)",
      ringColor: "rgba(59,130,246,0.15)", chipBorder: "rgba(59,130,246,0.2)", chipBorderHover: "rgba(59,130,246,0.4)", chipShadow: "rgba(59,130,246,0.15)", chipBgHover: "#EFF6FF", chipText: "#1E40AF",
      tags: []
    },
    {
      icon: Atom, label: "JEE Mains", iconColor: "text-violet-600", text: "text-violet-700",
      goalCategory: "jee-mains",
      goalBg: "linear-gradient(135deg, #F5F3FF 0%, #FAF5FF 60%, #EDE9FE 100%)", goalBorder: "rgba(139,92,246,0.25)", goalBorderHover: "rgba(139,92,246,0.45)", goalShadow: "rgba(139,92,246,0.12)", goalAccentGradient: "linear-gradient(90deg, #8B5CF6, #C4B5FD)",
      ringColor: "rgba(139,92,246,0.15)", chipBorder: "rgba(139,92,246,0.2)", chipBorderHover: "rgba(139,92,246,0.4)", chipShadow: "rgba(139,92,246,0.15)", chipBgHover: "#F5F3FF", chipText: "#5B21B6",
      tags: []
    },
    {
      icon: Stethoscope, label: "NEET UG", iconColor: "text-green-600", text: "text-green-700",
      goalCategory: "neet",
      goalBg: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 60%, #D1FAE5 100%)", goalBorder: "rgba(16,185,129,0.25)", goalBorderHover: "rgba(16,185,129,0.45)", goalShadow: "rgba(16,185,129,0.12)", goalAccentGradient: "linear-gradient(90deg, #10B981, #6EE7B7)",
      ringColor: "rgba(16,185,129,0.15)", chipBorder: "rgba(16,185,129,0.2)", chipBorderHover: "rgba(16,185,129,0.4)", chipShadow: "rgba(16,185,129,0.15)", chipBgHover: "#ECFDF5", chipText: "#065F46",
      tags: []
    },
  ];

const freeFeatures = [
  "All Past Year Papers — NEET, JEE, HSC & SSC",
  "Unlimited Instant Rank Challenges",
  "Full Test Series",
  "Negative Marking Engine (+4/−1 & +1/0)",
  "Full Analytics & Percentile Tracking",
  "Bookmarks & Study Planner",
  "All Exams Covered — Switch Anytime",
  "PDF Downloads",
  "Priority Support",
];

export function LandingPage() {
  const { setView, setShowLoginModal, setLoginModalTab } = useApp();
  const images = [BGImage, DIGIImage, STDImage, STUPREPImage, STUDYImage];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [papers, setPapers] = useState<StudentPaper[]>([]);
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [stats, setStats] = useState<PublicCatalogStats>(EMPTY_STATS);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    fetchPublicCatalog()
      .then((data) => {
        if (cancelled) return;
        setPapers(data.papers);
        setQuizzes(data.quizzes);
        setSubjects(data.subjects);
        setStats(data.stats);
      })
      .catch(() => {
        if (cancelled) return;
        setPapers([]);
        setQuizzes([]);
        setSubjects([]);
        setStats(EMPTY_STATS);
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const liveExamGoals = examGoals.map((g) => {
    const tags = subjects.filter(s => s.goalCategory === g.goalCategory).map(s => s.name).slice(0, 6);
    const hasContent = papers.some(p => p.goalCategory === g.goalCategory) || quizzes.some(q => q.goalCategory === g.goalCategory) || tags.length > 0;
    return { ...g, tags, comingSoon: !hasContent };
  });

  const extraExams = [
    { icon: BookOpen, label: "Class 9 & 8", goalCategories: ["board-8", "board-9"] },
    { icon: BookMarked, label: "Class 11", goalCategories: ["board-11"] },
    { icon: Microscope, label: "MHT-CET PCB", goalCategories: ["mht-cet-pcb"] },
    { icon: Calculator, label: "MHT-CET PCM", goalCategories: ["mht-cet-pcm"] },
    { icon: Trophy, label: "JEE Advanced", goalCategories: ["jee-advanced"] },
  ].map(g => ({
    ...g,
    comingSoon: !papers.some(p => g.goalCategories.includes(p.goalCategory)) && !quizzes.some(q => g.goalCategories.includes(q.goalCategory)),
  }));

  const heroStats = [
    { value: formatCount(stats.students), label: "Students" },
    { value: formatCount(stats.papers), label: "Papers" },
    { value: formatCount(stats.quizzes), label: "Quizzes" },
    { value: formatCount(stats.attempts), label: "Attempts" },
  ];

  // Carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen overflow-x-hidden relative w-full max-w-full" style={{ backgroundColor: "#FAFBFD" }}>

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav
        className="px-2 sm:px-8 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-50"
        style={{
          backgroundColor: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(30,58,138,0.08)",
          boxShadow: "0 1px 16px rgba(30,58,138,0.07)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <img src={LogoImage} alt="ParikshaCrack Logo" className="w-9 h-9 sm:w-14 sm:h-14 object-contain flex-shrink-0" />
          <span
            className="font-bold text-sm sm:text-xl truncate min-[360px]:block hidden"
            style={{ fontFamily: "Poppins, sans-serif", color: "#1E3A8A" }}
          >
            ParikshaCrack
          </span>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm border rounded-lg font-medium whitespace-nowrap transition-all duration-150 hover:scale-105"
            style={{ color: "#1E3A8A", borderColor: "#1E3A8A" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1E3A8A"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ""; (e.currentTarget as HTMLButtonElement).style.color = "#1E3A8A"; }}
          >
            Login
          </button>
          <button
            onClick={() => setView("register")}
            className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm text-white rounded-lg font-semibold whitespace-nowrap transition-all duration-150 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#FF7A00", boxShadow: "0 2px 10px rgba(255,122,0,0.35)" }}
          >
            <span className="hidden min-[400px]:inline">Register Free</span>
            <span className="inline min-[400px]:hidden">Register</span>
          </button>
        </div>
      </nav>

      {/* ── Hero — Library Image + Blue Gradient + Film Grain + Radial Glow ── */}
      {/*
          Stack (bottom → top):
          1. Library photo (background-image on section)
          2. Dark blue gradient overlay (absolute div)
          3. Fine film grain noise (::before via texture-blue-hero on overlay)
          4. Soft radial glow (::after or second pseudo on overlay)
          5. Content (z-10)
      */}
      <section
        className="text-white py-12 sm:py-24 px-3 sm:px-4 relative overflow-hidden min-h-[550px] sm:min-h-[700px] flex items-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${images[currentImageIndex]})`,
          backgroundAttachment: "fixed",
          transition: "background-image 1s ease-in-out",
        }}
      >
        {/* Layer 1: dark gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(5,20,63,0.92) 0%, rgba(15,43,107,0.88) 45%, rgba(30,64,175,0.85) 100%)" }} />

        {/* Layer 2: film grain noise (SVG inline, seamless tile) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")",
            backgroundSize: "300px 300px",
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
          }}
        />

        {/* Layer 3: soft radial blue glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 90% 60% at 50% 30%, rgba(59,130,246,0.25) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 75%, rgba(99,102,241,0.14) 0%, transparent 60%)",
          }}
        />



        {/* Hero content */}
        <div className="max-w-5xl mx-auto text-center relative z-10 w-full px-2">
          {/* Exam pills — Glass Capsule Dock */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="hero-pill-dock">
              {[
                { icon: School,        label: "SSC",     color: "text-orange-400", glow: "rgba(249,115,22,0.4)",  shadow: "rgba(249,115,22,0.35)" },
                { icon: GraduationCap, label: "HSC",     color: "text-blue-400",   glow: "rgba(59,130,246,0.4)",  shadow: "rgba(59,130,246,0.35)" },
                { icon: FlaskConical,  label: "MHT-CET", color: "text-cyan-400",   glow: "rgba(6,182,212,0.4)",  shadow: "rgba(6,182,212,0.35)"  },
                { icon: Atom,          label: "JEE",     color: "text-purple-400", glow: "rgba(139,92,246,0.4)", shadow: "rgba(139,92,246,0.35)" },
                { icon: Stethoscope,   label: "NEET",    color: "text-emerald-400",glow: "rgba(16,185,129,0.4)", shadow: "rgba(16,185,129,0.35)" },
              ].map(({ icon: Icon, label, color, glow, shadow }) => (
                <button
                  key={label}
                  onClick={() => {
                    const el = document.getElementById("content-explorer-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hero-pill-item"
                  style={{
                    "--pill-glow": glow,
                    "--pill-shadow": shadow,
                  } as React.CSSProperties}
                >
                  <Icon size={14} className={color} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <h1
            className="text-sm min-[360px]:text-base min-[400px]:text-xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 leading-snug sm:leading-tight drop-shadow-md font-bold text-white max-w-4xl mx-auto px-1 sm:px-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <span className="whitespace-nowrap sm:whitespace-normal block">Don't Let the Exam Surprise You.</span>
            <span className="block text-xs min-[360px]:text-sm sm:text-2xl md:text-3xl font-semibold text-blue-100 mt-1.5 sm:mt-2 leading-snug">
              Practice with <span className="text-[#FF7A00] font-bold">Real Question Papers</span> & Challenge Your Preparation
            </span>
          </h1>

          <p className="text-blue-100/90 text-xs sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 drop-shadow-sm font-medium">
            {stats.papers > 0
              ? `Browse ${formatCount(stats.papers)} published papers and ${formatCount(stats.quizzes)} live quizzes — search and filter freely, then log in to attempt or download.`
              : "Search published papers and speed tests as they go live. Log in to attempt quizzes or view PDFs."}
          </p>

          {/* ── SEARCH-FIRST CONTENT EXPLORER (Above the Fold) ──────── */}
          <div id="content-explorer-section" className="mb-8 text-left text-gray-800">
            <LandingContentExplorer
              onRequireAuth={() => setShowLoginModal(true)}
              papers={papers}
              quizzes={quizzes}
              subjects={subjects}
              loading={catalogLoading}
            />
          </div>

          {/* Stats — glass cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-10 max-w-3xl mx-auto">
            {heroStats.map((s, idx) => (
              <div
                key={s.label}
                className="rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.09)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
                  animation: `slideUp 0.6s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{s.value}</div>
                <div className="text-blue-200 text-xs sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Decorative floating icons */}
          <div className="absolute left-2 sm:left-12 top-1/4 z-0 opacity-10 sm:opacity-20 pointer-events-none">
            <BookOpen size={60} className="text-white sm:w-[80px] sm:h-[80px] animate-float-slow" />
          </div>
          <div className="absolute right-2 sm:right-12 bottom-1/4 z-0 opacity-10 sm:opacity-20 pointer-events-none">
            <Brain size={60} className="text-white sm:w-[80px] sm:h-[80px] animate-float-slow" style={{ animationDelay: "-3s" }} />
          </div>
        </div>

      </section>

      {/* ── SECTION DIVIDER ─────────────────────────────────────────── */}
      <div className="section-divider" />

      {/* ── 100% Free — Light Blue (#F4F8FF) + Paper Grain ───────────── */}
      <section className="texture-paper-blue py-14 sm:py-20 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Gift size={13} /> 100% Free — No Catch
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-3 font-heading font-bold text-[#1E3A8A] tracking-tight">
              Everything You Need. Completely Free.
            </h2>
            <p className="text-slate-600 font-display text-sm sm:text-base max-w-xl mx-auto">
              No subscriptions. No hidden fees. No paywalls. Every student deserves quality exam preparation.
            </p>
          </div>

          {/* Free plan card — blue gradient + film grain + shimmer */}
          <div
            className="relative rounded-2xl border-2 overflow-hidden free-card-shine"
            style={{
              borderColor: "#3B82F6",
              background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%)",
              boxShadow: "0 20px 60px rgba(30,58,138,0.35), 0 0 0 2px rgba(59,130,246,0.2)",
            }}
          >
            {/* Film grain over the card */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")",
                backgroundSize: "300px 300px",
                mixBlendMode: "overlay",
              }}
            />
            {/* Radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(96,165,250,0.2) 0%, transparent 70%)" }}
            />

            {/* FREE FOREVER badge */}
            <div className="absolute -top-0 left-1/2 -translate-x-1/2">
              <span className="bg-green-500 text-white text-[11px] font-bold px-5 py-1.5 rounded-b-xl shadow-md tracking-wide">
                FREE FOREVER
              </span>
            </div>

            <div className="p-6 sm:p-8 pt-10 sm:pt-12 relative z-10">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart size={20} className="text-red-400" />
                  <span className="text-3xl sm:text-5xl font-heading font-extrabold text-white">
                    Free
                  </span>
                </div>
                <p className="text-blue-200 text-sm sm:text-base font-display">Full access to every feature — no limits, no upgrades needed</p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {freeFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-green-300" />
                    <span className="text-blue-50 font-display">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <button
                  onClick={() => setView("register")}
                  className="px-10 py-3.5 rounded-xl text-sm font-bold font-heading transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "white",
                    color: "#1E3A8A",
                    boxShadow: "0 4px 20px rgba(255,255,255,0.25)",
                  }}
                >
                  Get Started — It's Free
                </button>
                <p className="text-blue-300 text-xs mt-4 font-display">No credit card required. No account limits. Just sign up and start learning.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Features — Off-White + Paper Grain + Gradient Orb ───────── */}
      <section className="texture-paper py-14 sm:py-20 px-3 sm:px-4">
        <div className="max-w-5xl mx-auto section-bg-orb">
          <div className="text-center mb-10 sm:mb-14 relative z-10">
            <h2 className="section-heading-accent text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-[#1E3A8A] tracking-tight">
              Everything You Need to Score High
            </h2>
            <p className="text-slate-600 font-display text-sm sm:text-base mt-2.5 font-medium tracking-normal">
              One platform. Every exam. Real exam patterns.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7 relative z-10">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className="feature-card-premium rounded-2xl p-6 sm:p-7 reveal-card group"
                style={{
                  "--accent-color": f.accent,
                  "--accent-shadow": f.accentShadow,
                  "--icon-gradient": f.iconGradient,
                  "--icon-shadow": f.iconShadow,
                  animationDelay: `${idx * 0.1}s`,
                } as React.CSSProperties}
              >
                <div className="flex items-start gap-4">
                  <div className="feature-icon-glow w-12 h-12 rounded-2xl flex-shrink-0 border border-white/40 shadow-sm">
                    <f.icon size={22} className={f.iconClass} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1.5 text-base sm:text-lg font-bold font-heading text-slate-900 group-hover:text-[#1E3A8A] transition-colors leading-snug tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-slate-600 font-display text-xs sm:text-sm leading-relaxed font-normal tracking-normal">
                      {f.desc}
                    </p>
                  </div>
                </div>
                {/* Hover arrow indicator */}
                <div className="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Exam Goals — White + Micro-Dot Grid + Premium Cards ────────── */}
      <section className="texture-paper-white-grid py-12 sm:py-18 px-3 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2
              className="section-heading-accent text-xl sm:text-2xl md:text-3xl"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}
            >
              Supported Exam Goals
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-4">Browse School · College · Competitive — choose your path and discover content</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">
            {liveExamGoals.map((g, idx) => (
              <div
                key={g.label}
                onClick={() => {
                  const el = document.getElementById("content-explorer-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`exam-goal-card ${g.comingSoon ? "coming-soon-card" : ""} rounded-xl sm:rounded-2xl p-5 sm:p-7 relative reveal-card cursor-pointer`}
                style={{
                  "--goal-bg": g.goalBg,
                  "--goal-border": g.goalBorder,
                  "--goal-border-hover": g.goalBorderHover,
                  "--goal-shadow": g.goalShadow,
                  "--goal-accent-gradient": g.goalAccentGradient,
                  "--ring-color": g.ringColor,
                  animationDelay: `${idx * 0.12}s`,
                } as React.CSSProperties}
              >
                {g.comingSoon && (
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-900/40 animate-pulse" />
                      Coming Soon
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3.5 mb-4 sm:mb-5">
                  <div className="goal-icon-ring" style={{ "--ring-color": g.ringColor } as React.CSSProperties}>
                    <g.icon size={20} className={`${g.comingSoon ? "opacity-60 " : ""}${g.iconColor}`} />
                  </div>
                  <div className={`${g.text} text-sm sm:text-base font-bold ${g.comingSoon ? "opacity-70" : ""}`} style={{ fontFamily: "Poppins, sans-serif" }}>{g.label}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.tags.map(t => (
                    <span
                      key={t}
                      onClick={(e) => {
                        e.stopPropagation();
                        const el = document.getElementById("content-explorer-section");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`tag-chip-interactive cursor-pointer ${g.comingSoon ? "opacity-60" : ""}`}
                      style={{
                        "--chip-border": g.chipBorder,
                        "--chip-border-hover": g.chipBorderHover,
                        "--chip-shadow": g.chipShadow,
                        "--chip-bg-hover": g.chipBgHover,
                        "--chip-text": g.chipText,
                        color: g.chipText,
                      } as React.CSSProperties}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Extra exam pills — premium chips */}
          <div className="flex flex-wrap gap-2.5 justify-center mt-8">
            {extraExams.map(g => (
              <span
                key={g.label}
                onClick={() => {
                  const el = document.getElementById("content-explorer-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="exam-pill-premium cursor-pointer"
              >
                <g.icon size={13} />
                {g.label}
                {g.comingSoon && <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide leading-none shadow-sm">Soon</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── How It Works — Off-White + Paper Grain ───────────────────── */}
      <section className="texture-paper py-12 sm:py-16 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-center text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-12"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Users, step: "1", title: "Choose Your Path", desc: "Register free, pick School / College / Competitive, select your exam, stream, and subjects in under 2 minutes" },
              { icon: Brain, step: "2", title: "Practice Daily", desc: "Attempt quizzes with real marking schemes, browse PYQs, and track wrong answers" },
              { icon: Trophy, step: "3", title: "See Your Percentile", desc: "Every quiz shows your score, negative marks, and estimated percentile vs all test-takers" },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div
                  className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
                  style={{ backgroundColor: "#1E3A8A", boxShadow: "0 4px 16px rgba(30,58,138,0.25)" }}
                >
                  <item.icon size={20} className="text-white sm:w-[24px] sm:h-[24px]" />
                </div>
                <div className="text-xs sm:text-sm mb-2" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#FF7A00" }}>Step {item.step}</div>
                <h3 className="mb-2 text-sm sm:text-base" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1E3A8A" }}>{item.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm px-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Recently published ───────────────────────────────────────── */}
      <section className="texture-paper-white py-10 sm:py-14 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-center text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-10"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}
          >
            Recently Published
          </h2>
          {papers.length === 0 && quizzes.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">Published papers and quizzes will appear here.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[...papers.slice(0, 3), ...quizzes.slice(0, Math.max(0, 3 - Math.min(papers.length, 3)))].slice(0, 3).map((item) => {
                const isPaper = "year" in item && "marks" in item && "durationMinutes" in item;
                return (
                  <div key={item.id} className="glass-card-light rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A]">
                      {isPaper ? `${PAPER_TYPE_CONFIG[(item as StudentPaper).type as PaperType]?.label ?? (item as StudentPaper).type} · ${(item as StudentPaper).year}` : "Quiz"}
                    </span>
                    <p className="font-semibold text-gray-800 text-sm mt-3 leading-snug" style={{ fontFamily: "Poppins, sans-serif" }}>{item.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{item.subject}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>



      {/* ── CTA — Blue Gradient + Film Grain + Radial Glow ───────────── */}
      <section className="texture-blue-cta py-10 sm:py-16 px-3 sm:px-4 relative">
        <div className="max-w-2xl mx-auto text-center text-white above-grain">
          <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 px-2" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
            Start Preparing Today — 100% Free!
          </h2>
          <p className="text-blue-200 mb-6 sm:mb-8 text-sm sm:text-base px-2">
            {stats.students > 0
              ? `Join ${formatCount(stats.students)} students preparing with ${formatCount(stats.papers)} live papers and ${formatCount(stats.quizzes)} quizzes.`
              : "Create a free account to attempt quizzes, save bookmarks, and open paper PDFs."}
          </p>
          <button
            onClick={() => setView("register")}
            className="text-white px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-150 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#FF7A00", boxShadow: "0 4px 20px rgba(255,122,0,0.4)" }}
          >
            Create Free Account
          </button>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 text-blue-200 text-xs sm:text-sm">
            {["No credit card needed", "100% free forever", "All exams covered"].map(i => (
              <div key={i} className="flex items-center justify-center gap-1.5">
                <CheckCircle size={14} className="sm:w-[16px] sm:h-[16px]" /> {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer — Deep Navy + Film Grain ──────────────────────────── */}
      <footer className="texture-navy-footer text-blue-200 py-6 sm:py-8 px-3 sm:px-4 text-center text-xs sm:text-sm">
        <div className="above-grain">
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <img src={LogoImage} alt="ParikshaCrack Logo" className="w-6 h-6 object-contain flex-shrink-0" />
            <span className="text-white font-semibold text-sm sm:text-base" style={{ fontFamily: "Poppins, sans-serif" }}>ParikshaCrack</span>
          </div>
          <p className="px-2">India's multi-exam prep platform · NEET · JEE · MHT-CET · HSC · SSC</p>
          <p className="mt-2 text-blue-400">© 2026 ParikshaCrack. All rights reserved.</p>
          <button
            onClick={() => { setLoginModalTab("admin"); setShowLoginModal(true); }}
            className="mt-3 text-xs text-blue-500 hover:text-blue-300 transition-colors"
          >
            Admin Panel
          </button>
        </div>
      </footer>

      {/* ── Mobile Floating Search Dock ── */}
      <div className="lg:hidden fixed bottom-5 right-4 z-40">
        <button
          onClick={() => {
            const el = document.getElementById("content-explorer-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-xs font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 active:scale-95 transition-transform"
        >
          <Search size={14} /> Browse {stats.papers > 0 ? `${formatCount(stats.papers)} Papers` : "Papers"}
        </button>
      </div>
    </div>
  );
}


// ── Search-First Content Explorer Sub-component ─────────────────────────────

function LandingContentExplorer({
  onRequireAuth,
  papers,
  quizzes,
  subjects,
  loading,
}: {
  onRequireAuth: (promptMsg: string) => void;
  papers: StudentPaper[];
  quizzes: StudentQuiz[];
  subjects: StudentSubject[];
  loading: boolean;
}) {
  const { setView, setSelectedPaperId, setSelectedQuizId, setShowLoginModal, user } = useApp();
  const [hierFilter, setHierFilter] = useState<HierarchicalFilterState>(EMPTY_FILTER);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"papers" | "quizzes">("papers");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMedium, setFilterMedium] = useState("");
  const [filterYear, setFilterYear] = useState<number | "">("");
  const [previewPaper, setPreviewPaper] = useState<StudentPaper | null>(null);
  const [previewIntent, setPreviewIntent] = useState<"view" | "download">("view");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "downloads" | "marks">("newest");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pariksha_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [highlightResults, setHighlightResults] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  // Reset visible item count back to 6 whenever filters, search, or active tab change
  useEffect(() => {
    setVisibleCount(6);
  }, [hierFilter, search, activeTab, filterSubject, filterType, filterMedium, filterYear, showOnlyBookmarks, sortBy]);

  const handleScrollToResults = () => {
    // If user hasn't selected an Education Level yet, guide them directly to Step 1: Education Level
    if (!hierFilter.level) {
      const eduLevelEl = document.getElementById("education-level-step");
      if (eduLevelEl) {
        eduLevelEl.scrollIntoView({ behavior: "smooth", block: "center" });
        eduLevelEl.classList.add("ring-4", "ring-blue-500/50", "bg-blue-50/80", "scale-[1.015]");
        setTimeout(() => {
          eduLevelEl.classList.remove("ring-4", "ring-blue-500/50", "bg-blue-50/80", "scale-[1.015]");
        }, 2200);
        return;
      }
    }

    // Otherwise scroll to the results section / first card
    const firstCard = document.querySelector("[data-result-card]") as HTMLElement | null;

    if (firstCard) {
      firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightResults(true);
      setTimeout(() => setHighlightResults(false), 2800);
    } else {
      const header = document.getElementById("results-grid-header");
      if (header) {
        header.scrollIntoView({ behavior: "smooth", block: "start" });
        setHighlightResults(true);
        setTimeout(() => setHighlightResults(false), 2200);
      }
    }
  };

  const toggleBookmark = (id: string) => {

    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("pariksha_bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const cat = resolveGoalCategory(hierFilter);

  const hasActiveFilters = Boolean(
    search ||
    hierFilter.level !== "" ||
    filterSubject ||
    filterType ||
    filterMedium ||
    filterYear ||
    showOnlyBookmarks
  );

  const resetAllFilters = () => {
    setSearch("");
    setHierFilter(EMPTY_FILTER);
    setFilterSubject("");
    setFilterType("");
    setFilterMedium("");
    setFilterYear("");
    setShowOnlyBookmarks(false);
  };

  // Stream-aware deduplicated subjects
  const availableSubjects = Array.from(
    new Map(
      subjects
        .filter(s => !cat || s.goalCategory === cat)
        .map(s => [s.name, s])
    ).values()
  );

  // Dynamic years list from published papers
  const availableYears = Array.from(
    new Set(papers.map(p => p.year).filter(Boolean))
  ).sort((a, b) => b - a);

  const typesInCatalog = Array.from(new Set(papers.map(p => p.type).filter(Boolean))) as PaperType[];
  const isBoard = cat?.startsWith("board");
  const relevantTypes: PaperType[] = (typesInCatalog.length
    ? typesInCatalog
    : (!cat
      ? ["board", "prelims", "model", "practice", "unit-test", "semester", "chapter-wise", "pyq", "mock-test", "subject-wise", "minor-test", "major-test"]
      : isBoard
        ? ["board", "prelims", "model", "practice", "unit-test", "semester", "chapter-wise"]
        : ["pyq", "mock-test", "subject-wise", "chapter-wise", "minor-test", "major-test", "practice"])
  ) as PaperType[];

  const liveMediums = Array.from(new Set(papers.map(p => p.medium).filter(Boolean)));

  // Filter papers
  const filteredPapers = papers.filter(p => {
    if (p.status && p.status !== "published") return false;
    if (showOnlyBookmarks && !bookmarkedIds.includes(p.id)) return false;
    if (cat && p.goalCategory !== cat) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSubject) {
      const selectedSub = availableSubjects.find(s => s.id === filterSubject || s.name === filterSubject);
      if (selectedSub && p.subject !== selectedSub.name && p.subjectId !== filterSubject) return false;
    }
    if (filterMedium && p.medium && p.medium !== filterMedium) return false;
    if (filterYear && p.year !== filterYear) return false;
    if (filterType && p.type !== filterType) return false;
    return true;
  });

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(q => {
    if (q.status && q.status !== "published") return false;
    if (showOnlyBookmarks && !bookmarkedIds.includes(q.id)) return false;
    if (cat && q.goalCategory !== cat) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase()) && !(q.chapter || "").toLowerCase().includes(search.toLowerCase()) && !q.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSubject) {
      const selectedSub = availableSubjects.find(s => s.id === filterSubject || s.name === filterSubject);
      if (selectedSub && q.subject !== selectedSub.name && q.subjectId !== filterSubject) return false;
    }
    return true;
  });


  // Dynamic sorting
  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (sortBy === "downloads") return (b.analytics?.downloads ?? 0) - (a.analytics?.downloads ?? 0);
    if (sortBy === "marks") return b.marks - a.marks;
    const yearDiff = (b.year || 0) - (a.year || 0);
    if (yearDiff !== 0) return yearDiff;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    if (sortBy === "downloads") return (b.analytics?.totalAttempts ?? 0) - (a.analytics?.totalAttempts ?? 0);
    if (sortBy === "marks") return b.totalMarks - a.totalMarks;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const trendingTopics = Array.from(new Set([
    ...papers.map(p => p.subject),
    ...quizzes.map(q => q.chapter || q.subject),
  ].map(t => String(t || "").trim()).filter(Boolean))).slice(0, 4);


  return (
    <section id="content-explorer-section" className="py-2 px-1 relative" style={{ backgroundColor: "transparent" }}>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* 1. STANDALONE SEARCH BAR CARD (High Stacking Context z-50) */}
        <div className="relative z-50 rounded-2xl p-3.5 sm:p-4 animate-apple-unveil" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(30,58,138,0.06)" }}>
          <div className="relative z-50">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "papers" ? "subjective papers" : "objective quizzes"} by name, subject, or chapter...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-8 py-3 bg-[#F8FAFC] border border-gray-200/90 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 placeholder:text-gray-400 font-medium transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}

            {/* Live Auto-Suggest Dropdown (z-50 Layer) */}
            {search.length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200/90 rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden divide-y divide-gray-100 animate-slide-down">

                <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Matches ({filteredPapers.length + filteredQuizzes.length})</span>
                  <button onClick={() => setSearch("")} className="hover:text-gray-700">Close</button>
                </div>
                {filteredPapers.slice(0, 3).map(p => (
                  <div
                    key={p.id}
                    onClick={() => { setPreviewPaper(p); setSearch(""); }}
                    className="px-4 py-2.5 hover:bg-blue-50/80 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1E3A8A] truncate font-['Poppins']">{p.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{p.subject} · {p.year} · Subjective ({p.marks} Marks)</p>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-[#1E3A8A] px-2.5 py-0.5 rounded-full font-bold ml-2">Paper</span>
                  </div>
                ))}
                {filteredQuizzes.slice(0, 2).map(q => (
                  <div
                    key={q.id}
                    onClick={() => { onRequireAuth("Attempt Quiz"); setSearch(""); }}
                    className="px-4 py-2.5 hover:bg-purple-50/80 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-purple-900 truncate font-['Poppins']">{q.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{q.subject} · Objective ({q.questionsCount} Qs)</p>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-bold ml-2">Quiz</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PROMINENT OR DIVIDER */}
        <div className="relative flex items-center justify-center my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300/70" />
          </div>
          <span className="relative bg-[#F5F6FA]/95 backdrop-blur-md px-4 py-1 rounded-full text-[11px] font-black text-gray-500 tracking-widest border border-[#E2E6EF] shadow-sm uppercase">
            OR
          </span>
        </div>

        {/* 2. STANDALONE DUAL MODE TAB SWITCHER — Premium Redesign */}
        <div className="tab-switcher-container rounded-2xl p-2.5 sm:p-3 animate-apple-unveil">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Papers Tab */}
            <button
              onClick={() => {
                setActiveTab("papers");
                setFilterSubject("");
                setFilterType("");
                setFilterMedium("");
                setFilterYear("");
                setTimeout(handleScrollToResults, 60);
              }}
              className={`p-4 rounded-xl text-left flex items-center justify-between gap-3 cursor-pointer ${activeTab === "papers" ? "tab-card-active" : "tab-card-inactive"
                }`}
              style={{
                "--tab-accent": "#1E3A8A",
                "--tab-shadow": "rgba(30,58,138,0.14)",
                "--icon-bg": "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
                "--icon-shadow": "rgba(37,99,235,0.2)",
                "--badge-dot-color": "#2563EB",
              } as React.CSSProperties}
            >
              <div className="flex items-center gap-3.5">
                <div className={`tab-icon-container ${activeTab === "papers" ? "active tab-icon-pop" : "inactive"}`}>
                  <BookOpen size={21} className={activeTab === "papers" ? "text-[#1E3A8A]" : "text-gray-500"} />
                </div>
                <div>
                  <div className="font-bold text-[13px] sm:text-sm" style={{ fontFamily: "Poppins, sans-serif", color: activeTab === "papers" ? "#1E3A8A" : "#64748B" }}>
                    Question Papers
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="text-[9px] font-bold uppercase px-2 py-[2px] rounded-md tracking-wide flex items-center"
                      style={{
                        background: activeTab === "papers" ? "#EFF6FF" : "rgba(241,245,249,0.8)",
                        color: activeTab === "papers" ? "#1E3A8A" : "#94A3B8",
                      }}
                    >
                      <span className="tab-badge-dot" style={{ "--badge-dot-color": activeTab === "papers" ? "#2563EB" : "#CBD5E1" } as React.CSSProperties} />
                      Subjective
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">· PYQs & Board Papers</span>
                  </div>
                </div>
              </div>
              <span className={`tab-count-pill ${activeTab === "papers" ? "active" : "inactive"}`}
                style={{ "--tab-accent": "#1E3A8A", "--tab-shadow": "rgba(30,58,138,0.25)" } as React.CSSProperties}
              >
                {filteredPapers.length} <span className="font-medium hidden min-[420px]:inline">papers</span>
              </span>
            </button>

            {/* Quizzes Tab */}
            <button
              onClick={() => {
                setActiveTab("quizzes");
                setFilterSubject("");
                setFilterType("");
                setFilterMedium("");
                setFilterYear("");
                setTimeout(handleScrollToResults, 60);
              }}
              className={`p-4 rounded-xl text-left flex items-center justify-between gap-3 cursor-pointer ${activeTab === "quizzes" ? "tab-card-active" : "tab-card-inactive"
                }`}
              style={{
                "--tab-accent": "#7C3AED",
                "--tab-shadow": "rgba(124,58,237,0.14)",
                "--icon-bg": "linear-gradient(135deg, #EDE9FE, #DDD6FE)",
                "--icon-shadow": "rgba(124,58,237,0.2)",
                "--badge-dot-color": "#7C3AED",
              } as React.CSSProperties}
            >
              <div className="flex items-center gap-3.5">
                <div className={`tab-icon-container ${activeTab === "quizzes" ? "active tab-icon-pop" : "inactive"}`}>
                  <Brain size={21} className={activeTab === "quizzes" ? "text-purple-700" : "text-gray-500"} />
                </div>
                <div>
                  <div className="font-bold text-[13px] sm:text-sm" style={{ fontFamily: "Poppins, sans-serif", color: activeTab === "quizzes" ? "#5B21B6" : "#64748B" }}>
                    Instant Rank Challenger
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="text-[9px] font-bold uppercase px-2 py-[2px] rounded-md tracking-wide flex items-center"
                      style={{
                        background: activeTab === "quizzes" ? "#F5F3FF" : "rgba(241,245,249,0.8)",
                        color: activeTab === "quizzes" ? "#7C3AED" : "#94A3B8",
                      }}
                    >
                      <span className="tab-badge-dot" style={{ "--badge-dot-color": activeTab === "quizzes" ? "#7C3AED" : "#CBD5E1" } as React.CSSProperties} />
                      Objective
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">· Speed tests under pressure</span>
                  </div>
                </div>
              </div>
              <span className={`tab-count-pill ${activeTab === "quizzes" ? "active" : "inactive"}`}
                style={{ "--tab-accent": "#7C3AED", "--tab-shadow": "rgba(124,58,237,0.25)" } as React.CSSProperties}
              >
                {filteredQuizzes.length} <span className="font-medium hidden min-[420px]:inline">tests</span>
              </span>
            </button>
          </div>
        </div>


        {/* 2. UNIFIED CONTENT EXPLORER FILTER CARD (Apple Progressive Unveiling Flow) */}
        <div className="rounded-3xl p-4 sm:p-6 space-y-5 animate-apple-unveil" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 32px rgba(30,58,138,0.08)" }}>

          {/* 2.1 Education Level Hierarchy (Step 1 & Step 2) */}
          <HierarchicalFilter
            value={hierFilter}
            onChange={next => {
              setHierFilter(next);
              setFilterSubject("");
              setFilterType("");
              setFilterMedium("");
              setFilterYear("");
            }}
          />

          {/* 2.2 Sub-Filters Section — Unveils Step-by-Step with Apple Spring Motion */}
          {hierFilter.level !== "" || search !== "" ? (
            <div className="pt-3 border-t border-gray-100 space-y-4 animate-apple-unveil">

              {/* Step 4: Medium Filter (Unveils after Grade/Exam is selected or search active) */}
              {(hierFilter.grade || (hierFilter.collegeYear && hierFilter.stream) || hierFilter.examType || search !== "") && (
                <div data-step="step-medium" className="animate-apple-unveil transition-all duration-300 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <ChevronRight size={12} className="text-blue-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Select Medium</p>
                      {!filterMedium && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse ml-1">Select below ↓</span>}
                    </div>
                    {filterMedium && (
                      <button onClick={() => setFilterMedium("")} className="text-[10px] text-blue-600 font-bold hover:underline">
                        <Pencil size={10} className="inline -mt-px" /> Show All Mediums
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide touch-pan-x">
                    {[
                      { id: "", label: "All Mediums" },
                      ...liveMediums.map(id => ({
                        id,
                        label: id === "english" ? "English Medium" : id === "marathi" ? "Marathi Medium" : id === "semi-english" ? "Semi-English" : id,
                      })),
                    ]
                      .filter(m => !filterMedium || m.id === filterMedium)
                      .map(m => (
                        <button
                          key={m.id}
                          onClick={() => setFilterMedium(filterMedium === m.id ? "" : m.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 touch-target-min animate-apple-unveil ${filterMedium === m.id ? "bg-[#1E3A8A] text-white border-transparent shadow-sm" : "bg-[#F1F3F8] text-gray-600 border-[#E2E6EF] hover:bg-[#E8ECF4]"
                            }`}
                        >
                          <Languages size={13} className="inline mr-1 -mt-0.5" /> {m.label} {filterMedium === m.id && m.id !== "" && <Check size={11} className="inline ml-0.5 -mt-px" />}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Step 5: Subject Filter (Unveils when Medium is selected or search active) */}
              {availableSubjects.length > 0 && (filterMedium !== "" || search !== "") && (
                <div className="animate-apple-unveil pt-2 border-t border-gray-100/80">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 5: Select Subject</p>
                    {filterSubject && (
                      <button onClick={() => setFilterSubject("")} className="text-[10px] text-blue-600 font-bold hover:underline">
                        <Pencil size={10} className="inline -mt-px" /> Show All Subjects
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide touch-pan-x">
                    {availableSubjects
                      .filter(s => !filterSubject || filterSubject === s.id || filterSubject === s.name)
                      .map((s, idx) => (
                        <button
                          key={s.id}
                          style={{ animationDelay: `${idx * 0.03}s` }}
                          onClick={() => setFilterSubject(filterSubject === s.id ? "" : s.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 touch-target-min animate-apple-unveil ${filterSubject === s.id ? "bg-[#1E3A8A] text-white border-transparent shadow-sm" : "bg-[#F1F3F8] text-gray-600 border-[#E2E6EF] hover:bg-[#E8ECF4]"
                            }`}
                        >
                          <SubjectIcon name={s.name} size={13} className="inline mr-1 -mt-0.5" /> {s.name} {filterSubject === s.id && <Check size={11} className="inline ml-0.5 -mt-px" />}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Step 6: Paper Type & Year Filters (Unveils when Subject is selected or search active) */}
              {activeTab === "papers" && (filterSubject !== "" || search !== "") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100/80 animate-apple-unveil">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 6: Paper Type</p>
                      {filterType && (
                        <button onClick={() => setFilterType("")} className="text-[10px] text-blue-600 font-bold hover:underline">
                          <Pencil size={10} className="inline -mt-px" /> Show All Types
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide touch-pan-x">
                      {relevantTypes
                        .filter(t => !filterType || filterType === t)
                        .map(t => (
                          <button
                            key={t}
                            onClick={() => setFilterType(filterType === t ? "" : t)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 animate-apple-unveil ${filterType === t ? "bg-[#1E3A8A] text-white border-transparent shadow-sm" : "bg-[#F1F3F8] text-gray-600 border-[#E2E6EF] hover:bg-[#E8ECF4]"
                              }`}
                          >
                            {PAPER_TYPE_CONFIG[t]?.label ?? t} {filterType === t && <Check size={11} className="inline ml-0.5 -mt-px" />}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Year</p>
                      {filterYear && (
                        <button onClick={() => setFilterYear("")} className="text-[10px] text-blue-600 font-bold hover:underline">
                          <Pencil size={10} className="inline -mt-px" /> Show All Years
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide touch-pan-x">
                      {availableYears
                        .filter(y => !filterYear || filterYear === y)
                        .map(y => (
                          <button
                            key={y}
                            onClick={() => setFilterYear(filterYear === y ? "" : y)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 animate-apple-unveil ${filterYear === y ? "bg-[#1E3A8A] text-white border-transparent shadow-sm" : "bg-[#F1F3F8] text-gray-600 border-[#E2E6EF] hover:bg-[#E8ECF4]"
                              }`}
                          >
                            {y} {filterYear === y && <Check size={11} className="inline ml-0.5 -mt-px" />}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}


              {trendingTopics.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-3 border-t border-gray-100 scrollbar-hide touch-pan-x animate-apple-unveil">
                <span className="text-gray-400 font-bold flex-shrink-0 flex items-center gap-1"><TrendingUp size={13} className="text-orange-500" /> From your library:</span>
                {trendingTopics.map(trend => (
                  <button
                    key={trend}
                    onClick={() => setSearch(trend)}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full flex-shrink-0 transition-colors font-medium text-xs"
                  >
                    {trend}
                  </button>
                ))}
              </div>
              )}

              {/* Step 7: ENTER / APPLY ACTION CTA BUTTON */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 animate-apple-unveil">
                <p className="text-xs text-gray-500 font-medium hidden sm:block">
                  <Lightbulb size={13} className="inline text-amber-500 flex-shrink-0" /> Press <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-700 font-bold">Enter ↵</kbd> or click button to jump directly to highlighted results
                </p>
                <button
                  onClick={handleScrollToResults}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#7C3AED] hover:from-[#152e72] hover:to-[#6d28d9] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer min-w-0"
                >
                  <span className="whitespace-nowrap truncate sm:whitespace-normal font-display">
                    Explore {activeTab === "papers" ? sortedPapers.length : sortedQuizzes.length} Matching Results
                  </span>
                  <ArrowDownCircle size={16} className="group-hover:translate-y-0.5 transition-transform flex-shrink-0" />
                  <span className="hidden sm:inline-flex bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-mono flex-shrink-0">Enter ↵</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 px-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/80 backdrop-blur-md rounded-2xl border border-dashed border-blue-200/90 text-xs font-semibold text-gray-600 shadow-sm animate-apple-unveil">
              <Sparkles size={14} className="inline text-amber-500 mr-1" /> Select your Education Level above (<span className="text-[#1E3A8A] font-bold">School, College, or Competitive</span>) to unveil Grade, Medium & Subject filters step-by-step!
            </div>
          )}
        </div>





        {/* ── Dynamic Live Status & Controls Header (Smooth Scroll & Highlight Target) ── */}
        <div
          id="results-grid-header"
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-500 ${highlightResults
              ? "border-blue-500 ring-4 ring-blue-500/30 scale-[1.01] shadow-2xl bg-blue-50/95"
              : "bg-[#F8F9FC]/90 backdrop-blur-md border-[#E2E6EF] shadow-sm"
            }`}
        >

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#1E3A8A] font-['Poppins'] flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              Showing {activeTab === "papers" ? sortedPapers.length : sortedQuizzes.length} {activeTab === "papers" ? "Subjective Papers" : "Rank Challenges"}
            </span>
            <button
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-all border ${showOnlyBookmarks
                  ? "bg-amber-400 text-slate-900 border-amber-500 shadow-sm scale-105"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                }`}
            >
              <Star size={11} className={showOnlyBookmarks ? "fill-slate-900" : "fill-amber-400"} />
              Saved Bookmarks ({bookmarkedIds.filter(id => papers.some(p => p.id === id) || quizzes.some(q => q.id === id)).length})
            </button>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={11} /> Clear All Filters (✕)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="newest">Sort: Latest Year</option>
              <option value="downloads">Sort: Most Popular</option>
              <option value="marks">Sort: Highest Marks</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === "grid" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-gray-400"}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === "list" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-gray-400"}`}
                title="Detailed List View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Cards Grid / List */}
        {loading ? (
          <div className="text-center py-12 bg-[#F8F9FC] rounded-2xl border border-[#E2E6EF]">
            <p className="text-gray-500 font-semibold text-sm">Loading published papers and quizzes…</p>
          </div>
        ) : activeTab === "papers" ? (
          sortedPapers.length === 0 ? (
            <div className="text-center py-12 bg-[#F8F9FC] rounded-2xl border border-[#E2E6EF]">
              <BookOpen size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-600 font-semibold text-sm">No question papers found</p>
              <p className="text-xs text-gray-400 mt-1">Try selecting different subjects or exam levels above</p>
            </div>
          ) : (
            <div>
              <div id="results-cards-container" className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                {sortedPapers.slice(0, visibleCount).map((p, idx) => {
                  const isBookmarked = bookmarkedIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      data-result-card
                      style={{ animationDelay: `${idx * 0.04}s` }}
                      className={`rounded-2xl border motion-card-hover animate-stagger-card transition-all duration-500 ${highlightResults
                          ? "border-blue-500 ring-2 ring-blue-400/40 shadow-[0_0_20px_rgba(37,99,235,0.25)] bg-blue-50/60 scale-[1.015]"
                          : "bg-white border-gray-100 hover:border-blue-200"
                        } ${viewMode === "grid" ? "p-5 flex flex-col justify-between" : "p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A]">
                            {PAPER_TYPE_CONFIG[p.type as PaperType]?.label ?? p.type} · {p.year}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400 capitalize">{p.medium}</span>
                            <button
                              onClick={() => toggleBookmark(p.id)}
                              className="p-1 text-gray-300 hover:text-amber-500 transition-colors"
                              title={isBookmarked ? "Remove Bookmark" : "Bookmark Paper"}
                            >
                              <Star size={15} className={isBookmarked ? "text-amber-500 fill-amber-500" : ""} />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-bold text-[#1E3A8A] text-sm font-['Poppins'] leading-snug mb-1 truncate">
                          {p.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">{p.subject}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                          <span><Award size={12} className="inline mr-1" /> {p.marks} Marks</span>
                          <span><Clock size={12} className="inline mr-1" /> {p.durationMinutes}m</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                            <Download size={11} className="inline mr-0.5" /> {(p.analytics?.downloads ?? 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 ${viewMode === "grid" ? "pt-3 border-t border-gray-100 mt-4" : "flex-shrink-0"}`}>
                        <button
                          onClick={() => {
                            if (user) {
                              setSelectedPaperId(p.id);
                              setView("paper-detail");
                            } else {
                              setPreviewIntent("view");
                              setPreviewPaper(p);
                            }
                          }}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Eye size={13} /> View Paper
                        </button>
                        <button
                          onClick={() => {
                            if (user) {
                              setSelectedPaperId(p.id);
                              setView("paper-detail");
                            } else {
                              setPreviewIntent("download");
                              setPreviewPaper(p);
                            }
                          }}
                          className="py-2 px-3 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="Download PDF"
                        >
                          <Download size={13} /> PDF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* See More Load Button for Papers */}
              {sortedPapers.length > visibleCount && (
                <div className="flex flex-col items-center justify-center pt-8 pb-2">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="px-6 py-3 rounded-2xl bg-white hover:bg-blue-50/80 text-[#1E3A8A] text-xs sm:text-sm font-bold border border-blue-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
                  >
                    <span>See More ({sortedPapers.length - visibleCount} Remaining)</span>
                    <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform text-[#1E3A8A]" />
                  </button>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">
                    Showing {Math.min(visibleCount, sortedPapers.length)} of {sortedPapers.length} matching papers
                  </p>
                </div>
              )}
              {sortedPapers.length > 6 && visibleCount >= sortedPapers.length && (
                <div className="text-center pt-6 pb-2 text-xs font-semibold text-gray-400">
                  ✓ All {sortedPapers.length} matching papers loaded
                </div>
              )}
            </div>
          )
        ) : (

          sortedQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-[#F8F9FC] rounded-2xl border border-[#E2E6EF]">
              <Brain size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-600 font-semibold text-sm">No quizzes found</p>
              <p className="text-xs text-gray-400 mt-1">Try selecting different subjects or exam levels above</p>
            </div>
          ) : (
            <div>
              <div id="results-cards-container" className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                {sortedQuizzes.slice(0, visibleCount).map((q, idx) => {
                  const diffCfg = DIFFICULTY_CONFIG[q.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.medium;
                  return (
                    <div
                      key={q.id}
                      data-result-card
                      style={{ animationDelay: `${idx * 0.04}s` }}
                      className={`rounded-2xl border motion-card-hover animate-stagger-card transition-all duration-500 ${highlightResults
                          ? "border-purple-500 ring-2 ring-purple-400/40 shadow-[0_0_20px_rgba(124,58,237,0.25)] bg-purple-50/60 scale-[1.015]"
                          : "bg-white border-gray-100 hover:border-violet-200"
                        } ${viewMode === "grid" ? "p-5 flex flex-col justify-between" : "p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: diffCfg.bg, color: diffCfg.text }}
                          >
                            ● {diffCfg.label}
                          </span>
                          <span className="text-xs font-semibold text-gray-400">{q.questionsCount} Questions</span>
                        </div>
                        <h3 className="font-bold text-[#1E3A8A] text-sm font-['Poppins'] leading-snug mb-1 truncate">
                          {q.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">{q.subject} · {q.chapter}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                          <span><Clock size={12} className="inline mr-1" /> {q.timeLimitMinutes}m</span>
                          <span><Award size={12} className="inline mr-1" /> {q.totalMarks}M</span>
                          <span className="text-violet-700 font-semibold bg-violet-50 px-2 py-0.5 rounded-md text-[10px]">
                            <Users size={11} className="inline mr-0.5" /> {(q.analytics?.totalAttempts ?? 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedQuizId(q.id);
                          if (user) {
                            setView("quiz-detail");
                          } else {
                            setView("register");
                          }
                        }}
                        className={`py-2.5 rounded-xl text-xs font-bold bg-[#FF7A00] text-white hover:bg-[#E66E00] transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${viewMode === "grid" ? "w-full mt-4" : "px-5 flex-shrink-0"
                          }`}
                      >
                        <Brain size={14} /> Start Quiz Practice
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* See More Load Button for Quizzes */}
              {sortedQuizzes.length > visibleCount && (
                <div className="flex flex-col items-center justify-center pt-8 pb-2">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="px-6 py-3 rounded-2xl bg-white hover:bg-purple-50/80 text-purple-900 text-xs sm:text-sm font-bold border border-purple-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
                  >
                    <span>See More ({sortedQuizzes.length - visibleCount} Remaining)</span>
                    <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform text-purple-900" />
                  </button>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">
                    Showing {Math.min(visibleCount, sortedQuizzes.length)} of {sortedQuizzes.length} matching rank challenges
                  </p>
                </div>
              )}
              {sortedQuizzes.length > 6 && visibleCount >= sortedQuizzes.length && (
                <div className="text-center pt-6 pb-2 text-xs font-semibold text-gray-400">
                  ✓ All {sortedQuizzes.length} matching rank challenges loaded
                </div>
              )}
            </div>
          )
        )}



      </div>

      {/* Guest Paper Preview Modal */}
      {previewPaper && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewPaper(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-modal-zoom space-y-4">

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A]">
                  {previewPaper.subject} · {previewPaper.year}
                </span>
                <h3 className="font-bold text-[#1E3A8A] text-lg font-['Poppins'] mt-2 leading-snug">
                  {previewPaper.title}
                </h3>
              </div>
              <button onClick={() => setPreviewPaper(null)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs text-gray-600 border border-gray-100">
              <div className="flex justify-between">
                <span>Total Marks:</span>
                <span className="font-bold text-gray-800">{previewPaper.marks} Marks</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-bold text-gray-800">{previewPaper.durationMinutes} Minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Medium:</span>
                <span className="font-bold text-gray-800">{previewPaper.medium}</span>
              </div>
              <div className="flex justify-between">
                <span>Paper Type:</span>
                <span className="font-bold text-gray-800">{PAPER_TYPE_CONFIG[previewPaper.type as PaperType]?.label ?? previewPaper.type}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs leading-relaxed">
              <Lightbulb size={14} className="inline text-amber-600 mr-1 flex-shrink-0" /> {previewPaper.hasFile ? "PDF is ready. Sign in to view or download this published paper." : "This paper is listed, but a PDF has not been uploaded yet."}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedPaperId(previewPaper.id);
                  setPreviewPaper(null);
                  if (user) setView("paper-detail");
                  else setView("register");
                }}
                className="w-full py-3 bg-[#FF7A00] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#E66E00] transition-colors shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {previewIntent === "download" ? <><Download size={16} /> Register Free to Download PDF</> : <><UserPlus size={16} /> Register Free to View Paper</>}
              </button>
              <button
                onClick={() => {
                  setSelectedPaperId(previewPaper.id);
                  setPreviewPaper(null);
                  setShowLoginModal(true);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1E3A8A] rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {previewIntent === "download" ? "Already registered? Login to Download" : "Already registered? Login to View Paper"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

