import { useState, useEffect } from "react";
import {
    AlertCircle, CheckCircle2, CreditCard, Landmark, Zap, Lock, ChevronRight, FileText, X, Car,
} from "lucide-react";
import { getChallansByStatus, makePayment } from "../../api/citizen.js";

const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";
const modalShadow = "0 8px 40px rgba(0,63,135,0.16), 0 2px 12px rgba(0,63,135,0.08)";

const PAYMENT_MODES = [
    { id: "UPI",        label: "UPI",         Icon: Zap      },
    { id: "Card",       label: "Card",        Icon: CreditCard },
    { id: "NetBanking", label: "Net Banking", Icon: Landmark  },
];

/* ── Payment Modal — Glassmorphism per spec ──────────────────── */
const PaymentModal = ({ challan, onClose, onSuccess }) => {
    const [password, setPassword]     = useState("");
    const [paymentMode, setPaymentMode] = useState("UPI");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState("");
    const [done, setDone]             = useState(false);

    const handlePay = async () => {
        if (!password.trim()) { setError("Password is required to authorize payment."); return; }
        setError("");
        setSubmitting(true);
        try {
            const res = await makePayment({ challan_id: challan.challan_id, password, payment_mode: paymentMode });
            setDone(true);
            setTimeout(() => { onSuccess(res.data); onClose(); }, 1800);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal — surface_bright glassmorphism per spec */}
            <div
                className="relative w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(24px)",
                    boxShadow: modalShadow,
                }}
            >
                {done ? (
                    /* Success */
                    <div className="flex flex-col items-center justify-center py-14 px-6 gap-3 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
                             style={{ background: "#d4edda", color: "#2e7d32" }}>
                            <CheckCircle2 size={28} />
                        </div>
                        <p className="text-[1.125rem] font-semibold text-[#1a1d23]">Payment Successful</p>
                        <p className="text-[0.875rem] text-[#42454e]">
                            ₹{Number(challan.total_amount).toLocaleString("en-IN")} paid for challan&nbsp;#{challan.challan_number}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4"
                             style={{ borderBottom: "1px solid rgba(197,200,212,0.30)" }}>
                            <div>
                                <p className="text-[0.75rem] font-medium uppercase tracking-[0.07em] text-[#42454e] mb-0.5">
                                    Pay Challan
                                </p>
                                <h2 className="text-[1.125rem] font-semibold text-[#1a1d23]">
                                    #{challan.challan_number} —{" "}
                                    <span style={{ color: "#003f87" }} className="font-mono">
                                        ₹{Number(challan.total_amount).toLocaleString("en-IN")}
                                    </span>
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                style={{ color: "#c5c8d4" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f2f5"; e.currentTarget.style.color = "#42454e"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c5c8d4"; }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            {/* Violation summary — tonal surface */}
                            <div className="rounded-xl px-4 py-3 text-[0.875rem] text-[#42454e]"
                                 style={{ background: "#f3f4f5" }}>
                                <span className="text-[0.75rem] text-[#c5c8d4]">Violation · </span>
                                {challan.description || "Traffic Violation"}
                                {challan.registration_number && (
                                    <>
                                        <span className="mx-2 text-[#c5c8d4]">·</span>
                                        <span className="font-mono text-[#1a1d23]">{challan.registration_number}</span>
                                    </>
                                )}
                            </div>

                            {/* Payment mode */}
                            <div>
                                <label className="text-[0.8125rem] font-medium uppercase tracking-[0.05em] text-[#42454e] block mb-3">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PAYMENT_MODES.map(({ id, label, Icon }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setPaymentMode(id)}
                                            className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-[0.8125rem] font-medium transition-all duration-200"
                                            style={
                                                paymentMode === id
                                                    ? { background: "rgba(0,63,135,0.08)", color: "#003f87", boxShadow: "0 0 0 2px #003f87", border: "none" }
                                                    : { background: "#f3f4f5", color: "#42454e", border: "none" }
                                            }
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Password field */}
                            <div>
                                <label className="text-[0.8125rem] font-medium uppercase tracking-[0.05em] text-[#42454e] block mb-[0.7rem]">
                                    Authorize with Password
                                </label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                                          style={{ color: "#c5c8d4" }} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handlePay()}
                                        placeholder="Enter your account password"
                                        className="w-full rounded-xl pl-9 pr-4 py-[0.875rem] text-[0.9375rem] text-[#1a1d23] outline-none transition-all duration-200"
                                        style={{ background: "#d8dde5", border: "none" }}
                                        onFocus={(e) => { e.target.style.background = "#e0e4ea"; e.target.style.boxShadow = "0 0 0 2px #003f87"; }}
                                        onBlur={(e)  => { e.target.style.background = "#d8dde5"; e.target.style.boxShadow = "none"; }}
                                    />
                                </div>
                                {error && (
                                    <div className="flex items-center gap-1.5 mt-2 text-[0.8125rem]"
                                         style={{ color: "#ba1a1a" }}>
                                        <AlertCircle size={12} />
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2"
                                 style={{ borderTop: "1px solid rgba(197,200,212,0.30)" }}>
                                {/* Tertiary — text only */}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-[#003f87] text-[0.875rem] font-medium px-4 py-2 rounded-lg hover:opacity-70 transition-opacity"
                                    style={{ background: "none", border: "none" }}
                                >
                                    Cancel
                                </button>

                                {/* Primary gradient */}
                                <button
                                    onClick={handlePay}
                                    disabled={submitting}
                                    className="flex items-center gap-2 text-white font-semibold text-[0.875rem] px-5 py-2.5 rounded-[1.5rem] transition-all duration-200 active:scale-95"
                                    style={{
                                        background: "linear-gradient(135deg, #003f87 0%, #0056b3 100%)",
                                        boxShadow: "0 4px 16px rgba(0,63,135,0.28)",
                                        border: "none",
                                        opacity: submitting ? 0.65 : 1,
                                        cursor: submitting ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Processing…
                                        </>
                                    ) : (
                                        <>
                                            Pay ₹{Number(challan.total_amount).toLocaleString("en-IN")}
                                            <ChevronRight size={15} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ── Challan Card ──────────────────────────────────────────────── */
const ChallanCard = ({ challan, onPayClick }) => {
    const date = new Date(challan.violation_date).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });

    return (
        <div
            className="bg-white rounded-2xl p-5 cursor-default transition-all duration-200"
            style={{ boxShadow: cardShadow }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,63,135,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = cardShadow; e.currentTarget.style.transform = "translateY(0)"; }}
        >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                     style={{ background: "#f0f2f5", color: "#003f87" }}>
                    <FileText size={20} />
                </div>
                {/* Pending badge — tertiary_container per spec */}
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.75rem] font-semibold"
                      style={{ background: "#fff3cd", color: "#92400e" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] inline-block" />
                    Pending
                </span>
            </div>

            {/* Amount */}
            <p className="font-mono text-[1.25rem] font-bold text-[#1a1d23] tracking-tight mb-1">
                ₹{Number(challan.total_amount).toLocaleString("en-IN")}
            </p>

            {/* Description */}
            <p className="text-[0.875rem] text-[#42454e] mb-4 line-clamp-1">
                {challan.description || "Traffic Violation"}
            </p>

            {/* Meta grid — tonal surface cells */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                    { label: "Vehicle",       val: challan.registration_number || "—" },
                    { label: "Date",          val: date },
                    { label: "Licence",       val: challan.licence_number || "—"  },
                    { label: "Vehicle Class", val: challan.vehicle_class || "—"   },
                ].map(({ label, val }) => (
                    <div key={label} className="rounded-lg px-3 py-2" style={{ background: "#f3f4f5" }}>
                        <p className="text-[0.75rem] text-[#42454e] mb-0.5">{label}</p>
                        <p className="text-[0.8125rem] font-medium font-mono text-[#1a1d23] truncate">{val}</p>
                    </div>
                ))}
            </div>

            {/* Footer — ghost border fallback at 30% */}
            <div className="pt-4 flex items-center justify-between"
                 style={{ borderTop: "1px solid rgba(197,200,212,0.30)" }}>
                <span className="text-[0.75rem] font-mono text-[#c5c8d4]">
                    ID: {challan.challan_number}
                </span>
                <button
                    onClick={() => onPayClick(challan)}
                    className="flex items-center gap-1.5 text-white text-[0.8125rem] font-semibold px-4 py-1.5 rounded-[1.5rem] transition-all duration-200 active:scale-95"
                    style={{
                        background: "linear-gradient(135deg, #003f87 0%, #0056b3 100%)",
                        boxShadow: "0 3px 12px rgba(0,63,135,0.24)",
                        border: "none",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 5px 16px rgba(0,63,135,0.36)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,63,135,0.24)"; }}
                >
                    Pay Now <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
};

/* ── Main Page ─────────────────────────────────────────────────── */
const ChallanPayment = () => {
    const [challans, setChallans]           = useState([]);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState("");
    const [selectedChallan, setSelectedChallan] = useState(null);
    const [paidIds, setPaidIds]             = useState(new Set());

    useEffect(() => {
        const fetchChallans = async () => {
            setLoading(true);
            try {
                const res = await getChallansByStatus("pending");
                setChallans(res.data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChallans();
    }, []);

    const handleSuccess = () => {
        setPaidIds((prev) => new Set([...prev, selectedChallan.challan_id]));
        setSelectedChallan(null);
    };

    const pending  = challans.filter((c) => !paidIds.has(c.challan_id));
    const totalDue = pending.reduce((s, c) => s + Number(c.total_amount), 0);

    return (
        <div className="max-w-4xl mx-auto">

            {/* ── Header ────────────────────────────────── */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <p className="text-[0.8125rem] font-medium text-[#003f87] uppercase tracking-[0.08em] mb-1">
                        Pending Dues
                    </p>
                    <h1 className="text-[1.75rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-tight">
                        Challan Payment
                    </h1>
                    <p className="text-[0.9375rem] text-[#42454e] mt-1">
                        {pending.length} pending challan{pending.length !== 1 ? "s" : ""}
                        {pending.length > 0 && (
                            <span className="ml-2 font-semibold" style={{ color: "#d97706" }}>
                                · ₹{totalDue.toLocaleString("en-IN")} due
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* ── Loading ───────────────────────────────── */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-[#003f87] border-t-transparent animate-spin" />
                </div>
            )}

            {/* ── Error ─────────────────────────────────── */}
            {!loading && error && (
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
                     style={{ boxShadow: cardShadow }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                         style={{ background: "#ffdad6", color: "#ba1a1a" }}>
                        <AlertCircle size={22} />
                    </div>
                    <p className="text-[1rem] font-semibold text-[#1a1d23]">Failed to load challans</p>
                    <p className="text-[0.875rem] text-[#42454e]">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-[0.875rem] font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
                        style={{ color: "#003f87", background: "none", border: "none" }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Empty State ───────────────────────────── */}
            {!loading && !error && pending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center"
                         style={{ boxShadow: cardShadow, color: "#c5c8d4" }}>
                        <Car size={28} />
                    </div>
                    <div>
                        <p className="text-[1rem] font-semibold text-[#1a1d23]">No pending challans</p>
                        <p className="text-[0.875rem] text-[#42454e] mt-1">You're all clear — no outstanding violations</p>
                    </div>
                </div>
            )}

            {/* ── Challan Grid ──────────────────────────── */}
            {!loading && !error && pending.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pending.map((c) => (
                        <ChallanCard key={c.challan_id} challan={c} onPayClick={setSelectedChallan} />
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            {selectedChallan && (
                <PaymentModal
                    challan={selectedChallan}
                    onClose={() => setSelectedChallan(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default ChallanPayment;