import { useState } from "react";
import { issueDrivingLicence } from "../../api/officer.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const VEHICLE_CATEGORIES = [
  { code: "MCWG", label: "Motorcycle with Gear", icon: "🏍️" },
  { code: "MCWOG", label: "Motorcycle without Gear", icon: "🛵" },
  { code: "LMV", label: "Light Motor Vehicle", icon: "🚗" },
  { code: "LMV-TR", label: "LMV Transport", icon: "🚐" },
  { code: "HMV", label: "Heavy Motor Vehicle", icon: "🚛" },
  { code: "HTV", label: "Heavy Transport Vehicle", icon: "🚌" },
];

const VALIDITY_OPTIONS = [5, 10, 20];

const STEPS = ["Applicant", "Licence Details", "Review"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 mb-10">
    {STEPS.map((label, i) => (
      <div key={label} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
              i < current
                ? "bg-indigo-500 border-indigo-500 text-slate-900"
                : i === current
                ? "bg-slate-900 border-indigo-500 text-indigo-500"
                : "bg-slate-900 border-slate-700 text-slate-600"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-xs font-semibold tracking-wider uppercase ${
              i === current ? "text-indigo-500" : i < current ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div
            className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-all duration-500 ${
              i < current ? "bg-indigo-500" : "bg-slate-800"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const Field = ({ label, required, error, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-slate-600">{hint}</p>}
    {error && <p className="text-xs text-rose-400">{error}</p>}
  </div>
);

const TextInput = ({ name, value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
  />
);

const ReviewRow = ({ label, value }) => (
  <div className="flex justify-between items-center px-4 py-3 gap-4 border-b border-slate-700/50 last:border-0">
    <span className="text-xs text-slate-500 uppercase tracking-wider flex-shrink-0">{label}</span>
    <span className="text-sm text-slate-200 font-semibold text-right break-all">{value || "—"}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IssueLicence() {
  const [step, setStep] = useState(0);
  const [lookupMethod, setLookupMethod] = useState("email");
  const [form, setForm] = useState({
    email: "",
    mobile: "",
    rtoCode: "",
    vehicle_categories: [],
    validity_years: 20,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const toggleCategory = (code) => {
    setForm((p) => ({
      ...p,
      vehicle_categories: p.vehicle_categories.includes(code)
        ? p.vehicle_categories.filter((c) => c !== code)
        : [...p.vehicle_categories, code],
    }));
    if (errors.vehicle_categories) setErrors((p) => ({ ...p, vehicle_categories: null }));
  };

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (lookupMethod === "email" && !form.email.trim()) e.email = "Email is required";
      else if (lookupMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Enter a valid email address";
      if (lookupMethod === "mobile" && !form.mobile.trim()) e.mobile = "Mobile number is required";
      else if (lookupMethod === "mobile" && !/^\d{10}$/.test(form.mobile))
        e.mobile = "Enter a valid 10-digit mobile number";
    }
    if (step === 1) {
      if (!form.rtoCode.trim()) e.rtoCode = "RTO CODE is required";
      if (form.vehicle_categories.length === 0)
        e.vehicle_categories = "Select at least one vehicle category";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setApiError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        rtoCode: form.rtoCode.trim().toUpperCase(),
        vehicle_categories: form.vehicle_categories.join(","),
        validity_years: form.validity_years,
        ...(lookupMethod === "email"
          ? { email: form.email.trim().toLowerCase() }
          : { mobile: form.mobile.trim() }),
      };
      const { data } = await issueDrivingLicence(payload);
      setResult(data.data);
      setStep(3);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to issue licence. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ email: "", mobile: "", rtoCode: "", vehicle_categories: [], validity_years: 20 });
    setErrors({});
    setResult(null);
    setApiError(null);
    setStep(0);
    setLookupMethod("email");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-slate-950 flex items-start justify-center py-12 px-4"
      style={{ fontFamily: "'DM Mono', 'Fira Mono', monospace" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-black text-sm">🪪</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Issue Driving Licence</h1>
              <p className="text-xs text-slate-500">Motor Vehicles Department · Officer Portal</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* ── Success ── */}
          {step === 3 && result ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-400 mb-1">Licence Issued</h2>
                <p className="text-xs text-slate-500">The driving licence has been created successfully</p>
              </div>

              {/* DL Card Preview */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-left space-y-3">
                {[
                  { label: "Licence Number", value: result.licence_number },
                  { label: "Issue Date", value: result.issue_date },
                  { label: "Expiry Date", value: result.expiry_date },
                  { label: "Issuing RTO", value: result.issuing_rto_id },
                  { label: "Categories", value: result.vehicle_categories },
                  { label: "Status", value: result.status?.toUpperCase() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
                    <span className="text-sm text-slate-200 font-semibold">{value ?? "—"}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-900 font-bold rounded-xl text-sm tracking-wide transition-all"
              >
                Issue Another Licence
              </button>
            </div>
          ) : (
            <>
              <StepBar current={step} />

              {/* ── Step 0: Applicant ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-200 mb-0.5">Applicant Lookup</h2>
                    <p className="text-xs text-slate-600">Find the citizen by email or mobile number</p>
                  </div>

                  {/* Toggle */}
                  <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
                    {[
                      { key: "email", label: " Email" },
                      { key: "mobile", label: " Mobile" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setLookupMethod(key);
                          setErrors({});
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                          lookupMethod === key
                            ? "bg-slate-700 text-indigo-400 shadow-sm"
                            : "text-slate-600 hover:text-slate-400"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {lookupMethod === "email" ? (
                    <Field label="Email Address" required error={errors.email}>
                      <TextInput
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="citizen@example.com"
                        type="email"
                      />
                    </Field>
                  ) : (
                    <Field label="Mobile Number" required error={errors.mobile}>
                      <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 font-mono">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="mobile"
                          value={form.mobile}
                          onChange={handleChange}
                          placeholder="9876543210"
                          maxLength={10}
                          className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                        />
                      </div>
                    </Field>
                  )}
                </div>
              )}

              {/* ── Step 1: Licence Details ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-200 mb-0.5">Licence Configuration</h2>
                    <p className="text-xs text-slate-600">Set RTO, vehicle categories and validity</p>
                  </div>

                  <Field label="Issuing RTO CODE" required error={errors.rtoCode} hint="e.g. KA-05, MH-12">
                    <TextInput
                      name="rtoCode"
                      value={form.rtoCode}
                      onChange={handleChange}
                      placeholder="KA-05"
                    />
                  </Field>

                  <Field label="Vehicle Categories" required error={errors.vehicle_categories}>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {VEHICLE_CATEGORIES.map(({ code, label, icon }) => {
                        const selected = form.vehicle_categories.includes(code);
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => toggleCategory(code)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                              selected
                                ? "bg-indigo-500/10 border-indigo-500/60 text-indigo-400"
                                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                            }`}
                          >
                            <span className="text-base">{icon}</span>
                            <span className="leading-tight">
                              <span className="block font-bold text-[11px]">{code}</span>
                              <span className="text-[10px] text-slate-500 font-normal">{label}</span>
                            </span>
                            {selected && <span className="ml-auto text-indigo-400 text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label="Validity Period">
                    <div className="flex gap-2">
                      {VALIDITY_OPTIONS.map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, validity_years: yr }))}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                            form.validity_years === yr
                              ? "bg-indigo-500 border-indigo-500 text-slate-900"
                              : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          {yr} yr{yr > 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {/* ── Step 2: Review ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-200 mb-0.5">Review & Confirm</h2>
                    <p className="text-xs text-slate-600">Verify all details before issuing the licence</p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden divide-y divide-slate-700/50">
                    <ReviewRow
                      label={lookupMethod === "email" ? "Email" : "Mobile"}
                      value={lookupMethod === "email" ? form.email : `+91 ${form.mobile}`}
                    />
                    <ReviewRow label="RTO CODE" value={form.rtoCode.toUpperCase()} />
                    <ReviewRow
                      label="Vehicle Categories"
                      value={form.vehicle_categories.join(", ") || "—"}
                    />
                    <ReviewRow label="Validity" value={`${form.validity_years} years`} />
                  </div>

                  <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl px-4 py-3 flex gap-2">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
                    <p className="text-xs text-amber-400 leading-relaxed">
                      This action will issue a permanent driving licence to the applicant. Please ensure all details are correct before proceeding.
                    </p>
                  </div>

                  {apiError && (
                    <div className="bg-rose-950/40 border border-rose-700/50 rounded-xl px-4 py-3 text-rose-400 text-sm flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0">⚠</span>
                      <span>{apiError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Navigation ── */}
              <div className={`flex gap-3 mt-8 ${step > 0 ? "justify-between" : "justify-end"}`}>
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-xl transition-all disabled:opacity-40"
                  >
                    ← Back
                  </button>
                )}

                {step < 2 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-900 font-bold rounded-xl text-sm tracking-wide transition-all active:scale-95"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/40 text-slate-900 font-bold rounded-xl text-sm tracking-wide transition-all active:scale-95 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        Issuing…
                      </>
                    ) : (
                      "Issue Licence 🪪"
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Authorized Officer Use Only · Motor Vehicles Department
        </p>
      </div>
    </div>
  );
}