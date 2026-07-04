import { useState, useEffect } from "react";
import {
  getMyIssuedChallanCount,
  getTotalFineCollected,
  getChallanStatusStats,
  getTopViolations,
} from "../../api/officer";

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
 Same style as Citizen Dashboard
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

    <span className="text-3xl font-bold text-white">
      {value}
    </span>
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
export default function OfficerDashboard() {
  const [stats, setStats] = useState({
    totalCount: null,
    paidCount: null,
    pendingCount: null,
    totalRevenue: null,
  });

  const [topViolations, setTopViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [
          countRes,
          fineRes,
          statusRes,
          violationRes,
        ] = await Promise.all([
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
        setError(
          "Failed to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  return (
    <div className="text-white space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Overview of your challan activity and performance
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
            />

            <StatCard
              icon={Clock}
              label="Pending Challans"
              value={fmtCount(pendingCount)}
              accent="#fb923c"
            />

            <StatCard
              icon={CheckCircle}
              label="Paid Challans"
              value={fmtCount(paidCount)}
              accent="#34d399"
            />

            <StatCard
              icon={IndianRupee}
              label="Revenue Collected"
              value={fmtAmount(totalRevenue)}
              accent="#a78bfa"
            />
          </>
        )}

      </div>

      {/* Analytics Section */}

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
                label="Revenue Collected"
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
                    Revenue Collected
                  </p>

                  <p className="text-2xl font-bold text-violet-400 mt-1">
                    {fmtAmount(totalRevenue)}
                  </p>

                </div>

              </div>

            </>
          )}

        </div>

      </div>

      {/* Top Violations */}

      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6">

        <div className="flex items-center gap-2 text-slate-300 font-medium mb-5">

          <FileWarning
            size={18}
            className="text-orange-400"
          />

          Top Violations Issued

        </div>

        {loading ? (

          <div className="space-y-3">

            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-slate-700 animate-pulse"
              />
            ))}

          </div>

        ) : topViolations.length > 0 ? (

          <div className="space-y-4">

            {topViolations.map((v, i) => {

              const max =
                topViolations.length > 0
                  ? topViolations[0].count
                  : 1;

              const pct = Math.round((v.count / max) * 100);

              return (

                <div key={i} className="space-y-2">

                  <div className="flex justify-between items-center">

                    <span className="text-sm text-slate-300">
                      {v.description}
                    </span>

                    <span className="text-sm font-bold text-white">
                      {fmtCount(v.count)}
                    </span>

                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-2">

                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                      }}
                    />

                  </div>

                </div>

              );
            })}

          </div>

        ) : (

          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">

            <FileWarning
              size={36}
              className="text-orange-500/40 mb-3"
            />

            <p className="text-slate-300 font-medium">
              No violation data available
            </p>

          </div>

        )}

      </div>

      {/* Empty State */}

      {!loading && totalCount === 0 && (

        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">

          <CheckCircle
            size={40}
            className="text-emerald-500/50"
          />

          <p className="text-lg font-medium text-slate-300">
            No challans issued yet
          </p>

          <p className="text-sm">
            Your issued challan statistics will appear here.
          </p>

        </div>

      )}

    </div>
  );
}