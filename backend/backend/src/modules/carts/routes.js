import { Router } from "express";

import requireAuthSession from "#/shared/middlewares/auth_session.js";
import requireRole from "#/shared/middlewares/role.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    createCart,
    listCarts,
    getCart,
    deleteCart,
    addItemToCart,
    updateItem,
    removeItem,
} from "./controller.js";
import { updateItemSchema, addItemSchema } from "./schema.js";

const routes = Router();

// NOTE: Semua role (OWNER, ADMIN, KASIR) boleh memakai keranjang/POS.
routes.post("/", [requireAuthSession(), requireRole(), createCart]);
routes.get("/", [requireAuthSession(), requireRole(), listCarts]);
routes.get("/:cartId", [requireAuthSession(), requireRole(), getCart]);
routes.delete("/:cartId", [requireAuthSession(), requireRole(), deleteCart]);

routes.post("/:cartId/items", [
    requireAuthSession(),
    requireRole(),
    requireValidation("body", addItemSchema),
    addItemToCart,
]);
routes.patch("/:cartId/items/:productId", [
    requireAuthSession(),
    requireRole(),
    requireValidation("body", updateItemSchema),
    updateItem,
]);
routes.delete("/:cartId/items/:productId", [
    requireAuthSession(),
    requireRole(),
    removeItem,
]);

export default routes;
