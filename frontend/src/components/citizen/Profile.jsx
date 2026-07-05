import { useEffect, useState } from "react";
import { getMyProfile, getMyVehicleCount } from "../../api/citizen";
import { User, Mail, Phone, ShieldCheck, Book, Car } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [vehicleCount, setVehicleCount] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await getMyProfile();
      setProfile(res.data.data[0]);
    };
    const fetchVehicleCount = async () => {
      try {
        const res = await getMyVehicleCount();
        setVehicleCount(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
    fetchVehicleCount();
  }, []);

  if (!profile)
    return (
      <div className="min-h-screen bg-blue-50/40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fields = [
    { icon: Mail, label: "Email Address", value: profile.email },
    { icon: Phone, label: "Mobile Number", value: profile.mobile_number },
    { icon: Book, label: "Aadhaar Number", value: profile.aadhaar_number },
    { icon: Car, label: "My Vehicles", value: vehicleCount ?? "—" },
  ];

  return (
    <div className="min-h-screen bg-blue-50/40">
      {/* ── Header ── */}
      <div className="bg-white border-b border-blue-100 px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">
          Citizen Portal
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Your personal account information
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute top-8 left-10 w-24 h-24 bg-white/10 rounded-full" />

            {/* Avatar */}
            <div className="absolute left-1/2 -bottom-12 -translate-x-1/2">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl p-1">
                <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-3xl font-bold">
                  {initials || <User size={34} />}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-16 pb-8 px-8">
            {/* Name */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {profile.full_name}
              </h2>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                <ShieldCheck size={16} />
                Verified Citizen
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
              {fields.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="group flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {label}
                    </p>

                    <p className="mt-1 text-base text-slate-900 break-words">
                      {value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
