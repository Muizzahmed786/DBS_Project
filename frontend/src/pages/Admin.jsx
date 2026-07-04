import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/useAuth"; // Import your auth hook
import { 
  LayoutDashboard, Users, FileWarning, 
  Car, CreditCard, Settings,Building,Building2,TriangleAlert,FolderSearch,Trash,UserPlus 
} from "lucide-react";

const adminNavItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/add-users", label: "Add Users", icon: UserPlus },
    { to: "/admin/challans", label: "Challans", icon: FileWarning },
    { to: "/admin/vehicles", label: "Vehicles", icon: Car },
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/add-office", label: "Add Rto Office", icon: Building2  },
    { to: "/admin/add-violation-type", label: "Add Violation Type", icon:TriangleAlert  },
    { to: "/admin/violations", label: "Violations", icon: Settings },
    { to: "/admin/offices", label: "Rto Offices", icon: Building  },
    { to: "/admin/logs", label: "Audit Logs", icon: FolderSearch  },
     { to: "/admin/delete-logs", label: "Delete Audit Logs", icon: Trash  },
];

const AdminLayout = () => {
    const { user, loading } = useAuth();

    // 1. Handle Loading State (Prevents flicker on refresh)
    if (loading) return <div className="flex h-screen items-center justify-center bg-blue-50 text-slate-500">Loading...</div>;

    // 2. Security: Redirect if not logged in or not an admin
    if (!user || user.role !== 'admin') {
        return <Navigate replace to="/login" />;
    }

    return (
        <div className="flex min-h-screen bg-blue-50/40">
            {/* Sidebar gets the config and the specific Admin name if needed */}
            <Sidebar 
                navItems={adminNavItems} 
                roleName="Administrator" 
                userName={user.name} 
            />

            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;