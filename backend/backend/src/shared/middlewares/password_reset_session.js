import { findPasswordResetSession } from "#/modules/password_reset_sessions/service.js";
import requireSession from "./session.js";

export default function requirePasswordResetSession() {
    return requireSession({
        cookieName: "password_reset_session_token",
        requestKey: "passwordResetSession",
        findSessionFn: findPasswordResetSession,
    })();
}