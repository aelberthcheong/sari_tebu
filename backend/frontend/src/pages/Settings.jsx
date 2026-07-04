import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import {
    KeyIcon,
    EnvelopeIcon,
    TrashIcon,
    ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useNavigate } from "react-router";

import AppLayout from "#/layouts/AppLayout.jsx";
import { Modal } from "#/components/Modal.jsx";
import {
    passwordUpdateApi,
    emailUpdateApi,
    accountDeletionApi,
    ApiError,
} from "#/lib/api.js";
import { useToast } from "#/context/ToastContext.jsx";
import { useAuth } from "#/context/AuthContext.jsx";

/* ===================================================================== */
/*  Kartu pengaturan generik                                              */
/* ===================================================================== */

function SettingCard({ icon: IconComp, title, description, action }) {
    return (
        <Card padding={5} width="100%">
            <HStack style={{ justifyContent: "space-between" }} vAlign="center" gap={4}>
                <HStack gap={3} vAlign="center">
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--color-accent-muted)",
                            flexShrink: 0,
                        }}>
                        <IconComp style={{ width: 20, height: 20 }} />
                    </div>
                    <VStack gap={0}>
                        <Text type="body" weight="bold">
                            {title}
                        </Text>
                        <Text type="supporting" color="secondary" size="sm">
                            {description}
                        </Text>
                    </VStack>
                </HStack>
                {action}
            </HStack>
        </Card>
    );
}

/* ===================================================================== */
/*  Flow: Ubah Password (password_update_sessions)                       */
/* ===================================================================== */

function ChangePasswordModal({ onClose }) {
    const toast = useToast();
    const [step, setStep] = useState(1);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);

    const startSession = async () => {
        if (sessionStarted) return true;
        try {
            await passwordUpdateApi.start();
            setSessionStarted(true);
            return true;
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Gagal memulai proses pembaruan password.",
            );
            return false;
        }
    };

    const handleVerifyCurrent = async (e) => {
        e.preventDefault();
        if (!currentPassword) {
            setError("Masukkan password saat ini.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const ok = await startSession();
            if (!ok) return;
            await passwordUpdateApi.verifyCurrent(currentPassword);
            setStep(2);
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "Password saat ini salah.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (newPassword.length < 10 || newPassword.length > 100) {
            setError("Password baru harus 10–100 karakter.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await passwordUpdateApi.update(newPassword);
            toast.success("Password berhasil diperbarui.");
            onClose();
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "Gagal memperbarui password.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (sessionStarted) {
            try {
                await passwordUpdateApi.cancel();
            } catch {
                // Diamkan; cookie akan kedaluwarsa sendiri jika gagal dibatalkan.
            }
        }
        onClose();
    };

    return (
        <Modal title="Ubah Password" onClose={handleCancel} width={420}>
            {step === 1 ? (
                <form onSubmit={handleVerifyCurrent}>
                    <VStack gap={4} hAlign="stretch">
                        <Text type="body" color="secondary" size="sm">
                            Masukkan password kamu saat ini untuk melanjutkan.
                        </Text>
                        <TextInput
                            label="Password Saat Ini"
                            type="password"
                            size="lg"
                            name="current-password"
                            autocomplete="current-password"
                            value={currentPassword}
                            onChange={(v) => {
                                setCurrentPassword(v);
                                setError(null);
                            }}
                            status={error ? { type: "error", message: error } : undefined}
                        />
                        <Button
                            label="Lanjutkan"
                            variant="primary"
                            size="lg"
                            type="submit"
                            isLoading={isLoading}
                        />
                    </VStack>
                </form>
            ) : (
                <form onSubmit={handleUpdate}>
                    <VStack gap={4} hAlign="stretch">
                        <Text type="body" color="secondary" size="sm">
                            Password lama terverifikasi. Masukkan password baru kamu.
                        </Text>
                        <TextInput
                            label="Password Baru"
                            type="password"
                            size="lg"
                            name="new-password"
                            autocomplete="new-password"
                            value={newPassword}
                            onChange={(v) => {
                                setNewPassword(v);
                                setError(null);
                            }}
                            status={error ? { type: "error", message: error } : undefined}
                        />
                        <Button
                            label="Simpan Password Baru"
                            variant="primary"
                            size="lg"
                            type="submit"
                            isLoading={isLoading}
                        />
                    </VStack>
                </form>
            )}
        </Modal>
    );
}

/* ===================================================================== */
/*  Flow: Ubah Email (email_address_update_sessions)                     */
/* ===================================================================== */

function ChangeEmailModal({ onClose }) {
    const toast = useToast();
    const [step, setStep] = useState(1);
    const [newEmail, setNewEmail] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);

    const handleStart = async (e) => {
        e.preventDefault();
        if (!newEmail) {
            setError("Masukkan alamat email baru.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await emailUpdateApi.start(newEmail);
            setSessionStarted(true);
            setStep(2);
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "Gagal memulai perubahan email.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!code) {
            setError("Masukkan kode verifikasi.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await emailUpdateApi.verify(code.trim().replace(/-/g, ""));
            await emailUpdateApi.apply();
            toast.success("Alamat email berhasil diperbarui.");
            onClose();
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "Kode verifikasi salah atau kedaluwarsa.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError(null);
        try {
            await emailUpdateApi.resend();
            toast.info("Kode verifikasi baru telah dikirim.");
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Gagal mengirim ulang kode.");
        } finally {
            setIsResending(false);
        }
    };

    const handleCancel = async () => {
        if (sessionStarted) {
            try {
                await emailUpdateApi.cancel();
            } catch {
                // Diamkan.
            }
        }
        onClose();
    };

    return (
        <Modal title="Ubah Alamat Email" onClose={handleCancel} width={420}>
            {step === 1 ? (
                <form onSubmit={handleStart}>
                    <VStack gap={4} hAlign="stretch">
                        <Text type="body" color="secondary" size="sm">
                            Kode verifikasi akan dikirim ke alamat email baru kamu.
                        </Text>
                        <TextInput
                            label="Email Baru"
                            type="email"
                            size="lg"
                            placeholder="nama.baru@example.com"
                            value={newEmail}
                            onChange={(v) => {
                                setNewEmail(v);
                                setError(null);
                            }}
                            status={error ? { type: "error", message: error } : undefined}
                        />
                        <Button
                            label="Kirim Kode Verifikasi"
                            variant="primary"
                            size="lg"
                            type="submit"
                            isLoading={isLoading}
                        />
                    </VStack>
                </form>
            ) : (
                <form onSubmit={handleVerify}>
                    <VStack gap={4} hAlign="stretch">
                        <Text type="body" color="secondary" size="sm">
                            Kami mengirim kode 8 digit ke <strong>{newEmail}</strong>.
                        </Text>
                        <TextInput
                            label="Kode Verifikasi"
                            size="lg"
                            name="one-time-code"
                            value={code}
                            onChange={(v) => {
                                setCode(v);
                                setError(null);
                            }}
                            status={error ? { type: "error", message: error } : undefined}
                        />
                        <Button
                            label="Verifikasi & Simpan"
                            variant="primary"
                            size="lg"
                            type="submit"
                            isLoading={isLoading}
                        />
                        <Button
                            label={isResending ? "Mengirim ulang…" : "Kirim ulang kode"}
                            variant="secondary"
                            size="md"
                            disabled={isResending}
                            onClick={handleResend}
                        />
                    </VStack>
                </form>
            )}
        </Modal>
    );
}

/* ===================================================================== */
/*  Flow: Hapus Akun (account_deletion_sessions)                         */
/* ===================================================================== */

function DeleteAccountModal({ onClose }) {
    const toast = useToast();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);

    const handleStart = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await accountDeletionApi.start();
            setSessionStarted(true);
            setStep(2);
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "Gagal memulai proses penghapusan akun.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndDelete = async (e) => {
        e.preventDefault();
        if (!password) {
            setError("Masukkan password kamu untuk konfirmasi.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await accountDeletionApi.verifyPassword(password);
            await accountDeletionApi.confirmDelete();
            toast.success("Akun berhasil dihapus. Sampai jumpa!");
            await logout();
            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "Password salah atau proses gagal.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (sessionStarted) {
            try {
                await accountDeletionApi.cancel();
            } catch {
                // Diamkan.
            }
        }
        onClose();
    };

    return (
        <Modal title="Hapus Akun" onClose={handleCancel} width={420}>
            {step === 1 ? (
                <VStack gap={4} hAlign="stretch">
                    <HStack
                        gap={2}
                        style={{
                            background: "var(--color-background-red)",
                            padding: 12,
                            borderRadius: 10,
                        }}>
                        <ShieldExclamationIcon
                            style={{
                                width: 20,
                                height: 20,
                                color: "var(--color-text-red)",
                                flexShrink: 0,
                            }}
                        />
                        <span style={{ color: "var(--color-text-red)" }}>
                            <Text type="body" size="sm">
                                Tindakan ini permanen. Semua data akunmu akan dihapus dan
                                tidak dapat dikembalikan.
                            </Text>
                        </span>
                    </HStack>
                    {error && (
                        <span style={{ color: "var(--color-error)" }}>
                            <Text type="body" size="sm">
                                {error}
                            </Text>
                        </span>
                    )}
                    <Button
                        label="Saya Mengerti, Lanjutkan"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        onClick={handleStart}
                    />
                </VStack>
            ) : (
                <form onSubmit={handleVerifyAndDelete}>
                    <VStack gap={4} hAlign="stretch">
                        <Text type="body" color="secondary" size="sm">
                            Masukkan password kamu untuk mengonfirmasi penghapusan akun.
                        </Text>
                        <TextInput
                            label="Password"
                            type="password"
                            size="lg"
                            name="current-password"
                            autocomplete="current-password"
                            value={password}
                            onChange={(v) => {
                                setPassword(v);
                                setError(null);
                            }}
                            status={error ? { type: "error", message: error } : undefined}
                        />
                        <Button
                            label="Hapus Akun Permanen"
                            variant="primary"
                            size="lg"
                            type="submit"
                            isLoading={isLoading}
                        />
                    </VStack>
                </form>
            )}
        </Modal>
    );
}

/* ===================================================================== */
/*  Halaman utama                                                         */
/* ===================================================================== */

export default function Settings() {
    const [activeModal, setActiveModal] = useState(null); // "password" | "email" | "delete" | null

    return (
        <AppLayout title="Pengaturan Akun" subtitle="Kelola informasi login dan keamanan akunmu.">
            <VStack gap={4} hAlign="stretch" style={{ maxWidth: 640 }}>
                <Text type="body" color="secondary">
                    Kelola informasi keamanan dan akun kasir kamu di sini.
                </Text>

                <SettingCard
                    icon={KeyIcon}
                    title="Ubah Password"
                    description="Perbarui password login akunmu secara berkala."
                    action={
                        <Button
                            label="Ubah"
                            variant="secondary"
                            size="md"
                            onClick={() => setActiveModal("password")}
                        />
                    }
                />

                <SettingCard
                    icon={EnvelopeIcon}
                    title="Ubah Alamat Email"
                    description="Ganti alamat email yang terhubung dengan akun ini."
                    action={
                        <Button
                            label="Ubah"
                            variant="secondary"
                            size="md"
                            onClick={() => setActiveModal("email")}
                        />
                    }
                />

                <SettingCard
                    icon={TrashIcon}
                    title="Hapus Akun"
                    description="Hapus akun dan seluruh data terkait secara permanen."
                    action={
                        <Button
                            label="Hapus"
                            variant="secondary"
                            size="md"
                            onClick={() => setActiveModal("delete")}
                        />
                    }
                />
            </VStack>

            {activeModal === "password" && (
                <ChangePasswordModal onClose={() => setActiveModal(null)} />
            )}
            {activeModal === "email" && (
                <ChangeEmailModal onClose={() => setActiveModal(null)} />
            )}
            {activeModal === "delete" && (
                <DeleteAccountModal onClose={() => setActiveModal(null)} />
            )}
        </AppLayout>
    );
}
