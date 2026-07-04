import { findAuthSession } from "#/modules/auth_sessions/service.js";
import requireSession from "./session.js";

export default function rqeuireAuthSession() {
    return requireSession({
        cookieName: "auth_session_token",
        requestKey: "authSession",
        findSessionFn: findAuthSession,
    })();
} 