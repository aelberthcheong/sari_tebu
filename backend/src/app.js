import cookieParser from "cookie-parser";
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
import requireApiDocumentation from "./shared/middlewares/api_documentation.js";
import requireErrorHandler from "./shared/middlewares/error_handler.js";

const app = express();

// NOTE: Pastikan `trust proxy` bersifat truthy kalau berada di belakang
// reverse-proxy (e.g. nginx, cloudflare, atau caddy).
app.set("trust proxy", process.env.REVERSE_PROXY);
app.use(cookieParser());
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "250kb" }));
app.use(express.urlencoded({ extended: true, limit: "250kb" }));
app.use(requireApiDocumentation());

app.use("/api/sign-up", signUpRoutes);
app.use("/api/auth", authSesssionRoutes);
app.use("/api/reset-password", passwordResetRoutes);
app.use("/api/update-password", passwordUpdateRoutes);
app.use("/api/update-email-address", emailAddressUpdateRoutes);
app.use("/api/remove-account", accountDeletionRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/transactions", transactionRoutes);

// NOTE: Error middleware harus berada pada urutan terakhir
app.use(requireErrorHandler());

export default app;
