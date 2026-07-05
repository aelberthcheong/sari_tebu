import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import {
    ShoppingCartIcon,
    ArchiveBoxIcon,
    ClipboardDocumentListIcon,
    ShieldCheckIcon,
    BoltIcon,
    ChartBarIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "#/context/AuthContext.jsx";

const FEATURES = [
    {
        icon: ShoppingCartIcon,
        title: "Kasir Cepat (POS)",
        description:
            "Tambahkan produk ke keranjang, atur jumlah, dan proses checkout hanya dalam beberapa klik.",
    },
    {
        icon: ArchiveBoxIcon,
        title: "Manajemen Produk",
        description:
            "Kelola katalog produk, harga, dan stok secara real-time dengan peringatan stok menipis.",
    },
    {
        icon: ClipboardDocumentListIcon,
        title: "Riwayat Transaksi",
        description:
            "Pantau seluruh transaksi yang sudah selesai lengkap dengan rincian struk digital.",
    },
    {
        icon: ShieldCheckIcon,
        title: "Keamanan Akun Berlapis",
        description:
            "Verifikasi email, sesi login aman, serta alur konfirmasi untuk ubah password dan email.",
    },
    {
        icon: BoltIcon,
        title: "Update Stok Otomatis",
        description:
            "Stok produk otomatis berkurang setiap kali transaksi berhasil diproses.",
    },
    {
        icon: ChartBarIcon,
        title: "Ringkasan Penjualan",
        description:
            "Lihat total transaksi dan total pendapatan langsung dari dashboard riwayat.",
    },
];

const NAV_HEIGHT = 64;

function TopBar({ onLogin, onSignup }) {
    return (
        <div
            style={{
                height: NAV_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-background-surface)",
                position: "sticky",
                top: 0,
                zIndex: 10,
            }}>
            <HStack gap={2} vAlign="center">
                <GlobeAltIcon style={{ width: 22, height: 22 }} />
                <Text type="body" weight="bold">
                    Sari Tebu
                </Text>
            </HStack>
            <HStack gap={2}>
                <Button label="Masuk" variant="secondary" size="md" onClick={onLogin} />
                <Button label="Daftar" variant="primary" size="md" onClick={onSignup} />
            </HStack>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const { status } = useAuth();
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        if (status !== "loading") setCheckingSession(false);
    }, [status]);

    if (checkingSession) return null;

    return (
        <div style={{ minHeight: "100%", background: "var(--color-background-body)" }}>
            <TopBar
                onLogin={() => navigate("/login")}
                onSignup={() => navigate("/signup")}
            />

            {/* Hero */}
            <div style={{ padding: "72px 24px 56px", textAlign: "center" }}>
                <VStack gap={4} hAlign="center" style={{ maxWidth: 680, margin: "0 auto" }}>
                    <div style={{ fontSize: 40, lineHeight: 1.15 }}>
                        <Text type="display-1" as="h1">
                            Sistem Kasir Modern untuk Bisnis Minuman Tebu Kamu
                        </Text>
                    </div>
                    <Text type="body" color="secondary" size="lg">
                        Sari Tebu membantu kamu mengelola produk, transaksi, dan stok
                        dalam satu aplikasi kasir yang cepat, aman, dan mudah digunakan.
                    </Text>
                </VStack>
            </div>

            {/* Cover image */}
            <div style={{ maxWidth: 960, margin: "0 auto 56px", padding: "0 24px" }}>
                <Card padding={0} width="100%">
                    <img
                        src="/tebu.jpg"
                        alt="Ladang tebu"
                        style={{
                            width: "100%",
                            maxHeight: 340,
                            objectFit: "cover",
                            display: "block",
                            borderRadius: "inherit",
                        }}
                    />
                </Card>
            </div>

            {/* Fitur */}
            <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 80px" }}>
                <VStack gap={2} hAlign="center" style={{ marginBottom: 32 }}>
                    <Text type="display-1" as="h2">
                        Semua yang kamu butuhkan untuk berjualan
                    </Text>
                    <Text type="body" color="secondary">
                        Fitur lengkap yang dirancang untuk mempercepat operasional harian toko.
                    </Text>
                </VStack>

                <Grid columns={{ minWidth: 260, repeat: "fit" }} gap={5}>
                    {FEATURES.map((feature) => (
                        <div key={feature.title} style={{ height: "100%" }}>
                            <Card padding={5} width="100%">
                            <VStack gap={3} hAlign="stretch">
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "var(--color-accent-muted)",
                                    }}>
                                    <feature.icon style={{ width: 22, height: 22 }} />
                                </div>
                                <Text type="body" weight="bold">
                                    {feature.title}
                                </Text>
                                <Text type="supporting" color="secondary">
                                    {feature.description}
                                </Text>
                            </VStack>
                            </Card>
                        </div>
                    ))}
                </Grid>
            </div>

            {/* CTA bawah */}
            <div
                style={{
                    borderTop: "1px solid var(--color-border)",
                    padding: "48px 24px",
                    textAlign: "center",
                }}>
                <VStack gap={3} hAlign="center">
                    <Text type="display-1" as="h2">
                        Siap mulai berjualan lebih cepat?
                    </Text>
                    <Button
                        label="Buat Akun Sekarang"
                        variant="primary"
                        size="lg"
                        onClick={() => navigate("/signup")}
                    />
                </VStack>
            </div>
        </div>
    );
}
