// products/service.js
import { nanoid } from "nanoid";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";

/** @typedef {NonNullable<Awaited<ReturnType<typeof prisma.product.findUnique>>>} Product */

/**
 * Mengambil seluruh daftar produk
 * @param {string} name
 * @returns {Promise<Product[]>} Daftar produk
 */
export async function getProducts(name = "") {
    return prisma.product.findMany({
        where: { name: { contains: name } },
    });
}

/**
 * Mengambil detail produk berdasarkan ID
 * @param {string} productId - ID produk
 * @returns {Promise<Product>} Detail produk
 * @throws {ClientError} **404** (Not Found) - jika produk tidak ditemukan
 */
export async function getProduct(productId) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) throw ClientError.notFound("Produk tidak ditemukan");
    return product;
}

/**
 * Membuat produk baru
 * @param {{ name: string, price: number, stock: number }} payload - Data produk
 * @returns {Promise<Product>} Produk yang baru dibuat
 */
export async function createProduct(payload) {
    return prisma.product.create({
        data: {
            id: `product-${nanoid()}`,
            ...payload,
        },
    });
}

/**
 * Memperbarui data produk berdasarkan ID
 * @param {string} productId - ID produk
 * @param {{ name: string, price: number, stock: number }} payload - Data produk yang akan diperbarui
 * @returns {Promise<Product>} Produk yang telah diperbarui
 * @throws {ClientError} **404** (Not Found) - jika produk tidak ditemukan
 */
export async function updateProduct(productId, payload) {
    try {
        return await prisma.product.update({
            where: { id: productId },
            data: payload,
        });
    } catch (err) {
        if (err.code === "P2025")
            throw ClientError.notFound("Produk tidak ditemukan");
        throw err;
    }
}

/**
 * Menghapus produk berdasarkan ID
 * @param {string} productId - ID produk
 * @returns {Promise<void>}
 * @throws {ClientError} **404** (Not Found) - jika produk tidak ditemukan
 */
export async function deleteProduct(productId) {
    try {
        await prisma.product.delete({
            where: { id: productId },
        });
    } catch (err) {
        if (err.code === "P2025")
            throw ClientError.notFound("Produk tidak ditemukan");
        throw err;
    }
}
