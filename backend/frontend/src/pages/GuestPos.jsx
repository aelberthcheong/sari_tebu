import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import {
    ShoppingCartIcon,
    PlusIcon,
    MinusIcon,
    TrashIcon,
    GlobeAltIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Badge } from "#/components/Badge.jsx";
import { IconButton } from "#/components/IconButton.jsx";
import { useAuth } from "#/context/AuthContext.jsx";
import { GUEST_PRODUCTS } from "#/lib/guestData.js";

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function GuestTopBar({ onExit }) {
    return (
        <div
            style={{
                height: 64,
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
                <Badge label="Mode Tamu (Preview)" color="orange" />
            </HStack>
            <HStack gap={2}>
                <Button label="Keluar dari Mode Tamu" variant="secondary" size="md" onClick={onExit} />
            </HStack>
        </div>
    );
}

/**
 * Halaman POS khusus untuk Guest Mode.
 *
 * PENTING: halaman ini TIDAK melakukan panggilan apapun ke backend (tidak ada
 * fetch/api.js). Semua produk, keranjang, dan transaksi hanya berupa data
 * dummy yang hidup di state React lokal, supaya calon pengguna bisa
 * "merasakan" alur kasir sebelum benar-benar mendaftar.
 */
export default function GuestPos() {
    const navigate = useNavigate();
    const { exitGuestMode } = useAuth();
    const [cart, setCart] = useState({}); // { [productId]: quantity }
    const [checkoutDone, setCheckoutDone] = useState(false);

    const cartItems = useMemo(() => {
        return Object.entries(cart)
            .map(([productId, quantity]) => {
                const product = GUEST_PRODUCTS.find((p) => p.id === productId);
                if (!product) return null;
                return { product, quantity };
            })
            .filter(Boolean);
    }, [cart]);

    const total = cartItems.reduce(
        (sum, { product, quantity }) => sum + product.price * quantity,
        0,
    );

    const addToCart = (product) => {
        setCheckoutDone(false);
        setCart((prev) => {
            const current = prev[product.id] ?? 0;
            if (current >= product.stock) return prev;
            return { ...prev, [product.id]: current + 1 };
        });
    };

    const changeQty = (productId, delta) => {
        setCheckoutDone(false);
        setCart((prev) => {
            const current = prev[productId] ?? 0;
            const next = current + delta;
            if (next <= 0) {
                const { [productId]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: next };
        });
    };

    const removeFromCart = (productId) => {
        setCart((prev) => {
            const { [productId]: _removed, ...rest } = prev;
            return rest;
        });
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        setCheckoutDone(true);
        setCart({});
    };

    const handleExit = () => {
        exitGuestMode();
        navigate("/");
    };

    return (
        <div style={{ minHeight: "100%", background: "var(--color-background-body)" }}>
            <GuestTopBar onExit={handleExit} />

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
                <VStack gap={1} style={{ marginBottom: 20 }}>
                    <Text type="display-1" as="h1">
                        Kasir (Preview)
                    </Text>
                    <Text type="body" color="secondary">
                        Ini adalah simulasi menggunakan data contoh. Belum ada data yang
                        tersimpan ke server — buat akun untuk mulai berjualan sungguhan.
                    </Text>
                </VStack>

                <Grid columns={{ minWidth: 320, repeat: "fit" }} gap={5} align="start">
                    {/* Katalog produk dummy */}
                    <div style={{ gridColumn: "span 2" }}>
                        <Grid columns={{ minWidth: 180, repeat: "fit" }} gap={3}>
                            {GUEST_PRODUCTS.map((product) => {
                                const outOfStock = product.stock <= 0;
                                const inCart = cart[product.id] ?? 0;
                                const atLimit = inCart >= product.stock;
                                return (
                                    <div
                                        key={product.id}
                                        style={{
                                            cursor: outOfStock || atLimit ? "not-allowed" : "pointer",
                                            opacity: outOfStock ? 0.55 : 1,
                                        }}
                                        onClick={() =>
                                            !outOfStock && !atLimit && addToCart(product)
                                        }>
                                        <Card padding={4} width="100%">
                                            <VStack gap={2}>
                                                <Text type="body" weight="bold">
                                                    {product.name}
                                                </Text>
                                                <Text type="body" color="secondary">
                                                    {formatRupiah(product.price)}
                                                </Text>
                                                {outOfStock ? (
                                                    <Badge label="Stok habis" color="red" />
                                                ) : (
                                                    <Text type="supporting" color="secondary">
                                                        Stok: {product.stock}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Card>
                                    </div>
                                );
                            })}
                        </Grid>
                    </div>

                    {/* Keranjang */}
                    <Card padding={4} width="100%">
                        <VStack gap={3} hAlign="stretch">
                            <HStack gap={2} vAlign="center">
                                <ShoppingCartIcon style={{ width: 20, height: 20 }} />
                                <Text type="body" weight="bold">
                                    Keranjang
                                </Text>
                            </HStack>

                            {cartItems.length === 0 && !checkoutDone && (
                                <Text type="supporting" color="secondary">
                                    Klik produk di sebelah kiri untuk menambah ke keranjang.
                                </Text>
                            )}

                            {checkoutDone && (
                                <VStack gap={2} hAlign="center" style={{ padding: "12px 0" }}>
                                    <SparklesIcon style={{ width: 28, height: 28 }} />
                                    <Text type="body" weight="bold">
                                        Transaksi contoh berhasil!
                                    </Text>
                                    <Text type="supporting" color="secondary">
                                        Di aplikasi sungguhan, struk & stok akan otomatis
                                        tersimpan.
                                    </Text>
                                </VStack>
                            )}

                            {cartItems.map(({ product, quantity }) => (
                                <HStack
                                    key={product.id}
                                    gap={2}
                                    vAlign="center"
                                    style={{ justifyContent: "space-between" }}>
                                    <VStack gap={0}>
                                        <Text type="supporting" weight="bold">
                                            {product.name}
                                        </Text>
                                        <Text type="supporting" color="secondary">
                                            {formatRupiah(product.price)} x {quantity}
                                        </Text>
                                    </VStack>
                                    <HStack gap={1} vAlign="center">
                                        <IconButton
                                            icon={MinusIcon}
                                            aria-label="Kurangi jumlah"
                                            onClick={() => changeQty(product.id, -1)}
                                        />
                                        <Text type="supporting">{quantity}</Text>
                                        <IconButton
                                            icon={PlusIcon}
                                            aria-label="Tambah jumlah"
                                            onClick={() => changeQty(product.id, 1)}
                                            disabled={quantity >= product.stock}
                                        />
                                        <IconButton
                                            icon={TrashIcon}
                                            aria-label="Hapus dari keranjang"
                                            variant="ghost"
                                            onClick={() => removeFromCart(product.id)}
                                        />
                                    </HStack>
                                </HStack>
                            ))}

                            {cartItems.length > 0 && (
                                <>
                                    <HStack style={{ justifyContent: "space-between" }}>
                                        <Text type="body" weight="bold">
                                            Total
                                        </Text>
                                        <Text type="body" weight="bold">
                                            {formatRupiah(total)}
                                        </Text>
                                    </HStack>
                                    <Button
                                        label="Checkout (Simulasi)"
                                        variant="primary"
                                        size="lg"
                                        onClick={handleCheckout}
                                    />
                                </>
                            )}
                        </VStack>
                    </Card>
                </Grid>

                <div style={{ marginTop: 32, textAlign: "center" }}>
                    <Card padding={5} width="100%">
                        <VStack gap={3} hAlign="center">
                            <Text type="body" weight="bold">
                                Suka dengan tampilannya?
                            </Text>
                            <Text type="supporting" color="secondary">
                                Buat akun untuk menyimpan produk, transaksi, dan laporan
                                penjualan sungguhan.
                            </Text>
                            <HStack gap={2}>
                                <Button
                                    label="Buat Akun"
                                    variant="primary"
                                    onClick={() => {
                                        exitGuestMode();
                                        navigate("/signup");
                                    }}
                                />
                                <Button
                                    label="Masuk"
                                    variant="secondary"
                                    onClick={() => {
                                        exitGuestMode();
                                        navigate("/login");
                                    }}
                                />
                            </HStack>
                        </VStack>
                    </Card>
                </div>
            </div>
        </div>
    );
}
