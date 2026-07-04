import * as CartService from "./service.js";

export async function createCart(req, res) {
    const cart = await CartService.createCart(req.authSession.user_id);
    res.status(201).json({
        status: "success",
        data: cart,
    });
}

export async function listCarts(req, res) {
    const carts = await CartService.listCarts(req.authSession.user_id);
    res.status(200).json({
        status: "success",
        data: carts,
    });
}

export async function getCart(req, res) {
    const cart = await CartService.getCart(
        req.params.cartId,
        req.authSession.user_id,
    );
    res.status(200).json({
        status: "success",
        data: cart,
    });
}

export async function deleteCart(req, res) {
    await CartService.deleteCart(req.params.cartId, req.authSession.user_id);
    res.status(200).json({
        status: "success",
        message: "berhasil dihapus cart nya",
    });
}

export async function addItemToCart(req, res) {
    const { product_id, quantity } = req.validatedBody;
    const item = await CartService.addItemToCart(
        req.params.cartId,
        req.authSession.user_id,
        product_id,
        quantity,
    );
    res.status(200).json({
        status: "success",
        data: item,
    });
}

export async function updateItem(req, res) {
    const { quantity } = req.validatedBody;
    const item = await CartService.updateItem(
        req.params.cartId,
        req.authSession.user_id,
        req.params.productId,
        quantity,
    );
    res.status(200).json({
        status: "success",
        data: item,
    });
}

export async function removeItem(req, res) {
    await CartService.removeItem(
        req.params.cartId,
        req.authSession.user_id,
        req.params.productId,
    );
    res.status(200).json({
        status: "success",
        message: "berhasil hapus item dari cart ini",
    });
}