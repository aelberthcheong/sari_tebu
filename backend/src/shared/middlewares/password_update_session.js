import { findPasswordUpdateSession } from "#/modules/password_update_sessions/service.js";
import requireSession from "./session.js";

export default function requirePasswordUpdateSession() {
    return requireSession({
        cookieName: "password_update_session_token",
        requestKey: "passwordUpdateSession",
        findSessionFn: findPasswordUpdateSession,
    })();
}