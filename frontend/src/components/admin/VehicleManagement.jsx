import { useState, useEffect, useMemo } from "react";
import {
    getAllVehicles, getRtoVehicles,
    getAllVehicleOwnershipDetails, getRtoVehicleOwnershipDetails,
} from "../../api/admin.js";
import { Search, Building } from "lucide-react";

/* ── Tokens ─────────────────────────────────────────────────── */
const PRIMARY    = "#003f87";
const ON_SURFACE = "#1a1d23";
const MUTED      = "#42454e";
const SURFACE    = "#f3f4f5";
const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const TABS = [
    { key: "all-vehicles",  label: "All Vehicles"   },
    { key: "rto-vehicles",  label: "RTO Vehicles"   },
    { key: "all-ownership", label: "All Ownership"  },
    { key: "rto-ownership", label: "RTO Ownership"  },
];

const FUEL_STYLES = {
    petrol:   { bg: "rgba(234,88,12,0.08)", color: "#ea580c" },
    diesel:   { bg: "rgba(202,138,4,0.08)", color: "#ca8a04" },
    electric: { bg: "rgba(22,163,74,0.08)", color: "#16a34a" },
    cng:      { bg: "rgba(0,63,135,0.08)",  color: PRIMARY   },
    hybrid:   { bg: "rgba(14,165,233,0.08)", color: "#0ea5e9" },
};

const fmtDate    = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const isExpired  = (d)   => d && new Date(d) < new Date();
const isExpiringSoon = (d) => { if (!d) return false; const diff = (new Date(d) - new Date()) / 86400000; return diff >= 0 && diff <= 30; };

/* ── Sub-components ─────────────────────────────────────────── */
const FuelBadge = ({ fuel }) => {
    const s = FUEL_STYLES[(fuel || "").toLowerCase()] ?? { bg: SURFACE, color: MUTED };
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.75rem] font-semibold capitalize"
              style={{ background: s.bg, color: s.color }}>{fuel || "—"}</span>
    );
};

const DateCell = ({ value }) => {
    const expired = isExpired(value); const soon = isExpiringSoon(value);
    return (
        <span className="text-[0.8125rem] font-mono whitespace-nowrap"
              style={{ color: expired ? "#ba1a1a" : soon ? "#d97706" : MUTED }}>
            {fmtDate(value)}
            {expired && <span className="ml-1" style={{ color: "#ba1a1a" }}>✕</span>}
            {soon && !expired && <span className="ml-1" style={{ color: "#d97706" }}>⚠</span>}
        </span>
    );
};

const SortTh = ({ label, col, sortCol, sortDir, onSort, noSort }) => (
    <th onClick={() => !noSort && onSort(col)}
        className={`px-4 py-3.5 text-left text-[0.75rem] font-medium uppercase tracking-[0.05em] whitespace-nowrap ${!noSort ? "cursor-pointer select-none" : ""}`}
        style={{ color: MUTED }}
        onMouseEnter={(e) => { if (!noSort) e.currentTarget.style.color = ON_SURFACE; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; }}>
        {label}
        {!noSort && (
            <span className="ml-1 text-[0.6875rem]">
                {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : <span style={{ color: "#c5c8d4" }}>⇅</span>}
            </span>
        )}
    </th>
);

const SkeletonRow = ({ cols }) => (
    <tr>
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-4 py-3.5">
                <div className="h-3 rounded-full animate-pulse" style={{ background: SURFACE, width: `${[45,55,40,50,38,42,36][i%7]}%` }} />
            </td>
        ))}
    </tr>
);

const TableWrap = ({ children }) => (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
        <div className="overflow-x-auto">
            <table className="w-full text-[0.875rem]">{children}</table>
        </div>
    </div>
);

const Thead = ({ cols, sortCol, sortDir, onSort }) => (
    <thead style={{ background: SURFACE }}>
        <tr>
            {cols.map((c) => <SortTh key={c.key} {...c} col={c.key} sortCol={sortCol} sortDir={sortDir} onSort={onSort} />)}
        </tr>
    </thead>
);

const Legend = () => (
    <div className="flex items-center gap-4 mt-3 text-[0.8125rem]" style={{ color: MUTED }}>
        <span className="flex items-center gap-1"><span style={{ color: "#ba1a1a" }}>✕</span> Expired</span>
        <span className="flex items-center gap-1"><span style={{ color: "#d97706" }}>⚠</span> Expiring within 30 days</span>
    </div>
);

const RtoInput = ({ value, onChange, onFetch, loading }) => (
    <div className="flex items-center gap-2">
        <div className="relative">
            <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input
                type="text" placeholder="Enter RTO code (e.g. KA01)"
                value={value} onChange={(e) => onChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onFetch()}
                className="pl-9 pr-4 py-2.5 text-[0.875rem] rounded-xl outline-none uppercase w-64 transition-all duration-200"
                style={{ background: "#d8dde5", border: "none", color: ON_SURFACE }}
                onFocus={(e) => { e.target.style.background = "#e0e4ea"; e.target.style.boxShadow = `0 0 0 2px ${PRIMARY}`; }}
                onBlur={(e)  => { e.target.style.background = "#d8dde5"; e.target.style.boxShadow = "none"; }}
            />
        </div>
        <button onClick={onFetch} disabled={!value.trim() || loading}
            className="px-4 py-2.5 text-[0.875rem] font-semibold text-white rounded-[1.5rem] transition-all duration-200"
            style={{
                background: "linear-gradient(135deg, #003f87 0%, #0056b3 100%)",
                boxShadow: "0 3px 12px rgba(0,63,135,0.24)", border: "none",
                opacity: (!value.trim() || loading) ? 0.5 : 1,
                cursor:  (!value.trim() || loading) ? "not-allowed" : "pointer",
            }}>
            {loading ? "Loading…" : "Fetch"}
        </button>
    </div>
);

const Toolbar = ({ search, setSearch, count, total, label }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input
                type="text" placeholder={`Search ${label}…`}
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-[0.875rem] rounded-xl outline-none w-72 transition-all duration-200"
                style={{ background: "#d8dde5", border: "none", color: ON_SURFACE }}
                onFocus={(e) => { e.target.style.background = "#e0e4ea"; e.target.style.boxShadow = `0 0 0 2px ${PRIMARY}`; }}
                onBlur={(e)  => { e.target.style.background = "#d8dde5"; e.target.style.boxShadow = "none"; }}
            />
        </div>
        <span className="text-[0.8125rem] font-mono" style={{ color: MUTED }}>{count} / {total} records</span>
    </div>
);

/* ── All Vehicles Table ──────────────────────────────────────── */
const VehiclesTable = ({ rows, loading }) => {
    const [search, setSearch]   = useState("");
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
        { key: "registration_number",     label: "Reg. No."        },
        { key: "manufacturer",            label: "Manufacturer"    },
        { key: "model",                   label: "Model"           },
        { key: "vehicle_class",           label: "Class"           },
        { key: "fuel_type",               label: "Fuel",  noSort: true },
        { key: "registration_date",       label: "Reg. Date"       },
        { key: "registration_valid_till", label: "Valid Till"      },
        { key: "insurance_valid_till",    label: "Insurance Till"  },
        { key: "chassis_number",          label: "Chassis No.", noSort: true },
    ];

    return (
        <>
            <Toolbar search={search} setSearch={setSearch} count={sorted.length} total={rows.length} label="vehicles" />
            <TableWrap>
                <Thead cols={cols} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                <tbody>
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={cols.length} />)
                        : sorted.length === 0
                        ? <tr><td colSpan={cols.length} className="py-16 text-center"><p style={{ color: ON_SURFACE, fontWeight: 600 }}>No vehicles found</p></td></tr>
                        : sorted.map((r, i) => (
                            <tr key={r.vehicle_id || i}
                                style={{ borderTop: "1px solid rgba(197,200,212,0.20)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = SURFACE; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                                <td className="px-4 py-3 font-mono text-[0.8125rem] font-bold whitespace-nowrap" style={{ color: PRIMARY }}>{r.registration_number || "—"}</td>
                                <td className="px-4 py-3 font-medium" style={{ color: ON_SURFACE }}>{r.manufacturer || "—"}</td>
                                <td className="px-4 py-3" style={{ color: MUTED }}>{r.model || "—"}</td>
                                <td className="px-4 py-3 text-[0.8125rem] capitalize" style={{ color: MUTED }}>{r.vehicle_class || "—"}</td>
                                <td className="px-4 py-3"><FuelBadge fuel={r.fuel_type} /></td>
                                <td className="px-4 py-3 text-[0.8125rem] font-mono" style={{ color: MUTED }}>{fmtDate(r.registration_date)}</td>
                                <td className="px-4 py-3"><DateCell value={r.registration_valid_till} /></td>
                                <td className="px-4 py-3"><DateCell value={r.insurance_valid_till} /></td>
                                <td className="px-4 py-3 font-mono text-[0.8125rem]" style={{ color: MUTED }}>{r.chassis_number || "—"}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </TableWrap>
        </>
    );
};

/* ── Ownership Table ─────────────────────────────────────────── */
const OwnershipTable = ({ rows, loading }) => {
    const [search, setSearch]       = useState("");
    const [sortCol, setSortCol]     = useState("ownership_start_date");
    const [sortDir, setSortDir]     = useState("desc");
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
        { key: "registration_number",     label: "Reg. No."      },
        { key: "full_name",               label: "Owner"         },
        { key: "mobile_number",           label: "Mobile"        },
        { key: "manufacturer",            label: "Vehicle"       },
        { key: "fuel_type",               label: "Fuel", noSort: true },
        { key: "vehicle_class",           label: "Class"         },
        { key: "ownership_start_date",    label: "Owned Since"   },
        { key: "ownership_end_date",      label: "Owned Until"   },
        { key: "registration_valid_till", label: "Reg. Valid"    },
        { key: "insurance_valid_till",    label: "Insurance"     },
        { key: "aadhaar_number",          label: "Aadhaar", noSort: true },
    ];

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input type="text" placeholder="Search by name, reg. no., email, vehicle…"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 text-[0.875rem] rounded-xl outline-none w-80 transition-all duration-200"
                        style={{ background: "#d8dde5", border: "none", color: ON_SURFACE }}
                        onFocus={(e) => { e.target.style.background = "#e0e4ea"; e.target.style.boxShadow = `0 0 0 2px ${PRIMARY}`; }}
                        onBlur={(e)  => { e.target.style.background = "#d8dde5"; e.target.style.boxShadow = "none"; }}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[0.8125rem] font-mono" style={{ color: MUTED }}>{sorted.length} / {rows.length} records</span>
                    <button onClick={() => setShowAadhaar((s) => !s)}
                        className="flex items-center gap-1.5 px-4 py-2 text-[0.8125rem] font-medium rounded-lg transition-all"
                        style={{ background: "#fff", color: MUTED, boxShadow: cardShadow, border: "none" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = SURFACE; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
                        {showAadhaar ? "🙈 Hide" : "👁 Show"} Aadhaar
                    </button>
                </div>
            </div>
            <TableWrap>
                <Thead cols={cols} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                <tbody>
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={cols.length} />)
                        : sorted.length === 0
                        ? <tr><td colSpan={cols.length} className="py-16 text-center"><p style={{ color: ON_SURFACE, fontWeight: 600 }}>No ownership records found</p></td></tr>
                        : sorted.map((r, i) => (
                            <tr key={r.ownership_id || i}
                                style={{ borderTop: "1px solid rgba(197,200,212,0.20)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = SURFACE; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                                <td className="px-4 py-3 font-mono text-[0.8125rem] font-bold whitespace-nowrap" style={{ color: PRIMARY }}>{r.registration_number || "—"}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium whitespace-nowrap" style={{ color: ON_SURFACE }}>{r.full_name || "—"}</div>
                                    <div className="text-[0.75rem] font-mono mt-0.5" style={{ color: MUTED }}>{r.email || ""}</div>
                                </td>
                                <td className="px-4 py-3 font-mono text-[0.8125rem] whitespace-nowrap" style={{ color: MUTED }}>{r.mobile_number || "—"}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium" style={{ color: ON_SURFACE }}>{r.manufacturer} {r.model}</div>
                                    <div className="text-[0.75rem] font-mono mt-0.5" style={{ color: MUTED }}>{r.engine_number || ""}</div>
                                </td>
                                <td className="px-4 py-3"><FuelBadge fuel={r.fuel_type} /></td>
                                <td className="px-4 py-3 text-[0.8125rem] capitalize" style={{ color: MUTED }}>{r.vehicle_class || "—"}</td>
                                <td className="px-4 py-3 text-[0.8125rem] font-mono" style={{ color: MUTED }}>{fmtDate(r.ownership_start_date)}</td>
                                <td className="px-4 py-3 text-[0.8125rem] font-mono" style={{ color: MUTED }}>
                                    {r.ownership_end_date
                                        ? fmtDate(r.ownership_end_date)
                                        : <span style={{ color: "#059669", fontWeight: 600 }}>Current</span>}
                                </td>
                                <td className="px-4 py-3"><DateCell value={r.registration_valid_till} /></td>
                                <td className="px-4 py-3"><DateCell value={r.insurance_valid_till} /></td>
                                <td className="px-4 py-3 font-mono text-[0.8125rem]" style={{ color: MUTED }}>
                                    {showAadhaar
                                        ? (r.aadhaar_number || "—")
                                        : `•••• •••• ${String(r.aadhaar_number || "").slice(-4) || "?????"}`}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </TableWrap>
        </>
    );
};

/* ── Main Component ──────────────────────────────────────────── */
export default function VehicleManagement() {
    const [activeTab, setActiveTab] = useState("all-vehicles");
    const [allVehicles, setAllVehicles]   = useState([]);
    const [allOwnership, setAllOwnership] = useState([]);
    const [rtoVehicles, setRtoVehicles]   = useState([]);
    const [rtoOwnership, setRtoOwnership] = useState([]);
    const [loading, setLoading] = useState({ "all-vehicles": false, "all-ownership": false, "rto-vehicles": false, "rto-ownership": false });
    const [error, setError]     = useState({ "all-vehicles": null,  "all-ownership": null,  "rto-vehicles": null,  "rto-ownership": null  });
    const [rtoVehicleCode, setRtoVehicleCode]     = useState("");
    const [rtoOwnershipCode, setRtoOwnershipCode] = useState("");
    const [fetchedRtoVehicle, setFetchedRtoVehicle]     = useState("");
    const [fetchedRtoOwnership, setFetchedRtoOwnership] = useState("");

    const fetchAllVehicles = async () => {
        if (allVehicles.length > 0) return;
        setLoading((p) => ({ ...p, "all-vehicles": true }));
        try { const res = await getAllVehicles(); setAllVehicles(res.data?.data || res.data || []); }
        catch { setError((p) => ({ ...p, "all-vehicles": "Failed to load vehicles." })); }
        finally { setLoading((p) => ({ ...p, "all-vehicles": false })); }
    };
    const fetchAllOwnership = async () => {
        if (allOwnership.length > 0) return;
        setLoading((p) => ({ ...p, "all-ownership": true }));
        try { const res = await getAllVehicleOwnershipDetails(); setAllOwnership(res.data?.data || res.data || []); }
        catch { setError((p) => ({ ...p, "all-ownership": "Failed to load ownership." })); }
        finally { setLoading((p) => ({ ...p, "all-ownership": false })); }
    };
    const fetchRtoVehicles = async () => {
        if (!rtoVehicleCode.trim()) return;
        setLoading((p) => ({ ...p, "rto-vehicles": true }));
        setError((p) => ({ ...p, "rto-vehicles": null }));
        try { const res = await getRtoVehicles({ rtoVehicleCode: rtoVehicleCode.trim() }); setRtoVehicles(res.data?.data || res.data || []); setFetchedRtoVehicle(rtoVehicleCode.trim()); }
        catch { setError((p) => ({ ...p, "rto-vehicles": `Failed to load vehicles for RTO ${rtoVehicleCode}.` })); }
        finally { setLoading((p) => ({ ...p, "rto-vehicles": false })); }
    };
    const fetchRtoOwnership = async () => {
        if (!rtoOwnershipCode.trim()) return;
        setLoading((p) => ({ ...p, "rto-ownership": true }));
        setError((p) => ({ ...p, "rto-ownership": null }));
        try { const res = await getRtoVehicleOwnershipDetails({ rtoOwnershipCode: rtoOwnershipCode.trim() }); setRtoOwnership(res.data?.data || res.data || []); setFetchedRtoOwnership(rtoOwnershipCode.trim()); }
        catch { setError((p) => ({ ...p, "rto-ownership": `Failed to load ownership for RTO ${rtoOwnershipCode}.` })); }
        finally { setLoading((p) => ({ ...p, "rto-ownership": false })); }
    };

    useEffect(() => { fetchAllVehicles(); fetchAllOwnership(); }, []);

    const handleTab = (key) => {
        setActiveTab(key);
        if (key === "all-vehicles") fetchAllVehicles();
        if (key === "all-ownership") fetchAllOwnership();
    };

    const statCards = [
        { label: "Total Vehicles",     value: allVehicles.length  || "—", color: ON_SURFACE, bg: "#fff", ring: "#e8ebef" },
        { label: "Ownership Records",  value: allOwnership.length || "—", color: ON_SURFACE, bg: "#fff", ring: "#e8ebef" },
        { label: "Insurance Expired",
          value: allVehicles.filter((v) => isExpired(v.insurance_valid_till)).length,
          color: "#ba1a1a", bg: "rgba(186,26,26,0.06)", ring: "rgba(186,26,26,0.18)" },
        { label: "Reg. Expiring Soon",
          value: allVehicles.filter((v) => isExpiringSoon(v.registration_valid_till)).length,
          color: "#d97706", bg: "rgba(217,119,6,0.06)", ring: "rgba(217,119,6,0.18)" },
    ];

    return (
        <div className="min-h-screen" style={{ background: SURFACE }}>

            {/* ── Header ──────────────────────────────────── */}
            <div className="bg-white px-8 pt-8 pb-0"
                 style={{ borderBottom: "1px solid rgba(197,200,212,0.30)" }}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: PRIMARY }}>Admin Panel</p>
                        <h1 className="text-[1.75rem] font-bold tracking-[-0.02em] leading-tight" style={{ color: ON_SURFACE }}>Vehicle Management</h1>
                        <p className="text-[0.9375rem] mt-1" style={{ color: MUTED }}>Monitor registered vehicles, ownership records, and RTO data.</p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 self-center">
                        {statCards.map((s) => (
                            <div key={s.label} className="px-4 py-2 rounded-xl text-center min-w-[100px]"
                                 style={{ background: s.bg, boxShadow: `0 0 0 1.5px ${s.ring}` }}>
                                <div className="text-[1.125rem] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-[0.75rem] mt-0.5" style={{ color: MUTED }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1">
                    {TABS.map((t) => (
                        <button key={t.key} onClick={() => handleTab(t.key)}
                            className="flex items-center gap-2 px-5 py-2.5 text-[0.9375rem] font-medium rounded-t-lg transition-all duration-200"
                            style={activeTab === t.key
                                ? { borderBottom: `2px solid ${PRIMARY}`, color: PRIMARY, background: SURFACE }
                                : { borderBottom: "2px solid transparent", color: MUTED }}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Body ──────────────────────────────────────── */}
            <div className="px-8 py-6">
                {error[activeTab] && (
                    <div className="mb-4 rounded-xl px-4 py-3 text-[0.875rem] font-medium"
                         style={{ background: "#ffdad6", color: "#ba1a1a" }}>⚠ {error[activeTab]}</div>
                )}

                {/* All Vehicles */}
                {activeTab === "all-vehicles" && (
                    <><VehiclesTable rows={allVehicles} loading={loading["all-vehicles"]} /><Legend /></>
                )}

                {/* RTO Vehicles */}
                {activeTab === "rto-vehicles" && (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div>
                                <p className="text-[0.9375rem] font-semibold" style={{ color: ON_SURFACE }}>Filter by RTO Code</p>
                                <p className="text-[0.8125rem] mt-0.5" style={{ color: MUTED }}>Enter a valid RTO code to fetch vehicles under that office.</p>
                            </div>
                            <RtoInput value={rtoVehicleCode} onChange={setRtoVehicleCode} onFetch={fetchRtoVehicles} loading={loading["rto-vehicles"]} />
                        </div>
                        {fetchedRtoVehicle && (
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-[0.875rem]" style={{ color: MUTED }}>Results for</span>
                                <span className="text-[0.8125rem] font-bold font-mono px-2.5 py-1 rounded-full"
                                      style={{ background: "rgba(0,63,135,0.08)", color: PRIMARY }}>
                                    {fetchedRtoVehicle}
                                </span>
                            </div>
                        )}
                        {(rtoVehicles.length > 0 || loading["rto-vehicles"]) && (
                            <><VehiclesTable rows={rtoVehicles} loading={loading["rto-vehicles"]} /><Legend /></>
                        )}
                        {!loading["rto-vehicles"] && rtoVehicles.length === 0 && fetchedRtoVehicle && (
                            <div className="text-center py-16">
                                <p className="text-[1rem] font-semibold" style={{ color: ON_SURFACE }}>No vehicles for RTO <span className="font-mono">{fetchedRtoVehicle}</span></p>
                            </div>
                        )}
                    </>
                )}

                {/* All Ownership */}
                {activeTab === "all-ownership" && (
                    <><OwnershipTable rows={allOwnership} loading={loading["all-ownership"]} /><Legend /></>
                )}

                {/* RTO Ownership */}
                {activeTab === "rto-ownership" && (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div>
                                <p className="text-[0.9375rem] font-semibold" style={{ color: ON_SURFACE }}>Filter by RTO Code</p>
                                <p className="text-[0.8125rem] mt-0.5" style={{ color: MUTED }}>Fetch complete ownership records under a specific RTO office.</p>
                            </div>
                            <RtoInput value={rtoOwnershipCode} onChange={setRtoOwnershipCode} onFetch={fetchRtoOwnership} loading={loading["rto-ownership"]} />
                        </div>
                        {fetchedRtoOwnership && (
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-[0.875rem]" style={{ color: MUTED }}>Results for</span>
                                <span className="text-[0.8125rem] font-bold font-mono px-2.5 py-1 rounded-full"
                                      style={{ background: "rgba(0,63,135,0.08)", color: PRIMARY }}>
                                    {fetchedRtoOwnership}
                                </span>
                            </div>
                        )}
                        {(rtoOwnership.length > 0 || loading["rto-ownership"]) && (
                            <><OwnershipTable rows={rtoOwnership} loading={loading["rto-ownership"]} /><Legend /></>
                        )}
                        {!loading["rto-ownership"] && rtoOwnership.length === 0 && fetchedRtoOwnership && (
                            <div className="text-center py-16">
                                <p className="text-[1rem] font-semibold" style={{ color: ON_SURFACE }}>No ownership records for RTO <span className="font-mono">{fetchedRtoOwnership}</span></p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}