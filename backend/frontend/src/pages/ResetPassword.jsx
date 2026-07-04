import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { AuthSplitLayout } from "#/layouts/AuthSplitLayout";

function StepRequestEmail({ onNext, onNavigateToLogin }) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailAddress: email }),
            });

            // Always returns 201 success to prevent user enumeration
            if (res.ok) {
                onNext(email);
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || "Something went wrong.");
            }
        } catch {
            setError("Failed to contact server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack gap={4} hAlign="stretch" width="100%">
                <VStack gap={1}>
                    <Text type="display-1" as="h2">Reset Password</Text>
                    <Text type="body" color="secondary" size="sm">
                        Enter your email address to receive a verification code.
                    </Text>
                </VStack>

                <TextInput
                    label="Email Address"
                    placeholder="your.name@example.com"
                    size="lg"
                    type="email"
                    name="email"
                    autocomplete="username email"
                    value={email}
                    onChange={(val) => {
                        setEmail(val);
                        setError(null);
                    }}
                    status={error ? { type: "error", message: error } : undefined}
                />

                <Button label="Send Code" variant="primary" size="lg" isLoading={isLoading} type="submit" />

                <Text type="supporting" color="secondary">
                    Remember your password?{" "}
                    <Link onClick={onNavigateToLogin} type="supporting">Back to Login</Link>
                </Text>
            </VStack>
        </form>
    );
}

function StepVerifyCode({ email, onNext, onCancel }) {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!code) {
            setError("Please enter the verification code");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch("/api/reset-password/verify-email-address", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    code: code
                        .trim() 
                        .replace(/-/g, '')
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onNext();
            } else {
                setError(data.message || "Invalid or expired code.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch("/api/reset-password/resend-verification-code", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                setSuccessMessage("A new verification code has been sent!");
            } else {
                setError(data.message || "Failed to resend code.");
            }
        } catch {
            setError("Failed to connect to server.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <form onSubmit={handleVerify} style={{ width: "100%" }}>
            <VStack gap={4} hAlign="stretch" width="100%">
                <VStack gap={1}>
                    <Text type="display-1" as="h2">Verify Identity</Text>
                    <Text type="body" color="secondary" size="sm">
                        If <strong>{email}</strong> matches an account, an 8-digit code has been sent.
                    </Text>
                </VStack>

                <TextInput
                    label="Verification Code"
                    placeholder="Enter 8-digit code"
                    size="lg"
                    name="one-time-code"
                    value={code}
                    onChange={(val) => {
                        setCode(val);
                        setError(null);
                    }}
                    status={
                        error ? { type: "error", message: error } : 
                        successMessage ? { type: "success", message: successMessage } : undefined
                    }
                />

                <Button label="Verify Code" variant="primary" size="lg" isLoading={isLoading} type="submit" />

                <VStack gap={2} hAlign="stretch">
                    <Link onClick={handleResend} disabled={isResending} size="sm" type="supporting">
                        {isResending ? "Resending code..." : "Resend verification code"}
                    </Link>
                    <Link onClick={onCancel} color="secondary" size="sm" type="supporting">
                        Cancel and change email
                    </Link>
                </VStack>
            </VStack>
        </form>
    );
}

function StepUpdatePassword({ email, onComplete }) {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePatch = async (e) => {
        e.preventDefault();
        if (password.length < 10 || password.length > 100) {
            setError("Password must be between 10 and 100 characters long");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/reset-password", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onComplete();
            } else {
                setError(data.message || "Failed to update password.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handlePatch} style={{ width: "100%" }}>
            {/* Helps browsers automatically match this update back to the stored password login record */}
            <input type="hidden" name="email" value={email} autoComplete="username" />

            <VStack gap={4} hAlign="stretch" width="100%">
                <VStack gap={1}>
                    <Text type="display-1" as="h2">New Password</Text>
                    <Text type="body" color="secondary" size="sm">
                        Please set your strong, updated account password entry.
                    </Text>
                </VStack>

                <TextInput
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    size="lg"
                    name="password"
                    autocomplete="new-password"
                    value={password}
                    onChange={(val) => {
                        setPassword(val);
                        setError(null);
                    }}
                    status={error ? { type: "error", message: error } : undefined}
                />

                <Button label="Save and Login" variant="primary" size="lg" isLoading={isLoading} type="submit" />
            </VStack>
        </form>
    );
}

export default function ResetPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [pageSkeleton, setPageSkeleton] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setPageSkeleton(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleCancelReset = async () => {
        setPageSkeleton(true);
        try {
            await fetch("/api/reset-password", { method: "DELETE", credentials: "include" });
        } catch (e) {
            console.error("Failed to drop reset session token cookie cleanly.", e);
        }
        setEmail("");
        setStep(1);
        setPageSkeleton(false);
    };

    const transitionToStep = (nextStep, emailValue = email) => {
        setPageSkeleton(true);
        setEmail(emailValue);
        setTimeout(() => {
            setStep(nextStep);
            setPageSkeleton(false);
        }, 300);
    };

    return (
        <AuthSplitLayout isLoading={pageSkeleton}>
            {step === 1 && (
                <StepRequestEmail 
                    onNext={(validEmail) => transitionToStep(2, validEmail)} 
                    onNavigateToLogin={() => navigate("/login")} 
                />
            )}
            {step === 2 && (
                <StepVerifyCode 
                    email={email} 
                    onNext={() => transitionToStep(3)} 
                    onCancel={handleCancelReset} 
                />
            )}
            {step === 3 && (
                <StepUpdatePassword 
                    email={email}
                    onComplete={() => navigate("/login")} /* Correct direction per backend session destruction */
                />
            )}
        </AuthSplitLayout>
    );
}