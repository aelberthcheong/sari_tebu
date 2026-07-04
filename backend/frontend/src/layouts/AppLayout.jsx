import { AppShell } from "@astryxdesign/core/AppShell";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import {
    SideNav,
    SideNavItem,
    SideNavSection,
} from "@astryxdesign/core/SideNav";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import {
    ShoppingCartIcon,
    ArchiveBoxIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    ArrowLeftStartOnRectangleIcon,
    SunIcon,
    MoonIcon,
    ChartBarIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router";

import { Badge } from "#/components/Badge.jsx";
import { useAuth } from "#/context/AuthContext.jsx";
import { useToast } from "#/context/ToastContext.jsx";
import { useTheme } from "#/context/ThemeContext.jsx";

// `roles: null` berarti semua role boleh lihat menu ini.
const NAV_ITEMS = [
    {
        label: "Dashboard",
        icon: ChartBarIcon,
        path: "/dashboard",
        // Laporan & analitik hanya relevan untuk OWNER dan ADMIN.
        roles: ["OWNER", "ADMIN"],
    },
    { label: "Kasir (POS)", icon: ShoppingCartIcon, path: "/pos", roles: null },
    {
        label: "Produk",
        icon: ArchiveBoxIcon,
        path: "/products",
        // Hanya OWNER dan ADMIN yang boleh mengelola produk & stok.
        roles: ["OWNER", "ADMIN"],
    },
    { label: "Transaksi", icon: ClipboardDocumentListIcon, path: "/transactions", roles: null },
    {
        label: "Karyawan",
        icon: UsersIcon,
        path: "/users",
        // Manajemen akun karyawan hanya untuk OWNER.
        roles: ["OWNER"],
    },
];

const ROLE_BADGE_COLOR = {
    OWNER: "purple",
    ADMIN: "blue",
    KASIR: "green",
};

const ROLE_LABEL = {
    OWNER: "Owner",
    ADMIN: "Admin",
    KASIR: "Kasir",
};

function DarkModeButton() {
    const { mode, toggle } = useTheme();
    return (
        <button
            onClick={toggle}
            aria-label={mode === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
            title={mode === "dark" ? "Mode Terang" : "Mode Gelap"}
            style={{
                background: "none",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                cursor: "pointer",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--color-text-secondary)",
                fontSize: 13,
                transition: "all 0.2s ease",
            }}
        >
            {mode === "dark" ? (
                <SunIcon style={{ width: 16, height: 16 }} />
            ) : (
                <MoonIcon style={{ width: 16, height: 16 }} />
            )}
        </button>
    );
}

export default function AppLayout({
    children,
    title = "Sari Tebu POS",
    subtitle,
    actions,
    contentPadding = 6,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, role } = useAuth();
    const toast = useToast();
    const { mode, toggle } = useTheme();

    const visibleNavItems = NAV_ITEMS.filter(
        (item) => !item.roles || item.roles.includes(role),
    );

    const handleLogout = async () => {
        await logout();
        toast.info("Kamu telah keluar dari akun.");
        navigate("/login", { replace: true });
    };

    return (
        <AppShell
            contentPadding={contentPadding}
            style={{ height: "100%", minHeight: 0 }}
            topNav={
                <TopNav
                    label="Navigasi utama"
                    heading={
                        <TopNavHeading
                            heading="Sari Tebu"
                            logo={
                                <NavIcon
                                    icon={
                                        <span style={{ fontSize: 16 }}>🌿</span>
                                    }
                                />
                            }
                        />
                    }
                    startContent={
                        <HStack gap={0}>
                            {visibleNavItems.map((item) => (
                                <TopNavItem
                                    key={item.path}
                                    label={item.label}
                                    href="#"
                                    isSelected={location.pathname.startsWith(item.path)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(item.path);
                                    }}
                                />
                            ))}
                        </HStack>
                    }
                    endContent={
                        <HStack gap={2} vAlign="center">
                            {role && (
                                <Badge
                                    label={ROLE_LABEL[role] ?? role}
                                    color={ROLE_BADGE_COLOR[role] ?? "gray"}
                                />
                            )}
                            <DarkModeButton />
                            <TopNavItem
                                label="Keluar"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLogout();
                                }}
                            />
                        </HStack>
                    }
                />
            }
            sideNav={
                <SideNav>
                    <SideNavSection title="Menu" isHeaderHidden>
                        {visibleNavItems.map((item) => (
                            <SideNavItem
                                key={item.path}
                                label={item.label}
                                icon={item.icon}
                                isSelected={location.pathname.startsWith(item.path)}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(item.path);
                                }}
                            />
                        ))}
                    </SideNavSection>
                    <SideNavSection title="Akun">
                        <SideNavItem
                            label="Pengaturan"
                            icon={Cog6ToothIcon}
                            isSelected={location.pathname.startsWith("/settings")}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate("/settings");
                            }}
                        />
                        <SideNavItem
                            label={mode === "dark" ? "Mode Terang" : "Mode Gelap"}
                            icon={mode === "dark" ? SunIcon : MoonIcon}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                toggle();
                            }}
                        />
                        <SideNavItem
                            label="Keluar"
                            icon={ArrowLeftStartOnRectangleIcon}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}
                        />
                    </SideNavSection>
                </SideNav>
            }>
            {title && (
                <div
                    style={{
                        marginBottom: 20,
                        // NOTE: Saat contentPadding={0} (mis. halaman POS yang butuh
                        // grid full-bleed), judul tetap perlu padding horizontal
                        // sendiri supaya sejajar rapi dengan konten di bawahnya
                        // alih-alih mepet ke tepi kiri/kanan layar.
                        padding: contentPadding === 0 ? "24px 24px 0" : 0,
                    }}
                >
                    <HStack
                        style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
                        vAlign="end"
                    >
                        <VStack gap={1}>
                            <Text type="display-1" as="h1">
                                {title}
                            </Text>
                            {subtitle && (
                                <Text type="supporting" color="secondary">
                                    {subtitle}
                                </Text>
                            )}
                        </VStack>
                        {actions && <div>{actions}</div>}
                    </HStack>
                </div>
            )}
            {children}
        </AppShell>
    );
}
