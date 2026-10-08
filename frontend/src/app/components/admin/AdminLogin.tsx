﻿import { useState } from "react";
import { Lock, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";

const LogoImage = new URL("../../../imports/logo.png", import.meta.url).href;

export function AdminLogin() {
  const { setView, setUser } = useApp();
  const [email, setEmail] = useState("admin@ParikshaCrack.in");
  const [password, setPassword] = useState("admin123");
  const [adminKey, setAdminKey] = useState("PARIKSHA_ADMIN_2026");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !adminKey) { setError("All fields are required."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (adminKey !== "PARIKSHA_ADMIN_2026") { setError("Invalid admin key."); return; }
      setUser({ id: "admin_1", name: "Admin", email, goals: [], currentGoalId: "", medium: "english", streak: 0, isAdmin: true });
      setView("admin-dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="rounded-2xl p-8 w-full max-w-md" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
        <div className="flex items-center gap-2 mb-6">
          <img src={LogoImage} alt="ParikshaCrack Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-xl sm:text-2xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>ParikshaCrack</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Admin Panel</p>
          </div>
        </div>

        <h2 className="text-xl mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1E293B" }}>Admin Login</h2>
        <p className="text-gray-500 text-sm mb-5">Authorized access only</p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1.5" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1.5" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm text-gray-700 mb-1.5" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>X-Admin-Key</label>
            <input type="text" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="Admin secret key" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E3A8A] bg-gray-50 font-mono" />
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl transition-colors font-semibold disabled:opacity-60">
            {loading ? "Authenticating..." : "Login to Admin Panel"}
          </button>
        </form>

        <div className="text-center mt-5">
          <button onClick={() => setView("landing")} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1.5 justify-center">
            <ArrowLeft size={14} /> Back to main site
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-600">
          <strong>Demo credentials:</strong> admin@ParikshaCrack.in / admin123 / Key: PARIKSHA_ADMIN_2026
        </div>
      </div>
    </div>
  );
}
