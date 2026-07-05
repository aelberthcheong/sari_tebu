import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "#/lib/api.js";

const AuthContext = createContext(null);

/**
 * Menyediakan status sesi login ke seluruh aplikasi. Backend memakai
 * httpOnly cookie, jadi satu-satunya cara mengetahui status login adalah
 * memanggil `GET /api/auth` dan melihat apakah berhasil (200) atau tidak.
 */
export function AuthProvider({ children }) {
    const [status, setStatus] = useState("loading"); // loading | auth | unauth
    const [session, setSession] = useState(null);

    const refresh = useCallback(async () => {
        try {
            const data = await authApi.current();
            setSession(data?.data?.session ?? null);
            setStatus("auth");
            return true;
        } catch {
            setSession(null);
            setStatus("unauth");
            return false;
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setSession(null);
            setStatus("unauth");
        }
    }, []);

    const value = useMemo(
        () => ({ status, session, refresh, logout }),
        [status, session, refresh, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
