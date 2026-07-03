import { Router } from "express";

import requireAuthSession from "#/shared/middlewares/auth_session.js";
import requireRateLimit from "#/shared/middlewares/rate_limit.js";
import requireValidation from "#/shared/middlewares/validation.js";

import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    editUser,
    deleteUser,
} from "./controller.js";
import { createUserSchema } from "./schema.js";

const routes = Router();


// TODO(AELBERTH): Tolong di sesuaikan
// routes.post("/", [
//     requireValidation("body", createUserSchema),
//     requireRateLimit(1000, 5, 5 * 60 * 1000),
//     createUser,
// ]);

// routes.get("/", [
//     requireAuthSession(),
//     requireValidation("body", searchUserSchema),
//     getUsers,
// ]);
// routes.get("/:id", [requireAuthSession(), getUserById]);
// routes.put("/:id", [
//     requireAuthSession(),
//     requireValidation("body", updateUserSchema),
//     updateUser,
// ]);
// routes.patch("/:id", [
//     requireAuthSession(),
//     requireValidation("body", editUserSchema),
//     editUser,
// ]);
// routes.delete("/:id", [requireAuthSession(), deleteUser]);

export default routes;
