import { Router } from "express";

import { validatePayload } from "../../shared/middlewares/validate_middleware.js";
import { login, logout, refreshAccessToken } from "./controller.js";
import {
    createAuthSchema,
    renewAccessTokenSchema,
    deleteAuthSchema,
} from "./schema.js";

const routes = Router();

routes.post("/authentications", validatePayload(createAuthSchema), login);
routes.put(
    "/authentications",
    validatePayload(renewAccessTokenSchema),
    refreshAccessToken,
);
routes.delete("/authentications", validatePayload(deleteAuthSchema), logout);

export default routes;
