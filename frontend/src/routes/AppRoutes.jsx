import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

import ProtectedRoute from '../components/ProtectedRoute.jsx';

import Dashboard from '../pages/user/Dashboard.jsx';

import Challans from '../pages/citizen/Challans.jsx';
import Documents from '../pages/citizen/Documents.jsx';
import Profile from '../pages/citizen/Profile.jsx';
import Vehicles from '../pages/citizen/Vehicles.jsx';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* Auth */}
                <Route path='/' element={<Login />} />
                <Route path='/register' element={<Register />} />

                {/* Dashboard with nested routes */}
                <Route path='/dashboard' element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }>

                    {/* Default page */}
                    <Route index element={<Challans />} />

                    {/* Citizen features */}
                    <Route path='challans' element={<Challans />} />
                    <Route path='vehicles' element={<Vehicles />} />
                    <Route path='profile' element={<Profile />} />
                    <Route path='documents' element={<Documents />} />

                </Route>

                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;