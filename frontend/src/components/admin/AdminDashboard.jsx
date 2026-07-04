import { useState, useEffect } from "react";
import {
  getTotalChallansCount,
  getTotalRevenue,
  getChallanCountByStatus,
} from "../../api/admin.js";

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) =>
  n != null ? Number(n).toLocaleString("en-IN") : "—";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-3 shadow-sm">
    <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
    <div className="h-8 w-32 rounded-full bg-slate-100 animate-pulse" />
    <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon, iconBg, valueColor = "text-slate-900", trend }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${iconBg}`}>
        {icon}
      </span>
      {trend != null && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full font-mono
          ${trend >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-bold font-mono tracking-tight ${valueColor}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ─── Donut Chart (pure SVG) ───────────────────────────────────────────────────

const DonutChart = ({ paid, pending, total }) => {
  if (!total) return null;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const paidPct   = paid / total;
  const paidDash  = paidPct * circ;
  const pendingDash = (pending / total) * circ;

  return (
    <div className="flex items-center gap-8">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {/* Pending arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="18"
          strokeDasharray={`${pendingDash} ${circ - pendingDash}`}
          strokeDashoffset={-paidDash}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s ease" }}
        />
        {/* Paid arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="18"
          strokeDasharray={`${paidDash} ${circ - paidDash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s ease" }}
        />
        {/* Centre label */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a" fontFamily="monospace">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
          total
        </text>
      </svg>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Paid</p>
            <p className="text-lg font-bold font-mono text-emerald-600">{fmtCount(paid)}</p>
            <p className="text-xs text-slate-400">{total ? Math.round((paid / total) * 100) : 0}% of total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending</p>
            <p className="text-lg font-bold font-mono text-amber-600">{fmtCount(pending)}</p>
            <p className="text-xs text-slate-400">{total ? Math.round((pending / total) * 100) : 0}% of total</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ label, value, max, color }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-mono font-bold text-slate-700">{pct}%</span>
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
    totalCount:   null,
    paidCount:    null,
    pendingCount: null,
    totalRevenue: null,
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

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

        const total   = extract(totalRes);
        const revenue = extract(revenueRes);
        const paid    = extract(paidRes);
        const pending = extract(pendingRes);

        setStats({
          totalCount:   Number(total.total_challans   ?? total.count   ?? total ?? 0),
          paidCount:    Number(paid.count             ?? paid.total    ?? paid ?? 0),
          pendingCount: Number(pending.count          ?? pending.total ?? pending ?? 0),
          totalRevenue: Number(revenue.total_revenue  ?? revenue.amount ?? revenue ?? 0),
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
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1 font-mono">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of challan activity and revenue collection.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
            Last updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col gap-8">

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error}
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
                  icon="📋"
                  iconBg="bg-slate-100"
                />
                <StatCard
                  label="Paid Challans"
                  value={fmtCount(paidCount)}
                  sub={`${collectionRate}% collection rate`}
                  icon="✅"
                  iconBg="bg-emerald-50"
                  valueColor="text-emerald-600"
                />
                <StatCard
                  label="Pending Challans"
                  value={fmtCount(pendingCount)}
                  sub="Awaiting payment"
                  icon="⏳"
                  iconBg="bg-amber-50"
                  valueColor="text-amber-600"
                />
                <StatCard
                  label="Total Revenue"
                  value={fmtAmount(totalRevenue)}
                  sub={`Avg. ${fmtAmount(avgFine)} per paid challan`}
                  icon="💰"
                  iconBg="bg-indigo-50"
                  valueColor="text-indigo-600"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Challan Breakdown Donut */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">Challan Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribution of paid vs pending challans</p>
            </div>
            {loading ? (
              <div className="flex items-center gap-8">
                <div className="w-36 h-36 rounded-full border-18 border-slate-100 animate-pulse" />
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
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
                <ProgressBar label="Paid Challans"    value={paidCount}    max={totalCount} color="bg-emerald-400" />
                <ProgressBar label="Pending Challans" value={pendingCount} max={totalCount} color="bg-amber-400" />
                <ProgressBar label="Revenue Realised" value={paidCount}    max={totalCount} color="bg-indigo-400" />

                <div className="mt-2 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Collection Rate</p>
                    <p className="text-2xl font-bold font-mono text-indigo-600">{collectionRate}%</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Avg. Fine Collected</p>
                    <p className="text-2xl font-bold font-mono text-emerald-600">{fmtAmount(avgFine)}</p>
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