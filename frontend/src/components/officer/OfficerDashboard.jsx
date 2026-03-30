import { useState, useEffect } from "react";
import {
  getMyIssuedChallanCount,
  getTotalFineCollected,
  getChallanStatusStats,
  getTopViolations,
} from "../../api/officer.js";

// ─── Format Helpers ─────────────────────────────────────────

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) =>
  n != null ? Number(n).toLocaleString("en-IN") : "—";

// ─── Skeleton ──────────────────────────────────────────────

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-3 shadow-sm">
    <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
    <div className="h-8 w-32 rounded-full bg-slate-100 animate-pulse" />
    <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  icon,
  iconBg,
  valueColor = "text-slate-900",
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${iconBg}`}
      >
        {icon}
      </span>
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </p>
    <p
      className={`text-3xl font-bold font-mono tracking-tight ${valueColor}`}
    >
      {value}
    </p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ─── Donut Chart ───────────────────────────────────────────

const DonutChart = ({ paid, pending, total }) => {
  if (!total) return null;

  const r = 54;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;

  const paidPct = paid / total;
  const paidDash = paidPct * circ;
  const pendingDash = (pending / total) * circ;

  return (
    <div className="flex items-center gap-8">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />

        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="18"
          strokeDasharray={`${pendingDash} ${circ - pendingDash}`}
          strokeDashoffset={-paidDash}
          strokeLinecap="round"
        />

        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="18"
          strokeDasharray={`${paidDash} ${circ - paidDash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
        />

        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#0f172a"
          fontFamily="monospace"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          total
        </text>
      </svg>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <div>
            <p className="text-xs text-slate-500">Paid</p>
            <p className="text-lg font-bold font-mono text-emerald-600">
              {fmtCount(paid)}
            </p>
            <p className="text-xs text-slate-400">
              {Math.round((paid / total) * 100)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <div>
            <p className="text-xs text-slate-500">Pending</p>
            <p className="text-lg font-bold font-mono text-amber-600">
              {fmtCount(pending)}
            </p>
            <p className="text-xs text-slate-400">
              {Math.round((pending / total) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Progress Bar ──────────────────────────────────────────

const ProgressBar = ({ label, value, max, color }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-mono font-bold text-slate-700">
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────

export default function OfficerDashboard() {
  const [stats, setStats] = useState({
    totalCount: null,
    paidCount: null,
    pendingCount: null,
    totalRevenue: null,
  });

  const [topViolations, setTopViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countRes, fineRes, statusRes, violationRes] =
          await Promise.all([
            getMyIssuedChallanCount(),
            getTotalFineCollected(),
            getChallanStatusStats(),
            getTopViolations(),
          ]);

        const total = countRes.data.data;
        const revenue = fineRes.data.data;
        const status = statusRes.data.data;

        let paid = 0;
        let pending = 0;

        status.forEach((s) => {
          if (s.status === "paid") paid = s.count;
          if (s.status === "pending") pending = s.count;
        });

        setStats({
          totalCount: total,
          paidCount: paid,
          pendingCount: pending,
          totalRevenue: revenue,
        });

        setTopViolations(violationRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { totalCount, paidCount, pendingCount, totalRevenue } = stats;
  const collectionRate = totalCount
    ? Math.round((paidCount / totalCount) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1 font-mono">
              Officer Panel
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of your challan activity and performance.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
            Last updated:{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col gap-8">

        {/* ── Stat Cards ── */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <StatSkeleton key={i} />
              ))
            ) : (
              <>
                <StatCard
                  label="Total Challans"
                  value={fmtCount(totalCount)}
                  sub="Issued by you"
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
                  label="Revenue"
                  value={fmtAmount(totalRevenue)}
                  sub="Total fine collected"
                  icon="💰"
                  iconBg="bg-indigo-50"
                  valueColor="text-indigo-600"
                />
              </>
            )}
          </div>
        </div>

        {/* ── Bottom Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Donut */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">
                Challan Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution of paid vs pending challans
              </p>
            </div>

            {!loading && (
              <DonutChart
                paid={paidCount}
                pending={pendingCount}
                total={totalCount}
              />
            )}
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-800">
                Collection Progress
              </h2>
            </div>

            {!loading && (
              <div className="flex flex-col gap-5">
                <ProgressBar
                  label="Paid Challans"
                  value={paidCount}
                  max={totalCount}
                  color="bg-emerald-400"
                />
                <ProgressBar
                  label="Pending Challans"
                  value={pendingCount}
                  max={totalCount}
                  color="bg-amber-400"
                />

                <div className="mt-2 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">
                      Collection Rate
                    </p>
                    <p className="text-2xl font-bold font-mono text-indigo-600">
                      {collectionRate}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Violations */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-slate-800">
              Top Violations
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Most frequent violations issued by you
            </p>
          </div>

          {!loading && (
            <div className="flex flex-col gap-3">
              {topViolations.map((v, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-2"
                >
                  <span className="text-sm text-slate-700">
                    {v.description}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {fmtCount(v.count)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}