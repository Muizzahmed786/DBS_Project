import { useState } from "react";
import { issueChallan } from "../../api/officer.js"; // adjust path as needed

const steps = ["Vehicle", "Violation", "Confirm"];

const InputField = ({ label, name, value, onChange, placeholder, required, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
    />
    {hint && <p className="text-xs text-slate-600">{hint}</p>}
  </div>
);

const StepIndicator = ({ current }) => (
  <div className="flex items-center gap-0 mb-10">
    {steps.map((label, i) => (
      <div key={label} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
              i < current
                ? "bg-amber-500 border-amber-500 text-slate-900"
                : i === current
                ? "bg-slate-900 border-amber-500 text-amber-500"
                : "bg-slate-900 border-slate-700 text-slate-600"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-xs font-semibold tracking-wider uppercase ${
              i === current ? "text-amber-500" : i < current ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-all duration-500 ${
              i < current ? "bg-amber-500" : "bg-slate-800"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

export default function IssueChallan() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    registrationNo: "",
    licenceNo: "",
    violationDesc: "",
    offenceSection: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (!form.registrationNo.trim()) newErrors.registrationNo = "Registration number is required";
    }
    if (step === 1) {
      if (!form.violationDesc.trim() && !form.offenceSection.trim()) {
        newErrors.violationDesc = "Provide either a violation description or offence section";
        newErrors.offenceSection = " ";
      }
      if (!form.location.trim()) newErrors.location = "Location is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
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
        registrationNo: form.registrationNo.trim().toUpperCase(),
        licenceNo: form.licenceNo.trim() || undefined,
        violationDesc: form.violationDesc.trim() || undefined,
        offenceSection: form.offenceSection.trim() || undefined,
        location: form.location.trim(),
      };
      const { data } = await issueChallan(payload);
      setResult(data.data?.[0] ?? data.data);
      setStep(3); // success view
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to issue challan. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ registrationNo: "", licenceNo: "", violationDesc: "", offenceSection: "", location: "" });
    setErrors({});
    setResult(null);
    setApiError(null);
    setStep(0);
  };

  return (
    <div
      className="min-h-screen bg-slate-950 flex items-start justify-center py-12 px-4"
      style={{ fontFamily: "'DM Mono', 'Fira Mono', monospace" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-black text-sm">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Issue Challan</h1>
              <p className="text-xs text-slate-500">Traffic Enforcement Portal</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Success state */}
          {step === 3 && result ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-400 mb-1">Challan Issued</h2>
                <p className="text-xs text-slate-500">The challan has been recorded successfully</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-left space-y-3">
                {[
                  { label: "Challan No.", value: result.challan_number ?? result.challan_id },
                  { label: "Vehicle ID", value: result.vehicle_id },
                  { label: "Amount", value: result.total_amount ? `₹${result.total_amount}` : "—" },
                  { label: "Status", value: result.status ?? "pending" },
                  { label: "Location", value: result.location ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
                    <span className="text-sm text-slate-200 font-semibold">{value ?? "—"}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm tracking-wide transition-all"
              >
                Issue Another Challan
              </button>
            </div>
          ) : (
            <>
              <StepIndicator current={step} />

              {/* Step 0 — Vehicle Details */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-200 mb-0.5">Vehicle Information</h2>
                    <p className="text-xs text-slate-600">Enter the vehicle's registration and optionally the driver's licence</p>
                  </div>
                  <InputField
                    label="Registration Number"
                    name="registrationNo"
                    value={form.registrationNo}
                    onChange={handleChange}
                    placeholder="e.g. MH12AB1234"
                    required
                  />
                  {errors.registrationNo && (
                    <p className="text-xs text-rose-400 -mt-3">{errors.registrationNo}</p>
                  )}
                  <InputField
                    label="Driving Licence Number"
                    name="licenceNo"
                    value={form.licenceNo}
                    onChange={handleChange}
                    placeholder="e.g. KA0320180012345"
                    hint="Optional — if omitted, challan is issued to the vehicle owner"
                  />
                </div>
              )}

              {/* Step 1 — Violation Details */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-200 mb-0.5">Violation Details</h2>
                    <p className="text-xs text-slate-600">Provide offence section or violation description, and the location</p>
                  </div>

                  <InputField
                    label="Offence Section"
                    name="offenceSection"
                    value={form.offenceSection}
                    onChange={handleChange}
                    placeholder="e.g. MV Act 183"
                    hint="Takes priority over description if both are provided"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-xs text-slate-600 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                  <InputField
                    label="Violation Description"
                    name="violationDesc"
                    value={form.violationDesc}
                    onChange={handleChange}
                    placeholder="e.g. Over Speeding"
                  />
                  {(errors.violationDesc || errors.offenceSection) && (
                    <p className="text-xs text-rose-400">{errors.violationDesc?.trim() || "Provide at least one violation identifier"}</p>
                  )}
                  <InputField
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. NH-48, Bangalore"
                    required
                  />
                  {errors.location && (
                    <p className="text-xs text-rose-400 -mt-3">{errors.location}</p>
                  )}
                </div>
              )}

              {/* Step 2 — Confirm */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-200 mb-0.5">Confirm & Issue</h2>
                    <p className="text-xs text-slate-600">Review the details before issuing</p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden divide-y divide-slate-700/50">
                    {[
                      { label: "Registration No.", value: form.registrationNo.toUpperCase() },
                      { label: "Licence No.", value: form.licenceNo || "Not provided" },
                      { label: "Offence Section", value: form.offenceSection || "—" },
                      { label: "Violation Desc.", value: form.violationDesc || "—" },
                      { label: "Location", value: form.location },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center px-4 py-3 gap-4">
                        <span className="text-xs text-slate-500 uppercase tracking-wider flex-shrink-0">{label}</span>
                        <span className="text-sm text-slate-200 text-right break-all">{value}</span>
                      </div>
                    ))}
                  </div>

                  {apiError && (
                    <div className="bg-rose-950/40 border border-rose-700/50 rounded-xl px-4 py-3 text-rose-400 text-sm flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0">⚠</span>
                      <span>{apiError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
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
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm tracking-wide transition-all active:scale-95"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-slate-900 font-bold rounded-xl text-sm tracking-wide transition-all active:scale-95 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        Issuing…
                      </>
                    ) : (
                      "Issue Challan ⚡"
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Authorized Officer Use Only · Traffic Enforcement System
        </p>
      </div>
    </div>
  );
}