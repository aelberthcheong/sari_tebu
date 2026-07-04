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
    TagIcon,
    CalculatorIcon,
    PrinterIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    BanknotesIcon,
    ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import AppLayout from "#/layouts/AppLayout.jsx";
import { Badge } from "#/components/Badge.jsx";
import { ProductImage } from "#/components/ImageUpload.jsx";
import { IconButton } from "#/components/IconButton.jsx";
import { cartsApi, productsApi, transactionsApi, ApiError } from "#/lib/api.js";
import { useToast } from "#/context/ToastContext.jsx";

const CART_ID_STORAGE_KEY = "saritebu:activeCartId";

/* ─────────────────────────── helpers ──────────────────────────── */

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function parseRupiah(str) {
    return parseInt(String(str).replace(/\D/g, ""), 10) || 0;
}

/* ─────────────────────── ProductCard ───────────────────────── */

function ProductCard({ product, quantityInCart, onAdd, isBusy }) {
    const outOfStock = product.stock <= 0;
    const atStockLimit = quantityInCart >= product.stock;
    const [pressed, setPressed] = useState(false);

    const handleClick = () => {
        if (outOfStock || atStockLimit || isBusy) return;
        setPressed(true);
        setTimeout(() => setPressed(false), 200);
        onAdd(product);
    };

    return (
        <div
            style={{
                height: "100%",
                transform: pressed ? "scale(0.97)" : "scale(1)",
                transition: "transform 0.15s cubic-bezier(.34,1.56,.64,1)",
            }}
        >
            <Card
                padding={4}
                width="100%"
                style={{
                    height: "100%",
                    cursor: outOfStock || atStockLimit ? "not-allowed" : "pointer",
                    opacity: outOfStock ? 0.6 : 1,
                    transition: "box-shadow 0.18s ease, transform 0.18s ease",
                    position: "relative",
                    overflow: "hidden",
                }}
                onClick={handleClick}
            >
                {/* subtle green shimmer on hover via CSS */}
                <style>{`
                    .product-card-inner:hover { box-shadow: 0 4px 20px rgba(0,109,52,0.15) !important; }
                `}</style>
                <div className="product-card-inner" style={{ height: "100%" }}>
                    <VStack gap={3} hAlign="stretch" style={{ height: "100%" }}>
                        <HStack vAlign="center" gap={2}>
                            {product.image_url ? (
                                <ProductImage src={product.image_url} alt={product.name} size={40} radius={10} />
                            ) : (
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: outOfStock
                                            ? "var(--color-background-red)"
                                            : "var(--color-background-green)",
                                        flexShrink: 0,
                                        transition: "background 0.2s",
                                    }}
                                >
                                    <Icon
                                        icon={CubeIcon}
                                        style={{
                                            color: outOfStock
                                                ? "var(--color-text-red)"
                                                : "var(--color-icon-green)",
                                        }}
                                    />
                                </div>
                            )}
                            <VStack gap={0} style={{ minWidth: 0 }}>
                                <div
                                    style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <Text type="body" weight="bold">
                                        {product.name}
                                    </Text>
                                </div>
                                <Text type="supporting" color="secondary" size="sm">
                                    Stok:{" "}
                                    <strong
                                        style={{
                                            color:
                                                product.stock <= 5
                                                    ? "var(--color-error)"
                                                    : "inherit",
                                        }}
                                    >
                                        {product.stock}
                                    </strong>
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
                                <Badge color="green" label={`${quantityInCart}×`} />
                            ) : null}
                        </HStack>

                        <div
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                background: outOfStock
                                    ? "var(--color-background-gray)"
                                    : atStockLimit
                                    ? "var(--color-background-orange)"
                                    : "var(--color-accent)",
                                color: outOfStock || atStockLimit ? "var(--color-text-secondary)" : "var(--color-on-accent)",
                                textAlign: "center",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: outOfStock || atStockLimit ? "not-allowed" : "pointer",
                                transition: "background 0.2s, opacity 0.2s",
                                opacity: isBusy ? 0.7 : 1,
                                userSelect: "none",
                            }}
                        >
                            {isBusy ? "..." : outOfStock ? "Stok habis" : atStockLimit ? "Batas stok" : "+ Tambah"}
                        </div>
                    </VStack>
                </div>
            </Card>
        </div>
    );
}

/* ─────────────────────── CartLine ───────────────────────── */

function CartLine({ item, onIncrease, onDecrease, onRemove, isBusy, discount }) {
    const product = item.product;
    const baseTotal = (product?.price ?? 0) * item.quantity;
    const discountAmount = Math.round(baseTotal * (discount / 100));
    const lineTotal = baseTotal - discountAmount;

    return (
        <div
            style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--color-border)",
                animation: "fadeSlideIn 0.2s ease-out",
            }}
        >
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
            <ProductImage src={product?.image_url} alt={product?.name} size={36} radius={8} />
            <VStack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    <Text type="body" weight="medium">
                        {product?.name ?? "Produk tidak diketahui"}
                    </Text>
                </div>
                <Text type="supporting" color="secondary" size="sm">
                    {formatRupiah(product?.price)} × {item.quantity}
                    {discount > 0 && (
                        <span style={{ color: "var(--color-text-red)", marginLeft: 4 }}>
                            −{discount}%
                        </span>
                    )}
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
                {discount > 0 && (
                    <div>
                        <Text type="supporting" color="secondary" style={{ textDecoration: "line-through", fontSize: 11 }}>
                            {formatRupiah(baseTotal)}
                        </Text>
                    </div>
                )}
            </span>
        </div>
    );
}

/* ─────────────────────── CashCalculator ───────────────────────── */

function CashCalculator({ total, onClose }) {
    const [cashInput, setCashInput] = useState("");
    const cash = parseRupiah(cashInput);
    const change = cash - total;
    const isEnough = cash >= total;

    const quickAmounts = [
        total,
        Math.ceil(total / 10000) * 10000,
        Math.ceil(total / 50000) * 50000,
        Math.ceil(total / 100000) * 100000,
    ].filter((v, i, arr) => arr.indexOf(v) === i && v >= total).slice(0, 4);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "var(--color-overlay, rgba(0,0,0,0.5))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1100,
                padding: 16,
            }}
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()} style={{ width: "min(400px, 100%)" }}>
                <Card padding={6} width="100%">
                    <VStack gap={4} hAlign="stretch">
                        <HStack style={{ justifyContent: "space-between" }} vAlign="center">
                            <HStack gap={2} vAlign="center">
                                <CalculatorIcon style={{ width: 20, height: 20, color: "var(--color-accent)" }} />
                                <Text type="display-1" as="h2">Kalkulator Uang</Text>
                            </HStack>
                            <button
                                onClick={onClose}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-text-secondary)", display: "flex" }}
                            >
                                <XMarkIcon style={{ width: 20, height: 20 }} />
                            </button>
                        </HStack>

                        <div style={{ padding: 16, borderRadius: 12, background: "var(--color-background-muted)", textAlign: "center" }}>
                            <Text type="supporting" color="secondary">Total Belanja</Text>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-accent)", marginTop: 4 }}>
                                {formatRupiah(total)}
                            </div>
                        </div>

                        <VStack gap={2} hAlign="stretch">
                            <Text type="body" weight="medium">Uang Diterima</Text>
                            <input
                                type="number"
                                value={cashInput}
                                onChange={(e) => setCashInput(e.target.value)}
                                placeholder="Masukkan nominal uang..."
                                autoFocus
                                style={{
                                    width: "100%",
                                    padding: "12px 14px",
                                    fontSize: 18,
                                    fontWeight: 600,
                                    border: "1px solid var(--color-border-emphasized)",
                                    borderRadius: 10,
                                    background: "var(--color-background-surface)",
                                    color: "var(--color-text-primary)",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </VStack>

                        <VStack gap={2} hAlign="stretch">
                            <Text type="supporting" color="secondary">Nominal Cepat</Text>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setCashInput(String(amt))}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "1px solid var(--color-border)",
                                            background: cashInput === String(amt) ? "var(--color-background-green)" : "var(--color-background-surface)",
                                            color: cashInput === String(amt) ? "var(--color-text-green)" : "var(--color-text-primary)",
                                            cursor: "pointer",
                                            fontSize: 13,
                                            fontWeight: 500,
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        {formatRupiah(amt)}
                                    </button>
                                ))}
                            </div>
                        </VStack>

                        {cashInput && (
                            <div
                                style={{
                                    padding: 16,
                                    borderRadius: 12,
                                    background: isEnough ? "var(--color-background-green)" : "var(--color-background-red)",
                                    textAlign: "center",
                                    transition: "background 0.3s",
                                }}
                            >
                                <Text type="supporting" style={{ color: isEnough ? "var(--color-text-green)" : "var(--color-text-red)" }}>
                                    {isEnough ? "Kembalian" : "Kurang"}
                                </Text>
                                <div
                                    style={{
                                        fontSize: 26,
                                        fontWeight: 700,
                                        color: isEnough ? "var(--color-icon-green)" : "var(--color-icon-red)",
                                        marginTop: 4,
                                    }}
                                >
                                    {formatRupiah(Math.abs(change))}
                                </div>
                            </div>
                        )}

                        <Button label="Tutup" variant="secondary" size="md" onClick={onClose} />
                    </VStack>
                </Card>
            </div>
        </div>
    );
}

/* ─────────────────────── DiscountBar ───────────────────────── */

function DiscountBar({ discount, onChange }) {
    const presets = [0, 5, 10, 15, 20, 25];
    return (
        <VStack gap={2} hAlign="stretch">
            <HStack vAlign="center" gap={2}>
                <ReceiptPercentIcon style={{ width: 16, height: 16, color: "var(--color-text-secondary)" }} />
                <Text type="supporting" color="secondary" weight="medium">Diskon Global</Text>
                {discount > 0 && (
                    <Badge color="orange" label={`−${discount}%`} />
                )}
            </HStack>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {presets.map((p) => (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            border: "1px solid",
                            borderColor: discount === p ? "var(--color-accent)" : "var(--color-border)",
                            background: discount === p ? "var(--color-accent)" : "transparent",
                            color: discount === p ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            transition: "all 0.15s",
                        }}
                    >
                        {p === 0 ? "Tanpa diskon" : `${p}%`}
                    </button>
                ))}
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => onChange(Math.min(100, Math.max(0, Number(e.target.value))))}
                    placeholder="Manual"
                    style={{
                        width: 60,
                        padding: "4px 8px",
                        borderRadius: 20,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-background-surface)",
                        color: "var(--color-text-primary)",
                        fontSize: 12,
                        textAlign: "center",
                        outline: "none",
                    }}
                />
            </div>
        </VStack>
    );
}

/* ─────────────────────── ReceiptModal ───────────────────────── */

function ReceiptModal({ receipt, onClose, onViewHistory }) {
    const receiptRef = useRef(null);

    const handlePrint = () => {
        const content = receiptRef.current;
        if (!content) return;
        const win = window.open("", "_blank", "width=400,height=600");
        win.document.write(`
            <html><head><title>Struk Sari Tebu</title>
            <style>
                body { font-family: monospace; font-size: 12px; padding: 16px; }
                h2 { text-align: center; margin: 0; font-size: 14px; }
                .divider { border-top: 1px dashed #999; margin: 8px 0; }
                .row { display: flex; justify-content: space-between; margin: 4px 0; }
                .total { font-weight: bold; font-size: 14px; }
                .center { text-align: center; }
                .footer { font-size: 11px; color: #666; text-align: center; margin-top: 8px; }
            </style>
            </head><body>
            <h2>🌿 SARI TEBU POS</h2>
            <div class="center" style="font-size:11px;color:#666;margin:4px 0">Terima kasih telah berbelanja</div>
            <div class="divider"></div>
            ${(receipt.items ?? []).map(item =>
                `<div class="row"><span>${item.product?.name} ×${item.quantity}</span><span>${new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format((item.product?.price??0)*item.quantity)}</span></div>`
            ).join("")}
            ${receipt.discount > 0 ? `
            <div class="divider"></div>
            <div class="row"><span>Subtotal</span><span>${new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(receipt.subtotal)}</span></div>
            <div class="row" style="color:#c00"><span>Diskon ${receipt.discount}%</span><span>-${new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(receipt.subtotal - receipt.total)}</span></div>
            ` : ""}
            <div class="divider"></div>
            <div class="row total"><span>TOTAL</span><span>${new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(receipt.total)}</span></div>
            <div class="divider"></div>
            <div class="footer">ID: ${receipt.id}</div>
            <div class="footer">${new Date().toLocaleString("id-ID")}</div>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

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
                animation: "fadeIn 0.2s ease-out",
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: "min(460px, 100%)", animation: "slideUp 0.25s ease-out" }}
            >
                <Card padding={6} width="100%">
                    <VStack gap={4} hAlign="stretch" ref={receiptRef}>
                        <VStack gap={1} hAlign="center">
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    background: "var(--color-background-green)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1)",
                                }}
                            >
                                <style>{`@keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
                                <CheckCircleIcon style={{ width: 32, height: 32, color: "var(--color-icon-green)" }} />
                            </div>
                            <Text type="display-1" as="h2">Transaksi Berhasil!</Text>
                            <Text type="supporting" color="secondary">
                                {new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                            </Text>
                        </VStack>

                        <div
                            style={{
                                borderTop: "1px dashed var(--color-border-emphasized)",
                                borderBottom: "1px dashed var(--color-border-emphasized)",
                                padding: "12px 0",
                            }}
                        >
                            {(receipt.items ?? []).map((item) => (
                                <HStack
                                    key={item.product_id}
                                    style={{ justifyContent: "space-between", padding: "4px 0" }}
                                >
                                    <Text type="body" size="sm">
                                        {item.product?.name} × {item.quantity}
                                    </Text>
                                    <Text type="body" size="sm">
                                        {formatRupiah((item.product?.price ?? 0) * item.quantity)}
                                    </Text>
                                </HStack>
                            ))}
                        </div>

                        {receipt.discount > 0 && (
                            <VStack gap={1} hAlign="stretch">
                                <HStack style={{ justifyContent: "space-between" }}>
                                    <Text type="body" color="secondary">Subtotal</Text>
                                    <Text type="body">{formatRupiah(receipt.subtotal)}</Text>
                                </HStack>
                                <HStack style={{ justifyContent: "space-between" }}>
                                    <Text type="body" style={{ color: "var(--color-error)" }}>
                                        Diskon {receipt.discount}%
                                    </Text>
                                    <Text type="body" style={{ color: "var(--color-error)" }}>
                                        −{formatRupiah(receipt.subtotal - receipt.total)}
                                    </Text>
                                </HStack>
                            </VStack>
                        )}

                        <HStack style={{ justifyContent: "space-between" }}>
                            <Text type="body" weight="bold">Total Bayar</Text>
                            <Text type="display-1" as="span" style={{ color: "var(--color-accent)" }}>
                                {formatRupiah(receipt.total)}
                            </Text>
                        </HStack>

                        <VStack gap={2} hAlign="stretch">
                            <HStack gap={2} hAlign="stretch">
                                <Button
                                    label="Cetak Struk"
                                    variant="secondary"
                                    size="md"
                                    onClick={handlePrint}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    label="Transaksi Baru"
                                    variant="primary"
                                    size="md"
                                    onClick={onClose}
                                    style={{ flex: 1 }}
                                />
                            </HStack>
                            <Button
                                label="Lihat Riwayat Transaksi"
                                variant="secondary"
                                size="md"
                                onClick={onViewHistory}
                            />
                        </VStack>
                    </VStack>
                </Card>
            </div>
        </div>
    );
}

/* ─────────────────────── Main POS Page ───────────────────────── */

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

    // New features
    const [discount, setDiscount] = useState(0);
    const [showCalculator, setShowCalculator] = useState(false);
    const [showDiscountBar, setShowDiscountBar] = useState(false);

    /* Products */

    const loadProducts = useCallback(async (name) => {
        setLoadingProducts(true);
        try {
            const data = await productsApi.list(name);
            setProducts(data?.data?.products ?? []);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Gagal memuat produk.");
        } finally {
            setLoadingProducts(false);
        }
    }, []);// eslint-disable-line

    useEffect(() => {
        const timer = setTimeout(() => loadProducts(search), 300);
        return () => clearTimeout(timer);
    }, [search, loadProducts]);

    /* Cart */

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
            toast.error(err instanceof ApiError ? err.message : "Gagal menyiapkan keranjang belanja.");
        } finally {
            setLoadingCart(false);
        }
    }, [ensureCart]);// eslint-disable-line

    useEffect(() => { loadCart(); }, [loadCart]);

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
        for (const item of cart?.items ?? []) map.set(item.product_id, item.quantity);
        return map;
    }, [cart]);

    const handleAddToCart = async (product) => {
        if (!cart?.id) return;
        setBusyProductId(product.id);
        try {
            await cartsApi.addItem(cart.id, product.id, 1);
            await refreshCart();
            toast.success(`${product.name} ditambahkan.`);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Gagal menambah item.");
        } finally {
            setBusyProductId(null);
        }
    };

    const handleIncrease = async (item) => {
        if (!cart?.id) return;
        setBusyProductId(item.product_id);
        try {
            await cartsApi.addItem(cart.id, item.product_id, 1);
            await refreshCart();
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Gagal memperbarui jumlah.");
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
                await cartsApi.removeItem(cart.id, item.product_id);
                await cartsApi.addItem(cart.id, item.product_id, item.quantity - 1);
            }
            await refreshCart();
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Gagal memperbarui jumlah.");
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
            toast.error(err instanceof ApiError ? err.message : "Gagal menghapus item.");
        } finally {
            setBusyProductId(null);
        }
    };

    const handleClearCart = async () => {
        if (!cart?.id || (cart.items ?? []).length === 0) return;
        try {
            await Promise.all(
                (cart.items ?? []).map((item) => cartsApi.removeItem(cart.id, item.product_id))
            );
            await refreshCart();
            toast.info("Keranjang dikosongkan.");
        } catch {
            toast.error("Gagal mengosongkan keranjang.");
        }
    };

    const subtotal = useMemo(
        () => (cart?.items ?? []).reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0),
        [cart]
    );

    const cartTotal = useMemo(() => {
        const discountAmount = Math.round(subtotal * (discount / 100));
        return subtotal - discountAmount;
    }, [subtotal, discount]);

    const cartItemCount = useMemo(
        () => (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
        [cart]
    );

    const handleCheckout = async () => {
        if (!cart?.id || (cart.items ?? []).length === 0) return;
        setIsCheckingOut(true);
        try {
            const data = await transactionsApi.checkout(cart.id);
            setLastReceipt({
                ...data.data,
                items: cart.items,
                total: cartTotal,
                subtotal,
                discount,
            });
            setDiscount(0);
            localStorage.removeItem(CART_ID_STORAGE_KEY);
            toast.success("Transaksi berhasil!");
            await loadProducts(search);
            await loadCart();
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Checkout gagal. Silakan coba lagi.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    const inStockProducts = products.filter((p) => p.stock > 0);
    const outOfStockProducts = products.filter((p) => p.stock <= 0);
    const sortedProducts = [...inStockProducts, ...outOfStockProducts];

    return (
        <AppLayout
            title="Kasir (Point of Sale)"
            subtitle="Pilih produk, kelola keranjang, dan proses pembayaran."
            contentPadding={0}
        >
            <style>{`
                @keyframes skeletonPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 390px",
                    gap: 0,
                    height: "100%",
                    minHeight: 0,
                }}
                className="pos-grid"
            >
                <style>{`
                    @media (max-width: 900px) {
                        .pos-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>

                {/* ── Kolom Produk ── */}
                <div style={{ padding: 24, overflowY: "auto", minHeight: 0 }}>
                    <VStack gap={4} hAlign="stretch">
                        {/* Stats bar */}
                        <div style={{ display: "flex", gap: 12 }}>
                            {[
                                { label: "Total Produk", value: products.length, color: "blue" },
                                { label: "Tersedia", value: inStockProducts.length, color: "green" },
                                { label: "Habis", value: outOfStockProducts.length, color: "red" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    style={{
                                        flex: 1,
                                        padding: "10px 14px",
                                        borderRadius: 10,
                                        background: `var(--color-background-${stat.color})`,
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ fontSize: 20, fontWeight: 700, color: `var(--color-text-${stat.color})` }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: 11, color: `var(--color-text-${stat.color})`, opacity: 0.8 }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Search */}
                        <div style={{ position: "relative" }}>
                            <TextInput
                                label="Cari produk"
                                isLabelHidden
                                placeholder="Cari nama produk…"
                                value={search}
                                onChange={setSearch}
                                size="lg"
                            />
                        </div>

                        {/* Product grid */}
                        {loadingProducts ? (
                            <Grid columns={{ minWidth: 200, repeat: "fit" }} gap={4}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i} padding={4} width="100%">
                                        <div
                                            style={{
                                                height: 120,
                                                borderRadius: 8,
                                                background: "var(--color-skeleton, #ebebeb)",
                                                animation: "skeletonPulse 1.5s ease infinite",
                                            }}
                                        />
                                    </Card>
                                ))}
                            </Grid>
                        ) : sortedProducts.length === 0 ? (
                            <VStack gap={3} hAlign="center">
                                <EmptyState
                                    title="Produk tidak ditemukan"
                                    description={
                                        search
                                            ? `Tidak ada produk cocok dengan "${search}".`
                                            : "Belum ada produk. Tambahkan di menu Produk."
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
                            <Grid columns={{ minWidth: 200, repeat: "fit" }} gap={4}>
                                {sortedProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        quantityInCart={cartQuantityByProduct.get(product.id) ?? 0}
                                        isBusy={busyProductId === product.id}
                                        onAdd={handleAddToCart}
                                    />
                                ))}
                            </Grid>
                        )}
                    </VStack>
                </div>

                {/* ── Kolom Keranjang ── */}
                <div
                    style={{
                        borderLeft: "1px solid var(--color-border)",
                        background: "var(--color-background-surface)",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                    }}
                >
                    {/* Cart header */}
                    <div style={{ padding: "16px 20px 10px" }}>
                        <HStack style={{ justifyContent: "space-between" }} vAlign="center">
                            <HStack vAlign="center" gap={2}>
                                <ShoppingCartIcon style={{ width: 20, height: 20 }} />
                                <Text type="display-1" as="h2">Keranjang</Text>
                                {cartItemCount > 0 && (
                                    <Badge color="green" label={`${cartItemCount}`} />
                                )}
                            </HStack>
                            <HStack gap={1}>
                                {(cart?.items ?? []).length > 0 && (
                                    <button
                                        onClick={handleClearCart}
                                        title="Kosongkan keranjang"
                                        style={{
                                            background: "none",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            padding: "4px 8px",
                                            color: "var(--color-text-secondary)",
                                            fontSize: 11,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        <TrashIcon style={{ width: 12, height: 12 }} />
                                        Kosongkan
                                    </button>
                                )}
                            </HStack>
                        </HStack>
                    </div>

                    {/* Cart items */}
                    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px" }}>
                        {loadingCart ? (
                            <VStack gap={2} style={{ paddingTop: 20 }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            height: 52,
                                            borderRadius: 8,
                                            background: "var(--color-skeleton, #ebebeb)",
                                            animation: "skeletonPulse 1.5s ease infinite",
                                            animationDelay: `${i * 0.15}s`,
                                        }}
                                    />
                                ))}
                            </VStack>
                        ) : (cart?.items ?? []).length === 0 ? (
                            <div style={{ paddingTop: 24 }}>
                                <EmptyState
                                    title="Keranjang kosong"
                                    description="Klik produk di sebelah kiri untuk mulai berjualan."
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
                                    discount={discount}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: "12px 20px 20px", borderTop: "1px solid var(--color-border)" }}>
                        <VStack gap={3} hAlign="stretch">
                            {/* Discount toggle */}
                            <button
                                onClick={() => setShowDiscountBar((v) => !v)}
                                style={{
                                    background: "none",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    padding: "6px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    color: "var(--color-text-secondary)",
                                    fontSize: 13,
                                    transition: "border-color 0.2s",
                                }}
                            >
                                <HStack gap={1} vAlign="center">
                                    <TagIcon style={{ width: 14, height: 14 }} />
                                    <span>Diskon</span>
                                    {discount > 0 && <Badge color="orange" label={`${discount}%`} size="sm" />}
                                </HStack>
                                <span style={{ fontSize: 11 }}>{showDiscountBar ? "▲" : "▼"}</span>
                            </button>

                            {showDiscountBar && (
                                <div style={{ animation: "fadeSlideIn 0.2s ease-out" }}>
                                    <DiscountBar discount={discount} onChange={setDiscount} />
                                </div>
                            )}

                            {/* Summary */}
                            {discount > 0 && (
                                <HStack style={{ justifyContent: "space-between" }}>
                                    <Text type="supporting" color="secondary">Subtotal</Text>
                                    <Text type="supporting" color="secondary" style={{ textDecoration: "line-through" }}>
                                        {formatRupiah(subtotal)}
                                    </Text>
                                </HStack>
                            )}

                            <HStack style={{ justifyContent: "space-between" }} vAlign="center">
                                <Text type="body" weight="bold">Total</Text>
                                <Text
                                    type="display-1"
                                    as="span"
                                    style={{
                                        color: "var(--color-accent)",
                                        transition: "transform 0.3s",
                                    }}
                                >
                                    {formatRupiah(cartTotal)}
                                </Text>
                            </HStack>

                            {/* Action buttons */}
                            <HStack gap={2} hAlign="stretch">
                                <button
                                    onClick={() => setShowCalculator(true)}
                                    disabled={(cart?.items ?? []).length === 0}
                                    title="Kalkulator uang"
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: "1px solid var(--color-border)",
                                        background: "var(--color-background-surface)",
                                        cursor: (cart?.items ?? []).length === 0 ? "not-allowed" : "pointer",
                                        color: "var(--color-text-secondary)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        fontSize: 13,
                                        opacity: (cart?.items ?? []).length === 0 ? 0.5 : 1,
                                        transition: "all 0.15s",
                                        flexShrink: 0,
                                    }}
                                >
                                    <CalculatorIcon style={{ width: 16, height: 16 }} />
                                    <BanknotesIcon style={{ width: 16, height: 16 }} />
                                </button>
                                <Button
                                    label={isCheckingOut ? "Memproses…" : "Checkout"}
                                    variant="primary"
                                    size="lg"
                                    isLoading={isCheckingOut}
                                    disabled={(cart?.items ?? []).length === 0}
                                    onClick={handleCheckout}
                                    style={{ flex: 1 }}
                                />
                            </HStack>
                        </VStack>
                    </div>
                </div>
            </div>

            {showCalculator && (
                <CashCalculator total={cartTotal} onClose={() => setShowCalculator(false)} />
            )}

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
