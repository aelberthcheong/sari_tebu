import { Router } from "express";
import requireRateLimit from "#/shared/middlewares/rate_limit.js";
import requireValidation from "#/shared/middlewares/validation.js";
import requireAuthSession from "#/shared/middlewares/auth_session.js";
import requirePasswordUpdateSession from "#/shared/middlewares/password_update_session.js";

import {
    verifyCurrentPasswordSchema,
    updatePasswordSchema,
} from "./schema.js";
import {
    createPasswordUpdateSession,
    confirmCurrentPassword,
    updatePassword,
    cancelPasswordUpdate,
} from "./controller.js";

const routes = Router();

/**
 * NOTE:
 * POST /
 * Mulai password update flow. Butuh auth_session aktif.
 * Hanya membuat token 'password_update_session_token' di cookie.
 *
 * POST /verify-password
 * Kirim password saat ini untuk diverifikasi. Jika benar, 
 * lapisan 'password_verified_at' akan diisi timestamp di DB.
 *
 * PATCH /
 * Kirim password baru. Mengubah data field di model User, 
 * lalu menghapus session update ini.
 *
 * DELETE /
 * Batalkan proses update password dan bersihkan cookie.
 */

// Step 1: Inisiasi Session Update
routes.post("/", [
    requireRateLimit(1000, 5, 5 * 60 * 1000),
    requireAuthSession(),
    createPasswordUpdateSession,
]);

// Step 2: Validasi Password Lama
routes.post("/verify-password", [
    requireRateLimit(1000, 5, 1 * 60 * 1000), // Proteksi ekstra dari brute force password lama
    requireValidation("body", verifyCurrentPasswordSchema),
    requireAuthSession(),
    requirePasswordUpdateSession(),
    confirmCurrentPassword,
]);

// Step 3: Simpan Password Baru
routes.patch("/", [
    requireValidation("body", updatePasswordSchema),
    requireAuthSession(),
    requirePasswordUpdateSession(),
    updatePassword,
]);

// Opsional: Cancel/Abort Flow
routes.delete("/", [
    requireAuthSession(),
    requirePasswordUpdateSession(),
    cancelPasswordUpdate,
]);

export default routes;