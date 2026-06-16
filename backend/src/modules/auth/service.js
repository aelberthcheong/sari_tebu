import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";
import * as TokenManager from "#/shared/lib/token_manager.js";

/**
 * Melakukan proses login pengguna. Memverifikasi kredensial, membuat access token dan refresh token,
 * lalu menyimpan refresh token ke database
 * @param {string} emailAddress
 * @param {string} password
 * @throws {ClientError} **401** (Unauthorized) - jika kredential user salah
 */
export async function login(emailAddress, password) {
    const user = await prisma.user.findUnique({
        where: { email_address: emailAddress },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash)))
        throw ClientError.unauthorized("Email atau Password salah");

    const sessionId = `auth-${nanoid()}`;

    const payload = { sub: user.id, sid: sessionId };
    const accessToken = TokenManager.generateAccessToken(payload);
    const refreshToken = TokenManager.generateRefreshToken(payload);

    await prisma.authSession.create({
        data: {
            id: sessionId,
            user_id: user.id,
            refresh_token: TokenManager.hashToken(refreshToken),
            expires_at: new Date(Date.now() + 604800000), // 7d
        },
    });

    return {
        accessToken,
        refreshToken,
    };
}

/**
 * Memperbarui access token menggunakan refresh token yang valid
 * @param {string} refreshToken
 * @throws {ClientError} **401** (Unauthorized)
 */
export async function refreshAccessToken(refreshToken) {
    const decoded = TokenManager.verifyRefreshToken(refreshToken);
    const session = await prisma.authSession.findUnique({
        where: {
            id: decoded.sid,
        },
    });

    const validSession =
        session &&
        session.expires_at > new Date() &&
        session.refresh_token === TokenManager.hashToken(refreshToken);

    if (!validSession) throw ClientError.unauthorized();

    return TokenManager.generateAccessToken({
        // @ts-ignore
        sub: decoded.sub,
        sid: decoded.sid,
    });
}

/**
 * Melakukan proses logout pengguna dengan menghapus refresh token dari database.
 * Jika refresh token sudah tidak ada di database, dianggap sudah logout
 * @param {string} refreshToken
 */
export async function logout(refreshToken) {
    const decoded = TokenManager.verifyRefreshToken(refreshToken);
    await prisma.authSession.deleteMany({
        where: {
            id: decoded.sid,
        },
    });
}
