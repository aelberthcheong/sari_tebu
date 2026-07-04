import { Router } from "express";
import { serve, setup } from "swagger-ui-express";
import openAPIdocument from "#docs/openapi.json" with { type: "json" }

export default function requireApiDocumentation() {
    const router = Router();

    router.get("/specs", function(req, res) {
        res.sendFile("/docs/openapi.json", { root: "." });
    });

    router.use("/docs", serve);
    router.get("/docs", setup(openAPIdocument));
    
    return router;
}
