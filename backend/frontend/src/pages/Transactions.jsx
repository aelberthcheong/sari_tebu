import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { ClipboardDocumentListIcon, ReceiptRefundIcon, ChartBarIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";

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
        return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
    } catch { return iso; }
}

function formatDateShort(iso) {
    if (!iso) return "-";
    try {
        return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
    } catch { return iso; }
}

/* ── Mini bar chart ── */
function MiniBarChart({ transactions }) {
    // Group by day (last 7 days)
    const days = useMemo(() => {
        const map = new Map();
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            map.set(key, 0);
        }
        for (const t of transactions) {
            const key = new Date(t.created_at).toISOString().slice(0, 10);
            if (map.has(key)) map.set(key, (map.get(key) || 0) + t.total);
        }
        return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
    }, [transactions]);

    const maxVal = Math.max(...days.map((d) => d.total), 1);

    return (
        <VStack gap={2} hAlign="stretch">
            <HStack vAlign="center" gap={2}>
                <ChartBarIcon style={{ width: 16, height: 16, color: "var(--color-text-secondary)" }} />
                <Text type="supporting" color="secondary" weight="medium">Pendapatan 7 Hari Terakhir</Text>
            </HStack>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
                {days.map(({ date, total }) => (
                    <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div
                            title={`${formatDateShort(date)}: ${formatRupiah(total)}`}
                            style={{
                                width: "100%",
                                height: `${Math.max(4, (total / maxVal) * 48)}px`,
                                borderRadius: "4px 4px 0 0",
                                background: total > 0 ? "var(--color-accent)" : "var(--color-border)",
                                transition: "height 0.4s cubic-bezier(.34,1.56,.64,1)",
                                cursor: "default",
                            }}
                        />
                        <span style={{ fontSize: 9, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                            {formatDateShort(date)}
                        </span>
                    </div>
                ))}
            </div>
        </VStack>
    );
}

/* ── Detail Modal ── */
function TransactionDetailModal({ transaction, onClose }) {
    const itemCount = (transaction.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
    const receiptRef = useRef(null);

    const handlePrint = () => {
        const win = window.open("", "_blank", "width=400,height=600");
        win.document.write(`
            <html><head><title>Struk #${transaction.id}</title>
            <style>body{font-family:monospace;font-size:12px;padding:16px}h2{text-align:center;margin:0;font-size:14px}.divider{border-top:1px dashed #999;margin:8px 0}.row{display:flex;justify-content:space-between;margin:4px 0}.total{font-weight:bold;font-size:14px}.center{text-align:center}.footer{font-size:11px;color:#666;text-align:center;margin-top:8px}</style>
            </head><body>
            <h2>🌿 SARI TEBU POS</h2>
            <div class="center" style="font-size:11px;color:#666;margin:4px 0">${formatDate(transaction.created_at)}</div>
            <div class="divider"></div>
            ${(transaction.items ?? []).map(item => `<div class="row"><span>${item.product?.name??'?'} ×${item.quantity}</span><span>${formatRupiah(item.price_at_time*item.quantity)}</span></div>`).join("")}
            <div class="divider"></div>
            <div class="row total"><span>TOTAL</span><span>${formatRupiah(transaction.total)}</span></div>
            <div class="divider"></div>
            <div class="footer">ID: ${transaction.id}</div>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    return (
        <Modal title="Detail Transaksi" onClose={onClose} width={480}>
            <VStack gap={4} hAlign="stretch" ref={receiptRef}>
                <VStack gap={1}>
                    <Text type="supporting" color="secondary">ID Transaksi</Text>
                    <div style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: 12, padding: "6px 10px", background: "var(--color-background-muted)", borderRadius: 6 }}>
                        {transaction.id}
                    </div>
                </VStack>

                <HStack style={{ justifyContent: "space-between" }}>
                    <VStack gap={1}>
                        <Text type="supporting" color="secondary">Tanggal</Text>
                        <Text type="body">{formatDate(transaction.created_at)}</Text>
                    </VStack>
                    <Badge color="green" label={`${itemCount} item`} />
                </HStack>

                <div style={{ borderTop: "1px dashed var(--color-border-emphasized)", borderBottom: "1px dashed var(--color-border-emphasized)", padding: "12px 0" }}>
                    {(transaction.items ?? []).map((item) => (
                        <HStack key={item.product_id} style={{ justifyContent: "space-between", padding: "6px 0" }}>
                            <VStack gap={0}>
                                <Text type="body" size="sm">{item.product?.name ?? "Produk tidak diketahui"}</Text>
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
                    <Text type="body" weight="bold">Total</Text>
                    <Text type="display-1" as="span" style={{ color: "var(--color-accent)" }}>
                        {formatRupiah(transaction.total)}
                    </Text>
                </HStack>

                <button
                    onClick={handlePrint}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: "1px solid var(--color-border)",
                        background: "transparent",
                        color: "var(--color-text-secondary)",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                    }}
                >
                    <PrinterIcon style={{ width: 16, height: 16 }} />
                    Cetak Ulang Struk
                </button>
            </VStack>
        </Modal>
    );
}

export default function Transactions() {
    const toast = useToast();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            try {
                const data = await transactionsApi.list();
                if (!cancelled) setTransactions(data?.data ?? []);
            } catch (err) {
                if (!cancelled) toast.error(err instanceof ApiError ? err.message : "Gagal memuat riwayat transaksi.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []); // eslint-disable-line

    const totalRevenue = useMemo(() => transactions.reduce((sum, t) => sum + (t.total ?? 0), 0), [transactions]);
    const avgTransaction = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0;
    const todayRevenue = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        return transactions
            .filter((t) => new Date(t.created_at).toISOString().slice(0, 10) === today)
            .reduce((sum, t) => sum + t.total, 0);
    }, [transactions]);

    const filtered = useMemo(() => {
        if (!search) return transactions;
        return transactions.filter((t) => t.id.toLowerCase().includes(search.toLowerCase()));
    }, [transactions, search]);

    return (
        <AppLayout title="Riwayat Transaksi" subtitle="Pantau seluruh transaksi yang sudah selesai diproses.">
            <VStack gap={4} hAlign="stretch">
                {/* Stats */}
                {!isLoading && transactions.length > 0 && (
                    <>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {[
                                { label: "Total Transaksi", value: transactions.length, color: "blue" },
                                { label: "Pendapatan Hari Ini", value: formatRupiah(todayRevenue), color: "green", small: true },
                                { label: "Total Pendapatan", value: formatRupiah(totalRevenue), color: "teal", small: true },
                                { label: "Rata-rata / Transaksi", value: formatRupiah(avgTransaction), color: "purple", small: true },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    style={{
                                        flex: 1,
                                        minWidth: 140,
                                        padding: "10px 14px",
                                        borderRadius: 10,
                                        background: `var(--color-background-${stat.color})`,
                                        animation: "statFadeIn 0.4s ease-out both",
                                    }}
                                >
                                    <div style={{ fontSize: stat.small ? 14 : 22, fontWeight: 700, color: `var(--color-text-${stat.color})`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: 11, color: `var(--color-text-${stat.color})`, opacity: 0.8 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                        <style>{`@keyframes statFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>

                        <Card padding={4} width="100%">
                            <MiniBarChart transactions={transactions} />
                        </Card>
                    </>
                )}

                {/* Search */}
                {!isLoading && transactions.length > 0 && (
                    <div style={{ maxWidth: 320 }}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari ID transaksi…"
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "1px solid var(--color-border)",
                                borderRadius: 8,
                                background: "var(--color-background-surface)",
                                color: "var(--color-text-primary)",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                )}

                {isLoading ? (
                    <VStack gap={2}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ height: 64, borderRadius: 10, background: "var(--color-skeleton, #ebebeb)", animation: "skeletonPulse 1.5s ease infinite", animationDelay: `${i * 0.1}s` }} />
                        ))}
                        <style>{`@keyframes skeletonPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
                    </VStack>
                ) : transactions.length === 0 ? (
                    <EmptyState
                        title="Belum ada transaksi"
                        description="Transaksi yang selesai akan muncul di sini."
                        icon={<Icon icon={ClipboardDocumentListIcon} size="lg" />}
                    />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title="Tidak ditemukan"
                        description={`Tidak ada transaksi dengan ID "${search}".`}
                        icon={<Icon icon={ClipboardDocumentListIcon} size="lg" />}
                    />
                ) : (
                    <Card padding={0} width="100%">
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                                        {["#", "ID Transaksi", "Tanggal", "Item", "Total", ""].map((h, i) => (
                                            <th key={h || i} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--color-text-secondary)" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((t, idx) => {
                                        const itemCount = (t.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
                                        return (
                                            <tr
                                                key={t.id}
                                                style={{
                                                    borderBottom: "1px solid var(--color-border)",
                                                    cursor: "pointer",
                                                    transition: "background 0.1s",
                                                    animation: `rowIn 0.2s ease-out ${idx * 0.03}s both`,
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background-muted)"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                onClick={() => setSelected(t)}
                                            >
                                                <style>{`@keyframes rowIn { from { opacity:0; } to { opacity:1; } }`}</style>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Text type="supporting" color="secondary">{transactions.length - transactions.indexOf(t)}</Text>
                                                </td>
                                                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {t.id}
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Text type="body" size="sm">{formatDate(t.created_at)}</Text>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Badge color="gray" label={`${itemCount}×`} />
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Text type="body" weight="medium">{formatRupiah(t.total)}</Text>
                                                </td>
                                                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                                    <ReceiptRefundIcon style={{ width: 18, height: 18, color: "var(--color-text-secondary)" }} />
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
                <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
            )}
        </AppLayout>
    );
}
