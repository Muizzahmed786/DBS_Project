import { useEffect, useState } from "react";
import { getMyPaymentHistory } from "../../api/citizen.js";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const StatusBadge = ({ status }) => {
  const base = "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit";

  if (status === "success" || status === "paid") {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`}>
        <CheckCircle size={12} />
        Success
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className={`${base} bg-rose-50 text-rose-700 ring-1 ring-rose-200`}>
        <XCircle size={12} />
        Failed
      </span>
    );
  }
  return (
    <span className={`${base} bg-amber-50 text-amber-700 ring-1 ring-amber-200`}>
      <Clock size={12} />
      Pending
    </span>
  );
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getMyPaymentHistory();
        console.log(res);
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
    <div className="min-h-screen bg-blue-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
          Citizen Portal
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payment History</h1>
        <p className="text-sm text-slate-500 mt-1">Track all your challan payments</p>
      </div>

      <div className="px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && payments.length === 0 && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
              <CreditCard size={24} />
            </div>
            <p className="text-slate-800 font-medium">No payments found</p>
            <p className="text-slate-400 text-sm">Your payment history will appear here</p>
          </div>
        )}

        {/* Table */}
        {!loading && payments.length > 0 && (
          <div className="overflow-x-auto bg-white border border-blue-100 rounded-2xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-indigo-50/60 border-b border-blue-100 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Txn ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Mode</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.payment_id}
                    className="border-b border-blue-50 last:border-0 hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-mono bg-indigo-50/60 border border-blue-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                        {p.transaction_reference}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ₹{Number(p.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.payment_mode}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatTime(p.payment_date)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}