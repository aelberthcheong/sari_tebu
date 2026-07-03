import { randomInt, createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";
import {
    generateSessionSecret,
    hashSessionSecret,
    createSessionToken,
} from "#/shared/lib/session_manager.js";
import { 
    verifyUserPasswordPattern, 
    verifyUserPasswordStrength 
} from "#/shared/lib/password.js";

/**
 * Tidak melempar error kalau email tidak ditemukan -- untuk menghindari
 * user enumeration lewat endpoint ini. Selalu return sukses ke caller,
 * tapi token cuma dikasih kalau emailnya memang ada.
 */
export async function createPasswordResetSession(emailAddress) {
    const user = await prisma.user.findUnique({
        where: { email_address: emailAddress },
    });
    
    if (!user) {
        return { token: null, verificationCode: null };
    }

    // Hapus password reset session lama untuk user yang sama, supaya tidak
    // ada beberapa kode aktif sekaligus.
    await prisma.passwordResetSession.deleteMany({
        where: { user_id: user.id },
    });

    const secret = generateSessionSecret();
    const verificationCode = randomInt(10_000_000, 100_000_000)
        .toString()
        .padStart(8, "0");

    const hashedVerificationCode = createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    const tokenLifetime = new Date(Date.now() + Number(process.env.SESSION_TOKEN_AGE));
    const session = await prisma.passwordResetSession.create({
        data: {
            id: nanoid(),
            user_id: user.id,
            session_secret_hash: hashSessionSecret(secret),
            email_code_hash: Buffer.from(hashedVerificationCode, "hex"),
            email_verified_at: null,
            expires_at: tokenLifetime
        },
    });

    const token = createSessionToken(session.id, secret);
    return { token, verificationCode, emailAddress: user.email_address };
}

export async function findPasswordResetSession(id) {
    return prisma.passwordResetSession.findUnique({
        where: { id },
    });
}

export async function verifyEmailAddress(passwordResetSession, verificationCode) {
    const hashedVerificationCode = createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    const payloadCode  = Buffer.from(hashedVerificationCode, "hex");
    const databaseCode = Buffer.from(passwordResetSession.email_code_hash);

    if (payloadCode.length !== databaseCode.length || !timingSafeEqual(payloadCode, databaseCode)) {
        throw ClientError.unprocessable("Invalid verification code.");
    }

    await prisma.passwordResetSession.update({
        where: { id: passwordResetSession.id },
        data: { email_verified_at: new Date() },
    });
}

export async function refreshVerificationCode(id) {
    const verificationCode = randomInt(10_000_000, 100_000_000)
        .toString()
        .padStart(8, "0");

    const hashedVerificationCode = createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    await prisma.passwordResetSession.update({
        where: { id },
        data: {
            email_code_hash: Buffer.from(hashedVerificationCode, "hex"),
        },
    });

    return verificationCode;
}

export async function resetPassword(passwordResetSession, newPassword) {
    if (!passwordResetSession.email_verified_at) {
        throw ClientError.forbidden("Alamat email belum di-verifikasi");
    }

    if (!verifyUserPasswordPattern(newPassword)) {
        throw ClientError.unprocessable(
            "Password baru harus berukuran 10-100 karakter dan mematuhi standar ASCII."
        );
    }

    const isSafe = await verifyUserPasswordStrength(newPassword);
    if (!isSafe) {
        throw ClientError.unprocessable(
            "Password baru terlalu lemah karena pernah bocor di internet. Silakan pilih kata sandi yang berbeda."
        );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
        prisma.user.update({
            where: { id: passwordResetSession.user_id },
            data: { password_hash: passwordHash },
        }),
        prisma.authSession.deleteMany({
            where: { user_id: passwordResetSession.user_id },
        }),
        prisma.passwordResetSession.delete({
            where: { id: passwordResetSession.id },
        }),
    ]);
}

export async function deletePasswordResetSession(id) {
    try {
        await prisma.passwordResetSession.delete({ 
            where: { id } 
        });
    } catch (err) {
        if (err.code === "P2025") {
            throw ClientError.notFound("Session tidak ditemukan");
        }
        throw err;
    }
}