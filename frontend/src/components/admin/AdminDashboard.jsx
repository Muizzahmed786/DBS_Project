import { useState, useEffect } from "react";
import {
  getTotalChallansCount,
  getTotalRevenue,
  getChallanCountByStatus,
} from "../../api/admin.js";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../context/useAuth.js";
const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) =>
  n != null ? Number(n).toLocaleString("en-IN") : "—";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-blue-100 p-6 flex flex-col gap-3 shadow-sm">
    <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
    <div className="h-8 w-32 rounded-full bg-slate-100 animate-pulse" />
    <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon, iconBg, valueColor = "text-slate-900", trend }) => (
  <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </span>
      {trend != null && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full
          ${trend >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ─── Donut Chart (pure SVG) ───────────────────────────────────────────────────

const DonutChart = ({ paid, pending, total }) => {
  if (!total) return null;

  const r = 54;
  const cx = 70;
  const cy = 70;

  const circumference = 2 * Math.PI * r;

  const paidLength = (paid / total) * circumference;
  const pendingLength = (pending / total) * circumference;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#eff6ff"
          strokeWidth="18"
        />

        {/* Paid */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="18"
          strokeDasharray={`${paidLength} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
        />

        {/* Pending */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="18"
          strokeDasharray={`${pendingLength} ${circumference}`}
          strokeDashoffset={-paidLength}
          strokeLinecap="round"
        />
      </g>

      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        className="fill-slate-800 font-bold text-lg"
      >
        {total}
      </text>

      <text
        x={cx}
        y={cy + 13}
        textAnchor="middle"
        className="fill-slate-400 text-xs"
      >
        Total
      </text>
    </svg>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ label, value, max, color }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-700">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCount: null,
    paidCount: null,
    pendingCount: null,
    totalRevenue: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {user}=useAuth();
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [totalRes, revenueRes, paidRes, pendingRes] = await Promise.all([
          getTotalChallansCount(),
          getTotalRevenue(),
          getChallanCountByStatus("paid"),
          getChallanCountByStatus("pending"),
        ]);

        const extract = (res) => res.data?.data ?? res.data ?? {};

        const total = extract(totalRes);
        const revenue = extract(revenueRes);
        const paid = extract(paidRes);
        const pending = extract(pendingRes);

        setStats({
          totalCount: Number(total.total_challans ?? total.count ?? total ?? 0),
          paidCount: Number(paid.count ?? paid.total ?? paid ?? 0),
          pendingCount: Number(pending.count ?? pending.total ?? pending ?? 0),
          totalRevenue: Number(revenue.total_revenue ?? revenue.amount ?? revenue ?? 0),
        });
      } catch {
        setError("Failed to load dashboard stats. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const { totalCount, paidCount, pendingCount, totalRevenue } = stats;
  const collectionRate = totalCount ? Math.round((paidCount / totalCount) * 100) : 0;
  const avgFine = paidCount ? Math.round(totalRevenue / paidCount) : 0;

  return (
    <div className="min-h-screen bg-blue-50/40">

      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-slate-800 mb-1">
              Welcome Back, {user.full_name}
            </p>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of challan activity and revenue collection.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
            Last updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col gap-6">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            <AlertTriangle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total Challans"
                  value={fmtCount(totalCount)}
                  sub="All issued challans"
                  icon={<ClipboardList size={20} className="text-slate-600" />}
                  iconBg="bg-slate-100"
                />
                <StatCard
                  label="Paid Challans"
                  value={fmtCount(paidCount)}
                  sub={`${collectionRate}% collection rate`}
                  icon={<CheckCircle2 size={20} className="text-emerald-600" />}
                  iconBg="bg-emerald-50"
                  valueColor="text-emerald-600"
                />
                <StatCard
                  label="Pending Challans"
                  value={fmtCount(pendingCount)}
                  sub="Awaiting payment"
                  icon={<Clock size={20} className="text-amber-600" />}
                  iconBg="bg-amber-50"
                  valueColor="text-amber-600"
                />
                <StatCard
                  label="Total Revenue"
                  value={fmtAmount(totalRevenue)}
                  sub={`Avg. ${fmtAmount(avgFine)} per paid challan`}
                  icon={<IndianRupee size={20} className="text-blue-600" />}
                  iconBg="bg-blue-50"
                  valueColor="text-blue-600"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Challan Breakdown Donut */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">Challan Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribution of paid vs pending challans</p>
            </div>
            {loading ? (
              <div className="flex items-center gap-8">
                <div className="w-36 h-36 rounded-full border-[18px] border-slate-100 animate-pulse" />
                <div className="flex flex-col gap-4">
                  <div className="h-3 w-28 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
            ) : (
              <DonutChart paid={paidCount} pending={pendingCount} total={totalCount} />
            )}
          </div>

          {/* Collection Progress */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">Collection Progress</h2>
              <p className="text-xs text-slate-400 mt-0.5">How challan statuses compare to total</p>
            </div>
            {loading ? (
              <div className="flex flex-col gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
                    <div className="h-2 w-full rounded-full bg-slate-100 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <ProgressBar label="Paid Challans" value={paidCount} max={totalCount} color="bg-blue-600" />
                <ProgressBar label="Pending Challans" value={pendingCount} max={totalCount} color="bg-amber-400" />
                <ProgressBar label="Revenue Realised" value={paidCount} max={totalCount} color="bg-emerald-400" />

                <div className="mt-2 pt-4 border-t border-blue-100 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Collection Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{collectionRate}%</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Avg. Fine Collected</p>
                    <p className="text-2xl font-bold text-emerald-600">{fmtAmount(avgFine)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}