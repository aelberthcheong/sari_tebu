import { Router } from "express";

import requireRateLimit from "#/shared/middlewares/rate_limit.js";
import {
    requireAuthSession,
    requireEmailAddressUpdateSession,
} from "#/shared/middlewares/sessions.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    createEmailAddressUpdateSession,
    verifyEmailAddress,
    resendVerificationCode,
    updateEmailAddress,
    cancelEmailAddressUpdate,
} from "./controller.js";
import {
    createEmailAddressUpdateSessionSchema,
    verifyEmailAddressSchema,
} from "./schema.js";

const routes = Router();

/**
 * NOTE:
 *     POST /
 *     Mulai email update flow. Butuh auth_session aktif + alamat email baru.
 *     Kode verifikasi dikirim ke alamat baru.
 *
 *     POST /verify-email-address
 *     Verifikasi kode dari email baru.
 *
 *     POST /resend-verification-code
 *     Kirim ulang kode verifikasi.
 *
 *     PATCH /
 *     Terapkan perubahan email. Butuh is_email_verified = true.
 *
 *     DELETE /
 *     Batalkan proses update email.
 */
routes.post("/", [
    requireRateLimit(1000, 5, 5 * 60 * 1000),
    requireValidation("body", createEmailAddressUpdateSessionSchema),
    requireAuthSession(),
    createEmailAddressUpdateSession,
]);

routes.post("/verify-email-address", [
    requireValidation("body", verifyEmailAddressSchema),
    requireAuthSession(),
    requireEmailAddressUpdateSession(),
    verifyEmailAddress,
]);

routes.post("/resend-verification-code", [
    requireRateLimit(1000, 5, 5 * 60 * 1000),
    requireAuthSession(),
    requireEmailAddressUpdateSession(),
    resendVerificationCode,
]);

routes.patch("/", [
    requireAuthSession(),
    requireEmailAddressUpdateSession(),
    updateEmailAddress,
]);

routes.delete("/", [
    requireAuthSession(),
    requireEmailAddressUpdateSession(),
    cancelEmailAddressUpdate,
]);

export default routes;
