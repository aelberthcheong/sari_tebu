import * as TransactionService from "./service.js";

export async function checkout(req, res) {
    const { cartId } = req.validatedBody;
    const transaction = await TransactionService.checkout(
        cartId,
        req.authSession.user_id,
    );
    res.status(201).json({
        status: "success",
        data: transaction,
    });
}

export async function listTransactions(req, res) {
    const transactions = await TransactionService.listTransactions(req.user);
    res.status(200).json({
        status: "success",
        data: transactions,
    });
}

export async function getTransaction(req, res) {
    const transaction = await TransactionService.getTransaction(
        req.params.transactionId,
        req.user,
    );
    res.status(200).json({
        status: "success",
        data: transaction,
    });
}