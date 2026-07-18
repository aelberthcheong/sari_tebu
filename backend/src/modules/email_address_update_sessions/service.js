import { randomInt, createHash, timingSafeEqual } from "node:crypto";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";
import {
    generateSessionSecret,
    hashSessionSecret,
    createSessionToken,
} from "#/shared/lib/session_manager.js";

function generateVerificationCode() {
    return randomInt(10_000_000, 100_000_000).toString().padStart(8, "0");
}

function hashVerificationCodeToBuffer(code) {
    const hexString = createHash("sha256").update(code).digest("hex");
    return Buffer.from(hexString, "hex");
}

export async function createEmailAddressUpdateSession(
    authSession,
    newEmailAddress,
) {
    // Pastikan alamat baru belum dipakai akun lain.
    const exists = await prisma.user.findUnique({
        where: { email_address: newEmailAddress },
    });
    if (exists) {
        throw ClientError.conflict("Email address sudah digunakan");
    }

    // Hapus session lama untuk auth_session yang sama.
    await prisma.emailAddresssUpdateSession.deleteMany({
        where: { auth_session_id: authSession.id },
    });

    const secret = generateSessionSecret();
    const verificationCode = generateVerificationCode();
    const hashedCodeBuffer = hashVerificationCodeToBuffer(verificationCode);

    const session = await prisma.emailAddresssUpdateSession.create({
        data: {
            id: nanoid(),
            auth_session_id: authSession.id,
            session_secret_hash: hashSessionSecret(secret),
            email_verified_at: null,
            new_email_address: newEmailAddress,
            email_code_hash: hashedCodeBuffer,
            expires_at: new Date(
                Date.now() + Number(process.env.SESSION_TOKEN_AGE),
            ),
        },
    });

    const token = createSessionToken(session.id, secret);
    return { token, verificationCode };
}

export async function findEmailAddressUpdateSession(id) {
    return prisma.emailAddresssUpdateSession.findUnique({
        where: { id },
    });
}

export async function verifyEmailAddress(emailAddressUpdateSession, code) {
    const hashedCodeBuffer = hashVerificationCodeToBuffer(code);
    const dbCodeBuffer = Buffer.from(emailAddressUpdateSession.email_code_hash);

    if (
        hashedCodeBuffer.length !== dbCodeBuffer.length ||
        !timingSafeEqual(hashedCodeBuffer, dbCodeBuffer)
    ) {
        throw ClientError.unprocessable("Invalid verification code.");
    }

    await prisma.emailAddresssUpdateSession.update({
        where: { id: emailAddressUpdateSession.id },
        data: { email_verified_at: new Date() },
    });
}

export async function refreshVerificationCode(emailAddressUpdateSession) {
    const verificationCode = generateVerificationCode();
    const hashedCodeBuffer = hashVerificationCodeToBuffer(verificationCode);

    await prisma.emailAddresssUpdateSession.update({
        where: { id: emailAddressUpdateSession.id },
        data: {
            email_code_hash: hashedCodeBuffer,
            email_verified_at: null, // Reset status jika kode di-generate ulang
        },
    });
    return verificationCode;
}

export async function updateEmailAddress(emailAddressUpdateSession) {
    if (!emailAddressUpdateSession.email_verified_at) {
        throw ClientError.forbidden("Alamat email baru belum di-verifikasi");
    }

    const authSession = await prisma.authSession.findUnique({
        where: { id: emailAddressUpdateSession.auth_session_id },
    });
    if (!authSession) {
        throw ClientError.gone("Session sudah tidak valid");
    }

    const user = await prisma.user.findUnique({
        where: { id: authSession.user_id },
    });

    if (!user) {
        throw ClientError.notFound("User tidak ditemukan");
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: authSession.user_id },
            data: {
                email_address: emailAddressUpdateSession.new_email_address,
            },
        }),
        prisma.authSession.deleteMany({
            where: {
                user_id: authSession.user_id,
                id: { not: authSession.id },
            },
        }),
        prisma.emailAddresssUpdateSession.delete({
            where: { id: emailAddressUpdateSession.id },
        }),
    ]);

    return { oldEmailAddress: user.email_address };
}

export async function cancelEmailAddressUpdate(id) {
    try {
        await prisma.emailAddresssUpdateSession.delete({ where: { id } });
    } catch (err) {
        if (err.code === "P2025") {
            throw ClientError.notFound("Session tidak ditemukan");
        }
        throw err;
    }
}
