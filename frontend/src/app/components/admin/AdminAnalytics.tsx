import { useEffect, useState, type ReactNode } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, Users, Activity, Trophy, Download, Eye, Loader2, FileText, Brain } from "lucide-react";
import { fetchAdminAnalytics, type AdminAnalytics } from "../../lib/api";

const COLORS = ["#1E3A8A", "#F97316", "#16A34A", "#7C3AED", "#DC2626", "#0284C7", "#DB2777"];

function StatCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon size={18} className={color} />
      </div>
      <div className="text-2xl mb-0.5" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
      {sub && <div className="text-xs text-green-600 mt-1">{sub}</div>}
    </div>
  );
}

function EmptyHint({ message }: { message: string }) {
  return <p className="text-sm text-gray-400 text-center py-10">{message}</p>;
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(30,58,138,0.06)" }}>
      <h3 className="mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#1E3A8A" }}>{title}</h3>
      {children}
    </div>
  );
}

export function AdminAnalytics() {
  const [stats, setStats] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAdminAnalytics()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Could not load analytics."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-24 text-gray-400 gap-2">
        <Loader2 size={20} className="animate-spin" />
        Loading analytics...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-5xl mx-auto rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-red-600 text-sm">{error || "Could not load analytics."}</p>
      </div>
    );
  }

  const topQuizMax = Math.max(1, ...stats.topQuizzes.map((q) => q.attempts));
  const goalTotal = stats.goalDistribution.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#1E3A8A" }}>Analytics</h2>
        <p className="text-gray-500 text-sm">Live metrics from your database</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents.toLocaleString()}
          sub={stats.newStudentsThisWeek ? `+${stats.newStudentsThisWeek} this week` : "No new sign-ups this week"}
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <StatCard
          icon={Activity}
          label="Total Attempts"
          value={stats.totalAttempts.toLocaleString()}
          sub={stats.attemptsToday ? `+${stats.attemptsToday} today` : "No attempts today"}
          color="text-green-600"
          bg="bg-green-100"
        />
        <StatCard
          icon={TrendingUp}
          label="Daily Active"
          value={stats.dailyActiveUsers}
          sub="students active today"
          color="text-purple-600"
          bg="bg-purple-100"
        />
        <StatCard
          icon={Trophy}
          label="Avg Score"
          value={stats.totalAttempts ? `${stats.avgScore}%` : "—"}
          sub="across all quiz attempts"
          color="text-orange-600"
          bg="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Papers" value={stats.totalPapers} sub={`${stats.paperViews.toLocaleString()} views`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Download} label="Downloads" value={stats.paperDownloads.toLocaleString()} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={Brain} label="Quizzes" value={stats.totalQuizzes} color="text-violet-600" bg="bg-violet-50" />
        <StatCard icon={Eye} label="Paper Views" value={stats.paperViews.toLocaleString()} color="text-cyan-600" bg="bg-cyan-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Student Registrations">
          {stats.registrationTrend.every((d) => d.count === 0) ? (
            <EmptyHint message="No registrations in the last 6 months." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.registrationTrend}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Area type="monotone" dataKey="count" name="Students" stroke="#1E3A8A" fill="url(#regGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Daily Quiz Attempts (Last 7 Days)">
          {stats.dailyAttempts.every((d) => d.attempts === 0) ? (
            <EmptyHint message="No quiz attempts this week." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.dailyAttempts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="attempts" name="Attempts" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Subject Engagement">
        {stats.subjectEngagement.length === 0 ? (
          <EmptyHint message="Add papers and quizzes to see subject engagement." />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, stats.subjectEngagement.length * 36)}>
            <BarChart data={stats.subjectEngagement} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: "#94A3B8" }} width={90} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="views" name="Paper views" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
              <Bar dataKey="attempts" name="Quiz attempts" fill="#F97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChartCard title="Medium Distribution">
          {stats.mediumDistribution.length === 0 ? (
            <EmptyHint message="No students registered yet." />
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-[140px] flex-shrink-0" style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={stats.mediumDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="count">
                      {stats.mediumDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2">
                {stats.mediumDistribution.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{d.count} · {d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Goal Distribution">
          {stats.goalDistribution.length === 0 ? (
            <EmptyHint message="Students have not selected exam goals yet." />
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-[140px] flex-shrink-0" style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={stats.goalDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {stats.goalDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-3">
                {stats.goalDistribution.map((d, i) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-gray-600">{d.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{d.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${(d.value / goalTotal) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Most Downloaded Papers">
          {stats.topPapers.length === 0 ? (
            <EmptyHint message="No papers uploaded yet." />
          ) : (
            <div className="space-y-3">
              {stats.topPapers.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{p.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Eye size={10} /> {p.views}
                      <Download size={10} className="ml-1" /> {p.downloads}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Most Attempted Quizzes">
          {stats.topQuizzes.every((q) => q.attempts === 0) ? (
            <EmptyHint message="No quiz attempts yet." />
          ) : (
            <div className="space-y-3">
              {stats.topQuizzes.map((q, i) => (
                <div key={q.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                      <p className="text-sm text-gray-700 truncate">{q.title}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{q.attempts.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-8">
                    <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${(q.attempts / topQuizMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
