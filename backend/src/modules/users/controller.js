import ClientError from "../../shared/exceptions/client_error.js";
import UserRepository from "./repository.js";

export async function createUser(req, res) {
    const { username, password, fullname } = req.body;

    const exists = await UserRepository.getByUsername(username);
    if (exists) {
        throw ClientError.conflict("Username unavailable");
    }

    const id = await UserRepository.createUser({
        username,
        password,
        fullname,
    });

    res.status(201).json({
        status: "success",
        data: { id },
    });
}

export async function getUsers(req, res) {
    const { search = "" } = req.query;
    const users = await UserRepository.getAll({ search });
    res.status(200).json({
        status: "success",
        data: { users },
    });
}

export async function getUserById(req, res) {
    const user = await UserRepository.getById(req.body.id);
    if (!user) {
        throw ClientError.notFound();
    }

    res.status(200).json({
        status: "success",
        data: { user },
    });
}

export async function deleteUser(req, res) {
    const deleted = await UserRepository.deleteUser(req.params.id);
    if (!deleted) {
        throw ClientError.notFound();
    }

    res.status(200).json({
        status: "success",
        message: "User telah dihapus",
    });
}
