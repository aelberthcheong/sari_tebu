import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";
import {
    verifyUserPasswordPattern,
    verifyUserPasswordStrength,
} from "#/shared/lib/password.js";
import {
    generateSessionSecret,
    hashSessionSecret,
    createSessionToken,
} from "#/shared/lib/session_manager.js";

export async function createPasswordUpdateSession(authSession) {
    await prisma.passwordUpdateSession.deleteMany({
        where: { auth_session_id: authSession.id },
    });

    const secret = generateSessionSecret();

    const session = await prisma.passwordUpdateSession.create({
        data: {
            id: nanoid(),
            auth_session_id: authSession.id,
            session_secret_hash: hashSessionSecret(secret),
            password_verified_at: null,
            expires_at: new Date(
                Date.now() + Number(process.env.SESSION_TOKEN_AGE),
            ),
        },
    });

    const token = createSessionToken(session.id, secret);
    return { token };
}

export async function findPasswordUpdateSession(id) {
    return prisma.passwordUpdateSession.findUnique({
        where: { id },
    });
}

export async function verifyCurrentPassword(
    passwordUpdateSession,
    currentPassword,
) {
    const authSession = await prisma.authSession.findUnique({
        where: { id: passwordUpdateSession.auth_session_id },
        include: { user: true },
    });

    if (!authSession) {
        throw ClientError.gone("Session sudah tidak valid");
    }

    const user = await prisma.user.findUnique({
        where: { id: authSession.user_id },
    });

    const currentPasswordMatches = await bcrypt.compare(
        currentPassword,
        user.password_hash,
    );

    if (!currentPasswordMatches) {
        throw ClientError.unprocessable("Password saat ini tidak sesuai");
    }

    await prisma.passwordUpdateSession.update({
        where: { id: passwordUpdateSession.id },
        data: { password_verified_at: new Date() },
    });
}

export async function updatePassword(passwordUpdateSession, newPassword) {
    if (!passwordUpdateSession.password_verified_at) {
        throw ClientError.forbidden(
            "Anda harus memverifikasi password saat ini terlebih dahulu",
        );
    }

    const authSession = await prisma.authSession.findUnique({
        where: { id: passwordUpdateSession.auth_session_id },
    });

    if (!authSession) {
        throw ClientError.gone("Session sudah tidak valid");
    }

    if (!verifyUserPasswordPattern(newPassword)) {
        throw ClientError.unprocessable(
            "Password baru harus berukuran 10-100 karakter dan mematuhi standar ASCII.",
        );
    }

    const isSafe = await verifyUserPasswordStrength(newPassword);
    if (!isSafe) {
        throw ClientError.unprocessable(
            "Password baru terlalu lemah karena pernah bocor di internet. Silakan pilih kata sandi yang berbeda.",
        );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
        prisma.user.update({
            where: { id: authSession.user_id },
            data: { password_hash: newPasswordHash },
        }),
        prisma.authSession.deleteMany({
            where: {
                user_id: authSession.user_id,
                id: { not: authSession.id },
            },
        }),
        prisma.passwordUpdateSession.delete({
            where: { id: passwordUpdateSession.id },
        }),
    ]);
}

export async function cancelPasswordUpdate(id) {
    try {
        await prisma.passwordUpdateSession.delete({ where: { id } });
    } catch (err) {
        if (err.code === "P2025") {
            throw ClientError.notFound("Session tidak ditemukan");
        }
        throw err;
    }
}
