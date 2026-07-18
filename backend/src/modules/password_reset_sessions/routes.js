import { Router } from "express";

import requireRateLimit from "#/shared/middlewares/rate_limit.js";
import { requirePasswordResetSession } from "#/shared/middlewares/sessions.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    createPasswordResetSession,
    verifyEmailAddress,
    resendVerificationCode,
    resetPassword,
    cancelPasswordReset,
} from "./controller.js";
import {
    createPasswordResetSessionSchema,
    verifyEmailAddressSchema,
    resetPasswordSchema,
} from "./schema.js";

const routes = Router();

/**
 * NOTE:
 *     POST /
 *     Mulai forgot-password flow dengan email. Selalu balas sukses
 *     (anti user-enumeration), tapi kode verifikasi cuma dikirim kalau
 *     emailnya memang terdaftar.
 *
 *     POST /verify-email-address
 *     Verifikasi kode dari email.
 *
 *     POST /resend-verification-code
 *     Kirim ulang kode verifikasi.
 *
 *     PATCH /
 *     Set password baru, butuh email yang sudah verified.
 *
 *     DELETE /
 *     Batalkan proses reset password.
 */
routes.post("/", [
    requireRateLimit(1000, 5, 5 * 60 * 1000),
    requireValidation("body", createPasswordResetSessionSchema),
    createPasswordResetSession,
]);

routes.post("/verify-email-address", [
    requireValidation("body", verifyEmailAddressSchema),
    requirePasswordResetSession(),
    verifyEmailAddress,
]);

routes.post("/resend-verification-code", [
    requireRateLimit(1000, 5, 5 * 60 * 1000),
    requirePasswordResetSession(),
    resendVerificationCode,
]);

routes.patch("/", [
    requireValidation("body", resetPasswordSchema),
    requirePasswordResetSession(),
    resetPassword,
]);

routes.delete("/", [requirePasswordResetSession(), cancelPasswordReset]);

export default routes;
