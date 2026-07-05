import { useState, useEffect } from "react";
import { getMyIssuedChallans } from "../../api/officer.js";
import { ChevronDown } from "lucide-react";

const STATUS_CONFIG = {
  all: { label: "All", pill: "", dot: "" },
  pending: { label: "Pending", pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-400" },
  paid: { label: "Paid", pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400" },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const buildLocation = (c) =>
  [c.street_address, c.city, c.state, c.pincode].filter(Boolean).join(", ") || null;

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-[13px] text-slate-800 font-medium break-all">{value || "—"}</p>
    </div>
  );
}

export default function GetIssuedChallans() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await getMyIssuedChallans();
        setChallans(data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load challans.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map((s) => [
      s,
      s === "all" ? challans.length : challans.filter((c) => c.status === s).length,
    ])
  );

  const filtered = activeTab === "all" ? challans : challans.filter((c) => c.status === activeTab);
  const totalFine = filtered.reduce((s, c) => s + Number(c.total_amount || 0), 0);
  const pendingCnt = filtered.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-blue-50/40">
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
          OFFICER PANEL
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Issued Challans</h1>
        <p className="text-sm text-slate-500 mt-1">
          View and track the challans you have issued
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">
        {/* ── Stat cards ── */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Showing", value: filtered.length, sub: `of ${challans.length} total` },
              { label: "Pending", value: pendingCnt, sub: "awaiting payment" },
              { label: "Total Fine", value: formatINR(totalFine), sub: "in current view" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-blue-100 rounded-2xl px-5 py-4 shadow-sm">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Status tabs ── */}
        {!loading && !error && (
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setExpandedId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-500 border-blue-100 hover:border-blue-300 hover:text-slate-700"
                  }`}
                >
                  {key !== "all" && (
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white/60" : cfg.dot}`} />
                  )}
                  {cfg.label}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      active ? "bg-white/20 text-white" : "bg-indigo-50 text-slate-500"
                    }`}
                  >
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading challans…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-600 text-sm">
            {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-2 text-slate-400">
            <p className="text-sm">No challans in this category</p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="max-h-[325px] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-50/60 border-b border-blue-100">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Violation
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.pending;
                    const open = expandedId === c.challan_id;
                    const location = buildLocation(c);

                    return (
                      <>
                        <tr
                          key={c.challan_id}
                          onClick={() => setExpandedId(open ? null : c.challan_id)}
                          className="border-b border-blue-50 last:border-0 hover:bg-indigo-50/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-[12px] font-mono bg-indigo-50/60 border border-blue-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                              {c.registration_number}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-800 font-medium">{c.full_name}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                            {c.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">{c.location || "—"}</td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {formatDate(c.violation_date)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-800 font-semibold whitespace-nowrap">
                            {formatINR(c.total_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.pill}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                open ? "rotate-180" : ""
                              }`}
                            />
                          </td>
                        </tr>

                        {open && (
                          <tr className="bg-indigo-50/30 border-b border-blue-50 last:border-0">
                            <td colSpan={8} className="px-5 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3.5">
                                <Field label="Challan ID" value={`#${c.challan_id}`} />
                                <Field label="Vehicle Class" value={c.vehicle_class} />
                                <Field label="Licence No." value={c.licence_number} />
                                <Field label="User ID" value={c.user_id} />
                                <Field label="Mobile" value={c.mobile_number} />
                                {location && <Field label="Full Address" value={location} />}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <p className="text-center text-[11px] text-slate-400 pb-2">
            Showing {filtered.length} of {challans.length} challans
          </p>
        )}
      </div>
    </div>
  );
}