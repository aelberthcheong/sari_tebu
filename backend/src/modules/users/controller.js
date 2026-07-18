import * as UserService from "./service.js";

export async function addNewUser(req, res) {
    const user = await UserService.createUser(req.validatedBody);
    res.status(200).json({
        status: "success",
        message: "Berhasil menambah user baru",
        data: { user },
    });
}

export async function getUserById(req, res) {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({
        status: "success",
        data: { user },
    });
}

export async function getUserByUsername(req, res) {
    const user = await UserService.getUserByUsername(req.params.username);
    res.status(200).json({
        status: "success",
        data: { user },
    });
}

export async function getUserByEmailAddress(req, res) {
    const user = await UserService.getUserByEmailAddress(
        req.params.emailAddress,
    );
    res.status(200).json({
        status: "success",
        data: { user },
    });
}

export async function editUser(req, res) {
    const user = await UserService.editUser(req.validatedBody.id);
    res.status(200).json({
        status: "success",
        data: { user },
    });
}

export async function deleteUser(req, res) {
    await UserService.deleteUser(req.validatedBody.id);
    res.status(204);
}
