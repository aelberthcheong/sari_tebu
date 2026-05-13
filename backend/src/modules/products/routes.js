import { Router } from "express";

import authMiddleware from "../../shared/middlewares/auth_middleware.js";
import { validatePayload } from "../../shared/middlewares/validate_middleware.js";
import {
    getProduct,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "./controller.js";
import { createProductSchema, updateProductSchema } from "./schema.js";

const routes = Router();

routes.get("/products", authMiddleware, getProducts);
routes.get("/products/:id", authMiddleware, getProduct);
routes.post(
    "/products",
    authMiddleware,
    validatePayload(createProductSchema),
    createProduct,
);
routes.put(
    "/products/:id",
    authMiddleware,
    validatePayload(updateProductSchema),
    updateProduct,
);
routes.delete("/products/:id", authMiddleware, deleteProduct);

export default routes;
