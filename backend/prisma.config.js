import { defineConfig } from "prisma/config";

/**
 * NOTE: Pada `npm run dev` terdapat flag `--import dotenv/config`. Hal ini diperlukan karena Prisma
 *       memerlukan env vars (seperti `DB_URL`) untuk melakukan koneksi ke database, dan flag ini
 *       memastikan `dotenv` sudah memuat isi `.env` sebelum modul lain (termasuk Prisma adapter MariaDB)
 *       dijalankan.
 * 
 *       Pada production, flag ini tidak digunakan karena environment variables sudah diatur langsung
 *       oleh Docker (`environment:` / `env_file:` pada `docker-compose.yml`), sehingga library `dotenv`
 *       menjadi dev-dependencies dan tidak perlu saat production.
 */
if (process.env.NODE_ENV !== "production") {
    await import("dotenv/config");
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env.DB_URL,
    },
});
