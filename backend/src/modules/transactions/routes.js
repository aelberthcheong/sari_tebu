import { Router } from "express";

import requireAuthentication from "#/shared/middlewares/authentication.js";
import requireValidation from "#/shared/middlewares/validation.js";

import { checkout, getTransactions, getTransaction } from "./controller.js";
import { checkoutSchema } from "./schema.js";

const routes = Router();

routes.post(
    "/",
    requireAuthentication(),
    requireValidation("body", checkoutSchema),
    checkout,
);
routes.get("/", requireAuthentication(), getTransactions);
routes.get("/:id", requireAuthentication(), getTransaction);

export default routes;
