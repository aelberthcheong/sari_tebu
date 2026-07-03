import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authSesssionRoutes from "./modules/auth_sessions/routes.js";
import cartRoutes from "./modules/carts/routes.js";
import productRoutes from "./modules/products/routes.js";
import transactionRoutes from "./modules/transactions/routes.js";
import userRoutes from "./modules/users/routes.js";
import signUpRoutes from "./modules/signup_sessions/routes.js";
import passwordResetRoutes from "./modules/password_reset_sessions/routes.js";
import passwordUpdateRoutes from "./modules/password_update_sessions/routes.js";
import emailAddressUpdateRoutes from "./modules/email_address_update_sessions/routes.js";
import accountDeletionRoutes from "./modules/account_deletion_sessions/routes.js";
import requireErrorHandler from "./shared/middlewares/error_handler.js";

const app = express();

// NOTE: Pastikan `trust proxy` bersifat truthy kalau berada di belakang
// reverse-proxy (e.g. nginx, cloudflare, atau caddy).
app.set("trust proxy", process.env.REVERSE_PROXY);
app.use(cookieParser());
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
    cors({
        origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? [],
    }),
);
app.use(express.json({ limit: "250kb" }));
app.use(express.urlencoded({ extended: true, limit: "250kb" }));

app.use("/sign-up", signUpRoutes);
app.use("/auth", authSesssionRoutes);
app.use("/reset-password", passwordResetRoutes);
app.use("/update-password", passwordUpdateRoutes);
app.use("/update-email-address", emailAddressUpdateRoutes);
app.use("/remove-account", accountDeletionRoutes);
// app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/transactions", transactionRoutes);

// NOTE: Error middleware harus berada pada urutan terakhir
app.use(requireErrorHandler());

export default app;
