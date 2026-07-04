/**
 * Data dummy untuk Guest Mode.
 *
 * Guest Mode dipakai supaya calon pengguna bisa melihat-lihat tampilan
 * aplikasi (khususnya halaman POS) TANPA membuat akun dan TANPA memanggil
 * backend sama sekali. Semua data di sini murni statis/lokal.
 */

export const GUEST_PRODUCTS = [
    {
        id: "guest-1",
        name: "Es Tebu Original",
        price: 8000,
        stock: 24,
    },
    {
        id: "guest-2",
        name: "Es Tebu Jeruk Nipis",
        price: 10000,
        stock: 18,
    },
    {
        id: "guest-3",
        name: "Es Tebu Leci",
        price: 12000,
        stock: 12,
    },
    {
        id: "guest-4",
        name: "Es Tebu Susu",
        price: 13000,
        stock: 9,
    },
    {
        id: "guest-5",
        name: "Tebu Segar Botol 500ml",
        price: 15000,
        stock: 0,
    },
    {
        id: "guest-6",
        name: "Tebu Segar Botol 1L",
        price: 25000,
        stock: 6,
    },
];

export const GUEST_TRANSACTIONS = [
    {
        id: "guest-trx-1",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        total: 30000,
        items: [
            { name: "Es Tebu Original", quantity: 2, price: 8000 },
            { name: "Es Tebu Jeruk Nipis", quantity: 1, price: 10000 },
        ],
    },
    {
        id: "guest-trx-2",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        total: 25000,
        items: [{ name: "Tebu Segar Botol 1L", quantity: 1, price: 25000 }],
    },
];
