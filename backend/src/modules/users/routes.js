import { Router } from "express";

import { requireAuthSession } from "#/shared/middlewares/sessions.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    addNewUser,
    editUser,
    getUserById,
    getUserByUsername,
    getUserByEmailAddress,
    deleteUser,
} from "./controller.js";
import {
    addNewUserSchema,
    editUserSchema,
    getUserByIdSchema,
    getUserByUsernameSchema,
    getUserByEmailAddressSchema,
} from "./schema.js";

const routes = Router();

routes.post("/", [
    requireAuthSession(),
    requireValidation("body", addNewUserSchema),
    addNewUser,
]);

routes.get("/:id", [
    requireAuthSession(),
    requireValidation("params", getUserByIdSchema),
    getUserById,
]);

routes.get("/:username", [
    requireAuthSession(),
    requireValidation("params", getUserByUsernameSchema),
    getUserByUsername,
]);

routes.get("/:emailAddress", [
    requireAuthSession(),
    requireValidation("params", getUserByEmailAddressSchema),
    getUserByEmailAddress,
]);

routes.put("/:id", [
    requireAuthSession(),
    requireValidation("body", editUserSchema),
    editUser,
]);

routes.patch("/:id", [
    requireAuthSession(),
    requireValidation("body", editUserSchema),
    editUser,
]);

routes.delete("/:id", [requireAuthSession(), deleteUser]);

export default routes;
