import * as AccountDeletionSessionService from "./service.js";

export async function createAccountDeletionSession(req, res) {
    const { token } =
        await AccountDeletionSessionService.createAccountDeletionSession(
            req.authSession,
        );

    res.cookie("account_deletion_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: Number(process.env.SESSION_TOKEN_AGE),
    });

    res.sendStatus(204);
}

export async function verifyPassword(req, res) {
    await AccountDeletionSessionService.doesPasswordMatches(
        req.authSession,
        req.validatedBody.password,
    );

    res.status(200).json({
        status: "success",
        message: "Berhasil verifikasikan password",
    });
}

export async function deleteAccount(req, res) {
    await AccountDeletionSessionService.deleteAccount(
        req.accountDeletionSession,
        req.authSession.user_id,
    );

    // Hapus semua cookies, user sudah tidak punya akun.
    const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    res.clearCookie("auth_session_token", cookieOpts);
    res.clearCookie("account_deletion_session_token", cookieOpts);

    res.sendStatus(204);
}

export async function cancelAccountDeletion(req, res) {
    await AccountDeletionSessionService.cancelAccountDeletion(
        req.accountDeletionSession.id,
    );

    res.clearCookie("account_deletion_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.sendStatus(204);
}
