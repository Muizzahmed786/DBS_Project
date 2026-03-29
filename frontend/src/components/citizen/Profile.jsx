import { useEffect, useState } from "react";
import { getMyProfile } from "../../api/citizen";
import { User, Mail, Phone, ShieldCheck,Book } from "lucide-react";

const Profile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await getMyProfile();
            setProfile(res.data.data[0]);
        };
        fetchProfile();
    }, []);

    if (!profile) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
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
        { icon: Mail,  label: "Email Address", value: profile.email },
        { icon: Phone, label: "Mobile Number",  value: profile.mobile_number },
        {icon:Book,label:"Adhaar Number",value:profile.aadhaar_number}
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">My Profile</h1>
                <p className="text-slate-400 text-sm mt-1">Your personal account information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden">
                {/* Banner */}
                <div className="h-28 bg-linear-to-r from-sky-600/30 via-blue-600/20 to-indigo-600/30 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(14,165,233,0.15),transparent)]" />
                </div>

                {/* Avatar + Info */}
                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-sky-500/25 border-4 border-slate-800 shrink-0">
                            {initials || <User size={28} />}
                        </div>
                        <div className="pb-1">
                            <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
                            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                <ShieldCheck size={11} />
                                Verified Citizen
                            </span>
                        </div>
                    </div>

                    {/* Detail Fields */}
                    <div className="space-y-3">
                        {fields.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-700/40">
                                <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                                    <Icon size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-slate-500 text-xs uppercase tracking-wider">{label}</p>
                                    <p className="text-white text-sm font-medium mt-0.5 truncate">{value || "—"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;