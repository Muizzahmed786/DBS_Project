import { useState, useEffect } from "react";
import axios from "axios";

const statusConfig = {
  pending: {
    label: "Pending",
    classes: "bg-amber-100 text-amber-800 border border-amber-300",
    dot: "bg-amber-500",
  },
  paid: {
    label: "Paid",
    classes: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    dot: "bg-emerald-500",
  },
  disputed: {
    label: "Disputed",
    classes: "bg-rose-100 text-rose-800 border border-rose-300",
    dot: "bg-rose-500",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-slate-100 text-slate-600 border border-slate-300",
    dot: "bg-slate-400",
  },
};

const vehicleClassIcon = (cls) => {
  const map = {
    motorcycle: "🏍️",
    car: "🚗",
    truck: "🚛",
    bus: "🚌",
    auto: "🛺",
  };
  return map[(cls || "").toLowerCase()] ?? "🚘";
};

export default function GetIssuedChallans() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchChallans = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/v1/challan/get-my-challan-issued", {
          withCredentials: true,
        });
        setChallans(data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load challans.");
      } finally {
        setLoading(false);
      }
    };
    fetchChallans();
  }, []);

  const filtered = challans.filter((c) => {
    const matchesSearch =
      !search ||
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.licence_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.challan_id?.toString().includes(search);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filtered.reduce((sum, c) => sum + Number(c.total_amount || 0), 0);
  const pendingCount = filtered.filter((c) => c.status === "pending").length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="min-h-screen bg-slate-50 font-mono">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CH</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Issued Challans</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">Traffic violations recorded by you</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Stats row */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Challans", value: filtered.length, icon: "📋" },
              { label: "Pending", value: pendingCount, icon: "⏳" },
              { label: "Total Amount", value: formatCurrency(totalAmount), icon: "₹" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by name, reg. number, licence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "paid", "disputed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                  statusFilter === s
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Fetching challans…</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-5 py-4 text-rose-700 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-slate-400">
            <span className="text-4xl">📭</span>
            <p className="text-sm">No challans found</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((c) => {
              const status = statusConfig[c.status] ?? statusConfig.pending;
              const isExpanded = expandedId === c.challan_id;

              return (
                <div
                  key={c.challan_id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c.challan_id)}
                    className="w-full text-left px-5 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                          {vehicleClassIcon(c.vehicle_class)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{c.full_name}</span>
                            <span className="text-xs text-slate-400">#{c.challan_id}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                              {c.registration_number}
                            </span>
                            <span className="text-xs text-slate-400">{c.description}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(c.total_amount)}</p>
                          <p className="text-xs text-slate-400">{formatDate(c.violation_date)}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.classes}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        <span className={`text-slate-400 transition-transform text-xs ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        {[
                          { label: "Full Name", value: c.full_name },
                          { label: "Mobile", value: c.mobile_number },
                          { label: "User ID", value: c.user_id },
                          { label: "Licence No.", value: c.licence_number },
                          { label: "Registration", value: c.registration_number },
                          { label: "Vehicle Class", value: c.vehicle_class },
                          { label: "Violation", value: c.description },
                          { label: "Violation Date", value: formatDate(c.violation_date) },
                          { label: "Amount", value: formatCurrency(c.total_amount) },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                            <p className="text-slate-800 font-medium text-sm break-all">{item.value || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {!loading && !error && filtered.length > 0 && (
          <p className="text-center text-xs text-slate-400 pb-4">
            Showing {filtered.length} of {challans.length} challans
          </p>
        )}
      </div>
    </div>
  );
}