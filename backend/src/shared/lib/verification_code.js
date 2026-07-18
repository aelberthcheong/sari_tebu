import { createHash, timingSafeEqual, randomInt } from "node:crypto";

// oxfmt-ignore
/**
 * Generate 8-digit numeric verification code sebagai string
 * @returns {string} 8 digit numeric string e.g. "01234567"
 */
export function generateVerificationCode() {
    return randomInt(10_000_000, 100_000_000)
            .toString()
            .padStart(8, "0");
}

// oxfmt-ignore
/**
 * Hashes verification code dengan SHA-256, return dalam bentuk 32 bytes buffer
 * @param {string} code - verification code dari user/klien
 * @returns {Buffer} 32 byte hash
 */
export function hashEmailCodeAsBuffer(code) {
    return createHash("sha256")
        .update(code)
        .digest();
}

/**
 * Safely verifies a plain text verification code against its database hash
 * using a constant-time comparison to mitigate timing attacks.
 * @param {string} code - verification code dari user/klien
 * @param {Buffer} dbEmailCodeHash - 32 byte hash dari database
 * @returns {boolean}
 */
export function verifyEmailCodeAsBuffer(code, dbEmailCodeHash) {
    const hashed = hashEmailCodeAsBuffer(code);
    if (hashed.length !== dbEmailCodeHash.length) {
        return false;
    }
    return timingSafeEqual(hashed, dbEmailCodeHash);
}
