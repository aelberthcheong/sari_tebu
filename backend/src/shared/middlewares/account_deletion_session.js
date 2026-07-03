import { findAccountDeletionSession } from "#/modules/account_deletion_sessions/service.js";
import requireSession from "./session.js";

export default function requireAccountDeletionSession() {
    return requireSession({
        cookieName: "account_deletion_session_token",
        requestKey: "accountDeletionSession",
        findSessionFn: findAccountDeletionSession,
    })();
}