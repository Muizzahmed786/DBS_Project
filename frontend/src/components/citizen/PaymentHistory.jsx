import { useEffect, useState } from "react";
import { getMyPaymentHistory } from "../../api/citizen.js";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });

const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true,
    });

const StatusBadge = ({ status }) => {
    const base = "px-2.5 py-1 rounded-full text-[0.75rem] font-semibold flex items-center gap-1.5";
    if (status === "success" || status === "paid")
        return <span className={base} style={{ background: "#d4edda", color: "#2e7d32" }}><CheckCircle size={12} />Success</span>;
    if (status === "failed")
        return <span className={base} style={{ background: "#ffdad6", color: "#ba1a1a" }}><XCircle size={12} />Failed</span>;
    return <span className={base} style={{ background: "#fff3cd", color: "#92400e" }}><Clock size={12} />Pending</span>;
};

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await getMyPaymentHistory();
                setPayments(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    return (
        <div>
            {/* ── Header ─────────────────────────────────── */}
            <div className="mb-8">
                <p className="text-[0.8125rem] font-medium text-[#003f87] uppercase tracking-[0.08em] mb-1">
                    Transaction Ledger
                </p>
                <h1 className="text-[1.75rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-tight">
                    Payment History
                </h1>
                <p className="text-[0.9375rem] text-[#42454e] mt-1">
                    Track all your challan payments
                </p>
            </div>

            {/* ── Loading ─────────────────────────────────── */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-2 border-[#003f87] border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* ── Empty State ──────────────────────────────── */}
            {!loading && payments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center"
                         style={{ boxShadow: cardShadow, color: "#c5c8d4" }}>
                        <CreditCard size={24} />
                    </div>
                    <p className="text-[1rem] font-semibold text-[#1a1d23]">No payments found</p>
                    <p className="text-[0.875rem] text-[#42454e]">Your payment history will appear here</p>
                </div>
            )}

            {/* ── Table — white card with ambient shadow ──── */}
            {!loading && payments.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-2xl" style={{ boxShadow: cardShadow }}>
                    <table className="min-w-full text-[0.875rem]">
                        {/* Thead — tonal surface, NO border */}
                        <thead style={{ background: "#f3f4f5" }}>
                            <tr>
                                {["Txn ID", "Amount", "Mode", "Date", "Time", "Status"].map((col) => (
                                    <th key={col} className="px-5 py-3.5 text-left text-[0.75rem] font-medium uppercase tracking-[0.05em] text-[#42454e]">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map((p, i) => (
                                <tr
                                    key={p.payment_id}
                                    className="transition-colors duration-150"
                                    style={{ background: i % 2 === 0 ? "#ffffff" : "#f8f9fa" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f2f5"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "#ffffff" : "#f8f9fa"; }}
                                >
                                    <td className="px-5 py-3.5 font-mono text-[0.8125rem] text-[#42454e]">{p.transaction_reference}</td>
                                    <td className="px-5 py-3.5 font-bold text-[#1a1d23]">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                                    <td className="px-5 py-3.5 text-[#42454e]">{p.payment_mode}</td>
                                    <td className="px-5 py-3.5 text-[#42454e]">{formatDate(p.payment_date)}</td>
                                    <td className="px-5 py-3.5 text-[#42454e]">{formatTime(p.payment_date)}</td>
                                    <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
