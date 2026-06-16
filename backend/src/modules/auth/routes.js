import { Router } from "express";

import requireValidation from "#/shared/middlewares/validation.js";

import { login, logout, refreshAccessToken } from "./controller.js";
import {
    createAuthSchema,
    renewAccessTokenSchema,
    logoutAuthSchema,
} from "./schema.js";

const routes = Router();

routes.post("/login", [requireValidation("body", createAuthSchema), login]);
routes.post("/refresh", [
    requireValidation("body", renewAccessTokenSchema),
    refreshAccessToken,
]);
routes.post("/logout", [requireValidation("body", logoutAuthSchema), logout]);

export default routes;
