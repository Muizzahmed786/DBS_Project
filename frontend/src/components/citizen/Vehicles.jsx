import { useEffect, useState } from "react";
import { getRegisteredVehicles, insertVehicle } from "../../api/citizen.js";
import { Car, Bike, Truck, Hash, Plus, X, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const getVehicleIcon = (model = "") => {
  const m = model.toLowerCase();
  if (m.includes("bike") || m.includes("scooter") || m.includes("motorcycle")) return Bike;
  if (m.includes("truck") || m.includes("bus") || m.includes("van")) return Truck;
  return Car;
};

const EMPTY_FORM = {
  registration_number: "",
  chassis_number: "",
  engine_number: "",
  vehicle_class: "",
  fuel_type: "",
  manufacturer: "",
  model: "",
  registration_date: "",
  registration_valid_till: "",
  insurance_valid_till: "",
  rto_code: "",
};

const TEXT_FIELDS = [
  { label: "Registration Number", key: "registration_number", placeholder: "MH 12 AB 1234" },
  { label: "Chassis Number", key: "chassis_number", placeholder: "MA3EWDE1S00XXXXX" },
  { label: "Engine Number", key: "engine_number", placeholder: "G10BN1234567" },
  { label: "Vehicle Class", key: "vehicle_class", placeholder: "LMV / MCWG / HGV" },
  { label: "Fuel Type", key: "fuel_type", placeholder: "Petrol / Diesel / Electric / CNG" },
  { label: "Manufacturer", key: "manufacturer", placeholder: "Maruti Suzuki" },
  { label: "Model", key: "model", placeholder: "Swift Dzire" },
  { label: "RTO code", key: "rto_code", placeholder: "RTO office code" },
];

const DATE_FIELDS = [
  { label: "Registration Date", key: "registration_date" },
  { label: "Registration Valid Till", key: "registration_valid_till" },
  { label: "Insurance Valid Till", key: "insurance_valid_till" },
];

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (!form.registration_number || !form.vehicle_class || !form.fuel_type) {
        toast.error("Please fill the required fields (Registration Number, Vehicle Class, Fuel Type");
        setSubmitting(false);
        return;
      }
      await insertVehicle({ ...form });
      const res = await getRegisteredVehicles();
      setVehicles(res.data.data);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success("Vehicle added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await getRegisteredVehicles();
        setVehicles(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
              My Account
            </p>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Vehicles</h1>
            <p className="text-sm text-slate-500 mt-1">
              {vehicles.length} registered vehicle{vehicles.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Toggle form button */}
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-600 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add Vehicle"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
        {/* Add Vehicle Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-blue-100 rounded-2xl shadow-sm p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-slate-800 font-semibold text-base">Vehicle Details</h2>
              <ChevronDown size={16} className="text-slate-400" />
            </div>

            {/* Text fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {TEXT_FIELDS.map(({ label, key, placeholder }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    placeholder={placeholder}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Date fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {DATE_FIELDS.map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-slate-500 text-xs font-medium">{label}</label>
                  <input
                    type="date"
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-100">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
                className="text-slate-500 hover:text-slate-800 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2 rounded-lg transition-all duration-200 active:scale-95"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Add Vehicle
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-blue-100 flex items-center justify-center text-indigo-400">
              <Car size={28} />
            </div>
            <div>
              <p className="text-slate-800 font-medium">No vehicles registered</p>
              <p className="text-slate-400 text-sm mt-1">Your registered vehicles will appear here</p>
            </div>
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              const Icon = getVehicleIcon(v.model);
              return (
                <div
                  key={v.vehicle_id}
                  className="group bg-white border border-blue-100 rounded-2xl shadow-sm p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-default"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-200">
                    <Icon size={22} />
                  </div>

                  {/* Vehicle Number Plate */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-slate-900 tracking-widest">
                      {v.registration_number}
                    </span>
                  </div>

                  {/* Model */}
                  <p className="text-slate-500 text-sm">{v.model}</p>

                  {/* Divider */}
                  <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-1.5 text-xs text-slate-400">
                    <Hash size={11} />
                    ID: {v.vehicle_id}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;