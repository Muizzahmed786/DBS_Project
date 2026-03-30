import { useEffect, useState } from "react";
import { getMyPaymentHistory } from "../../api/citizen.js";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

const StatusBadge = ({ status }) => {
  const base = "px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1";

  if (status === "success" || status === "paid") {
    return <span className={`${base} bg-emerald-100 text-emerald-700`}><CheckCircle size={12}/>Success</span>;
  }
  if (status === "failed") {
    return <span className={`${base} bg-red-100 text-red-700`}><XCircle size={12}/>Failed</span>;
  }
  return <span className={`${base} bg-amber-100 text-amber-700`}><Clock size={12}/>Pending</span>;
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-slate-400 text-sm mt-1">Track all your challan payments</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && payments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
            <CreditCard size={24} />
          </div>
          <p className="text-white font-medium">No payments found</p>
          <p className="text-slate-500 text-sm">Your payment history will appear here</p>
        </div>
      )}

      {/* Table */}
      {!loading && payments.length > 0 && (
        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Txn ID</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.payment_id} className="border-t border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 font-mono text-slate-300">{p.transaction_reference}</td>
                  <td className="px-4 py-3 font-semibold text-white">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-slate-300">{p.payment_mode}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
