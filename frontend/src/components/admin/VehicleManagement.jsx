import { useState, useEffect, useMemo } from "react";
import {
  getAllVehicles,
  getRtoVehicles,
  getAllVehicleOwnershipDetails,
  getRtoVehicleOwnershipDetails,
} from "../../api/admin.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "all-vehicles", label: "All Vehicles", icon: "🚗" },
  { key: "rto-vehicles", label: "RTO Vehicles", icon: "🏢" },
  { key: "all-ownership", label: "All Ownership", icon: "📋" },
  { key: "rto-ownership", label: "RTO Ownership", icon: "📍" },
];

const FUEL_COLORS = {
  petrol: "bg-orange-100 text-orange-700",
  diesel: "bg-yellow-100 text-yellow-700",
  electric: "bg-green-100 text-green-700",
  cng: "bg-blue-100 text-blue-700",
  hybrid: "bg-teal-100 text-teal-700",
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();
const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SkeletonRow = ({ cols }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-slate-100 animate-pulse" style={{ width: `${[45, 55, 40, 50, 38, 42, 36][i % 7]}%` }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ icon, label }) => (
  <tr>
    <td colSpan={20} className="py-20 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-slate-500 font-medium">No {label} found</p>
      <p className="text-slate-400 text-sm mt-1">Try a different search or RTO code.</p>
    </td>
  </tr>
);

const FuelBadge = ({ fuel }) => {
  const cls = FUEL_COLORS[(fuel || "").toLowerCase()] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {fuel || "—"}
    </span>
  );
};

const DateCell = ({ value }) => {
  const expired = isExpired(value);
  const soon = isExpiringSoon(value);
  return (
    <span className={`text-xs font-mono whitespace-nowrap ${expired ? "text-red-500" : soon ? "text-amber-500" : "text-slate-600"}`}>
      {fmtDate(value)}
      {expired && <span className="ml-1 text-red-400">✕</span>}
      {soon && !expired && <span className="ml-1 text-amber-400">⚠</span>}
    </span>
  );
};

const SortTh = ({ label, col, sortCol, sortDir, onSort, noSort }) => (
  <th
    onClick={() => !noSort && onSort(col)}
    className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
      ${!noSort ? "cursor-pointer hover:text-slate-800 select-none" : ""}`}
  >
    {label}
    {!noSort && (
      <span className="ml-1 text-xs">
        {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : <span className="text-slate-300">⇅</span>}
      </span>
    )}
  </th>
);

const RtoInput = ({ value, onChange, onFetch, loading }) => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🏢</span>
      <input
        type="text"
        placeholder="Enter RTO code (e.g. KA01)"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && onFetch()}
        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 w-60
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition uppercase"
      />
    </div>
    <button
      onClick={onFetch}
      disabled={!value.trim() || loading}
      className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg
                 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      {loading ? "Loading…" : "Fetch"}
    </button>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Toolbar = ({ search, setSearch, count, total, label }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
      <input
        type="text"
        placeholder={`Search ${label}…`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 w-72
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />
    </div>
    <span className="text-xs text-slate-400 font-mono">{count} / {total} records</span>
  </div>
);

const TableWrap = ({ children }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  </div>
);

const Legend = () => (
  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
    <span className="flex items-center gap-1"><span className="text-red-400">✕</span> Expired</span>
    <span className="flex items-center gap-1"><span className="text-amber-400">⚠</span> Expiring within 30 days</span>
  </div>
);

// ─── All Vehicles Table ───────────────────────────────────────────────────────

const VehiclesTable = ({ rows, loading }) => {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("registration_date");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = rows.filter((r) =>
      [r.registration_number, r.manufacturer, r.model, r.vehicle_class, r.fuel_type, r.chassis_number]
        .some((v) => (v || "").toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, search, sortCol, sortDir]);

  const cols = [
    { key: "registration_number", label: "Reg. No." },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "model", label: "Model" },
    { key: "vehicle_class", label: "Class" },
    { key: "fuel_type", label: "Fuel", noSort: true },
    { key: "registration_date", label: "Reg. Date" },
    { key: "registration_valid_till", label: "Valid Till" },
    { key: "insurance_valid_till", label: "Insurance Till" },
    { key: "chassis_number", label: "Chassis No.", noSort: true },
  ];

  return (
    <>
      <Toolbar search={search} setSearch={setSearch} count={sorted.length} total={rows.length} label="vehicles" />
      <TableWrap>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {cols.map((c) => <SortTh key={c.key} {...c} col={c.key} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />)}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={cols.length} />)
            : sorted.length === 0
              ? <EmptyState icon="🚗" label="vehicles" />
              : sorted.map((r, i) => (
                <tr key={r.vehicle_id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700 whitespace-nowrap">{r.registration_number || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{r.manufacturer || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.model || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 capitalize">{r.vehicle_class || "—"}</td>
                  <td className="px-4 py-3"><FuelBadge fuel={r.fuel_type} /></td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{fmtDate(r.registration_date)}</td>
                  <td className="px-4 py-3"><DateCell value={r.registration_valid_till} /></td>
                  <td className="px-4 py-3"><DateCell value={r.insurance_valid_till} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.chassis_number || "—"}</td>
                </tr>
              ))}
        </tbody>
      </TableWrap>
    </>
  );
};

// ─── Ownership Table ──────────────────────────────────────────────────────────

const OwnershipTable = ({ rows, loading }) => {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("ownership_start_date");
  const [sortDir, setSortDir] = useState("desc");
  const [showAadhaar, setShowAadhaar] = useState(false);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = rows.filter((r) =>
      [r.registration_number, r.full_name, r.email, r.mobile_number, r.manufacturer, r.model]
        .some((v) => (v || "").toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, search, sortCol, sortDir]);

  const cols = [
    { key: "registration_number", label: "Reg. No." },
    { key: "full_name", label: "Owner" },
    { key: "mobile_number", label: "Mobile" },
    { key: "manufacturer", label: "Vehicle" },
    { key: "fuel_type", label: "Fuel", noSort: true },
    { key: "vehicle_class", label: "Class" },
    { key: "ownership_start_date", label: "Owned Since" },
    { key: "ownership_end_date", label: "Owned Until" },
    { key: "registration_valid_till", label: "Reg. Valid" },
    { key: "insurance_valid_till", label: "Insurance" },
    { key: "aadhaar_number", label: "Aadhaar", noSort: true },
  ];

  return (
    <>
      <div className="flex items-center justify-end gap-3 mb-4">
        <span className="text-xs text-slate-400 font-mono">
          {sorted.length} / {rows.length} records
        </span>

        <button
          onClick={() => setShowAadhaar((s) => !s)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition"
        >
          {showAadhaar ? "🙈 Hide" : "👁 Show"} Aadhaar
        </button>
      </div>
      <TableWrap>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {cols.map((c) => <SortTh key={c.key} {...c} col={c.key} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />)}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={cols.length} />)
            : sorted.length === 0
              ? <EmptyState icon="📋" label="ownership records" />
              : sorted.map((r, i) => (
                <tr key={r.ownership_id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700 whitespace-nowrap">{r.registration_number || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-800 whitespace-nowrap">{r.full_name || "—"}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{r.email || ""}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">{r.mobile_number || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-800">{r.manufacturer} {r.model}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{r.engine_number || ""}</div>
                  </td>
                  <td className="px-4 py-3"><FuelBadge fuel={r.fuel_type} /></td>
                  <td className="px-4 py-3 text-xs text-slate-600 capitalize">{r.vehicle_class || "—"}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{fmtDate(r.ownership_start_date)}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">
                    {r.ownership_end_date
                      ? fmtDate(r.ownership_end_date)
                      : <span className="text-emerald-600 font-semibold">Current</span>}
                  </td>
                  <td className="px-4 py-3"><DateCell value={r.registration_valid_till} /></td>
                  <td className="px-4 py-3"><DateCell value={r.insurance_valid_till} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {showAadhaar
                      ? (r.aadhaar_number || "—")
                      : `•••• •••• ${String(r.aadhaar_number || "").slice(-4) || "????"}`}
                  </td>
                </tr>
              ))}
        </tbody>
      </TableWrap>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VehicleManagement() {
  const [activeTab, setActiveTab] = useState("all-vehicles");

  const [allVehicles, setAllVehicles] = useState([]);
  const [allOwnership, setAllOwnership] = useState([]);
  const [rtoVehicles, setRtoVehicles] = useState([]);
  const [rtoOwnership, setRtoOwnership] = useState([]);

  const [loading, setLoading] = useState({
    "all-vehicles": false, "all-ownership": false,
    "rto-vehicles": false, "rto-ownership": false,
  });
  const [error, setError] = useState({
    "all-vehicles": null, "all-ownership": null,
    "rto-vehicles": null, "rto-ownership": null,
  });

  const [rtoVehicleCode, setRtoVehicleCode] = useState("");
  const [rtoOwnershipCode, setRtoOwnershipCode] = useState("");
  const [fetchedRtoVehicle, setFetchedRtoVehicle] = useState("");
  const [fetchedRtoOwnership, setFetchedRtoOwnership] = useState("");

  // ── Fetchers ──
  const fetchAllVehicles = async () => {
    if (allVehicles.length > 0) return;
    setLoading((p) => ({ ...p, "all-vehicles": true }));
    try {
      const res = await getAllVehicles();
      setAllVehicles(res.data?.data || res.data || []);
    } catch { setError((p) => ({ ...p, "all-vehicles": "Failed to load vehicles." })); }
    finally { setLoading((p) => ({ ...p, "all-vehicles": false })); }
  };

  const fetchAllOwnership = async () => {
    if (allOwnership.length > 0) return;
    setLoading((p) => ({ ...p, "all-ownership": true }));
    try {
      const res = await getAllVehicleOwnershipDetails();
      setAllOwnership(res.data?.data || res.data || []);
    } catch { setError((p) => ({ ...p, "all-ownership": "Failed to load ownership details." })); }
    finally { setLoading((p) => ({ ...p, "all-ownership": false })); }
  };

  const fetchRtoVehicles = async () => {
    if (!rtoVehicleCode.trim()) return;
    setLoading((p) => ({ ...p, "rto-vehicles": true }));
    setError((p) => ({ ...p, "rto-vehicles": null }));
    try {
      const res = await getRtoVehicles({
        rtoVehicleCode: rtoVehicleCode.trim()
      });
      console.log(res);
      setRtoVehicles(res.data?.data || res.data || []);
      setFetchedRtoVehicle(rtoVehicleCode.trim());
    } catch (err) { setError((p) => ({ ...p, "rto-vehicles": `Failed to load vehicles for RTO ${rtoVehicleCode}.` })); console.log(err) }
    finally { setLoading((p) => ({ ...p, "rto-vehicles": false })); }
  };

  const fetchRtoOwnership = async () => {
    if (!rtoOwnershipCode.trim()) return;
    setLoading((p) => ({ ...p, "rto-ownership": true }));
    setError((p) => ({ ...p, "rto-ownership": null }));
    try {
      const res = await getRtoVehicleOwnershipDetails({rtoOwnershipCode:rtoOwnershipCode.trim()});
      setRtoOwnership(res.data?.data || res.data || []);
      setFetchedRtoOwnership(rtoOwnershipCode.trim());
    } catch { setError((p) => ({ ...p, "rto-ownership": `Failed to load ownership for RTO ${rtoOwnershipCode}.` })); }
    finally { setLoading((p) => ({ ...p, "rto-ownership": false })); }
  };

  // Fetch both on mount so stats bar always has accurate counts
  useEffect(() => {
    fetchAllVehicles();
    fetchAllOwnership();
  }, []);

  const handleTab = (key) => {
    setActiveTab(key);
    if (key === "all-vehicles") fetchAllVehicles();
    if (key === "all-ownership") fetchAllOwnership();
  };

  // ── Stats bar ──
  const stats = [
    { label: "Total Vehicles", value: allVehicles.length || "—" },
    { label: "Ownership Records", value: allOwnership.length || "—" },
    {
      label: "Insurance Expired",
      value: allVehicles.filter((v) => isExpired(v.insurance_valid_till)).length || 0,
      warn: true,
    },
    {
      label: "Reg. Expiring Soon",
      value: allVehicles.filter((v) => isExpiringSoon(v.registration_valid_till)).length || 0,
      amber: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 pt-8 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1 font-mono">Admin Panel</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vehicle Management</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor registered vehicles, ownership records, and RTO data.</p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 self-center">
            {stats.map((s) => (
              <div key={s.label} className={`px-4 py-2 rounded-lg border text-center min-w-25
                ${s.warn ? "bg-red-50 border-red-200" : s.amber ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}>
                <div className={`text-lg font-bold font-mono ${s.warn ? "text-red-600" : s.amber ? "text-amber-600" : "text-slate-800"}`}>
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-all rounded-t-md
                ${activeTab === t.key
                  ? "border-indigo-600 text-indigo-600 bg-slate-50"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-8 py-6">

        {/* Error banner */}
        {error[activeTab] && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ⚠ {error[activeTab]}
          </div>
        )}

        {/* ── All Vehicles ── */}
        {activeTab === "all-vehicles" && (
          <>
            <VehiclesTable rows={allVehicles} loading={loading["all-vehicles"]} />
            <Legend />
          </>
        )}

        {/* ── RTO Vehicles ── */}
        {activeTab === "rto-vehicles" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-700">Filter by RTO Code</p>
                <p className="text-xs text-slate-400 mt-0.5">Enter a valid RTO code to fetch vehicles under that office.</p>
              </div>
              <RtoInput
                value={rtoVehicleCode}
                onChange={setRtoVehicleCode}
                onFetch={fetchRtoVehicles}
                loading={loading["rto-vehicles"]}
              />
            </div>

            {fetchedRtoVehicle && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs text-slate-500">Showing results for</span>
                <span className="text-xs font-bold font-mono bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{fetchedRtoVehicle}</span>
              </div>
            )}

            {(rtoVehicles.length > 0 || loading["rto-vehicles"]) && (
              <>
                <VehiclesTable rows={rtoVehicles} loading={loading["rto-vehicles"]} />
                <Legend />
              </>
            )}

            {!loading["rto-vehicles"] && rtoVehicles.length === 0 && fetchedRtoVehicle && (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">🏢</div>
                <p className="font-medium text-slate-500">No vehicles found for RTO <span className="font-mono font-bold">{fetchedRtoVehicle}</span></p>
              </div>
            )}
          </>
        )}

        {/* ── All Ownership ── */}
        {activeTab === "all-ownership" && (
          <>
            <OwnershipTable rows={allOwnership} loading={loading["all-ownership"]} />
            <Legend />
          </>
        )}

        {/* ── RTO Ownership ── */}
        {activeTab === "rto-ownership" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-700">Filter by RTO Code</p>
                <p className="text-xs text-slate-400 mt-0.5">Fetch complete ownership records under a specific RTO office.</p>
              </div>
              <RtoInput
                value={rtoOwnershipCode}
                onChange={setRtoOwnershipCode}
                onFetch={fetchRtoOwnership}
                loading={loading["rto-ownership"]}
              />
            </div>

            {fetchedRtoOwnership && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs text-slate-500">Showing results for</span>
                <span className="text-xs font-bold font-mono bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{fetchedRtoOwnership}</span>
              </div>
            )}

            {(rtoOwnership.length > 0 || loading["rto-ownership"]) && (
              <>
                <OwnershipTable rows={rtoOwnership} loading={loading["rto-ownership"]} />
                <Legend />
              </>
            )}

            {!loading["rto-ownership"] && rtoOwnership.length === 0 && fetchedRtoOwnership && (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">📍</div>
                <p className="font-medium text-slate-500">No ownership records for RTO <span className="font-mono font-bold">{fetchedRtoOwnership}</span></p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}