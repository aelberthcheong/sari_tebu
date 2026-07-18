import mail from "#/shared/email/index.js";

import * as AuthSessionService from "./service.js";

export async function register(req, res) {
    const { username, password } = req.validatedBody;
    const { token, user } = await AuthSessionService.register(
        req.signupSession,
        username,
        password,
    );

    // signup_session_token sudah tidak relevan lagi setelah register berhasil.
    res.clearCookie("signup_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.cookie("auth_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: Number(process.env.SESSION_TOKEN_AGE),
    });

    res.status(201).json({
        status: "success",
        message: "Akun berhasil dibuat",
        data: {
            user: {
                id: user.id,
                email_address: user.email_address,
                username: user.username,
            },
        },
    });
}

export async function login(req, res) {
    const { emailAddress, password } = req.validatedBody;
    const { token, user } = await AuthSessionService.login(
        emailAddress,
        password,
    );

    res.cookie("auth_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: Number(process.env.SESSION_TOKEN_AGE),
    });

    await mail.sendSignedInEmail(user.email_address);

    res.status(200).json({
        status: "success",
        message: "Berhasil login",
        data: {
            user: {
                id: user.id,
                email_address: user.email_address,
                username: user.username,
            },
        },
    });
}

export async function logout(req, res) {
    await AuthSessionService.logout(req.authSession.id);
    res.clearCookie("auth_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.sendStatus(204);
}

export async function getCurrentSession(req, res) {
    res.status(200).json({
        status: "success",
        message: "Session aktif",
        data: {
            session: {
                id: req.authSession.id,
                user_id: req.authSession.user_id,
                expires_at: req.authSession.expires_at,
            },
        },
    });
}
