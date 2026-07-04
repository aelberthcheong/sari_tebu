/**
 * ClientError bertindak sebagai namespace untuk error HTTP 4xx.
 * @extends {Error}
 */
export default class ClientError extends Error {
    /**
     * Constructor ini seharusnya bersifat private, gunakan static method
     * @param {string} message - Pesan error
     * @param {number} statusCode - HTTP status code (4xx)
     */
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * **400** (Bad Request)
     * @param {string}
     * @returns {ClientError}
     */
    static badRequest(message = "Bad Request") {
        return new ClientError(message, 400);
    }

    /**
     * **401** (Unauthorized)
     * @param {string}
     * @returns {ClientError}
     */
    static unauthorized(message = "Unauthorized") {
        return new ClientError(message, 401);
    }

    /**
     * **403** (Forbidden)
     * @param {string}
     * @returns {ClientError}
     */
    static forbidden(message = "Forbidden") {
        return new ClientError(message, 403);
    }

    /**
     * **404** (Not Found)
     * @param {string}
     * @returns {ClientError}
     */
    static notFound(message = "Not Found") {
        return new ClientError(message, 404);
    }

    /**
     * **409** (Conflict)
     * @param {string}
     * @returns {ClientError}
     */
    static conflict(message = "Conflict") {
        return new ClientError(message, 409);
    }

    /**
     * **410** (Gone)
     * @param {string} message
     * @returns {ClientError}
     */
    static gone(message = "Gone") {
        return new ClientError(message, 410);
    }

    /**
     * **415** (Unsupported Media Type)
     * @param {string} message
     * @returns {ClientError}
     */
    static unsupportedMediaType(message = "Unsupported Media Type") {
        return new ClientError(message, 415);
    }

    /**
     * **422** (Unprocessable)
     * @param {string} message
     * @returns {ClientError}
     */
    static unprocessable(message = "Unprocessable") {
        return new ClientError(message, 422);
    }

    /**
     * **429** (Too Many Requests)
     * @param {string}
     * @returns {ClientError}
     */
    static tooManyRequests(message = "Too Many Requests") {
        return new ClientError(message, 429);
    }
}
