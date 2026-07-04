import { timingSafeEqual } from "node:crypto";

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
 *
 * @example
 * ```javascript
 * const requireAuth = requireSession({
 *     cookieName: "auth_session_token",
 *     requestKey: "authSession",
 *     findSessionFn: (id) => {
 *         prisma.auth_session.findUnique({ where: { id }}),
 *     }
 * });
 * ```
 */
export default function requireSession({
    cookieName,
    requestKey,
    findSessionFn,
}) {
    return function () {  
        return async function (req, res, next) {
            const token = req.cookies[cookieName];
            if (!token) throw ClientError.unauthorized("Invalid cookie");
        
            const { sessionId, secret } = parseSessionToken(token);
        
            const session = await findSessionFn(sessionId);
            if (!session) {
                throw ClientError.unauthorized("Session invalid");
            }

            if (!session) {
                throw ClientError.unauthorized("Session expired");
            }
        
            if (!timingSafeEqual(hashSessionSecret(secret), session.session_secret_hash)) {
                throw ClientError.unauthorized();
            }
        
            req[requestKey] = session;
            next();
        };
    }
}
