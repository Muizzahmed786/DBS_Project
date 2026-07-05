import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/useAuth";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  User,
  Car,
  CreditCard,
} from "lucide-react";

const citizenNavItems = [
  { to: "/citizen/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/citizen/challans", label: "Challans", icon: FileText },
  { to: "/citizen/documents", label: "Documents", icon: FolderOpen },
  { to: "/citizen/profile", label: "Profile", icon: User },
  { to: "/citizen/vehicles", label: "Vehicles", icon: Car },
  { to: "/citizen/payments", label: "Payment History", icon: FileText },
  { to: "/citizen/make-payments", label: "Challan Payment", icon: CreditCard },
];

const Citizen = () => {
  const { user, loading } = useAuth();

  // 1. Handle Loading State (Prevents flicker on refresh)
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50 text-slate-500">
        Loading...
      </div>
    );

  // 2. Security: Redirect if not logged in or not an admin
  if (!user || user.role !== "citizen") {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-blue-50/40">
      <Sidebar
        navItems={citizenNavItems}
        roleName="Citizen"
        userName={user.full_name}
      />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Citizen;
