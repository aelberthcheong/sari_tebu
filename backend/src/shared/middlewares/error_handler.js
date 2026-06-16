import ClientError from "#/shared/exceptions/client_error.js";

const bodyParserMessages = new Map();
bodyParserMessages.set("entity.parse.failed", "Invalid JSON body");
bodyParserMessages.set("entity.too.large", "Request body too large");
bodyParserMessages.set("charset.unsupported", "Unsupported charset");
bodyParserMessages.set("encoding.unsupported", "Unsupported encoding");

export default function requireErrorHandler() {
    // @ts-ignore
    return function (err, req, res) {
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

        const bodyParserMessage = bodyParserMessages.get(err.type);
        if (bodyParserMessage) {
            res.status(err.statusCode).json({
                status: "fail",
                message: bodyParserMessage,
            });
            return;
        }

        // TODO: add better error logging
        console.error(err);

        res.status(err.statusCode || 500).json({
            status: "error",
            message: "Internal Server Error",
        });
    };
}
