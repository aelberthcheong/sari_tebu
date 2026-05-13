import TransactionRepository from "./repository.js";
import CartRepository from "../carts/repository.js";
import ClientError from "../../shared/exceptions/client_error.js";

export async function checkout(req, res) {
    const { cash } = req.body;
    const cashNumber = Number(cash);

    const items = await CartRepository.getItems();
    if (items.length === 0) throw ClientError.badRequest("Cart is empty");

    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    if (cashNumber < total)
        throw ClientError.badRequest(`Cash kurang dari total`);

    const transaction = await TransactionRepository.checkout({
        items,
        total,
        cash: cashNumber,
    });

    res.status(201).json({
        status: "success",
        data: {
            transaction_id: transaction.id,
            total,
            cash: cashNumber,
            change: transaction.change,
            created_at: transaction.created_at,
        },
    });
}

export async function getTransactions(req, res) {
    const transactions = await TransactionRepository.getAll();
    res.status(200).json({
        status: "success",
        data: { transactions },
    });
}

export async function getTransaction(req, res) {
    const transaction = await TransactionRepository.getById(req.params.id);
    if (!transaction) throw ClientError.notFound("Transaction not found");
    res.status(200).json({
        status: "success",
        data: { transaction },
    });
}
