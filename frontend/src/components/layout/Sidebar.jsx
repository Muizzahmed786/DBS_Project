import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, TrafficCone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { logoutUser } from "../../api/auth.js";

const Sidebar = ({ navItems = [], roleName = "User" }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleSignOut = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setUser(null);
            navigate("/", { replace: true });
        }
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo — white on Deep Sea blue */}
            <div className="flex items-center gap-3 px-6 py-6">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl shadow-lg"
                     style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
                    <TrafficCone size={18} className="text-white" />
                </div>
                <div>
                    <p className="text-white font-bold text-lg leading-none tracking-[-0.01em]">CivilPortal</p>
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.07em] mt-0.5"
                       style={{ color: "rgba(255,255,255,0.55)" }}>
                        {roleName} Portal
                    </p>
                </div>
            </div>

            {/* Tonal divider — background shift, NOT a border */}
            <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />

            {/* Navigation */}
            <nav className="flex-1 px-4 py-5 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9375rem] font-medium transition-all duration-200 group
                            ${isActive
                                ? "text-white"
                                : "hover:text-white"}`
                        }
                        style={({ isActive }) => ({
                            background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                            color: isActive ? "#ffffff" : "rgba(255,255,255,0.60)",
                        })}
                        onMouseEnter={(e) => {
                            if (!e.currentTarget.classList.contains('active')) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                e.currentTarget.style.color = "#ffffff";
                            }
                        }}
                        onMouseLeave={(e) => {
                            const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                            e.currentTarget.style.background = isActive ? "rgba(255,255,255,0.15)" : "transparent";
                            e.currentTarget.style.color = isActive ? "#ffffff" : "rgba(255,255,255,0.60)";
                        }}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    size={18}
                                    style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)" }}
                                />
                                {label}
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Tonal divider */}
            <div className="mx-4 h-px mb-1" style={{ background: "rgba(255,255,255,0.10)" }} />

            {/* Sign Out */}
            <div className="px-4 py-5">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[0.875rem] font-medium transition-all duration-200"
                    style={{ color: "rgba(255,255,255,0.50)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.50)"; }}
                >
                    <LogOut size={17} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar — Deep Sea blue */}
            <aside
                className="hidden md:flex flex-col w-64 min-h-screen shrink-0"
                style={{ background: "linear-gradient(180deg, #003f87 0%, #003070 100%)" }}
            >
                <SidebarContent />
            </aside>

            {/* Mobile toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2.5 rounded-xl text-white shadow-lg"
                    style={{ background: "#003f87" }}
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ background: "linear-gradient(180deg, #003f87 0%, #003070 100%)" }}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;