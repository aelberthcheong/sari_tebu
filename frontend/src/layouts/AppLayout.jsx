import { AppShell } from "@astryxdesign/core/AppShell";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import {
    SideNav,
    SideNavItem,
    SideNavSection,
} from "@astryxdesign/core/SideNav";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import { HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import {
    ShoppingCartIcon,
    ArchiveBoxIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    ArrowLeftStartOnRectangleIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router";

import { useAuth } from "#/context/AuthContext.jsx";
import { useToast } from "#/context/ToastContext.jsx";

const NAV_ITEMS = [
    { label: "Kasir (POS)", icon: ShoppingCartIcon, path: "/pos" },
    { label: "Produk", icon: ArchiveBoxIcon, path: "/products" },
    { label: "Transaksi", icon: ClipboardDocumentListIcon, path: "/transactions" },
];

export default function AppLayout({ children, title = "Sari Tebu POS", contentPadding = 6 }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const toast = useToast();

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
                                        <GlobeAltIcon
                                            style={{ width: 16, height: 16 }}
                                        />
                                    }
                                />
                            }
                        />
                    }
                    startContent={
                        <HStack gap={0}>
                            {NAV_ITEMS.map((item) => (
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
                        <TopNavItem
                            label="Keluar"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}
                        />
                    }
                />
            }
            sideNav={
                <SideNav>
                    <SideNavSection title="Menu" isHeaderHidden>
                        {NAV_ITEMS.map((item) => (
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
                <div style={{ marginBottom: 20 }}>
                    <Text type="display-1" as="h1">
                        {title}
                    </Text>
                </div>
            )}
            {children}
        </AppShell>
    );
}
