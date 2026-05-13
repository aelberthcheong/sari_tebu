import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "src/shared/database/schema.prisma",
    migrations: {
        path: "src/shared/database/migrations",
        seed: "node src/shared/database/seed.js",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});
