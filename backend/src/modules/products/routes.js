import { Router } from "express";

import { requireAuthSession } from "#/shared/middlewares/sessions.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    getProduct,
    getProducts,
    createProduct,
    updateProduct,
    editProduct,
    deleteProduct,
} from "./controller.js";
import {
    createProductSchema,
    editProductSchema,
    updateProductSchema,
    getProductsQuerySchema,
} from "./schema.js";

const routes = Router();

routes.get("/", [
    requireAuthSession(),
    requireValidation("query", getProductsQuerySchema),
    getProducts,
]);
routes.get("/:id", [requireAuthSession(), getProduct]);
routes.post("/", [
    requireAuthSession(),
    requireValidation("body", createProductSchema),
    createProduct,
]);
routes.put("/:id", [
    requireAuthSession(),
    requireValidation("body", updateProductSchema),
    updateProduct,
]);
routes.patch("/:id", [
    requireAuthSession(),
    requireValidation("body", editProductSchema),
    editProduct,
]);
routes.delete("/:id", [requireAuthSession(), deleteProduct]);

export default routes;
