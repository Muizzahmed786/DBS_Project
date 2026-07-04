import { useState } from "react";
import { addAdminOrOfficer } from "../../api/admin.js";

// ─── Field Config ──────────────────────────────────────────

const FIELDS = [
  { name: "full_name",      label: "Full Name",      type: "text",     placeholder: "John Doe" },
  { name: "email",          label: "Email",          type: "email",    placeholder: "john@example.com" },
  { name: "mobile_number",  label: "Mobile Number",  type: "tel",      placeholder: "9876543210" },
  { name: "aadhaar_number", label: "Aadhaar Number", type: "text",     placeholder: "1234 5678 9012" },
  { name: "password",       label: "Password",       type: "password", placeholder: "••••••••" },
];

const INITIAL_FORM = {
  full_name: "",
  email: "",
  mobile_number: "",
  aadhaar_number: "",
  password: "",
  role: "admin",
};

// ─── Main Component ────────────────────────────────────────

export default function AddUsers() {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);   // created user object
  const [error, setError]     = useState(null);

  // ─── Handlers ───────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await addAdminOrOfficer(form);
      setSuccess(res.data?.data || res.data);
      setForm(INITIAL_FORM);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(form).every((v) => v.trim() !== "");

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Header ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 py-8">
        <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-1 font-mono">
          Admin Panel
        </p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Add Admin / Officer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Create a new admin or officer account
        </p>
      </div>

      {/* ── Content ── */}
      <div className="px-8 py-8 max-w-2xl mx-auto">

        {/* Success Banner */}
        {success && (
          <div className="mb-6 px-4 py-4 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm">
            <p className="font-semibold mb-1 text-emerald-400">✓ User created successfully</p>
            <p className="text-emerald-300">
              <span className="font-medium">{success.full_name}</span> —{" "}
              <span className="font-mono capitalize bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-xs">
                {success.role}
              </span>{" "}
              · {success.email}
            </p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/60 px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Text Fields */}
            {FIELDS.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"
                >
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700/60 bg-slate-900/60 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/60 transition"
                />
              </div>
            ))}

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Role
              </label>
              <div className="flex gap-3">
                {["admin", "officer"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: r }))}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition capitalize ${
                      form.role === r
                        ? "bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-500/30"
                        : "bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-sky-500/40 hover:text-sky-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700/50 pt-2" />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm shadow-sky-500/30 transition"
            >
              {loading ? "Creating..." : `Create ${form.role === "admin" ? "Admin" : "Officer"}`}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}