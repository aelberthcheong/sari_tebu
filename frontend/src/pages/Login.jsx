import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { VStack } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { AuthSplitLayout } from "#/layouts/AuthSplitLayout";
import { useAuth } from "#/context/AuthContext.jsx";

export default function Login() {
    const navigate = useNavigate();
    const { refresh } = useAuth();

    // --- 1. SKELETON STATE ---
    const [pageLoading, setPageLoading] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginFailed, setLoginFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Wrong Email or Password");

    // Simulate initial page/asset checking to show skeleton
    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 300); // Adjust or remove time if relying on true server status
        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            setLoginFailed(true);
            setErrorMessage("Please enter valid credentials");
            return;
        }
        setIsLoading(true);
        setLoginFailed(false);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailAddress: email, password }),
            });

            if (res.ok) {
                setIsSuccess(true);
                await refresh();
                setTimeout(() => navigate("/pos"), 1000);
            } else {
                const data = await res.json().catch(() => ({}));
                setErrorMessage(data.message || "Wrong Email or Password");
                setIsLoading(false);
                setLoginFailed(true);
            }
        } catch {
            setErrorMessage("Uh oh, something wrong. Try again later.");
            setIsLoading(false);
            setLoginFailed(true);
        }
    };

    return (
        /* Pass the loading state straight to the reusable layout wrapper */
        <AuthSplitLayout isLoading={pageLoading}>
            {isSuccess ? (
                <EmptyState
                    title="You're signed in"
                    description="Mengarahkan ke dashboard kasir…"
                    icon={<Icon icon={CheckCircleIcon} size="lg" />}
                />
            ) : (
                <VStack gap={4} hAlign="stretch" width="100%">
                    <VStack gap={1}>
                        <Text type="display-1" as="h2">
                            Welcome back
                        </Text>
                        <Text type="body" color="secondary" size="sm">
                            Login to your account
                        </Text>
                    </VStack>

                    <VStack gap={2}>
                        <TextInput
                            label="Email"
                            isLabelHidden
                            type="email"
                            name="email"                    
                            autocomplete="username email" 
                            placeholder="your.name@example.com"
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
                                name="password"
                                autocomplete="current-password" /* Forces matching with existing credentials */
                                value={password}
                                onChange={(v) => {
                                    setPassword(v);
                                    setLoginFailed(false);
                                }}
                                size="lg"
                                status={
                                    loginFailed
                                        ? {
                                              type: "error",
                                              message: errorMessage,
                                          }
                                        : undefined
                                }
                            />
                            {loginFailed && (
                                <VStack hAlign="end">
                                    <Link
                                        onClick={() =>
                                            navigate("/reset-password")
                                        }
                                        href="#"
                                        size="sm"
                                        color="secondary"
                                        type="supporting">
                                        Forgot your password?
                                    </Link>
                                </VStack>
                            )}
                        </VStack>
                    </VStack>

                    <Button
                        label="Login"
                        variant="primary"
                        type="submit"
                        size="lg"
                        isLoading={isLoading}
                        onClick={handleLogin}
                    />

                    <Text type="supporting" color="secondary">
                        Don&apos;t have an account?{" "}
                        <Link
                            onClick={() => navigate("/signup")}
                            type="supporting">
                            Sign up
                        </Link>
                    </Text>
                </VStack>
            )}
        </AuthSplitLayout>
    );
}
