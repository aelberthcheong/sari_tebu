import ClientError from "#/shared/exceptions/client_error.js";
import { verifyAccessToken } from "#/shared/lib/token_manager.js";

export default function requireAuthentication() {
    return function (req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw ClientError.badRequest("Authorization header salah format");
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        req.user = decoded; // { sub: user_id, sid: session_id }
        next();
    };
}
