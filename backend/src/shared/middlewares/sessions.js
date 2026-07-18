import { timingSafeEqual } from "node:crypto";

import { findAccountDeletionSession } from "#/modules/account_deletion_sessions/service.js";
import { findAuthSession } from "#/modules/auth_sessions/service.js";
import { findEmailAddressUpdateSession } from "#/modules/email_address_update_sessions/service.js";
import { findPasswordResetSession } from "#/modules/password_reset_sessions/service.js";
import { findPasswordUpdateSession } from "#/modules/password_update_sessions/service.js";
import { findSignupSession } from "#/modules/signup_sessions/service.js";
import ClientError from "#/shared/exceptions/client_error.js";
import {
    parseSessionToken,
    hashSessionSecret,
} from "#/shared/lib/session_manager.js";

/**
 * Session middleware factory, Gunakan untuk buat sessions middleware e.g. requireSignupSession, requireAuthSession, dll.
 *
 * @param {object} options
 * @param {string} options.cookieName Nama cookie
 * @param {string} options.requestKey Key untuk attach session ke req (e.g. "signupSession" → req.signupSession)
 * @param {(id: string) => Promise<{ secret_hash: Buffer } | null>} options.findSessionFn Callback function untuk query DB
 * @returns {import("express").RequestHandler}
 */
function requireSessionFactory({ cookieName, requestKey, findSessionFn }) {
    return function () {
        return async function (req, res, next) {
            const token = req.cookies[cookieName];
            if (!token) {
                throw ClientError.unauthorized(`Missing cookie: ${cookieName}`);
            }

            const { sessionId, secret } = parseSessionToken(token);
            const session = await findSessionFn(sessionId);

            if (!session) {
                throw ClientError.unauthorized("Session expired");
            }

            const hashedSecret = hashSessionSecret(secret);
            if (hashedSecret.length !== session.session_secret_hash.length) {
                throw ClientError.unauthorized("Invalid session credentials");
            }

            if (!timingSafeEqual(hashedSecret, session.session_secret_hash)) {
                throw ClientError.unauthorized("Invalid session credentials");
            }

            req[requestKey] = session;
            next();
        };
    };
}

/**
 * Middleware untuk enforce valid account deletion session.
 * @example
 * ```javascript
 * app.delete('/account', requireAccountDeletionSession(), (req, res) => {
 *     const session = req.accountDeletionSession;
 * });
 * ```
 */
export function requireAccountDeletionSession() {
    return requireSessionFactory({
        cookieName: "account_deletion_session_token",
        requestKey: "accountDeletionSession",
        findSessionFn: findAccountDeletionSession,
    })();
}

/**
 * Middleware untuk enforce valid auth session.
 * @example
 * ```javascript
 * app.get('/me', requireAuthSession(), (req, res) => {
 *     const session = req.authSession;
 * });
 * ```
 */
export function requireAuthSession() {
    return requireSessionFactory({
        cookieName: "auth_session_token",
        requestKey: "authSession",
        findSessionFn: findAuthSession,
    })();
}

/**
 * Middleware untuk enforce valid email address update session.
 * @example
 * ```javascript
 * app.patch('/email/verify', requireEmailAddressUpdateSession(), (req, res) => {
 *     const session = req.emailAddressUpdateSession;
 * });
 * ```
 */
export function requireEmailAddressUpdateSession() {
    return requireSessionFactory({
        cookieName: "email_address_update_session_token",
        requestKey: "emailAddressUpdateSession",
        findSessionFn: findEmailAddressUpdateSession,
    })();
}

/**
 * Middleware untuk enforce valid password reset session.
 * @example
 * ```javascript
 * app.post('/password/reset', requirePasswordResetSession(), (req, res) => {
 *     const session = req.passwordResetSession;
 * });
 * ```
 */
export function requirePasswordResetSession() {
    return requireSessionFactory({
        cookieName: "password_reset_session_token",
        requestKey: "passwordResetSession",
        findSessionFn: findPasswordResetSession,
    })();
}

/**
 * Middleware untuk enforce valid password update session.
 * @example
 * ```javascript
 * app.put('/password', requirePasswordUpdateSession(), (req, res) => {
 *     const session = req.passwordUpdateSession;
 * });
 * ```
 */
export function requirePasswordUpdateSession() {
    return requireSessionFactory({
        cookieName: "password_update_session_token",
        requestKey: "passwordUpdateSession",
        findSessionFn: findPasswordUpdateSession,
    })();
}

/**
 * Middleware untuk enforce valid signup session.
 * @example
 * ```javascript
 * app.post('/signup/verify', requireSignupSession(), (req, res) => {
 *     const session = req.signupSession;
 * });
 * ```
 */
export function requireSignupSession() {
    return requireSessionFactory({
        cookieName: "signup_session_token",
        requestKey: "signupSession",
        findSessionFn: findSignupSession,
    })();
}
