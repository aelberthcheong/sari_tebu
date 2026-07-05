import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { ClipboardDocumentListIcon, ReceiptRefundIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "#/layouts/AppLayout.jsx";
import { Badge } from "#/components/Badge.jsx";
import { Modal } from "#/components/Modal.jsx";
import { transactionsApi, ApiError } from "#/lib/api.js";
import { useToast } from "#/context/ToastContext.jsx";

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function formatDate(iso) {
    if (!iso) return "-";
    try {
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function TransactionDetailModal({ transaction, onClose }) {
    const itemCount = (transaction.items ?? []).reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    return (
        <Modal title="Detail Transaksi" onClose={onClose} width={460}>
            <VStack gap={4} hAlign="stretch">
                <VStack gap={1}>
                    <Text type="supporting" color="secondary">
                        ID Transaksi
                    </Text>
                    <div style={{ wordBreak: "break-all" }}>
                        <Text type="body" weight="medium">
                            {transaction.id}
                        </Text>
                    </div>
                </VStack>

                <HStack style={{ justifyContent: "space-between" }}>
                    <VStack gap={1}>
                        <Text type="supporting" color="secondary">
                            Tanggal
                        </Text>
                        <Text type="body">{formatDate(transaction.created_at)}</Text>
                    </VStack>
                    <Badge color="green" label={`${itemCount} item`} />
                </HStack>

                <div
                    style={{
                        borderTop: "1px dashed var(--color-border-emphasized)",
                        borderBottom: "1px dashed var(--color-border-emphasized)",
                        padding: "12px 0",
                    }}>
                    {(transaction.items ?? []).map((item) => (
                        <HStack
                            key={item.product_id}
                            style={{ justifyContent: "space-between", padding: "6px 0" }}>
                            <VStack gap={0}>
                                <Text type="body" size="sm">
                                    {item.product?.name ?? "Produk tidak diketahui"}
                                </Text>
                                <Text type="supporting" color="secondary" size="sm">
                                    {formatRupiah(item.price_at_time)} × {item.quantity}
                                </Text>
                            </VStack>
                            <Text type="body" weight="medium" size="sm">
                                {formatRupiah(item.price_at_time * item.quantity)}
                            </Text>
                        </HStack>
                    ))}
                </div>

                <HStack style={{ justifyContent: "space-between" }}>
                    <Text type="body" weight="bold">
                        Total
                    </Text>
                    <Text type="display-1" as="span">
                        {formatRupiah(transaction.total)}
                    </Text>
                </HStack>
            </VStack>
        </Modal>
    );
}

export default function Transactions() {
    const toast = useToast();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            try {
                const data = await transactionsApi.list();
                if (!cancelled) setTransactions(data?.data ?? []);
            } catch (err) {
                if (!cancelled) {
                    toast.error(
                        err instanceof ApiError
                            ? err.message
                            : "Gagal memuat riwayat transaksi.",
                    );
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalRevenue = useMemo(
        () => transactions.reduce((sum, t) => sum + (t.total ?? 0), 0),
        [transactions],
    );

    return (
        <AppLayout title="Riwayat Transaksi">
            <VStack gap={4} hAlign="stretch">
                {!isLoading && transactions.length > 0 && (
                    <HStack gap={4} style={{ flexWrap: "wrap" }}>
                        <div style={{ minWidth: 200 }}>
                            <Card padding={4}>
                                <VStack gap={1}>
                                    <Text type="supporting" color="secondary">
                                        Total Transaksi
                                    </Text>
                                    <Text type="display-1" as="span">
                                        {transactions.length}
                                    </Text>
                                </VStack>
                            </Card>
                        </div>
                        <div style={{ minWidth: 200 }}>
                            <Card padding={4}>
                                <VStack gap={1}>
                                    <Text type="supporting" color="secondary">
                                        Total Pendapatan
                                    </Text>
                                    <Text type="display-1" as="span">
                                        {formatRupiah(totalRevenue)}
                                    </Text>
                                </VStack>
                            </Card>
                        </div>
                    </HStack>
                )}

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
                ) : transactions.length === 0 ? (
                    <EmptyState
                        title="Belum ada transaksi"
                        description="Transaksi yang selesai akan muncul di sini."
                        icon={<Icon icon={ClipboardDocumentListIcon} size="lg" />}
                    />
                ) : (
                    <Card padding={0} width="100%">
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                                        {["ID Transaksi", "Tanggal", "Jumlah Item", "Total", ""].map(
                                            (h, i) => (
                                                <th
                                                    key={h || i}
                                                    style={{
                                                        textAlign: "left",
                                                        padding: "12px 16px",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        textTransform: "uppercase",
                                                        letterSpacing: 0.4,
                                                        color: "var(--color-text-secondary)",
                                                    }}>
                                                    {h}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t) => {
                                        const itemCount = (t.items ?? []).reduce(
                                            (sum, item) => sum + item.quantity,
                                            0,
                                        );
                                        return (
                                            <tr
                                                key={t.id}
                                                style={{
                                                    borderBottom: "1px solid var(--color-border)",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => setSelected(t)}>
                                                <td
                                                    style={{
                                                        padding: "12px 16px",
                                                        fontFamily: "monospace",
                                                        fontSize: 12.5,
                                                        maxWidth: 220,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}>
                                                    {t.id}
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Text type="body" size="sm">
                                                        {formatDate(t.created_at)}
                                                    </Text>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Badge color="gray" label={`${itemCount} item`} />
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Text type="body" weight="medium">
                                                        {formatRupiah(t.total)}
                                                    </Text>
                                                </td>
                                                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                                    <ReceiptRefundIcon
                                                        style={{
                                                            width: 18,
                                                            height: 18,
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </VStack>

            {selected && (
                <TransactionDetailModal
                    transaction={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </AppLayout>
    );
}
