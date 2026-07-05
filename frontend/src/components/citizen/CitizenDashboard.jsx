import { useEffect, useState } from "react";
import {
  getMyChallanCount,
  getMyChallanByStatusCount,
  getMyVehicleCount,
  getMyPaymentCount,
} from "../../api/citizen";
import {
  FileWarning,
  Car,
  CreditCard,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {useAuth} from "../../context/useAuth.js"
// ─── Stat Card ─────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, accent, iconBg, valueColor, loading }) => (
  <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm flex flex-col gap-1 hover:shadow-md hover:border-blue-200 transition-all">
    <div className="flex items-start justify-between mb-2">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={accent} />
      </span>
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    {loading ? (
      <div className="h-8 w-20 rounded-full bg-blue-50 animate-pulse mt-1" />
    ) : (
      <span className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value ?? 0}</span>
    )}
  </div>
);

const CitizenDashboard = () => {
  const [stats, setStats] = useState({
    totalChallans: null,
    pendingChallans: null,
    paidChallans: null,
    totalVehicles: null,
    totalPayments: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {user}=useAuth();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [total, pending, paid, vehicles, payments] = await Promise.all([
          getMyChallanCount(),
          getMyChallanByStatusCount("pending"),
          getMyChallanByStatusCount("paid"),
          getMyVehicleCount(),
          getMyPaymentCount(),
        ]);
        console.log(payments);

        setStats({
          totalChallans: total.data.data,
          pendingChallans: pending.data.data,
          paidChallans: paid.data.data,
          totalVehicles: vehicles.data.data,
          totalPayments: payments.data.data,
        });
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      icon: FileWarning,
      label: "Total Challans",
      value: stats.totalChallans,
      accent: "text-slate-500",
      iconBg: "bg-slate-100",
      valueColor: "text-slate-900",
    },
    {
      icon: Clock,
      label: "Pending Challans",
      value: stats.pendingChallans,
      accent: "text-sky-500",
      iconBg: "bg-sky-50",
      valueColor: "text-sky-500",
    },
    {
      icon: CheckCircle,
      label: "Paid Challans",
      value: stats.paidChallans,
      accent: "text-sky-600",
      iconBg: "bg-sky-50",
      valueColor: "text-sky-600",
    },
    {
      icon: Car,
      label: "My Vehicles",
      value: stats.totalVehicles,
      accent: "text-indigo-500",
      iconBg: "bg-indigo-50",
      valueColor: "text-slate-900",
    },
    {
      icon: CreditCard,
      label: "Total Payments",
      value: stats.totalPayments,
      accent: "text-blue-500",
      iconBg: "bg-blue-50",
      valueColor: "text-blue-600",
    },
  ];

  // Compliance % — only when data is loaded and totalChallans > 0
  const compliance =
    !loading && stats.totalChallans > 0
      ? Math.round((stats.paidChallans / stats.totalChallans) * 100)
      : null;

  return (
    <div className="min-h-screen bg-blue-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
              Welcom  Back, {user.full_name}
            </p>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of your traffic activity</p>
          </div>

          <div className="text-xs text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-lg">
            Last updated:{" "}
            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col gap-8">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {cards.map((card) => (
              <StatCard key={card.label} {...card} loading={loading} />
            ))}
          </div>
        </div>

        {/* Compliance Bar */}
        {!loading && stats.totalChallans > 0 && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <TrendingUp size={18} className="text-sky-500" />
                Challan Compliance Rate
              </div>
              <span className="text-sky-600 font-bold text-lg">{compliance}%</span>
            </div>
            <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-700"
                style={{ width: `${compliance}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-3">
              {stats.paidChallans} of {stats.totalChallans} challans cleared
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && stats.totalChallans === 0 && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center py-16 text-center gap-3">
            <CheckCircle size={40} className="text-sky-400" />
            <p className="text-lg font-medium text-slate-800">All clear!</p>
            <p className="text-sm text-slate-400">You have no challans on record.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;