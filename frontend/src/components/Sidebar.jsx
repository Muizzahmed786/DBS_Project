import { NavLink, useNavigate } from "react-router-dom";
import {ReceiptText, Car, UserCircle, FolderOpen, TrafficCone, LogOut, Menu, X,} from "lucide-react";
import { useState } from "react";

import { logoutUser } from "../api/auth.js";

const navItems = [
    { to: "/dashboard/challans",  label: "Challans",   icon: ReceiptText },
    { to: "/dashboard/vehicles",  label: "Vehicles",   icon: Car },
    { to: "/dashboard/profile",   label: "Profile",    icon: UserCircle },
    { to: "/dashboard/documents", label: "Documents",  icon: FolderOpen },
];


const Sidebar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = async  () => {
        try{
            await logoutUser();
        } catch(err){
            console.error(err);
        } finally{
            localStorage.removeItem("isLoggedIn");
            navigate('/', {replace: true});
        }
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700/60">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-500 shadow-lg shadow-sky-500/30">
                    <TrafficCone size={18} className="text-white" />
                </div>
                <div>
                    <p className="text-white font-bold text-lg leading-none tracking-wide">Parivahan</p>
                    <p className="text-slate-400 text-[11px] tracking-widest uppercase mt-0.5">Citizen Portal</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                            ${isActive
                                ? "bg-sky-500/15 text-sky-400 shadow-sm"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`transition-colors duration-200 ${isActive ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                                    <Icon size={18} />
                                </span>
                                {label}
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-5 border-t border-slate-700/60">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                >
                    <LogOut size={17} className="group-hover:text-red-400 transition-colors" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-700/50 shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2.5 rounded-xl bg-slate-800 text-white shadow-lg border border-slate-700"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;