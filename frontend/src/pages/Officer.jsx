import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/useAuth";

import {
  LayoutDashboard,
  FileWarning,
  FilePlus,
  CreditCard,
  Settings,
  File,
} from "lucide-react";

// 🔹 Officer Sidebar Items
const officerNavItems = [
  { to: "/officer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/officer/issue-challan", label: "Issue Challan", icon: FilePlus },
  { to: "/officer/issue-licence", label: "Issue Licence", icon: CreditCard },
  { to: "/officer/challans", label: "My Challans", icon: FileWarning },
  { to: "/officer/violations", label: "Violation Types", icon: Settings },
  {
    to: "/officer/citizen-documents",
    label: "Document Management",
    icon: File,
  },
];

const OfficerLayout = () => {
  const { user, loading } = useAuth();

  // 1. Handle Loading State (Prevents flicker on refresh)
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50 text-slate-500">
        Loading...
      </div>
    );

  // 2. Security: Redirect if not logged in or not an admin
  if (!user || user.role !== "officer") {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-blue-50/40">
      {/* Sidebar gets the config and the specific Admin name if needed */}
      <Sidebar
        navItems={officerNavItems}
        roleName="Officer"
        userName={user.name}
      />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default OfficerLayout;
