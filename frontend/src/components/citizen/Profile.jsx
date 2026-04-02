import { useEffect, useState } from "react";
import { getMyProfile } from "../../api/citizen";
import { User, Mail, Phone, ShieldCheck, Book } from "lucide-react";

const cardShadow = "0 4px 24px rgba(0,63,135,0.07), 0 1px 4px rgba(0,63,135,0.04)";

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
                <div className="w-10 h-10 rounded-full border-2 border-[#003f87] border-t-transparent animate-spin" />
                <p className="text-[0.875rem] text-[#42454e]">Loading profile…</p>
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
    ];

    return (
        <div className="max-w-2xl mx-auto">
            {/* ── Header ─────────────────────────────────── */}
            <div className="mb-8">
                <p className="text-[0.8125rem] font-medium text-[#003f87] uppercase tracking-[0.08em] mb-1">
                    Account
                </p>
                <h1 className="text-[1.75rem] font-bold text-[#1a1d23] tracking-[-0.02em] leading-tight">
                    My Profile
                </h1>
                <p className="text-[0.9375rem] text-[#42454e] mt-1">
                    Your personal account information
                </p>
            </div>

            {/* ── Profile Card ───────────────────────────── */}
            <div className="bg-white rounded-2xl" style={{ boxShadow: cardShadow }}>

                {/* Avatar + Name — avatar bleeds upward over banner */}
                <div className="px-6 pb-6">
                    {/* Avatar row: pulled up by -mt-10 so it sits half over the banner */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-5 mt-13">
                        {/* Avatar */}
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                            style={{
                                background: "linear-gradient(135deg, #003f87 0%, #0056b3 100%)",
                                boxShadow: "0 4px 20px rgba(0,63,135,0.30)",
                                border: "4px solid #ffffff",
                            }}
                        >
                            {initials || <User size={28} />}
                        </div>

                        <div className="pt-10 sm:pt-0 pb-1">
                            <h2 className="text-[1.25rem] font-bold text-[#1a1d23]">{profile.full_name}</h2>
                            {/* Verified Citizen badge — keep semantic green */}
                            <span
                                className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-[0.75rem] font-medium"
                                style={{ background: "#d4edda", color: "#2e7d32" }}
                            >
                                <ShieldCheck size={11} />
                                Verified Citizen
                            </span>
                        </div>
                    </div>

                    {/* Detail Fields — tonal surface separation, NO borders */}
                    <div className="flex flex-col gap-[1.4rem]">
                        {fields.map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{ background: "#f3f4f5" }}
                            >
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(0,63,135,0.08)", color: "#003f87" }}
                                >
                                    <Icon size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-[#42454e]">
                                        {label}
                                    </p>
                                    <p className="text-[0.9375rem] font-medium text-[#1a1d23] mt-0.5 truncate">
                                        {value || "—"}
                                    </p>
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