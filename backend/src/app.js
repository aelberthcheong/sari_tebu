import cors from "cors";
import express from "express";
import helmet from "helmet";

import authRoutes from "#/modules/auth/routes.js";
import cartsRoutes from "#/modules/carts/routes.js";
import productRoutes from "#/modules/products/routes.js";
import transactionsRoutes from "#/modules/transactions/routes.js";
import usersRoutes from "#/modules/users/routes.js";
import requireErrorHandler from "#/shared/middlewares/error_handler.js";
import reqlog from "#/shared/middlewares/reqlog_middleware.js";

const app = express();

// NOTE: Pastikan `trust proxy` bersifat truthy kalau berada di belakang
// reverse-proxy (nginx, cloudflare, atau caddy).
app.set("trust proxy", process.env.REVERSE_PROXY);
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? [],
    }),
);
app.use(express.json({ limit: "250kb" }));
app.use(express.urlencoded({ extended: true, limit: "250kb" }));
app.use(reqlog({ pretty: true }));

app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartsRoutes);
app.use("/api/transactions", transactionsRoutes);

// NOTE: Error middleware harus berada pada urutan terakhir
app.use(requireErrorHandler());

export default app;
