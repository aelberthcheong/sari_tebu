import { nanoid } from "nanoid";
import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";
import {
    generateSessionSecret,
    hashSessionSecret,
    createSessionToken,
} from "#/shared/lib/session_manager.js";
import bcrypt from "bcrypt";

export async function createAccountDeletionSession(authSession) {
    // Hapus session lama untuk auth_session yang sama kalau ada.
    await prisma.accountDeletionSession.deleteMany({
        where: { auth_session_id: authSession.id },
    });

    const secret = generateSessionSecret();
    const session = await prisma.accountDeletionSession.create({
        data: {
            id: nanoid(),
            auth_session_id: authSession.id,
            session_secret_hash: hashSessionSecret(secret),
            password_verified_at: null,
            expires_at: new Date(Date.now() + Number(process.env.SESSION_TOKEN_AGE)),
        },
    });

    const token = createSessionToken(session.id, secret);
    return { token };
}

export async function findAccountDeletionSession(id) {
    return prisma.accountDeletionSession.findUnique({
        where: { id },
    });
}

export async function verifyPassword(accountDeletionSession, userId, password) {
    const hashedPassword = await prisma.user.findUnique({
        where: { id: userId },
        select: { password_hash: true },
    });

    const matched = await bcrypt.compare(hashedPassword, password);
    if (!matched) {
        throw ClientError.badRequest("Password Salah");
    }

    await prisma.accountDeletionSession.update({
        where: { id: accountDeletionSession.id },
        data: { password_verified_at: new Date() },
    });
}

/**
 * Hapus akun user beserta semua data yang terkait. 
 * CASCADE di schema: User -> AuthSession -> sub-sessions, semua terhapus.
 */
export async function deleteAccount(accountDeletionSession, authSession) {
    if (!accountDeletionSession.password_verified_at) {
        throw ClientError.forbidden("Harap verifikasi password terlebih dahulu");
    }

    await prisma.user.delete({
        where: { id: authSession.user_id },
    });
}

export async function cancelAccountDeletion(id) {
    try {
        await prisma.accountDeletionSession.delete({ where: { id } });
    } catch (err) {
        if (err.code === "P2025") {
            throw ClientError.notFound("Session tidak ditemukan");
        }
        throw err;
    }
}