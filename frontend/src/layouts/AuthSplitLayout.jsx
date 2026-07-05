import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { Grid } from "@astryxdesign/core/Grid";
import { Icon } from "@astryxdesign/core/Icon";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const COVER_IMAGE_URL = "/tebu.jpg";
const COLUMN_MIN_WIDTH = 240;

const pageStyle = {
    minHeight: "100%",
    backgroundColor: "var(--color-background-body)",
    padding: "var(--spacing-6)",
};

const cardWrap = {
    width: "100%",
    maxWidth: 1000,
    marginInline: "auto",
};

const coverImageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
};

const AUTH_LAYOUT_CSS = `
.login-split-grid {
    container-type: inline-size;
    container-name: login-split;
    padding: var(--spacing-8);
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch; 
}

.login-split-image {
    width: 100%;
    height: 100%;
    min-height: 450px;
    order: 0;
}

@container login-split (max-width: 511px) {
    .login-split-grid {
        padding: var(--spacing-4);
        grid-template-columns: 1fr;
    }
  
    .login-split-image {
        order: -1;
        height: 180px;
        min-height: unset;
    }
}

/* Reusable Smooth Page Transition */
.auth-fade-in {
    animation: authFadeIn 0.4s ease-out forwards;
}

@keyframes authFadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Skeleton Pulse Animation */
.auth-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: pulseGlow 1.5s infinite linear;
    border-radius: 6px;
}

@keyframes pulseGlow {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
`;

// Simple skeleton element component
function FormSkeleton() {
    return (
        <VStack gap={5} hAlign="stretch" width="100%">
            <VStack gap={2}>
                <div
                    className="auth-skeleton"
                    style={{ height: "32px", width: "60%" }}
                />
                <div
                    className="auth-skeleton"
                    style={{ height: "18px", width: "40%" }}
                />
            </VStack>
            <VStack gap={3}>
                <div
                    className="auth-skeleton"
                    style={{ height: "48px", width: "100%" }}
                />
                <div
                    className="auth-skeleton"
                    style={{ height: "48px", width: "100%" }}
                />
            </VStack>
            <div
                className="auth-skeleton"
                style={{ height: "44px", width: "100%", marginTop: "8px" }}
            />
        </VStack>
    );
}

export function AuthSplitLayout({ children, isLoading = false }) {
    return (
        <Center axis="both" style={pageStyle}>
            <style>{AUTH_LAYOUT_CSS}</style>
            <div style={cardWrap} className="auth-fade-in">
                <Card padding={0} width="100%">
                    <Grid
                        columns={{
                            minWidth: COLUMN_MIN_WIDTH,
                            repeat: "fit",
                        }}
                        gap={8}
                        align="stretch"
                        className="login-split-grid">
                        {/* Left Side: Dynamic Content / Skeleton */}
                        <div
                            style={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}>
                            <VStack gap={4} height="100%">
                                <HStack gap={2} vAlign="center">
                                    <Icon icon={GlobeAltIcon} />
                                    <Text type="body" weight="bold">
                                        Sari Tebu
                                    </Text>
                                </HStack>

                                <div
                                    style={{
                                        flex: "1 1 auto",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                    }}>
                                    {isLoading ? <FormSkeleton /> : children}
                                </div>
                            </VStack>
                        </div>

                        {/* Right Side: Cover image */}
                        <div className="login-split-image">
                            <Card
                                variant="transparent"
                                padding={0}
                                width="100%"
                                height="100%">
                                <img
                                    style={coverImageStyle}
                                    src={COVER_IMAGE_URL}
                                    alt="Sugarcane field background"
                                />
                            </Card>
                        </div>
                    </Grid>
                </Card>
            </div>
        </Center>
    );
}
