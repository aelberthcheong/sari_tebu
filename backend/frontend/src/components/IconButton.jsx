/**
 * Tombol kecil berisi ikon saja, dipakai untuk kontrol seperti +/- kuantitas.
 * Dibuat manual (bukan lewat @astryxdesign/core/Button) karena prop `icon`
 * pada Button belum terverifikasi tersedia di versi library terpasang.
 */
export function IconButton({
    icon: IconComp,
    onClick,
    disabled = false,
    isLoading = false,
    variant = "secondary",
    "aria-label": ariaLabel,
}) {
    const isGhost = variant === "ghost";
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || isLoading}
            aria-label={ariaLabel}
            style={{
                width: 32,
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                border: isGhost ? "none" : "1px solid var(--color-border-emphasized)",
                background: isGhost ? "transparent" : "var(--color-background-surface)",
                color: isGhost
                    ? "var(--color-error, #a50c25)"
                    : "var(--color-text-primary)",
                cursor: disabled || isLoading ? "not-allowed" : "pointer",
                opacity: disabled || isLoading ? 0.5 : 1,
                flexShrink: 0,
                transition: "background 0.15s ease",
            }}>
            {IconComp && <IconComp style={{ width: 16, height: 16 }} />}
        </button>
    );
}
