import { useState, useEffect } from "react";
import {
  getMyIssuedChallanCount,
  getTotalFineCollected,
  getChallanStatusStats,
  getTopViolations,
} from "../../api/officer.js";

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) =>
  n != null ? Number(n).toLocaleString("en-IN") : "—";

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-3 shadow-sm">
    <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
    <div className="h-8 w-32 rounded-full bg-slate-100 animate-pulse" />
    <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
  </div>
);

const StatCard = ({ label, value, sub, icon, iconBg, valueColor = "text-slate-900" }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${iconBg}`}>
        {icon}
      </span>
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-bold font-mono tracking-tight ${valueColor}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

const ProgressBar = ({ label, value, max, color }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-mono font-bold text-slate-700">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

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
        const [countRes, fineRes, statusRes, violationRes] = await Promise.all([
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
  const collectionRate = totalCount ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <h1 className="text-2xl font-bold">Officer Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your challan activity</p>
      </div>

      <div className="px-8 py-8 flex flex-col gap-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Total Challans" value={fmtCount(totalCount)} icon="📋" iconBg="bg-slate-100" />
              <StatCard label="Paid" value={fmtCount(paidCount)} icon="✅" iconBg="bg-emerald-50" valueColor="text-emerald-600" />
              <StatCard label="Pending" value={fmtCount(pendingCount)} icon="⏳" iconBg="bg-amber-50" valueColor="text-amber-600" />
              <StatCard label="Revenue" value={fmtAmount(totalRevenue)} icon="💰" iconBg="bg-indigo-50" valueColor="text-indigo-600" />
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-sm font-bold mb-4">Collection Progress</h2>
          {!loading && (
            <div className="flex flex-col gap-4">
              <ProgressBar label="Paid" value={paidCount} max={totalCount} color="bg-emerald-400" />
              <ProgressBar label="Pending" value={pendingCount} max={totalCount} color="bg-amber-400" />
              <div className="text-sm text-slate-500">Collection Rate: {collectionRate}%</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-sm font-bold mb-4">Top Violations</h2>
          {!loading && (
            <ul className="space-y-2">
              {topViolations.map((v, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{v.description}</span>
                  <span className="font-mono">{v.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
