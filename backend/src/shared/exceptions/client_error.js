/**
 * ClientError disini bertindak sbgai namespace, kita nanti bisa tambah ranges yang lainnya (i.e. 1xx, 2xx, 3xx, 5xx)
 */
export default class ClientError extends Error {
    // optimal-nya constructor ini private access
    // private:
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    static badRequest(message = "Bad Request") {
        return new ClientError(message, 400);
    }

    static unauthorized(message = "Unauthorized") {
        return new ClientError(message, 401);
    }

    static forbidden(message = "Forbidden") {
        return new ClientError(message, 403);
    }

    static notFound(message = "Not Found") {
        return new ClientError(message, 404);
    }

    static conflict(message = "Conflict") {
        return new ClientError(message, 409);
    }
}
