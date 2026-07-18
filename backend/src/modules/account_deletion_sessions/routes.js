import { Router } from "express";

import requireRateLimit from "#/shared/middlewares/rate_limit.js";
import {
    requireAuthSession,
    requireAccountDeletionSession,
} from "#/shared/middlewares/sessions.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    createAccountDeletionSession,
    verifyPassword,
    deleteAccount,
    cancelAccountDeletion,
} from "./controller.js";
import { verifyPasswordSchema } from "./schema.js";

const routes = Router();

/**
 * NOTE:
 *     POST /
 *     Mulai account deletion flow. Butuh auth_session aktif.
 *     Kirim email notifikasi, tidak ada kode verifikasi.
 *
 *     POST /verify-password
 *     Konfirmasi via password (user memegang cookie sub-session).
 *     Set is_password_verified = true.
 *
 *     DELETE /
 *     Hapus akun permanen. Butuh is_password_verified = true.
 *
 *     DELETE /cancel
 *     Batalkan proses penghapusan akun.
 */
routes.post("/", [
    requireRateLimit(1000, 5, 10 * 60 * 1000),
    requireAuthSession(),
    createAccountDeletionSession,
]);

routes.post("/verify-password", [
    requireValidation("body", verifyPasswordSchema),
    requireAuthSession(),
    requireAccountDeletionSession(),
    verifyPassword,
]);

routes.delete("/", [
    requireAuthSession(),
    requireAccountDeletionSession(),
    deleteAccount,
]);

routes.delete("/cancel", [
    requireAuthSession(),
    requireAccountDeletionSession(),
    cancelAccountDeletion,
]);

export default routes;
