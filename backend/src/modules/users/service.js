import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";

export async function createUser({ emailAddress, username, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
        return await tx.user.create({
            data: {
                email_address: emailAddress,
                username: username,
                password: hashedPassword,
            },
        });
    });
    return user;
}

export async function getUserById(id) {
    // ...
}

export async function getUserByUsername(username) {
    // ...
}

export async function getUserByEmailAddress(emailAddress) {
    // ...
}

export async function editUser() {
    // ...
}

export async function deleteUser(id) {
    try {
        await prisma.user.delete({
            where: { id: id },
        });
    } catch (err) {
        if (err.code === "P2025")
            throw ClientError.notFound("User tidak ditemukan");
        throw err;
    }
}
