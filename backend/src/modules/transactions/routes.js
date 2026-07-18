import { Router } from "express";

import { requireAuthSession } from "#/shared/middlewares/sessions.js";
import requireValidation from "#/shared/middlewares/validation.js";

import { checkout, listTransactions, getTransaction } from "./controller.js";
import { checkoutSchema } from "./schema.js";

const routes = Router();

routes.post(
    "/",
    requireAuthSession(),
    requireValidation("body", checkoutSchema),
    checkout,
);
routes.get("/", requireAuthSession(), listTransactions);
routes.get("/:transactionId", requireAuthSession(), getTransaction);

export default routes;
