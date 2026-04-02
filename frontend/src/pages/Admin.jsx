import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/useAuth";
import {
  LayoutDashboard, Users, FileWarning,
  Car, CreditCard, Settings, Building, Building2, TriangleAlert
} from "lucide-react";

const adminNavItems = [
    { to: "/admin/dashboard",          label: "Dashboard",        icon: LayoutDashboard },
    { to: "/admin/users",              label: "Users",            icon: Users           },
    { to: "/admin/challans",           label: "Challans",         icon: FileWarning     },
    { to: "/admin/vehicles",           label: "Vehicles",         icon: Car             },
    { to: "/admin/payments",           label: "Payments",         icon: CreditCard      },
    { to: "/admin/add-office",         label: "Add RTO Office",   icon: Building2       },
    { to: "/admin/add-violation-type", label: "Add Violation",    icon: TriangleAlert   },
    { to: "/admin/violations",         label: "Violations",       icon: Settings        },
    { to: "/admin/offices",            label: "RTO Offices",      icon: Building        },
];

const AdminLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#003f87] border-t-transparent animate-spin" />
                <p className="text-[0.875rem] text-[#42454e]">Loading…</p>
            </div>
        </div>
    );

    if (!user || user.role !== "admin")
        return <Navigate replace to="/login" />;

    return (
        <div className="flex min-h-screen bg-[#f3f4f5]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <Sidebar navItems={adminNavItems} roleName="Administrator" userName={user.name} />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;