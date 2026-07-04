// oxfmt-ignore

export default class RateLimit {
    /**
     * @param {number} capacity Jumlah maksimum IP unik yang dapat di track
     * @param {number} bucketCapacity Jumlah maksimum token tiap bucket
     * @param {number} msPerToken Berapa millisecond untuk replenish satu token
     */
    constructor(capacity, bucketCapacity, msPerToken) {
        this.capacity = capacity;
        this.buckets = new Map();
        this.bucketCapacity = bucketCapacity;
        this.msPerToken = msPerToken;

        this.newestBucket = null; // MRU
        this.oldestBucket = null; // LRU
    }
    
    /**
     * @param {string} ip 
     * @returns {boolean}
     */
    consume(ip) {
        const now = Date.now();
        const bucket = this.buckets.get(ip);

        // Kalau bucket (IP) tidak ditemukan pada `this.buckets`, maka
        // ciptakan bucket dan register pada `this.buckets`.
        if (!bucket) {
            const newBucket = new BucketOfTokens(
                ip,
                this.bucketCapacity,
                now,
            );

            // Kalau jumlah bucket (IP) sudah melebih kapasitas, maka
            // buang node tertua (LRU).
            if (this.buckets.size === this.capacity) {
                this.buckets.delete(this.oldestBucket.token);

                if (this.newestBucket === this.oldestBucket) {
                    this.newestBucket = null;
                    this.oldestBucket = null;
                } else {
                    this.oldestBucket.tail.head = null;
                    this.oldestBucket = this.oldestBucket.tail;
                }
            }

            if (this.newestBucket !== null) {
                this.newestBucket.tail = newBucket;
                newBucket.head = this.newestBucket;
            }

            this.buckets.set(ip, newBucket);
            this.newestBucket = newBucket;
            this.oldestBucket = this.oldestBucket ?? newBucket;

            return {
                allowed: true,
                remaining: this.bucketCapacity--,
                resetAt: this.msPerToken
            }
        }

        const credit = (now - bucket.lastTime) / this.msPerToken;
        bucket.count += credit;

        // Kalau bucket overflow kita clamp aja dengan kapasitas bucket
        if (bucket.count > this.bucketCapacity)
            bucket.count = this.bucketCapacity

        bucket.lastTime = now;

        // 
        if (bucket !== this.newestBucket) {
            if (bucket === this.oldestBucket) {
                bucket.tail.head = null;
                this.oldestBucket = bucket.tail;
            } else {
                bucket.tail.head = bucket.head;
                bucket.head.tail = bucket.tail;
            }

            bucket.tail = null;
            this.newestBucket.tail = bucket;
            bucket.head = this.newestBucket;
            this.newestBucket = bucket;
            this.oldestBucket = this.oldestBucket ?? bucket;
        }

        const resetAt = Math.floor(bucket.lastTime + this.msPerToken);

        // Kalau bucket kosong, berarti gagal i.e. block IP ini
        if (bucket.count < 1)  {
            return {
                allowed: false,
                remaining: 0,
                resetAt: resetAt
            }
        }

        bucket.count--;
    	return {
            allowed: true,
            remaining: Math.floor(bucket.count),
            resetAt: resetAt
        }
    }

    /**
     * Hapus bucket untuk IP tertentu dari tracker dan lepaskan tautannya dari bucket,
     * untuk memblokir atau reset ulang secara paksa client tertentu.
     * @param {string} ip
     * @returns {boolean}
     */
    remove(ip) {
        const bucket = this.buckets.get(ip);
        if (!bucket) return false;

        if (bucket.tail !== null) bucket.tail.head = bucket.head;
        if (bucket.head !== null) bucket.head.tail = bucket.tail;

        this.buckets.delete(bucket.token);

        if (bucket === this.newestBucket) this.newestBucket = bucket.head;
        if (bucket === this.oldestBucket) this.oldestBucket = bucket.tail;

        return true;
    }

    /**
     * @returns {void}
     */
    clear() {
        this.buckets = new Map();
        this.newestBucket = null;
        this.oldestBucket = null;
    }
}

class BucketOfTokens {
    constructor(token, count, lastTime) {
        this.token = token; // Token yang correspond dengan bucket
        this.count = count; // Berapa banyak token pada bucket
        this.lastTime = lastTime; // Kapan terakhir kali kredit token pada bucket di replenish (epoch)

        this.head = null;
        this.tail = null;
    }
}
