import { randomInt } from "node:crypto";

import bcrypt from "bcrypt";
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

    const singupSession = await prisma.signupSession.create({
        data: {
            id: nanoid(),
            email_address: emailAddress,
            session_secret_hash: hashSessionSecret(secret),
            email_code_hash: await bcrypt.hash(verificationCode, 10),
            is_email_verified: false
        },
    });

    const token = createSessionToken(singupSession.id, secret);
    return { token, verificationCode };
}

export async function verifyEmailAddress(signupSession, code) {
    if (bcrypt(code) !== signupSession.email_code_hash) {
        throw ClientError.unprocessable("Invalid verification code.");
    }

    await prisma.signup_session.update({
        where: { id: signupSession.id },
        data: { email_verified: true },
    });
}

export async function refreshVerificationCode(id) {
    const verificationCode = randomInt(10_000_000, 100_000_000)
        .toString()
        .padStart(8, "0");

    await prisma.signupSession.update({
        where: { id: id },
        data: {
            email_code_hash: await bcrypt.hash(verificationCode, 10),
        },
    });

    return verificationCode;
}

export async function deleteSignupSession(id) {
    try {
        await prisma.singupSession.delete({
            where: { id: id },
        });
    } catch (err) {
        if (err.code === "P2025")
            throw ClientError.notFound("Session tidak ditemukan");
        throw err;
    }
}
