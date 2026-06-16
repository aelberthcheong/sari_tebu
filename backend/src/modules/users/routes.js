import { Router } from "express";

import requireAuthentication from "#/shared/middlewares/authentication.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    editUser,
    deleteUser,
} from "./controller.js";
import {
    createUserSchema,
    updateUserSchema,
    searchUserSchema,
    editUserSchema,
} from "./schema.js";

const routes = Router();

routes.post("/", [requireValidation("body", createUserSchema), createUser]);
routes.get("/", [
    requireAuthentication(),
    requireValidation("body", searchUserSchema),
    getUsers,
]);
routes.get("/:id", [requireAuthentication(), getUserById]);
routes.put("/:id", [
    requireAuthentication(),
    requireValidation("body", updateUserSchema),
    updateUser,
]);
routes.patch("/:id", [
    requireAuthentication(),
    requireValidation("body", editUserSchema),
    editUser,
]);
routes.delete("/:id", [requireAuthentication(), deleteUser]);

export default routes;
