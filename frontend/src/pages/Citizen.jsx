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
  { to: "/citizen/dashboard", label: "Dashboard",       icon: LayoutDashboard },
  { to: "/citizen/challans",  label: "Challans",         icon: FileText        },
  { to: "/citizen/documents", label: "Documents",        icon: FolderOpen      },
  { to: "/citizen/profile",   label: "Profile",          icon: User            },
  { to: "/citizen/vehicles",  label: "Vehicles",         icon: Car             },
  { to: "/citizen/payments",  label: "Payment History",  icon: FileText        },
  { to: "/citizen/make-payments", label: "Challan Payment", icon: CreditCard   },
];

const Citizen = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#003f87] border-t-transparent animate-spin" />
          <p className="text-[0.875rem] text-[#42454e]">Loading…</p>
        </div>
      </div>
    );

  if (!user || user.role !== "citizen")
    return <Navigate replace to="/login" />;

  return (
    <div className="flex min-h-screen bg-[#f3f4f5]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar navItems={citizenNavItems} roleName="Citizen" userName={user.name} />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Citizen;