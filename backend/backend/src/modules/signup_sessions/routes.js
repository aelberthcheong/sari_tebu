import { Router } from "express";

import requireRateLimit from "#/shared/middlewares/rate_limit.js";
import requireValidation from "#/shared/middlewares/validation.js";
import requireSignupSession from "#/shared/middlewares/signup_session.js";

import {
    createSignupSession,
    verifyEmailAddress,
    resendVerificationCode,
    cancelSignup,
} from "./controller.js";
import {
    createSignupSessionSchema,
    verifyEmailAddressSchema,
} from "./schema.js";

const routes = Router();

/**
 * NOTE:
 *     POST /
 *     Buat signUpSession hanya dengan alamat email, jika email sudah ada di authSession
 *     maka akan gagal, tapi jika ada di signupSession sebelumnya maka replace session itu
 *     dengan signupSession baru.
 *
 *     POST /verify-email-address
 *     Disini kasih code dari kode verifikasi yang di-dapatkan dari email, dan kita set is_email_verified jadi true
 *     nanti akan dilanjutkan oleh authSession.
 *
 *     POST /resend-verification-code
 *     Kirim ulang kode verifikasi yang baru.
 */

routes.post("/", [
    requireValidation("body", createSignupSessionSchema),
    createSignupSession,
]);

routes.post("/verify-email-address", [
    requireValidation("body", verifyEmailAddressSchema),
    requireSignupSession(),
    verifyEmailAddress,
]);

routes.post("/resend-verification-code", [
    requireRateLimit(1000, 5, 5 * 60 * 1000),
    requireSignupSession(),
    resendVerificationCode,
]);

routes.delete("/", [
    requireSignupSession(),
    cancelSignup,
]);

export default routes;
