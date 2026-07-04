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
    verifyUserPasswordStrength,
    verifyUserPasswordPattern,
} from "#/shared/lib/password.js";

/**
 * Selesaikan proses signup: ambil SignupSession yang sudah verified, buat
 * User baru, lalu hapus SignupSession-nya. Dipanggil dari /register, yang
 * mensyaratkan signup_session_token cookie (lihat requireSignupSession()).
 *
 * @param {object} signupSession - req.signupSession, dari requireSignupSession()
 * @param {string} username
 * @param {string} password
 * @param {"OWNER"|"ADMIN"|"KASIR"} [role="KASIR"] - Role yang dipilih user saat signup.
 */
export async function register(signupSession, username, password, role = "KASIR") {
    if (!signupSession.email_verified_at) {
        throw ClientError.forbidden("Alamat email belum di-verifikasi");
    }

    // Re-check, jaga-jaga ada race condition antara verifikasi email dan
    // register (e.g. dua tab/request bersamaan pakai email yang sama).
    const exists = await prisma.user.findUnique({
        where: { email_address: signupSession.email_address },
    });

    if (exists) {
        throw ClientError.conflict("Email address sudah di register sebelum nya");
    }

    if (!verifyUserPasswordPattern(password)) {
        throw ClientError.unprocessable(
            "Password harus berukuran 10-100 karakter dan tidak boleh mengandung karakter non-ASCII."
        );
    }

    const isSafe = await verifyUserPasswordStrength(password);
    if (!isSafe) {
        throw ClientError.unprocessable(
            "Password ini tidak aman karena telah bocor dalam database data breach internet. Gunakan kombinasi lain."
        );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                id: nanoid(),
                email_address: signupSession.email_address,
                username,
                password_hash: passwordHash,
                role,
            },
        });
        await tx.signupSession.delete({ where: { id: signupSession.id } });
        return user;
    });

    const token = await createAuthSessionForUser(user.id);
    return { token, user };
}

export async function login(emailAddress, password) {
    const user = await prisma.user.findUnique({
        where: { email_address: emailAddress },
    });

    // Mitigasi Timing Attack menggunakan dummy hash jika user tidak ditemukan
    // Ini memastikan waktu eksekusi bcrypt tetap sama baik email terdaftar maupun tidak
    const dummyHash = "$2b$10$Nx33p8LpWdG7uG3M2bY2O.P.wZ5aG8sN.uVp2X8q1mGZ2rS1T4pW.";
    const hashToCompare = user ? user.password_hash : dummyHash;
    
    const passwordMatches = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordMatches) {
        throw ClientError.unauthorized("Email address atau password salah");
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
            expires_at: new Date(Date.now() + Number(process.env.SESSION_TOKEN_AGE)),
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