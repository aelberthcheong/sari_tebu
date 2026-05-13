import { prisma } from "../../shared/database/index.js";
import { nanoid } from "nanoid";

class ProductRepository {
    async getAll() {
        const { rows } = await pool.query({
            text: `SELECT * FROM products ORDER BY name ASC`,
            values: [],
        });
        return rows;
    }

    async getById(id) {
        const { rows } = await pool.query({
            text: `SELECT * FROM products WHERE id = $1`,
            values: [id],
        });
        return rows[0];
    }

    async createProduct({ name, price, stock }) {
        const id = `product-${nanoid()}`;
        const { rows } = await pool.query({
            text: `
                INSERT INTO products (id, name, price, stock)
                VALUES ($1, $2, $3, $4) RETURNING ID
            `,
            values: [id, name, price, stock],
        });
        return rows[0];
    }

    async updateProduct(id, { name, price, stock }) {
        const { rows } = await pool.query({
            text: `
                UPDATE products SET name=$1, price=$2, stock=$3
                WHERE id=$4 RETURNING id
            `,
            values: [name, price, stock, id],
        });
        return rows[0];
    }

    async deleteProduct(id) {
        const { rowCount } = await pool.query({
            text: `DELETE FROM products WHERE id=$1`,
            values: [id],
        });
        return rowCount > 0;
    }
}

export default new ProductRepository();
