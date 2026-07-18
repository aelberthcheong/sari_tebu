import { nanoid } from "nanoid";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";

export async function createCart(userId) {
    return prisma.cart.create({
        data: { id: `cart-${nanoid()}`, user_id: userId },
    });
}

export async function listCarts(userId) {
    return prisma.cart.findMany({
        where: { user_id: userId },
        include: { items: { include: { product: true } } },
        orderBy: { created_at: "desc" },
    });
}

async function findOwnedCart(cartId, userId) {
    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart || cart.user_id !== userId) {
        throw ClientError.notFound("Cart not found");
    }
    return cart;
}

export async function getCart(cartId, userId) {
    await findOwnedCart(cartId, userId);
    return prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } },
    });
}

export async function deleteCart(cartId, userId) {
    await findOwnedCart(cartId, userId);
    return prisma.cart.delete({ where: { id: cartId } });
}

export async function addItemToCart(cartId, userId, productId, quantity) {
    const [cart, product] = await Promise.all([
        findOwnedCart(cartId, userId),
        prisma.product.findUnique({ where: { id: productId } }),
    ]);
    if (!product) throw ClientError.notFound();
    if (product.stock < quantity) throw ClientError.badRequest("Stok habis");
    return prisma.cartItem.upsert({
        where: {
            cart_id_product_id: { cart_id: cart.id, product_id: productId },
        },
        create: { cart_id: cart.id, product_id: productId, quantity },
        update: { quantity: { increment: quantity } },
    });
}

export async function updateItem(cartId, userId, productId, quantity) {
    await findOwnedCart(cartId, userId);
    const item = await prisma.cartItem.findUnique({
        where: {
            cart_id_product_id: { cart_id: cartId, product_id: productId },
        },
    });
    if (!item) throw ClientError.notFound("Item tidak ditmukan dalam cart");
    if (quantity <= 0) return removeItem(cartId, userId, productId);
    return prisma.cartItem.update({
        where: {
            cart_id_product_id: { cart_id: cartId, product_id: productId },
        },
        data: { quantity },
    });
}

export async function removeItem(cartId, userId, productId) {
    await findOwnedCart(cartId, userId);
    const item = await prisma.cartItem.findUnique({
        where: {
            cart_id_product_id: { cart_id: cartId, product_id: productId },
        },
    });
    if (!item) throw ClientError.notFound("Item tidak ditemukan dalam cart");
    return prisma.cartItem.delete({
        where: {
            cart_id_product_id: { cart_id: cartId, product_id: productId },
        },
    });
}
