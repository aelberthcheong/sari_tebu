import { Navigate } from "react-router";

import { useAuth } from "#/context/AuthContext.jsx";

/**
 * Membatasi akses halaman berdasarkan role user yang sedang login.
 * HARUS dipakai di dalam <RequireAuth> supaya `status` sudah pasti "auth"
 * dan `role` sudah terisi.
 *
 * Kalau role user tidak termasuk `allowedRoles`, user diarahkan ke /pos
 * (halaman yang semua role pasti punya akses ke sana).
 *
 * @example
 * ```jsx
 * <RequireAuth>
 *   <RequireRole allowedRoles={["OWNER", "ADMIN"]}>
 *     <Products />
 *   </RequireRole>
 * </RequireAuth>
 * ```
 */
export default function RequireRole({ allowedRoles, children }) {
    const { status, role } = useAuth();

    // Masih menunggu status auth selesai dicek (biasanya sudah ditangani oleh
    // RequireAuth di luar komponen ini, tapi dijaga lagi untuk keamanan).
    if (status === "loading") return null;

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/pos" replace />;
    }

    return children;
}
