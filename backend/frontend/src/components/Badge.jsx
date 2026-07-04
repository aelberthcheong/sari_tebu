const COLOR_MAP = {
    gray: { bg: "var(--color-background-gray)", fg: "var(--color-text-gray)" },
    green: { bg: "var(--color-background-green)", fg: "var(--color-text-green)" },
    red: { bg: "var(--color-background-red)", fg: "var(--color-text-red)" },
    yellow: { bg: "var(--color-background-yellow)", fg: "var(--color-text-yellow)" },
    blue: { bg: "var(--color-background-blue)", fg: "var(--color-text-blue)" },
    orange: { bg: "var(--color-background-orange)", fg: "var(--color-text-orange)" },
    purple: { bg: "var(--color-background-purple)", fg: "var(--color-text-purple)" },
};

/**
 * Badge/label kecil untuk status (mis. "Habis", "Berhasil", dst).
 * Dibuat manual (bukan dari @astryxdesign/core) karena komponen Badge
 * tidak terverifikasi tersedia di versi library yang terpasang, tapi tetap
 * memakai token warna tema yang sama supaya konsisten secara visual.
 */
export function Badge({ label, color = "gray", size = "sm" }) {
    const palette = COLOR_MAP[color] || COLOR_MAP.gray;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: size === "sm" ? "2px 8px" : "4px 10px",
                borderRadius: 999,
                fontSize: size === "sm" ? 12 : 13,
                fontWeight: 600,
                lineHeight: 1.6,
                background: palette.bg,
                color: palette.fg,
                whiteSpace: "nowrap",
            }}>
            {label}
        </span>
    );
}
