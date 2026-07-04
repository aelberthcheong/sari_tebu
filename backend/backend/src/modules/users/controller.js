import * as UserService from "./service.js";

export async function createUser(req, res) {
    const user = await UserService.createUser(req.validatedBody);
    res.status(201).json({
        status: "success",
        data: { user },
    });
}

export async function getUsers(req, res) {
    const { email_address } = req.validatedQuery ?? {};
    const users = await UserService.getUsers(email_address);
    res.status(200).json({
        status: "success",
        data: { users },
    });
}

export async function getUserById(req, res) {
    const user = await UserService.getUserById(req.validatedParams.id);
    res.status(200).json({
        status: "success",
        data: { user },
    });
}

export async function updateUser(req, res) {
    const user = await UserService.updateUser(
        req.validatedParams.id,
        req.validatedBody,
    );
    res.status(200).json({
        status: "success",
        data: { user },
    });
}

export async function editUser(req, res) {
    const user = await UserService.updateUser(
        req.validatedParams.id,
        req.validatedBody,
    );
    res.status(200).json({
        status: "success",
        data: { user },
    });
}

export async function deleteUser(req, res) {
    await UserService.deleteUser(req.validatedParams.id);
    res.status(200).json({
        status: "success",
        message: "User berhasil dihapus",
    });
}
