import { createHash, randomBytes } from "node:crypto";

import ClientError from "#/shared/exceptions/client_error.js";

export function generateSessionSecret() {
    return randomBytes(32);
}

/**
 * Hash session secret dengan algoritma SHA-256
 * @param {Buffer} secret
 * @returns {Buffer}
 */
export function hashSessionSecret(secret) {
    return createHash("sha256")
        .update(secret)
        .digest();
}

/**
 * Encodes sessionId and sesissonSecret jadi sebuah token yang url-safe (Base64-encoded)
 * Format: `<sessionId>.<base64Secret>`
 * @param {string} sessionId
 * @param {Buffer} secret
 */
export function createSessionToken(sessionId, secret) {
    return `${sessionId}.${secret.toString("base64")}`;
}

/**
 * @param {string} token
 * @returns {{ sessionId: string, secret: Buffer }}
 */
export function parseSessionToken(token) {
    const parts = token.split(".");
    if (parts.length !== 2)
        throw new ClientError.badRequest("Invalid session token");
    const [sessionId, encodedSecret] = parts;
    return {
        sessionId,
        secret: Buffer.from(encodedSecret, "base64"),
    };
}
