import { nanoid } from "nanoid";

import { prisma } from "../../shared/database/index.js";

class CartRepository {
    async getItems() {
        const items = await prisma.cart.findMany({
            select: {
                id: true,
                quantity: true,
                added_at: true,
                product: {
                    select: { id: true, name: true, price: true, stock: true },
                },
            },
            orderBy: { added_at: "asc" },
        });

        return items.map(({ product, ...item }) => ({
            ...item,
            product_id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
        }));
    }

    async addItem(product_id, quantity = 1) {
        const existing = await pool.query({
            text: `SELECT * FROM carts WHERE product_id = $1`,
            values: [product_id],
        });

        if (existing.rows.length > 0) {
            const { rows } = await pool.query(
                `UPDATE carts SET quantity = quantity + $1
                 WHERE product_id = $2 RETURNING id`,
                [quantity, product_id],
            );
            return rows[0];
        }

        const id = `cart-${nanoid()}`;
        const { rows } = await pool.query({
            text: `INSERT INTO carts (id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id`,
            values: [id, product_id, quantity],
        });
        return rows[0];
    }

    async updateQuantity(id, quantity) {
        const { rows } = await pool.query({
            text: `UPDATE carts SET quantity=$1 WHERE id=$2 RETURNING *`,
            values: [quantity, id],
        });
        return rows[0];
    }

    async removeItem(id) {
        const { rowCount } = await pool.query({
            text: `DELETE FROM carts WHERE id=$1`,
            values: [id],
        });
        return rowCount > 0;
    }

    async clearCart() {
        await pool.query(`DELETE FROM carts`);
    }
}

export default new CartRepository();
