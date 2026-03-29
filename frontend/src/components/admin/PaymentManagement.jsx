import { useState, useEffect, useMemo } from "react";
import { getAllPayments, getPaymentsByStatus } from "../../api/admin.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "all",     label: "All Payments", icon: "💳", color: "border-slate-600 text-slate-700",   badge: "bg-slate-100 text-slate-700" },
  { key: "success", label: "Success",      icon: "✅", color: "border-emerald-500 text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  { key: "failed",  label: "Failed",       icon: "❌", color: "border-red-500 text-red-600",         badge: "bg-red-100 text-red-700" },
];

const MODE_ICONS = {
  upi:        "📱",
  card:       "💳",
  netbanking: "🏦",
  cash:       "💵",
  wallet:     "👛",
};

const fmtAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PaymentStatusBadge = ({ status }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    failed:  "bg-red-100 text-red-600 border border-red-200",
  };
  const icons = { success: "✅", failed: "❌" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {icons[status] || "•"} {status || "—"}
    </span>
  );
};

const ChallanStatusBadge = ({ status }) => {
  const styles = {
    paid:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-slate-50 text-slate-500"}`}>
      {status || "—"}
    </span>
  );
};

const ModeChip = ({ mode }) => {
  const m = (mode || "").toLowerCase();
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium capitalize">
      <span>{MODE_ICONS[m] || "💳"}</span>
      {mode || "—"}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {[30, 40, 28, 42, 30, 38, 45, 28, 28].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-slate-100 animate-pulse" style={{ width: `${w}%` }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ icon }) => (
  <tr>
    <td colSpan={10} className="py-20 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-slate-500 font-medium">No payments found</p>
      <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter.</p>
    </td>
  </tr>
);

const SortTh = ({ label, col, sortCol, sortDir, onSort, noSort }) => (
  <th
    onClick={() => !noSort && onSort(col)}
    className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
      ${!noSort ? "cursor-pointer hover:text-slate-800 select-none" : ""}`}
  >
    {label}
    {!noSort && (
      <span className="ml-1 text-xs">
        {sortCol === col
          ? sortDir === "asc" ? "▲" : "▼"
          : <span className="text-slate-300">⇅</span>}
      </span>
    )}
  </th>
);

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ all, success, failed }) => {
  const totalCollected  = success.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalFailed     = failed.reduce((s, p) => s + Number(p.amount || 0), 0);
  const successRate     = all.length ? Math.round((success.length / all.length) * 100) : 0;

  const stats = [
    { label: "Total Payments",  value: all.length     || "—", sub: fmtAmount(all.reduce((s,p) => s + Number(p.amount||0), 0)),   color: "text-slate-800",   bg: "bg-white border-slate-200" },
    { label: "Successful",      value: success.length || "—", sub: fmtAmount(totalCollected),  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    { label: "Failed",          value: failed.length  || "—", sub: fmtAmount(totalFailed),     color: "text-red-600",     bg: "bg-red-50 border-red-200" },
    { label: "Success Rate",    value: all.length ? `${successRate}%` : "—", sub: "of all transactions", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  ];

  return (
    <div className="flex flex-wrap gap-3 self-center">
      {stats.map((s) => (
        <div key={s.label} className={`px-4 py-2.5 rounded-lg border text-center min-w-[110px] ${s.bg}`}>
          <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          {s.sub && <div className={`text-xs font-semibold mt-0.5 ${s.color}`}>{s.sub}</div>}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [data, setData]   = useState({ all: [], success: [], failed: [] });
  const [loading, setLoading] = useState({ all: false, success: false, failed: false });
  const [error, setError]     = useState({ all: null,  success: null,  failed: null });

  const [search,  setSearch]  = useState("");
  const [sortCol, setSortCol] = useState("payment_date");
  const [sortDir, setSortDir] = useState("desc");

  // ── Fetchers ──
  const fetchAll = async () => {
    if (data.all.length) return;
    setLoading((p) => ({ ...p, all: true }));
    try {
      const res = await getAllPayments();
      setData((p) => ({ ...p, all: res.data?.data || res.data || [] }));
    } catch { setError((p) => ({ ...p, all: "Failed to load payments." })); }
    finally  { setLoading((p) => ({ ...p, all: false })); }
  };

  const fetchByStatus = async (status) => {
    if (data[status].length) return;
    setLoading((p) => ({ ...p, [status]: true }));
    try {
      const res = await getPaymentsByStatus(status);
      setData((p) => ({ ...p, [status]: res.data?.data || res.data || [] }));
    } catch { setError((p) => ({ ...p, [status]: `Failed to load ${status} payments.` })); }
    finally  { setLoading((p) => ({ ...p, [status]: false })); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleTab = (key) => {
    setActiveTab(key);
    setSearch("");
    setSortCol("payment_date");
    setSortDir("desc");
    if (key === "all")                          fetchAll();
    if (key === "success" || key === "failed")  fetchByStatus(key);
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const rows = data[activeTab];

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = rows.filter((r) =>
      [r.full_name, r.email, r.mobile_number, r.challan_number,
       r.transaction_reference, r.payment_mode]
        .some((v) => (v || "").toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, search, sortCol, sortDir]);

  const tab = STATUS_TABS.find((t) => t.key === activeTab);

  const COLS = [
    { key: "payment_date",          label: "Date & Time" },
    { key: "full_name",             label: "Payer" },
    { key: "challan_number",        label: "Challan No." },
    { key: "transaction_reference", label: "Txn. Ref.", noSort: true },
    { key: "payment_mode",          label: "Mode", noSort: true },
    { key: "amount",                label: "Amount" },
    { key: "total_amount",          label: "Challan Total" },
    { key: "challan_status",        label: "Challan", noSort: true },
    { key: "payment_status",        label: "Payment", noSort: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 pt-8 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1 font-mono">Admin Panel</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Management</h1>
            <p className="text-sm text-slate-500 mt-1">Track all payment transactions linked to challans.</p>
          </div>
          <StatsBar all={data.all} success={data.success} failed={data.failed} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-all rounded-t-md
                ${activeTab === t.key
                  ? `${t.color} bg-slate-50`
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {data[t.key].length > 0 && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${activeTab === t.key ? t.badge : "bg-slate-100 text-slate-500"}`}>
                  {data[t.key].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-8 py-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by name, challan no., txn ref., mode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 w-80
                         focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {sorted.length} / {rows.length} records
            </span>
            {sorted.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                {fmtAmount(sorted.reduce((s, p) => s + Number(p.amount || 0), 0))} shown
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error[activeTab] && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error[activeTab]}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {COLS.map((c) => (
                    <SortTh
                      key={c.key}
                      {...c}
                      col={c.key}
                      sortCol={sortCol}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading[activeTab]
                  ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                  : sorted.length === 0
                  ? <EmptyState icon={tab.icon} />
                  : sorted.map((r, i) => (
                    <tr key={r.payment_id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">

                      {/* Date & Time */}
                      <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {fmtDate(r.payment_date)}
                      </td>

                      {/* Payer */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-800 whitespace-nowrap">{r.full_name || "—"}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{r.mobile_number || r.email || ""}</div>
                      </td>

                      {/* Challan No. */}
                      <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700 whitespace-nowrap">
                        {r.challan_number || "—"}
                      </td>

                      {/* Txn Reference */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {r.transaction_reference || "—"}
                      </td>

                      {/* Mode */}
                      <td className="px-4 py-3">
                        <ModeChip mode={r.payment_mode} />
                      </td>

                      {/* Amount Paid */}
                      <td className="px-4 py-3 text-sm font-bold font-mono text-slate-800 whitespace-nowrap">
                        {fmtAmount(r.amount)}
                      </td>

                      {/* Challan Total */}
                      <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {fmtAmount(r.total_amount)}
                      </td>

                      {/* Challan Status */}
                      <td className="px-4 py-3">
                        <ChallanStatusBadge status={r.challan_status} />
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={r.payment_status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading[activeTab] && sorted.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{sorted.length}</span> of{" "}
                <span className="font-semibold text-slate-600">{rows.length}</span> payments
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-600 font-semibold">
                  Collected: {fmtAmount(sorted.filter(p => p.payment_status === "success").reduce((s, p) => s + Number(p.amount || 0), 0))}
                </span>
                <span className="text-red-500 font-semibold">
                  Failed: {fmtAmount(sorted.filter(p => p.payment_status === "failed").reduce((s, p) => s + Number(p.amount || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}