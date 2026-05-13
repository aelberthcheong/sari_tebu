import cors from "cors";
import express from "express";

import authenticationsRoutes from "./modules/authentications/routes.js";
import cartsRoutes from "./modules/carts/routes.js";
import productRoutes from "./modules/products/routes.js";
import transactionsRoutes from "./modules/transactions/routes.js";
import usersRoutes from "./modules/users/routes.js";
import errorMiddleware from "./shared/middlewares/error_middleware.js";
import reqlog from "./shared/middlewares/reqlog_middleware.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ALLOWED_ORIGINS,
    }),
);
app.use(express.json());
app.use(reqlog());

app.use("/", [
    usersRoutes,
    authenticationsRoutes,
    productRoutes,
    cartsRoutes,
    transactionsRoutes,
]);

// NOTE: Error middleware harus berada pada urutan terakhir
app.use(errorMiddleware);

export default app;
