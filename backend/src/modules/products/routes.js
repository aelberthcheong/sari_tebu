import { Router } from "express";

import requireAuthentication from "#/shared/middlewares/authentication.js";
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
    requireAuthentication(),
    requireValidation("query", getProductsQuerySchema),
    getProducts,
]);
routes.get("/:id", [requireAuthentication(), getProduct]);
routes.post("/", [
    requireAuthentication(),
    requireValidation("body", createProductSchema),
    createProduct,
]);
routes.put("/:id", [
    requireAuthentication(),
    requireValidation("body", updateProductSchema),
    updateProduct,
]);
routes.patch("/:id", [
    requireAuthentication(),
    requireValidation("body", editProductSchema),
    editProduct,
]);
routes.delete("/:id", [requireAuthentication(), deleteProduct]);

export default routes;
