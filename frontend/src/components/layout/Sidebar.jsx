import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, TrafficCone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { logoutUser } from "../../api/auth.js";
import toast from "react-hot-toast";

const Sidebar = ({ navItems = [], roleName = "User" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Logout failed");
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25">
          <TrafficCone size={20} className="text-white" />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-wide text-slate-800">
            Parivahan
          </h1>

          <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">
            {roleName} Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />

                  <span>{label}</span>

                  <span
                    className={`ml-auto h-2 w-2 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 opacity-100"
                        : "opacity-0"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut
            size={18}
            className="transition-colors group-hover:text-red-600"
          />

          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg md:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[60] h-screen w-72 transform border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white shadow-sm md:sticky md:top-0 md:flex md:flex-col">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;