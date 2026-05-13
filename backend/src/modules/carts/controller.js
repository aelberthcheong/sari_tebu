import ClientError from "../../shared/exceptions/client_error.js";
import ProductRepository from "../products/repository.js";
import CartRepository from "./repository.js";

export async function getCart(req, res) {
    const items = await CartRepository.getItems();
    const total = items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);
    res.status(200).json({ status: "success", data: { items, total } });
}

export async function addToCart(req, res) {
    const { product_id, quantity = 1 } = req.body;
    const product = await ProductRepository.getById(product_id);
    if (!product) {
        throw ClientError.notFound("Product not found");
    }
    if (product.stock < quantity) {
        throw ClientError.badRequest("Insufficient stock");
    }

    const item = await CartRepository.addItem(product_id, quantity);
    res.status(201).json({ status: "success", data: { item } });
}

export async function updateCartItem(req, res) {
    const { quantity } = req.body;
    if (quantity < 1) {
        throw ClientError.badRequest("Quantity must be at least 1");
    }

    const item = await CartRepository.updateQuantity(req.params.id, quantity);
    if (!item) {
        throw ClientError.notFound("Cart item not found");
    }
    res.status(200).json({ status: "success", data: { item } });
}

export async function removeFromCart(req, res) {
    const ok = await CartRepository.removeItem(req.params.id);
    if (!ok) {
        throw ClientError.notFound("Cart item not found");
    }
    res.status(200).json({ status: "success", message: "Item removed" });
}

export async function clearCart(req, res) {
    await CartRepository.clearCart();
    res.status(200).json({ status: "success", message: "Cart cleared" });
}
