import ClientError from "#/shared/exceptions/client_error.js";

const bodyParserMessages = {
    "entity.parse.failed": "Invalid JSON body",
    "entity.too.large": "Request body too large",
    "charset.unsupported": "Unsupported charset",
    "encoding.unsupported": "Unsupported encoding",
};

export default function requireErrorHandler() {
    // oxlint-disable-next-line no-unused-vars
    return function (err, req, res, next) {
        // TODO(AELBERTH): add better error logging
        console.error("[ERROR]", err.name || err.type, ":", err.message);
        console.error(err);

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

        const bodyParserMessage = bodyParserMessages[err.type];
        if (bodyParserMessage) {
            res.status(err.statusCode || 400).json({
                status: "fail",
                message: bodyParserMessage,
            });
            return;
        }

        res.status(err.statusCode || 500).json({
            status: "error",
            message: "Internal Server Error",
        });
    };
}
