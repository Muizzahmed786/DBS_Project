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
import OfficerDashboard from "../components/officer/OfficerDashboard.jsx";
import IssueChallan from "../components/officer/IssueChallan.jsx";
import IssueLicence from "../components/officer/IssueLicence.jsx";
import GetIssuedChallans from "../components/officer/GetIssuedChallans.jsx";
import ViolationTypesOfficer from "../components/officer/ViolationTypes.jsx";
import Officer from "../pages/Officer.jsx";
import PaymentHistory from "../components/citizen/PaymentHistory.jsx";
import AllRtoOffices from "../components/admin/AllRtoOffices.jsx";
import AddRtoOffice from "../components/admin/AddRtoOffice.jsx";
import AddViolationType from "../components/admin/AddViolationType.jsx";
import ChallanPayment from "../components/citizen/ChallanPayment.jsx";
import DocumentManagement from "../components/officer/DocumentManagement.jsx"
import AuditLogs from "../components/admin/AuditLogs.jsx"
import DeleteAuditLogs from "../components/admin/DeleteAuditLogs.jsx";
import AddUsers from "../components/admin/AddUsers.jsx";
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
          <Route path="offices" element={<AllRtoOffices />} />
          <Route path="add-office" element={<AddRtoOffice />} />
          <Route path="add-violation-type" element={<AddViolationType />} />
          <Route path="logs" element={<AuditLogs />} />
          <Route path="delete-logs" element={<DeleteAuditLogs />} />
          <Route path="add-users" element={<AddUsers />} />
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
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="make-payments" element={<ChallanPayment />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
        <Route path="/officer" element={<Officer/>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OfficerDashboard />} />
          <Route path="challans" element={<GetIssuedChallans />} />
          <Route path="violations" element={<ViolationTypesOfficer />} />
          <Route path="issue-challan" element={<IssueChallan/>} />
          <Route path="issue-licence" element={<IssueLicence />} />
          <Route path="citizen-documents" element={<DocumentManagement />} />
        </Route>
      </Route>
    </Routes>
  );
};
export default AppRoutes;