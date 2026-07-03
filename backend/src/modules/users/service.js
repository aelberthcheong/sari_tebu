import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { prisma } from "#/shared/database/index.js";
import ClientError from "#/shared/exceptions/client_error.js";

const publicUserField = {
    id: true,
    email_address: true,
    username: true,
    created_at: true,
    updated_at: true,
};

export async function createUser({ emailAddress, username, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        return await prisma.user.create({
            data: {
                id: `user-${nanoid()}`,
                email_address: emailAddress,
                username,
                password_hash: hashedPassword,
            },
            select: publicUserField,
        });
    } catch (err) {
        if (err.code === "P2002") {
            throw ClientError.conflict("Email address sudah digunakan");
        }
        throw err;
    }
}

export async function getUserById(id) {
    const user = await prisma.user.findUnique({
        where: { id: id },
        select: publicUserField,
    });
    if (!user) {
        throw ClientError.notFound("User dengan id tersebut tidak ditemukan");
    }
    return user;
}

export async function getUsers(emailAddress = "") {
    return await prisma.user.findMany({
        where: {
            email_address: emailAddress ? emailAddress : undefined,
        },
        select: publicUserField,
    });
}

export async function updateUser(id, payload) {
    try {
        return await prisma.user.update({
            where: { id },
            data: payload,
            select: publicUserField,
        });
    } catch (err) {
        if (err.code === "P2002") {
            throw ClientError.conflict("Email address sudah digunakan");
        }
        if (err.code === "P2025") {
            throw ClientError.notFound("User tidak ditemukan");
        }
        throw err;
    }
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