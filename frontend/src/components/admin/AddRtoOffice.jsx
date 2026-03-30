import { useState } from "react";
import { addRtoOffice } from "../../api/admin.js";

export default function AddRtoOffice() {
  const [form, setForm] = useState({
    rto_code: "",
    rto_name: "",
    state: "",
    district: "",
    address: "",
    contact_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // ─── Handle Input ───────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ─── Submit ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await addRtoOffice(form);
      setMessage("RTO Office added successfully ✅");

      // Reset form
      setForm({
        rto_code: "",
        rto_name: "",
        state: "",
        district: "",
        address: "",
        contact_number: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add RTO office ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1 font-mono">
          Admin Panel
        </p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Add RTO Office
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a new RTO office entry
        </p>
      </div>

      {/* ── Form ── */}
      <div className="px-8 py-8 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col gap-6"
        >

          {/* Messages */}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠ {error}
            </div>
          )}

          {message && (
            <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              {message}
            </div>
          )}

          {/* Grid Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Input label="RTO Code" name="rto_code" placeholder="KA-89" value={form.rto_code} onChange={handleChange} />
            <Input label="RTO Name" name="rto_name" placeholder="Rto Office 2" value={form.rto_name} onChange={handleChange} />

            <Input label="State" name="state" value={form.state} placeholder="Karnataka" onChange={handleChange} />
            <Input label="District" name="district" placeholder="Udupi" value={form.district} onChange={handleChange} />

            <Input label="Contact Number" name="contact_number" placeholder="9898784587" value={form.contact_number} onChange={handleChange} />

          </div>

          {/* Address Full Width */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add RTO Office"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ─── Reusable Input ───────────────────────────────────────

function Input({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 mb-1 block">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
      />
    </div>
  );
}