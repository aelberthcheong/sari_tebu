import { Navigate } from "react-router";

import { useAuth } from "#/context/AuthContext.jsx";

/**
 * Dipakai di halaman publik (login, signup, reset password) supaya
 * pengguna yang sudah login otomatis diarahkan ke halaman kasir,
 * alih-alih melihat form login lagi.
 */
export default function RedirectIfAuthed({ children }) {
    const { status } = useAuth();

    if (status === "loading") return null;
    if (status === "auth") return <Navigate to="/pos" replace />;
    return children;
}
