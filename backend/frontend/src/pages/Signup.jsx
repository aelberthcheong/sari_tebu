import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { AuthSplitLayout } from "#/layouts/AuthSplitLayout";
import { useAuth } from "#/context/AuthContext.jsx";

function StepEmail({ onNext, onNavigateToLogin }) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents page reload on form submit
        if (!email) {
            setError("Please enter a valid email address");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/sign-up", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailAddress: email }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onNext(email);
            } else {
                setError(data.message || "Failed to send verification code.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* Wrapping in a form handles native inputs history and Enter key functionality */
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack gap={4} hAlign="stretch" width="100%">
                <VStack gap={1}>
                    <Text type="display-1" as="h2">Create an account</Text>
                    <Text type="body" color="secondary" size="sm">
                        Enter your email to get started.
                    </Text>
                </VStack>
                
                <TextInput
                    label="Email Address"
                    placeholder="john@example.com"
                    size="lg"
                    type="email"
                    name="email" /* Enables autocomplete history tracking */
                    value={email}
                    onChange={(val) => {
                        setEmail(val);
                        setError(null);
                    }}
                    status={error ? { type: "error", message: error } : undefined}
                />

                {/* type="submit" binds the Enter key to the submit handler natively */}
                <Button 
                    label="Continue" 
                    variant="primary" 
                    size="lg" 
                    isLoading={isLoading} 
                    type="submit" 
                />

                <Text type="supporting" color="secondary">
                    Have an account?{" "}
                    <Link onClick={onNavigateToLogin} type="supporting">Login</Link>
                </Text>
            </VStack>
        </form>
    );
}

function StepVerify({ email, onNext, onCancel }) {
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
            const res = await fetch("/api/sign-up/verify-email-address", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    code: code
                        .trim()
                        .replace(/-/g, "")
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onNext();
            } else {
                setError(data.message || "Invalid or expired verification code.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch("/api/sign-up/resend-verification-code", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                setSuccessMessage("Verification code resent successfully!");
            } else {
                setError(data.message || "Failed to resend code. Try again later.");
            }
        } catch {
            setError("Failed to reach server. Try again later.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <form onSubmit={handleVerify} style={{ width: "100%" }}>
            <VStack gap={4} hAlign="stretch" width="100%">
                <VStack gap={1}>
                    <Text type="display-1" as="h2">Verify your email</Text>
                    <Text type="body" color="secondary" size="sm">
                        We sent an 8-digit verification code to <strong>{email}</strong>.
                    </Text>
                </VStack>

                <TextInput
                    label="Verification Code (hyphens and spaces are optional)"
                    placeholder="Enter verification code"
                    size="lg"
                    name="one-time-code" /* Tells password managers this is an OTP */
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

                <Button 
                    label="Verify Email" 
                    variant="primary" 
                    size="lg" 
                    isLoading={isLoading} 
                    type="submit" 
                />

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

const ROLE_OPTIONS = [
    {
        value: "KASIR",
        label: "Kasir",
        description: "Akses ke POS untuk transaksi harian dan lihat produk.",
    },
    {
        value: "ADMIN",
        label: "Admin",
        description: "Kelola produk & stok, lihat semua transaksi toko.",
    },
    {
        value: "OWNER",
        label: "Pemilik (Owner)",
        description: "Akses penuh: produk, semua transaksi, dan pengaturan toko.",
    },
];

/**
 * Pemilih role, dibuat manual (bukan lewat komponen library) mengikuti pola
 * Badge/IconButton di project ini, karena komponen radio/select belum
 * terverifikasi tersedia di versi @astryxdesign/core yang terpasang.
 */
function RoleSelector({ value, onChange }) {
    return (
        <VStack gap={2} hAlign="stretch">
            <Text type="supporting" weight="bold" color="secondary">
                Daftar sebagai
            </Text>
            {ROLE_OPTIONS.map((option) => {
                const isSelected = value === option.value;
                return (
                    <label
                        key={option.value}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: isSelected
                                ? "2px solid var(--color-accent, #2563eb)"
                                : "1px solid var(--color-border)",
                            background: isSelected
                                ? "var(--color-accent-muted, rgba(37,99,235,0.06))"
                                : "transparent",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}>
                        <input
                            type="radio"
                            name="role"
                            value={option.value}
                            checked={isSelected}
                            onChange={() => onChange(option.value)}
                            style={{ marginTop: 3 }}
                        />
                        <div>
                            <Text type="supporting" weight="bold">
                                {option.label}
                            </Text>
                            <Text type="supporting" color="secondary" size="sm">
                                {option.description}
                            </Text>
                        </div>
                    </label>
                );
            })}
        </VStack>
    );
}

function StepPassword({ email, onComplete }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("KASIR");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFinalize = async (e) => {
        e.preventDefault();
        
        // Front-end matches backend Joi schema + verifyUserPasswordPattern validation
        if (username.length < 3 || username.length > 30) {
            setError("Username must be between 3 and 30 characters long");
            return;
        }
        if (password.length < 10 || password.length > 100) {
            setError("Password must be between 10 and 100 characters long");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            // Hits the register route inside authSession controller
            const res = await fetch("/api/auth/register", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onComplete();
            } else {
                setError(data.message || "Registration failed. Try checking your entries.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleFinalize} style={{ width: "100%" }}>
            {/* CRITICAL: Tell password managers that this hidden email is the main login key */}
            <input type="hidden" name="email" value={email} autoComplete="username" />
            
            <VStack gap={4} hAlign="stretch" width="100%">
                <VStack gap={1}>
                    <Text type="display-1" as="h2">Set details</Text>
                    <Text type="body" color="secondary" size="sm">
                        Choose your distinct identity profile credentials.
                    </Text>
                </VStack>

                <TextInput
                    label="Username"
                    type="text"
                    placeholder="johndoe"
                    size="lg"
                    name="username"
                    autocomplete="nickname" /* Changes from "username" to "nickname" so password managers ignore it */
                    value={username}
                    onChange={(val) => {
                        setUsername(val);
                        setError(null);
                    }}
                />

                <TextInput
                    label="Password"
                    type="password"
                    placeholder="Minimal 10 karakter"
                    size="lg"
                    name="new-password"
                    autocomplete="new-password" /* Prompts a secure "Save Password" box paired to the hidden email input above */
                    value={password}
                    onChange={(val) => {
                        setPassword(val);
                        setError(null);
                    }}
                    status={error ? { type: "error", message: error } : undefined}
                />

                <RoleSelector value={role} onChange={setRole} />

                <Button 
                    label="Create Account" 
                    variant="primary" 
                    size="lg" 
                    isLoading={isLoading} 
                    type="submit" 
                />
            </VStack>
        </form>
    );
}

// =========================================================================
// MAIN ENTRY: Stage Routing Coordinator
// =========================================================================
export default function SignUp() {
    const navigate = useNavigate();
    const { refresh } = useAuth();
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState("");
    const [pageSkeleton, setPageSkeleton] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setPageSkeleton(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleCancelSignup = async () => {
        setPageSkeleton(true);
        try {
            await fetch("/api/sign-up", { method: "DELETE", credentials: "include" });
        } catch (e) {
            console.error("Failed to cancel active registration session cleanly.", e);
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

    const goBack = () => {
        if (step === 1) {
            navigate("/");
            return;
        }
        // Step 2 (verifikasi) dan step 3 (set password) sama-sama butuh
        // signupSession yang masih aktif dan sudah/belum ter-verifikasi.
        // Cara paling aman untuk "mundur" adalah membatalkan sesi signup
        // yang berjalan lalu kembali ke step 1, supaya user bisa mengganti
        // email atau mulai ulang tanpa state yang nyangkut di backend.
        handleCancelSignup();
    };

    return (
        <AuthSplitLayout
            isLoading={pageSkeleton}
            onBack={goBack}
            backLabel={step === 1 ? "Kembali ke Beranda" : "Kembali"}>
            {step === 1 && (
                <StepEmail 
                    onNext={(validEmail) => transitionToStep(2, validEmail)} 
                    onNavigateToLogin={() => navigate("/login")} 
                />
            )}
            {step === 2 && (
                <StepVerify 
                    email={email} 
                    onNext={() => transitionToStep(3)} 
                    onCancel={handleCancelSignup} 
                />
            )}
            {step === 3 && (
                <StepPassword 
                    email={email}
                    onComplete={async () => {
                        await refresh();
                        navigate("/pos");
                    }} 
                />
            )}
        </AuthSplitLayout>
    );
}