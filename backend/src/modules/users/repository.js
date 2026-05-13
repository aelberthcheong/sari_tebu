import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { prisma } from "../../shared/database/index.js";

class UserRepository {
    async createUser({ username, password, fullname }) {
        const id = `user-${nanoid()}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const { id: user_id } = await prisma.user.create({
            data: {
                id,
                username,
                password: hashedPassword,
                fullname,
            },
        });
        return user_id;
    }

    async getByUsername(username) {
        return prisma.user.findUnique({
            where: { username: username },
        });
    }

    async getById(id) {
        return prisma.user.findUnique({
            where: { id: id },
        });
    }

    async getAll({ search = "" } = {}) {
        return prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: search } },
                    { fullname: { contains: search } },
                ],
            },
            select: {
                id: true,
                username: true,
                fullname: true,
                created_at: true,
            },
            orderBy: { created_at: "desc" },
        });
    }

    async deleteUser(id) {
        try {
            await prisma.user.delete({ where: { id } });
            return true;
        } catch {
            return false;
        }
    }
}

export default new UserRepository();
