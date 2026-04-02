import { useEffect, useState } from "react";
import { getAllChallans, getChallansByStatus } from "../../api/citizen";
import { ReceiptText, CheckCircle2, Clock, IndianRupee, Car } from "lucide-react";

const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

/* Status badge — pill shape, semantic colors per design spec */
const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        bg: "#d4edda",      /* tertiary_container */
        color: "#2e7d32",   /* tertiary */
        dot: "#2e7d32",
    },
    paid: {
        label: "Paid",
        bg: "#d4edda",
        color: "#2e7d32",
        dot: "#2e7d32",
    },
};

// Overdue gets error_container per spec
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        bg: "#e0e4ea",
        color: "#42454e",
        dot: "#42454e",
    };
    if (status === "overdue") {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-semibold"
                  style={{ background: "#ffdad6", color: "#ba1a1a" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                Overdue
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-semibold"
              style={{ background: cfg.bg, color: cfg.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
            {cfg.label}
        </span>
    );
};

const FILTERS = [
    { value: "all",     label: "All"     },
    { value: "pending", label: "Pending" },
    { value: "paid",    label: "Paid"    },
];

const Challans = () => {
    const [challans, setChallans] = useState([]);
    const [status, setStatus]     = useState("all");
    const [loading, setLoading]   = useState(false);

    const fetchChallans = async () => {
        setLoading(true);
        try {
            const res = status === "all"
                ? await getAllChallans()
                : await getChallansByStatus(status);
            setChallans(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchChallans(); }, [status]);

    return (
        <div className="max-w-4xl mx-auto">
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div>
                    <p className="text-[0.8125rem] font-medium text-[#003f87] uppercase tracking-[0.08em] mb-1">
                        My Records
                    </p>
                    <h1 className="text-[1.75rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-tight">
                        Challans
                    </h1>
                    <p className="text-[0.9375rem] text-[#42454e] mt-1">
                        {challans.length} challan{challans.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Filter tabs — tonal surface, NO border */}
                <div className="flex gap-1 p-1 rounded-xl self-start bg-[#e8ebef]">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setStatus(f.value)}
                            className="px-4 py-1.5 rounded-lg text-[0.875rem] font-medium transition-all duration-200"
                            style={
                                status === f.value
                                    ? { background: "linear-gradient(135deg, #003f87, #0056b3)", color: "#fff", boxShadow: "0 2px 8px rgba(0,63,135,0.25)" }
                                    : { background: "transparent", color: "#42454e" }
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Loading ─────────────────────────────────── */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-[#003f87] border-t-transparent animate-spin" />
                </div>
            )}

            {/* ── Empty State ─────────────────────────────── */}
            {!loading && challans.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center"
                         style={{ boxShadow: cardShadow, color: "#c5c8d4" }}>
                        <ReceiptText size={28} />
                    </div>
                    <div>
                        <p className="text-[1rem] font-semibold text-[#1a1d23]">No challans found</p>
                        <p className="text-[0.875rem] text-[#42454e] mt-1">You're all clear for this filter</p>
                    </div>
                </div>
            )}

            {/* ── Challan List — whitespace separation, NO dividers ── */}
            {!loading && (
                <div className="flex flex-col gap-[1.4rem]">
                    {challans.map((c) => (
                        <div
                            key={c.challan_id}
                            className="group bg-white rounded-2xl p-5 transition-all duration-200 cursor-default"
                            style={{ boxShadow: cardShadow }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,63,135,0.12), 0 2px 8px rgba(0,63,135,0.06)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = cardShadow; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                {/* Left Info */}
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                                        style={{ background: "#f0f2f5", color: "#42454e" }}
                                    >
                                        <Car size={18} />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-[1rem] font-semibold text-[#1a1d23] truncate">
                                            {c.full_name}
                                        </p>
                                        <p className="text-[0.8125rem] font-medium text-[#003f87]">
                                            {c.vehicle_number}
                                        </p>
                                        <p className="text-[0.8125rem] text-[#42454e]">
                                            {c.description}
                                        </p>
                                        <div className="text-[0.75rem] text-[#42454e] flex flex-wrap gap-x-2">
                                            <span>{c.location}</span>
                                            <span>·</span>
                                            <span>{formatDateTime(c.date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Amount + Status */}
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                                    <div className="flex items-center gap-1 font-bold text-[1.125rem] text-[#1a1d23]">
                                        <IndianRupee size={15} className="text-[#42454e]" />
                                        {c.total_amount}
                                    </div>
                                    <StatusBadge status={c.status} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const formatDateTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
};

export default Challans;