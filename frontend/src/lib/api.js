/**
 * Lapisan komunikasi terpusat ke backend Sari Tebu.
 *
 * Semua endpoint backend memakai httpOnly cookie untuk sesi (auth_session_token,
 * signup_session_token, dst), jadi setiap request WAJIB menyertakan
 * `credentials: "include"`. Modul ini membungkus fetch supaya:
 *   - error response (`{status:"fail"|"error", message}`) dilempar sebagai ApiError
 *     yang konsisten dan mudah ditangani di komponen.
 *   - tidak perlu mengulang boilerplate headers/credentials di setiap halaman.
 */

export class ApiError extends Error {
    constructor(message, statusCode, payload) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.payload = payload;
    }
}

async function request(path, { method = "GET", body, headers, signal } = {}) {
    let res;
    try {
        res = await fetch(path, {
            method,
            credentials: "include",
            headers: {
                ...(body ? { "Content-Type": "application/json" } : {}),
                ...headers,
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal,
        });
    } catch {
        throw new ApiError(
            "Tidak dapat terhubung ke server. Periksa koneksi kamu.",
            0,
            null,
        );
    }

    // 204 No Content: tidak ada body untuk di-parse.
    if (res.status === 204) return null;

    let data = null;
    try {
        data = await res.json();
    } catch {
        // Body kosong / bukan JSON, biarkan `data` null.
    }

    if (!res.ok) {
        const message =
            data?.message ||
            `Terjadi kesalahan (${res.status}). Silakan coba lagi.`;
        throw new ApiError(message, res.status, data);
    }

    return data;
}

const get = (path, opts) => request(path, { ...opts, method: "GET" });
const post = (path, body, opts) => request(path, { ...opts, method: "POST", body });
const patch = (path, body, opts) => request(path, { ...opts, method: "PATCH", body });
const put = (path, body, opts) => request(path, { ...opts, method: "PUT", body });
const del = (path, body, opts) => request(path, { ...opts, method: "DELETE", body });

/* ------------------------------------------------------------------ */
/*  Auth & signup                                                      */
/* ------------------------------------------------------------------ */

export const authApi = {
    login: (emailAddress, password) =>
        post("/api/auth/login", { emailAddress, password }),
    register: (username, password) =>
        post("/api/auth/register", { username, password }),
    logout: () => del("/api/auth"),
    current: () => get("/api/auth"),
};

export const signupApi = {
    start: (emailAddress) => post("/api/sign-up", { emailAddress }),
    verify: (code) => post("/api/sign-up/verify-email-address", { code }),
    resend: () => post("/api/sign-up/resend-verification-code"),
    cancel: () => del("/api/sign-up"),
};

export const passwordResetApi = {
    start: (emailAddress) => post("/api/reset-password", { emailAddress }),
    verify: (code) => post("/api/reset-password/verify-email-address", { code }),
    resend: () => post("/api/reset-password/resend-verification-code"),
    reset: (password) => patch("/api/reset-password", { password }),
    cancel: () => del("/api/reset-password"),
};

/* ------------------------------------------------------------------ */
/*  Pengaturan akun: password, email, hapus akun                       */
/* ------------------------------------------------------------------ */

export const passwordUpdateApi = {
    start: () => post("/api/update-password"),
    verifyCurrent: (currentPassword) =>
        post("/api/update-password/verify-password", { currentPassword }),
    update: (newPassword) => patch("/api/update-password", { newPassword }),
    cancel: () => del("/api/update-password"),
};

export const emailUpdateApi = {
    start: (newEmailAddress) =>
        post("/api/update-email-address", { newEmailAddress }),
    verify: (code) =>
        post("/api/update-email-address/verify-email-address", { code }),
    resend: () => post("/api/update-email-address/resend-verification-code"),
    apply: () => patch("/api/update-email-address"),
    cancel: () => del("/api/update-email-address"),
};

export const accountDeletionApi = {
    start: () => post("/api/remove-account"),
    verifyPassword: (password) =>
        post("/api/remove-account/verify-password", { password }),
    confirmDelete: () => del("/api/remove-account"),
    cancel: () => del("/api/remove-account/cancel"),
};

/* ------------------------------------------------------------------ */
/*  Produk (katalog POS)                                               */
/* ------------------------------------------------------------------ */

export const productsApi = {
    list: (name) =>
        get(`/api/products${name ? `?name=${encodeURIComponent(name)}` : ""}`),
    get: (id) => get(`/api/products/${id}`),
    create: (payload) => post("/api/products", payload),
    replace: (id, payload) => put(`/api/products/${id}`, payload),
    update: (id, payload) => patch(`/api/products/${id}`, payload),
    remove: (id) => del(`/api/products/${id}`),
};

/* ------------------------------------------------------------------ */
/*  Keranjang (cart) POS                                               */
/* ------------------------------------------------------------------ */

export const cartsApi = {
    create: () => post("/api/carts"),
    list: () => get("/api/carts"),
    get: (cartId) => get(`/api/carts/${cartId}`),
    remove: (cartId) => del(`/api/carts/${cartId}`),
    // PENTING (bug backend): addItemSchema divalidasi dengan field
    // `product_id`, tapi carts/controller.js men-destructure `productId`
    // (camelCase) dari req.validatedBody — nilainya akan selalu undefined
    // apa pun yang dikirim frontend. Body di bawah ini SUDAH benar sesuai
    // kontrak validasi Joi; endpoint ini baru akan berfungsi setelah
    // baris `const { productId, quantity } = req.validatedBody;` di
    // backend/src/modules/carts/controller.js diperbaiki menjadi
    // `const { product_id: productId, quantity } = req.validatedBody;`.
    addItem: (cartId, product_id, quantity) =>
        post(`/api/carts/${cartId}/items`, { product_id, quantity }),
    // PENTING (bug backend): controller `updateItem` membaca
    // `req.parmas.productId` (typo, seharusnya `req.params.productId`),
    // sehingga endpoint ini akan selalu error 500. Frontend menghindari
    // pemanggilan ini secara langsung (lihat Pos.jsx) dan memakai
    // kombinasi removeItem + addItem sebagai workaround sementara.
    updateItem: (cartId, productId, quantity) =>
        patch(`/api/carts/${cartId}/items/${productId}`, { quantity }),
    removeItem: (cartId, productId) =>
        del(`/api/carts/${cartId}/items/${productId}`),
};

/* ------------------------------------------------------------------ */
/*  Transaksi (checkout & riwayat)                                     */
/* ------------------------------------------------------------------ */

export const transactionsApi = {
    // PENTING (bug backend, 2 masalah):
    //   1. checkoutSchema memvalidasi field `product_id` dengan pola regex
    //      `transaction-...`, padahal nilai yang dikirim seharusnya adalah
    //      cart id (`cart-...`). Validasi ini akan menolak cart id yang sah.
    //   2. Bahkan jika validasi diloloskan, transactions/service.js baris
    //      terakhir (`tx.cart.delete({ where: { id: cart_id } })`) memakai
    //      variabel `cart_id` yang tidak pernah didefinisikan (seharusnya
    //      `cart.id`), sehingga akan selalu melempar ReferenceError (500).
    // Checkout TIDAK akan bisa berhasil sampai kedua hal ini diperbaiki di
    // backend. Body di bawah dikirim dengan kedua kemungkinan nama field
    // supaya frontend siap begitu backend diperbaiki.
    checkout: (cartId) =>
        post("/api/transactions", { cartId, product_id: cartId }),
    list: () => get("/api/transactions"),
    get: (transactionId) => get(`/api/transactions/${transactionId}`),
};
