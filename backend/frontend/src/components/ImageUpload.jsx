import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";

/**
 * Mengubah file gambar menjadi data URL base64 yang sudah diperkecil ukurannya
 * (di-resize maksimal `maxDimension` px dan dikompres ke JPEG) supaya ukuran
 * payload tetap kecil saat dikirim & disimpan sebagai teks di database.
 */
function resizeAndCompressImage(file, { maxDimension = 640, quality = 0.8 } = {}) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error("File bukan gambar yang valid."));
            img.onload = () => {
                let { width, height } = img;
                if (width > maxDimension || height > maxDimension) {
                    const scale = maxDimension / Math.max(width, height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Komponen upload & preview gambar produk. Menyimpan hasil sebagai data URL
 * base64 lewat `onChange(dataUrl | null)`.
 */
export function ImageUpload({ value, onChange, size = 120, label = "Foto Produk" }) {
    const inputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("File harus berupa gambar (PNG, JPG, atau WEBP).");
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            setError("Ukuran file terlalu besar. Maksimal 8MB.");
            return;
        }
        setError("");
        setIsProcessing(true);
        try {
            const dataUrl = await resizeAndCompressImage(file);
            onChange(dataUrl);
        } catch (err) {
            setError(err.message || "Gagal memproses gambar.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>
                {label}
            </div>
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFile(e.dataTransfer.files?.[0]);
                }}
                style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
                <div
                    onClick={() => inputRef.current?.click()}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: 12,
                        border: `2px dashed ${isDragging ? "var(--color-accent)" : "var(--color-border-emphasized)"}`,
                        background: value ? "transparent" : "var(--color-background-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        flexShrink: 0,
                        transition: "border-color 0.15s, transform 0.1s",
                    }}
                    title="Klik atau seret gambar ke sini"
                >
                    {isProcessing ? (
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Memproses…</span>
                    ) : value ? (
                        <img
                            src={value}
                            alt="Pratinjau produk"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <PhotoIcon style={{ width: 28, height: 28, color: "var(--color-text-secondary)", opacity: 0.6 }} />
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 12px",
                            borderRadius: 8,
                            border: "1px solid var(--color-border)",
                            background: "var(--color-background-surface)",
                            color: "var(--color-text-primary)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        <ArrowUpTrayIcon style={{ width: 14, height: 14 }} />
                        {value ? "Ganti Gambar" : "Unggah Gambar"}
                    </button>
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 12px",
                                borderRadius: 8,
                                border: "1px solid transparent",
                                background: "transparent",
                                color: "var(--color-text-secondary)",
                                fontSize: 13,
                                cursor: "pointer",
                            }}
                        >
                            <XMarkIcon style={{ width: 14, height: 14 }} />
                            Hapus Gambar
                        </button>
                    )}
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                        PNG, JPG, atau WEBP. Maks 8MB.
                    </span>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => handleFile(e.target.files?.[0])}
                style={{ display: "none" }}
            />

            {error && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-error, #d33)" }}>
                    {error}
                </div>
            )}
        </div>
    );
}

/** Placeholder ikon produk generik dipakai saat produk belum punya gambar. */
export function ProductImage({ src, alt, size = 40, radius = 10 }) {
    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                style={{
                    width: size,
                    height: size,
                    borderRadius: radius,
                    objectFit: "cover",
                    flexShrink: 0,
                    background: "var(--color-background-muted)",
                }}
            />
        );
    }
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: radius,
                background: "var(--color-background-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <PhotoIcon style={{ width: size * 0.5, height: size * 0.5, color: "var(--color-text-secondary)", opacity: 0.5 }} />
        </div>
    );
}
