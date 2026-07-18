import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";
// import {
//     verifyUserPasswordStrength,
//     verifyUserPasswordPattern,
// } from "#/shared/lib/password.js";
import {
    generateSessionSecret,
    hashSessionSecret,
    createSessionToken,
} from "#/shared/lib/session_manager.js";

/**
 * Selesaikan proses signup: ambil SignupSession yang sudah verified, buat
 * User baru, lalu hapus SignupSession-nya. Dipanggil dari /register, yang
 * mensyaratkan signup_session_token cookie (lihat requireSignupSession()).
 *
 * @param {object} signupSession - req.signupSession, dari requireSignupSession()
 * @param {string} username
 * @param {string} password
 */
export async function register(signupSession, username, password) {
    if (!signupSession.email_verified_at) {
        throw ClientError.forbidden("Alamat email belum di-verifikasi");
    }

    const exists = await prisma.user.findUnique({
        where: { email_address: signupSession.email_address },
    });

    if (exists) {
        throw ClientError.conflict(
            "Email address sudah di register sebelum nya",
        );
    }

    // NOTE: Aku rasa cek password strength ini terlalu ketat, apalagi untuk website kecil begini
    //       mungkin di masa-depan jika perlu reinstate it... i guess
    //
    // const isSafe = await verifyUserPasswordStrength(password);
    // if (!isSafe) {
    //     throw ClientError.unprocessable(
    //         "Password ini tidak aman karena telah bocor dalam database data breach internet. Gunakan kombinasi lain.",
    //     );
    // }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
        const tempUser = await tx.user.create({
            data: {
                id: nanoid(),
                email_address: signupSession.email_address,
                username,
                password_hash: passwordHash,
            },
        });
        await tx.signupSession.delete({ where: { id: signupSession.id } });
        return tempUser;
    });

    const token = await createAuthSessionForUser(user.id);
    return { token, user };
}

export async function login(emailAddress, password) {
    const user = await prisma.user.findUnique({
        where: { email_address: emailAddress },
    });

    if (!user) {
        throw ClientError.unauthorized(
            "Akun dengan ini alamat email ini, tidak ditemukan",
        );
    }

    if (!(await bcrypt.compare(password, user.password_hash))) {
        throw ClientError.unauthorized("Password salah");
    }

    const token = await createAuthSessionForUser(user.id);
    return { token, user };
}

async function createAuthSessionForUser(userId) {
    const secret = generateSessionSecret();
    const authSession = await prisma.authSession.create({
        data: {
            id: nanoid(),
            user_id: userId,
            session_secret_hash: hashSessionSecret(secret),
            expires_at: new Date(
                Date.now() + Number(process.env.SESSION_TOKEN_AGE),
            ),
        },
    });
    return createSessionToken(authSession.id, secret);
}

export async function findAuthSession(id) {
    return prisma.authSession.findUnique({
        where: { id },
    });
}

export async function logout(id) {
    try {
        await prisma.authSession.delete({ where: { id } });
    } catch (err) {
        if (err.code === "P2025") {
            throw ClientError.notFound("Session tidak ditemukan");
        }
        throw err;
    }
}
