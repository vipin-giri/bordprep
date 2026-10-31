import { ReactNode, useState } from "react";
import { LayoutDashboard, FileText, Brain, Users, Bell, BarChart3, FolderTree, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { View } from "../context/AppContext";
import { setToken } from "../../lib/api";

const LogoImage = new URL("../../../imports/logo.png", import.meta.url).href;

const navItems: { icon: any; label: string; view: View }[] = [
  { icon: LayoutDashboard, label: "Dashboard", view: "admin-dashboard" },
  { icon: FileText, label: "Papers", view: "admin-papers" },
  { icon: Brain, label: "Quizzes", view: "admin-quizzes" },
  { icon: FolderTree, label: "Subjects & Chapters", view: "admin-subjects" },
  { icon: Users, label: "Students", view: "admin-users" },
  { icon: Bell, label: "Announcements", view: "admin-announcements" },
  { icon: BarChart3, label: "Analytics", view: "admin-analytics" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { view, setView, setUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    setToken(null);
    setUser(null);
    setView("landing");
  };

  return (
    <div className="min-h-screen texture-paper flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 fixed inset-y-0 left-0 h-screen z-30 overflow-hidden">
        {/* Film grain overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")", backgroundSize: "300px 300px", mixBlendMode: "overlay", zIndex: 0 }} />
        <div className="p-5 border-b border-slate-700 relative z-10">
          <div className="flex items-center gap-2">
            <img src={LogoImage} alt="ParikshaCrack Logo" className="w-10 h-10 object-contain" />
            <div>
              <div className="text-white font-bold text-base" style={{ fontFamily: "Poppins, sans-serif" }}>ParikshaCrack</div>
              <div className="text-slate-400 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-2 relative z-10">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm transition-all ${view === item.view ? "bg-[#F97316] text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
            >
              <item.icon size={17} />
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: view === item.view ? 600 : 400 }}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 relative z-10">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-7 h-7 bg-[#F97316] rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <div className="text-white text-xs" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>Admin</div>
              <div className="text-slate-400 text-xs">admin@ParikshaCrack.in</div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar (z-[80] to sit cleanly above bottom navigation and header) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 flex flex-col overflow-hidden shadow-2xl">
            {/* Film grain overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")", backgroundSize: "300px 300px", mixBlendMode: "overlay", zIndex: 0 }} />
            <div className="p-4 border-b border-slate-800 flex items-center justify-between relative z-10 bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <img src={LogoImage} alt="ParikshaCrack Logo" className="w-9 h-9 object-contain" />
                <div>
                  <span className="text-white font-bold text-base block leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>Admin Panel</span>
                  <span className="text-slate-400 text-[11px]">ParikshaCrack</span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 py-3 px-3 relative z-10 overflow-y-auto">
              {navItems.map(item => (
                <button
                  key={item.view}
                  onClick={() => { setView(item.view); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                    view === item.view
                      ? "bg-[#F97316] text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Sidebar Logout Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 relative z-10 space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
              <div className="flex items-center gap-2.5 px-1">
                <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-xs font-semibold truncate" style={{ fontFamily: "Poppins, sans-serif" }}>Admin</div>
                  <div className="text-slate-400 text-[11px] truncate">admin@ParikshaCrack.in</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-200 border border-red-500/30 text-sm font-medium transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* Sticky Header with Top Right Logout */}
        <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-20" style={{ backgroundColor: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(30,58,138,0.08)", boxShadow: "0 1px 16px rgba(30,58,138,0.07)" }}>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Admin</span>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="text-gray-700 text-sm" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>
                {navItems.find(n => n.view === view)?.label || "Panel"}
              </span>
            </div>
          </div>

          {/* Quick Logout Button in Header (visible on mobile and desktop) */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors min-h-[36px]"
            title="Log out of Admin Panel"
            aria-label="Logout"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Note: Do not put animate-view-fade directly on main to prevent CSS transform stacking context trapping of fixed modals */}
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation (z-30 so all modals and sidebar drawer sit above it) */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(30,58,138,0.08)",
            boxShadow: "0 -2px 16px rgba(30,58,138,0.08)"
          }}
        >
          <nav className="flex items-stretch overflow-x-auto scrollbar-none px-1" style={{ minHeight: "60px" }}>
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex-shrink-0 flex flex-col items-center justify-center py-2 px-1 min-w-[56px] sm:flex-1 transition-all text-xs ${
                  view === item.view
                    ? "text-slate-700 border-t-2 border-[#F97316] bg-orange-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <item.icon size={20} />
                <span className="mt-0.5 font-medium text-[9px] sm:text-[10px] leading-tight">{item.label.split(" ")[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
