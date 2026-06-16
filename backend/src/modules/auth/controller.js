import * as AuthService from "./service.js";

export async function login(req, res) {
    const { emailAddress, password } = req.validatedBody;
    const token = await AuthService.login(emailAddress, password);
    res.status(200).json({
        status: "success",
        data: token,
    });
}

export async function refreshAccessToken(req, res) {
    const { refreshToken } = req.validatedBody;
    const accessToken = await AuthService.refreshAccessToken(refreshToken);

    res.status(200).json({
        status: "success",
        data: {
            accessToken,
        },
    });
}

export async function logout(req, res) {
    const { refreshToken } = req.validatedBody;
    await AuthService.logout(refreshToken);
    res.status(200).json({
        status: "success",
        message: "Berhasil menghapus sesi login",
    });
}
