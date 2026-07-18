import { Router } from "express";

import { requireAuthSession } from "#/shared/middlewares/sessions.js";
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

routes.post("/", [requireAuthSession(), createCart]);
routes.get("/", [requireAuthSession(), listCarts]);
routes.get("/:cartId", [requireAuthSession(), getCart]);
routes.delete("/:cartId", [requireAuthSession(), deleteCart]);

routes.post("/:cartId/items", [
    requireAuthSession(),
    requireValidation("body", addItemSchema),
    addItemToCart,
]);
routes.patch("/:cartId/items/:productId", [
    requireAuthSession(),
    requireValidation("body", updateItemSchema),
    updateItem,
]);
routes.delete("/:cartId/items/:productId", [requireAuthSession(), removeItem]);

export default routes;
