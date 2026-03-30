import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/useAuth";

import {
  LayoutDashboard,
  FileWarning,
  FilePlus,
  CreditCard,
  Settings
} from "lucide-react";

// 🔹 Officer Sidebar Items
const officerNavItems = [
  { to: "/officer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/officer/issue-challan", label: "Issue Challan", icon: FilePlus },
  { to: "/officer/issue-licence", label: "Issue Licence", icon: CreditCard },
  { to: "/officer/challans", label: "My Challans", icon: FileWarning },
  { to: "/officer/violations", label: "Violation Types", icon: Settings },
];

const OfficerLayout = () => {
  const { user, loading } = useAuth();

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  // 🔹 Security check
  if (!user || user.role !== "officer") {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      
      {/* Sidebar */}
      <Sidebar
        navItems={officerNavItems}
        roleName="Officer"
        userName={user.full_name} // adjust if your field is different
      />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default OfficerLayout;