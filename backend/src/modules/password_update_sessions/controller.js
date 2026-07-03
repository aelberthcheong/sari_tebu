import mail from "#/shared/email/index.js";
import { prisma } from "#/shared/database/index.js";
import * as PasswordUpdateSessionService from "./service.js";

export async function createPasswordUpdateSession(req, res) {
    const { token } = await PasswordUpdateSessionService.createPasswordUpdateSession(
        req.authSession,
    );

    const user = await prisma.user.findUnique({
        where: { id: req.authSession.user_id },
    });

    if (user) {
        await mail.sendPasswordUpdateConfirmationEmail(user.email_address);
    }

    res.cookie("password_update_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: Number(process.env.SESSION_TOKEN_AGE),
    });

    res.status(201).json({
        status: "success",
        message: "Session pembaruan kata sandi dibuat. Silakan verifikasi password lama Anda.",
    });
}

export async function confirmCurrentPassword(req, res) {
    const { currentPassword } = req.validatedBody;

    await PasswordUpdateSessionService.verifyCurrentPassword(
        req.passwordUpdateSession,
        currentPassword
    );

    res.status(200).json({
        status: "success",
        message: "Password lama cocok, silakan lanjutkan pengisian password baru",
    });
}

export async function updatePassword(req, res) {
    const { newPassword } = req.validatedBody;
    
    await PasswordUpdateSessionService.updatePassword(
        req.passwordUpdateSession,
        newPassword
    );

    res.clearCookie("password_update_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.status(200).json({
        status: "success",
        message: "Password berhasil diperbarui",
    });
}

export async function cancelPasswordUpdate(req, res) {
    await PasswordUpdateSessionService.cancelPasswordUpdate(
        req.passwordUpdateSession.id,
    );

    res.clearCookie("password_update_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.sendStatus(204);
}