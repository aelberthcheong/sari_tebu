import { nanoid } from "nanoid";
import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";

export async function checkout(cartId, userId) {
    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } },
    });
    if (!cart || cart.user_id !== userId) {
        throw ClientError.notFound("Cart tidak ditemukan");
    }
    if (cart.items.length === 0) throw ClientError.badRequest("Cart is empty");

    for (const item of cart.items) {
        if (item.product.stock < item.quantity)
            throw ClientError.badRequest(
                `Stok untuk produk ${item.product.name} tidak mencukupi`,
            );
    }

    const total = cart.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
    }, 0);

    return prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
            data: {
                id: `transaction-${nanoid()}`,
                user_id: userId,
                total,
                items: {
                    create: cart.items.map((item) => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        price_at_time: item.product.price,
                    })),
                },
            },
            include: { items: true },
        });

        await Promise.all(
            cart.items.map((item) =>
                tx.product.update({
                    where: { id: item.product_id },
                    data: { stock: { decrement: item.quantity } },
                }),
            ),
        );

        await tx.cart.delete({ where: { id: cart.id } });

        return transaction;
    });
}

export async function listTransactions(userId) {
    return prisma.transaction.findMany({
        where: { user_id: userId },
        include: { items: { include: { product: true } } },
        orderBy: { created_at: "desc" },
    });
}

export async function getTransaction(transactionId, userId) {
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { items: { include: { product: true } } },
    });
    if (!transaction || transaction.user_id !== userId) {
        throw ClientError.notFound("Transaction tidak ditemukan");
    }
    return transaction;
}