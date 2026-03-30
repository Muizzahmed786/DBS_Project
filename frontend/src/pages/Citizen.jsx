import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/useAuth";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  User,
  Car,
} from "lucide-react";

const citizenNavItems = [
  { to: "/citizen/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/citizen/challans",  label: "Challans",  icon: FileText         },
  { to: "/citizen/documents", label: "Documents", icon: FolderOpen       },
  { to: "/citizen/profile",   label: "Profile",   icon: User             },
  { to: "/citizen/vehicles",  label: "Vehicles",  icon: Car              },
  { to: "/citizen/payments",  label: "Payment History",  icon: FileText               },
];

const Citizen = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );

  if (!user || user.role !== "citizen")
    return <Navigate replace to="/login" />;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        navItems={citizenNavItems}
        roleName="Citizen"
        userName={user.name}
      />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Citizen;