import ClientError from "#/shared/exceptions/client_error.js";
import RateLimit from "#/shared/lib/rate_limit.js";

/**
 * Rate-limit request berdasarkan IP
 * @param {number} capacity - Maksimum jumlah IP yang ditrack (selebih ini dibuang)
 * @param {number} bucketCapacity - Maksimum token untuk tiap IP
 * @param {number} msPerToken - Berapa millisecond untuk replenish satu token
 */
export default function requireRateLimit(capacity, bucketCapacity, msPerToken) {
    const rateLimit = new RateLimit(capacity, bucketCapacity, msPerToken);
    return function (req, res, next) {
        if (!rateLimit.consume(req.ip)) throw ClientError.tooManyRequests();
        next();
    };
}
