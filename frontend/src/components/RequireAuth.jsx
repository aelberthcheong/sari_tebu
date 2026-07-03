import { useEffect, useState } from "react";
import { Navigate } from "react-router";

export default function RequireAuth({ children }) {
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        fetch("/api/auth-sessions", { credentials: "include" })
            .then((res) => setStatus(res.ok ? "auth" : "unauth"))
            .catch(() => setStatus("unauth"));
    }, []);

    if (status === "loading") return null; // or a spinner
    if (status === "unauth") return <Navigate to="/login" replace />;
    return children;
}
