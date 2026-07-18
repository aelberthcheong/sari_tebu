import mail from "#/shared/email/index.js";

import * as EmailAddressUpdateSessionService from "./service.js";

export async function createEmailAddressUpdateSession(req, res) {
    const { newEmailAddress } = req.validatedBody;
    const { token, verificationCode } =
        await EmailAddressUpdateSessionService.createEmailAddressUpdateSession(
            req.authSession,
            newEmailAddress,
        );

    await mail.sendAddressResetCodeEmail(newEmailAddress, verificationCode);

    res.cookie("email_address_update_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: Number(process.env.SESSION_TOKEN_AGE),
    });

    res.status(201).json({
        status: "success",
        message: "Cek email baru mu untuk kode verifikasi",
    });
}

export async function verifyEmailAddress(req, res) {
    const { code } = req.validatedBody;
    await EmailAddressUpdateSessionService.verifyEmailAddress(
        req.emailAddressUpdateSession,
        code,
    );
    res.status(200).json({
        status: "success",
        message: "Email berhasil di-verifikasi",
    });
}

export async function resendVerificationCode(req, res) {
    const verificationCode =
        await EmailAddressUpdateSessionService.refreshVerificationCode(
            req.emailAddressUpdateSession,
        );
    await mail.sendAddressResetCodeEmail(
        req.emailAddressUpdateSession.new_email_address,
        verificationCode,
    );
    res.status(200).json({
        status: "success",
        message: "Kode verifikasi dikirim kembali",
    });
}

export async function updateEmailAddress(req, res) {
    const { oldEmailAddress } =
        await EmailAddressUpdateSessionService.updateEmailAddress(
            req.emailAddressUpdateSession,
        );

    res.clearCookie("email_address_update_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    // Notifikasi ke alamat lama bahwa email sudah berubah.
    await mail.sendAddressUpdatedEmail(oldEmailAddress);

    res.status(200).json({
        status: "success",
        message: "Alamat email berhasil diperbarui",
    });
}

export async function cancelEmailAddressUpdate(req, res) {
    await EmailAddressUpdateSessionService.cancelEmailAddressUpdate(
        req.emailAddressUpdateSession.id,
    );
    res.clearCookie("email_address_update_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.sendStatus(204);
}
