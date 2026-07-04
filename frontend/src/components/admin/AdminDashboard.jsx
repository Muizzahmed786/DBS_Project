import { useState, useEffect } from "react";
import {
  getTotalChallansCount,
  getTotalRevenue,
  getChallanCountByStatus,
} from "../../api/admin.js";

import {
  FileWarning,
  CheckCircle,
  Clock,
  IndianRupee,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

/*───────────────────────────────────────────────────────────
 Helpers
───────────────────────────────────────────────────────────*/

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtCount = (n) =>
  n != null ? Number(n).toLocaleString("en-IN") : "—";

/*───────────────────────────────────────────────────────────
 Skeleton Card
───────────────────────────────────────────────────────────*/

const StatSkeleton = () => (
  <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">

      <div className="h-4 w-24 rounded bg-slate-700 animate-pulse" />

      <div className="w-10 h-10 rounded-xl bg-slate-700 animate-pulse" />

    </div>

    <div className="h-8 w-20 rounded bg-slate-700 animate-pulse" />
  </div>
);

/*───────────────────────────────────────────────────────────
 Stat Card
 Same design as Citizen Dashboard
───────────────────────────────────────────────────────────*/

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
  loading,
}) => (
  <div
    style={{
      borderColor: `${accent}33`,
      background: `${accent}0d`,
    }}
    className="rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 duration-200"
  >
    <div className="flex items-center justify-between">

      <span className="text-slate-400 text-sm font-medium">
        {label}
      </span>

      <div
        style={{
          background: `${accent}22`,
          color: accent,
        }}
        className="p-2 rounded-xl"
      >
        <Icon size={18} />
      </div>

    </div>

    {loading ? (
      <div className="h-8 w-16 rounded-lg bg-slate-700 animate-pulse" />
    ) : (
      <span className="text-3xl font-bold text-white">
        {value}
      </span>
    )}
  </div>
);
/*───────────────────────────────────────────────────────────
 Modern Donut Chart
───────────────────────────────────────────────────────────*/

const DonutChart = ({ paid, pending, total }) => {
  if (!total) return null;

  const radius = 60;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;

  const circumference = normalizedRadius * 2 * Math.PI;

  const percentage = (paid / total) * 100;

  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">

      {/* Donut */}

      <div className="relative">

        <svg
          width={radius * 2}
          height={radius * 2}
          className="-rotate-90"
        >

          {/* Background Ring */}

          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="#fb923c"
            strokeWidth={stroke}
          />

          {/* Paid Ring */}

          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="#34d399"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset .8s ease",
            }}
          />

        </svg>

        {/* Center Text */}

        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <span className="text-2xl font-bold text-white">
            {Math.round(percentage)}%
          </span>

          <span className="text-xs text-slate-400">
            Paid
          </span>

        </div>

      </div>

      {/* Legend */}

      <div className="space-y-5">

        <div className="flex items-center gap-3">

          <span className="w-3 h-3 rounded-full bg-emerald-400" />

          <div>

            <p className="text-sm text-slate-400">
              Paid Challans
            </p>

            <p className="text-xl font-bold text-white">
              {fmtCount(paid)}
            </p>

            <p className="text-xs text-slate-500">
              {Math.round((paid / total) * 100)}%
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <span className="w-3 h-3 rounded-full bg-orange-400" />

          <div>

            <p className="text-sm text-slate-400">
              Pending Challans
            </p>

            <p className="text-xl font-bold text-white">
              {fmtCount(pending)}
            </p>

            <p className="text-xs text-slate-500">
              {Math.round((pending / total) * 100)}%
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

/*───────────────────────────────────────────────────────────
 Progress Bar
───────────────────────────────────────────────────────────*/

const ProgressBar = ({ label, value, max, color }) => {
  const pct = max
    ? Math.round((value / max) * 100)
    : 0;

  return (
    <div className="space-y-2">

      <div className="flex justify-between">

        <span className="text-sm text-slate-300">
          {label}
        </span>

        <span className="text-sm font-semibold text-white">
          {pct}%
        </span>

      </div>

      <div className="w-full bg-slate-700 rounded-full h-2.5">

        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${color}`}
          style={{
            width: `${pct}%`,
          }}
        />

      </div>

    </div>
  );
};

/*───────────────────────────────────────────────────────────
 Main Component
───────────────────────────────────────────────────────────*/

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCount: null,
    paidCount: null,
    pendingCount: null,
    totalRevenue: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const [
          totalRes,
          revenueRes,
          paidRes,
          pendingRes,
        ] = await Promise.all([
          getTotalChallansCount(),
          getTotalRevenue(),
          getChallanCountByStatus("paid"),
          getChallanCountByStatus("pending"),
        ]);

        const extract = (res) =>
          res.data?.data ?? res.data ?? {};

        const total = extract(totalRes);
        const revenue = extract(revenueRes);
        const paid = extract(paidRes);
        const pending = extract(pendingRes);

        setStats({
          totalCount: Number(
            total.total_challans ??
              total.count ??
              total ??
              0
          ),

          paidCount: Number(
            paid.count ??
              paid.total ??
              paid ??
              0
          ),

          pendingCount: Number(
            pending.count ??
              pending.total ??
              pending ??
              0
          ),

          totalRevenue: Number(
            revenue.total_revenue ??
              revenue.amount ??
              revenue ??
              0
          ),
        });
      } catch {
        setError(
          "Failed to load dashboard stats. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const {
    totalCount,
    paidCount,
    pendingCount,
    totalRevenue,
  } = stats;

  const collectionRate = totalCount
    ? Math.round((paidCount / totalCount) * 100)
    : 0;

  const avgFine = paidCount
    ? Math.round(totalRevenue / paidCount)
    : 0;

  // BLOCK 3 STARTS FROM THE return() BELOW
  return (
    <div className="text-white space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Overview of challan activity and revenue collection
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stat Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))
        ) : (
          <>
            <StatCard
              icon={FileWarning}
              label="Total Challans"
              value={fmtCount(totalCount)}
              accent="#60a5fa"
              loading={loading}
            />

            <StatCard
              icon={Clock}
              label="Pending Challans"
              value={fmtCount(pendingCount)}
              accent="#fb923c"
              loading={loading}
            />

            <StatCard
              icon={CheckCircle}
              label="Paid Challans"
              value={fmtCount(paidCount)}
              accent="#34d399"
              loading={loading}
            />

            <StatCard
              icon={IndianRupee}
              label="Total Revenue"
              value={fmtAmount(totalRevenue)}
              accent="#a78bfa"
              loading={loading}
            />
          </>
        )}

      </div>

      {/* Bottom Section */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Challan Breakdown */}

        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6">

          <div className="flex items-center gap-2 text-slate-300 font-medium mb-5">

            <TrendingUp
              size={18}
              className="text-emerald-400"
            />

            Challan Breakdown

          </div>

          {loading ? (
            <div className="h-40 rounded-xl bg-slate-700 animate-pulse" />
          ) : (
            <DonutChart
              paid={paidCount}
              pending={pendingCount}
              total={totalCount}
            />
          )}

        </div>

        {/* Collection Progress */}

        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 space-y-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2 text-slate-300 font-medium">

              <TrendingUp
                size={18}
                className="text-emerald-400"
              />

              Collection Progress

            </div>

            <span className="text-emerald-400 font-bold text-lg">
              {collectionRate}%
            </span>

          </div>

          {loading ? (
            <div className="space-y-5">

              <div className="h-3 rounded bg-slate-700 animate-pulse" />

              <div className="h-3 rounded bg-slate-700 animate-pulse" />

              <div className="h-3 rounded bg-slate-700 animate-pulse" />

            </div>
          ) : (
            <>
              <ProgressBar
                label="Paid Challans"
                value={paidCount}
                max={totalCount}
                color="bg-gradient-to-r from-emerald-500 to-teal-400"
              />

              <ProgressBar
                label="Pending Challans"
                value={pendingCount}
                max={totalCount}
                color="bg-gradient-to-r from-orange-500 to-amber-400"
              />

              <ProgressBar
                label="Revenue Realised"
                value={paidCount}
                max={totalCount}
                color="bg-gradient-to-r from-violet-500 to-purple-400"
              />
              <div className="border-t border-slate-700 pt-5 grid grid-cols-2 gap-4">

                <div className="rounded-xl bg-slate-900/40 border border-slate-700 p-4">

                  <p className="text-xs text-slate-400">
                    Collection Rate
                  </p>

                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {collectionRate}%
                  </p>

                </div>

                <div className="rounded-xl bg-slate-900/40 border border-slate-700 p-4">

                  <p className="text-xs text-slate-400">
                    Avg Fine Collected
                  </p>

                  <p className="text-2xl font-bold text-violet-400 mt-1">
                    {fmtAmount(avgFine)}
                  </p>

                </div>

              </div>

            </>
          )}

        </div>

      </div>

      {/* Empty State */}

      {!loading && !error && totalCount === 0 && (

        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">

          <CheckCircle
            size={40}
            className="text-emerald-500/50"
          />

          <p className="text-lg font-medium text-slate-300">
            No challans available
          </p>

          <p className="text-sm">
            Challan statistics will appear here once records exist.
          </p>

        </div>

      )}

    </div>
  );
}