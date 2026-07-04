import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";

/**
 * Middleware otorisasi berbasis role. HARUS dipasang SETELAH requireAuthSession(),
 * karena bergantung pada `req.authSession.user_id`.
 *
 * Melakukan dua hal:
 *   1. Mengambil data User lengkap (termasuk `role`) dan menempelkannya ke `req.user`,
 *      supaya controller/service lain bisa memakainya (mis. cek kepemilikan data).
 *   2. Kalau parameter `allowedRoles` diisi, request akan ditolak (403) jika role
 *      user tidak termasuk dalam daftar tersebut.
 *
 * @param {("OWNER"|"ADMIN"|"KASIR")[]} [allowedRoles] - Kalau kosong/tidak diisi,
 *        middleware ini hanya attach `req.user` tanpa membatasi role (dipakai untuk
 *        endpoint yang perlu tahu role user tapi semua role boleh akses, mis. GET /api/auth).
 *
 * @example
 * ```javascript
 * routes.post("/", [requireAuthSession(), requireRole(["OWNER", "ADMIN"]), createProduct]);
 * ```
 */
export default function requireRole(allowedRoles = []) {
    return async function (req, res, next) {
        const authSession = req.authSession;
        if (!authSession) {
            // Programmer error: requireRole() dipakai tanpa requireAuthSession() sebelumnya.
            throw new Error(
                "requireRole() harus dipasang setelah requireAuthSession() pada routes.",
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: authSession.user_id },
            select: { id: true, email_address: true, username: true, role: true },
        });

        if (!user) {
            throw ClientError.unauthorized("User tidak ditemukan");
        }

        req.user = user;

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            throw ClientError.forbidden(
                "Kamu tidak memiliki akses untuk melakukan aksi ini",
            );
        }

        next();
    };
}
