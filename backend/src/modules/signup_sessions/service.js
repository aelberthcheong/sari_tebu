import { randomInt, createHash, timingSafeEqual } from "node:crypto";

import { nanoid } from "nanoid";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";
import {
    generateSessionSecret,
    hashSessionSecret,
    createSessionToken,
} from "#/shared/lib/session_manager.js";

export async function createSignupSession(emailAddress) {
    const exists = await prisma.user.findUnique({
        where: { email_address: emailAddress },
    });

    if (exists) {
        throw ClientError.conflict(
            "Email address sudah di register sebelum nya",
        );
    }

    // Case dimana user reload, balik ke signup dan reconnected
    await prisma.signupSession.deleteMany({
        where: { email_address: emailAddress },
    });

    const secret = generateSessionSecret();
    const verificationCode = randomInt(10_000_000, 100_000_000)
        .toString()
        .padStart(8, "0");

    const hashedVerificationCode = createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    const tokenLifetime = new Date(
        Date.now() + Number(process.env.SESSION_TOKEN_AGE),
    );
    const signupSession = await prisma.signupSession.create({
        data: {
            id: nanoid(),
            email_address: emailAddress,
            session_secret_hash: hashSessionSecret(secret),
            email_code_hash: Buffer.from(hashedVerificationCode, "hex"),
            email_verified_at: new Date(),
            expires_at: tokenLifetime,
        },
    });

    const token = createSessionToken(signupSession.id, secret);
    return { token, verificationCode };
}

export async function findSignupSession(id) {
    return prisma.signupSession.findUnique({
        where: { id: id },
    });
}

export async function verifyEmailAddress(signupSession, verificationCode) {
    const hashedVerificationCode = createHash("sha256")
        .update(verificationCode)
        .digest("hex");

    const payloadCode = Buffer.from(hashedVerificationCode, "hex");
    const databaseCode = Buffer.from(signupSession.email_code_hash);

    if (
        payloadCode.length !== databaseCode.length ||
        !timingSafeEqual(payloadCode, databaseCode)
    ) {
        throw ClientError.unprocessable("Invalid verification code.");
    }

    await prisma.signupSession.update({
        where: { id: signupSession.id },
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

    await prisma.signupSession.update({
        where: { id: id },
        data: {
            email_code_hash: Buffer.from(hashedVerificationCode, "hex"),
            email_verified_at: null,
        },
    });

    return verificationCode;
}

export async function deleteSignupSession(id) {
    try {
        await prisma.signupSession.delete({
            where: { id: id },
        });
    } catch (err) {
        if (err.code === "P2025")
            throw ClientError.notFound("Session tidak ditemukan");
        throw err;
    }
}
