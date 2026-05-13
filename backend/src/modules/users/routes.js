import { Router } from "express";

import authMiddleware from "../../shared/middlewares/auth_middleware.js";
import { validatePayload } from "../../shared/middlewares/validate_middleware.js";
import { createUser, deleteUser, getUsers, getUserById } from "./controller.js";
import { createUserSchema } from "./schema.js";

const routes = Router();

routes.post("/users", validatePayload(createUserSchema), createUser);
routes.get("/users", authMiddleware, getUsers);
routes.get("/users/:id", authMiddleware, getUserById);
routes.delete("/users/:id", authMiddleware, deleteUser);

export default routes;
