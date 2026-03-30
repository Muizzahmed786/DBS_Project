import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Admin from "../pages/Admin.jsx";
import ChallanManagement from '../components/admin/ChallanManagement.jsx';
import AdminDashboard from '../components/admin/AdminDashboard.jsx';
import PaymentManagement from '../components/admin/PaymentManagement.jsx';
import UserManagement from '../components/admin/UserManagement.jsx';
import VehicleManagement from '../components/admin/VehicleManagement.jsx';
import ViolationTypes from '../components/admin/ViolationTypes.jsx';
import Register from "../pages/Register.jsx";
import Login from "../pages/Login.jsx";
import Citizen from "../pages/Citizen.jsx";
import CitizenDashboard from "../components/citizen/CitizenDashboard.jsx";
import Profile from "../components/citizen/Profile.jsx";
import Vehicles from "../components/citizen/Vehicles.jsx";
import Documents from "../components/citizen/Documents.jsx";
import Challans from "../components/citizen/Challans.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<Admin />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="challans" element={<ChallanManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="violations" element={<ViolationTypes />} />
          <Route path="vehicles" element={<VehicleManagement />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
        <Route path="/citizen" element={<Citizen/>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CitizenDashboard />} />
          <Route path="challans" element={<Challans />} />
          <Route path="documents" element={<Documents />} />
          <Route path="profile" element={<Profile />} />
          <Route path="vehicles" element={<Vehicles />} />
        </Route>
      </Route>

    </Routes>
  );
};
export default AppRoutes;