// TODO(AELBERTH): TOLONG KERJAI PLEASE.

import { nanoid } from "nanoid";

import { prisma } from "../../shared/database/index.js";

class TransactionRepository {
    async checkout({ items, total, cash }) {
        const change = cash - total;
        if (change < 0) throw new Error("Cash kurang dari total");

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const transactionId = `trx-${nanoid()}`;
            const {
                rows: [transaction],
            } = await client.query(
                `INSERT INTO transactions (id, total, cash, change, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
                [transactionId, total, cash, change],
            );

            for (const item of items) {
                const itemId = `trx-item-${nanoid()}`;
                await client.query(
                    `INSERT INTO transactions_items 
           (id, transaction_id, product_id, product_name, product_price, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        itemId,
                        transactionId,
                        item.product_id,
                        item.name,
                        item.price,
                        item.quantity,
                        item.price * item.quantity,
                    ],
                );
                await client.query(
                    `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                    [item.quantity, item.product_id],
                );
            }

            await client.query(`DELETE FROM carts`);
            await client.query("COMMIT");
            return transaction;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    async getAll() {
        const { rows } = await pool.query({
            text: `SELECT * FROM transactions ORDER BY created_at DESC`,
            values: [],
        });
        return rows;
    }

    async getById(id) {
        const {
            rows: [transaction],
        } = await pool.query({
            text: `SELECT * FROM transactions WHERE id = $1`,
            values: [id],
        });
        if (!transaction) return null;

        const { rows: items } = await pool.query({
            text: `SELECT * FROM transactions_items WHERE transaction_id = $1`,
            values: [id],
        });
        return { ...transaction, items };
    }
}

export default new TransactionRepository();
