import crypto from "crypto";
import process from "process";

import jwt from "jsonwebtoken";

import ClientError from "#/shared/exceptions/client_error.js";

/** @typedef {{ sub: string, sid: string }} Payload */

/**
 * generate AccessToken
 * @param {Payload} payload
 * @returns {string}
 */
export function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: parseInt(process.env.ACCESS_TOKEN_AGE),
    });
}

/**
 * generate refreshToken
 * @param {Payload} payload
 * @returns {string}
 */
export function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: parseInt(process.env.REFRESH_TOKEN_AGE),
    });
}

export function verifyAccessToken(accessToken) {
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
        return decoded;
    } catch {
        throw ClientError.unauthorized("Bad Access Token");
    }
}

export function verifyRefreshToken(refreshToken) {
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
        return decoded;
    } catch {
        throw ClientError.unauthorized("Bad Refresh Token");
    }
}

export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
