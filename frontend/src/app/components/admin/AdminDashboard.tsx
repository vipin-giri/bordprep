import { useEffect, useState } from "react";
import { Users, FileText, Brain, Activity, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "../context/AppContext";
import { fetchAdminDashboard, type AdminDashboardStats } from "../../lib/api";

function StatCard({ icon: Icon, label, value, change, color, bg }: {
  icon: typeof Users;
  label: string;
  value: string | number;
  change?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={19} className={color} />
        </div>
        {change && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{change}</span>}
      </div>
      <div className="text-2xl mb-0.5" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}

function EmptyHint({ message }: { message: string }) {
  return <p className="text-sm text-gray-400 text-center py-6">{message}</p>;
}

export function AdminDashboard() {
  const { setView } = useApp();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchAdminDashboard()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-24 text-gray-400 gap-2">
        <Loader2 size={20} className="animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-5xl mx-auto rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-red-600 text-sm">{error || "Could not load dashboard."}</p>
      </div>
    );
  }

  const topQuizMax = stats.topQuizzes[0]?.attempts ?? 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>Admin Dashboard</h2>
        <p className="text-gray-500 text-sm">Live platform stats from your database</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents.toLocaleString()}
          change={stats.newStudentsThisWeek > 0 ? `+${stats.newStudentsThisWeek} this week` : undefined}
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <StatCard icon={FileText} label="Question Papers" value={stats.totalPapers} color="text-purple-600" bg="bg-purple-100" />
        <StatCard icon={Brain} label="MCQ Quizzes" value={stats.totalQuizzes} color="text-orange-600" bg="bg-orange-100" />
        <StatCard
          icon={Activity}
          label="Total Attempts"
          value={stats.totalAttempts.toLocaleString()}
          change={stats.attemptsToday > 0 ? `+${stats.attemptsToday} today` : undefined}
          color="text-green-600"
          bg="bg-green-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <h3 className="mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1E3A8A" }}>Student Growth</h3>
          {stats.registrationTrend.length === 0 ? (
            <EmptyHint message="No student registrations yet." />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <h3 className="mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1E3A8A" }}>Top 5 Quizzes</h3>
          {stats.topQuizzes.length === 0 ? (
            <EmptyHint message="No quiz attempts recorded yet." />
          ) : (
            <div className="space-y-3">
              {stats.topQuizzes.map((q) => (
                <div key={q.title}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate">{q.title}</span>
                    <span className="text-gray-500 ml-2 flex-shrink-0">{q.attempts.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${(q.attempts / topQuizMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1E3A8A" }}>Recent Papers</h3>
            <button onClick={() => setView("admin-papers")} className="text-xs text-[#1E3A8A] hover:underline">View all</button>
          </div>
          {stats.recentPapers.length === 0 ? (
            <EmptyHint message="No papers uploaded yet." />
          ) : (
            <div className="space-y-2">
              {stats.recentPapers.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.subject} · {p.year}</p>
                  </div>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1E3A8A" }}>Recent Students</h3>
            <button onClick={() => setView("admin-users")} className="text-xs text-[#1E3A8A] hover:underline">View all</button>
          </div>
          {stats.recentStudents.length === 0 ? (
            <EmptyHint message="No student accounts yet." />
          ) : (
            <div className="space-y-2">
              {stats.recentStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-7 h-7 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      {s.goalLabels[0] ?? "No goal set"} · {s.totalAttempts} attempts
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {s.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Daily Active Users", value: stats.dailyActiveUsers },
          { label: "NEET Students", value: stats.neetStudents },
          { label: "Board Students", value: stats.boardStudents },
          { label: "Blocked Accounts", value: stats.blockedAccounts },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
