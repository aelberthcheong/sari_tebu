import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "#/lib/api.js";

const AuthContext = createContext(null);

const GUEST_FLAG_KEY = "saritebu:guestMode";

/**
 * Menyediakan status sesi login ke seluruh aplikasi. Backend memakai
 * httpOnly cookie, jadi satu-satunya cara mengetahui status login adalah
 * memanggil `GET /api/auth` dan melihat apakah berhasil (200) atau tidak.
 *
 * Selain itu context ini juga menyediakan "Guest Mode": mode coba-coba yang
 * TIDAK menghubungi backend sama sekali, dan hanya memakai data dummy di
 * sisi frontend (lihat #/lib/guestData.js dan halaman GuestPos).
 */
export function AuthProvider({ children }) {
    const [status, setStatus] = useState("loading"); // loading | auth | unauth
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(
        () => sessionStorage.getItem(GUEST_FLAG_KEY) === "1",
    );

    const refresh = useCallback(async () => {
        try {
            const data = await authApi.current();
            setSession(data?.data?.session ?? null);
            setUser(data?.data?.user ?? null);
            setStatus("auth");
            return true;
        } catch {
            setSession(null);
            setUser(null);
            setStatus("unauth");
            return false;
        }
    }, []);

    useEffect(() => {
        // Kalau sedang guest mode, tidak perlu tanya backend soal status login.
        if (isGuest) return;
        refresh();
    }, [refresh, isGuest]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setSession(null);
            setUser(null);
            setStatus("unauth");
        }
    }, []);

    const enterGuestMode = useCallback(() => {
        sessionStorage.setItem(GUEST_FLAG_KEY, "1");
        setIsGuest(true);
    }, []);

    const exitGuestMode = useCallback(() => {
        sessionStorage.removeItem(GUEST_FLAG_KEY);
        setIsGuest(false);
    }, []);

    const value = useMemo(
        () => ({
            status,
            session,
            user,
            role: user?.role ?? null,
            refresh,
            logout,
            isGuest,
            enterGuestMode,
            exitGuestMode,
        }),
        [status, session, user, refresh, logout, isGuest, enterGuestMode, exitGuestMode],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
