import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/useAuth"; // Import your auth hook
import { 
  LayoutDashboard, Users, FileWarning, 
  Car, CreditCard, Settings 
} from "lucide-react";

const adminNavItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/challans", label: "Challans", icon: FileWarning },
    { to: "/admin/vehicles", label: "Vehicles", icon: Car },
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/violations", label: "Violations", icon: Settings },
];

const AdminLayout = () => {
    const { user, loading } = useAuth();

    // 1. Handle Loading State (Prevents flicker on refresh)
    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>;

    // 2. Security: Redirect if not logged in or not an admin
    if (!user || user.role !== 'admin') {
        return <Navigate replace to="/login" />;
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Sidebar gets the config and the specific Admin name if needed */}
            <Sidebar 
                navItems={adminNavItems} 
                roleName="Administrator" 
                userName={user.name} 
            />

            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Page content like Dashboard or UserManagement renders here */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;