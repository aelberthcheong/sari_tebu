import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
};

const ACCENTS = {
    success: "var(--color-success, #007004)",
    error: "var(--color-error, #a50c25)",
    warning: "var(--color-warning, #745b00)",
    info: "var(--color-icon-blue, #00458c)",
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (message, type = "info", duration = 4000) => {
            const id = ++idRef.current;
            setToasts((prev) => [...prev, { id, message, type }]);
            if (duration > 0) {
                setTimeout(() => dismiss(id), duration);
            }
            return id;
        },
        [dismiss],
    );

    const api = useMemo(
        () => ({
            push,
            dismiss,
            success: (msg, d) => push(msg, "success", d),
            error: (msg, d) => push(msg, "error", d),
            warning: (msg, d) => push(msg, "warning", d),
            info: (msg, d) => push(msg, "info", d),
        }),
        [push, dismiss],
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div
                style={{
                    position: "fixed",
                    top: 16,
                    right: 16,
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    width: "min(360px, calc(100vw - 32px))",
                }}>
                {toasts.map((t) => {
                    const Icon = ICONS[t.type] || InformationCircleIcon;
                    return (
                        <div
                            key={t.id}
                            role="status"
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                                padding: "12px 14px",
                                borderRadius: 10,
                                background: "var(--color-background-surface, #fff)",
                                border: "1px solid var(--color-border, #ebebeb)",
                                borderLeft: `4px solid ${ACCENTS[t.type] || ACCENTS.info}`,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                animation: "toastSlideIn 0.25s ease-out",
                            }}>
                            <Icon
                                style={{
                                    width: 20,
                                    height: 20,
                                    flexShrink: 0,
                                    color: ACCENTS[t.type] || ACCENTS.info,
                                    marginTop: 1,
                                }}
                            />
                            <div
                                style={{
                                    flex: 1,
                                    fontSize: 13.5,
                                    lineHeight: 1.4,
                                    color: "var(--color-text-primary, #171717)",
                                }}>
                                {t.message}
                            </div>
                            <button
                                onClick={() => dismiss(t.id)}
                                aria-label="Tutup notifikasi"
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 2,
                                    color: "var(--color-text-secondary, #737373)",
                                }}>
                                <XMarkIcon style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(16px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
