import { findEmailAddressUpdateSession } from "#/modules/email_address_update_sessions/service.js";
import requireSession from "./session.js";

export default function requireEmailAddressUpdateSession() {
    return requireSession({
        cookieName: "email_address_update_session_token",
        requestKey: "EmailAddressUpdateSession",
        findSessionFn: findEmailAddressUpdateSession,
    })();
}