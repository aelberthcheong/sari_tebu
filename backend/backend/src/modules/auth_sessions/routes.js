import { Router } from "express";
import requireRateLimit from "#/shared/middlewares/rate_limit.js";
import requireValidation from "#/shared/middlewares/validation.js";
import requireSignupSession from "#/shared/middlewares/signup_session.js";
import requireAuthSession from "#/shared/middlewares/auth_session.js";
import requireRole from "#/shared/middlewares/role.js";
import { registerSchema, loginSchema } from "./schema.js";
import { register, login, logout, getCurrentSession } from "./controller.js";

const routes = Router();

/**
 * NOTE:
 *     POST /register
 *     Selesaikan signup: butuh signup_session_token cookie yang sudah
 *     is_email_verified = true. Buat User baru + langsung login (AuthSession).
 *
 *     POST /login
 *     Login pakai email + password, buat AuthSession baru.
 *
 *     DELETE /
 *     Logout, hapus AuthSession yang sedang aktif.
 *
 *     GET /
 *     Cek session yang sedang aktif (mis. buat validasi di frontend).
 */
routes.post("/register", [
    requireValidation("body", registerSchema),
    requireSignupSession(),
    register,
]);

routes.post("/login", [
    requireRateLimit(1000, 5, 60 * 1000),
    requireValidation("body", loginSchema),
    login,
]);

routes.delete("/", [
    requireAuthSession(),
    logout,
]);

routes.get("/", [
    requireAuthSession(),
    requireRole(),
    getCurrentSession,
]);

export default routes;
