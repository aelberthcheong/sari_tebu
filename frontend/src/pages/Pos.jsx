import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import {
    ShoppingCartIcon,
    PlusIcon,
    MinusIcon,
    TrashIcon,
    CubeIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import AppLayout from "#/layouts/AppLayout.jsx";
import { Badge } from "#/components/Badge.jsx";
import { IconButton } from "#/components/IconButton.jsx";
import { cartsApi, productsApi, transactionsApi, ApiError } from "#/lib/api.js";
import { useToast } from "#/context/ToastContext.jsx";

const CART_ID_STORAGE_KEY = "saritebu:activeCartId";

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function ProductCard({ product, quantityInCart, onAdd, isBusy }) {
    const outOfStock = product.stock <= 0;
    const atStockLimit = quantityInCart >= product.stock;

    return (
        <div style={{ height: "100%" }}>
            <Card padding={4} width="100%">
                <VStack gap={3} hAlign="stretch" style={{ height: "100%" }}>
                <HStack vAlign="center" gap={2}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--color-accent-muted)",
                            flexShrink: 0,
                        }}>
                        <Icon icon={CubeIcon} />
                    </div>
                    <VStack gap={0} style={{ minWidth: 0 }}>
                        <div
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}>
                            <Text type="body" weight="bold">
                                {product.name}
                            </Text>
                        </div>
                        <Text type="supporting" color="secondary" size="sm">
                            Stok: {product.stock}
                        </Text>
                    </VStack>
                </HStack>

                <HStack style={{ justifyContent: "space-between", flex: 1 }} vAlign="end">
                    <Text type="display-1" as="span">
                        {formatRupiah(product.price)}
                    </Text>
                    {outOfStock ? (
                        <Badge color="red" label="Habis" />
                    ) : quantityInCart > 0 ? (
                        <Badge color="green" label={`${quantityInCart} di keranjang`} />
                    ) : null}
                </HStack>

                <Button
                    label={outOfStock ? "Stok habis" : "+ Tambah ke keranjang"}
                    variant="primary"
                    size="md"
                    isLoading={isBusy}
                    disabled={outOfStock || atStockLimit}
                    onClick={() => onAdd(product)}
                />
            </VStack>
            </Card>
        </div>
    );
}

function CartLine({ item, onIncrease, onDecrease, onRemove, isBusy }) {
    const product = item.product;
    const lineTotal = (product?.price ?? 0) * item.quantity;

    return (
        <div
            style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--color-border)",
            }}>
            <VStack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                    <Text type="body" weight="medium">
                        {product?.name ?? "Produk tidak diketahui"}
                    </Text>
                </div>
                <Text type="supporting" color="secondary" size="sm">
                    {formatRupiah(product?.price)} × {item.quantity}
                </Text>
            </VStack>

            <HStack gap={1} vAlign="center">
                <IconButton
                    icon={MinusIcon}
                    isLoading={isBusy}
                    onClick={() => onDecrease(item)}
                    aria-label="Kurangi jumlah"
                />
                <span style={{ minWidth: 20, textAlign: "center" }}>
                    <Text type="body">{item.quantity}</Text>
                </span>
                <IconButton
                    icon={PlusIcon}
                    isLoading={isBusy}
                    disabled={product && item.quantity >= product.stock}
                    onClick={() => onIncrease(item)}
                    aria-label="Tambah jumlah"
                />
                <IconButton
                    icon={TrashIcon}
                    variant="ghost"
                    isLoading={isBusy}
                    onClick={() => onRemove(item)}
                    aria-label="Hapus dari keranjang"
                />
            </HStack>

            <span style={{ minWidth: 90, textAlign: "right", display: "inline-block" }}>
                <Text type="body" weight="bold">
                    {formatRupiah(lineTotal)}
                </Text>
            </span>
        </div>
    );
}

export default function Pos() {
    const toast = useToast();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [cart, setCart] = useState(null);
    const [loadingCart, setLoadingCart] = useState(true);
    const [busyProductId, setBusyProductId] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [lastReceipt, setLastReceipt] = useState(null);

    /* -------------------------- Produk -------------------------- */

    const loadProducts = useCallback(async (name) => {
        setLoadingProducts(true);
        try {
            const data = await productsApi.list(name);
            setProducts(data?.data?.products ?? []);
        } catch (err) {
            toast.error(
                err instanceof ApiError ? err.message : "Gagal memuat produk.",
            );
        } finally {
            setLoadingProducts(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => loadProducts(search), 300);
        return () => clearTimeout(timer);
    }, [search, loadProducts]);

    /* -------------------------- Keranjang -------------------------- */

    const ensureCart = useCallback(async () => {
        const storedId = localStorage.getItem(CART_ID_STORAGE_KEY);
        if (storedId) {
            try {
                const data = await cartsApi.get(storedId);
                return data.data;
            } catch {
                localStorage.removeItem(CART_ID_STORAGE_KEY);
            }
        }
        const created = await cartsApi.create();
        localStorage.setItem(CART_ID_STORAGE_KEY, created.data.id);
        return { ...created.data, items: [] };
    }, []);

    const loadCart = useCallback(async () => {
        setLoadingCart(true);
        try {
            const activeCart = await ensureCart();
            setCart(activeCart);
        } catch (err) {
            toast.error(
                err instanceof ApiError
                    ? err.message
                    : "Gagal menyiapkan keranjang belanja.",
            );
        } finally {
            setLoadingCart(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ensureCart]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const refreshCart = useCallback(async () => {
        if (!cart?.id) return;
        try {
            const data = await cartsApi.get(cart.id);
            setCart(data.data);
        } catch {
            localStorage.removeItem(CART_ID_STORAGE_KEY);
            await loadCart();
        }
    }, [cart?.id, loadCart]);

    const cartQuantityByProduct = useMemo(() => {
        const map = new Map();
        for (const item of cart?.items ?? []) {
            map.set(item.product_id, item.quantity);
        }
        return map;
    }, [cart]);

    const handleAddToCart = async (product) => {
        if (!cart?.id) return;
        setBusyProductId(product.id);
        try {
            await cartsApi.addItem(cart.id, product.id, 1);
            await refreshCart();
            toast.success(`${product.name} ditambahkan ke keranjang.`);
        } catch (err) {
            toast.error(
                err instanceof ApiError ? err.message : "Gagal menambah item.",
            );
        } finally {
            setBusyProductId(null);
        }
    };

    const handleIncrease = async (item) => {
        if (!cart?.id) return;
        setBusyProductId(item.product_id);
        try {
            // NOTE: sengaja memakai addItem (bukan updateItem) untuk menambah
            // kuantitas. Endpoint PATCH /carts/:cartId/items/:productId di
            // backend saat ini memiliki bug (`req.parmas` alih-alih
            // `req.params`) yang membuatnya selalu gagal dengan error 500.
            // `addItem` memakai upsert dengan increment sehingga hasilnya
            // sama (menambah 1 ke kuantitas yang sudah ada) tanpa terkena
            // bug tersebut.
            await cartsApi.addItem(cart.id, item.product_id, 1);
            await refreshCart();
        } catch (err) {
            toast.error(
                err instanceof ApiError ? err.message : "Gagal memperbarui jumlah.",
            );
        } finally {
            setBusyProductId(null);
        }
    };

    const handleDecrease = async (item) => {
        if (!cart?.id) return;
        setBusyProductId(item.product_id);
        try {
            if (item.quantity <= 1) {
                await cartsApi.removeItem(cart.id, item.product_id);
            } else {
                // NOTE: sama seperti handleIncrease, endpoint PATCH item
                // (updateItem) di backend memiliki bug dan selalu gagal.
                // Sebagai gantinya kita hapus lalu tambahkan ulang dengan
                // kuantitas baru memakai endpoint yang berfungsi normal.
                await cartsApi.removeItem(cart.id, item.product_id);
                await cartsApi.addItem(cart.id, item.product_id, item.quantity - 1);
            }
            await refreshCart();
        } catch (err) {
            toast.error(
                err instanceof ApiError ? err.message : "Gagal memperbarui jumlah.",
            );
        } finally {
            setBusyProductId(null);
        }
    };

    const handleRemove = async (item) => {
        if (!cart?.id) return;
        setBusyProductId(item.product_id);
        try {
            await cartsApi.removeItem(cart.id, item.product_id);
            await refreshCart();
            toast.info("Item dihapus dari keranjang.");
        } catch (err) {
            toast.error(
                err instanceof ApiError ? err.message : "Gagal menghapus item.",
            );
        } finally {
            setBusyProductId(null);
        }
    };

    const cartTotal = useMemo(() => {
        return (cart?.items ?? []).reduce(
            (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
            0,
        );
    }, [cart]);

    const cartItemCount = useMemo(
        () => (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
        [cart],
    );

    const handleCheckout = async () => {
        if (!cart?.id || (cart.items ?? []).length === 0) return;
        setIsCheckingOut(true);
        try {
            const data = await transactionsApi.checkout(cart.id);
            setLastReceipt({ ...data.data, items: cart.items, total: cartTotal });
            localStorage.removeItem(CART_ID_STORAGE_KEY);
            toast.success("Transaksi berhasil! Keranjang baru sudah disiapkan.");
            await loadProducts(search);
            await loadCart();
        } catch (err) {
            toast.error(
                err instanceof ApiError
                    ? err.message
                    : "Checkout gagal. Silakan coba lagi.",
            );
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <AppLayout title="Kasir (Point of Sale)" contentPadding={0}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 380px",
                    gap: 0,
                    height: "100%",
                    minHeight: 0,
                }}
                className="pos-grid">
                <style>{`
                    @media (max-width: 900px) {
                        .pos-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>

                {/* -------- Kolom Produk -------- */}
                <div style={{ padding: 24, overflowY: "auto", minHeight: 0 }}>
                    <VStack gap={4} hAlign="stretch">
                        <TextInput
                            label="Cari produk"
                            isLabelHidden
                            placeholder="Cari nama produk…"
                            value={search}
                            onChange={setSearch}
                            size="lg"
                        />

                        {loadingProducts ? (
                            <Grid columns={{ minWidth: 220, repeat: "fit" }} gap={4}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i} padding={4} width="100%">
                                        <div
                                            style={{
                                                height: 120,
                                                borderRadius: 8,
                                                background:
                                                    "var(--color-skeleton, #ebebeb)",
                                            }}
                                        />
                                    </Card>
                                ))}
                            </Grid>
                        ) : products.length === 0 ? (
                            <VStack gap={3} hAlign="center">
                                <EmptyState
                                    title="Produk tidak ditemukan"
                                    description={
                                        search
                                            ? `Tidak ada produk yang cocok dengan "${search}".`
                                            : "Belum ada produk. Tambahkan produk terlebih dahulu di menu Produk."
                                    }
                                    icon={<Icon icon={CubeIcon} size="lg" />}
                                />
                                {!search && (
                                    <Button
                                        label="Kelola Produk"
                                        variant="primary"
                                        onClick={() => navigate("/products")}
                                    />
                                )}
                            </VStack>
                        ) : (
                            <Grid columns={{ minWidth: 220, repeat: "fit" }} gap={4}>
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        quantityInCart={
                                            cartQuantityByProduct.get(product.id) ?? 0
                                        }
                                        isBusy={busyProductId === product.id}
                                        onAdd={handleAddToCart}
                                    />
                                ))}
                            </Grid>
                        )}
                    </VStack>
                </div>

                {/* -------- Kolom Keranjang -------- */}
                <div
                    style={{
                        borderLeft: "1px solid var(--color-border)",
                        background: "var(--color-background-surface)",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                    }}>
                    <div style={{ padding: "20px 20px 12px" }}>
                        <HStack vAlign="center" gap={2}>
                            <Icon icon={ShoppingCartIcon} />
                            <Text type="display-1" as="h2">
                                Keranjang
                            </Text>
                            {cartItemCount > 0 && (
                                <Badge color="gray" label={`${cartItemCount} item`} />
                            )}
                        </HStack>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: "auto",
                            padding: "0 20px",
                        }}>
                        {loadingCart ? (
                            <VStack gap={2} style={{ paddingTop: 20 }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            height: 52,
                                            borderRadius: 8,
                                            background: "var(--color-skeleton, #ebebeb)",
                                        }}
                                    />
                                ))}
                            </VStack>
                        ) : (cart?.items ?? []).length === 0 ? (
                            <div style={{ paddingTop: 24 }}>
                                <EmptyState
                                    title="Keranjang kosong"
                                    description="Pilih produk di sebelah kiri untuk mulai berjualan."
                                    icon={<Icon icon={ShoppingCartIcon} size="lg" />}
                                />
                            </div>
                        ) : (
                            cart.items.map((item) => (
                                <CartLine
                                    key={item.product_id}
                                    item={item}
                                    isBusy={busyProductId === item.product_id}
                                    onIncrease={handleIncrease}
                                    onDecrease={handleDecrease}
                                    onRemove={handleRemove}
                                />
                            ))
                        )}
                    </div>

                    <div
                        style={{
                            padding: 20,
                            borderTop: "1px solid var(--color-border)",
                        }}>
                        <VStack gap={3} hAlign="stretch">
                            <HStack style={{ justifyContent: "space-between" }}>
                                <Text type="body" weight="bold">
                                    Total
                                </Text>
                                <Text type="display-1" as="span">
                                    {formatRupiah(cartTotal)}
                                </Text>
                            </HStack>
                            <Button
                                label="Checkout"
                                variant="primary"
                                size="lg"
                                isLoading={isCheckingOut}
                                disabled={(cart?.items ?? []).length === 0}
                                onClick={handleCheckout}
                            />
                        </VStack>
                    </div>
                </div>
            </div>

            {lastReceipt && (
                <ReceiptModal
                    receipt={lastReceipt}
                    onClose={() => setLastReceipt(null)}
                    onViewHistory={() => {
                        setLastReceipt(null);
                        navigate("/transactions");
                    }}
                />
            )}
        </AppLayout>
    );
}

function ReceiptModal({ receipt, onClose, onViewHistory }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "var(--color-overlay, rgba(0,0,0,0.5))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 16,
            }}
            onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "min(420px, 100%)" }}>
                <Card padding={6} width="100%">
                    <VStack gap={4} hAlign="stretch">
                        <VStack gap={1} hAlign="center">
                            <CheckCircleIcon
                                style={{
                                    width: 40,
                                    height: 40,
                                    color: "var(--color-success)",
                                }}
                            />
                            <Text type="display-1" as="h2">
                                Transaksi Berhasil
                            </Text>
                            <Text type="supporting" color="secondary">
                                ID: {receipt.id}
                            </Text>
                        </VStack>

                        <div
                            style={{
                                borderTop: "1px dashed var(--color-border-emphasized)",
                                borderBottom: "1px dashed var(--color-border-emphasized)",
                                padding: "12px 0",
                            }}>
                            {(receipt.items ?? []).map((item) => (
                                <HStack
                                    key={item.product_id}
                                    style={{ justifyContent: "space-between", padding: "4px 0" }}>
                                    <Text type="body" size="sm">
                                        {item.product?.name} × {item.quantity}
                                    </Text>
                                    <Text type="body" size="sm">
                                        {formatRupiah((item.product?.price ?? 0) * item.quantity)}
                                    </Text>
                                </HStack>
                            ))}
                        </div>

                        <HStack style={{ justifyContent: "space-between" }}>
                            <Text type="body" weight="bold">
                                Total Bayar
                            </Text>
                            <Text type="display-1" as="span">
                                {formatRupiah(receipt.total)}
                            </Text>
                        </HStack>

                        <VStack gap={2} hAlign="stretch">
                            <Button
                                label="Transaksi Baru"
                                variant="primary"
                                size="lg"
                                onClick={onClose}
                            />
                            <Button
                                label="Lihat Riwayat Transaksi"
                                variant="secondary"
                                size="lg"
                                onClick={onViewHistory}
                            />
                        </VStack>
                    </VStack>
                </Card>
            </div>
        </div>
    );
}
