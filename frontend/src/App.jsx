import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import RequireAuth from "#/components/RequireAuth.jsx";
import Dashboard from "#/pages/Dashboard.jsx";
import Login from "#/pages/Login.jsx";
import ResetPassword from "#/pages/ResetPassword.jsx";
import Signup from "#/pages/Signup.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                    path="/dashboard"
                    element={
                        <RequireAuth>
                            <Dashboard />
                        </RequireAuth>
                    }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
