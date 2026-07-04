import { Router } from "express";

import requireAuthSession from "#/shared/middlewares/auth_session.js";
import requireRole from "#/shared/middlewares/role.js";
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

// NOTE: Semua role (OWNER, ADMIN, KASIR) boleh MELIHAT produk, karena kasir
//       butuh lihat katalog produk untuk transaksi di halaman POS.
routes.get("/", [
    requireAuthSession(),
    requireRole(),
    requireValidation("query", getProductsQuerySchema),
    getProducts,
]);
routes.get("/:id", [requireAuthSession(), requireRole(), getProduct]);

// NOTE: Hanya OWNER dan ADMIN yang boleh mengelola (create/update/delete) produk.
//       KASIR tidak diizinkan mengubah katalog produk atau stok secara langsung.
routes.post("/", [
    requireAuthSession(),
    requireRole(["OWNER", "ADMIN"]),
    requireValidation("body", createProductSchema),
    createProduct,
]);
routes.put("/:id", [
    requireAuthSession(),
    requireRole(["OWNER", "ADMIN"]),
    requireValidation("body", updateProductSchema),
    updateProduct,
]);
routes.patch("/:id", [
    requireAuthSession(),
    requireRole(["OWNER", "ADMIN"]),
    requireValidation("body", editProductSchema),
    editProduct,
]);
routes.delete("/:id", [
    requireAuthSession(),
    requireRole(["OWNER", "ADMIN"]),
    deleteProduct,
]);

export default routes;
