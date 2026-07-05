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
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

import AppLayout from "#/layouts/AppLayout.jsx";
import { Badge } from "#/components/Badge.jsx";
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
    if (stock <= 10) return <Badge color="yellow" label={`Stok rendah: ${stock}`} />;
    return <Badge color="green" label={`Stok: ${stock}`} />;
}

function ProductFormModal({ initialProduct, onClose, onSaved }) {
    const isEdit = Boolean(initialProduct);
    const toast = useToast();

    const [name, setName] = useState(initialProduct?.name ?? "");
    const [price, setPrice] = useState(
        initialProduct ? String(initialProduct.price) : "",
    );
    const [stock, setStock] = useState(
        initialProduct ? String(initialProduct.stock) : "",
    );
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const validate = () => {
        const next = {};
        if (!name.trim()) next.name = "Nama produk wajib diisi";
        const priceNum = Number(price);
        if (!price || Number.isNaN(priceNum) || priceNum <= 0)
            next.price = "Harga harus lebih dari 0";
        const stockNum = Number(stock);
        if (stock === "" || Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum))
            next.stock = "Stok harus berupa bilangan bulat ≥ 0";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSaving(true);
        const payload = {
            name: name.trim(),
            price: Number(price),
            stock: Number(stock),
        };
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
            const message =
                err instanceof ApiError ? err.message : "Gagal menyimpan produk.";
            toast.error(message);
            if (err instanceof ApiError && /nama|name|unique/i.test(message)) {
                setErrors((prev) => ({ ...prev, name: message }));
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal title={isEdit ? "Ubah Produk" : "Tambah Produk"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <VStack gap={4} hAlign="stretch">
                    <TextInput
                        label="Nama Produk"
                        placeholder="mis. Es Tebu Original"
                        size="lg"
                        value={name}
                        onChange={(v) => {
                            setName(v);
                            setErrors((p) => ({ ...p, name: undefined }));
                        }}
                        status={errors.name ? { type: "error", message: errors.name } : undefined}
                    />
                    <TextInput
                        label="Harga (Rp)"
                        placeholder="mis. 8000"
                        type="number"
                        size="lg"
                        value={price}
                        onChange={(v) => {
                            setPrice(v);
                            setErrors((p) => ({ ...p, price: undefined }));
                        }}
                        status={errors.price ? { type: "error", message: errors.price } : undefined}
                    />
                    <TextInput
                        label="Stok"
                        placeholder="mis. 50"
                        type="number"
                        size="lg"
                        value={stock}
                        onChange={(v) => {
                            setStock(v);
                            setErrors((p) => ({ ...p, stock: undefined }));
                        }}
                        status={errors.stock ? { type: "error", message: errors.stock } : undefined}
                    />
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

export default function Products() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [formTarget, setFormTarget] = useState(undefined); // undefined=closed, null=create, object=edit
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadProducts = useCallback(
        async (name) => {
            setIsLoading(true);
            try {
                const data = await productsApi.list(name);
                setProducts(data?.data?.products ?? []);
            } catch (err) {
                toast.error(
                    err instanceof ApiError ? err.message : "Gagal memuat produk.",
                );
            } finally {
                setIsLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        const timer = setTimeout(() => loadProducts(search), 300);
        return () => clearTimeout(timer);
    }, [search, loadProducts]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await productsApi.remove(deleteTarget.id);
            toast.success(`Produk "${deleteTarget.name}" berhasil dihapus.`);
            setDeleteTarget(null);
            await loadProducts(search);
        } catch (err) {
            toast.error(
                err instanceof ApiError ? err.message : "Gagal menghapus produk.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AppLayout title="Manajemen Produk">
            <VStack gap={4} hAlign="stretch">
                <HStack style={{ justifyContent: "space-between" }} vAlign="center" gap={3}>
                    <div style={{ maxWidth: 320, flex: 1 }}>
                        <TextInput
                            label="Cari produk"
                            isLabelHidden
                            placeholder="Cari nama produk…"
                            value={search}
                            onChange={setSearch}
                            size="md"
                        />
                    </div>
                    <Button
                        label="+ Tambah Produk"
                        variant="primary"
                        size="md"
                        onClick={() => setFormTarget(null)}
                    />
                </HStack>

                {isLoading ? (
                    <VStack gap={2}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    height: 64,
                                    borderRadius: 10,
                                    background: "var(--color-skeleton, #ebebeb)",
                                }}
                            />
                        ))}
                    </VStack>
                ) : products.length === 0 ? (
                    <VStack gap={3} hAlign="center">
                        <EmptyState
                            title="Belum ada produk"
                            description={
                                search
                                    ? `Tidak ditemukan produk untuk "${search}".`
                                    : "Tambahkan produk pertamamu untuk mulai berjualan."
                            }
                            icon={<Icon icon={ArchiveBoxIcon} size="lg" />}
                        />
                        {!search && (
                            <Button
                                label="+ Tambah Produk"
                                variant="primary"
                                onClick={() => setFormTarget(null)}
                            />
                        )}
                    </VStack>
                ) : (
                    <Card padding={0} width="100%">
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                                        {["Nama Produk", "Harga", "Stok", "Aksi"].map((h, i) => (
                                            <th
                                                key={h}
                                                style={{
                                                    textAlign: i === 3 ? "right" : "left",
                                                    padding: "12px 16px",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: 0.4,
                                                    color: "var(--color-text-secondary)",
                                                }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr
                                            key={product.id}
                                            style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "12px 16px" }}>
                                                <Text type="body" weight="medium">
                                                    {product.name}
                                                </Text>
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                <Text type="body">{formatRupiah(product.price)}</Text>
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                {stockBadge(product.stock)}
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                                <HStack gap={2} style={{ justifyContent: "flex-end" }}>
                                                    <button
                                                        onClick={() => setFormTarget(product)}
                                                        aria-label={`Ubah ${product.name}`}
                                                        style={{
                                                            background: "none",
                                                            border: "1px solid var(--color-border-emphasized)",
                                                            borderRadius: 8,
                                                            width: 32,
                                                            height: 32,
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            cursor: "pointer",
                                                            color: "var(--color-text-primary)",
                                                        }}>
                                                        <PencilSquareIcon style={{ width: 16, height: 16 }} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(product)}
                                                        aria-label={`Hapus ${product.name}`}
                                                        style={{
                                                            background: "none",
                                                            border: "1px solid var(--color-border-emphasized)",
                                                            borderRadius: 8,
                                                            width: 32,
                                                            height: 32,
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            cursor: "pointer",
                                                            color: "var(--color-error, #a50c25)",
                                                        }}>
                                                        <TrashIcon style={{ width: 16, height: 16 }} />
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
                    onSaved={() => {
                        setFormTarget(undefined);
                        loadProducts(search);
                    }}
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
