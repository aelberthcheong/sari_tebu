import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import RequireAuth from "#/components/RequireAuth.jsx";
import RequireRole from "#/components/RequireRole.jsx";
import RedirectIfAuthed from "#/components/RedirectIfAuthed.jsx";
import { AuthProvider } from "#/context/AuthContext.jsx";
import { ToastProvider } from "#/context/ToastContext.jsx";

import Home from "#/pages/Home.jsx";
import Login from "#/pages/Login.jsx";
import Signup from "#/pages/Signup.jsx";
import ResetPassword from "#/pages/ResetPassword.jsx";
import Dashboard from "#/pages/Dashboard.jsx";
import Pos from "#/pages/Pos.jsx";
import Products from "#/pages/Products.jsx";
import Transactions from "#/pages/Transactions.jsx";
import Settings from "#/pages/Settings.jsx";
import GuestPos from "#/pages/GuestPos.jsx";

export default function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <RedirectIfAuthed>
                                    <Home />
                                </RedirectIfAuthed>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <RedirectIfAuthed>
                                    <Login />
                                </RedirectIfAuthed>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <RedirectIfAuthed>
                                    <Signup />
                                </RedirectIfAuthed>
                            }
                        />
                        <Route
                            path="/reset-password"
                            element={
                                <RedirectIfAuthed>
                                    <ResetPassword />
                                </RedirectIfAuthed>
                            }
                        />

                        <Route path="/guest" element={<GuestPos />} />

                        <Route
                            path="/dashboard"
                            element={
                                <RequireAuth>
                                    <RequireRole allowedRoles={["OWNER", "ADMIN"]}>
                                        <Dashboard />
                                    </RequireRole>
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/pos"
                            element={
                                <RequireAuth>
                                    <Pos />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/products"
                            element={
                                <RequireAuth>
                                    <RequireRole allowedRoles={["OWNER", "ADMIN"]}>
                                        <Products />
                                    </RequireRole>
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/transactions"
                            element={
                                <RequireAuth>
                                    <Transactions />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <RequireAuth>
                                    <Settings />
                                </RequireAuth>
                            }
                        />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}
