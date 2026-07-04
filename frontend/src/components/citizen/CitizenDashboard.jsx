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

const StatCard = ({ icon: Icon, label, value, accent, loading }) => (
  <div
    style={{ borderColor: accent + "33", background: accent + "0d" }}
    className="rounded-2xl border p-5 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-200"
  >
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <div
        style={{ background: accent + "22", color: accent }}
        className="p-2 rounded-xl"
      >
        <Icon size={18} />
      </div>
    </div>
    {loading ? (
      <div className="h-8 w-16 rounded-lg bg-slate-700 animate-pulse" />
    ) : (
      <span className="text-3xl font-bold text-white">{value ?? 0}</span>
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
      accent: "#60a5fa",
    },
    {
      icon: Clock,
      label: "Pending Challans",
      value: stats.pendingChallans,
      accent: "#fb923c",
    },
    {
      icon: CheckCircle,
      label: "Paid Challans",
      value: stats.paidChallans,
      accent: "#34d399",
    },
    {
      icon: Car,
      label: "My Vehicles",
      value: stats.totalVehicles,
      accent: "#a78bfa",
    },
    {
      icon: CreditCard,
      label: "Total Payments",
      value: stats.totalPayments,
      accent: "#f472b6",
    },
  ];

  // Compliance % — only when data is loaded and totalChallans > 0
  const compliance =
    !loading &&
    stats.totalChallans > 0
      ? Math.round((stats.paidChallans / stats.totalChallans) * 100)
      : null;

  return (
    <div className="text-white space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Overview of your traffic activity
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Compliance Bar */}
      {!loading && stats.totalChallans > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <TrendingUp size={18} className="text-emerald-400" />
              Challan Compliance Rate
            </div>
            <span className="text-emerald-400 font-bold text-lg">
              {compliance}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
              style={{ width: `${compliance}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs">
            {stats.paidChallans} of {stats.totalChallans} challans cleared
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && stats.totalChallans === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">
          <CheckCircle size={40} className="text-emerald-500/50" />
          <p className="text-lg font-medium text-slate-300">All clear!</p>
          <p className="text-sm">You have no challans on record.</p>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;