import { Navigate } from "react-router";

import { useAuth } from "#/context/AuthContext.jsx";

export default function RequireAuth({ children }) {
    const { status } = useAuth();

    if (status === "loading") return null;
    if (status === "unauth") return <Navigate to="/login" replace />;
    return children;
}
