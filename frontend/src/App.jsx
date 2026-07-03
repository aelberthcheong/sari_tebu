import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import RequireAuth from "#/components/RequireAuth.jsx";
import Dashboard from "#/pages/Dashboard.jsx";
import Login from "#/pages/Login.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <RequireAuth>
                            <Dashboard />
                        </RequireAuth>
                    }
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
