import { useState, useEffect } from "react";
import { getMyIssuedChallans } from "../../api/officer.js"

const STATUS_CONFIG = {
  all:       { label: "All",       pill: "",                                                    dot: "" },
  pending:   { label: "Pending",   pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",    dot: "bg-amber-400" },
  paid:      { label: "Paid",      pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400" }
};

const VEHICLE_ICONS = { motorcycle: "🏍️", car: "🚗", truck: "🚛", bus: "🚌", auto: "🛺" };
const vehicleIcon = (cls) => VEHICLE_ICONS[(cls || "").toLowerCase()] ?? "🚘";

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

function Divider() {
  return <div className="mx-5 border-t border-slate-100" />;
}

export default function GetIssuedChallans() {
  const [challans, setChallans]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeTab, setActiveTab]   = useState("all");
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

  const filtered   = activeTab === "all" ? challans : challans.filter((c) => c.status === activeTab);
  const totalFine  = filtered.reduce((s, c) => s + Number(c.total_amount || 0), 0);
  const pendingCnt = filtered.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans text-slate-900">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tight">CH</span>
            </div>
            <span className="font-semibold text-slate-800 text-[15px] tracking-tight">Issued Challans</span>
          </div>
          {!loading && !error && (
            <span className="text-xs text-slate-400">{challans.length} total</span>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">

        {/* ── Stat cards ── */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Showing",    value: filtered.length,       sub: `of ${challans.length} total` },
              { label: "Pending",    value: pendingCnt,             sub: "awaiting payment" },
              { label: "Total Fine", value: formatINR(totalFine),   sub: "in current view" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
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
                  onClick={() => { setActiveTab(key); setExpandedId(null); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
                  }`}
                >
                  {key !== "all" && (
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white/60" : cfg.dot}`} />
                  )}
                  {cfg.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
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
            <div className="w-7 h-7 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading challans…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 text-rose-600 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-2 text-slate-400">
            <span className="text-4xl">📭</span>
            <p className="text-sm">No challans in this category</p>
          </div>
        )}

        {/* ── Challan list ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2.5">
            {filtered.map((c) => {
              const cfg      = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.pending;
              const open     = expandedId === c.challan_id;
              const location = buildLocation(c);

              return (
                <div
                  key={c.challan_id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Collapsed row */}
                  <button
                    onClick={() => setExpandedId(open ? null : c.challan_id)}
                    className="w-full text-left px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xl">
                        {vehicleIcon(c.vehicle_class)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-[15px] text-slate-900">{c.full_name}</span>
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-[12px] text-slate-900">{c.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px] font-mono bg-slate-50 border border-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                            {c.registration_number}
                          </span>
                          {c.description && (
                            <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{c.description}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[14px] font-bold text-slate-900">{formatINR(c.total_amount)}</p>
                          <p className="text-[11px] text-slate-400">{formatDate(c.violation_date)}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <svg
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {open && (
                    <div className="border-t border-slate-100 bg-slate-50/60">

                      <div className="px-5 pt-4 pb-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Violation</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5">
                          <Field label="Challan ID"     value={`#${c.challan_id}`} />
                          <Field label="Violation"      value={c.description} />
                          <Field label="Date"           value={formatDate(c.violation_date)} />
                          <Field label="Fine Amount"    value={formatINR(c.total_amount)} />
                          <Field label="Status"         value={cfg.label} />
                        </div>
                      </div>

                      <Divider />

                      <div className="px-5 py-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Vehicle</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5">
                          <Field label="Registration" value={c.registration_number} />
                          <Field label="Class"        value={c.vehicle_class} />
                          <Field label="Licence No."  value={c.licence_number} />
                        </div>
                      </div>

                      <Divider />

                      <div className="px-5 py-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Owner</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5">
                          <Field label="Full Name" value={c.full_name} />
                          <Field label="Mobile"    value={c.mobile_number} />
                          <Field label="User ID"   value={c.user_id} />
                        </div>
                      </div>

                      {location && (
                        <>
                          <Divider />
                          <div className="px-5 py-3 pb-4">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Location</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5">
                              {c.street_address && <Field label="Street"  value={c.street_address} />}
                              {c.city           && <Field label="City"    value={c.city} />}
                              {c.state          && <Field label="State"   value={c.state} />}
                              {c.pincode        && <Field label="Pincode" value={c.pincode} />}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
