import mail from "#/shared/email/index.js";

import * as SignupSessionService from "./service.js";

export async function createSignupSession(req, res) {
    const { emailAddress } = req.body;
    const { token, verificationCode } =
        await SignupSessionService.createSignupSession(emailAddress);

    await mail.sendSignupCodeEmail(emailAddress, verificationCode);

    res.cookie("signup_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: process.env.SESSION_TOKEN_AGE,
    });

    res.status(201).json({
        status: "success",
        message: "Cek email mu untuk kode verifikasi",
    });
}

export async function verifyEmailAddress(req, res) {
    const { code } = req.body;

    await SignupSessionService.verifyEmailAddress(req.signupSession, code);
    res.status(200).json({
        status: "success",
        message: "Email berhasil di-verifikasi",
    });
}

export async function resendVerificationCode(req, res) {
    const verificationCode = await refreshVerificationCode(
        req.signupSession.id,
    );

    await mail.sendSignupCodeEmail(
        req.signupSession.email_address,
        verificationCode,
    );

    res.status(200).json({
        status: "success",
        message: "Kode verifikasi dikirim kembali",
    });
}

export async function cancelSignup(req, res) {
    await SignupSessionService.deleteSignupSession(req.signupSession.id);

    res.clearCookie("signup_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.sendStatus(204);
}
