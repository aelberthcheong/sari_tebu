import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import {
    ArchiveBoxIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";

import AppLayout from "#/layouts/AppLayout.jsx";
import { Badge } from "#/components/Badge.jsx";
import { ImageUpload, ProductImage } from "#/components/ImageUpload.jsx";
import { Modal } from "#/components/Modal.jsx";
import { ConfirmDialog } from "#/components/ConfirmDialog.jsx";
import { productsApi, ApiError } from "#/lib/api.js";
import { useToast } from "#/context/ToastContext.jsx";

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function stockBadge(stock) {
    if (stock <= 0) return <Badge color="red" label="Habis" />;
    if (stock <= 5) return <Badge color="red" label={`Kritis: ${stock}`} />;
    if (stock <= 15) return <Badge color="yellow" label={`Rendah: ${stock}`} />;
    return <Badge color="green" label={`${stock}`} />;
}

/* ── Restock Modal ── */
function RestockModal({ product, onClose, onSaved }) {
    const toast = useToast();
    const [amount, setAmount] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const presets = [10, 25, 50, 100];

    const handleSubmit = async () => {
        const n = parseInt(amount, 10);
        if (!n || n <= 0) return;
        setIsSaving(true);
        try {
            await productsApi.update(product.id, { stock: product.stock + n });
            toast.success(`Stok "${product.name}" ditambah ${n}. Sekarang: ${product.stock + n}`);
            onSaved();
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Gagal restock.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal title={`Restock: ${product.name}`} onClose={onClose} width={380}>
            <VStack gap={3} hAlign="stretch">
                <div style={{ padding: 12, borderRadius: 10, background: "var(--color-background-muted)", textAlign: "center" }}>
                    <Text type="supporting" color="secondary">Stok Saat Ini</Text>
                    <div style={{ fontSize: 28, fontWeight: 700, color: product.stock <= 5 ? "var(--color-error)" : "var(--color-accent)" }}>
                        {product.stock}
                    </div>
                </div>
                <Text type="body" weight="medium">Tambah Stok</Text>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {presets.map((p) => (
                        <button
                            key={p}
                            onClick={() => setAmount(String(p))}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: "1px solid var(--color-border)",
                                background: amount === String(p) ? "var(--color-accent)" : "transparent",
                                color: amount === String(p) ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 500,
                                transition: "all 0.15s",
                            }}
                        >
                            +{p}
                        </button>
                    ))}
                </div>
                <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Jumlah lain..."
                    autoFocus
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: 16,
                        fontWeight: 600,
                        border: "1px solid var(--color-border-emphasized)",
                        borderRadius: 8,
                        background: "var(--color-background-surface)",
                        color: "var(--color-text-primary)",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                />
                {amount && parseInt(amount, 10) > 0 && (
                    <div style={{ padding: 10, borderRadius: 8, background: "var(--color-background-green)", textAlign: "center" }}>
                        <Text type="body" style={{ color: "var(--color-text-green)", fontWeight: 600 }}>
                            Stok baru: {product.stock + parseInt(amount, 10)}
                        </Text>
                    </div>
                )}
                <HStack gap={2} hAlign="stretch">
                    <Button label="Batal" variant="secondary" size="md" onClick={onClose} style={{ flex: 1 }} />
                    <Button label="Simpan Restock" variant="primary" size="md" isLoading={isSaving} disabled={!amount || parseInt(amount, 10) <= 0} onClick={handleSubmit} style={{ flex: 1 }} />
                </HStack>
            </VStack>
        </Modal>
    );
}

/* ── Product Form Modal ── */
function ProductFormModal({ initialProduct, onClose, onSaved }) {
    const isEdit = Boolean(initialProduct);
    const toast = useToast();

    const [name, setName] = useState(initialProduct?.name ?? "");
    const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : "");
    const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : "");
    const [imageUrl, setImageUrl] = useState(initialProduct?.image_url ?? null);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const validate = () => {
        const next = {};
        if (!name.trim()) next.name = "Nama produk wajib diisi";
        const priceNum = Number(price);
        if (!price || Number.isNaN(priceNum) || priceNum <= 0) next.price = "Harga harus lebih dari 0";
        const stockNum = Number(stock);
        if (stock === "" || Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) next.stock = "Stok harus bilangan bulat ≥ 0";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSaving(true);
        const payload = { name: name.trim(), price: Number(price), stock: Number(stock), image_url: imageUrl || null };
        try {
            if (isEdit) {
                await productsApi.replace(initialProduct.id, payload);
                toast.success("Produk berhasil diperbarui.");
            } else {
                await productsApi.create(payload);
                toast.success("Produk baru berhasil ditambahkan.");
            }
            onSaved();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : "Gagal menyimpan produk.";
            toast.error(message);
            if (err instanceof ApiError && /nama|name|unique/i.test(message)) {
                setErrors((prev) => ({ ...prev, name: message }));
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal title={isEdit ? "Ubah Produk" : "Tambah Produk Baru"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <VStack gap={4} hAlign="stretch">
                    <ImageUpload value={imageUrl} onChange={setImageUrl} />
                    <TextInput
                        label="Nama Produk"
                        placeholder="mis. Es Tebu Original"
                        size="lg"
                        value={name}
                        onChange={(v) => { setName(v); setErrors((p) => ({ ...p, name: undefined })); }}
                        status={errors.name ? { type: "error", message: errors.name } : undefined}
                    />
                    <TextInput
                        label="Harga (Rp)"
                        placeholder="mis. 8000"
                        type="number"
                        size="lg"
                        value={price}
                        onChange={(v) => { setPrice(v); setErrors((p) => ({ ...p, price: undefined })); }}
                        status={errors.price ? { type: "error", message: errors.price } : undefined}
                    />
                    <TextInput
                        label="Stok"
                        placeholder="mis. 50"
                        type="number"
                        size="lg"
                        value={stock}
                        onChange={(v) => { setStock(v); setErrors((p) => ({ ...p, stock: undefined })); }}
                        status={errors.stock ? { type: "error", message: errors.stock } : undefined}
                    />
                    {price && stock && !errors.price && !errors.stock && (
                        <div style={{ padding: 12, borderRadius: 10, background: "var(--color-background-blue)" }}>
                            <Text type="supporting" style={{ color: "var(--color-text-blue)" }}>
                                Nilai inventori:{" "}
                                <strong>{formatRupiah(Number(price) * Number(stock))}</strong>
                            </Text>
                        </div>
                    )}
                    <Button
                        label={isEdit ? "Simpan Perubahan" : "Tambah Produk"}
                        variant="primary"
                        size="lg"
                        type="submit"
                        isLoading={isSaving}
                    />
                </VStack>
            </form>
        </Modal>
    );
}

/* ── Main Page ── */
export default function Products() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [formTarget, setFormTarget] = useState(undefined);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [restockTarget, setRestockTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filter, setFilter] = useState("all"); // all | low | out
    const [sortField, setSortField] = useState("name");
    const [sortDir, setSortDir] = useState("asc");

    const loadProducts = useCallback(async (name) => {
        setIsLoading(true);
        try {
            const data = await productsApi.list(name);
            setProducts(data?.data?.products ?? []);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Gagal memuat produk.");
        } finally {
            setIsLoading(false);
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        const timer = setTimeout(() => loadProducts(search), 300);
        return () => clearTimeout(timer);
    }, [search, loadProducts]);

    const filtered = useMemo(() => {
        let list = [...products];
        if (filter === "low") list = list.filter((p) => p.stock > 0 && p.stock <= 15);
        if (filter === "out") list = list.filter((p) => p.stock <= 0);
        list.sort((a, b) => {
            let va = a[sortField], vb = b[sortField];
            if (typeof va === "string") va = va.toLowerCase();
            if (typeof vb === "string") vb = vb.toLowerCase();
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return list;
    }, [products, filter, sortField, sortDir]);

    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 15).length;
    const outOfStockCount = products.filter((p) => p.stock <= 0).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    const handleSort = (field) => {
        if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await productsApi.remove(deleteTarget.id);
            toast.success(`Produk "${deleteTarget.name}" dihapus.`);
            setDeleteTarget(null);
            await loadProducts(search);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Gagal menghapus produk.");
        } finally {
            setIsDeleting(false);
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return sortDir === "asc"
            ? <ArrowUpIcon style={{ width: 12, height: 12, display: "inline" }} />
            : <ArrowDownIcon style={{ width: 12, height: 12, display: "inline" }} />;
    };

    return (
        <AppLayout title="Manajemen Produk" subtitle="Kelola katalog, harga, stok, dan gambar produk.">
            <VStack gap={4} hAlign="stretch">
                {/* Summary cards */}
                <div style={{ display: "flex", gap: 12 }}>
                    {[
                        { label: "Total Produk", value: products.length, color: "blue" },
                        { label: "Stok Rendah", value: lowStockCount, color: lowStockCount > 0 ? "yellow" : "gray" },
                        { label: "Stok Habis", value: outOfStockCount, color: outOfStockCount > 0 ? "red" : "gray" },
                        { label: "Nilai Inventori", value: formatRupiah(totalInventoryValue), color: "green", small: true },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            style={{
                                flex: 1,
                                padding: "10px 14px",
                                borderRadius: 10,
                                background: `var(--color-background-${stat.color})`,
                                minWidth: 0,
                            }}
                        >
                            <div style={{ fontSize: stat.small ? 14 : 22, fontWeight: 700, color: `var(--color-text-${stat.color})`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: 11, color: `var(--color-text-${stat.color})`, opacity: 0.8 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Low stock alert */}
                {lowStockCount + outOfStockCount > 0 && (
                    <div style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        background: "var(--color-background-yellow)",
                        border: "1px solid var(--color-border-yellow)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        animation: "fadeSlideIn 0.3s ease-out",
                    }}>
                        <ExclamationTriangleIcon style={{ width: 18, height: 18, color: "var(--color-icon-yellow)", flexShrink: 0 }} />
                        <Text type="supporting" style={{ color: "var(--color-text-yellow)" }}>
                            {outOfStockCount > 0 && `${outOfStockCount} produk habis. `}
                            {lowStockCount > 0 && `${lowStockCount} produk stok rendah (≤15).`}
                            {" "}Klik baris produk untuk restock.
                        </Text>
                    </div>
                )}

                {/* Toolbar */}
                <HStack style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }} vAlign="center">
                    <HStack gap={2} vAlign="center" style={{ flexWrap: "wrap" }}>
                        <div style={{ width: 280 }}>
                            <TextInput
                                label="Cari produk"
                                isLabelHidden
                                placeholder="Cari nama produk…"
                                value={search}
                                onChange={setSearch}
                                size="md"
                            />
                        </div>
                        {["all", "low", "out"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 20,
                                    border: "1px solid",
                                    borderColor: filter === f ? "var(--color-accent)" : "var(--color-border)",
                                    background: filter === f ? "var(--color-accent)" : "transparent",
                                    color: filter === f ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    transition: "all 0.15s",
                                }}
                            >
                                {f === "all" ? "Semua" : f === "low" ? "Stok Rendah" : "Habis"}
                            </button>
                        ))}
                    </HStack>
                    <Button label="+ Tambah Produk" variant="primary" size="md" onClick={() => setFormTarget(null)} />
                </HStack>

                {isLoading ? (
                    <VStack gap={2}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ height: 64, borderRadius: 10, background: "var(--color-skeleton, #ebebeb)", animation: `skeletonPulse 1.5s ease infinite`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                        <style>{`@keyframes skeletonPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
                    </VStack>
                ) : filtered.length === 0 ? (
                    <VStack gap={3} hAlign="center">
                        <EmptyState
                            title={filter !== "all" ? "Tidak ada produk di filter ini" : "Belum ada produk"}
                            description={search ? `Tidak ditemukan produk untuk "${search}".` : filter !== "all" ? "Coba ganti filter di atas." : "Tambahkan produk pertamamu untuk mulai berjualan."}
                            icon={<Icon icon={ArchiveBoxIcon} size="lg" />}
                        />
                        {!search && filter === "all" && (
                            <Button label="+ Tambah Produk" variant="primary" onClick={() => setFormTarget(null)} />
                        )}
                    </VStack>
                ) : (
                    <Card padding={0} width="100%">
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                                        {[
                                            { label: "Nama Produk", field: "name" },
                                            { label: "Harga", field: "price" },
                                            { label: "Stok", field: "stock" },
                                            { label: "Nilai Stok", field: null },
                                            { label: "Aksi", field: null, right: true },
                                        ].map((h) => (
                                            <th
                                                key={h.label}
                                                onClick={() => h.field && handleSort(h.field)}
                                                style={{
                                                    textAlign: h.right ? "right" : "left",
                                                    padding: "12px 16px",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: 0.4,
                                                    color: "var(--color-text-secondary)",
                                                    cursor: h.field ? "pointer" : "default",
                                                    userSelect: "none",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {h.label} {h.field && <SortIcon field={h.field} />}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((product, idx) => (
                                        <tr
                                            key={product.id}
                                            style={{
                                                borderBottom: "1px solid var(--color-border)",
                                                background: product.stock <= 0 ? "var(--color-background-red)" : product.stock <= 5 ? "var(--color-background-yellow)" : "transparent",
                                                transition: "background 0.15s",
                                                animation: `rowFadeIn 0.2s ease-out ${idx * 0.03}s both`,
                                            }}
                                        >
                                            <style>{`@keyframes rowFadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }`}</style>
                                            <td style={{ padding: "12px 16px" }}>
                                                <HStack gap={3} vAlign="center">
                                                    <ProductImage src={product.image_url} alt={product.name} size={36} radius={8} />
                                                    <Text type="body" weight="medium">{product.name}</Text>
                                                </HStack>
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                <Text type="body">{formatRupiah(product.price)}</Text>
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>{stockBadge(product.stock)}</td>
                                            <td style={{ padding: "12px 16px" }}>
                                                <Text type="supporting" color="secondary">{formatRupiah(product.price * product.stock)}</Text>
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                                <HStack gap={1} style={{ justifyContent: "flex-end" }}>
                                                    <button
                                                        onClick={() => setRestockTarget(product)}
                                                        title="Restock"
                                                        style={{ background: "none", border: "1px solid var(--color-border-emphasized)", borderRadius: 8, width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-icon-green)" }}
                                                    >
                                                        <ArrowUpIcon style={{ width: 15, height: 15 }} />
                                                    </button>
                                                    <button
                                                        onClick={() => setFormTarget(product)}
                                                        title="Ubah"
                                                        style={{ background: "none", border: "1px solid var(--color-border-emphasized)", borderRadius: 8, width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-text-primary)" }}
                                                    >
                                                        <PencilSquareIcon style={{ width: 15, height: 15 }} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(product)}
                                                        title="Hapus"
                                                        style={{ background: "none", border: "1px solid var(--color-border-emphasized)", borderRadius: 8, width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-error, #a50c25)" }}
                                                    >
                                                        <TrashIcon style={{ width: 15, height: 15 }} />
                                                    </button>
                                                </HStack>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </VStack>

            {formTarget !== undefined && (
                <ProductFormModal
                    initialProduct={formTarget}
                    onClose={() => setFormTarget(undefined)}
                    onSaved={() => { setFormTarget(undefined); loadProducts(search); }}
                />
            )}
            {restockTarget && (
                <RestockModal
                    product={restockTarget}
                    onClose={() => setRestockTarget(null)}
                    onSaved={() => { setRestockTarget(null); loadProducts(search); }}
                />
            )}
            {deleteTarget && (
                <ConfirmDialog
                    title="Hapus Produk"
                    description={`Yakin ingin menghapus "${deleteTarget.name}"? Tindakan ini tidak dapat dibatalkan.`}
                    confirmLabel="Hapus Produk"
                    isLoading={isDeleting}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </AppLayout>
    );
}
