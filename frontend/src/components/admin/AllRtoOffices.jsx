import { useState, useEffect } from "react";
import { getAllRtoOffices } from "../../api/admin.js";
import { Search } from "lucide-react";

/* ── Tokens ─────────────────────────────────────────────────── */
const PRIMARY    = "#003f87";
const ON_SURFACE = "#1a1d23";
const MUTED      = "#42454e";
const SURFACE    = "#f3f4f5";
const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const SkeletonRow = () => (
    <tr className="animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-3 rounded-full w-full" style={{ background: SURFACE }} />
            </td>
        ))}
    </tr>
);

export default function RtoOffices() {
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [search, setSearch]   = useState("");

    useEffect(() => {
        getAllRtoOffices()
            .then((res) => { setOffices(res.data?.data || []); setLoading(false); })
            .catch(() => { setError("Failed to load RTO offices."); setLoading(false); });
    }, []);

    const filtered = offices.filter((o) =>
        [o.rto_id, o.rto_code, o.rto_name, o.state, o.district, o.address, o.contact_number]
            .join(" ").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen" style={{ background: SURFACE }}>

            {/* ── Header ──────────────────────────────────── */}
            <div className="bg-white px-8 py-8 flex flex-wrap items-center justify-between gap-4"
                 style={{ borderBottom: "1px solid rgba(197,200,212,0.30)" }}>
                <div>
                    <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: PRIMARY }}>Admin Panel</p>
                    <h1 className="text-[1.75rem] font-bold tracking-[-0.02em]" style={{ color: ON_SURFACE }}>RTO Offices</h1>
                    <p className="text-[0.9375rem] mt-1" style={{ color: MUTED }}>
                        {loading ? "Loading…" : `${filtered.length} office${filtered.length !== 1 ? "s" : ""}`}
                    </p>
                </div>

                {/* Search — borderless input pattern */}
                <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <input
                        type="text" placeholder="Search by name, code, state…"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 rounded-xl text-[0.875rem] outline-none w-64 transition-all duration-200"
                        style={{ background: "#d8dde5", border: "none", color: ON_SURFACE }}
                        onFocus={(e) => { e.target.style.background = "#e0e4ea"; e.target.style.boxShadow = `0 0 0 2px ${PRIMARY}`; }}
                        onBlur={(e)  => { e.target.style.background = "#d8dde5"; e.target.style.boxShadow = "none"; }}
                    />
                </div>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <div className="px-8 py-8">
                {error && (
                    <div className="mb-6 rounded-xl px-4 py-3 text-[0.875rem] font-medium"
                         style={{ background: "#ffdad6", color: "#ba1a1a" }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-2xl overflow-auto" style={{ boxShadow: cardShadow, maxHeight: "580px" }}>
                    <table className="w-full min-w-[1000px] text-[0.875rem]">
                        <thead style={{ background: SURFACE, position: "sticky", top: 0, zIndex: 10 }}>
                            <tr>
                                {["ID", "Code", "Name", "State", "District", "Address", "Contact"].map((col) => (
                                    <th key={col}
                                        className="px-4 py-3.5 text-left text-[0.75rem] font-medium uppercase tracking-[0.05em]"
                                        style={{ color: MUTED }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                : filtered.length === 0
                                ? (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <p className="text-[1rem] font-semibold" style={{ color: ON_SURFACE }}>No offices found</p>
                                            <p className="text-[0.875rem] mt-1" style={{ color: MUTED }}>Try adjusting your search</p>
                                        </td>
                                    </tr>
                                )
                                : filtered.map((o, i) => (
                                    <tr key={o.rto_id || i}
                                        style={{ borderTop: "1px solid rgba(197,200,212,0.20)" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = SURFACE; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                        <td className="px-4 py-3 font-mono text-[0.8125rem] font-bold" style={{ color: PRIMARY }}>{o.rto_id}</td>
                                        <td className="px-4 py-3 font-mono text-[0.8125rem] font-semibold" style={{ color: ON_SURFACE }}>{o.rto_code}</td>
                                        <td className="px-4 py-3 font-semibold" style={{ color: ON_SURFACE }}>{o.rto_name}</td>
                                        <td className="px-4 py-3" style={{ color: MUTED }}>{o.state}</td>
                                        <td className="px-4 py-3" style={{ color: MUTED }}>{o.district}</td>
                                        <td className="px-4 py-3 max-w-xs truncate" style={{ color: MUTED }}>{o.address}</td>
                                        <td className="px-4 py-3 font-mono" style={{ color: MUTED }}>
                                            {o.contact_number ? `+91 ${o.contact_number}` : "—"}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}