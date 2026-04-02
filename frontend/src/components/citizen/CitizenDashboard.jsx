import { useEffect, useState } from "react";
import {
  getMyChallanCount,
  getMyChallanByStatusCount,
  getMyVehicleCount,
  getMyPaymentCount,
} from "../../api/citizen";
import {
  FileWarning, Car, CreditCard, CheckCircle, Clock, TrendingUp, AlertCircle,
} from "lucide-react";

/* Ambient shadow — tinted, high diffusion, NOT a dark drop-shadow */
const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const StatCard = ({ icon: Icon, label, value, accent, accent2, loading }) => (
  <div
    className="rounded-2xl bg-white p-5 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-200 cursor-default"
    style={{ boxShadow: cardShadow }}
  >
    <div className="flex items-center justify-between">
      <span className="text-[0.8125rem] font-medium uppercase tracking-[0.04em] text-[#42454e]">
        {label}
      </span>
      <div className="p-2 rounded-xl" style={{ background: accent + "18", color: accent }}>
        <Icon size={18} />
      </div>
    </div>
    {loading ? (
      <div className="h-8 w-16 rounded-lg bg-[#e0e4ea] animate-pulse" />
    ) : (
      <span className="text-[2rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-none">
        {value ?? 0}
      </span>
    )}
  </div>
);

const CitizenDashboard = () => {
  const [stats, setStats] = useState({
    totalChallans:   null,
    pendingChallans: null,
    paidChallans:    null,
    totalVehicles:   null,
    totalPayments:   null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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
        setStats({
          totalChallans:   total.data.data,
          pendingChallans: pending.data.data,
          paidChallans:    paid.data.data,
          totalVehicles:   vehicles.data.data,
          totalPayments:   payments.data.data,
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
    { icon: FileWarning, label: "Total Challans",   value: stats.totalChallans,   accent: "#003f87" },
    { icon: Clock,       label: "Pending Challans", value: stats.pendingChallans, accent: "#d97706" },
    { icon: CheckCircle, label: "Paid Challans",    value: stats.paidChallans,    accent: "#059669" },
    { icon: Car,         label: "My Vehicles",      value: stats.totalVehicles,   accent: "#7c3aed" },
    { icon: CreditCard,  label: "Total Payments",   value: stats.totalPayments,   accent: "#db2777" },
  ];

  const compliance =
    !loading && stats.totalChallans > 0
      ? Math.round((stats.paidChallans / stats.totalChallans) * 100)
      : null;

  return (
    <div className="space-y-8">
      {/* ── Page Header ───────────────────────────────────── */}
      <div>
        <p className="text-[0.8125rem] font-medium text-[#003f87] uppercase tracking-[0.08em] mb-1">
          Overview
        </p>
        <h1 className="text-[1.75rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-tight">
          Dashboard
        </h1>
        <p className="text-[0.9375rem] text-[#42454e] mt-1">
          Your traffic activity at a glance
        </p>
      </div>

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-[0.875rem] font-medium"
          style={{ background: "#ffdad6", color: "#ba1a1a" }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* ── Compliance Bar ────────────────────────────────── */}
      {!loading && stats.totalChallans > 0 && (
        <div
          className="rounded-2xl bg-white p-6"
          style={{ boxShadow: cardShadow }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} style={{ color: "#059669" }} />
              <span className="text-[1rem] font-semibold text-[#1a1d23]">
                Challan Compliance Rate
              </span>
            </div>
            <span className="text-[1.125rem] font-bold" style={{ color: "#059669" }}>
              {compliance}%
            </span>
          </div>

          {/* Progress bar — tonal bg, no border */}
          <div className="w-full rounded-full h-2.5 bg-[#e0e4ea]">
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{
                width: `${compliance}%`,
                background: "linear-gradient(90deg, #059669, #34d399)",
              }}
            />
          </div>

          <p className="text-[0.8125rem] text-[#42454e] mt-3">
            {stats.paidChallans} of {stats.totalChallans} challans cleared
          </p>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────── */}
      {!loading && !error && stats.totalChallans === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <CheckCircle size={40} style={{ color: "#059669", opacity: 0.5 }} />
          <p className="text-[1.125rem] font-semibold text-[#1a1d23]">All clear!</p>
          <p className="text-[0.875rem] text-[#42454e]">You have no challans on record.</p>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;