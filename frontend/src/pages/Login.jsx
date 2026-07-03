import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { Icon } from "@astryxdesign/core/Icon";
import { VStack, HStack, StackItem } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { Section } from "@astryxdesign/core/Section";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { SquaresPlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const COVER_IMAGE_URL =
    "https://lookaside.facebook.com/assets/astryx/light-working-vertical-1.png";
const APPLE_LOGO_URL =
    "https://lookaside.facebook.com/assets/astryx/AppleLogo.png";
const GOOGLE_LOGO_URL =
    "https://lookaside.facebook.com/assets/astryx/GoogleLogo.png";

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
const coverImage = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
};

const LOGIN_SPLIT_CSS = `
.login-split-grid {
  container-type: inline-size;
  container-name: login-split;
  padding: var(--spacing-8);
}
.login-split-image {
  width: 100%;
  order: 0;
}
@container login-split (max-width: 511px) {
  .login-split-grid {
    padding: var(--spacing-4);
  }
  .login-split-image {
    order: -1;
  }
}
`;

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginFailed, setLoginFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setLoginFailed(true);
            return;
        }
        setIsLoading(true);
        setLoginFailed(false);

        const res = await fetch("/api/auth-sessions/login", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailAddress: email, password }),
        });

        if (res.ok) {
            setIsSuccess(true);
            setTimeout(() => navigate("/dashboard"), 1000);
        } else {
            setIsLoading(false);
            setLoginFailed(true);
        }
    };

    return (
        <Center axis="both" style={pageStyle}>
            <style>{LOGIN_SPLIT_CSS}</style>
            <VStack gap={4} width="100%">
                <div style={cardWrap}>
                    <Card padding={0} width="100%">
                        <Grid
                            columns={{
                                minWidth: COLUMN_MIN_WIDTH,
                                repeat: "fit",
                            }}
                            gap={8}
                            align="stretch"
                            className="login-split-grid">
                            {/* Form */}
                            <Section
                                variant="transparent"
                                padding={0}
                                height="100%">
                                <VStack gap={4} height="100%">
                                    <HStack gap={2} vAlign="center">
                                        <Icon icon={SquaresPlusIcon} />
                                        <Text type="body" weight="bold">
                                            Product Inc.
                                        </Text>
                                    </HStack>

                                    <StackItem size="fill">
                                        <Center axis="vertical" height="100%">
                                            {isSuccess ? (
                                                <EmptyState
                                                    title="You're signed in"
                                                    description="Redirecting to your dashboard…"
                                                    icon={
                                                        <Icon
                                                            icon={
                                                                CheckCircleIcon
                                                            }
                                                            size="lg"
                                                        />
                                                    }
                                                />
                                            ) : (
                                                <VStack
                                                    gap={4}
                                                    hAlign="stretch"
                                                    width="100%">
                                                    <VStack gap={1}>
                                                        <Text
                                                            type="display-1"
                                                            as="h2">
                                                            Welcome back
                                                        </Text>
                                                        <Text
                                                            type="body"
                                                            color="secondary"
                                                            size="sm">
                                                            Login to your
                                                            Product Inc. account
                                                        </Text>
                                                    </VStack>

                                                    <VStack gap={2}>
                                                        <TextInput
                                                            label="Email"
                                                            isLabelHidden
                                                            type="email"
                                                            placeholder="name@company.com"
                                                            value={email}
                                                            onChange={setEmail}
                                                            size="lg"
                                                        />
                                                        <VStack gap={1}>
                                                            <TextInput
                                                                label="Password"
                                                                isLabelHidden
                                                                placeholder="Enter your password"
                                                                type="password"
                                                                value={password}
                                                                onChange={(
                                                                    v,
                                                                ) => {
                                                                    setPassword(
                                                                        v,
                                                                    );
                                                                    setLoginFailed(
                                                                        false,
                                                                    );
                                                                }}
                                                                size="lg"
                                                                status={
                                                                    loginFailed
                                                                        ? {
                                                                              type: "error",
                                                                              message:
                                                                                  "Incorrect password. Try again.",
                                                                          }
                                                                        : undefined
                                                                }
                                                            />
                                                            {loginFailed && (
                                                                <VStack hAlign="end">
                                                                    <Link
                                                                        href="#"
                                                                        size="sm"
                                                                        color="secondary"
                                                                        type="supporting">
                                                                        Forgot
                                                                        your
                                                                        password?
                                                                    </Link>
                                                                </VStack>
                                                            )}
                                                        </VStack>
                                                    </VStack>

                                                    <Button
                                                        label="Login"
                                                        variant="primary"
                                                        size="lg"
                                                        isLoading={isLoading}
                                                        onClick={handleLogin}
                                                    />

                                                    <Divider label="Or continue with" />

                                                    <Grid
                                                        columns={2}
                                                        gap={3}
                                                        justify="stretch">
                                                        <Button
                                                            label="Apple"
                                                            variant="secondary"
                                                            icon={
                                                                <img
                                                                    src={
                                                                        APPLE_LOGO_URL
                                                                    }
                                                                    alt=""
                                                                    width={16}
                                                                    height={16}
                                                                />
                                                            }
                                                            size="lg"
                                                        />
                                                        <Button
                                                            label="Google"
                                                            variant="secondary"
                                                            icon={
                                                                <img
                                                                    src={
                                                                        GOOGLE_LOGO_URL
                                                                    }
                                                                    alt=""
                                                                    width={16}
                                                                    height={16}
                                                                />
                                                            }
                                                            size="lg"
                                                        />
                                                    </Grid>
                                                </VStack>
                                            )}
                                        </Center>
                                    </StackItem>

                                    {!isSuccess && (
                                        <Text
                                            type="supporting"
                                            color="secondary">
                                            Don&apos;t have an account?{" "}
                                            <Link href="#" type="supporting">
                                                Sign up
                                            </Link>
                                        </Text>
                                    )}
                                </VStack>
                            </Section>

                            {/* Cover image */}
                            <div className="login-split-image">
                                <Card
                                    variant="transparent"
                                    padding={0}
                                    width="100%"
                                    height="100%">
                                    <img
                                        style={coverImage}
                                        src={COVER_IMAGE_URL}
                                        alt="Two people working at a desk"
                                    />
                                </Card>
                            </div>
                        </Grid>
                    </Card>
                </div>

                <VStack hAlign="center">
                    <Text type="supporting" color="secondary">
                        By clicking continue, you agree to our{" "}
                        <Link href="#" type="supporting">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" type="supporting">
                            Privacy Policy
                        </Link>
                        .
                    </Text>
                </VStack>
            </VStack>
        </Center>
    );
}
