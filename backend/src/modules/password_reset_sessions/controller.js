import { prisma } from "#/shared/database/index.js";
import mail from "#/shared/email/index.js";

import * as PasswordResetSessionService from "./service.js";

export async function createPasswordResetSession(req, res) {
    const { emailAddress } = req.validatedBody;
    const { token, verificationCode } =
        await PasswordResetSessionService.createPasswordResetSession(
            emailAddress,
        );

    console.log(token);

    if (token) {
        await mail.sendPasswordResetCodeEmail(emailAddress, verificationCode);
        res.cookie("password_reset_session_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: Number(process.env.SESSION_TOKEN_AGE),
        });
    }

    // Selalu balas sukses, tidak peduli apakah emailnya terdaftar atau
    // tidak, supaya endpoint ini tidak bisa dipakai untuk enumerasi user.
    res.status(201).json({
        status: "success",
        message: "Jika email terdaftar, cek email mu untuk kode verifikasi",
    });
}

export async function verifyEmailAddress(req, res) {
    const { code } = req.validatedBody;
    await PasswordResetSessionService.verifyEmailAddress(
        req.passwordResetSession,
        code,
    );
    res.status(200).json({
        status: "success",
        message: "Email berhasil di-verifikasi",
    });
}

export async function resendVerificationCode(req, res) {
    const verificationCode =
        await PasswordResetSessionService.refreshVerificationCode(
            req.passwordResetSession.id,
        );

    const user = await prisma.user.findUnique({
        where: { id: req.passwordResetSession.user_id },
    });

    await mail.sendPasswordResetCodeEmail(user.email_address, verificationCode);
    res.status(200).json({
        status: "success",
        message: "Kode verifikasi dikirim kembali",
    });
}

export async function resetPassword(req, res) {
    const { password } = req.validatedBody;
    await PasswordResetSessionService.resetPassword(
        req.passwordResetSession,
        password,
    );

    res.clearCookie("password_reset_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    // Karena resetPassword() juga menghapus semua AuthSession user, hapus
    // juga cookie auth_session_token kalau ada di browser yang sama.
    res.clearCookie("auth_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.status(200).json({
        status: "success",
        message: "Password berhasil di-reset",
    });
}

export async function cancelPasswordReset(req, res) {
    await PasswordResetSessionService.deletePasswordResetSession(
        req.passwordResetSession.id,
    );
    res.clearCookie("password_reset_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.sendStatus(204);
}
