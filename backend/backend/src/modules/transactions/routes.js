import { Router } from "express";

import requireAuthSession from "#/shared/middlewares/auth_session.js";
import requireRole from "#/shared/middlewares/role.js";
import requireValidation from "#/shared/middlewares/validation.js";

import { checkout, listTransactions, getTransaction } from "./controller.js";
import { checkoutSchema } from "./schema.js";

const routes = Router();

// NOTE: Semua role boleh checkout (buat transaksi baru dari cart miliknya).
routes.post(
    "/",
    requireAuthSession(),
    requireRole(),
    requireValidation("body", checkoutSchema),
    checkout,
);

// NOTE: KASIR hanya melihat transaksi miliknya sendiri, OWNER/ADMIN melihat
//       semua transaksi (lihat pemfilteran di transactions/service.js).
routes.get("/", requireAuthSession(), requireRole(), listTransactions);
routes.get("/:transactionId", requireAuthSession(), requireRole(), getTransaction);

export default routes;
