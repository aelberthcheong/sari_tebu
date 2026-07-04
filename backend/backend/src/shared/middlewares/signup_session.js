import { findSignupSession } from "#/modules/signup_sessions/service.js";
import requireSession from "./session.js";

export default function requireSignupSession() {
    return requireSession({
        cookieName: "signup_session_token",
        requestKey: "signupSession",
        findSessionFn: findSignupSession,
    })();
} 