import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, TrafficCone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { logoutUser } from "../../api/auth.js";
import toast from 'react-hot-toast';
const Sidebar = ({ navItems = [], roleName = "User" }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleSignOut = async () => {
        try {
            await logoutUser();
            toast.success("Logged Out Successflly")
        } catch (err) {
            toast.error("Logout failed:", err);
        } finally {
            setUser(null);
            navigate("/", { replace: true });
        }
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-blue-100">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                    <TrafficCone size={18} className="text-white" />
                </div>
                <div>
                    <p className="text-slate-800 font-bold text-lg leading-none tracking-wide">Parivahan</p>
                    <p className="text-slate-400 text-[11px] tracking-widest uppercase mt-0.5">
                        {roleName} Portal
                    </p>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                            ${isActive 
                                ? "bg-blue-50 text-blue-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
                                {label}
                                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Sign Out Section */}
            <div className="px-4 py-5 border-t border-blue-100">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group"
                >
                    <LogOut size={17} className="group-hover:text-red-500" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop */}
            <aside className="hidden z-50 h-full md:flex flex-col w-64 max-h-screen bg-white border-r border-blue-100 shrink-0 overflow-auto">
                <SidebarContent />
            </aside>

            {/* Mobile Toggle & Drawer */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2.5 rounded-xl bg-white text-slate-800 border border-blue-100 shadow-sm">
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-blue-100 transform transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;