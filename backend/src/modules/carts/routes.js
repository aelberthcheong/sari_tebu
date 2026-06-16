import { Router } from "express";

import requireAuthentication from "#/shared/middlewares/authentication.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    addItemToCart,
    editItemFromCart,
    removeItemFromCart,
    getItemsFromCart,
    deleteCart,
} from "./controller.js";
import { addItemToCartSchema, editItemFromCartSchema } from "./schema.js";

const routes = Router();

routes.post("/items", [
    requireAuthentication(),
    requireValidation("body", addItemToCartSchema),
    addItemToCart,
]);
routes.patch("/items/:productId", [
    requireAuthentication(),
    requireValidation("body", editItemFromCartSchema),
    editItemFromCart,
]);
routes.delete("/items/:productId", [
    requireAuthentication(),
    removeItemFromCart,
]);

routes.get("/", [requireAuthentication(), getItemsFromCart]);
routes.delete("/", [requireAuthentication(), deleteCart]);

export default routes;
