import ClientError from "../exceptions/client_error.js";

export default function (err, req, res, _next) {
    if (err instanceof ClientError) {
        res.status(err.statusCode).json({
            status: "fail",
            message: err.message,
        });
        return;
    }

    if (err.isJoi) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
        return;
    }

    // TODO: add better error logging
    console.error(err.stack);

    res.status(err.status || 500).json({
        status: "error",
        message: "Internal Server Error",
    });
}
