import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    ArchiveBoxIcon,
    TrophyIcon,
    ExclamationTriangleIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "#/layouts/AppLayout.jsx";
import { Badge } from "#/components/Badge.jsx";
import { transactionsApi, productsApi, ApiError } from "#/lib/api.js";
import { useToast } from "#/context/ToastContext.jsx";

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function formatDateShort(iso) {
    if (!iso) return "-";
    try {
        return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
    } catch { return iso; }
}

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

const RANGE_OPTIONS = [
    { key: "7d", label: "7 Hari", days: 7 },
    { key: "30d", label: "30 Hari", days: 30 },
    { key: "90d", label: "90 Hari", days: 90 },
    { key: "all", label: "Semua", days: null },
];

/* ── Stat Card ── */
function StatCard({ icon: IconCmp, label, value, color = "blue", sub }) {
    return (
        <Card padding={4} width="100%">
            <HStack gap={3} vAlign="center">
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `var(--color-background-${color})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <IconCmp style={{ width: 20, height: 20, color: `var(--color-text-${color})` }} />
                </div>
                <VStack gap={0}>
                    <Text type="display-2" as="div">{value}</Text>
                    <Text type="supporting" color="secondary">{label}</Text>
                    {sub && <Text type="supporting" size="sm" color="secondary">{sub}</Text>}
                </VStack>
            </HStack>
        </Card>
    );
}

/* ── Bar chart pendapatan harian ── */
function RevenueBarChart({ points }) {
    const maxVal = Math.max(...points.map((p) => p.total), 1);
    return (
        <VStack gap={3} hAlign="stretch">
            <HStack vAlign="center" gap={2}>
                <ChartBarIcon style={{ width: 16, height: 16, color: "var(--color-text-secondary)" }} />
                <Text type="body" weight="medium">Tren Pendapatan</Text>
            </HStack>
            <div style={{ display: "flex", alignItems: "flex-end", gap: points.length > 30 ? 2 : 6, height: 140, overflowX: "auto" }}>
                {points.map(({ date, total }) => (
                    <div key={date} style={{ flex: 1, minWidth: points.length > 30 ? 3 : 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div
                            title={`${formatDateShort(date)}: ${formatRupiah(total)}`}
                            style={{
                                width: "100%",
                                height: `${Math.max(2, (total / maxVal) * 120)}px`,
                                borderRadius: "3px 3px 0 0",
                                background: total > 0 ? "var(--color-accent)" : "var(--color-border)",
                                transition: "height 0.4s cubic-bezier(.34,1.56,.64,1)",
                            }}
                        />
                        {points.length <= 14 && (
                            <span style={{ fontSize: 9, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                                {formatDateShort(date)}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </VStack>
    );
}

/* ── Produk terlaris ── */
function TopProductsList({ items }) {
    if (items.length === 0) {
        return <Text type="supporting" color="secondary">Belum ada data penjualan.</Text>;
    }
    const maxQty = Math.max(...items.map((i) => i.quantity), 1);
    return (
        <VStack gap={3} hAlign="stretch">
            {items.map((item, idx) => (
                <VStack key={item.id} gap={1} hAlign="stretch">
                    <HStack style={{ justifyContent: "space-between" }} vAlign="center">
                        <HStack gap={2} vAlign="center">
                            <Text type="supporting" color="secondary" style={{ width: 16 }}>{idx + 1}.</Text>
                            <Text type="body" size="sm" weight="medium">{item.name}</Text>
                        </HStack>
                        <Text type="body" size="sm" color="secondary">{item.quantity} terjual · {formatRupiah(item.revenue)}</Text>
                    </HStack>
                    <div style={{ height: 6, borderRadius: 4, background: "var(--color-background-muted)", overflow: "hidden" }}>
                        <div
                            style={{
                                height: "100%",
                                width: `${(item.quantity / maxQty) * 100}%`,
                                background: "var(--color-accent)",
                                borderRadius: 4,
                                transition: "width 0.4s ease",
                            }}
                        />
                    </div>
                </VStack>
            ))}
        </VStack>
    );
}

export default function Dashboard() {
    const toast = useToast();
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [range, setRange] = useState("30d");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            try {
                const [txRes, prodRes] = await Promise.all([
                    transactionsApi.list(),
                    productsApi.list(),
                ]);
                if (cancelled) return;
                setTransactions(txRes?.data ?? []);
                setProducts(prodRes?.data?.products ?? []);
            } catch (err) {
                if (!cancelled) {
                    toast.error(err instanceof ApiError ? err.message : "Gagal memuat data dashboard.");
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rangeConfig = RANGE_OPTIONS.find((r) => r.key === range) ?? RANGE_OPTIONS[1];

    const filteredTx = useMemo(() => {
        if (!rangeConfig.days) return transactions;
        const cutoff = startOfDay(new Date());
        cutoff.setDate(cutoff.getDate() - (rangeConfig.days - 1));
        return transactions.filter((t) => new Date(t.created_at) >= cutoff);
    }, [transactions, rangeConfig]);

    const stats = useMemo(() => {
        const totalRevenue = filteredTx.reduce((sum, t) => sum + (t.total ?? 0), 0);
        const totalTx = filteredTx.length;
        const avg = totalTx > 0 ? totalRevenue / totalTx : 0;
        const today = startOfDay(new Date());
        const todayRevenue = transactions
            .filter((t) => startOfDay(t.created_at).getTime() === today.getTime())
            .reduce((sum, t) => sum + (t.total ?? 0), 0);
        return { totalRevenue, totalTx, avg, todayRevenue };
    }, [filteredTx, transactions]);

    const chartPoints = useMemo(() => {
        const days = rangeConfig.days ?? Math.max(1, Math.ceil(
            (Date.now() - Math.min(...transactions.map((t) => new Date(t.created_at).getTime()), Date.now())) / 86400000,
        ) + 1);
        const map = new Map();
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            map.set(d.toISOString().slice(0, 10), 0);
        }
        for (const t of filteredTx) {
            const key = new Date(t.created_at).toISOString().slice(0, 10);
            if (map.has(key)) map.set(key, (map.get(key) || 0) + (t.total ?? 0));
        }
        return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
    }, [filteredTx, rangeConfig, transactions]);

    const topProducts = useMemo(() => {
        const map = new Map();
        for (const t of filteredTx) {
            for (const item of (t.items ?? [])) {
                const key = item.product_id;
                const name = item.product?.name ?? "Produk tidak diketahui";
                const prev = map.get(key) ?? { id: key, name, quantity: 0, revenue: 0 };
                prev.quantity += item.quantity;
                prev.revenue += (item.price_at_time ?? 0) * item.quantity;
                map.set(key, prev);
            }
        }
        return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    }, [filteredTx]);

    const lowStockProducts = useMemo(
        () => products.filter((p) => (p.stock ?? 0) <= 15).sort((a, b) => a.stock - b.stock).slice(0, 6),
        [products],
    );

    return (
        <AppLayout title="Dashboard" subtitle="Ringkasan penjualan, produk terlaris, dan status stok.">
            <VStack gap={5} hAlign="stretch">
                {/* Range filter */}
                <HStack gap={2} vAlign="center">
                    <CalendarDaysIcon style={{ width: 16, height: 16, color: "var(--color-text-secondary)" }} />
                    <HStack gap={1}>
                        {RANGE_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setRange(opt.key)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: "1px solid var(--color-border)",
                                    background: range === opt.key ? "var(--color-accent)" : "transparent",
                                    color: range === opt.key ? "var(--color-text-on-accent, #fff)" : "var(--color-text-secondary)",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </HStack>
                </HStack>

                {isLoading ? (
                    <VStack gap={2}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} style={{ height: 80, borderRadius: 10, background: "var(--color-skeleton, #ebebeb)", animation: "skeletonPulse 1.5s ease infinite", animationDelay: `${i * 0.1}s` }} />
                        ))}
                        <style>{`@keyframes skeletonPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
                    </VStack>
                ) : transactions.length === 0 ? (
                    <EmptyState
                        title="Belum ada data"
                        description="Dashboard akan terisi setelah ada transaksi."
                        icon={<Icon icon={ChartBarIcon} size="lg" />}
                    />
                ) : (
                    <>
                        {/* Stat cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                            <StatCard icon={CurrencyDollarIcon} color="green" label="Pendapatan (rentang)" value={formatRupiah(stats.totalRevenue)} />
                            <StatCard icon={CurrencyDollarIcon} color="teal" label="Pendapatan Hari Ini" value={formatRupiah(stats.todayRevenue)} />
                            <StatCard icon={ShoppingCartIcon} color="blue" label="Jumlah Transaksi" value={stats.totalTx} />
                            <StatCard icon={ChartBarIcon} color="purple" label="Rata-rata / Transaksi" value={formatRupiah(stats.avg)} />
                        </div>

                        {/* Chart */}
                        <Card padding={4} width="100%">
                            <RevenueBarChart points={chartPoints} />
                        </Card>

                        {/* Two column: top products & low stock */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <Card padding={4} width="100%">
                                <VStack gap={4} hAlign="stretch">
                                    <HStack gap={2} vAlign="center">
                                        <TrophyIcon style={{ width: 16, height: 16, color: "var(--color-text-secondary)" }} />
                                        <Text type="body" weight="medium">Produk Terlaris</Text>
                                    </HStack>
                                    <TopProductsList items={topProducts} />
                                </VStack>
                            </Card>

                            <Card padding={4} width="100%">
                                <VStack gap={4} hAlign="stretch">
                                    <HStack gap={2} vAlign="center">
                                        <ExclamationTriangleIcon style={{ width: 16, height: 16, color: "var(--color-text-secondary)" }} />
                                        <Text type="body" weight="medium">Stok Menipis</Text>
                                    </HStack>
                                    {lowStockProducts.length === 0 ? (
                                        <Text type="supporting" color="secondary">Semua stok aman.</Text>
                                    ) : (
                                        <VStack gap={2} hAlign="stretch">
                                            {lowStockProducts.map((p) => (
                                                <HStack key={p.id} style={{ justifyContent: "space-between" }} vAlign="center">
                                                    <HStack gap={2} vAlign="center">
                                                        <ArchiveBoxIcon style={{ width: 14, height: 14, color: "var(--color-text-secondary)" }} />
                                                        <Text type="body" size="sm">{p.name}</Text>
                                                    </HStack>
                                                    <Badge
                                                        color={p.stock <= 0 ? "red" : p.stock <= 5 ? "red" : "yellow"}
                                                        label={p.stock <= 0 ? "Habis" : `${p.stock} tersisa`}
                                                    />
                                                </HStack>
                                            ))}
                                        </VStack>
                                    )}
                                </VStack>
                            </Card>
                        </div>
                    </>
                )}
            </VStack>
        </AppLayout>
    );
}
