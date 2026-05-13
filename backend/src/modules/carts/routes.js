import { Router } from "express";

import authMiddleware from "../../shared/middlewares/auth_middleware.js";
import { validatePayload } from "../../shared/middlewares/validate_middleware.js";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "./controller.js";
import { addCartSchema, updateCartSchema } from "./schema.js";

const routes = Router();

routes.get("/carts", authMiddleware, getCart);
routes.post(
    "/carts",
    authMiddleware,
    validatePayload(addCartSchema),
    addToCart,
);
routes.put(
    "/carts/:id",
    authMiddleware,
    validatePayload(updateCartSchema),
    updateCartItem,
);
routes.delete("/carts/:id", authMiddleware, removeFromCart);
routes.delete("/carts", authMiddleware, clearCart);

export default routes;
